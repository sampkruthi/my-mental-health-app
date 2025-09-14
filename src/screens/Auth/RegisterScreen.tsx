// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/UI/Button";
import { useRegister} from "../../api/hooks";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Token } from "../../api/types"

const RegisterScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const registerMutation = useRegister();

  // Instead of registerMutation.isLoading
const loading = registerMutation.status === "pending";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res: Token = await registerMutation.mutateAsync({ name, email, password });
      console.log("Mock token:", res.access_token);
      Alert.alert("Success", "Registered successfully!");
      navigation.navigate("Login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      Alert.alert("Error", message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, marginBottom: 24 }}>
        Register
      </Text>

      <TextInput
        style={{
          backgroundColor: colors.inputBackground,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          color: colors.text,
        }}
        placeholder="Name"
        placeholderTextColor={colors.subText}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={{
          backgroundColor: colors.inputBackground,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          color: colors.text,
        }}
        placeholder="Email"
        placeholderTextColor={colors.subText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={{
          backgroundColor: colors.inputBackground,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          color: colors.text,
        }}
        placeholder="Password"
        placeholderTextColor={colors.subText}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
  title={loading ? "Registering..." : "Register"}
  onPress={handleRegister}
  disabled={loading}
/>

    </View>
  );
};

export default RegisterScreen;
