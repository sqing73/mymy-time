import { Pressable, StyleSheet, TextStyle, ViewStyle } from "react-native";

type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

const Button = ({ onPress, children, style, textStyle, disabled = false }: ButtonProps) => {

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#000",
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  disabled: {
    opacity: 0.5,
    borderColor: "#999",
  },
});

export default Button;
