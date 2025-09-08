// src/screens/HomeScreen.tsx
import React from "react";
import { View, FlatList } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useChatStore } from "../stores/chatStore";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";
import Layout from "../components/UI/layout";
import  { Card } from "../components/UI/Card";
import  { Button } from "../components/UI/Button";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const { token, signOut } = useAuth();
  const { messages } = useChatStore();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const { data: moodCount = 0, isLoading: moodLoading } = useFetchMoodCount(token);
  const { data: reminderCount = 0, isLoading: reminderLoading } = useFetchReminderCount(token);

  const cards = [
    { key: "chat", title: "Chat", subtitle: `${messages.length} messages` },
    { key: "mood", title: "Mood", subtitle: moodLoading ? "Loading..." : `${moodCount} logs this week` },
    { key: "reminders", title: "Reminders", subtitle: reminderLoading ? "Loading..." : `${reminderCount} upcoming` },
  ];

  return (
    <Layout title="Home" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
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
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Button title="Logout" onPress={signOut} variant="danger" />
      </View>
    </Layout>
  );
};

export default HomeScreen;
