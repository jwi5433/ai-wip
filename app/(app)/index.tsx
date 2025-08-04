import { Pressable } from "react-native";
import { YStack, XStack, Theme } from "tamagui";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { MessageSquare, Settings2 } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileDeck } from "@/components/ProfileDeck";

export default function IndexPage() {
  const router = useRouter();

  return (
    <Theme name="dark">
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
        <YStack flex={1} backgroundColor="$background" paddingHorizontal="$1">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$1"
          >
            <Pressable onPress={() => router.push("/generate")}>
              <Settings2 size={40} color="$brand" />
            </Pressable>
            <Pressable onPress={() => router.push("/matches")}>
              <MessageSquare size={40} color="$brand" />
            </Pressable>
          </XStack>

          <ProfileDeck />
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
