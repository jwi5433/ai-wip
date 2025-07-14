import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView as RNScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Avatar,
  Button,
  ScrollView,
  Text,
  Theme,
  XStack,
  YStack,
} from "tamagui";
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
    name: string;
    avatarUrl: string;
    systemInstruction: string;
    imagePrompt: string;
  }>();
  const { messages, isLoading, handleSend } = useChat({
    systemInstruction:
      params.systemInstruction || "You are a helpful assistant.",
    selfieImagePrompt: params.imagePrompt || "A selfie of a person.",
  });
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<RNScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const onSendPress = () => {
    if (inputText.trim()) {
      handleSend(inputText);
      setInputText("");
    }
  };

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
              <Pressable onPress={() => router.push("/messages")}>
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
                name={params.name || "aria"}
                avatarSrc={require("@/assets/images/woman1.png")}
              />
              <YStack width={40} />
            </XStack>
            <ScrollView ref={scrollViewRef} flex={1}>
              {messages.map((msg, index) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  nextMessage={messages[index + 1]}
                />
              ))}
              {isLoading && <ActivityIndicator />}
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
