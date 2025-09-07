// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useChatStore } from "../stores/chatStore";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";

const HomeScreen = () => {
  const { token, signOut } = useAuth();
  const { messages } = useChatStore();

  const { data: moodCount = 0, isLoading: moodLoading } = useFetchMoodCount(token);
  const { data: reminderCount = 0, isLoading: reminderLoading } = useFetchReminderCount(token);

  const cards = [
    { key: "chat", title: "Chat", subtitle: `${messages.length} messages` },
    { key: "mood", title: "Mood", subtitle: moodLoading ? "Loading..." : `${moodCount} logs this week` },
    { key: "reminders", title: "Reminders", subtitle: reminderLoading ? "Loading..." : `${reminderCount} upcoming` },
  ];

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Force Logout" onPress={signOut} color="red" />
      <FlatList
        data={cards}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ padding: 12, marginBottom: 12, backgroundColor: "#EEE" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.subtitle}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeScreen;
