import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen
        name="messages"
        options={{ title: "Matches", headerShown: false }}
      />
      <Stack.Screen
        name="chat"
        options={{ title: "Chat", headerShown: false }}
      />
    </Stack>
  );
}
