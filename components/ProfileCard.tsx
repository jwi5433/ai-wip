import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { H3, Image, Paragraph, YStack, Text, styled } from 'tamagui';
import { Character } from '../lib/services/characterService';

const StyledLinearGradient = styled(LinearGradient, {
        name: 'StyledLinearGradient',
        position: 'absolute',
        height: '100%',
        width: '100%',
});

export const ProfileCard = ({ card }: { card: Character | null }) => {
        if (!card) {
                return null;
        }

        return (
                // The main card container is now a YStack with Tamagui style props.
                <YStack
                        f={1} // flex={1}
                        br={20} // borderRadius={20}
                        jc="flex-end" // justifyContent="flex-end"
                        bg="$background" // Use theme background color
                        ov="hidden" // overflow="hidden"
                        elevation="$2" // A simple shadow from the theme
                >
                        {/* The Tamagui Image component with absolute positioning */}
                        <Image
                                source={{ uri: card.avatar_url }}
                                pos="absolute"
                                t={0}
                                l={0}
                                r={0}
                                b={0}
                                w="100%"
                                h="100%"
                        />

                        <StyledLinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} />

                        {/* The info container is a YStack with padding */}
                        <YStack p="$4" zIndex={1}>
                                {/* The text components use style props directly */}
                                <H3 col="white" fow="bold">
                                        {card.name},{' '}
                                        <Text fow="normal" fontSize="$6" col="white">
                                                {card.age}
                                        </Text>
                                </H3>
                                <Paragraph
                                        col="white"
                                        mt="$2"
                                        textShadowColor="rgba(0, 0, 0, 0.75)"
                                        textShadowOffset={{ width: -1, height: 1 }}
                                        textShadowRadius={10}
                                >
                                        {card.bio}
                                </Paragraph>
                        </YStack>
                </YStack>
        );
};
