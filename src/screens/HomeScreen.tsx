// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";
import Layout from "../components/UI/layout";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
//import Logo from "../images/Meditating_logo.png";
import Logo from "../images/MeditatingLogoTransparent.png";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SPACING, TYPOGRAPHY } from "../constants/styles";

const HomeScreen = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: moodCount = 0, isLoading: moodLoading } = useFetchMoodCount(token);
  const { data: reminderCount = 0, isLoading: reminderLoading } = useFetchReminderCount(token);

  const cards = [
    { key: "chat", title: "Chat", subtitle: "Start a conversation" },
    { key: "mood", title: "Mood", subtitle: moodLoading ? "Loading..." : `${moodCount} mood logs this week` },
    { key: "journal", title: "Journal", subtitle: "Write a new entry" },
    { key: "activities", title: "Activities", subtitle: "Explore exercises" },
    { key: "reminders", title: "Reminders", subtitle: reminderLoading ? "Loading..." : `${reminderCount} today` },
    { key: "resources", title: "Resources", subtitle: " Recommended  Resources" },
    { key: "progressdashboard", title: "Progress", subtitle: "Your progress stats"},

  ];

  return (
    <Layout title="Home" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: SPACING.md,
          paddingTop: SPACING.md,
          paddingBottom: SPACING.md,
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
        <View style={{ alignItems: "center" }}>
          {cards.map((item) => (
            <Layout.Card
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => navigation.navigate(item.key as never)}
              titleColor="#FFFFFF"
              subtitleColor="#FFFFFF"
              style={{
                width: "90%", // Slightly smaller width
                aspectRatio: 2.2, // Taller cards (smaller ratio = taller)
                marginBottom: 16,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.primary,
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
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
    marginBottom: SPACING.lg,// Changed from lg -> more space
    letterSpacing: -0.5,  // ADD: Tighter letter spacing for elegance
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: SPACING.lg,
    alignSelf: "center",
  },
});

export default HomeScreen;
