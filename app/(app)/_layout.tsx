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
                        }}
                >
                        <Stack.Screen
                                name="index"
                                options={{
                                        title: "Discover",
                                        headerRight: () => (
                                                <Link href="/matches" asChild>
                                                        <Pressable>
                                                                <MessageSquare
                                                                        color="$color"
                                                                        size="$2"
                                                                />
                                                        </Pressable>
                                                </Link>
                                        ),
                                }}
                        />
                        <Stack.Screen name="matches" options={{ title: "Matches" }} />
                        <Stack.Screen name="chat" options={{ title: "Chat" }} />
                        <Stack.Screen name="account" />
                </Stack>
        );
}
