// src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/Auth/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ChatScreen from "../screens/ChatScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token, restoreComplete } = useAuth();

  // Wait until token restore is done
  if (!restoreComplete) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="chat" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
