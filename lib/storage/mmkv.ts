import { MMKV } from "react-native-mmkv";

export const appStorage = new MMKV({
  id: "app-storage",
});

export const getUserStorage = (userId: string) =>
  new MMKV({
    id: `user-${userId}`,
    encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY,
  });

export const StorageKeys = {
  MATCHES: "matches",
  LAST_SYNC: "last_sync",

  getMessages: (characterId: string) => `messages_${characterId}`,
  getCharacter: (characterId: string) => `character_${characterId}`,
} as const;
