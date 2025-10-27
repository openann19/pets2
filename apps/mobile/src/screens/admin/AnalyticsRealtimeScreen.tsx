import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { request } from "../../services/api";
import { Theme } from "../../theme/unified-theme";

type Row = { _id: string; count: number };

export default function AnalyticsRealtimeScreen() {
  const [events, setEvents] = useState<Row[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await request<{ events: Row[]; errors: any[] }>("/api/admin/analytics/realtime", { method: "GET" });
      setEvents(data.events || []);
      setErrors(data.errors || []);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchAll(); 
    const id = setInterval(fetchAll, 15000); 
    return () => clearInterval(id); 
  }, []);

  return (
    <View style={S.root} testID="admin-analytics">
      <Text style={S.h1}>Realtime Analytics (last hour)</Text>

      <Text style={S.h2}>Top Events</Text>
      <FlatList
        data={events}
        keyExtractor={(i) => String(i._id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} />}
        renderItem={({ item }) => (
          <View style={S.row}>
            <Text style={S.event}>{item._id}</Text>
            <Text style={S.count}>{item.count}</Text>
          </View>
        )}
      />

      <Text style={S.h2}>Recent Errors</Text>
      <FlatList
        data={errors}
        keyExtractor={(i, idx) => String(i._id ?? idx)}
        renderItem={({ item }) => (
          <View style={S.errorRow}>
            <Text style={S.errorName}>{item.type ?? "Error"}</Text>
            <Text style={S.errorMsg} numberOfLines={2}>{item.message}</Text>
            <Text style={S.errorTs}>{new Date(item.ts).toLocaleTimeString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: "#fff" },
  h1: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  h2: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  event: { fontWeight: "600" },
  count: { fontVariant: ["tabular-nums"] as any },
  errorRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  errorName: { fontWeight: "700" },
  errorMsg: { opacity: 0.8, marginTop: 2 },
  errorTs: { opacity: 0.6, marginTop: 2, fontVariant: ["tabular-nums"] as any },
});

