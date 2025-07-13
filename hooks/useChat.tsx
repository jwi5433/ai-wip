import { useState, useEffect, useRef } from "react";
import { Content } from "@google/genai";
import {
  sendMessageToChat,
  startChatWithHistory,
} from "@/lib/services/chatService";
import { AiImage, ImageDataUrl } from "@/lib/services/imageService";

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

export interface Message {
  id: string;
  text?: string;
  imageUrl?: ImageDataUrl;
  sender: "user" | "bot";
}

interface UseChatProps {
  systemInstruction: string;
  selfieImagePrompt: string;
}

export function useChat({
  systemInstruction,
  selfieImagePrompt,
}: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome1", text: "Hey", sender: "bot" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatInstanceRef = useRef<any | null>(null);

  useEffect(() => {
    chatInstanceRef.current = startChatWithHistory(systemInstruction, []);
  }, [systemInstruction]);

  const handleSend = async (inputText: string) => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const lowercasedInput = inputText.toLowerCase();
    const isImageRequest = imageRequestTriggers.some((trigger) =>
      lowercasedInput.includes(trigger),
    );

    try {
      let botResponse: Message;
      if (isImageRequest) {
        const thinkingMessage: Message = {
          id: `bot-thinking-${Date.now()}`,
          text: "Okay, let me find one for you...",
          sender: "bot",
        };
        setMessages((prev) => [...prev, thinkingMessage]);

        const imageUrl = await AiImage(selfieImagePrompt);
        botResponse = {
          id: `bot-img-${Date.now()}`,
          imageUrl: imageUrl,
          text: "Here you go.",
          sender: "bot",
        };

        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== thinkingMessage.id),
          botResponse,
        ]);
      } else {
        const aiResponseText = await sendMessageToChat(
          chatInstanceRef.current,
          inputText,
        );
        botResponse = {
          id: `bot-txt-${Date.now()}`,
          text: aiResponseText ?? "I'm a little lost...",
          sender: "bot",
        };
        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorBotMessage: Message = {
        id: `bot-err-${Date.now()}`,
        text: "I dont know what to do with my hands.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleSend };
}
