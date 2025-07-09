import { useTimerStore } from "@/stores/timerStore";
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
import { useImageGeneration, useActivityExtraction } from "@/hooks/useApi";
import { useToast } from "@/components/ToastContext";
import ImageGenerateConfirmationModal from "@/components/image-generate-confirmation-modal";
import PressableButton from "@/components/PressableButton";
import * as FileSystem from "expo-file-system";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

export enum LocalActivityEnum {
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
  [LocalActivityEnum.readingBooks]: require("@/assets/images/reading-books.png"),
  [LocalActivityEnum.watchingTV]: require("@/assets/images/watching-tv.png"),
  [LocalActivityEnum.playingVideoGames]: require("@/assets/images/playing-video-games.png"),
  [LocalActivityEnum.listeningToMusic]: require("@/assets/images/listening-to-music.png"),
  [LocalActivityEnum.studying]: require("@/assets/images/studying.png"),
  [LocalActivityEnum.workingOut]: require("@/assets/images/working-out.png"),
  [LocalActivityEnum.eating]: require("@/assets/images/eating.png"),
  [LocalActivityEnum.sleeping]: require("@/assets/images/sleeping.png"),
  [LocalActivityEnum.doingHousework]: require("@/assets/images/doing-housework.png"),
  [LocalActivityEnum.cooking]: require("@/assets/images/cooking.png"),
  [LocalActivityEnum.meditating]: require("@/assets/images/meditating.png"),
  [LocalActivityEnum.takingShower]: require("@/assets/images/taking-shower.png"),
  [LocalActivityEnum.yawning]: require("@/assets/images/yawning.png"), // default value, will not be returned by the API
};

interface ImageSource {
  uri: string;
}

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

export default function Index() {
  const { showToast } = useToast();

  const { selectedValue, isTimerRunning, setIsTimerRunning } = useTimerStore();
  const [countDown, setCountDown] = useState<number>(selectedValue * 60); // in seconds
  const timerRef = useRef<number | null>(null);
  const [activityInput, setActivityInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [isActivityInputValid, setIsActivityInputValid] = useState(false);
  const [image, setImage] = useState<LocalActivityEnum | ImageSource>(LocalActivityEnum.yawning);
  const [isImageGenerateConfirmationModalVisible, setIsImageGenerateConfirmationModalVisible] = useState(false);

  const ellipsis = useRef<string>("");
  const originalActivityInput = useRef<string>("");
  const ellipsisTimerRef = useRef<number | null>(null);

  const { mutateAsync: extractActivity, isPending: isExtractingActivity } = useActivityExtraction();
  const { mutateAsync: generateImage, isPending: isGeneratingImage } = useImageGeneration();

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isGeneratingImage ? 0.5 : 1, { duration: 1000 }),
  }));
  const rotate = useSharedValue(0);
  const settingsIconTranslateX = useSharedValue(0);
  const galleryIconTranslateX = useDerivedValue(() => {
    return -settingsIconTranslateX.value;
  });
  const playButtonTranslateY = useDerivedValue(() => {
    // Play button moves downward with more translation (negative value = downward)
    return -settingsIconTranslateX.value * 4; // 2x more movement than icons
  });

  const animatedLoadingIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const animatedSettingsIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: settingsIconTranslateX.value }],
  }));

  const animatedGalleryIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: galleryIconTranslateX.value }],
  }));

  const animatedPlayButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: playButtonTranslateY.value }]
  }));

  const shouldLockScreen = isTimerRunning || isExtractingActivity || isGeneratingImage;

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
    if (shouldLockScreen) {
      return;
    }
    router.push("/number-picker");
  };

  const pauseTimer = useCallback(() => {
    clearInterval(timerRef.current!);
    setIsTimerRunning(false);
  }, [setIsTimerRunning]);

  const handlePlayPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!activityInput) {
      showToast("Please enter an activity first!");
      return;
    }

    timerRef.current = setInterval(() => {
      if (countDown > 0) {
        setCountDown(prev => prev - 1);
      } else if (countDown === 0) {
        setCountDown(0);
      }
    }, 1000);
    setIsTimerRunning(true);
    settingsIconTranslateX.value = withTiming(-100, { duration: 300 });
  }, [activityInput, showToast, countDown, setIsTimerRunning, settingsIconTranslateX]);

  const handleActivityExtraction = useCallback(async () => {
    try {
      // start ellipsis animation
      originalActivityInput.current = activityInput;
      ellipsisTimerRef.current = setInterval(() => {
        ellipsis.current = ellipsis.current + ".";
        if (ellipsis.current.length > 3) {
          ellipsis.current = "";
        }
        setActivityInput(originalActivityInput.current + ellipsis.current);
      }, 1000);

      const data = await extractActivity({ prompt: activityInput });
      setActivityInput(data.activity);
      setCountDown(data.time * 60);
      setImage(data.image as LocalActivityEnum);
      setIsActivityInputValid(true);
    } catch {
      setActivityInput(originalActivityInput.current);
      setIsActivityInputValid(false);
    } finally {
      clearInterval(ellipsisTimerRef.current!);
      ellipsis.current = "";
      originalActivityInput.current = "";
      ellipsisTimerRef.current = null;
    }
  }, [extractActivity, activityInput]);

  const handleImageGenerationOpen = useCallback(async () => {
    if (shouldLockScreen) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isExtractingActivity) {
      return;
    }
    if (!activityInput) {
      showToast("Please enter an activity first!");
      return;
    }
    if (!isActivityInputValid) {
      showToast("Please enter a valid activity first!");
      return;
    }
    setIsImageGenerateConfirmationModalVisible(true);
  }, [
    activityInput,
    showToast,
    isExtractingActivity,
    isActivityInputValid,
    shouldLockScreen,
  ]);

  const handleImageGenerationClose = useCallback(() => {
    setIsImageGenerateConfirmationModalVisible(false);
  }, []);

  const handleImageGenerationConfirm = useCallback(async () => {
    setIsImageGenerateConfirmationModalVisible(false);
    rotate.value = withRepeat(withTiming(rotate.value + 360, { duration: 1000 }), -1, false);
    const imageBase64 = await generateImage({ prompt: activityInput });
    const uri = FileSystem.documentDirectory + `images/${activityInput}-${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(uri, imageBase64, { encoding: FileSystem.EncodingType.Base64 });
    setImage({ uri });
    rotate.value = 0;
  }, [generateImage, activityInput, rotate]);

  const handleScreenLongPress = useCallback(() => {
    if (isTimerRunning) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      settingsIconTranslateX.value = withTiming(0, { duration: 300 });
      pauseTimer();
    }
  }, [isTimerRunning, settingsIconTranslateX, pauseTimer]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} onLongPress={handleScreenLongPress}>
      <View
        style={styles.background}
      >
        <View style={styles.headerContainer}>
          <Animated.View style={animatedSettingsIconStyle}>
            <Pressable onPress={() => router.push("/settings")}>
              <Feather name="settings" size={24} color="black" />
            </Pressable>
          </Animated.View>
          <Animated.View style={animatedGalleryIconStyle}>
            <Pressable onPress={() => router.push("/gallery")}>
              <Feather name="image" size={24} color="black" />
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.timerContainer}>
          <Pressable onPress={handleOpenNumberPicker}>
            <Text style={styles.timerText}>
              {formatTime(countDown)}
            </Text>
          </Pressable>
        </View>

        <View style={styles.activityInputContainer}>
          <TextInput
            placeholder={isFocused ? "" : "e.g. read a book for an hour"}
            value={activityInput}
            onChangeText={(text) => setActivityInput(text)}
            style={styles.activityInput}
            placeholderTextColor="gray"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleActivityExtraction}
            editable={!shouldLockScreen}
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
                source={Object.values(LocalActivityEnum).includes(image as LocalActivityEnum) ? backgroundImageNameMap[image as LocalActivityEnum] : image}
                style={[
                  styles.backgroundImage,
                ]}
                contentFit="contain"
                placeholder={"loading..."}
              />
            </Pressable>
          </Animated.View>
        </View>

        <PressableButton onPress={handlePlayPress} disabled={isTimerRunning}>
          <Animated.View style={animatedPlayButtonStyle}>
            <Feather name={"play-circle"} size={60} color="black" />
          </Animated.View>
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
  headerContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
  },
  backgroundImage: {
    width: 300,
    height: 450,
  },
  activityInputContainer: {
    marginTop: "8%",
    marginBottom: "3%",
  },
  activityInput: {
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
