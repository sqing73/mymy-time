import { useNumberPickerStore } from "@/stores/numberPickerStore";
import { FontAwesome } from '@expo/vector-icons';
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
  const [countDown, setCountDown] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const { selectedValue, openPicker } = useNumberPickerStore();

  useEffect(() => {
    if (selectedValue > 0) {
      setCountDown(selectedValue * 60);
    }
  }, [selectedValue]);

  useEffect(() => {
    if (countDown === null) return;
    timerRef.current = setInterval(() => {
      if (countDown > 0) {
        setCountDown(prev => prev !== null ? prev - 1 : null);
      } else if (countDown === 0) {
        setCountDown(null);
      }
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [countDown]);

  const formatTime = useCallback((time: number | null) => {
    if (time === null) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const handleOpenNumberPicker = () => {
    openPicker();
    router.push("/number-picker");
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      {countDown && <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {formatTime(countDown)}
        </Text>
      </View>}
      <View
        style={[
          styles.clockButtonContainer,
          { right: screenWidth * 0.1, bottom: screenHeight * 0.05 },
        ]}
      >
        <Pressable onPress={handleOpenNumberPicker}>
          <FontAwesome name="clock-o" size={40} color="black" />
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
