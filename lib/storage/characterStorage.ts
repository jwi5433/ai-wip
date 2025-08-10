// lib/storage/characterStorage.ts
import { getUserStorage, StorageKeys } from "./mmkv";
import { supabase } from "@/lib/supabase";

export interface StoredCharacter {
  id: string;
  name: string;
  avatar_url: string;
  system_instruction: string;
  image_prompt: string;
  bio: string;
  occupation: string;
  age: number;
  cached_at: number;
}

export interface StoredMatch {
  id: string;
  name: string;
  avatar_url: string;
  matched_at: number;
  last_message: string | null;
  last_message_time: number | null;
  unread_count: number;
}

export interface StoredMessage {
  id: string;
  character_id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string;
  created_at: number;
}

export class CharacterStorage {
  private storage: any;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.storage = getUserStorage(userId);
  }

  getMatches(): StoredMatch[] {
    try {
      const matches = this.storage.getString(StorageKeys.MATCHES);
      const parsed = matches ? JSON.parse(matches) : [];
      console.log("Loading matches from MMKV:", parsed.length, "matches");
      return parsed;
    } catch (error) {
      console.error("Error getting matches:", error);
      return [];
    }
  }

  saveMatches(matches: StoredMatch[]): void {
    try {
      this.storage.set(StorageKeys.MATCHES, JSON.stringify(matches));
    } catch (error) {
      console.error("Error saving matches:", error);
    }
  }

  addMatch(character: any): void {
    console.log("ADDING MATCH TO MMKV:", character.name);
    const matches = this.getMatches();
    console.log("Current matches count:", matches.length);

    const newMatch: StoredMatch = {
      id: character.id,
      name: character.name,
      avatar_url: character.avatar_url,
      matched_at: Date.now(),
      last_message: null,
      last_message_time: null,
      unread_count: 0,
    };

    matches.unshift(newMatch);
    this.saveMatches(matches);
    console.log("Match saved to MMKV:", character.name);

    this.storeCharacter(character);
  }

  updateMatchMessage(
    characterId: string,
    message: string,
    isFromUser: boolean,
  ): void {
    const matches = this.getMatches();
    const matchIndex = matches.findIndex((m) => m.id === characterId);

    if (matchIndex !== -1) {
      matches[matchIndex].last_message = message;
      matches[matchIndex].last_message_time = Date.now();

      if (!isFromUser) {
        matches[matchIndex].unread_count += 1;
      }

      this.saveMatches(matches);
    }
  }

  markMatchAsRead(characterId: string): void {
    const matches = this.getMatches();
    const matchIndex = matches.findIndex((m) => m.id === characterId);

    if (matchIndex !== -1) {
      matches[matchIndex].unread_count = 0;
      this.saveMatches(matches);
    }
  }

  storeCharacter(character: any): void {
    try {
      const storedCharacter: StoredCharacter = {
        id: character.id,
        name: character.name,
        avatar_url: character.avatar_url,
        system_instruction: character.system_instruction,
        image_prompt: character.image_prompt,
        bio: character.bio,
        occupation: character.occupation,
        age: character.age,
        cached_at: Date.now(),
      };

      this.storage.set(
        StorageKeys.getCharacter(character.id),
        JSON.stringify(storedCharacter),
      );
    } catch (error) {
      console.error("Error storing character:", error);
    }
  }

  getCharacter(characterId: string): StoredCharacter | null {
    try {
      const character = this.storage.getString(
        StorageKeys.getCharacter(characterId),
      );
      return character ? JSON.parse(character) : null;
    } catch (error) {
      console.error("Error getting character:", error);
      return null;
    }
  }

  getRecentMessages(characterId: string, limit: number = 50): StoredMessage[] {
    try {
      const messages = this.storage.getString(
        StorageKeys.getMessages(characterId),
      );
      const allMessages = messages ? JSON.parse(messages) : [];
      return allMessages.slice(-limit);
    } catch (error) {
      console.error("Error getting recent messages:", error);
      return [];
    }
  }

  addMessage(characterId: string, message: StoredMessage): void {
    try {
      const messages = this.getRecentMessages(characterId, 100);
      messages.push(message);

      const toStore = messages.slice(-100);

      this.storage.set(
        StorageKeys.getMessages(characterId),
        JSON.stringify(toStore),
      );

      const isFromUser = message.role === "user";
      this.updateMatchMessage(characterId, message.content, isFromUser);
    } catch (error) {
      console.error("Error adding message:", error);
    }
  }

  async loadOlderMessages(
    characterId: string,
    beforeTimestamp: number,
    limit: number = 20,
  ): Promise<StoredMessage[]> {
    try {
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("character_id", characterId)
        .eq("user_id", this.userId)
        .lt("created_at", new Date(beforeTimestamp).toISOString())
        .order("created_at", { ascending: false })
        .limit(limit);

      if (messages) {
        return messages
          .map((msg) => ({
            id: msg.id,
            character_id: msg.character_id,
            role: msg.role,
            content: msg.content,
            image_url: msg.image_url,
            created_at: new Date(msg.created_at).getTime(),
          }))
          .reverse();
      }
      return [];
    } catch (error) {
      console.error("Error loading older messages:", error);
      return [];
    }
  }

  async restoreRecentMessages(characterId: string): Promise<void> {
    try {
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("character_id", characterId)
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (messages) {
        const storedMessages = messages
          .map((msg) => ({
            id: msg.id,
            character_id: msg.character_id,
            role: msg.role,
            content: msg.content,
            image_url: msg.image_url,
            created_at: new Date(msg.created_at).getTime(),
          }))
          .reverse();

        this.storage.set(
          StorageKeys.getMessages(characterId),
          JSON.stringify(storedMessages),
        );
      }
    } catch (error) {
      console.error("Error restoring recent messages:", error);
    }
  }

  async syncWithDatabase(): Promise<void> {
    try {
      console.log("Syncing with database...");

      const { data: dbMatches } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", this.userId);

      if (dbMatches) {
        const localMatches = this.getMatches();
        const localMatchIds = new Set(localMatches.map((m) => m.id));

        for (const dbMatch of dbMatches) {
          if (!localMatchIds.has(dbMatch.id)) {
            this.addMatch(dbMatch);
            await this.restoreRecentMessages(dbMatch.id);
          } else {
            this.storeCharacter(dbMatch);
          }
        }
      }

      this.storage.set(StorageKeys.LAST_SYNC, Date.now());
      console.log("Sync completed");
    } catch (error) {
      console.error("Error syncing with database:", error);
    }
  }

  getLastSyncTime(): number {
    return this.storage.getNumber(StorageKeys.LAST_SYNC) || 0;
  }

  getChatData(characterId: string): {
    character: StoredCharacter | null;
    messages: StoredMessage[];
  } {
    return {
      character: this.getCharacter(characterId),
      messages: this.getRecentMessages(characterId),
    };
  }

  clearAllData(): void {
    this.storage.clearAll();
  }
}

const storageInstances = new Map<string, CharacterStorage>();

export const getCharacterStorage = (userId: string): CharacterStorage => {
  if (!storageInstances.has(userId)) {
    storageInstances.set(userId, new CharacterStorage(userId));
  }
  return storageInstances.get(userId)!;
};
