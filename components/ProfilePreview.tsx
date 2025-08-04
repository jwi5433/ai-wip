import { YStack, Text } from "tamagui";
import ProfileAvatar from "./ProfileAvatar";

type ProfilePreviewProps = {
  name: string;
  avatarSrc: string;
  size?: number;
  borderWidth?: number;
};

export default function ProfilePreview({
  name,
  avatarSrc,
  size = 120,
  borderWidth,
}: ProfilePreviewProps) {
  return (
    <YStack alignItems="center" gap="$1" paddingHorizontal="$1">
      <ProfileAvatar src={avatarSrc} size={size} borderWidth={borderWidth} />
      <Text color="$brand" fontSize="$4" fontFamily="$body" fontWeight="$1">
        {name}
      </Text>
    </YStack>
  );
}
