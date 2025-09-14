// src/screens/Auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useAuth } from "../../context/AuthContext";
//import { useMutation } from "@tanstack/react-query";
import { useLogin } from "../../../src/api/hooks";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator"; 


export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  // =====================
  // Use login mutation hook
  // =====================
  const loginMutation = useLogin();

  const handleSubmit = async () => {
    try {
      console.log("[LoginScreen] handleSubmit called with:", email, password);
      const result = await loginMutation.mutateAsync({ email, password });
      console.log("[LoginScreen] Login mutation result:", result);

      if (result?.token) {
        await signIn(email, password, result.token); // Pass token to AuthContext
        console.log("[LoginScreen] User signed in successfully");
      }
    } catch (e) {
      console.error("[LoginScreen] Login failed", e);
    }
  };

  // ✅ derive flags manually
  const loading = loginMutation.status === "pending";
  const hasError = loginMutation.status === "error";
  const error = loginMutation.error;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
  <View style={{ width: "100%", maxWidth: 400 }}> {/* Limit width for larger screens */}

    <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
      Login
    </Text>

    <TextInput
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      autoCapitalize="none"
      keyboardType="email-address"
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    />

    <TextInput
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
      }}
    />

    {hasError && (
      <Text style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
        Error: {error?.message || "Login failed"}
      </Text>
    )}

    <TouchableOpacity
      onPress={handleSubmit}
      disabled={loading}
      style={{
        backgroundColor: loading ? "#aaa" : "#007bff",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator size={Platform.OS === "ios" ? 20 : "small"} color="#fff" />
      ) : (
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Login</Text>
      )}
    </TouchableOpacity>
      <TouchableOpacity
          onPress={() => navigation.navigate("Register")} // navigate to register screen
          style={{
            marginTop: 16,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#007bff", fontWeight: "bold" }}>
            New user? Register
          </Text>
        </TouchableOpacity>  

    

  </View>
</View>

  );
}
