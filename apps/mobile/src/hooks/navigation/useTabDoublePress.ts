import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export function useTabDoublePress(callback: () => void) {
  const navigation = useNavigation();
  
  useEffect(() => {
    const unsubscribe = navigation.addListener("tabDoublePress" as any, () => {
      callback();
    });
    return unsubscribe;
  }, [navigation, callback]);
}

