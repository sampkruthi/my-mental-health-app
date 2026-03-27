// src/screens/MoodTrackerScreen.tsx
import React, {useState} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Platform
} from "react-native";
import Toast from "../../components/UI/Toast";
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
const isIPad = Platform.OS === 'ios' && Platform.isPad;

const MoodTrackerScreen = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient(); 


  const [current, setCurrent] = React.useState<number | null>(null);
  const [note, setNote] = React.useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);


  //const { width } = useWindowDimensions();

  //  Fetch mood history
  const { data: moodHistory = [], isLoading: historyLoading } = useFetchMoodHistory(token);

  //  Log mood mutation
  const logMoodMutation = useLogMood(token);

  const handleLogMood = async () => {
    if (!current) {
      setToast({ message: "Please select a mood first", type: "error" });
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
      setToast({ message: "Mood logged successfully!", type: "success" });
    } catch (err) {
      console.error("Error logging mood:", err);
      setToast({ message: "Failed to log mood. Please try again", type: "error" });
    }
  };

  // Only show last 7 entries in chart for better readability
  const recentMoods = moodHistory.slice(-7);


  return (
    <Layout title="Mood Tracker" onNavigate={(screen) => navigation.navigate(screen as never)}>
       <Toast
        message={toast?.message || ""}
        type={toast?.type || "success"}
        visible={!!toast}
        onHide={() => setToast(null)}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* New Entry */}
        <Text style={[styles.heading, { color: colors.text }]}>How are you feeling?</Text>
        <View style={styles.emojiRow}>
          {emojiOptions.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.emojiButton,
                current === index + 1 && styles.emojiButtonSelected, //added this instead for UX testing
                /*{ 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }, */
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
                  day: "numeric",
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })
              ),
              datasets: [
                {
                  data: recentMoods.map((m) => m.mood_score),
                },
                {
                  data: [1], // min value anchor
                  withDots: false,
                },
                {
                  data: [5], // max value anchor
                  withDots: false,
                },
              ],
            }}
            width={Math.min(screenWidth - 30, 900)}
            height={screenWidth < 400 ? 180 : 220}
            yAxisInterval={1}
            segments={4}
            fromZero={false}
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
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: isIPad ? 700 : undefined,
    width: "100%",
    alignSelf: "center",
    padding: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3, //changed for UX
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emojiButton: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E0E0E0", //lighter gray for UX "#ccc",
    backgroundColor: "#fff",
    // ADD shadow:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  // ADD this style for selected emoji:
  emojiButtonSelected: {
    borderColor:"#1aabba",
    backgroundColor: `"#1aabba1a`,  // 10% opacity of primary updating to brighter teal color
    transform: [{ scale: 1.05 }],  // Slightly bigger when selected
  },

  emoji: {
    fontSize: 28,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
  },
  logButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    // ADD shadow:
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logButtonDisabled: {
    opacity: 0.5,
  },
  logButtonText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
    textDecorationLine: 'underline', //Add for UX to make it look clickable
  },
});

export default MoodTrackerScreen;