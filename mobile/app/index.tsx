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
  Dimensions,
  AppState,
} from "react-native";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { useImageGeneration, useActivityExtraction } from "@/hooks/useApi";
import { useTimerAnimations } from "@/hooks/useTimerAnimations";
import { useToast } from "@/components/ToastContext";
import ImageGenerateConfirmationModal from "@/components/image-generate-confirmation-modal";
import PressableButton from "@/components/PressableButton";
import Animated from "react-native-reanimated";
import { getImageUriFromFileSystem, writeImageToFileSystem } from "@/lib/imageUtils";

const { width: screenWidth } = Dimensions.get("screen");

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

export default function Index() {
  const { showToast } = useToast();

  const { countDown, isTimerRunning, setIsTimerRunning, backgroundImage, setBackgroundImage, setCountDown } = useTimerStore();
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const initialCountDownRef = useRef<number>(countDown);
  const [activityInput, setActivityInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [isActivityInputValid, setIsActivityInputValid] = useState(false);
  const [isImageGenerateConfirmationModalVisible, setIsImageGenerateConfirmationModalVisible] = useState(false);

  const ellipsis = useRef<string>("");
  const originalActivityInput = useRef<string>("");
  const ellipsisTimerRef = useRef<number | null>(null);

  const { mutateAsync: extractActivity, isPending: isExtractingActivity } = useActivityExtraction();
  const { mutateAsync: generateImage, isPending: isGeneratingImage } = useImageGeneration();

  const {
    animatedImageStyle,
    animatedLoadingIconStyle,
    animatedSettingsIconStyle,
    animatedGalleryIconStyle,
    animatedPlayButtonStyle,
    animatedBottomLineStyle,
    slideOutAnimationStart,
    slideInAnimationStart,
    updateBottomLineWidth,
    startLoadingAnimation,
    stopLoadingAnimation,
  } = useTimerAnimations(activityInput, isGeneratingImage);

  const shouldLockScreen = isTimerRunning || isExtractingActivity || isGeneratingImage;

  const handleTimerEndCallback = useCallback((nextAppState?: string) => {
    clearInterval(timerRef.current!);
    setIsTimerRunning(false);
    startTimeRef.current = null;
    if (nextAppState === "active") {
      setTimeout(() => {
        slideInAnimationStart();
      }, 1500);
    } else {
      slideInAnimationStart();
    }
  }, [slideInAnimationStart, setIsTimerRunning]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isTimerRunning && startTimeRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remainingTime = Math.max(0, initialCountDownRef.current - elapsedSeconds);
        setCountDown(remainingTime);

        if (remainingTime === 0) {
          handleTimerEndCallback(nextAppState);
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription?.remove();
  }, [isTimerRunning, setIsTimerRunning, slideInAnimationStart, handleTimerEndCallback, setCountDown]);

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
    startTimeRef.current = null;
  }, [setIsTimerRunning]);

  const handlePlayPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!activityInput) {
      showToast("Please enter an activity first!");
      return;
    }

    setIsTimerRunning(true);
    if (!startTimeRef.current) {
      initialCountDownRef.current = countDown;
    }
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      const remainingTime = Math.max(0, initialCountDownRef.current - elapsedSeconds);
      setCountDown(remainingTime);
      if (remainingTime === 0) {
        handleTimerEndCallback();
      }
    }, 1000);
    slideOutAnimationStart();
  }, [activityInput, setIsTimerRunning, slideOutAnimationStart, showToast, setCountDown, handleTimerEndCallback, countDown]);

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
        updateBottomLineWidth();
      }, 1000);

      const data = await extractActivity({ prompt: activityInput });
      setActivityInput(data.activity);
      setCountDown(data.time * 60);
      const uri = await getImageUriFromFileSystem(data.image);
      if (uri) {
        setBackgroundImage({ uri });
      } else {
        showToast("No image found for the activity!");
      }
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
  }, [activityInput, extractActivity, setBackgroundImage, showToast, updateBottomLineWidth, setCountDown]);

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
    try {
      setIsImageGenerateConfirmationModalVisible(false);
      startLoadingAnimation();
      const imageBase64 = await generateImage({ prompt: activityInput });
      const uri = await writeImageToFileSystem(imageBase64, activityInput);
      setBackgroundImage({ uri });
    } catch (error: unknown) {
      if (error instanceof Error && (error.message.includes('ENOSPC') || error.message.toLowerCase().includes('quota'))) {
        showToast("Your device is out of storage space. Please free up some space and try again.");
        return;
      }
      showToast("Failed to generate image!");
    } finally {
      stopLoadingAnimation();
    }
  }, [startLoadingAnimation, stopLoadingAnimation, generateImage, activityInput, setBackgroundImage, showToast]);

  const handleScreenLongPress = useCallback(() => {
    if (isTimerRunning) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      pauseTimer();
    }
    slideInAnimationStart();
  }, [isTimerRunning, pauseTimer, slideInAnimationStart]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} onLongPress={handleScreenLongPress}>
      <View
        style={styles.container}
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
            placeholder={isFocused ? "" : "read for an hour"}
            value={activityInput}
            onChangeText={(text) => setActivityInput(text)}
            style={styles.activityInput}
            placeholderTextColor="gray"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleActivityExtraction}
            editable={!shouldLockScreen}
            maxLength={32}
          />
          <Animated.View style={[styles.bottomLine, animatedBottomLineStyle]} />
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
                source={backgroundImage}
                style={{
                  width: screenWidth * 0.7,
                  height: screenWidth * 0.7 * 1.5,
                }}
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
  container: {
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
  activityInputContainer: {
    marginTop: "8%",
    marginBottom: "3%",
    maxWidth: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  activityInput: {
    width: "100%",
    height: 20,
    fontSize: 20,
    fontFamily: "LXGWWenKaiMonoTC-Bold",
    textAlign: "center",
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
  bottomLine: {
    marginTop: 10,
    alignSelf: "center",
    borderBottomWidth: 1,
    borderRadius: 10,
    borderColor: "gray",
  },
});
