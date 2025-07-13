import { Button } from "tamagui";
import React from "react";

type ActionButtonProps = {
  icon: React.FC<{ size?: number | string; color?: string }>;
  onPress?: () => void;
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  size?: "small" | "medium" | "large";
};

export default function ActionButton({
  icon: Icon,
  onPress,
  backgroundColor = "rgba(255,255,255,0.2)",
  borderColor = "rgba(255,255,255,0.3)",
  iconColor = "white",
  size = "medium",
}: ActionButtonProps) {
  const getSizeProps = () => {
    switch (size) {
      case "small":
        return { width: 44, height: 44, iconSize: 20 };
      case "large":
        return { width: 60, height: 60, iconSize: 28 };
      default:
        return { width: 52, height: 52, iconSize: 24 };
    }
  };

  const { width, height, iconSize } = getSizeProps();

  return (
    <Button
      unstyled
      onPress={onPress}
      width={width}
      height={height}
      borderRadius={999}
      backgroundColor={backgroundColor}
      borderWidth={1.5}
      borderColor={borderColor}
      justifyContent="center"
      alignItems="center"
      pressStyle={{
        scale: 0.92,
        opacity: 0.7,
      }}
      hoverStyle={{
        scale: 1.05,
      }}
      shadowColor="rgba(0,0,0,0.2)"
      shadowOffset={{ width: 0, height: 4 }}
      shadowRadius={12}
      shadowOpacity={0.25}
      elevation={5}
    >
      <Icon size={iconSize} color={iconColor} />
    </Button>
  );
}
