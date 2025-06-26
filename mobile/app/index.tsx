import { useNumberPickerStore } from "@/stores/numberPickerStore";
import { Feather } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

const backgroundImage = require("@/assets/images/mymy-background.png");

export default function Index() {
  const { selectedValue } = useNumberPickerStore();
  const [countDown, setCountDown] = useState<number>(selectedValue * 60);
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useDerivedValue(() => {
    return 1.0 - ((buttonScale.value - 1) / (1.2 - 1)) * 0.4;
  });

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
      <View style={styles.clockButtonContainer}>
        <Pressable onPress={handlePlay} onPressIn={handlePressIn} onPressOut={handlePressOut} onLongPress={handlePlay}>
          {isPlaying ?
            <AnimatedFeather name="stop-circle" size={60} color="black" style={animatedButtonStyle} /> :
            <AnimatedFeather name="play-circle" size={60} color="black" style={animatedButtonStyle} />
          }
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
    top: "15%",
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
    bottom: "20%",
  },
});
