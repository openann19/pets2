import { logger } from "@pawfectmatch/core";
import { useCallback, useState } from "react";

export function usePremiumDemoScreen() {
  const [activeDemo, setActiveDemo] = useState<
    "buttons" | "cards" | "animations" | "glass"
  >("buttons");

  const handleButtonPress = useCallback(
    (variant: string) => {
      logger.info(`Pressed ${variant} button`);
    },
    [],
  );

  const handleCardPress = useCallback(
    (variant: string) => {
      logger.info(`Pressed ${variant} card`);
    },
    [],
  );

  const buttonVariants: Array<
    "primary" | "secondary" | "holographic" | "glass" | "outline"
  > = ["primary", "secondary", "holographic", "glass", "outline"];

  const cardVariants: Array<"default" | "glass" | "holographic" | "elevated"> =
    ["default", "glass", "holographic", "elevated"];

  const gradientNames: Array<
    "primary" | "secondary" | "premium" | "sunset" | "ocean"
  > = ["primary", "secondary", "premium", "sunset", "ocean"];

  return {
    activeDemo,
    setActiveDemo,
    handleButtonPress,
    handleCardPress,
    buttonVariants,
    cardVariants,
    gradientNames,
  };
}

