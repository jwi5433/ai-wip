import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";
import { MessageSquare } from "@tamagui/lucide-icons";
import { useTheme } from "tamagui";

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background.val },
        headerTintColor: theme.color.val,
        headerShadowVisible: false, // Removes separator line for all screens
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // This completely hides the header for the main swiping screen
          headerShown: false,
        }}
      />
      <Stack.Screen name="matches" options={{ title: "Matches" }} />
      <Stack.Screen name="chat" options={{ title: "Chat" }} />
      <Stack.Screen name="Account" />
    </Stack>
  );
}
