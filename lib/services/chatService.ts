import { GEMINI_API_KEY } from "@env";
import { GoogleGenAI, Content } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

interface Chat {
  history: Content[];
}

export function startChatWithHistory(
  systemInstruction: string,
  initialHistory: Content[],
): Chat {
  const instructionalTurn: Content[] = [
    {
      role: "user",
      parts: [{ text: `${systemInstruction}\n\nGot it?` }],
    },
    {
      role: "model",
      parts: [{ text: "Okay, I got it! I'm ready. Let's chat! 😉" }],
    },
  ];

  return {
    history: [...instructionalTurn, ...initialHistory],
  };
}

export async function sendMessageToChat(
  chat: Chat,
  message: string,
): Promise<string | undefined> {
  try {
    const model = genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: "You are a helpful assistant.",
      },
    });

    const result = await model; // Wait for the response from Gemini
    return result.text; // Access the text property directly
  } catch (error) {
    console.error("Error sending message to chat:", error);
    return "Oops, I'm having a little trouble thinking right now. Could you try that again? 🥺";
  }
}

export async function generateSingleResponse(
  prompt: string,
): Promise<string | undefined> {
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text; // Access the text property directly
  } catch (error) {
    console.error("Error in generateSingleResponse:", error);
    return undefined;
  }
}
