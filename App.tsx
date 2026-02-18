// App.tsx
import React, { useEffect, useRef } from "react";
import { NavigationContainer, NavigationContainerRef, LinkingOptions } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, ActivityIndicator } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import type { RootStackParamList } from "./src/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";

// Import API services
import { setApiService, realApiService } from "./services/api";
import { mockApiService } from "./services/mockApi";

// Import notification service
import {
  initializeNotifications,
  onNotificationReceived,
  onNotificationResponse,
  handleNotificationResponse,
  getPlatform,
} from "./src/notificationService";
import { useRegisterDeviceToken } from "./src/api/hooks";

// Import auth error handler
import { registerAuthErrorHandlers } from "./src/utils/authErrorHandler";

const queryClient = new QueryClient();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["https://bodhira.ai", "https://web.bodhira.ai", "bodhira://",],
  config: {
    screens: {
      ResetPassword: {
        path: "reset-password",
        parse: {
          token: (token: string) => token,
        },
      },
    },
  },
};

// Navigation ref for redirecting to Login on auth errors
//const navigationRef = useRef<NavigationContainerRef<any>>(null);

// Toggle flag
const USE_MOCK = false;
console.log("USE_MOCK", USE_MOCK);
console.log('API Service:', USE_MOCK ? 'MOCK' : 'REAL');

// Initialize apiService once before rendering
setApiService(USE_MOCK ? mockApiService : realApiService);

/**
 * NotificationInitializer Component
 * Must be inside AuthProvider to use useAuth
 */
function NotificationInitializer() {
  const { token } = useAuth();
  const registerDeviceTokenMutation = useRegisterDeviceToken(token);

  useEffect(() => {
    // Don't initialize if not logged in
    if (!token) {
      console.log('[App] No token, skipping notification init');
      return;
    }

    let unsubscribeReceived: (() => void) | undefined;
    let unsubscribeResponse: (() => void) | undefined;

    const initNotifications = async () => {
      try {
        console.log('[App] Initializing notifications for authenticated user');

        // Step 1: Initialize notifications (request permissions, get token)
        const deviceToken = await initializeNotifications();

        if (!deviceToken) {
          console.warn('[App] Failed to get device token (may not be available)');
          return;
        }

        console.log('[App] Device token obtained');

        // Step 2: Register device token with backend
        const platform = getPlatform();
        registerDeviceTokenMutation.mutate(
          { deviceToken, platform },
          {
            onSuccess: () => {
              console.log('[App] Device token registered successfully');
            },
            onError: (error) => {
              console.error('[App] Failed to register device token:', error);
            },
          }
        );

        // Step 3: Set up notification listeners (with safety checks)
        try {
          unsubscribeReceived = onNotificationReceived((notification) => {
            console.log('[App] Notification received:', notification);
          });
        } catch (e) {
          console.warn('[App] Could not set up notification received listener:', e);
        }

        try {
          unsubscribeResponse = onNotificationResponse((response) => {
            console.log('[App] User responded to notification:', response);
            handleNotificationResponse(response);
          });
        } catch (e) {
          console.warn('[App] Could not set up notification response listener:', e);
        }

      } catch (error) {
        console.error('[App] Error initializing notifications:', error);
      }
    };

    initNotifications();

    // Cleanup
    return () => {
      if (unsubscribeReceived) unsubscribeReceived();
      if (unsubscribeResponse) unsubscribeResponse();
    };
  }, [token]); // Remove registerDeviceTokenMutation from deps to avoid infinite loop

  return null;
}

/**
 * Main App Content - Inside all providers
 */
function AppContent({ navigationRef }: { navigationRef: React.RefObject<NavigationContainerRef<any> | null> }) {
  const { restoreComplete, signOut } = useAuth();

  // Register auth error handlers once on component mount
  useEffect(() => {
    const onUnauthorized = async () => {
      console.log('[App] Unauthorized error - calling signOut');
      await signOut();
    };

    const onNavigateToLogin = () => {
      console.log('[App] Redirecting to Login screen');
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    };

    registerAuthErrorHandlers(onUnauthorized, onNavigateToLogin);
  }, [signOut, navigationRef]);

  // Show loading while restoring auth
  if (!restoreComplete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <>
      <NotificationInitializer />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent navigationRef={navigationRef} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
