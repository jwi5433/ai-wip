import AsyncStorage from "@react-native-async-storage/async-storage";
import { Heart, MessageSquare, X } from "@tamagui/lucide-icons";
import React, { useEffect, useRef, useState } from "react";
// CORRECTED: Removed unused 'StyleSheet' import
import { ActivityIndicator, Alert } from "react-native";
import Swiper from "react-native-deck-swiper";
// CORRECTED: Link is now imported from 'expo-router'
import { Link } from "expo-router";
// CORRECTED: Tamagui components are imported separately
import { Button, Circle, Paragraph, YStack } from "tamagui";

import { ProfileCard } from "../../components/ProfileCard";
import {
  TemporaryCharacterData,
  generateTemporaryCharacter,
  saveMatchedCharacter,
} from "../../lib/services/characterService";

const CACHED_PROFILES_KEY = "cachedAiProfileData";

export default function SwipeScreen() {
  const [profiles, setProfiles] = useState<TemporaryCharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef<Swiper<TemporaryCharacterData>>(null);

  const generateAndCacheProfiles = async () => {
    setIsLoading(true);
    const newProfilePromises = Array(5)
      .fill(null)
      .map(() => generateTemporaryCharacter());
    const newProfiles = (await Promise.all(newProfilePromises)).filter(
      Boolean,
    ) as TemporaryCharacterData[];

    if (newProfiles.length > 0) {
      await AsyncStorage.setItem(
        CACHED_PROFILES_KEY,
        JSON.stringify(newProfiles),
      );
      setProfiles(newProfiles);
    } else {
      Alert.alert("Generation Failed", "Could not generate new profiles.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(CACHED_PROFILES_KEY);
        if (cachedData) {
          setProfiles(JSON.parse(cachedData));
        } else {
          await generateAndCacheProfiles();
        }
      } catch (error) {
        await generateAndCacheProfiles();
      } finally {
        setIsLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const handleSwipedRight = async (cardIndex: number) => {
    const characterToMatch = profiles[cardIndex];
    if (!characterToMatch) return;
    await saveMatchedCharacter(characterToMatch);
    Alert.alert("New Match!", `You matched with ${characterToMatch.name}.`);
  };

  const clearCacheAndRegenerate = async () => {
    await AsyncStorage.removeItem(CACHED_PROFILES_KEY);
    await generateAndCacheProfiles();
  };

  if (isLoading) {
    return (
      <YStack flex={1} jc="center" ai="center" bg="$background">
        <ActivityIndicator size="large" color="$pink9" />
        <Paragraph>Generating profiles...</Paragraph>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$backgroundFocus">
      <YStack flex={1} p="$3" pb="$2">
        <Swiper
          ref={swiperRef}
          cards={profiles}
          renderCard={(card) => (card ? <ProfileCard card={card} /> : null)}
          cardIndex={0}
          backgroundColor={"transparent"}
          stackSize={3}
          verticalSwipe={false}
          containerStyle={{ flex: 1 }}
          onSwipedRight={handleSwipedRight}
        />
      </YStack>

      <Link href="/matches" asChild>
        <Circle
          size={44}
          bg="$background"
          o={0.8}
          pressStyle={{ o: 1 }}
          elevation="$2"
          pos="absolute"
          t="$6"
          r="$4"
          zIndex={5}
        >
          <MessageSquare color="$color12" />
        </Circle>
      </Link>

      <YStack h={100} fd="row" jc="space-evenly" ai="center">
        <Circle
          size={60}
          elevation="$1"
          onPress={() => swiperRef.current?.swipeLeft()}
          pressStyle={{ scale: 0.9 }}
          animation="bouncy"
        >
          <X size={30} color="$red10" />
        </Circle>
        <Circle
          size={60}
          elevation="$1"
          onPress={() => swiperRef.current?.swipeRight()}
          pressStyle={{ scale: 0.9 }}
          animation="bouncy"
        >
          <Heart size={30} color="$pink10" />
        </Circle>
      </YStack>

      <Button
        onPress={clearCacheAndRegenerate}
        pos="absolute"
        b="$1"
        l="$1"
        size="$2"
      >
        Regenerate
      </Button>
    </YStack>
  );
}
