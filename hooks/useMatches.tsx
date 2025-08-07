import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Character {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  occupation: string;
  age: number;
  system_instruction: string;
  image_prompt: string;
}

export function useMatches() {
  const [matches, setMatches] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id);
    setMatches(data || []);
    setLoading(false);
  };

  return { matches, loading };
}

