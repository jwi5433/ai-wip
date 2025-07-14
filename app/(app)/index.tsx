import { YStack, XStack, useTheme, Text, Theme } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import ProfileCard from "@/components/ProfileCard";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MessageSquare, Settings2 } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const testProfiles = [
  {
    id: 1,
    name: "Emma",
    age: 24,
    occupation: "Marketing Designer",
    imageSrc: require("@/assets/images/woman1.png"),
  },
  {
    id: 2,
    name: "Sophia",
    age: 26,
    occupation: "Software Engineer",
    imageSrc: require("@/assets/images/woman2.png"),
  },
  {
    id: 3,
    name: "Isabella",
    age: 23,
    occupation: "Yoga Instructor",
    imageSrc: require("@/assets/images/woman3.png"),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLike = () => {
    console.log(`Liked ${testProfiles[currentIndex].name}!`);
    if (currentIndex < testProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePass = () => {
    console.log(`Passed on ${testProfiles[currentIndex].name}!`);
    if (currentIndex < testProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const currentProfile = testProfiles[currentIndex];

  return (
    <Theme name="dark">
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <YStack flex={1} backgroundColor="$background" paddingHorizontal="$1">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$1"
          >
            <Pressable>
              <YStack
                width={40}
                height={40}
                justifyContent="center"
                alignItems="center"
              >
                <Settings2 size={40} color="$brand" />
              </YStack>
            </Pressable>

            <Pressable onPress={() => router.push("/messages")}>
              <YStack
                width={40}
                height={40}
                justifyContent="center"
                alignItems="center"
              >
                <MessageSquare size={40} color="$brand" />
              </YStack>
            </Pressable>
          </XStack>

          <YStack flex={1} justifyContent="center" alignItems="center">
            <ProfileCard
              name={currentProfile.name}
              age={currentProfile.age}
              occupation={currentProfile.occupation}
              imageSrc={currentProfile.imageSrc}
              onLike={handleLike}
              onPass={handlePass}
            />
          </YStack>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
