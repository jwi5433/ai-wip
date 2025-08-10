import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Content } from "@google/genai";
import {
  sendMessageToChat,
  startChatWithHistory,
} from "@/lib/services/chatService";
import { AiImage, ImageDataUrl } from "@/lib/services/imageService";
import {
  getCharacterStorage,
  StoredMessage,
  StoredCharacter,
} from "@/lib/storage/characterStorage";

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
  created_at: number;
}

interface UseChatProps {
  characterId: string;
  systemInstruction?: string;
  selfieImagePrompt?: string;
}

export function useChat({
  characterId,
  systemInstruction,
  selfieImagePrompt,
}: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState<StoredCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const chatInstanceRef = useRef<any | null>(null);
  const storageRef = useRef<any>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setIsInitializing(false);
          return;
        }

        storageRef.current = getCharacterStorage(user.id);

        const { character: storedCharacter, messages: storedMessages } =
          await storageRef.current.getChatData(characterId);

        if (storedCharacter) {
          setCharacter(storedCharacter);

          const displayMessages: Message[] = storedMessages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            imageUrl: msg.image_url,
            sender: msg.role === "user" ? "user" : "bot",
            created_at: msg.created_at,
          }));

          setMessages(
            displayMessages.length > 0
              ? displayMessages
              : [
                  {
                    id: "welcome1",
                    text: "Hey",
                    sender: "bot",
                    created_at: Date.now(),
                  },
                ],
          );

          const instruction =
            storedCharacter.system_instruction ||
            systemInstruction ||
            "You are a helpful assistant.";
          chatInstanceRef.current = startChatWithHistory(instruction, []);
        } else {
          await fetchCharacterFromDatabase();
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    if (characterId) {
      initializeChat();
    }
  }, [characterId, systemInstruction]);

  const fetchCharacterFromDatabase = async () => {
    try {
      const { data: characterData } = await supabase
        .from("characters")
        .select("*")
        .eq("id", characterId)
        .single();

      if (characterData && storageRef.current) {
        await storageRef.current.storeCharacter(characterData);

        const storedCharacter: StoredCharacter = {
          id: characterData.id,
          name: characterData.name,
          avatar_url: characterData.avatar_url,
          system_instruction: characterData.system_instruction,
          image_prompt: characterData.image_prompt,
          bio: characterData.bio,
          occupation: characterData.occupation,
          age: characterData.age,
          cached_at: Date.now(),
        };

        setCharacter(storedCharacter);

        const instruction =
          characterData.system_instruction ||
          systemInstruction ||
          "You are a helpful assistant.";
        chatInstanceRef.current = startChatWithHistory(instruction, []);

        await storageRef.current.restoreRecentMessages(characterId);
        const restoredMessages =
          storageRef.current.getRecentMessages(characterId);

        if (restoredMessages.length > 0) {
          const displayMessages: Message[] = restoredMessages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            imageUrl: msg.image_url,
            sender: msg.role === "user" ? "user" : "bot",
            created_at: msg.created_at,
          }));

          setMessages(displayMessages);
        } else {
          setMessages([
            {
              id: "welcome1",
              text: "Hey",
              sender: "bot",
              created_at: Date.now(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching character from database:", error);
    }
  };

  const loadOlderMessages = async () => {
    if (isLoadingOlder || !hasMoreMessages || messages.length === 0) return;

    setIsLoadingOlder(true);
    try {
      const oldestMessage = messages[0];
      if (!oldestMessage || oldestMessage.id === "welcome1") {
        setHasMoreMessages(false);
        setIsLoadingOlder(false);
        return;
      }

      const olderMessages = await storageRef.current.loadOlderMessages(
        characterId,
        oldestMessage.created_at,
        20,
      );

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        const displayMessages: Message[] = olderMessages.map((msg) => ({
          id: msg.id,
          text: msg.content,
          imageUrl: msg.image_url,
          sender: msg.role === "user" ? "user" : "bot",
          created_at: msg.created_at,
        }));

        setMessages((prev) => [...displayMessages, ...prev]);
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const handleSend = async (inputText: string) => {
    if (inputText.trim() === "" || isLoading || !character) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !storageRef.current) return;

    const messageId = `user-${Date.now()}`;
    const timestamp = Date.now();

    const userMessage: Message = {
      id: messageId,
      text: inputText,
      sender: "user",
      created_at: timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const userStoredMessage: StoredMessage = {
      id: messageId,
      character_id: characterId,
      role: "user",
      content: inputText,
      created_at: timestamp,
    };

    storageRef.current.addMessage(characterId, userStoredMessage);

    const { error: userMsgError } = await supabase.from("messages").insert({
      id: messageId,
      character_id: characterId,
      user_id: user.id,
      role: "user",
      content: inputText,
    });

    if (userMsgError) {
      console.error("Error saving user message to DB:", userMsgError);
    }

    const lowercasedInput = inputText.toLowerCase();
    const isImageRequest = imageRequestTriggers.some((trigger) =>
      lowercasedInput.includes(trigger),
    );

    try {
      let botResponse: Message;

      if (isImageRequest) {
        const thinkingMessageId = `bot-thinking-${Date.now()}`;
        const thinkingMessage: Message = {
          id: thinkingMessageId,
          text: "Okay, let me find one for you...",
          sender: "bot",
          created_at: Date.now(),
        };
        setMessages((prev) => [...prev, thinkingMessage]);

        const imageUrl = await AiImage(
          character.image_prompt || selfieImagePrompt || "A selfie",
        );
        const botMessageId = `bot-img-${Date.now()}`;
        const botTimestamp = Date.now();

        botResponse = {
          id: botMessageId,
          imageUrl: imageUrl,
          text: "Here you go.",
          sender: "bot",
          created_at: botTimestamp,
        };

        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== thinkingMessage.id),
          botResponse,
        ]);

        const botStoredMessage: StoredMessage = {
          id: botMessageId,
          character_id: characterId,
          role: "assistant",
          content: "Here you go.",
          image_url: imageUrl,
          created_at: botTimestamp,
        };

        storageRef.current.addMessage(characterId, botStoredMessage);

        await supabase.from("messages").insert({
          id: botMessageId,
          character_id: characterId,
          user_id: user.id,
          role: "assistant",
          content: "Here you go.",
          image_url: imageUrl,
        });
      } else {
        const aiResponseText = await sendMessageToChat(
          chatInstanceRef.current,
          inputText,
        );

        const botMessageId = `bot-txt-${Date.now()}`;
        const botTimestamp = Date.now();

        botResponse = {
          id: botMessageId,
          text: aiResponseText ?? "I'm a little lost...",
          sender: "bot",
          created_at: botTimestamp,
        };

        setMessages((prev) => [...prev, botResponse]);

        const botStoredMessage: StoredMessage = {
          id: botMessageId,
          character_id: characterId,
          role: "assistant",
          content: aiResponseText ?? "I'm a little lost...",
          created_at: botTimestamp,
        };

        storageRef.current.addMessage(characterId, botStoredMessage);

        await supabase.from("messages").insert({
          id: botMessageId,
          character_id: characterId,
          user_id: user.id,
          role: "assistant",
          content: aiResponseText ?? "I'm a little lost...",
        });
      }

      storageRef.current.markMatchAsRead(characterId);
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorBotMessage: Message = {
        id: `bot-err-${Date.now()}`,
        text: "I dont know what to do with my hands.",
        sender: "bot",
        created_at: Date.now(),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    character,
    isLoading,
    isInitializing,
    isLoadingOlder,
    hasMoreMessages,
    handleSend,
    loadOlderMessages,
  };
}
