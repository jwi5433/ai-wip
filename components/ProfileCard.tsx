import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import {
  H3,
  Image,
  Paragraph,
  Text,
  YStack,
  styled,
  ScrollView,
} from "tamagui";
import { BlurView } from "expo-blur";
// CORRECTED: The path now goes up one level to the root, then into lib.
import { AiImage } from "../lib/services/imageService";

type CardProps = {
  card: {
    name: string;
    age: number;
    occupation: string;
    bio: string;
    image_prompt: string;
  };
};

const StyledLinearGradient = styled(LinearGradient, {
  name: "StyledLinearGradient",
  position: "absolute",
  height: "100%",
  width: "100%",
});

export const ProfileCard = ({ card }: CardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (card?.image_prompt && !imageUrl) {
        setIsLoading(true);
        const generatedUrl = await AiImage(card.image_prompt);
        setImageUrl(generatedUrl || null);
        setIsLoading(false);
      }
    };
    loadImage();
  }, [card]);

  if (!card) return null;

  return (
    <YStack
      f={1}
      br="$6"
      ov="hidden"
      elevation="$2"
      bg="$gray4"
      onPress={() => setIsExpanded(!isExpanded)}
      pressStyle={{ scale: isExpanded ? 1 : 0.995 }}
      animation="bouncy"
    >
      {isLoading ? (
        <YStack f={1} jc="center" ai="center">
          <ActivityIndicator />
        </YStack>
      ) : imageUrl ? (
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} />
      ) : null}

      <StyledLinearGradient
        colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.9)"]}
        style={StyleSheet.absoluteFill}
      />

      <YStack
        p="$4"
        zIndex={1}
        jc="flex-end"
        f={1}
        o={isExpanded ? 0 : 1}
        animation="quick"
      >
        <H3 col="white" fow="bold">
          {card.name},{" "}
          <Text fow="normal" fontSize="$6" col="white">
            {card.age}
          </Text>
        </H3>
        <Paragraph col="$gray1" fow="600">
          {card.occupation}
        </Paragraph>
      </YStack>

      {isExpanded && (
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          jc="center"
          ai="center"
          zIndex={2}
          animation="quick"
          enterStyle={{ o: 0 }}
          o={1}
        >
          <BlurView
            intensity={25}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <ScrollView
            f={1}
            w="100%"
            p="$6"
            contentContainerStyle={{ jc: "center", f: 1 }}
          >
            <Paragraph theme="dark" size="$6" ta="center">
              {card.bio}
            </Paragraph>
          </ScrollView>
        </YStack>
      )}
    </YStack>
  );
};
