import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DogCard } from "@/components/DogCard";
import { FilterSheet } from "@/components/FilterSheet";
import { ModeToggle } from "@/components/ModeToggle";
import { useApp } from "@/context/AppContext";
import { Dog } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Filters {
  gender: "any" | "male" | "female";
  maxDistance: number;
  minAge: number;
  maxAge: number;
  vaccinated: boolean;
}

const DEFAULT_FILTERS: Filters = {
  gender: "any",
  maxDistance: 20,
  minAge: 0,
  maxAge: 15,
  vaccinated: false,
};

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mode, setMode, nearbyDogs, sendRequest, requests } = useApp();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  const sentIds = requests.filter((r) => r.fromOwnerId === "me").map((r) => r.toDogId);

  const filteredDogs = nearbyDogs.filter((d) => {
    if (skippedIds.includes(d.id)) return false;
    if (sentIds.includes(d.id)) return false;
    if (filters.gender !== "any" && d.gender !== filters.gender) return false;
    if ((d.distance ?? 0) > filters.maxDistance) return false;
    if (d.age < filters.minAge || d.age > filters.maxAge) return false;
    if (filters.vaccinated && !d.vaccinated) return false;
    return true;
  });

  const topDog: Dog | undefined = filteredDogs[0];
  const nextDog: Dog | undefined = filteredDogs[1];

  const handleInterest = () => {
    if (!topDog) return;
    sendRequest(topDog.id, topDog.ownerId);
  };

  const handleSkip = () => {
    if (!topDog) return;
    setSkippedIds((prev) => [...prev, topDog.id]);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="paw" size={22} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>PawMatch</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeContainer}>
        <ModeToggle mode={mode} onToggle={setMode} />
      </View>

      {/* Card stack */}
      <View style={styles.cardArea}>
        {filteredDogs.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No more dogs nearby</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Adjust your filters or check back later
            </Text>
            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
              onPress={() => {
                setFilters(DEFAULT_FILTERS);
                setSkippedIds([]);
              }}
            >
              <Text style={[styles.resetText, { color: colors.primary }]}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stack}>
            {nextDog && (
              <DogCard
                key={nextDog.id + "_next"}
                dog={nextDog}
                onInterest={() => {}}
                onSkip={() => {}}
                isTop={false}
              />
            )}
            {topDog && (
              <DogCard
                key={topDog.id}
                dog={topDog}
                onInterest={handleInterest}
                onSkip={handleSkip}
                isTop={true}
              />
            )}
          </View>
        )}
      </View>

      {/* Distance info */}
      {topDog && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Swipe right to send interest · Swipe left to skip
        </Text>
      )}

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  filterBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  modeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stack: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 1.35 + 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    width: SCREEN_WIDTH - 64,
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
  },
  resetText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingBottom: 12,
  },
});
