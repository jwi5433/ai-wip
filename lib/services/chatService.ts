import { GoogleGenAI, Content } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
});

const CONVERSATION_WINDOW_SIZE = 10;

export interface Chat {
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
      parts: [{ text: "Okay, I got it! I'm ready. Let's chat!" }],
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
    const fullHistory = chat.history;
    let historyForAPI: Content[] = fullHistory;

    if (fullHistory.length > CONVERSATION_WINDOW_SIZE + 2) {
      historyForAPI = [
        fullHistory[0],
        fullHistory[1],
        ...fullHistory.slice(-CONVERSATION_WINDOW_SIZE),
      ];
    }

    const conversationForAPI: Content[] = [
      ...historyForAPI,
      { role: "user", parts: [{ text: message }] },
    ];

    const model = genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationForAPI,
    });

    const result = await model;
    return result.text;
  } catch (error) {
    console.error("Error sending message to chat:", error);
    return "Oh no, I'm having a little trouble thinking right now. Could you try that again? 🥺";
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

    return result.text;
  } catch (error) {
    console.error("Error in generateSingleResponse:", error);
    return undefined;
  }
}
