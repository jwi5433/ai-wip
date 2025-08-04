import React from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, XStack, Text, ScrollView, Theme, Separator } from "tamagui";
import { ArrowLeft, HeartPlus } from "@tamagui/lucide-icons";
import { useMatches } from "@/hooks/useMatches";

import ProfileAvatar from "@/components/ProfileAvatar";
import ProfilePreview from "@/components/ProfilePreview";

const messages = [
  {
    id: "1",
    name: "Megan",
    lastMessage: "You're so annoying...",
    time: "12 MINS",
    avatarSrc: require("@/assets/images/woman1.png"),
    isRead: false,
    system_instruction: "You are Megan, a playful and sarcastic girlfriend. You love to tease and make jokes, but you are also very caring and affectionate. You are a software engineer who loves hiking and trying new restaurants.",
    image_prompt: "A beautiful woman with long brown hair, smiling playfully at the camera. She is wearing a casual outfit and standing in front of a modern building.",
  },
  {
    id: "2",
    name: "Britt",
    lastMessage: "You: What are you doing later",
    time: "12 MINS",
    avatarSrc: require("@/assets/images/woman2.png"),
    isRead: true,
  },
];

function MessageRow({ name, lastMessage, time, avatarSrc, isRead, system_instruction, image_prompt }: any) {
  const router = useRouter();
  const textColor = isRead ? "gray" : "$foreground";
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/chat",
          params: { name, avatarUrl: avatarSrc, systemInstruction: system_instruction, imagePrompt: image_prompt },
        })
      }
    >
      <XStack
        gap="$3"
        alignItems="center"
        paddingHorizontal="$2"
        paddingVertical="$2.5"
      >
        <ProfileAvatar src={avatarSrc} size={64} borderWidth={isRead ? 0 : 2} />
        <YStack flex={1}>
          <Text fontFamily="$body" fontSize="$2" color="$brand">
            {name}
          </Text>
          <Text
            fontFamily="$body"
            fontSize="$1"
            color={textColor}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$1" color={textColor}>
          {time}
        </Text>
      </XStack>
    </Pressable>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const { matches, loading } = useMatches();

  if (loading) {
    return (
      <YStack flex={1} jc="center" ai="center">
        <ActivityIndicator />
      </YStack>
    );
  }

  return (
    <Theme name="dark">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
        <YStack backgroundColor="$background" gap="$3">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="$3"
            paddingTop="$3"
          >
            <Pressable onPress={() => router.navigate("/")}>
              <YStack width={40} height={40} jc="center" ai="center">
                <ArrowLeft color="$brand" size={40} />
              </YStack>
            </Pressable>
            <XStack alignItems="center" gap="$2">
              <HeartPlus color="$brand" size={24} />
              <Text fontFamily="$body" fontSize="$2" color="$brand">
                NEW MATCHES
              </Text>
            </XStack>
            <YStack width={40} />
          </XStack>

          {matches.length > 0 ? (
            <ScrollView
              horizontal
              flex={0}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <XStack gap="$3" alignItems="flex-start">
                {matches.map((match) => (
                  <ProfilePreview
                    key={match.id}
                    name={match.name}
                    avatarSrc={match.avatar_url}
                    size={80}
                    borderWidth={1}
                  />
                ))}
              </XStack>
            </ScrollView>
          ) : (
            <Text padding="$4" color="$foreground">
              No new matches...
            </Text>
          )}
          <Separator />
          <Text
            fontFamily="$heading"
            fontSize="$3"
            color="$brand"
            paddingHorizontal="$3"
          >
            MESSAGES
          </Text>
          <ScrollView>
            {messages.map((msg) => (
              <MessageRow key={msg.id} {...msg} />
            ))}
          </ScrollView>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}