import { useNumberPickerStore } from "@/stores/numberPickerStore";
import { Feather } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { useImageGeneration, useTaskExtraction } from "@/hooks/useApi";
import { useToast } from "@/components/ToastContext";
import ImageGenerateConfirmationModal from "./image-generate-confirmation-modal";
import PressableButton from "@/components/PressableButton";
import * as FileSystem from "expo-file-system";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat } from "react-native-reanimated";

export enum LocalTaskEnum {
  readingBooks = "reading-books",
  watchingTV = "watching-tv",
  playingVideoGames = "playing-video-games",
  listeningToMusic = "listening-to-music",
  studying = "studying",
  workingOut = "working-out",
  eating = "eating",
  sleeping = "sleeping",
  doingHousework = "doing-housework",
  cooking = "cooking",
  meditating = "meditating",
  takingShower = "taking-shower",
  yawning = "yawning",
};

const backgroundImageNameMap = {
  [LocalTaskEnum.readingBooks]: require("@/assets/images/reading-books.png"),
  [LocalTaskEnum.watchingTV]: require("@/assets/images/watching-tv.png"),
  [LocalTaskEnum.playingVideoGames]: require("@/assets/images/playing-video-games.png"),
  [LocalTaskEnum.listeningToMusic]: require("@/assets/images/listening-to-music.png"),
  [LocalTaskEnum.studying]: require("@/assets/images/studying.png"),
  [LocalTaskEnum.workingOut]: require("@/assets/images/working-out.png"),
  [LocalTaskEnum.eating]: require("@/assets/images/eating.png"),
  [LocalTaskEnum.sleeping]: require("@/assets/images/sleeping.png"),
  [LocalTaskEnum.doingHousework]: require("@/assets/images/doing-housework.png"),
  [LocalTaskEnum.cooking]: require("@/assets/images/cooking.png"),
  [LocalTaskEnum.meditating]: require("@/assets/images/meditating.png"),
  [LocalTaskEnum.takingShower]: require("@/assets/images/taking-shower.png"),
  [LocalTaskEnum.yawning]: require("@/assets/images/yawning.png"), // default value, will not be returned by the API
};

interface ImageSource {
  uri: string;
}

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

export default function Index() {
  const { selectedValue } = useNumberPickerStore();
  const [countDown, setCountDown] = useState<number>(selectedValue * 60); // in seconds
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [taskInput, setTaskInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const { mutateAsync: extractTask, isPending: isExtractingTask } = useTaskExtraction();
  const { mutateAsync: generateImage, isPending: isGeneratingImage } = useImageGeneration();
  const [image, setImage] = useState<LocalTaskEnum | ImageSource>(LocalTaskEnum.yawning);
  const ellipsis = useRef<string>("");
  const originalTaskInput = useRef<string>("");
  const ellipsisTimerRef = useRef<number | null>(null);
  const { showToast } = useToast();
  const [isImageGenerateConfirmationModalVisible, setIsImageGenerateConfirmationModalVisible] = useState(false);
  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isGeneratingImage ? 0.5 : 1, { duration: 1000 }),
  }));
  const rotate = useSharedValue(0);
  const animatedLoadingIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  useEffect(() => {
    if (selectedValue > 0) {
      setCountDown(selectedValue * 60);
    }
  }, [selectedValue]);

  const formatTime = useCallback((time: number | null) => {
    if (time === null) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const handleOpenNumberPicker = () => {
    router.push("/number-picker");
  };

  const pauseTimer = useCallback(() => {
    clearInterval(timerRef.current!);
    setIsPlaying(false);
  }, []);

  const handlePlayPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isPlaying) {
      pauseTimer();
      return;
    }
    if (!taskInput) {
      showToast("Please enter a task first!");
      return;
    }

    timerRef.current = setInterval(() => {
      if (countDown > 0) {
        setCountDown(prev => prev - 1);
      } else if (countDown === 0) {
        setCountDown(0);
      }
    }, 1000);
    setIsPlaying(true);
  }, [pauseTimer, taskInput, showToast, isPlaying, countDown]);

  const handleTaskExtraction = useCallback(async () => {
    try {
      // start ellipsis animation
      originalTaskInput.current = taskInput;
      ellipsisTimerRef.current = setInterval(() => {
        ellipsis.current = ellipsis.current + ".";
        if (ellipsis.current.length > 3) {
          ellipsis.current = "";
        }
        setTaskInput(originalTaskInput.current + ellipsis.current);
      }, 1000);

      const data = await extractTask({ prompt: taskInput });
      setTaskInput(data.task);
      setCountDown(data.time * 60);
      setImage(data.image as LocalTaskEnum);
    } catch {
      setTaskInput(originalTaskInput.current);
    } finally {
      clearInterval(ellipsisTimerRef.current!);
      ellipsis.current = "";
      originalTaskInput.current = "";
      ellipsisTimerRef.current = null;
    }
  }, [extractTask, taskInput]);

  const handleImageGenerationOpen = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isExtractingTask) {
      return;
    }
    if (!taskInput) {
      showToast("Please enter a task first!");
      return;
    }
    pauseTimer();
    setIsImageGenerateConfirmationModalVisible(true);
  }, [pauseTimer, taskInput, showToast, isExtractingTask]);

  const handleImageGenerationClose = useCallback(() => {
    setIsImageGenerateConfirmationModalVisible(false);
  }, []);

  const handleImageGenerationConfirm = useCallback(async () => {
    setIsImageGenerateConfirmationModalVisible(false);
    rotate.value = withRepeat(withTiming(rotate.value + 360, { duration: 1000 }), -1, false); 
    const imageBase64 = await generateImage({ prompt: taskInput });
    const uri = FileSystem.documentDirectory + `images/${taskInput}-${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(uri, imageBase64, { encoding: FileSystem.EncodingType.Base64 });
    setImage({ uri });
    rotate.value = 0;
  }, [generateImage, taskInput, rotate]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={styles.background}
      >
        <View style={styles.timerContainer}>
          <Pressable onPress={handleOpenNumberPicker}>
            <Text style={styles.timerText}>
              {formatTime(countDown)}
            </Text>
          </Pressable>
        </View>

        <View style={styles.taskInputContainer}>
          <TextInput
            placeholder={isFocused ? "" : "reading books for an hour..."}
            value={taskInput}
            onChangeText={(text) => setTaskInput(text)}
            style={styles.taskInput}
            placeholderTextColor="gray"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleTaskExtraction}
            editable={!isExtractingTask && !isGeneratingImage}
          />
        </View>

        <View style={styles.imageContainer}>
          {isGeneratingImage && (
            <View style={styles.loadingContainer}>
              <AnimatedFeather name="loader" size={40} color="black" style={animatedLoadingIconStyle} />
              <Text style={styles.loadingText}>This may take a while...</Text>
            </View>
          )}
          <Animated.View style={[animatedImageStyle]}>
            <Pressable onLongPress={handleImageGenerationOpen}>
              <Image
                source={Object.values(LocalTaskEnum).includes(image as LocalTaskEnum) ? backgroundImageNameMap[image as LocalTaskEnum] : image}
                style={[
                  styles.backgroundImage,
                ]}
                contentFit="contain"
                placeholder={"loading..."}
              />
            </Pressable>
          </Animated.View>
        </View>

        <PressableButton onPress={handlePlayPress} onLongPress={handlePlayPress}>
          {isPlaying ?
            <Feather name="pause-circle" size={60} color="black" /> :
            <Feather name="play-circle" size={60} color="black" />
          }
        </PressableButton>

        <ImageGenerateConfirmationModal
          visible={isImageGenerateConfirmationModalVisible}
          onClose={handleImageGenerationClose}
          onConfirm={handleImageGenerationConfirm}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(221, 183, 116)",
    paddingTop: "30%",
    paddingBottom: "20%",
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
  },
  timerText: {
    fontSize: 64,
    fontFamily: "LXGWWenKaiMonoTC-Regular",
    letterSpacing: 15,
    minWidth: 200,
    textShadowColor: "black",
    textShadowOffset: { width: 0.9, height: 0.9 },
    textShadowRadius: 0.7,
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "3%",
  },
  backgroundImage: {
    width: 300,
    height: 450,
  },
  taskInputContainer: {
    marginTop: "8%",
  },
  taskInput: {
    width: "100%",
    height: 20,
    fontSize: 20,
    fontFamily: "LXGWWenKaiMonoTC-Regular",
  },
  loadingContainer: {
    position: "absolute",
    top: "30%",
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "LXGWWenKaiMonoTC-Regular",
    marginTop: 10,
    textAlign: "center",
  },
});
