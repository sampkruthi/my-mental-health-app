// src/components/BottomNav.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useNavigationState, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import type { NavigationState, Route } from "@react-navigation/native";

type NavKeys = keyof RootStackParamList;

const tabs: { name: NavKeys; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: "Home", label: "Home", icon: "home-outline" },
  { name: "chat", label: "Chat", icon: "chatbubble-outline" },
  { name: "mood", label: "Mood", icon: "happy-outline" },
  { name: "journal", label: "Journal", icon: "book-outline" },
  { name: "resources", label: "Resources", icon: "layers-outline" },
  { name: "reminders", label: "Reminders", icon: "notifications-outline" },
  { name: "progressdashboard", label: "Progress", icon: "trending-up-outline" },
];

// Minimum width per tab to ensure labels like "Reminders" fit
const MIN_TAB_WIDTH = 76;

const BottomNav: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
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

  // If all tabs fit on screen, distribute evenly; otherwise use min width and scroll
  const allFit = width / tabs.length >= MIN_TAB_WIDTH;
  const tabWidth = allFit ? width / tabs.length : MIN_TAB_WIDTH;

  const tabButtons = tabs.map((tab) => {
    const isActive = activeRouteName === tab.name;
    const color = isActive ? colors.primary : colors.text;

    return (
      <TouchableOpacity
        key={tab.name}
        style={[styles.button, { width: tabWidth }]}
        onPress={() => navigation.navigate(tab.name)}
        accessibilityLabel={`${tab.label} tab`}
      >
        <Ionicons name={tab.icon} size={22} color={color} />
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  });

  // If all tabs fit, render flat row; otherwise wrap in horizontal ScrollView
  if (allFit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        {tabButtons}
      </View>
    );
  }

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.cardBackground }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabButtons}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 8,
  },
  outerContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default BottomNav;
