import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, H4, Separator, YStack } from "tamagui";
import { supabase } from "../../lib/supabase"; // Ensure this path is correct

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    // ... no changes to this function
  }

  async function updateProfile(
    {
      /* ... */
    }
  ) {
    // ... no changes to this function
  }

  // **** ADD THIS NEW TEST FUNCTION ****
  async function testDatabaseWrite() {
    if (!session?.user) throw new Error("No user on the session!");

    Alert.alert("Testing Database...", "Attempting to write to tables.");
    setLoading(true);
    try {
      // 1. Attempt to insert a character linked to the current user
      const { data: characterData, error: characterError } = await supabase
        .from("characters")
        .insert({ user_id: session.user.id, name: "Test Character" })
        .select()
        .single();

      if (characterError) throw characterError;
      console.log("Created character:", characterData);

      // 2. Attempt to insert a message linked to that new character
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
      {/* ... The rest of your Account page UI is the same ... */}
      <H4>Account</H4>
      <YStack>{/* ... Email, Username, Website inputs ... */}</YStack>

      <Separator my="$3" />

      <YStack space="$2">
        <Button
          theme="active"
          backgroundColor="$green9"
          color="$black"
          onPress={() =>
            updateProfile({ username, website, avatar_url: avatarUrl })
          }
          disabled={loading}>
          {loading ? "Loading..." : "Update Profile"}
        </Button>

        {/* **** ADD THIS NEW BUTTON FOR TESTING **** */}
        <Button
          onPress={testDatabaseWrite}
          disabled={loading}
          variant="outlined"
          theme="blue">
          Test Database Write
        </Button>

        <Button onPress={() => supabase.auth.signOut()} variant="outlined">
          Sign Out
        </Button>
      </YStack>
    </YStack>
  );
}
