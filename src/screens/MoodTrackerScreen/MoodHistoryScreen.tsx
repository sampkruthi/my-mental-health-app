// src/screens/MoodHistoryScreen.tsx
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
import { useFetchMoodHistory } from "../../hooks/mood";
import type { MoodLog } from "../../../services/mock_data/mood";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

const MoodHistoryScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: moodHistory = [], isLoading } = useFetchMoodHistory();

  return (
    <Layout
      title="Mood History"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Your Mood History</Text>

        {isLoading ? (
          <Text style={{ color: colors.subText }}>Loading...</Text>
        ) : (
          <FlatList
            data={moodHistory as MoodLog[]}
            keyExtractor={(item) => item.id.toString()}
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
                    ? new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </Text>
                <Text style={[styles.score, { color: colors.text }]}>
                  Score: {item.mood_score}
                </Text>
                {item.note ? (
                  <Text style={[styles.note, { color: colors.text }]}>{item.note}</Text>
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
