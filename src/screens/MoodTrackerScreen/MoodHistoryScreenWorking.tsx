// src/screens/MoodHistoryScreen.tsx
import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useFetchMoodHistory } from "../../api/hooks";
//import type { MoodLog } from "../../api/types";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

const MoodHistoryScreen = () => {
  const { colors } = useTheme();
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: moodHistory = [], isLoading, isError, error } = useFetchMoodHistory(token);
  console.log('Mood History Data:', moodHistory); // DEBUG
  console.log('Is Loading:', isLoading); // DEBUG


  return (
    <Layout
      title="Mood History"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Your Mood History</Text>

        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>
              Loading mood history...
            </Text>
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <Text style={[styles.errorText, { color: 'red' }]}>
              Error: {error?.message || 'Failed to load mood history'}
            </Text>
          </View>
        ) : moodHistory.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No mood entries yet. Log your first mood!
            </Text>
          </View>
        ) : (
          <FlatList
            data={moodHistory}
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.entry,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.date, { color: colors.subText }]}>
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </Text>
                <Text style={[styles.score, { color: colors.text }]}>
                  Score: {item.mood_score} / 5
                </Text>
                {item.note ? (
                  <Text style={[styles.note, { color: colors.text }]}>"{item.note}"</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  entry: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  score: {
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
});

export default MoodHistoryScreen;
