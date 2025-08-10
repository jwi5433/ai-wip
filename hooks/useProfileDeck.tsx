import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCharacterStorage } from "@/lib/storage/characterStorage";

interface ProfileCharacter {
  id: string;
  name: string;
  occupation: string;
  bio: string;
  age: number;
  avatar_url: string;
  system_instruction: string;
  image_prompt: string;
  is_mock: boolean;
}

export const useProfileDeck = () => {
  const [profiles, setProfiles] = useState<ProfileCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialProfiles();
  }, []);

  const fetchInitialProfiles = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const storage = getCharacterStorage(user.id);
      const existingMatches = storage.getMatches();
      const matchedIds = existingMatches.map((match) => match.id);

      let query = supabase
        .from("characters")
        .select("*")
        .eq("is_mock", true)
        .limit(20);

      if (matchedIds.length > 0) {
        query = query.not("id", "in", `(${matchedIds.join(",")})`);
      }

      const { data } = await query;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = useCallback(
    async (swipedProfile: ProfileCharacter, direction: "left" | "right") => {
      try {
        setProfiles((currentProfiles) => currentProfiles.slice(1));

        if (direction === "right") {
          console.log(`Liked ${swipedProfile.name}!`);

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            console.log("NO USER FOUND");
            return;
          }
          console.log("User found:", user.id);

          const storage = getCharacterStorage(user.id);
          console.log("Storage created");

          console.log("Saving to database...");
          const { data: savedCharacter, error } = await supabase
            .from("characters")
            .insert({
              name: swipedProfile.name,
              occupation: swipedProfile.occupation,
              bio: swipedProfile.bio,
              age: swipedProfile.age,
              avatar_url: swipedProfile.avatar_url,
              system_instruction: swipedProfile.system_instruction,
              image_prompt: swipedProfile.image_prompt,
              user_id: user.id,
              is_mock: true,
            })
            .select()
            .single();

          if (error) {
            console.log("Database error:", error);
            return;
          }

          console.log("Saved to database:", savedCharacter.name);

          console.log("Saving to MMKV...");
          storage.addMatch(savedCharacter);
          console.log("Should be saved to MMKV now");
        }

        if (profiles.length <= 5) {
          await loadMoreProfiles();
        }
      } catch (error) {
        console.error("Error handling swipe:", error);
      }
    },
    [profiles.length],
  );
  const loadMoreProfiles = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const storage = getCharacterStorage(user.id);
      const existingMatches = storage.getMatches();
      const matchedIds = existingMatches.map((match) => match.id);

      const currentProfileIds = profiles.map((p) => p.id);
      const excludeIds = [...matchedIds, ...currentProfileIds];

      let query = supabase
        .from("characters")
        .select("*")
        .eq("is_mock", true)
        .limit(10);

      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data } = await query;

      if (data && data.length > 0) {
        setProfiles((current) => [...current, ...data]);
      }
    } catch (error) {
      console.error("Error loading more profiles:", error);
    }
  };

  const currentProfile = profiles[0];
  const nextProfile = profiles[1];

  return {
    currentProfile,
    nextProfile,
    handleSwipe,
    isLoading,
    isDeckEmpty: profiles.length === 0 && !isLoading,
    profilesRemaining: profiles.length,
  };
};
