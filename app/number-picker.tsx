import Button from "@/components/Button";
import { useNumberPickerStore } from "@/stores/numberPickerStore";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler
} from "react-native-reanimated";

const { width } = Dimensions.get("screen");

const segmentWidth = 2;
const segmentSpacing = 20;
const snapSegment = segmentWidth + segmentSpacing;
const spacerWidth = (width - segmentWidth) / 2;
const indicatorWidth = 130;
const indicatorHeight = 80;

const Ruler = <T extends { toString: () => string }>({ items }: { items: T[] }) => {
  const rulerWidth = spacerWidth * 2 + items.length * segmentWidth + (items.length - 1) * segmentSpacing;
  return (
    <View style={[styles.ruler, { width: rulerWidth }]}>
      <View style={{ width: spacerWidth }} />
      {items.map((value, index) => {
        const isTenth = typeof value === "number" && !isNaN(value) && value % 10 === 0;
        return (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor: "#999",
                height: isTenth ? 40 : 20,
                marginRight: index === items.length - 1 ? 0 : segmentSpacing,
              }
            ]}
          />
        );
      })}
      <View style={{ width: spacerWidth }} />
    </View>
  );
};

export default function NumberPickerScreen() {
  const { selectedValue, setSelectedValue, closePicker } = useNumberPickerStore();
  const items = Array.from({ length: 76 }, (_, i) => i + 15);

  const [indicatorX, setIndicatorX] = useState(selectedValue);
  const [lastHapticIndex, setLastHapticIndex] = useState(-1);

  const handleIndicatorX = (idx: number) => {
    setIndicatorX(idx);
    if (idx !== lastHapticIndex) {
      setLastHapticIndex(idx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleScroll = useAnimatedScrollHandler((event) => {
    const rawIndex = Math.round(event.contentOffset.x / snapSegment);
    const boundedIndex = Math.max(0, Math.min(rawIndex, items.length - 1));
    const boundedValue = items[boundedIndex];

    runOnJS(handleIndicatorX)(boundedValue);
  });

  const handleStart = () => {
    setSelectedValue(indicatorX);
    closePicker();
    router.back();
  };

  return (
    <SafeAreaView style={styles.containerView}>
      <Button
        onPress={handleStart}
        style={styles.closeButton}
      >
        <Text>
          Start
        </Text>
      </Button>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapSegment}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <Ruler items={items} />
      </Animated.ScrollView>
      <View style={styles.indicatorWrapper} >
        <Text
          style={[styles.indictorText, { fontFamily: "LXGWWenKaiMonoTC-Bold" }]}
        >
          {indicatorX.toString() + " min"}
        </Text>
        <View style={[styles.segment, styles.segmentIndicator]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  closeButton: {
    position: "absolute",
    bottom: "30%",
    left: "50%",
    transform: [{ translateX: -50 }],
    zIndex: 1000,
  },
  ruler: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  segment: {
    width: segmentWidth
  },
  indicatorWrapper: {
    position: "absolute",
    left: (width - indicatorWidth) / 2,
    bottom: 34,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: indicatorWidth,
  },
  segmentIndicator: {
    height: indicatorHeight,
    backgroundColor: "white",
  },
  indictorText: {
    fontSize: 40,
    marginBottom: 10,
    color: "#999",
  }
}); 
