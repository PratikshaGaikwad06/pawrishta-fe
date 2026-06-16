import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RequestCard } from "@/components/RequestCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Tab = "incoming" | "matches" | "sent";

export default function MatchesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { requests, respondToRequest, nearbyDogs } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("incoming");

  const incoming = requests.filter((r) => r.toOwnerId === "me" && r.status === "pending");
  const matched = requests.filter((r) => r.status === "accepted");
  const sent = requests.filter((r) => r.fromOwnerId === "me" && r.status !== "accepted");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "incoming", label: "Requests", count: incoming.length },
    { key: "matches", label: "Matched", count: matched.length },
    { key: "sent", label: "Sent", count: sent.length },
  ];

  const enrichRequest = (r: typeof requests[0]) => {
    if (r.fromDog) return r;
    const dog = nearbyDogs.find((d) => d.id === r.fromDogId);
    return { ...r, fromDog: dog };
  };

  const displayList =
    activeTab === "incoming"
      ? incoming.map(enrichRequest)
      : activeTab === "matches"
      ? matched.map(enrichRequest)
      : sent.map(enrichRequest);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Matches</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.tab,
              activeTab === t.key && { borderBottomColor: colors.primary },
            ]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === t.key ? colors.primary : colors.mutedForeground },
              ]}
            >
              {t.label}
            </Text>
            {t.count > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{t.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPadding + 100 },
        ]}
        scrollEnabled={!!displayList.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons
              name={
                activeTab === "incoming"
                  ? "mail-open-outline"
                  : activeTab === "matches"
                  ? "heart-outline"
                  : "paper-plane-outline"
              }
              size={48}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {activeTab === "incoming"
                ? "No pending requests"
                : activeTab === "matches"
                ? "No matches yet"
                : "No sent requests"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {activeTab === "incoming"
                ? "When owners are interested in your dog, requests will appear here"
                : activeTab === "matches"
                ? "Accept requests to start chatting with matched owners"
                : "Browse dogs and send interest requests"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            type={
              activeTab === "incoming"
                ? "incoming"
                : activeTab === "matches"
                ? "matched"
                : "outgoing"
            }
            onAccept={() => respondToRequest(item.id, true)}
            onReject={() => respondToRequest(item.id, false)}
          />
        )}
      />

      {/* Chat shortcut on matched tab */}
      {activeTab === "matches" && matched.length > 0 && (
        <View style={[styles.chatHint, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
          <Text style={[styles.chatHintText, { color: colors.primary }]}>
            Go to Messages to chat with matched owners
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  list: { paddingHorizontal: 20, paddingTop: 16 },
  empty: { alignItems: "center", gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  chatHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
  },
  chatHintText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
});
