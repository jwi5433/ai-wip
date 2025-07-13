import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, H4, Separator, YStack } from "tamagui";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {}

  async function updateProfile({}) {}

  async function testDatabaseWrite() {
    if (!session?.user) throw new Error("No user on the session!");

    Alert.alert("Testing Database...", "Attempting to write to tables.");
    setLoading(true);
    try {
      const { data: characterData, error: characterError } = await supabase
        .from("characters")
        .insert({ user_id: session.user.id, name: "Test Character" })
        .select()
        .single();

      if (characterError) throw characterError;
      console.log("Created character:", characterData);

      const { error: messageError } = await supabase.from("messages").insert({
        character_id: characterData.id,
        user_id: session.user.id,
        role: "user",
        content: "This is a test message.",
      });

      if (messageError) throw messageError;

      Alert.alert("Success!", "Successfully wrote to all database tables.");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Database Test Failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack p="$4" space="$3" mt="$4">
      <H4>Account</H4>

      <YStack>{}</YStack>

      <Separator my="$3" />

      <YStack space="$2">
        <Button
          backgroundColor="$green9"
          color="$black"
          onPress={() =>
            updateProfile({ username, website, avatar_url: avatarUrl })
          }
          disabled={loading}
        >
          {loading ? "Loading..." : "Update Profile"}
        </Button>

        <Button
          onPress={testDatabaseWrite}
          disabled={loading}
          variant="outlined"
        >
          Test Database Write
        </Button>

        <Button onPress={() => supabase.auth.signOut()} variant="outlined">
          Sign Out
        </Button>
      </YStack>
    </YStack>
  );
}
