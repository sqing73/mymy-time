import { StyleSheet, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native-gesture-handler";
import { router } from "expo-router";

export default function ProfileScreen() {
  const handleClose = () => {
    router.back();
  };
  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={handleClose} style={styles.closeButton}>
        <Feather name="arrow-left" size={40} color="black" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(221, 183, 116)",
  },
  closeButton: {
    position: "absolute",
    left: 20,
    top: "10%",
  },
  title: {
    fontSize: 32,
    fontFamily: 'LXGWWenKaiMonoTC-Bold',
    marginBottom: 20,
  },
}); 
