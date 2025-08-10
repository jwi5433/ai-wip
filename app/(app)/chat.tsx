import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView as RNScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, ScrollView, Text, Theme, XStack, YStack } from "tamagui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useChat } from "@/hooks/useChat";
import { SafeAreaView } from "react-native-safe-area-context";

import { MessageBubble } from "@/components/MessageBubble";
import { InputBar } from "@/components/InputBar";
import { Pressable } from "react-native";
import ProfilePreview from "@/components/ProfilePreview";

export default function ChatPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    characterId: string;
    name?: string;
    avatarUrl?: string;
    systemInstruction?: string;
    imagePrompt?: string;
  }>();

  const {
    messages,
    character,
    isLoading,
    isInitializing,
    isLoadingOlder,
    hasMoreMessages,
    handleSend,
    loadOlderMessages,
  } = useChat({
    characterId: params.characterId,
    systemInstruction: params.systemInstruction,
    selfieImagePrompt: params.imagePrompt,
  });

  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<RNScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    if (!isLoadingOlder) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, isLoadingOlder]);

  const onSendPress = () => {
    if (inputText.trim()) {
      handleSend(inputText);
      setInputText("");
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    if (contentOffset.y <= 50 && hasMoreMessages && !isLoadingOlder) {
      const currentScrollPosition = contentOffset.y;
      const currentContentHeight = contentSize.height;

      loadOlderMessages().then(() => {
        setTimeout(() => {
          const newContentHeight = contentHeight;
          const heightDifference = newContentHeight - currentContentHeight;

          scrollViewRef.current?.scrollTo({
            y: currentScrollPosition + heightDifference,
            animated: false,
          });
        }, 100);
      });
    }
  };

  if (isInitializing) {
    return (
      <Theme name="dark">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#313131" }}>
          <YStack flex={1} jc="center" ai="center">
            <ActivityIndicator size="large" color="#DC6ACF" />
            <Text mt="$4" color="$foreground">
              Loading chat...
            </Text>
          </YStack>
        </SafeAreaView>
      </Theme>
    );
  }

  if (!character) {
    return (
      <Theme name="dark">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#313131" }}>
          <YStack flex={1} jc="center" ai="center" p="$4">
            <Text color="$foreground" textAlign="center">
              Character not found. This chat may have been deleted.
            </Text>
            <Button
              mt="$4"
              onPress={() => router.push("/matches")}
              backgroundColor="$brand"
            >
              Back to Matches
            </Button>
          </YStack>
        </SafeAreaView>
      </Theme>
    );
  }

  return (
    <Theme name="dark">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#313131" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <YStack flex={1} backgroundColor="$background">
            <XStack
              justifyContent="space-between"
              alignItems="flex-start"
              paddingHorizontal="$3"
              paddingVertical="$3"
            >
              <Pressable onPress={() => router.push("/matches")}>
                <YStack
                  width={40}
                  height={40}
                  justifyContent="center"
                  alignItems="center"
                >
                  <ArrowLeft
                    color="$brand"
                    borderWidth={2}
                    borderColor="$brand"
                    borderRadius="$2"
                    size={40}
                  />
                </YStack>
              </Pressable>
              <ProfilePreview
                name={character.name}
                avatarSrc={character.avatar_url}
                borderWidth={2}
              />
              <YStack width={40} />
            </XStack>

            <ScrollView
              ref={scrollViewRef}
              flex={1}
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onContentSizeChange={(width, height) => setContentHeight(height)}
              onLayout={(event) =>
                setScrollHeight(event.nativeEvent.layout.height)
              }
            >
              {isLoadingOlder && (
                <YStack p="$4" ai="center">
                  <ActivityIndicator color="$brand" size="small" />
                  <Text color="$gray10" fontSize="$1" mt="$1">
                    Loading older messages...
                  </Text>
                </YStack>
              )}

              {messages.map((msg, index) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  nextMessage={messages[index + 1]}
                />
              ))}

              {isLoading && (
                <YStack p="$4" ai="center">
                  <ActivityIndicator color="$brand" />
                </YStack>
              )}
            </ScrollView>

            <InputBar
              inputText={inputText}
              setInputText={setInputText}
              onSendPress={onSendPress}
              isLoading={isLoading}
            />
          </YStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Theme>
  );
}
