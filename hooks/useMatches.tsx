import { useEffect, useState } from "react";
import {
  Character,
  fetchMatchedCharacters,
} from "@/lib/services/characterService";

export function useMatches() {
  const [matches, setMatches] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const matchedCharacters = await fetchMatchedCharacters();
        setMatches(matchedCharacters);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  return { matches, loading };
}
