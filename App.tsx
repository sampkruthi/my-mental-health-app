// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext"; 

// Import API services
import { setApiService, realApiService } from "./services/api";
import { mockApiService } from "./services/mockApi";

const queryClient = new QueryClient();

// 🔥 Toggle flag (change this later or read from .env)
const USE_MOCK = true;

// ✅ Initialize apiService once before rendering
setApiService(USE_MOCK ? mockApiService : realApiService);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
