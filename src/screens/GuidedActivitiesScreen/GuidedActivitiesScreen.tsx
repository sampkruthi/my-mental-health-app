// src/screens/GuidedActivitiesScreen.tsx
import React, { useState } from "react";
import { View, Text, Image, FlatList, Modal, ScrollView, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GuidedActivity } from "../../api/types";
import { useFetchActivities } from "../../api/hooks";
import { Button } from "../../components/UI/Button";
import Layout from "../../components/UI/layout";

const { width } = Dimensions.get("window");

const GuidedActivitiesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: activities = [], isLoading } = useFetchActivities("token"); // replace with real token

  const [selectedActivity, setSelectedActivity] = useState<GuidedActivity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleStart = (activity: GuidedActivity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const handleDone = () => {
    setModalVisible(false);
    setSelectedActivity(null);
  };

  const renderCard = ({ item }: { item: GuidedActivity }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {item.thumbnail && <Image source={item.thumbnail} style={styles.thumbnail} />}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardBadge, { backgroundColor: "#DCFCE7" }]}>{item.type}</Text>
        <Text style={[styles.cardDescription, { color: colors.subText }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={{ marginTop: 12, width: 80 }}>
          <Button title="Start" onPress={() => handleStart(item)} />
        </View>
      </View>
    </View>
  );

  return (
    <Layout title="Guided Activities" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Recommended Exercises</Text>

        {isLoading ? (
          <Text style={{ color: colors.subText }}>Loading...</Text>
        ) : (
          <FlatList
            data={activities.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Modal visible={modalVisible} animationType="slide">
          <ScrollView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            {selectedActivity && (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedActivity.title}</Text>
                {selectedActivity.steps?.map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>Step {index + 1}</Text>
                    <Text style={[styles.stepText, { color: colors.subText }]}>{step}</Text>
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
    width: width > 800 ? 900 : "100%",
    alignSelf: "center",
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
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
  modalContainer: {
    flex: 1,
    padding: 20,
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
});

export default GuidedActivitiesScreen;
