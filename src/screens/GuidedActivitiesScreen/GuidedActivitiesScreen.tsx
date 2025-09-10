// src/screens/GuidedActivitiesScreen.tsx
import React, { useState } from "react";
import { View, Text, Image, FlatList, Modal, ScrollView, Dimensions } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GuidedActivity } from "../../api/types";
import { useFetchActivities, useLogActivity } from "../../api/hooks";
import { Button } from "../../components/UI/Button";
import { StyleSheet } from "react-native";
import Layout from "../../components/UI/layout";

const { width } = Dimensions.get("window");
const GuidedActivitiesScreen = () => {
    
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: activities = [], isLoading } = useFetchActivities("token"); // replace with real token
  const logMutation = useLogActivity("token");

  const [selectedActivity, setSelectedActivity] = useState<GuidedActivity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleStart = (activity: GuidedActivity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const handleDone = async () => {
    if (selectedActivity) {
      await logMutation.mutateAsync({ id: selectedActivity.id });
      setModalVisible(false);
      setSelectedActivity(null);
    }
  };

  const renderCard = ({ item }: { item: GuidedActivity }) => (
    <View style={styles.card}>
      <Image
        source={typeof item.thumbnail === "number" ? item.thumbnail : { uri: item.thumbnail }}
        style={styles.thumbnail}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBadge}>{item.type}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={{ marginTop: 16, width: 80 }}>
  <Button title="Start" onPress={() => handleStart(item)} />
</View>
      </View>
    </View>
  );

  return (
    <Layout title="Guided Avtivity" onNavigate={(screen) => navigation.navigate(screen as never)}>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Recommended Exercises</Text>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={activities.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal for activity steps */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          {selectedActivity && (
            <>
              <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
              {selectedActivity.steps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Step {index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              <View style={{ marginTop: 16 }}>
  <Button title="Done" onPress={handleDone} />
</View>

            </>
          )}
        </ScrollView>
      </Modal>
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f1d1ff", // earth-tone
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  cardBadge: {
    fontSize: 12,
    backgroundColor: "#DCFCE7", // green-200
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  startButton: {
    marginTop: 8,
    width: 80,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
  },
  doneButton: {
    marginTop: 16,
  },
  closeButton: {
    marginTop: 8,
    backgroundColor: "#E5E7EB", // gray-300
    color: "#000000",
  },
});

export default GuidedActivitiesScreen;