import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

type Step = "owner" | "dog";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [step, setStep] = useState<Step>("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [dogGender, setDogGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleContinue = () => {
    if (!name.trim() || !email.trim() || !password.trim() || !location.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep("dog");
  };

  const handleRegister = async () => {
    if (!dogName.trim() || !dogBreed.trim() || !dogAge) {
      setError("Please fill in your dog's details.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        location: location.trim(),
        dogName: dogName.trim(),
        dogBreed: dogBreed.trim(),
        dogAge: parseInt(dogAge, 10),
        dogGender,
      });
      router.replace("/(tabs)");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.inputWrapper,
    { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card },
  ];
  const inputText = [styles.inputText, { color: colors.foreground }];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPadding + 24, paddingBottom: insets.bottom + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => (step === "dog" ? setStep("owner") : router.back())}
      >
        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.logoContainer, { backgroundColor: colors.primary, borderRadius: colors.radius * 1.5 }]}>
        <Ionicons name={step === "owner" ? "person-outline" : "paw-outline"} size={36} color="#fff" />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>
        {step === "owner" ? "Create Account" : "Add Your Dog"}
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {step === "owner"
          ? "Step 1 of 2 — Your profile"
          : "Step 2 of 2 — Tell us about your pup"}
      </Text>

      {/* Steps indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.stepLine, { backgroundColor: step === "dog" ? colors.primary : colors.border }]} />
        <View
          style={[
            styles.stepDot,
            { backgroundColor: step === "dog" ? colors.primary : colors.border },
          ]}
        />
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderRadius: colors.radius }]}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        </View>
      ) : null}

      {step === "owner" ? (
        <View style={styles.form}>
          <View style={inputStyle}>
            <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
            <TextInput style={inputText} placeholder="Full Name" placeholderTextColor={colors.mutedForeground} value={name} onChangeText={setName} />
          </View>
          <View style={inputStyle}>
            <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
            <TextInput style={inputText} placeholder="Email" placeholderTextColor={colors.mutedForeground} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={inputStyle}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
            <TextInput style={inputText} placeholder="Password" placeholderTextColor={colors.mutedForeground} value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          <View style={inputStyle}>
            <Ionicons name="location-outline" size={18} color={colors.mutedForeground} />
            <TextInput style={inputText} placeholder="City, State" placeholderTextColor={colors.mutedForeground} value={location} onChangeText={setLocation} />
          </View>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleContinue}
          >
            <Text style={styles.btnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={inputStyle}>
            <Ionicons name="paw-outline" size={18} color={colors.mutedForeground} />
            <TextInput style={inputText} placeholder="Dog's Name" placeholderTextColor={colors.mutedForeground} value={dogName} onChangeText={setDogName} />
          </View>
          <View style={inputStyle}>
            <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
            <TextInput style={inputText} placeholder="Breed (e.g. Golden Retriever)" placeholderTextColor={colors.mutedForeground} value={dogBreed} onChangeText={setDogBreed} />
          </View>
          <View style={inputStyle}>
            <Ionicons name="calendar-outline" size={18} color={colors.mutedForeground} />
            <TextInput style={inputText} placeholder="Age (years)" placeholderTextColor={colors.mutedForeground} value={dogAge} onChangeText={setDogAge} keyboardType="number-pad" />
          </View>

          {/* Gender */}
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Gender</Text>
          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderBtn,
                  {
                    borderColor: dogGender === g ? colors.primary : colors.border,
                    backgroundColor: dogGender === g ? colors.secondary : colors.card,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={() => setDogGender(g)}
              >
                <Ionicons
                  name={g === "female" ? "female" : "male"}
                  size={20}
                  color={dogGender === g ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: dogGender === g ? colors.primary : colors.foreground },
                  ]}
                >
                  {g === "male" ? "Male" : "Female"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: loading ? colors.muted : colors.primary, borderRadius: colors.radius },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.btnText}>Create Account</Text>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.loginRow}>
        <Text style={[styles.loginPrompt, { color: colors.mutedForeground }]}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 24, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", padding: 4, marginBottom: 12 },
  logoContainer: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  stepIndicator: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 0 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { width: 60, height: 2 },
  errorBox: { padding: 12, marginBottom: 8, width: "100%" },
  errorText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  form: { width: "100%", gap: 12, marginBottom: 24 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 4,
  },
  genderRow: { flexDirection: "row", gap: 12 },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  genderText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  btn: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  loginRow: { flexDirection: "row" },
  loginPrompt: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
