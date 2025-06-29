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
  TouchableWithoutFeedback
} from "react-native";
import { Pressable, TextInput } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { Image } from "expo-image";

enum taskEnum {
  readingBooks = "reading-books",
  watchingTV = "watching-tv",
  playingVideoGames = "playing-video-games",
};

const backgroundImageNameMap = {
  [taskEnum.readingBooks]: require("@/assets/images/reading-books.png"),
  [taskEnum.watchingTV]: require("@/assets/images/watching-tv.png"),
  [taskEnum.playingVideoGames]: require("@/assets/images/playing-video-games.png"),
};

export default function Index() {
  const { selectedValue } = useNumberPickerStore();
  const [countDown, setCountDown] = useState<number>(selectedValue * 60);
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useDerivedValue(() => {
    return 1.0 - ((buttonScale.value - 1) / (1.2 - 1)) * 0.4;
  });
  const [task, setTask] = useState<taskEnum>(taskEnum.playingVideoGames);
  const [taskInput, setTaskInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

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
        />
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={backgroundImageNameMap[task]}
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
    marginTop: "10%",
  },
  taskInput: {
    width: "100%",
    height: 20,
    fontSize: 20,
    fontFamily: "LXGWWenKaiMonoTC-Regular",
  },
});
