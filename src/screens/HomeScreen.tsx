import React from "react";
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";
import Layout from "../components/UI/layout";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Avatar from "../images/avatar.png";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS * 4)) / NUM_COLUMNS;

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

  return (
    <Layout title="Home" onNavigate={(screen) => navigation.navigate(screen as never)}>
      
      <View style={{ width: "100%", paddingHorizontal: 16 }}>
        {/* Header */}
        <Text style={[styles.date, { color: colors.subText }]}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Text>
        <Text style={[styles.welcome, { color: colors.text }]}>
          Welcome, how are you feeling today?
        </Text>
        <Image source={Avatar} style={styles.avatar} resizeMode="contain" />

        {/* Cards Grid */}
        <FlatList
          data={cards}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Layout.Card
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => navigation.navigate(item.key as never)}
               style={{
    width: CARD_WIDTH,        // fixed width
    height: 150,             // fixed height
    marginHorizontal: CARD_MARGIN / 2,
    justifyContent: "center", // center content vertically
    alignItems: "center",     // center content horizontally
  }}
            />
          )}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={{ justifyContent: "center", marginBottom: CARD_MARGIN }}
          scrollEnabled={false} // optional: prevent scroll if not needed
        />
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
