// App.tsx
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./src/navigation/AppNavigator";
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

const queryClient = new QueryClient();

// 🔥 Toggle flag (change this later or read from .env)
const USE_MOCK = false;
console.log("USE_MOCK", USE_MOCK);
console.log('API Service:', USE_MOCK ? 'MOCK' : 'REAL');

// ✅ Initialize apiService once before rendering
setApiService(USE_MOCK ? mockApiService : realApiService);

/**
 * NotificationInitializer Component
 * Initializes push notifications after user is authenticated
 */
function NotificationInitializer() {
  const { token } = useAuth();
  const registerDeviceTokenMutation = useRegisterDeviceToken(token);

  useEffect(() => {
    if (!token) return;

    const initNotifications = async () => {
      try {
        console.log('[App] Initializing notifications for authenticated user');

        // Step 1: Initialize notifications (request permissions, get token)
        const deviceToken = await initializeNotifications();

        if (!deviceToken) {
          console.warn('[App] Failed to initialize notifications');
          return;
        }

        console.log('[App] Device token obtained:', deviceToken);

        // Step 2: Register device token with backend
        const platform = getPlatform();
        registerDeviceTokenMutation.mutate(
          { deviceToken, platform },
          {
            onSuccess: (response) => {
              console.log('[App] Device token registered successfully:', response);
            },
            onError: (error) => {
              console.error('[App] Failed to register device token:', error);
            },
          }
        );

        // Step 3: Set up notification listeners
        // Listen for notifications when app is in foreground
        const unsubscribeReceived = onNotificationReceived((notification) => {
          console.log('[App] Notification received while app is open:', notification);
          // You can update UI here based on notification data
        });

        // Listen for user tapping notification
        const unsubscribeResponse = onNotificationResponse((response) => {
          console.log('[App] User responded to notification:', response);
          handleNotificationResponse(response);
        });

        // Cleanup function
        return () => {
          unsubscribeReceived();
          unsubscribeResponse();
        };
      } catch (error) {
        console.error('[App] Error initializing notifications:', error);
      }
    };

    initNotifications();
  }, [token, registerDeviceTokenMutation]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationInitializer />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
