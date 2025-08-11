import { supabase } from "@/lib/supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { decode } from "base64-arraybuffer";
import { GoogleGenAI, PersonGeneration } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
});

export type ImageDataUrl = string | undefined;

export async function AiImage(prompt: string): Promise<ImageDataUrl> {
  try {
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        personGeneration: PersonGeneration.ALLOW_ALL,
      },
    });

    const generatedImage = response.generatedImages?.[0];
    const imageBytesBase64 = generatedImage?.image?.imageBytes;
    const mimeType = generatedImage?.image?.mimeType || "image/png";

    if (!imageBytesBase64) {
      console.warn("Imagen 3: No image data was generated for the prompt.");
      return undefined;
    }

    const arrayBuffer = decode(imageBytesBase64);

    const fileName = `${uuidv4()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("characters")
      .upload(fileName, arrayBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: mimeType,
      });

    if (uploadError) {
      console.error("Error uploading image to Supabase:", uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("characters")
      .getPublicUrl(fileName);

    console.log("Successfully uploaded image. URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in AiImage service:", error);
    return undefined;
  }
}
