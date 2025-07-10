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
} from "react-native";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { useImageGeneration, useActivityExtraction } from "@/hooks/useApi";
import { useToast } from "@/components/ToastContext";
import ImageGenerateConfirmationModal from "@/components/image-generate-confirmation-modal";
import PressableButton from "@/components/PressableButton";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import { getImageUriFromFileSystem, writeImageToFileSystem } from "@/lib/imageUtils";

const { width: screenWidth } = Dimensions.get("screen");

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

export default function Index() {
  const { showToast } = useToast();

  const { selectedValue, isTimerRunning, setIsTimerRunning, backgroundImage, setBackgroundImage } = useTimerStore();
  const [countDown, setCountDown] = useState<number>(selectedValue * 60); // in seconds
  const timerRef = useRef<number | null>(null);
  const [activityInput, setActivityInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [isActivityInputValid, setIsActivityInputValid] = useState(false);
  const [isImageGenerateConfirmationModalVisible, setIsImageGenerateConfirmationModalVisible] = useState(false);

  const ellipsis = useRef<string>("");
  const originalActivityInput = useRef<string>("");
  const ellipsisTimerRef = useRef<number | null>(null);

  const { mutateAsync: extractActivity, isPending: isExtractingActivity } = useActivityExtraction();
  const { mutateAsync: generateImage, isPending: isGeneratingImage } = useImageGeneration();

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isGeneratingImage ? 0.5 : 1, { duration: 1000 }),
  }));
  const loadingIconRotate = useSharedValue(0);
  const settingsIconTranslateX = useSharedValue(0);
  const galleryIconTranslateX = useDerivedValue(() => {
    return -settingsIconTranslateX.value;
  });
  const playButtonTranslateY = useDerivedValue(() => {
    // Play button moves downward with more translation (negative value = downward)
    return -settingsIconTranslateX.value * 4; // 2x more movement than icons
  });

  const animatedLoadingIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingIconRotate.value}deg` }],
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
  }, [activityInput, extractActivity, setBackgroundImage, showToast]);

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
      loadingIconRotate.value = withRepeat(withTiming(loadingIconRotate.value + 360, { duration: 1000 }), -1, false);
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
      loadingIconRotate.value = 0;
    }
  }, [loadingIconRotate, generateImage, activityInput, setBackgroundImage, showToast]);

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
          <View style={[styles.bottomLine, { width: Math.max(screenWidth * 0.6, activityInput.length * 10) }]} />
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
