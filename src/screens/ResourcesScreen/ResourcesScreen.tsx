// src/screens/resources/ResourcesScreen.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  Modal, 
  ScrollView, 
  Dimensions, 
  StyleSheet, 
  Linking,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { Button } from "../../components/UI/Button";
import { useFetchContentRec, useFetchContentRecWithRAG } from "../../api/hooks";
import { ResourceRec, ResourceRecRAG, RAGRecommendation } from "../../api/types";

const { width } = Dimensions.get("window");

const ResourcesScreen = () => {
  const { colors } = useTheme();
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // const { data: resources = [], isLoading, isError, error } = useFetchContentRec(token, { limit: 10 });

  const {
    data: ragData = {
      recommendations: [],
      personalized_summary: '',
      query: '',
      user_context: {}
    },
    isLoading,
    isError,
    error
  } = useFetchContentRecWithRAG(token, { limit: 10 });

  // Extract recommendations from RAG response
  const resources: RAGRecommendation[] = ragData?.recommendations || [];
  const ragSummary = ragData?.personalized_summary || '';

  const [selectedResource, setSelectedResource] = useState<RAGRecommendation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Debug logs
  console.log('🔍 Resources token:', token ? 'EXISTS' : 'MISSING');
  console.log('🔍 Resources count:', resources.length);
  console.log('🔍 RAG Summary:', ragSummary);
  console.log('🔍 First resource:', resources[0]);

  const handleOpen = (resource: RAGRecommendation) => {
    setSelectedResource(resource);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelectedResource(null);
  };

  // OLD CODE - COMMENTED OUT
  // const handleOpen = (resource: ResourceRec) => {
  //   setSelectedResource(resource);
  //   setModalVisible(true);
  // };

  const getResourceType = (item: RAGRecommendation) => {
    return item.content_type?.toUpperCase() || 'RESOURCE';
  };

  // OLD CODE - COMMENTED OUT
  // const getResourceType = (item: ResourceRec) => {
  //   return item.content_type?.toUpperCase() || 'RESOURCE';
  // };

  const getResourceColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'ARTICLE': '#DCFCE7',
      'VIDEO': '#FECACA', 
      'PODCAST': '#FEF3C7',
    };
    return colorMap[type.toUpperCase()] || '#E5E7EB';
  };

  const getDefaultThumbnail = (contentType: string) => {
    // Fallback placeholder images
    const placeholders: Record<string, string> = {
      'article': 'https://via.placeholder.com/200/4CAF50/FFFFFF?text=Article',
      'video': 'https://via.placeholder.com/200/F44336/FFFFFF?text=Video',
      'podcast': 'https://via.placeholder.com/200/FFC107/FFFFFF?text=Podcast',
    };
    return placeholders[contentType.toLowerCase()] || 'https://via.placeholder.com/200/9E9E9E/FFFFFF?text=Resource';
  };

  const renderCard = ({ item }: { item: RAGRecommendation }) => {
    const resourceType = getResourceType(item);
    const thumbnailUrl = item.thumbnail || getDefaultThumbnail(item.content_type);

    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground || "#f0f4ff" }]}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            onError={() => console.log('Failed to load image:', thumbnailUrl)}
          />
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={[styles.cardBadge, { backgroundColor: getResourceColor(resourceType) }]}>
            <Text style={styles.badgeText}>{resourceType}</Text>
          </View>

          {/* Show description if available (RAG recommendation) */}
          {item.description && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonIcon}>💡</Text>
              <Text style={[styles.reasonText, { color: colors.subText }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          )}

          {/* OLD CODE - COMMENTED OUT */}
          {/* {item.recommendation_reason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonIcon}>💡</Text>
              <Text style={[styles.reasonText, { color: colors.subText }]} numberOfLines={2}>
                {item.recommendation_reason}
              </Text>
            </View>
          )} */}

          {/* Show tags if available */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          {item.snippet && (
            <Text style={[styles.cardDescription, { color: colors.subText }]} numberOfLines={2}>
              {item.snippet}
            </Text>
          )}

          {/* Show relevance_score (RAG) instead of score */}
          {item.relevance_score !== undefined && (
            <Text style={[styles.score, { color: colors.subText }]}>
              Relevance: {(item.relevance_score * 100).toFixed(0)}%
            </Text>
          )}

          {/* OLD CODE - COMMENTED OUT */}
          {/* {item.score !== undefined && (
            <Text style={[styles.score, { color: colors.subText }]}>
              Relevance: {(item.score * 100).toFixed(0)}%
            </Text>
          )} */}

          <View style={{ marginTop: 12, width: 80 }}>
            <Button title="Open" onPress={() => handleOpen(item)} />
          </View>
        </View>
      </View>
    );
  };

  if (!token) {
    return (
      <Layout title="Resources" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Please log in to view resources
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Resources" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.header, { color: colors.text }]}>Recommended Resources</Text>

          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subText }]}>
                Loading resources...
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.centerContent}>
              <Text style={[styles.errorText, { color: 'red' }]}>
                Error: {error?.message || 'Failed to load resources'}
              </Text>
            </View>
          ) : resources.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                No resources available yet. Check back soon!
              </Text>
            </View>
          ) : (
            <View>
              {resources.map((item, index) => (
                <View key={item.id?.toString() || index.toString()}>
                  {renderCard({ item })}
                </View>
              ))}
            </View>
          )}

          {/* Show RAG personalized summary at the bottom if available */}
          {ragSummary && resources.length > 0 && (
            <View style={[styles.summaryBox, { backgroundColor: colors.cardBackground || "#f0f4ff" }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>AI Summary</Text>
              <Text style={[styles.summaryText, { color: colors.subText }]}>
                {ragSummary}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

        {/* Modal for viewing resource details */}
        <Modal visible={modalVisible} animationType="slide" transparent={false}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <ScrollView>
              {selectedResource && (
                <>
                  {/* Thumbnail in modal */}
                  <Image 
                    source={{ uri: selectedResource.thumbnail || getDefaultThumbnail(selectedResource.content_type) }} 
                    style={styles.modalThumbnail}
                  />

                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {selectedResource.title}
                  </Text>
                  
                  <View style={[
                    styles.modalBadge, 
                    { backgroundColor: getResourceColor(getResourceType(selectedResource)) }
                  ]}>
                    <Text style={styles.modalBadgeText}>
                      {getResourceType(selectedResource)}
                    </Text>
                  </View>

                  {/* Tags */}
                  {selectedResource.tags && selectedResource.tags.length > 0 && (
                    <View style={styles.modalTagsContainer}>
                      {selectedResource.tags.map((tag, index) => (
                        <Text key={index} style={styles.modalTag}>
                          #{tag}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Show description (RAG) */}
                  {selectedResource.description && (
                    <Text style={[styles.modalDescription, { color: colors.text }]}>
                      {selectedResource.description}
                    </Text>
                  )}

                  {/* OLD CODE - COMMENTED OUT */}
                  {/* {selectedResource.snippet && (
                    <Text style={[styles.modalDescription, { color: colors.text }]}>
                      {selectedResource.snippet}
                    </Text>
                  )} */}

                  {selectedResource.snippet && (
                    <Text style={[styles.modalDescription, { color: colors.text }]}>
                      {selectedResource.snippet}
                    </Text>
                  )}

                  {/* Show relevance_score (RAG) */}
                  {selectedResource.relevance_score !== undefined && (
                    <Text style={[styles.modalScore, { color: colors.subText }]}>
                      Relevance Score: {(selectedResource.relevance_score * 100).toFixed(0)}%
                    </Text>
                  )}

                  {/* Show score if available (fallback) */}
                  {selectedResource.score !== undefined && (
                    <Text style={[styles.modalScore, { color: colors.subText }]}>
                      FAISS Score: {(selectedResource.score * 100).toFixed(0)}%
                    </Text>
                  )}

                  {/* OLD CODE - COMMENTED OUT */}
                  {/* {selectedResource.score !== undefined && (
                    <Text style={[styles.modalScore, { color: colors.subText }]}>
                      Relevance Score: {(selectedResource.score * 100).toFixed(0)}%
                    </Text>
                  )} */}

                  <TouchableOpacity 
                    style={[styles.linkButton, { backgroundColor: colors.primary }]}
                    onPress={() => Linking.openURL(selectedResource.url)}
                  >
                    <Text style={styles.linkButtonText}>Open Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.closeButton, { borderColor: colors.primary }]}
                    onPress={handleClose}
                  >
                    <Text style={[styles.closeButtonText, { color: colors.primary }]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    width: width > 800 ? 900 : "100%",
    alignSelf: "center",
    padding: 10,
  },
  centerContent: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
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
    alignItems: "flex-start",
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  tag: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  score: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  reasonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  reasonText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 40,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  modalScore: {
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  linkButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // RAG Summary Box Styles
  summaryBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#5B9ACD',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

export default ResourcesScreen;