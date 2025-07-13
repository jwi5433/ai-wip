import { YStack, Text } from "tamagui";
import ProfileAvatar from "./ProfileAvatar";

type ProfilePreviewProps = {
  name: string;
  avatarSrc: string;
};

export default function ProfilePreview({
  name,
  avatarSrc,
}: ProfilePreviewProps) {
  return (
    <YStack alignItems="center" space="$2" padding="$2">
      <ProfileAvatar src={avatarSrc} size={128} bordered />
      <Text color="$brand" fontSize="$1" fontFamily="$body" fontWeight="$1">
        {name}
      </Text>
    </YStack>
  );
}
