// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
//import { NativeStackNavigationProp } from "@react-navigation/native-stack";
//import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/UI/Button";
import { useRegister} from "../../api/hooks";
//import { RootStackParamList } from "../../navigation/AppNavigator";
import { Token } from "../../api/types";
import { useAuth } from "../../context/AuthContext";
import { showAlert } from "../../utils/alert";


const RegisterScreen: React.FC = () => {
  const { colors } = useTheme();
  //const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {signIn} = useAuth();

  const registerMutation = useRegister();

  // Instead of registerMutation.isLoading
const loading = registerMutation.status === "pending";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res: Token = await registerMutation.mutateAsync({ name, email, password });
      console.log("Registration token:", res.access_token);
      // Store the token in AuthContext
      await signIn(email, password, res.access_token, email);
      
      Alert.alert("Success", "Registered successfully!");
      //navigation.navigate("Login"); AuthContext state change will trigger navigation to login
    } catch (err: any) {
      console.error("Registration error:", err);
    const message = 
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Registration failed";

      showAlert("Error", message); 
    
    console.log("🔴 Final message:", message);
    
    // Try a simple hardcoded alert first
    //Alert.alert("Error", "Test alert - can you see this?");
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
