import { Avatar, TamaguiElement } from "tamagui";
import React from "react";

type ProfileAvatarProps = {
  src: string;
  size?: number;
  bordered?: boolean;
};

const ProfileAvatar = React.forwardRef<TamaguiElement, ProfileAvatarProps>(
  ({ src, size = 50, bordered = false }, ref) => {
    return (
      <Avatar
        circular
        size={size}
        ref={ref}
        borderWidth={bordered ? 2 : 0}
        borderColor={bordered ? "$brand" : undefined}
      >
        <Avatar.Image source={{ uri: src }} />
        <Avatar.Fallback backgroundColor="$brand" />
      </Avatar>
    );
  },
);

export default ProfileAvatar;
