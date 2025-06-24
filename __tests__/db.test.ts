import { EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from "@env";
import { createClient } from "@supabase/supabase-js";

// This is the public client, just like in your app
const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY
);

describe("Database Rules", () => {
  beforeAll(async () => {
    // Before the test, we sign up and sign in a new user
    const email = `db-test-${Date.now()}@example.com`;
    const password = "password123";

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      { email, password }
    );
    if (signUpError) throw new Error("Sign-up failed for database test setup.");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw new Error("Sign-in failed for database test setup.");
  });

  it("should let a logged-in user insert a character and a message", async () => {
    // First, get the logged-in user's details
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).toBeDefined();

    // 1. Attempt to insert a character as the logged-in user
    const { data: character, error: characterError } = await supabase
      .from("characters")
      .insert({ user_id: user.id, name: "Test Character" })
      .select()
      .single();

    // This will only pass if your RLS policy is correct
    expect(characterError).toBeNull();
    expect(character).toBeDefined();

    // 2. Attempt to insert a message as the logged-in user
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        character_id: character.id,
        user_id: user.id,
        role: "user",
        content: "This is a test message.",
      })
      .select()
      .single();

    // This will also only pass if your RLS policy is correct
    expect(messageError).toBeNull();
    expect(message).toBeDefined();
  });
});
