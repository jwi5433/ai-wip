import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    // 1. Add this prop to make "no header" the default for this stack.
    <Stack screenOptions={{ headerShown: false }}>
      {/* "index" will now correctly have no header. */}
      <Stack.Screen name="index" />

      {/* 2. You now must explicitly re-enable headers for other screens. */}
      <Stack.Screen
        name="messages"
        options={{ title: "Matches", headerShown: true }}
      />
      <Stack.Screen
        name="chat"
        options={{ title: "Chat", headerShown: true }}
      />
    </Stack>
  );
}
