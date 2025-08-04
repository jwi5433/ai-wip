import React, { useCallback } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import ProfileCard from "./ProfileCard";
import { TemporaryCharacterData } from "@/lib/services/characterService";

const SWIPE_THRESHOLD = 120;

type SwipeableCardProps = {
  profile: TemporaryCharacterData;
  onSwipe: (
    profile: TemporaryCharacterData,
    direction: "left" | "right",
  ) => void;
};

export const SwipeableCard = ({ profile, onSwipe }: SwipeableCardProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const performSwipe = useCallback(
    (direction: "left" | "right") => {
      "worklet";
      const offscreenX = (direction === "right" ? 1 : -1) * screenWidth * 1.5;
      translateX.value = withSpring(offscreenX, { damping: 20 });
      runOnJS(onSwipe)(profile, direction);
    },
    [profile, onSwipe, screenWidth, translateX],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      "worklet";
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      "worklet";
      if (event.translationX > SWIPE_THRESHOLD) {
        performSwipe("right");
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        performSwipe("left");
      } else {
        translateX.value = withSpring(0, { damping: 20 });
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-10, 0, 10],
      "clamp",
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <ProfileCard
          card={profile}
          onLike={() => performSwipe("right")}
          onPass={() => performSwipe("left")}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
