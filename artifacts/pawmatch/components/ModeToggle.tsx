import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Mode } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface ModeToggleProps {
  mode: Mode;
  onToggle: (m: Mode) => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const colors = useColors();

  const select = (m: Mode) => {
    Haptics.selectionAsync();
    onToggle(m);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
      <TouchableOpacity
        style={[
          styles.option,
          { borderRadius: colors.radius - 4 },
          mode === "playdate" && { backgroundColor: colors.primary },
        ]}
        onPress={() => select("playdate")}
        activeOpacity={0.85}
      >
        <Ionicons
          name="happy-outline"
          size={16}
          color={mode === "playdate" ? "#fff" : colors.mutedForeground}
        />
        <Text
          style={[
            styles.label,
            { color: mode === "playdate" ? "#fff" : colors.mutedForeground },
          ]}
        >
          Playdate
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          { borderRadius: colors.radius - 4 },
          mode === "breeding" && { backgroundColor: colors.primary },
        ]}
        onPress={() => select("breeding")}
        activeOpacity={0.85}
      >
        <Ionicons
          name="heart-outline"
          size={16}
          color={mode === "breeding" ? "#fff" : colors.mutedForeground}
        />
        <Text
          style={[
            styles.label,
            { color: mode === "breeding" ? "#fff" : colors.mutedForeground },
          ]}
        >
          Breeding
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
