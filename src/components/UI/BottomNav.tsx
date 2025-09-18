// src/components/BottomNav.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useNavigationState, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import type { NavigationState, Route } from "@react-navigation/native";

type NavKeys = keyof RootStackParamList;

const tabs: { name: NavKeys; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: "chat", label: "Chat", icon: "chatbubble-outline" },
  { name: "mood", label: "Mood", icon: "happy-outline" },
  { name: "journal", label: "Journal", icon: "book-outline" },
  { name: "activities", label: "Activities", icon: "checkmark-done-outline" },
  { name: "resources", label: "Resources", icon: "layers-outline" },
 // { name: "reminders", label: "Reminders", icon: "notifications-outline" },
];

const BottomNav: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Get the currently active route name
  const activeRouteName = useNavigationState((state) => {
    if (!state) return undefined;

    let route: Route<string, object | undefined> = state.routes[state.index];

    // descend into nested navigators safely
    while ((route as Partial<{ state: NavigationState }>).state?.index !== undefined) {
      const nestedState = (route as Partial<{ state: NavigationState }>).state as NavigationState;
      route = nestedState.routes[nestedState.index];
    }

    return route.name as NavKeys;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      {tabs.map((tab) => {
        const isActive = activeRouteName === tab.name;
        const color = isActive ? colors.primary : colors.text;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.button}
            onPress={() => navigation.navigate(tab.name)}
            accessibilityLabel={`${tab.label} tab`}
          >
            <Ionicons name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 8,
  },
  button: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default BottomNav;
