import { Avatar, TamaguiElement } from "tamagui";
import React from "react";

type ProfileAvatarProps = {
  src: string;
  size?: number;
  borderWidth?: number;
};

const ProfileAvatar = React.forwardRef<TamaguiElement, ProfileAvatarProps>(
  ({ src, size = 50, borderWidth = 0 }, ref) => {
    return (
      <Avatar
        circular
        size={size}
        ref={ref}
        borderWidth={borderWidth}
        borderColor={borderWidth > 0 ? "$brand" : undefined}
      >
        <Avatar.Image source={{ uri: src }} />
        <Avatar.Fallback backgroundColor="$brand" />
      </Avatar>
    );
  },
);

export default ProfileAvatar;
