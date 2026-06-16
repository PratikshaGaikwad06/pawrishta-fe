import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { owner, myDog, logout, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [ownerBio, setOwnerBio] = useState(owner?.bio ?? "");
  const [dogBio, setDogBio] = useState(myDog?.bio ?? "");
  const [dogTemperament, setDogTemperament] = useState(
    myDog?.temperament.join(", ") ?? ""
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = () => {
    updateProfile(
      { bio: ownerBio },
      { bio: dogBio, temperament: dogTemperament.split(",").map((t) => t.trim()).filter(Boolean) }
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          logout();
        },
      },
    ]);
  };

  if (!owner || !myDog) return null;

  const avatarBg = dogPlaceholderColor(myDog.id);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPadding + 100 }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: editing ? colors.primary : colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          onPress={() => (editing ? handleSave() : setEditing(true))}
        >
          <Ionicons
            name={editing ? "checkmark" : "pencil-outline"}
            size={16}
            color={editing ? "#fff" : colors.foreground}
          />
          <Text style={[styles.editBtnText, { color: editing ? "#fff" : colors.foreground }]}>
            {editing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Owner card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
        <View style={styles.ownerTop}>
          <View style={[styles.ownerAvatar, { backgroundColor: colors.primary + "30" }]}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.ownerInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.ownerName, { color: colors.foreground }]}>{owner.name}</Text>
              {owner.verified && (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              )}
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.locationText, { color: colors.mutedForeground }]}>
                {owner.location}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Bio</Text>
        {editing ? (
          <TextInput
            style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.muted }]}
            value={ownerBio}
            onChangeText={setOwnerBio}
            multiline
            placeholder="Tell others about yourself..."
            placeholderTextColor={colors.mutedForeground}
          />
        ) : (
          <Text style={[styles.bioText, { color: owner.bio ? colors.foreground : colors.mutedForeground }]}>
            {owner.bio || "No bio yet. Tap Edit to add one."}
          </Text>
        )}
      </View>

      {/* Dog card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
        <View style={styles.dogTop}>
          <View style={[styles.dogAvatar, { backgroundColor: avatarBg, borderRadius: colors.radius - 4 }]}>
            <MaterialCommunityIcons name="dog" size={36} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={styles.dogInfo}>
            <Text style={[styles.dogName, { color: colors.foreground }]}>{myDog.name}</Text>
            <Text style={[styles.dogBreed, { color: colors.mutedForeground }]}>{myDog.breed}</Text>
            <View style={styles.dogMeta}>
              <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{myDog.age}y</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Ionicons
                  name={myDog.gender === "female" ? "female" : "male"}
                  size={12}
                  color={myDog.gender === "female" ? "#E8519A" : "#4A90D9"}
                />
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {myDog.gender === "male" ? "Male" : "Female"}
                </Text>
              </View>
              {myDog.vaccinated && (
                <View style={[styles.tag, { backgroundColor: colors.success + "20" }]}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                  <Text style={[styles.tagText, { color: colors.success }]}>Vaccinated</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>About {myDog.name}</Text>
        {editing ? (
          <TextInput
            style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.muted }]}
            value={dogBio}
            onChangeText={setDogBio}
            multiline
            placeholder={`Tell others about ${myDog.name}...`}
            placeholderTextColor={colors.mutedForeground}
          />
        ) : (
          <Text style={[styles.bioText, { color: myDog.bio ? colors.foreground : colors.mutedForeground }]}>
            {myDog.bio || "No bio yet."}
          </Text>
        )}

        {editing && (
          <>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>
              Temperament (comma separated)
            </Text>
            <TextInput
              style={[styles.inputRow, { color: colors.foreground, borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.muted }]}
              value={dogTemperament}
              onChangeText={setDogTemperament}
              placeholder="Friendly, Playful, Calm"
              placeholderTextColor={colors.mutedForeground}
            />
          </>
        )}

        {!editing && myDog.temperament.length > 0 && (
          <View style={styles.tempRow}>
            {myDog.temperament.map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.destructive + "40", borderRadius: colors.radius }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 20, gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  editBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  ownerTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ownerInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ownerName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  locationText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  divider: { height: 1 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  bioText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  textArea: {
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  inputRow: {
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  dogTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  dogAvatar: {
    width: 68,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
  },
  dogInfo: { flex: 1, gap: 4 },
  dogName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  dogBreed: { fontSize: 13, fontFamily: "Inter_400Regular" },
  dogMeta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tempRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
