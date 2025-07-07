import { useNumberPickerStore } from "@/stores/numberPickerStore";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { PressableEvent } from "react-native-gesture-handler/lib/typescript/components/Pressable/PressableProps";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated";

const { width } = Dimensions.get("screen");

const segmentWidth = 8;
const segmentSpacing = 10;
const snapSegment = segmentWidth + segmentSpacing;
const spacerWidth = (width - segmentWidth) / 2;
const indicatorWidth = 140;
const indicatorHeight = 80;

const Ruler = ({ items }: { items: number[] }) => {
  const rulerWidth = spacerWidth * 2 + items.length * segmentWidth + (items.length - 1) * segmentSpacing;
  return (
    <View style={[styles.ruler, { width: rulerWidth }]}>
      <View style={{ width: spacerWidth }} />
      {items.map((value: number, index: number) => {
        const isFifth = value % 5 === 0;
        return (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor: "black",
                height: isFifth ? 40 : 20,
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
  const { setSelectedValue } = useNumberPickerStore();
  const items = Array.from({ length: 106 }, (_, i) => i + 15); // 15 ~ 120

  const [indicatorX, setIndicatorX] = useState(15);
  const [lastHapticIndex, setLastHapticIndex] = useState(-1);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Start the shake sequence with a 500ms delay
    rotation.value = withDelay(500, withTiming(10, { duration: 100 }, () => {
      rotation.value = withTiming(-10, { duration: 100 }, () => {
        rotation.value = withTiming(8, { duration: 100 }, () => {
          rotation.value = withTiming(-8, { duration: 100 }, () => {
            rotation.value = withTiming(5, { duration: 100 }, () => {
              rotation.value = withTiming(-5, { duration: 100 }, () => {
                rotation.value = withTiming(0, { duration: 200 });
              });
            });
          });
        });
      });
    }));
  }, [rotation]);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  const handleIndicatorX = (idx: number) => {
    setIndicatorX(idx);
    if (idx !== lastHapticIndex) {
      setLastHapticIndex(idx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }
  };

  const handleScroll = useAnimatedScrollHandler((event) => {
    const rawIndex = Math.round(event.contentOffset.x / snapSegment);
    const boundedIndex = Math.max(0, Math.min(rawIndex, items.length - 1));
    const boundedValue = items[boundedIndex];

    runOnJS(handleIndicatorX)(boundedValue);
  });

  const handleDoneClicked = (e: PressableEvent) => {
    setSelectedValue(indicatorX);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handlePressIn = () => {
    scale.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.containerView}>
      <Pressable onPress={handleClose} style={styles.closeButton}>
        <Feather name="arrow-left" size={40} color="black" />
      </Pressable>
      <Pressable onPress={handleDoneClicked} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.Image
          source={require("@/assets/images/mymy-tree.png")}
          style={[styles.image, animatedImageStyle]}
        />
      </Pressable>

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
          style={styles.indictorText}
        >
          {indicatorX.toString()}
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
    backgroundColor: "rgb(221, 183, 116)",
  },
  image: {
    width: 150,
    height: 250,
    marginTop: 200,
  },
  closeButton: {
    alignSelf: "flex-start",
    left: 20,
    top: 20,
  },
  ruler: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  segment: {
    width: segmentWidth,
    borderRadius: 10,
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
    backgroundColor: "black",
  },
  indictorText: {
    fontSize: 40,
    marginBottom: 10,
    fontFamily: "LXGWWenKaiMonoTC-Bold",
  },
}); 
