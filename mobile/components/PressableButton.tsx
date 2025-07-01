import { GestureResponderEvent, Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";

interface PressableButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

const PressableButton: React.FC<PressableButtonProps> = ({ children, style, disabled = false, ...props }) => {
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useDerivedValue(() => {
    return 1.0 - ((buttonScale.value - 1) / (1.2 - 1)) * 0.4;
  });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  });

  const handlePressIn = (event: GestureResponderEvent) => {
    props.onPressIn?.(event);
    buttonScale.value = withTiming(1.2, { duration: 100 });
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    props.onPressOut?.(event);
    buttonScale.value = withTiming(1, { duration: 100 });
  };
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        {...props}
        disabled={disabled}
        style={() => [
          styles.button,
          style,
          disabled && styles.disabled,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default PressableButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "transparent",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
