// src/screens/resources/ResourcesScreen.tsx
import React, { useState } from "react";
import { View, Text, Image, FlatList, Modal, ScrollView, Dimensions, StyleSheet, Linking } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { Button } from "../../components/UI/Button";
import { useFetchContentRec } from "../../api/hooks";
import { ResourceRec } from "../../api/types";
import { useAuth } from "../../context/AuthContext";
const { width } = Dimensions.get("window");

const ResourcesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  //const token = "token"; // replace with real token
  const { token } = useAuth(); 
  const { data: resources = [], isLoading } = useFetchContentRec(token, { limit: 10 });

  console.log('🔍 Resources token:', token ? 'EXISTS' : 'MISSING');
  console.log('🔍 Resources data:', resources);

  const getResourceType = (item: ResourceRec) => {
    return item.content_type?.toUpperCase() || 'RESOURCE';
  };
  
  const getResourceColor = (type: string) => {
    const colors: Record<string, string> = {
      'ARTICLE': '#DCFCE7',
      'VIDEO': '#FECACA', 
      'PODCAST': '#FEF3C7',
    };
    return colors[type.toUpperCase()] || '#E5E7EB';
  };

  const [selectedResource, setSelectedResource] = useState<ResourceRec | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = (resource: ResourceRec) => {
    setSelectedResource(resource);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelectedResource(null);
  };

  const renderCard = ({ item }: { item: ResourceRec }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground || "#f0f4ff" }]}>
      {item.thumbnail && <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={styles.cardBadge}>{item.content_type.toUpperCase()}</Text>
        {item.snippet && <Text style={[styles.cardDescription, { color: colors.subText }]} numberOfLines={2}>{item.snippet}</Text>}
        <View style={{ marginTop: 12, width: 80 }}>
          <Button title="Open" onPress={() => handleOpen(item)} />
        </View>
      </View>
    </View>
  );

  return (
    <Layout title="Resources" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Recommended Resources</Text>

        {isLoading ? (
          <Text style={{ color: colors.subText }}>Loading...</Text>
        ) : (
          <FlatList
            data={resources}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Modal visible={modalVisible} animationType="slide">
          <ScrollView style={styles.modalContainer}>
            {selectedResource && (
              <>
                <Text style={styles.modalTitle}>{selectedResource.title}</Text>
                {selectedResource.snippet && <Text style={styles.modalDescription}>{selectedResource.snippet}</Text>}
                <View style={{ marginTop: 16 }}>
                  <Button title="Open Link" onPress={() => Linking.openURL(selectedResource.url)} />
                </View>
                <View style={{ marginTop: 16 }}>
                  <Button title="Close" onPress={handleClose} />
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
    fontSize: 16,
    fontWeight: "bold",
  },
  cardBadge: {
    fontSize: 12,
    backgroundColor: "#DCFCE7",
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
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default ResourcesScreen;
