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
  Text,
  useTheme,
  XStack,
  YStack
} from "tamagui";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome1",
      text: "Hey there! Feeling the dark mode vibes? 🌙",
      sender: "bot",
      timestamp: new Date(Date.now() - 2000),
    },
    {
      id: "user1",
      text: "Yeah, looks cool! Let's chat.",
      sender: "user",
      timestamp: new Date(Date.now() - 1000),
    },
    {
      id: "bot1",
      text: "Awesome! What's on your mind?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<RNScrollView>(null);
  const theme = useTheme(); // This will now get the theme from RootLayout's TamaguiProvider

  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (inputText.trim() === "") return;
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = inputText.trim();
    setInputText("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const botResponseText = `You said: "${currentInput}". That's neat! (Simulated Bot)`;
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Failed to get response from AI:", error);
      const errorMessageText =
        error instanceof Error ? error.message : "An unknown error occurred.";
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: `Oops! AI Error: ${errorMessageText}.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender === "user";
    let bubbleBackgroundColor = "";
    let bubbleTextColor = "";

    if (isUser) {
      bubbleBackgroundColor = "$gray6"; // User bubble for dark mode
      bubbleTextColor = "$gray12"; // Light text for user
    } else {
      bubbleBackgroundColor = "$pink9"; // AI girlfriend bubble PINK
      bubbleTextColor = "$white"; // White text for AI
    }

    const alignSelfValue: "flex-start" | "flex-end" = isUser
      ? "flex-end"
      : "flex-start";

    return (
      <Stack // Using Stack as discussed to avoid TypeScript errors
        alignSelf={alignSelfValue}
        backgroundColor={bubbleBackgroundColor}
        paddingHorizontal="$3.5"
        paddingVertical="$2.5"
        borderRadius="$6"
        marginVertical="$1.5"
        maxWidth="80%"
        marginHorizontal="$3"
        {...(Platform.OS === "web"
          ? { boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }
          : { elevation: "$1" })}>
        <Paragraph color={bubbleTextColor} fontSize="$4">
          {message.text}
        </Paragraph>
        <Text
          fontSize="$1"
          color={isUser ? "$gray10" : "$pink2"} // Adjusted timestamp colors for dark theme
          textAlign={isUser ? "right" : "left"}
          marginTop="$1.5">
        </Text>
      </Stack>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingVertical="$3"
        paddingHorizontal="$4"
        borderBottomWidth={1}
        borderBottomColor="$gray4" // Border for dark mode
        alignItems="center"
        jc="center"
        backgroundColor="$backgroundFocus" 
      >
        <YStack alignItems="center" space='$2'>
          <Avatar circular size='$8'>
            <Avatar.Image
              accessibilityLabel="GF"
              src="https://placehold.co/150x150/FFC0CB/8B008B?text=AI"
            />
            <Avatar.Fallback delayMs={300} bc="$pink7" />
          </Avatar>
          <Text fontSize='$4' fontWeight='600' color="$pink9">
            GF
          </Text>
        </YStack>
      </XStack>
      <ScrollView
        ref={scrollViewRef}
        flex={1}
        contentContainerStyle={{ paddingVertical: "$3" }}
        onContentSizeChange={scrollToBottom}>
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
              color={theme.color?.val || "#FFF"} 
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
        borderTopColor="$gray4" // Border for dark mode
        backgroundColor="$backgroundFocus" 
        space="$2.5">
        <Input
          flex={1}
          placeholder="Type your message..."
          placeholderTextColor="$gray10" // Light gray placeholder
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          size="$4"
          borderRadius="$5"
          borderColor="$gray7" // Input border for dark mode
          focusStyle={{ borderColor: "$white9" }} // Keep focus distinct
          paddingLeft="$3"
          color="$color" // Main text color (light)
          backgroundColor="$background" // Input background (dark)
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
            isLoading ? (
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
