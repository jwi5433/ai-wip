import { Card, H2, Image, Paragraph, XStack, YStack, useTheme } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Heart, X } from "@tamagui/lucide-icons";
import ActionButton from "./ActionButton";

type ProfileCardProps = {
  name: string;
  age: number;
  occupation: string;
  imageSrc: any;
  onLike?: () => void;
  onPass?: () => void;
};

export default function ProfileCard({
  name,
  age,
  occupation,
  imageSrc,
  onLike,
  onPass,
}: ProfileCardProps) {
  return (
    <Card
      flex={1}
      bordered={false}
      br="$6"
      overflow="hidden"
      maxHeight="80vh"
      minHeight={600}
      width="100%"
      maxWidth={400}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 10 }}
      shadowRadius={25}
      shadowOpacity={0.4}
      elevation={10}
      backgroundColor="$transparent"
    >
      <Card.Background>
        <Image source={imageSrc} width="100%" height="100%" objectFit="cover" />
      </Card.Background>

      <LinearGradient
        colors={[
          "rgba(0,0,0,0)",
          "rgba(0,0,0,0)",
          "rgba(244,114,182,0.4)",
          "rgba(244,114,182,0.7)",
          "rgba(244,114,182,0.9)",
        ]}
        start={[0.5, 0.3]}
        end={[0.5, 1]}
        locations={[0, 0.4, 0.7, 0.85, 1]}
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
        paddingBottom="$4"
      >
        <XStack
          justifyContent="space-between"
          alignItems="flex-end"
          width="100%"
        >
          {/* Text Content */}
          <YStack flex={1} gap="$1">
            <H2
              fontFamily="$heading"
              color="$foreground"
              fontSize="$4"
              fontWeight="$1"
              textShadowColor="rgba(0,0,0,0.8)"
              textShadowOffset={{ width: 0, height: 2 }}
              textShadowRadius={6}
              textTransform="uppercase"
            >
              {name}, {age}
            </H2>
            <Paragraph
              fontFamily="$body"
              color="$foreground"
              fontSize="$2"
              fontWeight="$1"
              textShadowColor="rgba(0,0,0,0.7)"
              textShadowOffset={{ width: 0, height: 1 }}
              textShadowRadius={4}
              opacity={0.95}
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              {occupation}
            </Paragraph>
          </YStack>

          <XStack gap="$3" alignItems="center" marginLeft="$3">
            <ActionButton
              icon={X}
              onPress={onPass || (() => console.log("Pass"))}
              backgroundColor="$card"
              borderColor="$border"
              iconColor="$foreground"
              size="large"
            />
            <ActionButton
              icon={Heart}
              onPress={onLike || (() => console.log("Like"))}
              backgroundColor="$brand"
              borderColor="$brand"
              iconColor="$background"
              size="large"
            />
          </XStack>
        </XStack>
      </Card.Footer>
    </Card>
  );
}
