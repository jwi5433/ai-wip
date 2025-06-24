// We will now use Circle from tamagui as the button
import { Heart, X } from "@tamagui/lucide-icons";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import DeckSwiper from "react-native-deck-swiper";
import { Button, Circle, Paragraph, YStack } from "tamagui";

import { ProfileCard } from "../../components/ProfileCard";
import {
        Character,
        generateTemporaryCharacter,
        saveMatchedCharacter,
} from "../../lib/services/characterService";

type TemporaryCharacter = Omit<Character, 'id'>;

export default function DiscoverScreen() {
        const [profiles, setProfiles] = useState<TemporaryCharacter[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const swiperRef = useRef<DeckSwiper<TemporaryCharacter>>(null);

        const handleGenerateMore = async () => {
                setIsLoading(true);
                const newProfilePromises = [
                        generateTemporaryCharacter(),
                        generateTemporaryCharacter(),
                        generateTemporaryCharacter(),
                ];
                const newProfiles = (await Promise.all(newProfilePromises)).filter(
                        (p) => p !== null
                ) as TemporaryCharacter[];

                setProfiles((prev) => [...newProfiles, ...prev]);
                setIsLoading(false);
        };

        useEffect(() => {
                if (profiles.length === 0) {
                        handleGenerateMore();
                }
        }, []);

        const handleSwipedRight = async (cardIndex: number) => {
                const characterToMatch = profiles[cardIndex];
                // This check prevents the crash if the character is undefined
                if (!characterToMatch) {
                        console.error("Swiped on an invalid card index:", cardIndex);
                        return;
                }

                Alert.alert("Saving Match...", `Adding ${characterToMatch.name} to your matches.`);
                const savedCharacter = await saveMatchedCharacter(characterToMatch);

                if (savedCharacter) {
                        Alert.alert("New Match!", `You matched with ${characterToMatch.name}.`);
                } else {
                        Alert.alert("Error", "Could not save your match. Please try again.");
                }
        };

        const handleSwipedAll = () => {
                handleGenerateMore();
        };

        if (isLoading && profiles.length === 0) {
                return (
                        <YStack flex={1} jc="center" ai="center" bg="$background">
                                <ActivityIndicator size="large" color="$pink9" />
                                <Paragraph color="$gray10" mt="$2">Generating first profiles...</Paragraph>
                        </YStack>
                );
        }

        if (profiles.length === 0) {
                return (
                        <YStack flex={1} jc="center" ai="center" bg="$background" gap="$3" p="$4">
                                <Paragraph color="$gray10" ta="center">
                                        Something went wrong generating profiles.
                                </Paragraph>
                                <Button
                                        onPress={handleGenerateMore}
                                        disabled={isLoading}
                                        bg="$pink9"
                                        p="$3"
                                        px="$4"
                                        br="$6"
                                        pressStyle={{ opacity: 0.8 }}
                                        animation="bouncy"
                                >
                                        <Paragraph col="$black" fow="bold">
                                                {isLoading ? "Searching..." : "Try Again"}
                                        </Paragraph>
                                </Button>
                        </YStack>
                )
        }

        return (
                <YStack flex={1} bg="$background">
                        <YStack flex={1} p="$4" pb="$2">
                                <DeckSwiper
                                        ref={swiperRef}
                                        cards={profiles}
                                        renderCard={(card) => <ProfileCard card={card as Character} />}
                                        onSwipedRight={handleSwipedRight}
                                        onSwipedAll={handleSwipedAll}
                                        cardIndex={0}
                                        backgroundColor="transparent"
                                        stackSize={3}
                                />
                        </YStack>

                        <YStack h={120} jc="center" ai="center">
                                <YStack f={1} w="100%" fd="row" jc="space-evenly" ai="center">
                                        <Circle
                                                size={70}
                                                bg="$background"
                                                elevation="$2"
                                                onPress={() => swiperRef.current?.swipeLeft()}
                                                pressStyle={{ opacity: 0.7, scale: 0.95 }}
                                                animation="bouncy"
                                        >
                                                <X size={40} color="red" />
                                        </Circle>
                                        <Circle
                                                size={70}
                                                bg="$background"
                                                elevation="$2"
                                                onPress={() => swiperRef.current?.swipeRight()}
                                                pressStyle={{ opacity: 0.7, scale: 0.95 }}
                                                animation="bouncy"
                                        >
                                                <Heart size={40} color="$pink9" />
                                        </Circle>
                                </YStack>
                        </YStack>
                </YStack>
        );
}
