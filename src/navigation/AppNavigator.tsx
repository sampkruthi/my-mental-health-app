// src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/Auth/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import MoodTrackerScreen from "../screens/MoodTrackerScreen/MoodTrackerScreen";
import MoodHistoryScreen from "../screens/MoodTrackerScreen/MoodHistoryScreen";
import GuidedActivitiesScreen from "../screens/GuidedActivitiesScreen/GuidedActivitiesScreen";
import JournalingScreen from "../screens/JournalingScreen/JournalingScreen";
import ResourcesScreen from "../screens/ResourcesScreen/ResourcesScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  chat: undefined;
  mood: undefined;
  moodhistory : undefined;
  activities : undefined;
  journal:undefined;
  resources : undefined;
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
        <Stack.Screen name="mood" component={MoodTrackerScreen} />
        <Stack.Screen name="moodhistory" component={MoodHistoryScreen} />
        <Stack.Screen name="activities" component={GuidedActivitiesScreen} />
        <Stack.Screen name="journal" component={JournalingScreen}/>
        <Stack.Screen name="resources" component={ResourcesScreen}/>
        </>
      )}
    </Stack.Navigator>
  );
}
