import { GEMINI_API_KEY } from "@env";
import { Content, GoogleGenAI, GoogleGenAIOptions, Type } from "@google/genai";

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

export async function generateSingleResponse(
        prompt: string
): Promise<string | undefined> {
        try {
                const result = await ai.models.generateContent({
                        model: MODEL_NAME, // This uses your "gemini-2.5-flash-preview-05-20"
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        // This config object uses the recommended method from the documentation
                        config: {
                                responseMimeType: "application/json",
                                responseSchema: {
                                        type: Type.OBJECT,
                                        properties: {
                                                name: { type: Type.STRING },
                                                bio: { type: Type.STRING },
                                                system_instruction: { type: Type.STRING },
                                                image_prompt: { type: Type.STRING },
                                        },
                                        required: ["name", "bio", "system_instruction", "image_prompt"],
                                },
                        },
                });

                // As per the documentation, we can now reliably get the text response
                // The 'response' property does not exist; we access the text directly.
                return result.text;

        } catch (error) {
                console.error("Error in generateSingleResponse:", error);
                return undefined;
        }
}
