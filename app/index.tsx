import PickerModal from '@/components/PickerModal';
import { FontAwesome } from '@expo/vector-icons';
import { PickerItemProps } from '@react-native-picker/picker';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const backgroundImage = require("@/assets/images/mymy-background.png");

export default function Index() {
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const goldenTop = screenHeight * 0.2;
  const [countDown, setCountDown] = useState<number | null>(null);
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const items: PickerItemProps[] = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    label: (i + 15).toString(),
    value: i + 15,
    color: "white",
    style: {
      fontSize: 24,
    }
  })), []);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (countDown === null) return;
    if (isDateTimePickerOpen && timerRef.current !== null) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      if (countDown > 0) {
        setCountDown(prev => prev !== null ? prev - 1 : null);
      } else if (countDown === 0) {
        setCountDown(null);
      }
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [countDown, isDateTimePickerOpen]);

  const formatTime = useCallback((time: number | null) => {
    if (time === null) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      {countDown && <View style={[styles.timerContainer, { marginTop: goldenTop }]}>
        <Text style={styles.timerText}>
          {formatTime(countDown)}
        </Text>
      </View>}
      <View
        style={[
          styles.clockButtonContainer,
          { right: screenWidth * 0.1, bottom: screenHeight * 0.05 },
        ]}
      >
        <Pressable onPress={() => setIsDateTimePickerOpen(true)}>
          <FontAwesome name="clock-o" size={40} color="black" />
        </Pressable>
      </View>
      <PickerModal
        isOpen={isDateTimePickerOpen}
        setIsOpen={setIsDateTimePickerOpen}
        initialValue={items[0].value}
        items={items}
        onValuePicked={(value) => { if (value !== undefined) setCountDown(value as number * 60); }}
      />
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
  },
  timerText: {
    fontSize: 64,
    fontFamily: "LXGWWenKaiMonoTC-Bold",
    letterSpacing: 15,
    minWidth: 200,
    textShadowColor: "black",
    textShadowOffset: { width: 0.9, height: 0.9 },
    textShadowRadius: 0.7,
  },
  clockButtonContainer: {
    position: "absolute",
  },
});
