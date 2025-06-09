import { GEMINI_API_KEY } from "@env";
import { Content, GoogleGenAI, GoogleGenAIOptions } from "@google/genai";

const options: GoogleGenAIOptions = { apiKey: GEMINI_API_KEY as string };
const ai = new GoogleGenAI(options);

const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

interface Chat {
  history: Content[];
}

export function startChatWithHistory(
  systemInstruction: string,
  initialHistory: Content[]
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
  message: string
): Promise<string | undefined> {
  try {
    const userMessage: Content = { role: "user", parts: [{ text: message }] };

    const contentsForApi = [...chat.history, userMessage];

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contentsForApi,
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (responseText) {
      const botMessage: Content = {
        role: "model",
        parts: [{ text: responseText }],
      };

      chat.history.push(userMessage, botMessage);
    }

    return responseText;
  } catch (error) {
    console.error("Error sending message to chat:", error);
    return "Oops, I'm having a little trouble thinking right now. Could you try that again? 🥺";
  }
}
