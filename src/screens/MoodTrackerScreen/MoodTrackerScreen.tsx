// src/screens/MoodTrackerScreen.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator

} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useQueryClient } from "@tanstack/react-query"; 
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useFetchMoodHistory, useLogMood } from "../../api/hooks";
//import type { MoodLog, MoodTrend } from "../../../services/mock_data/mood";
//import { moodApi } from "../../../services/mock_data/mood";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

const emojiOptions = ["😞", "😐", "😊", "😃", "😁"];

const { width: screenWidth } = Dimensions.get("window");

const MoodTrackerScreen = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient(); 


  const [current, setCurrent] = React.useState<number | null>(null);
  const [note, setNote] = React.useState("");

  //const { width } = useWindowDimensions();

  //  Fetch mood history
  const { data: moodHistory = [], isLoading: historyLoading } = useFetchMoodHistory(token);

  //  Log mood mutation
  const logMoodMutation = useLogMood(token);

  const handleLogMood = async () => {
    if (!current) {
      alert('Please select a mood first');
       return;
    }
    try {
      console.log('Logging mood:', {score: current, note});
      await logMoodMutation.mutateAsync({ score: current, note });
      console.log(' Mood logged successfully'); 
      //Clear form
      setCurrent(null);
      setNote("");

      //Invalidate queries to refetch
      queryClient.invalidateQueries({queryKey: ["mood", "history", token] });
      alert('Mood logged successfully');
    } catch (err) {
      console.error("Error logging mood:", err);
      alert('Failed to log mood. Please try again');
    }
  };

  // Only show last 7 entries in chart for better readability
  const recentMoods = moodHistory.slice(-7);


  return (
    <Layout title="Mood Tracker" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* New Entry */}
        <Text style={[styles.heading, { color: colors.text }]}>How are you feeling?</Text>
        <View style={styles.emojiRow}>
          {emojiOptions.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.emojiButton,
                current === index + 1 && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setCurrent(index + 1)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="Add a note (optional)"
          value={note}
          onChangeText={setNote}
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
          placeholderTextColor={colors.subText}
        />

        <TouchableOpacity
          style={[
            styles.logButton, 
            { backgroundColor: colors.primary },
            (!current || logMoodMutation.isPending) && styles.logButtonDisabled
          ]}
          onPress={handleLogMood}
          disabled={!current || logMoodMutation.isPending}
        >
          <Text style={[styles.logButtonText, { color: colors.background }]}>
            {logMoodMutation.isPending ? "Logging..." : "Log Mood"}
          </Text>
        </TouchableOpacity>

        {/* Recent Trends */}
        <Text style={[styles.heading, { color: colors.text, marginTop: 20 }]}>
          Recent Trends (Last 7 days)
        </Text>

        {historyLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.subText, marginTop: 8 }}>
              Loading mood history...
            </Text>
          </View>
        ) : recentMoods.length > 0 ? (
          <LineChart
            data={{
              labels: recentMoods.map((m) =>
                new Date(m.timestamp).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric" 
                })
              ),
              datasets: [
                {
                  data: recentMoods.map((m) => m.mood_score),
                },
              ],
            }}
            width={Math.min(screenWidth - 30, 900)}
            height={screenWidth < 400 ? 180 : 220}
            yAxisInterval={1}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.text,
              style: { borderRadius: 16 },
              propsForLabels: {
                fontSize: screenWidth < 400 ? 8 : 12,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              alignSelf: "center",
            }}
          />
        ) : (
          <Text style={{ color: colors.subText, textAlign: 'center', marginTop: 16 }}>
            No mood data yet. Log your first mood above!
          </Text>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("moodhistory" as never)}>
          <Text style={[styles.link, { color: colors.primary }]}>
            View Full History ({moodHistory.length} entries)
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth > 800 ? 900 : "100%",
    alignSelf: "center",
    padding: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emojiButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  emoji: {
    fontSize: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  logButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  logButtonDisabled: {
    opacity: 0.5,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  link: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default MoodTrackerScreen;

