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
  ActivityIndicator
} from "react-native";
import { Pressable, TextInput } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useTaskExtraction } from "@/hooks/useApi";

export enum LocalTaskEnum {
  readingBooks = "reading-books",
  watchingTV = "watching-tv",
  playingVideoGames = "playing-video-games",
  listeningToMusic = "listening-to-music",
  studying = "studying",
  workingOut = "working-out",
  eating = "eating",
  sleeping="sleeping",
  doingHousework="doing-housework"
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
};

export default function Index() {
  const { selectedValue } = useNumberPickerStore();
  const [countDown, setCountDown] = useState<number>(selectedValue * 60); // in seconds
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useDerivedValue(() => {
    return 1.0 - ((buttonScale.value - 1) / (1.2 - 1)) * 0.4;
  });
  const [taskInput, setTaskInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const { mutateAsync: extractTask, isPending } = useTaskExtraction();
  const [image, setImage] = useState<LocalTaskEnum>(LocalTaskEnum.sleeping);
  const ellipsis = useRef<string>("");
  const originalTaskInput = useRef<string>("");

  useEffect(() => {
    if (selectedValue > 0) {
      setCountDown(selectedValue * 60);
    }
  }, [selectedValue]);
  
  // TODO: fix this
  // useEffect(() => {
  //   if (isPending) {
  //     if (originalTaskInput.current === "") {
  //       originalTaskInput.current = taskInput;
  //     }
  //     ellipsis.current = ellipsis.current + ".";
  //     if (ellipsis.current.length > 3) {
  //       ellipsis.current = "";
  //     }
  //     setTaskInput(originalTaskInput.current + ellipsis.current);
  //   }
  // }, [isPending, taskInput]);

  const formatTime = useCallback((time: number | null) => {
    if (time === null) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const handleOpenNumberPicker = () => {
    router.push("/number-picker");
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isPlaying) {
      clearInterval(timerRef.current!);
      setIsPlaying(false);
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
  };

  const handlePressIn = () => {
    buttonScale.value = withTiming(1.2, { duration: 100 });
  };
  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  });

  const handleSubmit = async () => {
    const data = await extractTask({ prompt: taskInput });
    setTaskInput(data.task);
    setCountDown(data.time * 60);
    setImage(data.image as LocalTaskEnum);
  };

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
          onSubmitEditing={handleSubmit} 
          editable={!isPending}
        />
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={backgroundImageNameMap[image]}
          style={[
            styles.backgroundImage,
          ]}
          contentFit="contain"
          placeholder={"loading..."}
        />
      </View>


      <Animated.View style={animatedButtonStyle}>
        <Pressable onPress={handlePlay} onPressIn={handlePressIn} onPressOut={handlePressOut} onLongPress={handlePlay}>
          {isPlaying ?
            <Feather name="stop-circle" size={60} color="black" /> :
            <Feather name="play-circle" size={60} color="black" />
          }
        </Pressable>
      </Animated.View>
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
});
