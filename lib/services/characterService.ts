import "react-native-get-random-values";
import { supabase } from "../supabase";
import { AiImage } from "./imageService";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "@env";

// Initialize the AI instance with the API key
const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY, // Explicitly pass the API key here
});

export interface Character {
  id: number;
  name: string;
  occupation: string;
  bio: string;
  age: number;
  avatar_url: string;
  system_instruction: string;
  image_prompt: string;
}

export type TemporaryCharacterData = Omit<Character, "id" | "avatar_url"> & {
  avatar_url?: string;
};

export const generateTemporaryCharacter =
  async (): Promise<TemporaryCharacterData | null> => {
    console.log("Generating new AI character...");

    const prompt = `
    Generate a detailed dating profile for a fictional female person.
    YOU MUST RESPOND WITH ONLY A VALID JSON OBJECT, AND NOTHING ELSE.
    The JSON object must have these exact keys: "name", "age", "occupation", "bio", "system_instruction", "image_prompt".
  `;

    try {
      // Use generateContent directly from genAI.models
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
      });

      // Access the response text correctly
      const responseText = result.text; // This should now give you the generated text

      if (!responseText) {
        throw new Error("AI response was empty.");
      }

      // Parse the JSON response
      const characterData = JSON.parse(responseText) as Omit<
        TemporaryCharacterData,
        "avatar_url"
      >;

      console.log("Generating image for:", characterData.name);
      const imageUrl = await AiImage(characterData.image_prompt);

      if (!imageUrl) {
        throw new Error("Failed to generate image for character.");
      }

      return { ...characterData, avatar_url: imageUrl };
    } catch (error) {
      console.error("Error generating temporary character:", error);
      return null;
    }
  };

export const saveMatchedCharacter = async (
  character: TemporaryCharacterData,
): Promise<Character | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("characters")
    .insert({ ...character, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error saving character:", error.message);
    return null;
  }
  return data;
};

export const fetchMatchedCharacters = async (): Promise<Character[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching matches:", error.message);
    return [];
  }
  return data || [];
};
