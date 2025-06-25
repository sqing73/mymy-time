import { useNumberPickerStore } from "@/stores/numberPickerStore";
import { Feather } from '@expo/vector-icons';
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Pressable } from "react-native-gesture-handler";

const backgroundImage = require("@/assets/images/mymy-background.png");

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const goldenTop = screenHeight * 0.2;

export default function Index() {
  const { selectedValue } = useNumberPickerStore();
  const [countDown, setCountDown] = useState<number>(selectedValue * 60);
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.timerContainer}>
        <Pressable onPress={handleOpenNumberPicker}>
          <Text style={styles.timerText}>
            {formatTime(countDown)}
          </Text>
        </Pressable>
      </View>
      <View
        style={[
          styles.clockButtonContainer,
          { right: screenWidth * 0.1, bottom: screenHeight * 0.05 },
        ]}
      >
        <Pressable onPress={handlePlay}>
          {isPlaying ?
            <Feather name="stop-circle" size={60} color="black" /> :
            <Feather name="play-circle" size={60} color="black" />}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: goldenTop,
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
  clockButtonContainer: {
    position: "absolute",
  },
});
