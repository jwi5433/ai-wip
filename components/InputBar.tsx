import { Button, Input, XStack } from "tamagui";
import { SendHorizontal } from "@tamagui/lucide-icons";

interface InputBarProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendPress: () => void;
  isLoading: boolean;
}

export function InputBar({
  inputText,
  setInputText,
  onSendPress,
  isLoading,
}: InputBarProps) {
  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      gap="$3"
    >
      <Input
        flex={1}
        fontFamily="$body"
        color="$foreground"
        fontWeight="$1"
        value={inputText}
        onChangeText={setInputText}
        placeholder="TYPE A MESSAGE..."
        placeholderTextColor="$foreground"
        borderWidth={2}
        borderColor="#3B3B3B"
        backgroundColor="$card"
        borderRadius="$4"
        onSubmitEditing={onSendPress}
        height="$6"
        focusStyle={{
          borderColor: "$foreground",
          // backgroundColor: "$background",
        }}
        fontSize={inputText ? 16 : 18}
      />
      <Button
        onPress={onSendPress}
        disabled={isLoading || !inputText.trim()}
        icon={<SendHorizontal color="$brand" size={34} />}
        borderWidth={2}
        borderColor="#3B3B3B"
        borderRadius="$3"
        height="$6"
        width="$6"
        backgroundColor="$card"
        pressStyle={{
          borderColor: "$foreground",
          scale: 0.95,
        }}
      />
    </XStack>
  );
}
