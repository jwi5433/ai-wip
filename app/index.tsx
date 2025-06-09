import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView as RNScrollView,
} from "react-native";
import {
  Avatar,
  Button,
  Input,
  Paragraph,
  ScrollView,
  Stack,
  Image as TamaguiImage,
  Text,
  useTheme,
  XStack,
  YStack,
} from "tamagui";

import { Content } from "@google/genai";
import {
  sendMessageToChat,
  startChatWithHistory,
} from "./services/chatService";
import { AiImage, ImageDataUrl } from "./services/imageService";

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

  useEffect(() => {
    const systemInstruction =
      "You are a cute, fun and flirty girl talking to her boyfriend. You just started dating and youre excited to get to know him better and learn about/flirt with him. You will try not to be too wordy and simulate a text conversation over phone. You will try to accomidate his requests and be fun and enjoyable";
    const initialHistoryForAI: Content[] = messages
      .filter((msg) => msg.text)
      .map((appMsg) => ({
        role: appMsg.sender === "user" ? "user" : "model",
        parts: [{ text: appMsg.text! }],
      }));
    chatInstanceRef.current = startChatWithHistory(
      systemInstruction,
      initialHistoryForAI
    );
  }, []);

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
        const imagePrompt =
          "A selfie that a flirty girlfriend would send to her boyfriend. Extremely cute and beautiful. Photorealistic style, soft natural lighting, close-up or medium shot, high detail.";
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
          console.error("Chat session not initialized.");
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
      console.error("Error processing AI request:", error);
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
    let bubbleBackgroundColor = "";
    let bubbleTextColor = "";

    if (isUser) {
      bubbleBackgroundColor = "$gray6";
      bubbleTextColor = "$gray12";
    } else {
      const isErrorMessage =
        message.text &&
        (message.text.toLowerCase().includes("error") ||
          message.text.toLowerCase().includes("oops") ||
          message.text.toLowerCase().includes("aww, i tried") ||
          message.text.toLowerCase().includes("something went wrong") ||
          message.text.toLowerCase().includes("lost for words") ||
          message.text.toLowerCase().includes("chat not ready"));
      bubbleBackgroundColor = isErrorMessage
        ? "$red9"
        : message.imageUrl
        ? "transparent"
        : "$pink9";
      bubbleTextColor = isErrorMessage
        ? "$white"
        : message.imageUrl && message.text
        ? "$color12"
        : "$white";
    }

    const alignSelfValue: "flex-start" | "flex-end" = isUser
      ? "flex-end"
      : "flex-start";

    return (
      <Stack
        alignSelf={alignSelfValue}
        backgroundColor={bubbleBackgroundColor}
        paddingHorizontal={message.imageUrl && !message.text ? "$0" : "$3.5"}
        paddingVertical={message.imageUrl && !message.text ? "$0" : "$2.5"}
        borderRadius="$6"
        marginVertical="$1.5"
        maxWidth="85%"
        marginHorizontal="$3"
        {...(Platform.OS === "web"
          ? { boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }
          : { elevation: "$1" })}>
        <YStack
          space={message.imageUrl && message.text ? "$2" : "$0"}
          alignItems={isUser ? "flex-end" : "flex-start"}>
          {message.imageUrl && (
            <TamaguiImage
              source={{ uri: message.imageUrl }}
              width={280}
              height={280}
              borderRadius="$5"
            />
          )}
          {message.text && (
            <Paragraph
              color={bubbleTextColor}
              fontSize="$4"
              padding={message.imageUrl && message.text ? "$2" : "$0"}
              backgroundColor={
                message.imageUrl &&
                message.text &&
                bubbleBackgroundColor === "transparent"
                  ? "$backgroundPress"
                  : "transparent"
              }
              borderRadius={
                message.imageUrl &&
                message.text &&
                bubbleBackgroundColor === "transparent"
                  ? "$3"
                  : "$0"
              }>
              {message.text}
            </Paragraph>
          )}
        </YStack>
      </Stack>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
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
              accessibilityLabel="GF"
              src="https://placehold.co/150x150/FFC0CB/8B008B?text=AI"
            />
            <Avatar.Fallback delayMs={300} bc="$pink7" />
          </Avatar>
          <Text fontSize="$4" fontWeight="600" color="$pink9">
            GF
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
        {isLoading && (
          <XStack
            ai="center"
            jc="flex-start"
            p="$2"
            space="$2"
            ml="$3"
            my="$1.5">
            <ActivityIndicator
              size="small"
              color={theme.color?.val || "$gray10"}
            />
            <Paragraph color="$gray10" fontSize="$3">
              Typing...
            </Paragraph>
          </XStack>
        )}
      </ScrollView>
      <XStack
        paddingHorizontal="$3"
        paddingVertical="$2.5"
        alignItems="center"
        borderTopWidth={1}
        borderTopColor="$gray4"
        backgroundColor="$backgroundFocus"
        space="$2.5">
        <Input
          flex={1}
          placeholder="Type your message..."
          placeholderTextColor="$gray10"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          size="$4"
          borderRadius="$5"
          borderColor="$gray7"
          focusStyle={{ borderColor: "$white9" }}
          paddingLeft="$3"
          color="$color"
          backgroundColor="$background"
        />
        <Button
          onPress={handleSend}
          disabled={isLoading || inputText.trim() === ""}
          size="$4"
          borderRadius="$5"
          backgroundColor={
            isLoading || inputText.trim() === "" ? "$gray7" : "$pink9"
          }
          pressStyle={{
            backgroundColor:
              isLoading || inputText.trim() === "" ? "$gray7" : "$pink10",
          }}
          iconAfter={
            isLoading &&
            !imageRequestTriggers.some((trigger: string) =>
              inputText.toLowerCase().includes(trigger)
            ) ? (
              <ActivityIndicator
                color={
                  isLoading || inputText.trim() === ""
                    ? theme.gray10.val
                    : theme.pink1.val
                }
                size="small"
              />
            ) : undefined
          }>
          <Text
            fontWeight="600"
            color={isLoading || inputText.trim() === "" ? "$gray11" : "$black"}>
            Send
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
}
