import { supabase } from '../supabase';
import { generateSingleResponse } from './chatService';
import { AiImage } from './imageService';
import 'react-native-get-random-values'; // Needed for UUID generation

// The Character type remains the same
export interface Character {
        id: number;
        name: string;
        bio: string;
        age: number;
        avatar_url: string; // This can now be a temporary base64 Data URL OR a permanent public URL
        system_instruction: string;
        image_prompt: string;
}

/**
 * Generates a character profile and image in-memory without saving it.
 * @returns A promise that resolves to a Character object with a temporary base64 avatar_url.
 */
export const generateTemporaryCharacter = async (): Promise<Omit<Character, 'id'> | null> => {
        console.log('Generating temporary character...');
        try {
                const minAge = 18;
                const maxAge = 50;
                const random = Math.random();
                const age = Math.floor(minAge + (maxAge - minAge + 1) * (random * random));

                const prompt = `
      You are a creative character designer for a dating sim.
      Your task is to invent a compelling and unique character that is ${age} years old and a girl. The character should feel like a real person a user would find attractive on a modern dating app.

      Use the following guidelines for inspiration. Use these examples as a baseline but try to be creative and fun. Again, do not just copy from these examples. Try to be flirty and how a real dating profile would be.
      - Common Jobs: Nurse, teacher, marketing, graphic designer, social media manager, flight attendant.
      - Common Hobbies/Interests: Yoga, hiking, brunch, their dog, traveling, astrology, watching popular TV shows, trying new coffee shops.
      - Bio Style: Make the bio sound fun, age-appropriate, and approachable. It should be first-person, under 50 words. It could include a question to the user, a list of their favorite things with emojis, or a slightly sarcastic one-liner.

      - "system_instruction" must be a detailed, secret instruction for how the AI should portray this character in a chat. It should match the user-facing bio's personality.
      - "image_prompt" must be a detailed, SFW description for an AI image generator to create a beautiful, realistic picture that looks like it belongs on a real dating profile for a ${age}-year-old. Be creative and make her very attractive and hot.
    `;
                const jsonResponse = await generateSingleResponse(prompt);
                if (!jsonResponse) throw new Error('AI did not return character data.');

                const match = jsonResponse.match(/\{[\s\S]*\}/);
                if (!match) throw new Error("AI response did not contain valid JSON.");

                const cleanedJson = match[0];
                const characterData = JSON.parse(cleanedJson);

                const imageDataUrl = await AiImage(characterData.image_prompt);
                if (!imageDataUrl) throw new Error('Failed to generate character image.');

                const temporaryCharacter = {
                        ...characterData,
                        age: age,
                        avatar_url: imageDataUrl, // The temporary base64 Data URL
                };

                console.log('Successfully generated temporary character:', temporaryCharacter.name);
                return temporaryCharacter;

        } catch (error) {
                console.error('Error in generateTemporaryCharacter:', error);
                return null;
        }
};

/**
 * Permanently saves a matched character.
 * 1. Uploads the avatar to Supabase Storage.
 * 2. Saves the character profile to the 'characters' database table with the permanent URL.
 * @param character The temporary character object with a base64 avatar_url.
 * @returns A promise that resolves when the operation is complete.
 */
export const saveMatchedCharacter = async (character: Omit<Character, 'id'>) => {
        console.log('Saving matched character:', character.name);
        try {
                const {
                        data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error('User not found.');

                // Step 1: Upload the avatar to Supabase Storage
                const response = await fetch(character.avatar_url);
                const blob = await response.blob();
                const fileExt = blob.type.split('/')[1];
                const filePath = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                        .from('characters') // Your bucket name
                        .upload(filePath, blob, { contentType: blob.type });

                if (uploadError) throw uploadError;

                // Step 2: Get the public URL for the newly uploaded file
                const { data: urlData } = supabase.storage
                        .from('characters')
                        .getPublicUrl(filePath);

                if (!urlData) throw new Error('Could not get public URL for avatar.');

                const permanentAvatarUrl = urlData.publicUrl;
                console.log('Avatar uploaded to:', permanentAvatarUrl);

                // Step 3: Save the character to the 'characters' database table
                const { error: insertError } = await supabase.from('characters').insert({
                        user_id: user.id,
                        name: character.name,
                        age: character.age,
                        bio: character.bio,
                        system_instruction: character.system_instruction,
                        image_prompt: character.image_prompt,
                        avatar_url: permanentAvatarUrl, // The new, permanent URL
                });

                if (insertError) throw insertError;

                console.log('Successfully saved character to database.');
                return { ...character, avatar_url: permanentAvatarUrl }; // Return the character with the new URL

        } catch (error) {
                console.error('Error in saveMatchedCharacter:', error);
                return null;
        }
};


/**
 * Fetches all characters that the current user has permanently matched with.
 */
export const fetchMatchedCharacters = async (): Promise<Character[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data, error } = await supabase
                .from('characters')
                .select('*')
                .eq('user_id', user.id);
        if (error) {
                console.error('Error fetching matched characters:', error);
                return [];
        }
        return data || [];
};
