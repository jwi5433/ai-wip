// src/hooks/useProfileDeck.ts
import { useState, useEffect, useCallback } from "react";
import {
  saveMatchedCharacter,
  TemporaryCharacterData,
} from "@/lib/services/characterService";
import { supabase } from "@/lib/supabase";

export const useProfileDeck = () => {
  const [profiles, setProfiles] = useState<TemporaryCharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("characters")
        .select("*")
        .eq("is_mock", true)
        .limit(20);
      setProfiles(data || []);
      setIsLoading(false);
    };
    fetchInitial();
  }, []);

  const handleSwipe = useCallback(
    (swipedProfile: TemporaryCharacterData, direction: "left" | "right") => {
      if (direction === "right") {
        console.log(`Liked ${swipedProfile.name}!`);
        console.log(`It's a match with ${swipedProfile.name}!`);
        saveMatchedCharacter(swipedProfile);
      } else {
        console.log(`Passed on ${swipedProfile.name}`);
      }

      setProfiles((currentProfiles) => currentProfiles.slice(1));
    },
    [],
  );

  const currentProfile = profiles[0];
  const nextProfile = profiles[1];

  return {
    currentProfile,
    nextProfile,
    handleSwipe,
    isLoading,
    isDeckEmpty: profiles.length === 0,
  };
};
