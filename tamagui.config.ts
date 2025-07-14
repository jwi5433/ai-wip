import { createTamagui, createFont, createTokens } from "tamagui";
import { shorthands } from "@tamagui/shorthands";

const silkscreenFont = createFont({
  family: "Silkscreen",
  size: { 1: 12, 2: 16, 3: 24, 4: 30, 6: 36, true: 16 },
  weight: { 1: "400", 2: "700", true: "400" },
  transform: {},
});

export const tokens = createTokens({
  color: {
    pink400: "#DC6ACF",
    zinc950: "#2D2D2D",
    white: "#FFFFFF",
    gray50: "#F9FAFB",
    gray200: "#E5E7EB",
    emerald500: "#10B981",
    red500: "#EF4444",
    fuchsia400: "#C85EBD",
    neutral200: "#E5E5E5",
    neutral900: "#262626",
    zinc800: "#27272A",
    stone900: "#1C1917",
    transparent: "transparent",
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, true: 16 },
  size: {
    0: 0,
    1: 4,
    2: 16,
    3: 12,
    4: 16,
    5: 44,
    6: 52,
    true: 16,
  },
  radius: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 8 },
  zIndex: { 0: 0, 1: 100, true: 0 },
});

export const themes = {
  light: {
    brand: tokens.color.pink400,
    background: tokens.color.gray50,
    foreground: tokens.color.zinc950,
    card: tokens.color.white,
    border: tokens.color.gray200,
    success: tokens.color.emerald500,
    error: tokens.color.red500,
    transparent: tokens.color.transparent,
    shadowColor: tokens.color.zinc950,
  },
  dark: {
    brand: tokens.color.pink400,
    brandHover: tokens.color.fuchsia400,
    background: tokens.color.zinc950,
    foreground: tokens.color.neutral200,
    card: tokens.color.zinc800,
    border: tokens.color.stone900,
    success: tokens.color.emerald500,
    error: tokens.color.red500,
    transparent: tokens.color.transparent,
    shadowColor: tokens.color.zinc950,
  },
};

const config = createTamagui({
  shorthands,
  themes,
  tokens,
  fonts: {
    heading: silkscreenFont,
    body: silkscreenFont,
  },
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
