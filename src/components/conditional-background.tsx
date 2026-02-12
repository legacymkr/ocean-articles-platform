"use client";

import { useNavbar } from "./navbar-provider";
import { AnimatedBackground } from "./animated-background";

export function ConditionalBackground() {
  const { isFocusMode } = useNavbar();

  // Hide animated background when focus mode is active
  if (isFocusMode) {
    return null;
  }

  return <AnimatedBackground />;
}
