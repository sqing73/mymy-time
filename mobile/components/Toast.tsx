import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export interface ToastProps {
  message: string;
  duration?: number;
  onDismiss?: () => void;
  visible: boolean;
}

const { width: screenWidth } = Dimensions.get("window");
const DISMISS_THRESHOLD = -20; // Distance to drag up to dismiss

const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onDismiss,
  visible,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const dragY = useSharedValue(0);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished && onDismiss) {
        runOnJS(onDismiss)();
      }
    });
  }, [onDismiss, translateY, opacity]);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });

      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, translateY, opacity, dismiss]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      dragY.value = 0;
    })
    .onUpdate((event) => {
      if (event.translationY < 0) {
        dragY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY < DISMISS_THRESHOLD) {
        runOnJS(dismiss)();
      } else {
        dragY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value + dragY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.snackbar}>
          <Text style={styles.message}>{message}</Text>
        </View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 60, // Account for status bar
    alignItems: "center",
    justifyContent: "center",
  },
  snackbar: {
    width: screenWidth * 0.8, // 80% of screen width
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
    lineHeight: 20,
    textAlign: "center",
    fontFamily: "LXGWWenKaiMonoTC-Bold",
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    opacity: 0.8,
  },
});

export default Toast; 
