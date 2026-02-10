// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useRegister, useGoogleLogin } from "../../api/hooks";
import { useAuth } from "../../context/AuthContext";
import { showAlert } from "../../utils/alert";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Token } from "../../api/types";
import MeditatingLogo from "../../images/Meditating_logo.png";
import { getUserTimezone } from "../../utils/timezoneUtils";
import { initializeNotifications } from '../../notificationService';
import { getApiService } from '../../../services/api';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import jwtDecode from "jwt-decode";

const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || "";


const { width } = Dimensions.get("window");


const testTimezoneFlow = async () => {
  const tz = getUserTimezone();
  console.log("=== QUICK TIMEZONE TEST ===");
  console.log("Timezone detected:", tz);
  console.log("Is it UTC?:", tz === "UTC");
  console.log("Is it your timezone?:", tz === "America/Los_Angeles"); // Change to your TZ
  console.log("===========================");
};


async function registerDeviceForNotifications() {
  try {
    console.log('[RegisterScreen] === DEVICE REGISTRATION START ===');
    
    // Get device token using your existing notificationService
    const deviceToken = await initializeNotifications();
    
    if (!deviceToken) {
      console.log('[RegisterScreen]No device token obtained - user may have denied permissions');
      return; // Don't block registration if notifications fail
    }
    
    console.log('[RegisterScreen] Device token obtained:', deviceToken.substring(0, 30) + '...');
    
    // Determine platform
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
    console.log('[RegisterScreen] Platform:', platform);
    
    // Register with backend using your existing API
    const api = getApiService();
    const result = await api.registerDeviceToken(deviceToken, platform);
    
    console.log('[RegisterScreen]Device registered with backend:', result);
    console.log('[RegisterScreen] === DEVICE REGISTRATION COMPLETE ===');
  } catch (error) {
    console.error('[RegisterScreen] Device registration error:', error);
    // Don't throw - we don't want device registration failure to block signup
  }
}


const RegisterScreen: React.FC = () => {
  const { colors } = useTheme();
  const { signIn, signInWithToken } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLogin();
  const loading = registerMutation.status === "pending";
  const [googleLoading, setGoogleLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Native Google Sign-In using Google Identity Services SDK
  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      console.log("[RegisterScreen] Starting native Google Sign-In");
      console.log("[RegisterScreen] webClientId:", GOOGLE_CLIENT_ID_WEB ? "SET" : "EMPTY");

      // Configure before each sign-in to ensure env vars are loaded
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID_WEB,
      });

      // Check if Play Services are available (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Trigger native Google sign-in
      const signInResponse = await GoogleSignin.signIn();
      console.log("[RegisterScreen] signIn response type:", signInResponse?.type);

      if (!isSuccessResponse(signInResponse)) {
        console.log("[RegisterScreen] Google sign-up was not successful, response:", JSON.stringify(signInResponse));
        return;
      }

      const idToken = signInResponse.data.idToken;
      console.log("[RegisterScreen] idToken present:", !!idToken);
      if (!idToken) {
        showAlert("Error", "Google sign-up failed (no token).");
        return;
      }

      console.log("[RegisterScreen] Sending to backend...");
      const timezone = getUserTimezone();
      const result = await googleLoginMutation.mutateAsync({ idToken, timezone });
      console.log("[RegisterScreen] Backend result:", JSON.stringify(result));

      if (!result?.token) {
        showAlert("Error", "Sign-up succeeded but no token was returned.");
        return;
      }

      const decoded: any = jwtDecode(result.token);
      console.log("[RegisterScreen] Decoded JWT keys:", Object.keys(decoded));
      const userId = decoded.user_id || decoded.sub || "";

      await signInWithToken(result.token, userId);
      console.log("[RegisterScreen] Google sign-up complete!");
      Alert.alert("Success", "Signed in with Google successfully!");

      // Non-critical: register for notifications (don't let this fail sign-in)
      registerDeviceForNotifications().catch((e) =>
        console.warn("[RegisterScreen] Notification registration failed:", e)
      );
    } catch (error: any) {
      console.error("[RegisterScreen] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("[RegisterScreen] Google sign-up cancelled by user");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("[RegisterScreen] Google sign-up already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showAlert("Error", "Google Play Services are not available on this device.");
            break;
          default:
            showAlert("Error", `Google sign-up failed: ${error.message || error.code}`);
        }
      } else {
        showAlert("Error", `Sign-up failed: ${error?.message || "Unknown error"}`);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!name.trim()) {
      showAlert("Error", "Please enter your full name");
      return;
    }
    if (!email.trim()) {
      showAlert("Error", "Please enter your email");
      return;
    }
    if (!password.trim()) {
      showAlert("Error", "Please enter a password");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      showAlert("Error", "Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    try {
      // Detect user's timezone
      const timezone = getUserTimezone();
      console.log("===========================================");
    console.log("🔍 TIMEZONE DEBUG - FRONTEND");
    console.log("===========================================");
    console.log("1. getUserTimezone() returned:", timezone);
    console.log("2. Type:", typeof timezone);
    console.log("3. Is truthy?:", !!timezone);
    console.log("4. Length:", timezone?.length);
    console.log("5. JSON stringified:", JSON.stringify(timezone));
  
      console.log("[RegisterScreen] Detected user timezone:", timezone);

      const res: Token = await registerMutation.mutateAsync({
        name,
        email,
        password,
        timezone,
      });
      console.log("Registration token:", res.access_token);

      // Store the token in AuthContext
      await signIn(email, password, res.access_token, email);
      await registerDeviceForNotifications();

      Alert.alert("Success", "Registered successfully!");
    } catch (err: any) {
      console.error("Registration error:", err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";

      showAlert("Error", message);
      console.log("Final message:", message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EDE4DB" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* White Card Container */}
        <View style={styles.card}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={MeditatingLogo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* App Title */}
          <Text style={styles.appTitle}>Bodhira</Text>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.tab}
            >
              <Text style={styles.tabText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
                style={styles.input}
                autoFocus={false}
                returnKeyType="next"
                onSubmitEditing={() => {}}
              />
            </View>
          </View>

          {/* Email Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
                style={styles.input}
                autoFocus={false}
                returnKeyType="next"
                onSubmitEditing={() => {}}
              />
            </View>
          </View>

          {/* Password Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
                style={styles.input}
                autoFocus={false}
                returnKeyType="next"
                onSubmitEditing={() => {}}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
                style={styles.input}
                autoFocus={false}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Text>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[
              styles.createButton,
              loading && styles.createButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size={Platform.OS === "ios" ? 20 : "small"}
                color="#fff"
              />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
            style={[
              styles.googleButton,
              googleLoading && styles.googleButtonDisabled,
            ]}
          >
            {googleLoading ? (
              <ActivityIndicator
                size={Platform.OS === "ios" ? 20 : "small"}
                color="#333"
              />
            ) : (
              <View style={styles.googleButtonContent}>
                <Image
                  source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInLinkContainer}>
            <Text style={styles.signInLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4DB",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Platform.OS === "web" ? 50 : 20,
    paddingVertical: Platform.OS === "web" ? 60 : 40,
  },
  card: {
    width: Platform.OS === "web" ? "95%" : "100%",
    maxWidth: Platform.OS === "web" ? 1000 : 600,
    minHeight: Platform.OS === "web" ? 800 : undefined,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
    height: 120,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 32,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7F8C8D",
  },
  activeTabText: {
    color: "#5B9ACD",
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9F9F9",
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2C2C2C",
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#2C2C2C",
    marginRight: 8,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: "#2C2C2C",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 13,
    color: "#7F8C8D",
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: "#5B9ACD",
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#5B9ACD",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#5B9ACD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  googleButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  signInLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInLinkText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  signInLink: {
    fontSize: 14,
    color: "#5B9ACD",
    fontWeight: "600",
  },
});

export default RegisterScreen;
