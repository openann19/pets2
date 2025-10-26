import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { api } from "../services/api";

export function withPremiumGuard<P>(Comp: React.ComponentType<P>) {
  return function PremiumGuard(props: P & { navigation: any }) {
    const [allowed, setAllowed] = React.useState<boolean | null>(null);

    React.useEffect(() => {
      (async () => {
        try {
          const { data } = await api.get("/premium/status");
          setAllowed(!!data.active);
        } catch {
          setAllowed(false);
        }
      })();
    }, []);

    if (allowed === null) return null;
    if (allowed) return <Comp {...props} />;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Premium required</Text>
        <Text style={{ textAlign: "center", marginBottom: 16 }}>
          This feature is available with PawfectMatch Premium.
        </Text>
        <TouchableOpacity onPress={() => props.navigation.navigate("Premium")} style={{ padding: 12, backgroundColor: "#6366f1", borderRadius: 10 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  };
}

