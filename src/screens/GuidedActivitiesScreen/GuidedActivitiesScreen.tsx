// src/screens/GuidedActivitiesScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, Modal, ScrollView, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Audio } from "expo-av";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GuidedActivity } from "../../api/types";
import { useFetchActivities } from "../../api/hooks";
import { Button } from "../../components/UI/Button";
import Layout from "../../components/UI/layout";

const isIPad = Platform.OS === "ios" && Platform.isPad;

const GuidedActivitiesScreen = () => {
  const { colors } = useTheme();
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: activities = [], isLoading } = useFetchActivities(token); // replace with real token
  const insets = useSafeAreaInsets();

  const [selectedActivity, setSelectedActivity] = useState<GuidedActivity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const handleStart = (activity: GuidedActivity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  const handleToggleAudio = async () => {
    if (!selectedActivity?.audioUrl) {
      return;
    }

    try {
      if (!sound) {
        setIsLoadingAudio(true);
        const { sound: createdSound } = await Audio.Sound.createAsync(
          { uri: selectedActivity.audioUrl },
          { shouldPlay: true }
        );
        setSound(createdSound);
        setIsPlaying(true);
        setIsLoadingAudio(false);
        return;
      }

      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        setIsPlaying(false);
        return;
      }
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (_error) {
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  const handleDone = () => {
    if (sound) {
      sound.stopAsync().catch(() => {});
      sound.unloadAsync().catch(() => {});
      setSound(null);
      setIsPlaying(false);
    }
    setModalVisible(false);
    setSelectedActivity(null);
  };

  const renderCard = ({ item }: { item: GuidedActivity }) => (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
      {item.thumbnail && <Image source={item.thumbnail} style={styles.thumbnail} />}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{item.title}</Text>
        <Text style={[styles.cardBadge, { backgroundColor: colors.primaryContainer, color: colors.onPrimaryContainer }]}>
          {item.type}
        </Text>
        <Text style={[styles.cardDescription, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
          {item.description}
        </Text>
        {item.audioUrl && (
          <Text style={[styles.audioGuidedLabel, { color: colors.onSurfaceVariant }]}>
            Audio Guided
          </Text>
        )}
        <View style={{ marginTop: 12, width: 80 }}>
          <TouchableOpacity onPress={() => handleStart(item)} activeOpacity={0.8}>
            <LinearGradient
              colors={["#1AABBA", "#a8e4e0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Layout title="Guided Activities" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.header, { color: colors.text }]}>Recommended Exercises</Text>

        {isLoading ? (
          <Text style={{ color: colors.onSurfaceVariant }}>Loading...</Text>
        ) : (
          <FlatList
            data={activities.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}

        <Modal visible={modalVisible} animationType="slide">
          <LinearGradient
            colors={["#ffffff", "#fbf9f2"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              flex: 1,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            }}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalHeaderTitle, { color: colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {selectedActivity?.title}
              </Text>
              <TouchableOpacity onPress={handleDone} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.onSurface }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContainer}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {selectedActivity && (
                <>
                  <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
                    {selectedActivity.type?.toUpperCase()}
                  </Text>
                  <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                    {selectedActivity.title}
                  </Text>
                  {selectedActivity.audioUrl && (
                    <TouchableOpacity
                      style={[styles.audioButton, { backgroundColor: "rgba(26, 171, 186, 0.08)" }]}
                      onPress={handleToggleAudio}
                      disabled={isLoadingAudio}
                    >
                      <Text style={[styles.audioButtonText, { color: colors.onSurface }]}>
                        {isLoadingAudio
                          ? "Loading audio..."
                          : isPlaying
                          ? "Pause Audio"
                          : "Play Audio"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {selectedActivity.steps?.map((step, index) => (
                    <View key={index} style={styles.stepContainer}>
                      <Text style={[styles.stepTitle, { color: colors.onSurface }]}>
                        Step {index + 1}
                      </Text>
                      <Text style={[styles.stepText, { color: colors.onSurfaceVariant }]}>{step}</Text>
                    </View>
                  ))}
                  <View style={{ marginTop: 16 }}>
                    <TouchableOpacity onPress={handleDone} activeOpacity={0.8}>
                      <View style={[styles.endSessionButton, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.endSessionButtonText, { color: colors.onPrimary }]}>Done</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </LinearGradient>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: isIPad ? 700 : undefined,
    width: "100%",
    alignSelf: "center",
    padding: 10,
  },
  header: {
    //fontFamily: "Manrope_700Bold", //commenting manrope
    fontFamily: "System",
    fontWeight: "700" as const,
    fontSize: 28,
    letterSpacing: -0.04 * 28, // -1.12
    paddingTop: 18, // optical center: ~4px extra top vs bottom
    paddingBottom: 14,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20, // 20px gap between cards
    alignItems: "center",
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    //fontFamily: "Manrope_600SemiBold", //commenting manrope
    fontFamily: "System",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardBadge: {
    //fontFamily: "Inter_600SemiBold",
    //fontSize: 11,
    //textTransform: "uppercase", //commenting manrope
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.08 * 11, // 0.88
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  cardDescription: {
    fontFamily: "System",
    //fontWeight: "400" as const,
    fontSize: 15,
    lineHeight: 15 * 1.6, // 24
    marginTop: 4,
  },
  audioGuidedLabel: {
    fontFamily: "System",
    fontWeight: "400" as const,
    fontSize: 13,
    marginTop: 4,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 9999, // fully rounded pill
    alignItems: "center",
  },
  startButtonText: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 14,
    color: "#ffffff",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    //fontFamily: "Manrope_700Bold",
    fontFamily: "System",
    fontWeight: "700" as const,
    fontSize: 28,
    letterSpacing: -0.04 * 28, // -1.12
    marginBottom: 16,
  },
  modalSubtitle: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.1 * 12, // 1.2
    marginBottom: 12,
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepTitle: {
    //fontFamily: "Manrope_600SemiBold", //commenting manrope
    fontWeight: "600",
    marginBottom: 4,
  },
  stepText: {
    //fontFamily: "Inter_400Regular",  //commenting manrope
    fontFamily: "System",
    fontWeight: "400" as const,
    fontSize: 15,
    lineHeight: 15 * 1.6, // 24
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalHeaderTitle: {
    fontFamily: "System",
    fontWeight: "400" as const,
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    //fontFamily: "Manrope_600SemiBold",
    fontFamily: "System",
    fontWeight: "600" as const,

  },
  audioButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  audioButtonText: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  endSessionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 9999, // pill shape to match Start button
    alignItems: "center",
  },
  endSessionButtonText: {
    fontFamily: "System",
    fontWeight: "600" as const,
  },
});

export default GuidedActivitiesScreen;