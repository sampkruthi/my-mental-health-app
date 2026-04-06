// src/screens/Auth/LoginScreen.tsx
import React, { useEffect, useState } from "react";
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
import * as AppleAuthentication from "expo-apple-authentication";
import { useLogin, useGoogleLogin, useAppleLogin } from "../../api/hooks";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Button } from "../../components/UI/Button";
import { Alert } from "react-native";
import MeditatingLogo from "../../images/Meditating_logo.png";
import Toast from "../../components/UI/Toast";
import { showToast } from "../../utils/toast";
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getUserTimezone } from "../../utils/timezoneUtils";
import { jwtDecode } from "jwt-decode";
import { analytics } from '../../../analytics';

const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || "";
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || "";
const { width } = Dimensions.get("window");
import { initializeNotifications } from '../../notificationService';
import { getApiService } from '../../../services/api';
const isIPad = Platform.OS === 'ios' && Platform.isPad;


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

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Use login mutation hook
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const [googleLoading, setGoogleLoading] = useState(false);
  const appleLoginMutation = useAppleLogin();
  const [appleLoading, setAppleLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Native Google Sign-In using Google Identity Services SDK
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      console.log("[LoginScreen] Starting native Google Sign-In");
      console.log("[LoginScreen] webClientId:", GOOGLE_CLIENT_ID_WEB ? "SET" : "EMPTY");
      if (!GOOGLE_CLIENT_ID_WEB) {
        showToast("Google sign-in is not configured (missing web client ID).", "error");
        return;
      }

      // Configure before each sign-in to ensure env vars are loaded
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID_WEB,
        iosClientId: GOOGLE_CLIENT_ID_IOS,
        offlineAccess: false,
      });

      // Check if Play Services are available (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // ALWAYS sign out before sign-in to show account picker (privacy-friendly)
      // This ensures users can choose which account to use each time
      try {
        await GoogleSignin.signOut();
        console.log("[LoginScreen] Signed out from Google - account picker will show");
      } catch (signOutError) {
        // This is fine - might not have been signed in before
        console.log("[LoginScreen] Sign out skipped (not previously signed in):", signOutError);
      }

      /*
      // Clear cached local session only when needed.
      if (await GoogleSignin.hasPreviousSignIn()) {
        try {
          await GoogleSignin.signOut();
        } catch (signOutError) {
          console.log("[LoginScreen] Previous Google session sign-out skipped:", signOutError);
        }
      }
        */

      console.log("[LoginScreen] Calling GoogleSignin.signIn()");
      const signInResponse = await GoogleSignin.signIn();
      console.log("[LoginScreen] Google Sign-In UI completed");
      console.log("[LoginScreen] signIn response type:", signInResponse?.type);

      if (!isSuccessResponse(signInResponse)) {
        console.log("[LoginScreen] Google sign-in was not successful, response:", JSON.stringify(signInResponse));
        return;
      }

      let idToken = signInResponse.data.idToken;
      if (!idToken) {
        console.log("[LoginScreen] idToken not in signInResponse, trying getTokens()...");
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens?.idToken;
          console.log("[LoginScreen] getTokens() result - idToken present:", !!idToken);
        } catch (tokenError) {
          console.log("[LoginScreen] getTokens failed:", tokenError);
        }
      }

      console.log("[LoginScreen] idToken present:", !!idToken);
      if (!idToken) {
        showToast(
          "Google sign-in failed (no ID token). Verify Web Client ID and Google console SHA/package setup.",
          "error"
        );
        return;
      }

      console.log("[LoginScreen] Sending to backend...");
      const timezone = getUserTimezone();
      const result = await googleLoginMutation.mutateAsync({ idToken, timezone });
      console.log("[LoginScreen] Backend result:", JSON.stringify(result));

      if (!result?.token) {
        showToast("Sign-in succeeded but no token was returned.", "error");
        return;
      }

      const decoded: any = jwtDecode(result.token);
      console.log("[LoginScreen] Decoded JWT keys:", Object.keys(decoded));
      const userId = decoded.user_id || decoded.sub || "";

      await signInWithToken(result.token, userId);
      console.log("[LoginScreen] Google sign-in complete!");
      analytics.identify(email);
      analytics.loginCompleted('google');

      // Non-critical: register for notifications (don't let this fail sign-in)
      registerDeviceForNotifications().catch((e) =>
        console.warn("[LoginScreen] Notification registration failed:", e)
      );
    } catch (error: any) {
      console.error("[LoginScreen] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("[LoginScreen] Google sign-in cancelled by user");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("[LoginScreen] Google sign-in already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showToast("Google Play Services are not available on this device.", "error");
            break;
          default:
            setToast({ message: `Google sign-in failed: ${error.message || error.code}`, type: "error" });
        }
      } else {
        setToast({ message: `Sign-in failed: ${error?.message || "Unknown error"}`, type: "error" });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Native Apple Sign-In (iOS only)
  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      console.log("[LoginScreen] Starting Apple Sign-In");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const appleUserId = credential.user;

      console.log("[LoginScreen] Apple Sign-In credential received");

      const identityToken = credential.identityToken;
      if (!identityToken) {
        showToast("Apple sign-in failed (no identity token).", "error");
        return;
      }

      // Apple only sends the user's name on the FIRST sign-in
      const fullName = credential.fullName;
      let userName: string | null = null;
      if (fullName) {
        const parts = [fullName.givenName, fullName.familyName].filter(Boolean);
        userName = parts.length > 0 ? parts.join(" ") : null;
      }

      console.log("[LoginScreen] Sending Apple token to backend...");
      const timezone = getUserTimezone();
      const result = await appleLoginMutation.mutateAsync({
        identityToken,
        userName,
        timezone,
      });
      console.log("[LoginScreen] Backend result:", JSON.stringify(result));

      if (!result?.token) {
        showToast("Sign-in succeeded but no token was returned.", "error");
        return;
      }

      const decoded: any = jwtDecode(result.token);
      console.log("[LoginScreen] Decoded JWT keys:", Object.keys(decoded));
      const userId = decoded.user_id || decoded.sub || "";

      await signInWithToken(result.token, userId, appleUserId);
      console.log("[LoginScreen] Apple sign-in complete!");
      analytics.identify(email);
      analytics.loginCompleted('apple');

      registerDeviceForNotifications().catch((e) =>
        console.warn("[LoginScreen] Notification registration failed:", e)
      );
    } catch (error: any) {
      console.error("[LoginScreen] Apple sign-in error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      if (
        error.code === "ERR_REQUEST_CANCELED" || //IOS settings redirect interruption
        error.code === "1001" ||
        error.code === "1000" ||
        error.message?.includes("The authorization attempt failed for an unknown reason") ||
        error.message?.includes("dismissed")
      )
         { 
          console.log("[LoginScreen] Apple sign-in flow interrupted, ignoring:", error.code);
      } else {
        setToast({ message: `Apple sign-in failed: ${error?.message || "Unknown error"}`, type: "error" });
      }
    } finally {
      setAppleLoading(false);
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
        analytics.identify(email);
      analytics.loginCompleted('email');

      }
    } catch (e) {
      console.error("[LoginScreen] Login failed", e);
      const message = (e as any)?.message || "Login failed";
      setToast({ message, type: "error" });
    }
  };

  const loading = loginMutation.status === "pending";
  const hasError = loginMutation.status === "error" || googleLoginMutation.status === "error" || appleLoginMutation.status === "error";
  const error = loginMutation.error || googleLoginMutation.error || appleLoginMutation.error;

  useEffect(() => {
    const message = typeof error === "string" ? error : error?.message;
    if (hasError && message) {
      setToast({ message, type: "error" });
    }
  }, [hasError, error]);

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
          <Toast
            message={toast?.message || ""}
            type={toast?.type || "info"}
            visible={!!toast}
            onHide={() => setToast(null)}
          />
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
                testID="login_email"
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
                testID="login_password"
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

          {/* Forgot Password */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            testID="login_submit"
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

          {/* Google Sign In - not available on web */}
          {Platform.OS !== "web" && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                testID="login_google"
                onPress={handleGoogleSignIn}
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
              {/* Apple Sign In - iOS only */}
              {Platform.OS === "ios" && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />
              )}
            </>
          )}

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
    paddingHorizontal: isIPad ? 80 : Platform.OS === "web" ? 50 : 20,
    paddingVertical: isIPad ? 80 : Platform.OS === "web" ? 60 : 40,
  },
  card: {
    width: isIPad ? "82%" : Platform.OS === "web" ? "80%" : "100%",
    maxWidth: isIPad ? 780 : Platform.OS === "web" ? 700 : 600,
    minHeight: Platform.OS === "web" ? 670 : undefined,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: isIPad ? 56 : 24,
    paddingVertical: isIPad? 50 : 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
    height: isIPad ? 180 : 150,
  },
  logo: {
    width: isIPad ? 170 : 140,   
    height: isIPad ? 170 : 140,
  },
  appTitle: {
    fontSize: isIPad ? 40 : 32,
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
    color: "#1aabba",
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
  forgotPasswordText: {
    fontSize: 14,
    color: "#1aabba",
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
    backgroundColor: "#1aabba",
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
  appleButton: {
    width: "100%",
    height: 50,
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});
