import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView as RNScrollView
} from "react-native";
import {
  Avatar,
  ScrollView,
  Stack,
  Text,
  useTheme,
  XStack,
  YStack
} from "tamagui";

import { Content } from "@google/genai";
import {
  sendMessageToChat,
  startChatWithHistory,
} from "../../lib/services/chatService";
import { AiImage, ImageDataUrl } from "../../lib/services/imageService";

const imageRequestTriggers: string[] = [
  "send me a picture",
  "send a pic",
  "send a photo",
  "share a picture",
  "can i see a picture",
  "show me a pic",
  "got any pics",
  "send an image",
  "picture please",
  "photo please",
  "picture",
  "pic",
  "what are you wearing",
  "show me",
];

interface Message {
  id: string;
  text?: string;
  imageUrl?: ImageDataUrl;
  sender: "user" | "bot";
}

export default function ChatPage() {
  // 1. USE THE HOOK TO GET DATA PASSED FROM THE PREVIOUS SCREEN
  const params = useLocalSearchParams<{
    name: string;
    avatarUrl: string;
    systemInstruction: string;
    imagePrompt: string;
  }>();

  // 2. EXTRACT THE DATA INTO VARIABLES (with fallbacks just in case)
  const characterName = params.name || "GF";
  const characterAvatar =
    params.avatarUrl || "https://placehold.co/150x150/FFC0CB/8B008B?text=AI";
  const systemInstruction =
    params.systemInstruction || "You are a helpful assistant.";
  const selfieImagePrompt = params.imagePrompt || "A selfie of a person.";

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome1", text: "Heyy", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<RNScrollView>(null);
  const theme = useTheme();
  const chatInstanceRef = useRef<any | null>(null);

  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // 3. UPDATE THE CHAT INITIALIZATION TO USE THE NEW PERSONALITY
  useEffect(() => {
    const initialHistoryForAI: Content[] = messages
      .filter((msg) => msg.text)
      .map((appMsg) => ({
        role: appMsg.sender === "user" ? "user" : "model",
        parts: [{ text: appMsg.text! }],
      }));
    // The systemInstruction now comes from the params!
    chatInstanceRef.current = startChatWithHistory(
      systemInstruction,
      initialHistoryForAI
    );
  }, [systemInstruction]); // Dependency array updated to re-initialize chat for new characters

  const handleSend = async () => {
    if (inputText.trim() === "") return;
    const userInputText = inputText.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: userInputText,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const lowercasedInput = userInputText.toLowerCase();
    setInputText("");
    setIsLoading(true);
    const isImageRequest = imageRequestTriggers.some((trigger) =>
      lowercasedInput.includes(trigger)
    );
    let preliminaryBotMessageId: string | null = null;

    try {
      if (isImageRequest) {
        const imagePrompt = `A new selfie based on this description: ${selfieImagePrompt}. The person should look happy.`;
        const thinkingMessage: Message = {
          id: `bot-thinking-${Date.now()}`,
          text: "Okay, let me find a cute one for you... 😉",
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, thinkingMessage]);
        preliminaryBotMessageId = thinkingMessage.id;
        const generatedImageUrl = await AiImage(imagePrompt);
        let finalBotMessage: Message;

        if (generatedImageUrl) {
          finalBotMessage = {
            id: `bot-img-${Date.now()}`,
            imageUrl: generatedImageUrl,
            text: "Here you go! What do you think? 😘",
            sender: "bot",
          };
        } else {
          finalBotMessage = {
            id: `bot-img-err-${Date.now()}`,
            text: "Aww, I tried to get a pic but something went wrong! 🥺 Maybe later?",
            sender: "bot",
          };
        }
        setMessages((prevMessages) =>
          prevMessages
            .filter((msg) => msg.id !== preliminaryBotMessageId)
            .concat(finalBotMessage)
        );
      } else {
        if (!chatInstanceRef.current) {
          const errorMsg: Message = {
            id: `err-${Date.now()}`,
            text: "Chat not ready, please try again.",
            sender: "bot",
          };
          setMessages((prev) => [...prev, errorMsg]);
          setIsLoading(false);
          return;
        }
        const aiResponseText = await sendMessageToChat(
          chatInstanceRef.current,
          userInputText
        );
        const botTextMessage: Message = {
          id: `bot-txt-${Date.now()}`,
          text:
            aiResponseText ??
            "Hmm, I'm a little lost for words right now... Try again? 😅",
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, botTextMessage]);
      }
    } catch (error) {
      const errorBotMessage: Message = {
        id: `bot-catch-err-${Date.now()}`,
        text: "Oops, something went a bit haywire on my end! 😵‍💫 Let's try that again.",
        sender: "bot",
      };
      if (preliminaryBotMessageId) {
        setMessages((prevMessages) =>
          prevMessages
            .filter((msg) => msg.id !== preliminaryBotMessageId)
            .concat(errorBotMessage)
        );
      } else {
        setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
      }
    }
    setIsLoading(false);
    queueMicrotask(() => {
      scrollToBottom();
    });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender === "user";
    // ... (This component's code remains the same, no changes needed here)
    return <Stack>...</Stack>;
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 5. UPDATE THE HEADER TO SHOW THE NEW AVATAR AND NAME */}
      <XStack
        paddingVertical="$3"
        paddingHorizontal="$4"
        borderBottomWidth={1}
        borderBottomColor="$gray4"
        alignItems="center"
        jc="center"
        backgroundColor="$backgroundFocus">
        <YStack alignItems="center" space="$2">
          <Avatar circular size="$8">
            <Avatar.Image
              accessibilityLabel={characterName}
              src={characterAvatar}
            />
            <Avatar.Fallback delayMs={300} bc="$pink7" />
          </Avatar>
          <Text fontSize="$4" fontWeight="600" color="$pink9">
            {characterName}
          </Text>
        </YStack>
      </XStack>

      <ScrollView
        ref={scrollViewRef}
        flex={1}
        contentContainerStyle={{ paddingVertical: "$3" }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <XStack>...</XStack>}
      </ScrollView>

      <XStack
        paddingHorizontal="$3"
        paddingVertical="$2.5"
        alignItems="center"
        borderTopWidth={1}
        borderTopColor="$gray4"
        backgroundColor="$backgroundFocus"
        space="$2.5">
        {/* ... (Input bar remains the same) ... */}
      </XStack>
    </YStack>
  );
}

