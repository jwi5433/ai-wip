import "react-native-get-random-values";
import { supabase } from "@/lib/supabase";
import { AiImage } from "@/lib/services/imageService";
import { GoogleGenAI, Type } from "@google/genai";

const IS_DEV_MODE = true;

const archetypes = [
  "The Artist",
  "The Adventurer",
  "The Intellectual",
  "The Socialite",
  "The Wellness Guru",
  "The Techie",
  "The Musician",
  "The Fashionista",
];
const ethnicities = [
  "Caucasian",
  "Caucasian",
  "Caucasian",
  "Caucasian",
  "Hispanic",
  "East Asian",
  "Black",
  "Mixed",
];
const photoStyles = [
  "a cute mirror selfie",
  "a candid laughing photo",
  "a golden hour selfie in a car",
  "a posed photo with a cute outfit",
  "a photo taken while out with friends (cropped)",
  "a selfie with a pet",
];
const settings = [
  "in her stylishly messy bedroom",
  "at a sunny beach",
  "in a trendy, bustling cafe",
  "on a city street at night with neon lights",
  "at an outdoor music event",
  "on a scenic hiking trail overlooking a valley",
];

const genAI = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
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

const getRandomItem = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const shuffleArray = (arr: string[]) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const generateTemporaryCharacter = async (
  ethnicity: string,
): Promise<TemporaryCharacterData | null> => {
  console.log(`Generating new character`);

  const selectedArchetype = getRandomItem(archetypes);
  const selectedPhotoStyle = getRandomItem(photoStyles);
  const selectedSetting = getRandomItem(settings);

  const prompt = `
    Generate a detailed and unique dating profile for a very attractive young woman for a modern American dating app in 2025.

    **Character Archetype:** ${selectedArchetype}. Base her occupation, bio, and personality on this. Give her a "basic American girl" vibe that would be common on an app like Tinder.

    - "name": A single, stylish American first name that fits her archetype.
    - "age": A number between 18 and 29.
    - "occupation": A modern job that fits the "${selectedArchetype}" archetype.
    - "bio": A short, unique bio (2-3 sentences) that reflects her archetype and sounds like a real person on Tinder.
    - "system_instruction": A detailed, first-person paragraph describing her personality based on the "${selectedArchetype}". Define her communication style, sense of humor, and interests.
    - "image_prompt": A highly detailed prompt for an image generator. Create a beautiful, photorealistic image of an attractive "${ethnicity}" woman matching the "${selectedArchetype}" vibe. The photo should be in the style of "${selectedPhotoStyle}" and set in "${selectedSetting}". Ensure it looks like a real, unposed dating app photo.
    `;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            age: { type: Type.INTEGER },
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

    const responseText = result.text;

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
  character: any,
): Promise<Character | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  delete character.id;

  const { data, error } = await supabase
    .from("characters")
    .insert({ ...character, user_id: user.id, is_mock: true })
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

export const generateInitialProfileDeck = async (): Promise<
  TemporaryCharacterData[]
> => {
  console.log("Generating initial 20 profiles...");

  const shuffledEthnicities = shuffleArray(ethnicities);
  const generationPromises = Array(20)
    .fill(null)
    .map((_, index) => {
      const ethnicity = shuffledEthnicities[index % shuffledEthnicities.length];
      return generateTemporaryCharacter(ethnicity);
    });

  try {
    const results = await Promise.all(generationPromises);

    const validCharacters = results.filter(
      (char) => char !== null,
    ) as TemporaryCharacterData[];

    console.log(`Successfully generated ${validCharacters.length} profiles.`);
    return validCharacters;
  } catch (error) {
    console.error("Error generating profile deck:", error);
    return [];
  }
};
