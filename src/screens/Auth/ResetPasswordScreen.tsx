import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useForgotPassword, useResetPassword } from "../../api/hooks";

export default function ResetPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ResetPassword">>();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (route.params?.token) {
      setResetToken(route.params.token);
    }
  }, [route.params?.token]);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }
    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: email.trim().toLowerCase(),
      });
      let message = response.message || "If the account exists, a reset link has been sent.";
      if (response.dev_reset_token) {
        message += `\n\nDev token: ${response.dev_reset_token}`;
        setResetToken(response.dev_reset_token);
      }
      Alert.alert("Reset requested", message);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Unable to send reset link.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) {
      Alert.alert("Error", "Please enter the reset token.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        token: resetToken.trim(),
        newPassword,
      });
      Alert.alert("Success", response.message || "Password reset successful.", [
        { text: "Back to Login", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Unable to reset password.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Step 1: request reset. Step 2: enter token from email and set a new password.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRequestReset}
          disabled={forgotPasswordMutation.isPending}
        >
          <Text style={styles.secondaryButtonText}>
            {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Reset Token</Text>
        <TextInput
          style={styles.input}
          value={resetToken}
          onChangeText={setResetToken}
          autoCapitalize="none"
          placeholder="Paste token from email"
        />

        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            placeholder="At least 8 characters"
            placeholderTextColor="#8E9AA0"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword((prev) => !prev)}
            style={styles.eyeIcon}
          >
            <Text>{showNewPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="Re-enter new password"
            placeholderTextColor="#8E9AA0"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            style={styles.eyeIcon}
          >
            <Text>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleResetPassword}
          disabled={resetPasswordMutation.isPending}
        >
          <Text style={styles.primaryButtonText}>
            {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4DB",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 640,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#5D6D7E",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D5DBDB",
    color: "#2C2C2C",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  passwordInputContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 10,
    padding: 4,
  },
  secondaryButton: {
    backgroundColor: "#ECF0F1",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: "#2C3E50",
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#5B9ACD",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  backText: {
    color: "#5B9ACD",
    textAlign: "center",
    fontWeight: "600",
  },
});
