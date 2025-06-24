import { Session } from "@supabase/supabase-js";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { TamaguiProvider, Theme } from "tamagui";
import { supabase } from "../lib/supabase";
import tamaguiConfig from "../tamagui.config";
import { useColorScheme } from "react-native";

// This is the root layout. It manages the user's session.
export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    // Check for existing session and listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    // If user is not logged in and not in the auth section, redirect to login
    if (!session && !inAuthGroup) {	
      router.replace("/login");
    }
    // If user is logged in and on a login screen, redirect to the main app
    else if (session && inAuthGroup) {
      router.replace("/");
    }

    SplashScreen.hideAsync();
  }, [session, initialized, segments]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme || 'dark'}>
      {!initialized ? (
        null
      ): (
        <Theme name={colorScheme || 'dark'}>
          <Stack screenOptions={{ headerShown: false }}/>
	</Theme>
      )}
    </TamaguiProvider>
  );
};
