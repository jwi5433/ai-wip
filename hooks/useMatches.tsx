import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCharacterStorage } from "@/lib/storage/characterStorage";

export interface Character {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  occupation: string;
  age: number;
  system_instruction: string;
  image_prompt: string;
  last_message?: string;
  last_message_time?: number;
  unread_count?: number;
}

export function useMatches() {
  const [matches, setMatches] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const storage = getCharacterStorage(user.id);

      const localMatches = storage.getMatches();

      if (localMatches.length > 0) {
        const characterMatches: Character[] = localMatches.map((match) => {
          const character = storage.getCharacter(match.id);
          return {
            id: match.id,
            name: match.name,
            avatar_url: match.avatar_url,
            bio: character?.bio || "",
            occupation: character?.occupation || "",
            age: character?.age || 0,
            system_instruction: character?.system_instruction || "",
            image_prompt: character?.image_prompt || "",
            last_message: match.last_message || undefined,
            last_message_time: match.last_message_time || undefined,
            unread_count: match.unread_count || 0,
          };
        });

        setMatches(characterMatches);
        setLoading(false);

        const lastSync = storage.getLastSyncTime();
        const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

        if (lastSync < sixHoursAgo) {
          storage.syncWithDatabase();
        }
      } else {
        await fetchFromDatabase(storage);
      }
    } catch (error) {
      console.error("Error loading matches:", error);
      setLoading(false);
    }
  }, []);

  const fetchFromDatabase = async (storage: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dbMatches } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id);

      if (dbMatches && dbMatches.length > 0) {
        for (const match of dbMatches) {
          storage.addMatch(match);
        }

        const characterMatches: Character[] = dbMatches.map((match) => ({
          id: match.id,
          name: match.name,
          avatar_url: match.avatar_url,
          bio: match.bio,
          occupation: match.occupation,
          age: match.age,
          system_instruction: match.system_instruction,
          image_prompt: match.image_prompt,
        }));

        setMatches(characterMatches);
      }
    } catch (error) {
      console.error("Error fetching from database:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewMatch = useCallback(async (character: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const storage = getCharacterStorage(user.id);

      const { data: savedCharacter, error } = await supabase
        .from("characters")
        .insert({
          ...character,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving to database:", error);
        return;
      }

      storage.addMatch(savedCharacter);

      const newMatch: Character = {
        id: savedCharacter.id,
        name: savedCharacter.name,
        avatar_url: savedCharacter.avatar_url,
        bio: savedCharacter.bio,
        occupation: savedCharacter.occupation,
        age: savedCharacter.age,
        system_instruction: savedCharacter.system_instruction,
        image_prompt: savedCharacter.image_prompt,
      };

      setMatches((prev) => [newMatch, ...prev]);
    } catch (error) {
      console.error("Error adding new match:", error);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return {
    matches,
    loading,
    addNewMatch,
    refreshMatches: loadMatches,
  };
}
