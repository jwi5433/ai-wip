import { GEMINI_API_KEY } from '@env';
import { GoogleGenAI, GoogleGenAIOptions } from '@google/genai';

const options: GoogleGenAIOptions = { apiKey: GEMINI_API_KEY };
const ai = new GoogleGenAI(options);

const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

export async function AiText(prompt: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a cute 19 year old, fun and flirty girl talking to her boyfriend. You just started dating and youre excited to get to know him better and learn and flirt with him."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI text:", error);
    return undefined;
  }
}


