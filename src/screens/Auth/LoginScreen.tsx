// src/screens/Auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "../../api/axios";

type LoginPayload = { email: string; password: string };
type LoginResponse = { token: string };

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ useMutation without isLoading/isError destructure
  const loginMutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async ({ email, password }) => {
      const client = createClient();
      console.log("Axios POST to:", createClient().defaults.baseURL + "/auth/login", { email, password });

      const { data } = await client.post<LoginResponse>("/auth/login", { email, password });
      return data;
    },
  });

  const handleSubmit = async () => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result?.token) {
        await signIn(email, password, result.token); // Pass token to AuthContext
      }
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  // ✅ derive flags manually
  const loading = loginMutation.status === "pending";
  const hasError = loginMutation.status === "error";
  const error = loginMutation.error;

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Login</Text>

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
        <Text style={{ color: "red", marginBottom: 12 }}>
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
    </View>
  );
}
