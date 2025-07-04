import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  Avatar,
  H3,
  ListItem,
  Paragraph,
  Separator,
  YGroup,
  YStack,
} from "tamagui";

import {
  Character,
  fetchMatchedCharacters,
} from "../../lib/services/characterService";

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      const matchedCharacters = await fetchMatchedCharacters();
      setMatches(matchedCharacters);
      setLoading(false);
    };

    loadMatches();
  }, []);

  if (loading) {
    return (
      <YStack f={1} jc="center" ai="center">
        <ActivityIndicator />
      </YStack>
    );
  }

  if (matches.length === 0) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4" gap="$3">
        <H3>No Matches Yet</H3>
        <Paragraph col="$gray10" ta="center">
          Go back and swipe right on some profiles to get started!
        </Paragraph>
      </YStack>
    );
  }

  return (
    <YStack f={1} p="$4">
      <H3 mb="$4">Matches</H3>
      <YGroup als="center" bordered>
        {matches.map((character, index) => (
          <React.Fragment key={character.id}>
            <Link
              href={{
                pathname: "/chat",
                params: {
                  name: character.name,
                  avatarUrl: character.avatar_url,
                  systemInstruction: character.system_instruction,
                  imagePrompt: character.image_prompt,
                },
              }}
              asChild
            >
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={character.name}
                  subTitle="Say hi to start the conversation!"
                  icon={
                    <Avatar circular size="$6">
                      <Avatar.Image src={character.avatar_url} />
                      <Avatar.Fallback bc="pink" />
                    </Avatar>
                  }
                />
              </YGroup.Item>
            </Link>
            {/* CORRECTED: Use the standalone <Separator /> component */}
            {index < matches.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </YGroup>
    </YStack>
  );
}
