import { useEffect, useState } from "react";

// You can define a simple Character type here for now
export interface Character {
  id: string;
  name: string;
  avatar_url: any;
}

// Mock Data for the "New Matches" list
const mockMatches: Character[] = [
  { id: "1", name: "Aria", avatar_url: require("@/assets/images/woman1.png") },
  { id: "2", name: "Eowyn", avatar_url: require("@/assets/images/woman2.png") },
  { id: "3", name: "Alita", avatar_url: require("@/assets/images/woman3.png") },
  { id: "4", name: "Girl", avatar_url: require("@/assets/images/woman1.png") },
];

export function useMatches() {
  const [matches, setMatches] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use the mock data instead of fetching from a service
    setMatches(mockMatches);
    setLoading(false);
  }, []);

  return { matches, loading };
}