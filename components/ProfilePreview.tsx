import { YStack, Text } from "tamagui";
import ProfileAvatar from "./ProfileAvatar";

type ProfilePreviewProps = {
  name: string;
  avatarSrc: string;
  size?: number;
};

export default function ProfilePreview({
  name,
  avatarSrc,
  size = 120,
}: ProfilePreviewProps) {
  return (
    <YStack alignItems="center" gap="$1" padding="$6">
      <ProfileAvatar src={avatarSrc} size={120} bordered />
      <Text color="$brand" fontSize="$4" fontFamily="$body" fontWeight="$1">
        {name}
      </Text>
    </YStack>
  );
}
