import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getMatchedDogs, chats, nearbyDogs } = useApp();

  const matched = getMatchedDogs();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const enriched = matched.map((req) => {
    const dog = nearbyDogs.find((d) => d.id === req.fromDogId) ?? req.fromDog;
    const messages = chats[req.id] ?? [];
    const lastMsg = messages[messages.length - 1];
    return { req, dog, lastMsg };
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Messages</Text>
      </View>

      <FlatList
        data={enriched}
        keyExtractor={(item) => item.req.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding + 100 }]}
        scrollEnabled={!!enriched.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="chat-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No conversations yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Chat is only unlocked after both owners match. Go accept requests in the Matches tab!
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        renderItem={({ item }) => {
          const bgColor = dogPlaceholderColor(item.req.fromDogId);
          const hasUnread = !!item.lastMsg && item.lastMsg.fromOwnerId !== "me";

          return (
            <TouchableOpacity
              style={styles.chatRow}
              activeOpacity={0.75}
              onPress={() => router.push(`/messages/${item.req.id}`)}
            >
              <View style={[styles.avatar, { backgroundColor: bgColor, borderRadius: colors.radius - 4 }]}>
                <MaterialCommunityIcons name="dog" size={28} color="rgba(255,255,255,0.85)" />
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatTopRow}>
                  <Text style={[styles.dogName, { color: colors.foreground }]}>
                    {item.dog?.name ?? "Unknown"}
                  </Text>
                  {item.lastMsg && (
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>
                      {new Date(item.lastMsg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.lastMsg,
                    { color: hasUnread ? colors.foreground : colors.mutedForeground },
                    hasUnread && { fontFamily: "Inter_600SemiBold" },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMsg?.text ?? "Say hello to " + (item.dog?.name ?? "them") + "!"}
                </Text>
              </View>
              {hasUnread && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  list: { paddingHorizontal: 0 },
  empty: { alignItems: "center", gap: 10, paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  avatar: { width: 52, height: 52, justifyContent: "center", alignItems: "center" },
  chatInfo: { flex: 1 },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dogName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  time: { fontSize: 12, fontFamily: "Inter_400Regular" },
  lastMsg: { fontSize: 14, fontFamily: "Inter_400Regular" },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  separator: { height: 1, marginLeft: 86 },
});
