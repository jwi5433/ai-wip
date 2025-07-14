import { Text, YStack } from "tamagui";
import type { Message } from "@/hooks/useChat";

interface MessageBubbleProps {
  message: Message;
  nextMessage: Message;
}

export function MessageBubble({ message, nextMessage }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const showTimeStamp = !nextMessage || nextMessage.sender !== message.sender;

  return (
    <YStack
      alignSelf={isUser ? "flex-end" : "flex-start"}
      alignItems={isUser ? "flex-end" : "flex-start"}
      maxWidth="85%"
      paddingHorizontal="$5"
      paddingVertical="$2.5"
      gap="$1.5"
    >
      <YStack
        paddingVertical="$3"
        paddingHorizontal="$4"
        backgroundColor={isUser ? "#2B2B2B" : "$brand"}
        borderRadius="$6"
        borderBottomLeftRadius={isUser ? "$6" : 0}
        borderBottomRightRadius={isUser ? 0 : "$6"}
        borderWidth={2}
        borderColor={isUser ? "#3B3B3B" : "$brandHover"}
      >
        <Text
          fontFamily="$body"
          fontSize={16}
          fontWeight="$1"
          color={isUser ? "$foreground" : "black"}
        >
          {message.text}
        </Text>
      </YStack>

      {showTimeStamp && (
        <Text
          fontFamily="$body"
          fontSize="$1"
          color="gray"
          alignSelf={isUser ? "flex-end" : "flex-start"}
        >
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
    </YStack>
  );
}
