import React from "react";
import { YStack, Text, Spinner } from "tamagui";
import { useProfileDeck } from "@/hooks/useProfileDeck";
import { SwipeableCard } from "./SwipeableCard";
import ProfileCard from "./ProfileCard";

export const ProfileDeck = () => {
  const { currentProfile, nextProfile, handleSwipe, isLoading, isDeckEmpty } =
    useProfileDeck();

  if (isLoading) {
    return (
      <YStack flex={1} jc="center" ai="center">
        <Spinner size="large" color="$brand" />
      </YStack>
    );
  }

  if (isDeckEmpty && !isLoading) {
    return (
      <YStack flex={1} jc="center" ai="center">
        <Text>No more profiles!</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} jc="center" ai="center" pos="relative">
      {nextProfile && (
        <YStack
          pos="absolute"
          width="100%"
          height="100%"
          jc="center"
          ai="center"
        >
          <ProfileCard card={nextProfile} onLike={() => {}} onPass={() => {}} />
        </YStack>
      )}

      {currentProfile && (
        <SwipeableCard
          key={currentProfile.name}
          profile={currentProfile}
          onSwipe={handleSwipe}
        />
      )}
    </YStack>
  );
};
