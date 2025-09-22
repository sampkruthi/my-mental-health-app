// src/screens/MoodTrackerScreen.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,

} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
//import { useAuth } from "../../context/AuthContext";
import { useFetchMoodHistory, useLogMood } from "../../hooks/mood";
//import type { MoodLog, MoodTrend } from "../../../services/mock_data/mood";
//import { moodApi } from "../../../services/mock_data/mood";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

const emojiOptions = ["😞", "😐", "😊", "😃", "😁"];

const { width: screenWidth } = Dimensions.get("window");

const MoodTrackerScreen = () => {
  //const { token } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [current, setCurrent] = React.useState<number | null>(null);
  const [note, setNote] = React.useState("");

  //const { width } = useWindowDimensions();

  // ✅ Fetch mood history
  const { data: moodHistory = [], isLoading: historyLoading } = useFetchMoodHistory();

  // ✅ Log mood mutation
  const logMoodMutation = useLogMood();

  const handleLogMood = async () => {
    if (!current) return;
    try {
      await logMoodMutation.mutateAsync({ score: current, note });
      setCurrent(null);
      setNote("");
    } catch (err) {
      console.error("Error logging mood:", err);
    }
  };

  return (
    <Layout title="Mood Tracker" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* New Entry */}
        <Text style={[styles.heading, { color: colors.text }]}>New Entry</Text>
        <View style={styles.emojiRow}>
          {emojiOptions.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.emojiButton,
                current === index + 1 && { backgroundColor: colors.primary },
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
          style={[styles.logButton, { backgroundColor: colors.primary }]}
          onPress={handleLogMood}
          disabled={logMoodMutation.isPending} // ✅ disable while loading
        >
          <Text style={[styles.logButtonText, { color: colors.background }]}>
            {logMoodMutation.isPending ? "Logging..." : "Log Mood"}
          </Text>
        </TouchableOpacity>

        {/* Recent Trends */}
        <Text style={[styles.heading, { color: colors.text, marginTop: 20 }]}>Recent Trends</Text>

        {historyLoading ? (
          <Text style={{ color: colors.subText }}>Loading mood history...</Text>
        ) : moodHistory.length > 0 ? (
          <LineChart
  data={{
    labels: moodHistory.map((m) =>
      new Date(m.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        data: moodHistory.map((m) => m.mood_score),
      },
    ],
  }}
  width={Math.min(screenWidth - 30, 900)} // ✅ never crumples, max 900px
  height={screenWidth < 400 ? 180 : 220}   // ✅ smaller height on phones
  yAxisInterval={1}
  chartConfig={{
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => colors.primary,
    labelColor: () => colors.text,
    style: { borderRadius: 16 },
    propsForLabels: {
      fontSize: screenWidth < 400 ? 8 : 12, // ✅ smaller labels on phones
    },
  }}
  bezier
  style={{
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: "center", // ✅ center align
  }}
/>

        ) : (
          <Text style={{ color: colors.subText }}>No mood data yet</Text>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("moodhistory" as never)}>
          <Text style={[styles.link, { color: colors.primary }]}>View History</Text>
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
    borderWidth: 1,
    borderColor: "#ccc",
  },
  emoji: {
    fontSize: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  logButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default MoodTrackerScreen;
