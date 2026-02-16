// src/screens/resources/ResourcesScreen.tsx - OPTIMIZED VERSION
// Improvements:
// 1. Shows fast placeholder content immediately (quick endpoint)
// 2. Upgrades to RAG recommendations when ready (smooth transition)
// 3. No blank screen, perceived as much faster!

import React, { useState } from "react";
import {
  View,
  Text,
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

  // OPTIMIZATION 1: Load fast recommendations immediately (no LLM, ~100ms)
  const { 
    data: quickRecs = [], 
    isLoading: isLoadingQuick 
  } = useFetchContentRec(token, { limit: 10 });

  // OPTIMIZATION 2: Load RAG recommendations in background (with LLM, ~400ms with Haiku)
  const {
    data: ragData = {
      recommendations: [],
      personalized_summary: '',
      query: '',
      user_context: {}
    },
    isLoading: isLoadingRAG,
    isError: isRAGError,
    error: ragError
  } = useFetchContentRecWithRAG(token, { limit: 10 });

  // OPTIMIZATION 3: Use RAG when available, fallback to quick recs
  // This creates a smooth upgrade: quick recs → RAG recs
  const hasRAGResults = ragData?.recommendations && ragData.recommendations.length > 0;
  const resources = hasRAGResults ? ragData.recommendations : quickRecs;
  const ragSummary = ragData?.personalized_summary || '';

  // Show loading state only if BOTH are loading (prevents flash)
  const isLoading = isLoadingQuick && isLoadingRAG;
  const isError = isRAGError && quickRecs.length === 0;

  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Debug logs
  console.log('🔍 Resources Status:', {
    quickRecsCount: quickRecs.length,
    ragRecsCount: ragData?.recommendations?.length || 0,
    isLoadingQuick,
    isLoadingRAG,
    hasRAGResults,
    usingRAG: hasRAGResults
  });

  const handleOpen = (resource: any) => {
    setSelectedResource(resource);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelectedResource(null);
  };

  const getResourceType = (item: any) => {
    return item.content_type?.toUpperCase() || 'RESOURCE';
  };

  const getResourceColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'ARTICLE': '#DCFCE7',
      'VIDEO': '#FECACA', 
      'PODCAST': '#FEF3C7',
    };
    return colorMap[type.toUpperCase()] || '#E5E7EB';
  };

  const renderCard = ({ item }: { item: any }) => {
    const resourceType = getResourceType(item);

    // Determine if this is RAG or quick rec
    const isRAGRec = 'relevance_score' in item;
    const displayScore = isRAGRec ? item.relevance_score : (1 - item.score / 100);

    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground || "#f0f4ff" }]}>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={[styles.cardBadge, { backgroundColor: getResourceColor(resourceType) }]}>
            <Text style={styles.badgeText}>{resourceType}</Text>
          </View>

          {/* Show description (RAG) or recommendation_reason (quick) */}
          {(item.description || item.recommendation_reason) && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonIcon}>💡</Text>
              <Text style={[styles.reasonText, { color: colors.subText }]} numberOfLines={2}>
                {item.description || item.recommendation_reason}
              </Text>
            </View>
          )}

          {/* Show tags if available */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <Text key={`${item.id}-tag-${tag}-${index}`} style={styles.tag}>
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

          {/* Show relevance score */}
          <Text style={[styles.score, { color: colors.subText }]}>
            Relevance: {(displayScore * 100).toFixed(0)}%
          </Text>

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

          {/* OPTIMIZATION: Show loading indicator for RAG while displaying quick recs */}
          {isLoadingRAG && quickRecs.length > 0 && (
            <View style={[styles.upgradingBanner, { backgroundColor: colors.cardBackground || "#f0f4ff" }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.upgradingText, { color: colors.subText }]}>
                Generating personalized recommendations...
              </Text>
            </View>
          )}

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
                Error: {ragError?.message || 'Failed to load resources'}
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
              {/* Show RAG personalized summary at the top when available */}
              {ragSummary && (
                <View style={[styles.summaryBox, { backgroundColor: colors.cardBackground || "#f0f4ff" }]}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>
                    ✨ Personalized for You
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.subText }]}>
                    {ragSummary}
                  </Text>
                </View>
              )}
              {resources.map((item, index) => (
                <View key={`resource-${item.id || `temp-${index}`}`}>
                  {renderCard({ item })}
                </View>
              ))}
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
                <Text style={[styles.modalTitle, { color: colors.text, marginTop: 40 }]}>
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

                {selectedResource.tags && selectedResource.tags.length > 0 && (
                  <View style={styles.modalTagsContainer}>
                    {selectedResource.tags.map((tag, index) => (
                      <Text key={`modal-${selectedResource.id}-tag-${tag}-${index}`}>
                        #{tag}
                      </Text>
                    ))}
                  </View>
                )}

                {(selectedResource.description || selectedResource.recommendation_reason) && (
                  <Text style={[styles.modalDescription, { color: colors.text }]}>
                    {selectedResource.description || selectedResource.recommendation_reason}
                  </Text>
                )}

                {selectedResource.snippet && (
                  <Text style={[styles.modalDescription, { color: colors.text }]}>
                    {selectedResource.snippet}
                  </Text>
                )}

                {(selectedResource.relevance_score !== undefined || selectedResource.score !== undefined) && (
                  <Text style={[styles.modalScore, { color: colors.subText }]}>
                    Relevance: {selectedResource.relevance_score 
                      ? (selectedResource.relevance_score * 100).toFixed(0)
                      : ((1 - selectedResource.score / 100) * 100).toFixed(0)
                    }%
                  </Text>
                )}

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
    padding: 16,
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
    fontSize: 26,  // Changed from 24
    fontWeight: "bold",
    marginBottom: 20,  // Changed from 16
    paddingHorizontal: 4,
    letterSpacing: -0.5,  // ADD
  },
  
  // Upgrading banner - make it more noticeable
  upgradingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,  // Changed from 12
    borderRadius: 12,  // Changed from 8
    marginBottom: 16,
    // ADD border:
    borderWidth: 1,
    borderColor: 'rgba(102, 182, 163, 0.2)',
  },
  
  upgradingText: {
    marginLeft: 10,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500',  // ADD
  },
  
  // Card - add visual depth
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    // ADD shadow:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,  // Changed from 16
    fontWeight: "bold",
    marginBottom: 8,  // Changed from 6
    lineHeight: 22,  // ADD
  },
  
  cardBadge: {
    paddingHorizontal: 10,  // Changed from 8
    paddingVertical: 5,  // Changed from 4
    borderRadius: 8,  // Changed from 6
    marginTop: 4,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  
  badgeText: {
    fontSize: 12,  // Changed from 11
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
    fontSize: 13,
    marginTop: 6,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,  // Changed from 10
    paddingVertical: 10,  // Changed from 8
    borderRadius: 10,  // Changed from 8
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,  // ADD
    borderLeftColor: '#FFC107',  // ADD
  },
  
  reasonIcon: {
    fontSize: 16,  // Changed from 14
    marginRight: 8,  // Changed from 6
  },
  
  reasonText: {
    fontSize: 13,  // Changed from 12
    flex: 1,
    lineHeight: 18,  // Changed from 16
    fontStyle: 'italic',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    padding: 20,
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
    fontSize: 17,
    marginBottom: 20,
    lineHeight: 26,
  },
  modalScore: {
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  linkButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    // ADD shadow:
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 17,  // Changed from 16
    fontWeight: '700',  // Changed from 600
    letterSpacing: 0.5,  // ADD
  },
  
  closeButton: {
    paddingVertical: 16,  // Changed from 14
    borderRadius: 16,  // Changed from 12
    alignItems: 'center',
    borderWidth: 2,  // Changed from 1
    marginBottom: 20,
  },
  
  closeButtonText: {
    fontSize: 17,  // Changed from 16
    fontWeight: '700',  // Changed from 600
    letterSpacing: 0.5,  // ADD
  },
  
  // RAG Summary Box - make it stand out more
  summaryBox: {
    padding: 20,  // Changed from 16
    borderRadius: 16,  // Changed from 12
    marginTop: 12,  // Changed from 8
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#5B9EB3",  // Use theme color instead of hardcoded
    // ADD shadow:
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  
  summaryLabel: {
    fontSize: 17,  // Changed from 15
    fontWeight: '700',
    marginBottom: 12,  // Changed from 10
    letterSpacing: -0.3,  // ADD
  },
  
  summaryText: {
    fontSize: 15,  // Changed from 14
    lineHeight: 24,  // Changed from 22
  },

});

export default ResourcesScreen;
