import React, { useState } from "react";
import { Card, H2, Image, Paragraph, XStack, YStack } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Heart, X } from "@tamagui/lucide-icons";
import ActionButton from "./ActionButton";
import { TemporaryCharacterData } from "@/lib/services/characterService";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

type ProfileCardProps = {
  card: TemporaryCharacterData;
  onLike: () => void;
  onPass: () => void;
};

export default function ProfileCard({
  card,
  onLike,
  onPass,
}: ProfileCardProps) {
  const [showSummary, setShowSummary] = useState(false);
  const summaryAnimation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(summaryAnimation.value * -120, {
            duration: 300,
          }),
        },
      ],
    };
  });

  const summaryContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(summaryAnimation.value * -120, {
            duration: 300,
          }),
        },
      ],
    };
  });

  if (!card) {
    return null;
  }

  return (
    <Card
      width="98%"
      alignSelf="center"
      height="98%"
      bordered={false}
      br="$6"
      overflow="hidden"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 10 }}
      shadowRadius={25}
      shadowOpacity={0.4}
      elevation={10}
      backgroundColor="$transparent"
      onPress={() => {
        summaryAnimation.value = showSummary ? 0 : 1;
        setShowSummary(!showSummary);
      }}
    >
      <Card.Background>
        <Image
          source={{ uri: card.avatar_url }}
          resizeMode="cover"
          width="100%"
          height="100%"
        />
      </Card.Background>

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(220,106,207,0.6)", "rgba(0,0,0,0.8)"]}
        start={[0.5, 0.35]}
        end={[0.5, 1.5]}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
      />

      <Card.Footer
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$4"
      >
        <Animated.View style={animatedStyle}>
          <XStack
            justifyContent="space-between"
            alignItems="flex-end"
            width="100%"
          >
            <YStack flex={1} gap="$1" paddingBottom="$4">
              <H2
                fontFamily="$heading"
                color="white"
                fontSize="$4"
                fontWeight="$1"
                textShadowColor="rgba(0,0,0,1)"
                textShadowOffset={{ width: 0, height: 2 }}
                textShadowRadius={6}
                textTransform="uppercase"
              >
                {card.name}, {card.age}
              </H2>
              <Paragraph
                fontFamily="$body"
                color="white"
                fontSize="$2"
                fontWeight="$1"
                textShadowColor="rgba(0,0,0,0.7)"
                textShadowOffset={{ width: 0, height: 1 }}
                textShadowRadius={4}
                opacity={0.95}
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                {card.occupation}
              </Paragraph>
            </YStack>
            <XStack gap="$3" alignItems="center">
              <ActionButton
                icon={X}
                onPress={onPass}
                backgroundColor="$card"
                borderColor="$border"
                iconColor="$foreground"
                size="large"
              />
              <ActionButton
                icon={Heart}
                onPress={onLike}
                backgroundColor="$brand"
                borderColor="$brand"
                iconColor="white"
                size="large"
              />
            </XStack>
          </XStack>
        </Animated.View>
      </Card.Footer>
      <Animated.View
        style={summaryContainerStyle}
        position="absolute"
        bottom={-120}
        left={0}
        right={0}
        p="$4"
      >
        <BlurView
          intensity={40}
          tint="dark"
          style={{ borderRadius: 16, overflow: "hidden" }}
        >
          <YStack
            p="$4"
            jc="center"
            ai="center"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.1)"
            bg="rgba(0,0,0,0.2)"
            paddingHorizontal={32}
          >
            <Paragraph
              fontFamily="$body"
              color="$foreground"
              fontSize="$1"
              fontWeight="$1"
              textAlign="center"
            >
              {card.bio}
            </Paragraph>
          </YStack>
        </BlurView>
      </Animated.View>
    </Card>
  );
}
