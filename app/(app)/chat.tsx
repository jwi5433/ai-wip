import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView as RNScrollView, ActivityIndicator } from "react-native";
import {
  Avatar,
  Button,
  Image,
  Input,
  ScrollView,
  Text,
  Theme,
  XStack,
  YStack,
} from "tamagui";
import { ArrowLeft, Send } from "@tamagui/lucide-icons";
import { useChat, Message } from "@/hooks/useChat";
import { SafeAreaView } from "react-native-safe-area-context";

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === "user";
  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$2"
      alignSelf={isUser ? "flex-end" : "flex-start"}
      maxWidth="85%"
    >
      {!isUser && (
        <Avatar circular size="$4" marginRight="$2.5">
          <Avatar.Image
            src={"https://placehold.co/150x150/FFC0CB/8B008B?text=AI"}
          />
          <Avatar.Fallback bc="$brand" />
        </Avatar>
      )}
      <YStack>
        {message.text && (
          <Text
            padding="$3"
            borderRadius="$4"
            backgroundColor={isUser ? "$brand" : "$gray8"}
            color="$foreground"
          >
            {message.text}
          </Text>
        )}
        {message.imageUrl && (
          <Image
            source={{ uri: message.imageUrl, width: 250, height: 250 }}
            style={{ borderRadius: 12, marginTop: message.text ? 8 : 0 }}
          />
        )}
      </YStack>
    </XStack>
  );
};

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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#191919" }}>
        <YStack flex={1} backgroundColor="$background">
          <XStack
            alignItems="center"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderBottomWidth={1}
            borderBottomColor="$gray4"
            space="$3"
          >
            <Button icon={ArrowLeft} chromeless onPress={() => router.back()} />
            <Avatar circular size="$4">
              <Avatar.Image src={params.avatarUrl} />
              <Avatar.Fallback bc="$brand" />
            </Avatar>
            <Text fontSize="$4" fontWeight="600">
              {params.name}
            </Text>
          </XStack>

          <ScrollView
            ref={scrollViewRef}
            flex={1}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <XStack justifyContent="center" padding="$4">
                <ActivityIndicator size="small" color="#E54E77" />
              </XStack>
            )}
          </ScrollView>

          <XStack
            padding="$3"
            alignItems="center"
            space="$3"
            borderTopWidth={1}
            borderTopColor="$gray4"
          >
            <Input
              flex={1}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              onSubmitEditing={onSendPress}
            />
            <Button
              icon={Send}
              onPress={onSendPress}
              disabled={isLoading || !inputText.trim()}
              circular
            />
          </XStack>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
