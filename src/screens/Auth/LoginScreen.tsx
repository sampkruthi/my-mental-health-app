// src/screens/Auth/LoginScreen.tsx
import React, { useState, useEffect } from "react";
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
  LinearGradientComponent,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLogin, useGoogleLogin } from "../../api/hooks";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Button } from "../../components/UI/Button";
import { Alert } from "react-native";
import MeditatingLogo from "../../images/Meditating_logo.png";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { getUserTimezone } from "../../utils/timezoneUtils";
import jwtDecode from "jwt-decode";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || "";
const { width } = Dimensions.get("window");
import { initializeNotifications } from '../../notificationService';
import { getApiService } from '../../../services/api';


async function registerDeviceForNotifications() {
  try {
    console.log('[LoginScreen] === DEVICE REGISTRATION START ===');
    
    const deviceToken = await initializeNotifications();
    
    if (!deviceToken) {
      console.log('[LoginScreen]No device token obtained');
      return;
    }
    
    console.log('[LoginScreen] Device token obtained:', deviceToken.substring(0, 30) + '...');
    
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
    console.log('[LoginScreen] Platform:', platform);
    
    const api = getApiService();
    const result = await api.registerDeviceToken(deviceToken, platform);
    
    console.log('[LoginScreen]Device registered with backend:', result);
    console.log('[LoginScreen] === DEVICE REGISTRATION COMPLETE ===');
  } catch (error) {
    console.error('[LoginScreen]Device registration error:', error);
  }
}


export default function LoginScreen() {
  const { signIn, signInWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Use login mutation hook
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  // Google OAuth — manual flow using WebBrowser.openAuthSessionAsync
  // This avoids expo-auth-session's Google provider issues with Android client IDs.
  // Uses the Web Client ID + implicit flow to get id_token directly.
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "bodhira" });

  const handleGooglePress = async () => {
    try {
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID_WEB)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=${encodeURIComponent("openid email profile")}` +
        `&nonce=${Math.random().toString(36).substring(2)}`;

      console.log("[LoginScreen] Google OAuth redirect URI:", redirectUri);
      console.log("[LoginScreen] Opening Google sign-in...");

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url) {
        // Extract id_token from the URL fragment (#id_token=...)
        const fragment = result.url.split("#")[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const idToken = params.get("id_token");
          if (idToken) {
            handleGoogleSignIn(idToken);
            return;
          }
        }
        console.error("[LoginScreen] No id_token in response URL:", result.url);
        Alert.alert("Error", "Google sign-in did not return the expected token.");
      } else if (result.type === "cancel") {
        console.log("[LoginScreen] Google sign-in cancelled by user");
      }
    } catch (e) {
      console.error("[LoginScreen] Google auth error:", e);
      Alert.alert("Error", "Google sign-in failed. Please try again.");
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      console.log("[LoginScreen] Sending Google ID token to backend");
      const timezone = getUserTimezone();
      const result = await googleLoginMutation.mutateAsync({ idToken, timezone });

      if (result?.token) {
        // Extract userId from JWT
        const decoded: any = jwtDecode(result.token);
        const userId = decoded.user_id || decoded.sub || "";
        await signInWithToken(result.token, userId);
        await registerDeviceForNotifications();
        console.log("[LoginScreen] Google sign-in successful");
      }
    } catch (e) {
      console.error("[LoginScreen] Google sign-in failed", e);
      Alert.alert("Error", "Google sign-in failed. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("[LoginScreen] handleSubmit called with:", email, password);
      const result = await loginMutation.mutateAsync({ email, password });
      console.log("[LoginScreen] Login mutation result:", result);

      if (result?.token) {
        await signIn(email, password, result.token);
        await registerDeviceForNotifications();
        console.log("[LoginScreen] User signed in successfully");

      }
    } catch (e) {
      console.error("[LoginScreen] Login failed", e);
    }
  };

  const loading = loginMutation.status === "pending";
  const googleLoading = googleLoginMutation.status === "pending";
  const hasError = loginMutation.status === "error" || googleLoginMutation.status === "error";
  const error = loginMutation.error || googleLoginMutation.error;

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
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.tab}
            >
              <Text style={styles.tabText}>Sign Up</Text>
            </TouchableOpacity>
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
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {hasError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error: {error?.message || "Login failed"}
              </Text>
            </View>
          )}

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              styles.signInButton,
              loading && styles.signInButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size={Platform.OS === "ios" ? 20 : "small"}
                color="#fff"
              />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={handleGooglePress}
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
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Privacy Notice */}
          <Text style={styles.privacyText}>
            By continuing, you agree to our commitment to your privacy and
            mental wellness.
          </Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    width: Platform.OS === "web" ? "80%" : "100%",
    maxWidth: Platform.OS === "web" ? 700 : 600,
    minHeight: Platform.OS === "web" ? 670 : undefined,
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
    height: 150,
  },
  logo: {
    width: 140,
    height: 140,
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#2C2C2C",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#2C2C2C",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#5B9ACD",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: "#5B9ACD",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#5B9ACD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 20,
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
  privacyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});
