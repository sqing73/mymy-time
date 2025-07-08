import { Feather } from "@expo/vector-icons";
import { Text, View, Modal, StyleSheet, Pressable } from "react-native";
import PressableButton from "@/components/PressableButton";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Image } from "expo-image";

type ImageGenerateConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ImageGenerateConfirmationModal = ({ visible, onClose, onConfirm }: ImageGenerateConfirmationModalProps) => {
  const handleClosePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  const handleConfirmPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onConfirm();
  }, [onConfirm]);

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose} transparent={true}>
      <Pressable style={styles.container} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <PressableButton onPress={handleClosePress} onLongPress={handleClosePress}>
                <Feather name="x" size={24} color="black"/>
              </PressableButton>
            </View>
            <Text
              style={styles.modalText}
            >
              Want to generate an image for your activity?
            </Text>
            <PressableButton onPress={handleConfirmPress} style={styles.confirmButton}>
              <Text style={styles.modalText}>Yes, please! - </Text>
              <Image source={require("@/assets/images/coin.png")} style={styles.coinImage} />
            </PressableButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default ImageGenerateConfirmationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    alignItems: "center",
    backgroundColor: "#e8dcc1",
    borderRadius: 16,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "black",
  },
  modalHeader: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  modalText: {
    fontSize: 20,
    fontFamily: "LXGWWenKaiMonoTC-Regular",
    color: "#3b2f2f",
    textAlign: "center",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  coinImage: {
    width: 30,
    height: 30,
  },
});
