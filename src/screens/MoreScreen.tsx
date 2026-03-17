// src/screens/MoreScreen.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Layout from "../components/UI/layout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isIPad = Platform.OS === "ios" && SCREEN_WIDTH >= 768;

type MenuItem = {
  key: keyof RootStackParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
};

const menuItems: MenuItem[] = [
  {
    key: "journal",
    label: "Journal",
    icon: "book-outline",
    description: "Write and review entries",
  },
  {
    key: "resources",
    label: "Resources",
    icon: "layers-outline",
    description: "Recommended articles and content",
  },
  {
    key: "reminders",
    label: "Reminders",
    icon: "notifications-outline",
    description: "Manage your reminders",
  },
  {
    key: "mood",
    label: "Mood Tracker",
    icon: "happy-outline",
    description: "View mood history and trends",
  },
  {
    key: "activities",
    label: "Activities",
    icon: "leaf-outline",
    description: "Guided exercises and practices",
  },
];

const MoreScreen = () => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Layout
      title="More"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.menuItem,
              {
                backgroundColor: colors.cardBackground,
                borderColor: "#e0e0e0",
              },
            ]}
            onPress={() => navigation.navigate(item.key as never)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#e8f4f5" }]}
            >
              <Ionicons
                name={item.icon}
                size={isIPad ? 24 : 20}
                color={colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.menuLabel,
                  { color: colors.text, fontSize: isIPad ? 18 : 16 },
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.menuDescription,
                  { color: colors.subText, fontSize: isIPad ? 14 : 12 },
                ]}
              >
                {item.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={isIPad ? 20 : 16}
              color={colors.subText}
            />
          </TouchableOpacity>
        ))}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  menuLabel: {
    fontWeight: "600",
  },
  menuDescription: {
    marginTop: 2,
  },
});

export default MoreScreen;
