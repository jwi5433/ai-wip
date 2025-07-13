import { useFonts } from "expo-font";
import { Session } from "@supabase/supabase-js";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { supabase } from "@/lib/supabase";
import tamaguiConfig from "@/tamagui.config";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Silkscreen: require("../assets/fonts/Silkscreen-Regular.ttf"),
    "Silkscreen-Bold": require("../assets/fonts/Silkscreen-Bold.ttf"),
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, initialized, fontsLoaded, segments, router]);

  useEffect(() => {
    if (initialized && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [initialized, fontsLoaded]);

  if (!initialized || !fontsLoaded) {
    return null;
  }

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme ?? "dark"}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  );
}
