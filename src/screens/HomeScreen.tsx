import React from "react";
import { View, Text, Image, StyleSheet, StatusBar, Platform } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";
import Layout from "../components/UI/layout";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Avatar from "../images/avatar.png";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

//const { width } = Dimensions.get("window");
//const NUM_COLUMNS = 2;
const CARD_MARGIN = 12; // space between cards
//const CARD_ASPECT_RATIO = 0.6; // height = width * ratio

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
    { key: "resources", title: "Resources", subtitle: "Read articles" },
  ];

  // calculate card width and height
  //const cardWidth = (width - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
  //const cardHeight = cardWidth * CARD_ASPECT_RATIO;

  return (
  <Layout title="Mental Health App" onNavigate={(screen) => navigation.navigate(screen as never)}>
    <View
      style={{
        paddingHorizontal: CARD_MARGIN,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 16 : 16, // added status bar padding
      }}
    >
      {/* Header */}
      <Text style={[styles.date, { color: colors.subText }]}>
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </Text>
      <Text style={[styles.welcome, { color: colors.text }]}>
        Welcome, how are you feeling today?
      </Text>
      <Image source={Avatar} style={styles.avatar} resizeMode="contain" />

      {/* Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {cards.map((item) => (
          <Layout.Card
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => navigation.navigate(item.key as never)}
            style={{
              width: '48%', // two cards per row, with space between
              aspectRatio: 1.6, // height = width * 0.625
              marginBottom: CARD_MARGIN,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        ))}
      </View>
    </View>
  </Layout>
);
};

const styles = StyleSheet.create({
  date: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  welcome: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: "center",
  },
});

export default HomeScreen;
