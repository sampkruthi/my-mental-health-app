// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, Alert, Button } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";
import Layout from "../components/UI/layout";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
//import Logo from "../images/Meditating_logo.png";
import Logo from "../images/MeditatingLogoTransparent.png";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from "../constants/styles";
import { initializeNotifications } from "../notificationService";

const CARD_MARGIN = 12;

const HomeScreen = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: moodCount = 0, isLoading: moodLoading } = useFetchMoodCount(token);
  const { data: reminderCount = 0, isLoading: reminderLoading } = useFetchReminderCount(token);

  const screenWidth = Dimensions.get("window").width;
  const isLargeScreen = screenWidth > 800; // 3 cards per row on web/tablet

  const cards = [
    { key: "chat", title: "Chat", subtitle: "Start a conversation" },
    { key: "mood", title: "Mood", subtitle: moodLoading ? "Loading..." : `${moodCount} mood logs this week` },
    { key: "journal", title: "Journal", subtitle: "Write a new entry" },
    //{ key: "activities", title: "Activities", subtitle: "Explore exercises" },
    { key: "reminders", title: "Reminders", subtitle: reminderLoading ? "Loading..." : `${reminderCount} today` },
    { key: "resources", title: "Resources", subtitle: " Recommended  Resources" },
    { key: "memorysummary", title: "Summary", subtitle: "Your journey so far" },
    { key: "progressdashboard", title: "Progress", subtitle: "Your progress stats"},

  ];

  return (
    <Layout title="Home" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: SPACING.md,
          paddingTop: SPACING.md,
          paddingBottom: SPACING.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.date, { color: colors.subText }]}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={[styles.welcome, { color: colors.text }]}>
          Welcome, how are you feeling today?
        </Text>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />

        {/* Cards Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {cards.map((item) => (
            <Layout.Card
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => navigation.navigate(item.key as never)}
              style={{
                width: isLargeScreen ? "30%" : "48%", // responsive columns
                aspectRatio: 1.2, // control height relative to width
                marginBottom: 16,  // Changed from CARD_MARGIN (12)
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.cardBackground,
                borderRadius: 20,  // Changed from BORDER_RADIUS.lg -> rounder
                // ADD these shadow properties:
                shadowColor: '#000', // colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1, // 0.08,
                shadowRadius: 12,
                elevation: 4, //3,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  date: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
    textAlign: "center",
    fontWeight: '500',  //Add medium weight
  },
  welcome: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    marginBottom: SPACING.xl,// Changed from lg -> more space
    letterSpacing: -0.5,  // ADD: Tighter letter spacing for elegance
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: SPACING.xl,
    alignSelf: "center",
  },
});

export default HomeScreen;
