import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dog } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.35;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface DogCardProps {
  dog: Dog;
  onInterest: () => void;
  onSkip: () => void;
  isTop?: boolean;
}

export function DogCard({ dog, onInterest, onSkip, isTop = false }: DogCardProps) {
  const colors = useColors();
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.2],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const skipOpacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.2, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onInterest();
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onSkip();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const bgColor = dogPlaceholderColor(dog.id);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          transform: isTop
            ? [{ translateX: pan.x }, { translateY: pan.y }, { rotate }]
            : [{ scale: 0.96 }, { translateY: 12 }],
          shadowColor: colors.foreground,
        },
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Photo */}
      <View style={[styles.photoContainer, { backgroundColor: bgColor, borderRadius: colors.radius }]}>
        {dog.photos.length > 0 ? (
          <Image source={{ uri: dog.photos[0] }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderIcon}>
            <MaterialCommunityIcons name="dog" size={80} color="rgba(255,255,255,0.7)" />
          </View>
        )}

        {/* Badges */}
        <View style={styles.topBadges}>
          {dog.vaccinated && (
            <View style={[styles.badge, { backgroundColor: "rgba(45,154,106,0.9)" }]}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
            <Ionicons name="location-sharp" size={12} color="#fff" />
            <Text style={styles.badgeText}>{dog.distance?.toFixed(1)} km</Text>
          </View>
        </View>

        {/* Swipe overlays */}
        {isTop && (
          <>
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.likeText}>WOOF!</Text>
            </Animated.View>
            <Animated.View style={[styles.skipLabel, { opacity: skipOpacity }]}>
              <Text style={styles.skipText}>PASS</Text>
            </Animated.View>
          </>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {dog.name}
          </Text>
          <Text style={[styles.age, { color: colors.mutedForeground }]}>
            {dog.age}y
          </Text>
          <Ionicons
            name={dog.gender === "female" ? "female" : "male"}
            size={18}
            color={dog.gender === "female" ? "#E8519A" : "#4A90D9"}
            style={{ marginLeft: 2 }}
          />
        </View>
        <Text style={[styles.breed, { color: colors.mutedForeground }]}>{dog.breed}</Text>
        <Text style={[styles.bio, { color: colors.foreground }]} numberOfLines={2}>
          {dog.bio}
        </Text>

        {/* Temperament */}
        <View style={styles.tags}>
          {dog.temperament.slice(0, 3).map((t) => (
            <View key={t} style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      {isTop && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.skipBtn, { backgroundColor: colors.muted }]}
            onPress={onSkip}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.interestBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onInterest();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="paw" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    position: "absolute",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  photoContainer: {
    width: "100%",
    height: CARD_HEIGHT * 0.6,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  topBadges: {
    position: "absolute",
    top: 12,
    right: 12,
    gap: 6,
    flexDirection: "row",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  likeLabel: {
    position: "absolute",
    top: 32,
    left: 16,
    borderWidth: 3,
    borderColor: "#2D9A6A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: "-20deg" }],
  },
  likeText: {
    color: "#2D9A6A",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  skipLabel: {
    position: "absolute",
    top: 32,
    right: 16,
    borderWidth: 3,
    borderColor: "#E63946",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: "20deg" }],
  },
  skipText: {
    color: "#E63946",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  info: {
    padding: 16,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  age: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },
  breed: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  bio: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginTop: 6,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 4,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  skipBtn: {},
  interestBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
});
