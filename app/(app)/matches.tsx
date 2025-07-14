import React from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, XStack, Text, ScrollView, Theme } from "tamagui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useMatches } from "@/hooks/useMatches";

import ProfileAvatar from "@/components/ProfileAvatar";
import ProfilePreview from "@/components/ProfilePreview";

// Mock Data for the UI
const messages = [
  {
    id: "1",
    name: "Megan",
    lastMessage: "You're so annoying...",
    time: "12 MINS",
    avatarSrc: require("@/assets/images/woman1.png"),
  },
  {
    id: "2",
    name: "Britt",
    lastMessage: "I'm completely obsessed...",
    time: "12 MINS",
    avatarSrc: require("@/assets/images/woman2.png"),
  },
];

// This is the corrected MessageRow component
function MessageRow({ name, lastMessage, time, avatarSrc }: any) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push("/chat")}>
      <XStack
        gap="$3"
        alignItems="center"
        paddingHorizontal="$4"
        paddingVertical="$2.5"
      >
        <ProfileAvatar src={avatarSrc} size={64} />
        <YStack flex={1}>
          <Text fontFamily="$body" fontSize="$3" color="$foreground">
            {name}
          </Text>
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$gray10"
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$1" color="$gray10">
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#313131" }}>
        <YStack flex={1} backgroundColor="$background">
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$3"
          >
            <Pressable onPress={() => router.back()}>
              <YStack width={40} height={40} jc="center" ai="center">
                <ArrowLeft color="$color" size={40} />
              </YStack>
            </Pressable>
            <Text fontFamily="$body" fontSize="$2" color="$brand">
              NEW MATCHES
            </Text>
            <YStack width={40} />
          </XStack>

          {/* New Matches Horizontal Scroll */}
          {matches.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              paddingVertical="$2"
            >
              <XStack gap="$3" paddingHorizontal="$4">
                {matches.map((match) => (
                  <ProfilePreview
                    key={match.id}
                    name={match.name}
                    avatarSrc={match.avatar_url}
                    size={80}
                  />
                ))}
              </XStack>
            </ScrollView>
          ) : (
            <Text padding="$4" color="$gray10">
              No new matches yet.
            </Text>
          )}

          {/* Messages Vertical List */}
          <YStack
            borderTopWidth={1}
            borderTopColor="$gray8"
            paddingTop="$2"
            flex={1}
          >
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$foreground"
              paddingHorizontal="$4"
              paddingBottom="$2"
            >
              MESSAGES
            </Text>
            <ScrollView>
              {messages.map((msg) => (
                <MessageRow key={msg.id} {...msg} />
              ))}
            </ScrollView>
          </YStack>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
