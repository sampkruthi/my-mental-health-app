// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
//import { useChatStore } from "../stores/chatStore";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";
import Layout from "../components/UI/layout";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Avatar from "../images/avatar.png";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as Hooks from "../api/hooks";

const HomeScreen = () => {
  const { token, signOut } = useAuth();
  //const { messages } = useChatStore();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: moodCount = 0, isLoading: moodLoading } = useFetchMoodCount(token);
  const { data: reminderCount = 0, isLoading: reminderLoading } = useFetchReminderCount(token);
  console.log(Hooks);

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Section */}
        <Text style={[styles.date, { color: colors.subText }]}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Text>
        <Text style={[styles.welcome, { color: colors.text }]}>
          Welcome, how are you feeling today?
        </Text>

        <Image
          source={Avatar} // ✅ Add avatar.png in assets
          style={styles.avatar}
          resizeMode="contain"
        />

        {/* Cards Grid */}
        <FlatList
          data={cards}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Card
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => navigation.navigate(item.key as never)}
            />
          )}
          numColumns={2} // ✅ 2-column grid
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Button title="Logout" onPress={signOut} />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    marginBottom: 6,
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
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
});

export default HomeScreen;
