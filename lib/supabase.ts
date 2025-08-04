import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// This function checks if the code is running on the server.
const isServer = typeof window === "undefined";

// Use AsyncStorage on the client, and a dummy storage object on the server.
const storage = isServer
  ? {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  : AsyncStorage;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage, // Use our new conditional storage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
