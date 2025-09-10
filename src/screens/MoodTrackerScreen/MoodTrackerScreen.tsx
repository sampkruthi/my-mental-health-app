// src/screens/MoodTrackerScreen.tsx
import React from "react";
import { View, Text, TextInput, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useFetchMoodHistory, useLogMood } from "../../api/hooks";
//import type { MoodLog } from "../../api/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

const emojiOptions = ["😞","😐","😊","😃","😁"]; // Example emojis

const { width } = Dimensions.get("window");

import { useWindowDimensions } from "react-native";

const MoodTrackerScreen = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [current, setCurrent] = React.useState<number | null>(null);
  const [note, setNote] = React.useState("");

  const { width: screenWidth } = useWindowDimensions();

  // Fetch mood history
  const { data: moodHistory = [], isLoading } = useFetchMoodHistory(token);

  // Log mood mutation
  const logMoodMutation = useLogMood(token);

  const handleLogMood = async () => {
    if (!current) return;
    try {
      await logMoodMutation.mutateAsync({ score: current, note });
      setCurrent(null);
      setNote("");
    } catch (err) {
      console.log("Error logging mood:", err);
    }
  };

  return (
    <Layout title="Mood Tracker" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* New Entry Section */}
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
  style={[
    styles.logButton,
    { backgroundColor: colors.primary } // your theme color
  ]}
  onPress={handleLogMood}
>
  <Text style={[styles.logButtonText, { color: colors.background }]}>
    Log Mood
  </Text>
</TouchableOpacity>


        {/* Recent Trends Section */}
        <Text style={[styles.heading, { color: colors.text, marginTop: 20 }]}>
          Recent Trends
        </Text>

        {isLoading ? (
          <Text style={{ color: colors.subText }}>Loading mood history...</Text>
        ) : moodHistory.length > 0 ? (
          <LineChart
            data={{
              labels: moodHistory.map((m) =>
                new Date(m.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              ),
              datasets: [
                {
                  data: moodHistory.map((m) => m.score),
                },
              ],
            }}
              width={screenWidth > 800 ? 900 : screenWidth - 30} // ✅ responsive width
              height={200} // you can also shrink this if too tall
            yAxisInterval={1}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.text,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
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
    width: width > 800 ? 900 : "100%", // Use fixed width on desktop, full on mobile
    alignSelf: "center",               // center horizontally
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
  link: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
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

});

export default MoodTrackerScreen;
