import { FontAwesome } from "@expo/vector-icons";
import type { PickerProps } from "@react-native-picker/picker";
import { Picker, PickerItemProps } from "@react-native-picker/picker";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
// TODO: font size, family is not working, might need to rebuild the wheel

type PickerModalProps<T> = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialValue: T;
  items: PickerItemProps<T>[];
  onValuePicked: (value: T) => void;
  pickerProps?: Omit<PickerProps<T>, 'selectedValue' | 'onValueChange'>;
};

const PickerModal = <T,>({
  isOpen,
  items,
  setIsOpen,
  initialValue,
  pickerProps,
  onValuePicked,
}: PickerModalProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<T>(initialValue);

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setIsOpen(false);
      }}
    >
      <View style={styles.containerView}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => {
            setSelectedValue(itemValue);
          }}
          {...pickerProps}
          style={[styles.pickerView, pickerProps?.style]}
          selectionColor={"white"}
        >
          {items.map((item) => (
            <Picker.Item
              key={String(item.value)}
              {...item}
            />
          ))}
        </Picker>
        <Pressable onPress={() => {
          onValuePicked(selectedValue);
          setIsOpen(false);
          setSelectedValue(initialValue);
        }}>
          <FontAwesome name="play" size={40} color="black" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    gap: 60,
  },
  pickerView: {
    width: 200,
    height: 150,
  },
});

export default PickerModal
