// tamagui.config.ts
import { config } from "@tamagui/config/v3"; // Using the v3 pre-built config
import { createTamagui } from "tamagui";

// Create the Tamagui config
const tamaguiConfig = createTamagui(config);

// TypeScript type definition for your Tamagui config
export type AppConfig = typeof tamaguiConfig;

// Augment the TamaguiCustomConfig interface
// This allows you to get type-checking and auto-completion for your custom config
declare module "tamagui" {
  // or '@tamagui/core' if you imported createTamagui from there
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
