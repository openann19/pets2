import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduced); }, []);
  return reduced;
};

