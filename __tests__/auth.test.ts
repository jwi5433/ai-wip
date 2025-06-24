import { EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from "@env";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY
);

describe("Authentication", () => {
  const email = `test-${Date.now()}@example.com`;
  const password = "password123";

  it("should allow a new user to sign up", async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
  });

  it("should allow a user to sign in and sign out", async () => {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    expect(signInError).toBeNull();
    expect(signInData.session).toBeDefined();

    const { error: signOutError } = await supabase.auth.signOut();
    expect(signOutError).toBeNull();
  });
});
