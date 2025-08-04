import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { YStack, Text, Theme, Button } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateInitialProfileDeck } from "@/lib/services/characterService";
import { supabase } from "@/lib/supabase";

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeedDatabase = async () => {
    setMessage("");
    setIsLoading(true);
    console.log("--- STARTING MOCK DATA SEEDING ---");

    // NOTE: You must set IS_DEV_MODE = false in characterService.ts before running this.
    const profilesToSeed = await generateInitialProfileDeck();

    if (!profilesToSeed || profilesToSeed.length === 0) {
      setMessage("Failed to generate profiles. Check characterService.");
      setIsLoading(false);
      return;
    }

    const profilesForDb = profilesToSeed.map((p) => ({
      name: p.name,
      bio: p.bio,
      occupation: p.occupation,
      system_instruction: p.system_instruction,
      image_prompt: p.image_prompt,
      avatar_url: p.avatar_url,
      age: p.age,
      is_mock: true,
    }));

    const { error } = await supabase.from("characters").insert(profilesForDb);

    if (error) {
      setMessage(`Error seeding database: ${error.message}`);
      console.error("Error seeding database:", error);
    } else {
      setMessage(
        `Successfully seeded database with ${profilesForDb.length} mock profiles.`,
      );
      console.log("--- DATABASE SEEDING COMPLETE ---");
    }

    setIsLoading(false);
  };

  return (
    <Theme name="dark">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
        <YStack flex={1} p="$4" gap="$4">
          <Text fontSize="$6" color="$foreground">
            Developer Tools
          </Text>

          <Button
            onPress={handleSeedDatabase}
            disabled={isLoading}
            backgroundColor="$brand"
            color="white"
            size="$5"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              "Seed Database with 20 Mock Profiles"
            )}
          </Button>

          {message && (
            <Text color="$gray10" mt="$4">
              {message}
            </Text>
          )}
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
