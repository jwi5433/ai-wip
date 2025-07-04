import { GEMINI_API_KEY } from "@env";
import { Content, GoogleGenAI, GoogleGenAIOptions } from "@google/genai";

const options: GoogleGenAIOptions = { apiKey: GEMINI_API_KEY as string };
const genAI = new GoogleGenAI(options);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const userMessage: Content = { role: "user", parts: [{ text: message }] };
    const contentsForApi = [...chat.history, userMessage];

    // The generateContent call is now correct, without the invalid 'generationConfig'
    const result = await model.generateContent({
      contents: contentsForApi,
    });

    // This correctly accesses the response text, avoiding the '.response' error
    const responseText = result.response.text();

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

// This function is no longer needed here as it was for JSON mode,
// which is handled in characterService.ts now.
// If you need a simple, single response, you can use a simplified version:

export async function generateSingleResponse(
  prompt: string,
): Promise<string | undefined> {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error in generateSingleResponse:", error);
    return undefined;
  }
}
