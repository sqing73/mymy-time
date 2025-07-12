import { useCallback } from "react";
import { Dimensions } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("screen");

export const useTimerAnimations = (activityInput: string, isGeneratingImage: boolean) => {
  const loadingIconRotate = useSharedValue(0);
  const settingsIconTranslateX = useSharedValue(0);
  const bottomLineWidth = useSharedValue(Math.max(screenWidth * 0.6, activityInput.length * 10));

  const galleryIconTranslateX = useDerivedValue(() => {
    return -settingsIconTranslateX.value;
  });

  const playButtonTranslateY = useDerivedValue(() => {
    // Play button moves downward with more translation (negative value = downward)
    return -settingsIconTranslateX.value * 4; // 2x more movement than icons
  });

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isGeneratingImage ? 0.5 : 1, { duration: 1000 }),
  }));

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

  const animatedBottomLineStyle = useAnimatedStyle(() => ({
    width: bottomLineWidth.value,
  }));

  const slideOutAnimationStart = useCallback(() => {
    settingsIconTranslateX.value = withTiming(-100, { duration: 300 });
    bottomLineWidth.value = withTiming(0, { duration: 300 });
  }, [settingsIconTranslateX, bottomLineWidth]);

  const slideInAnimationStart = useCallback(() => {
    settingsIconTranslateX.value = withTiming(0, { duration: 300 });
    bottomLineWidth.value = withTiming(Math.max(screenWidth * 0.6, activityInput.length * 10), { duration: 300 });
  }, [settingsIconTranslateX, activityInput, bottomLineWidth]);

  const updateBottomLineWidth = useCallback(() => {
    bottomLineWidth.value = withTiming(Math.max(screenWidth * 0.6, activityInput.length * 10), { duration: 100 });
  }, [activityInput, bottomLineWidth]);

  const startLoadingAnimation = useCallback(() => {
    loadingIconRotate.value = withRepeat(withTiming(loadingIconRotate.value + 360, { duration: 1000 }), -1, false);
  }, [loadingIconRotate]);

  const stopLoadingAnimation = useCallback(() => {
    loadingIconRotate.value = 0;
  }, [loadingIconRotate]);

  return {
    // Shared values
    loadingIconRotate,
    settingsIconTranslateX,
    bottomLineWidth,
    
    // Animated styles
    animatedImageStyle,
    animatedLoadingIconStyle,
    animatedSettingsIconStyle,
    animatedGalleryIconStyle,
    animatedPlayButtonStyle,
    animatedBottomLineStyle,
    
    // Animation functions
    slideOutAnimationStart,
    slideInAnimationStart,
    updateBottomLineWidth,
    startLoadingAnimation,
    stopLoadingAnimation,
  };
};
