import "react-native-get-random-values";
import { supabase } from "../supabase";
import { AiImage } from "./imageService";

// This setup matches your working chatService.ts file
import { GEMINI_API_KEY } from "@env";
import { GoogleGenAI, GoogleGenAIOptions, Type } from "@google/genai";

const options: GoogleGenAIOptions = { apiKey: GEMINI_API_KEY as string };
const genAI = new GoogleGenAI(options);
// ---

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
    console.log("Generating new AI character using JSON mode...");

    // THIS IS THE CORRECTED LINE
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create a detailed dating profile for a fictional female person.`;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              age: { type: Type.NUMBER },
              occupation: { type: Type.STRING },
              bio: { type: Type.STRING },
              system_instruction: { type: Type.STRING },
              image_prompt: { type: Type.STRING },
            },
            required: [
              "name",
              "age",
              "occupation",
              "bio",
              "system_instruction",
              "image_prompt",
            ],
          },
        },
      });

      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("AI response was empty.");
      }

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
  console.log("Saving matched character to database:", character.name);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No user logged in to save match.");
    return null;
  }

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
  console.log("Fetching matched characters from database...");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No user logged in to fetch matches.");
    return [];
  }

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
