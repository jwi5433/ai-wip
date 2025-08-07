import React, { useState, useEffect } from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, XStack, Text, ScrollView, Theme, Separator } from "tamagui";
import { ArrowLeft, HeartPlus } from "@tamagui/lucide-icons";
import { useMatches } from "@/hooks/useMatches";
import { supabase } from "@/lib/supabase";

import ProfileAvatar from "@/components/ProfileAvatar";
import ProfilePreview from "@/components/ProfilePreview";

function MessageRow({
  name,
  lastMessage,
  time,
  avatarSrc,
  isRead,
  system_instruction,
  image_prompt,
  characterId,
}: any) {
  const router = useRouter();
  const textColor = isRead ? "gray" : "$foreground";
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/chat",
          params: {
            name,
            avatarUrl: avatarSrc,
            systemInstruction: system_instruction,
            imagePrompt: image_prompt,
            characterId,
          },
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
  const [messageData, setMessageData] = useState<any>({});

  useEffect(() => {
    const checkMessages = async () => {
      if (matches.length === 0) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      for (const match of matches) {
        const { data } = await supabase
          .from("messages")
          .select("content, created_at, role")
          .eq("character_id", match.id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data[0]) {
          setMessageData((prev: any) => ({
            ...prev,
            [match.id]: {
              lastMessage:
                data[0].role === "user"
                  ? `You: ${data[0].content}`
                  : data[0].content,
              time: formatTimeAgo(data[0].created_at),
              isRead: data[0].role === "user",
            },
          }));
        }
      }
    };

    checkMessages();
  }, [matches]);

  const formatTimeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "NOW";
    if (mins < 60) return `${mins} MIN${mins !== 1 ? "S" : ""}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} HOUR${hours !== 1 ? "S" : ""}`;
    return `${Math.floor(hours / 24)} DAYS`;
  };

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
            {matches.map((match) => (
              <MessageRow
                key={match.id}
                name={match.name}
                lastMessage={
                  messageData[match.id]?.lastMessage || "Start chatting..."
                }
                time={messageData[match.id]?.time || "NEW"}
                avatarSrc={match.avatar_url}
                isRead={messageData[match.id]?.isRead ?? true}
                system_instruction={match.system_instruction}
                image_prompt={match.image_prompt}
                characterId={match.id}
              />
            ))}
          </ScrollView>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}

