import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Linking,
  Alert,
  Animated,
  Modal,
} from "react-native";
import { useChatStore } from "../../stores/chatStore";
import { useAuth } from "../../context/AuthContext";
import { useSendChatMessage, useFetchChatHistory } from "../../api/hooks";
import EmojiPicker from "rn-emoji-keyboard";
import type { ChatMessage, Citation } from "../../api/types";
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
import { useCustomAlert } from "../../components/UI/CustomAlert";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getApiService } from "../../../services/api";
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { useQueryClient } from "@tanstack/react-query";
import { storage } from "../../utils/storage";
import { analytics } from '../../../analytics';
import * as Sentry from "@sentry/react-native";

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");


const ChatScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const { messages, addMessage, setMessages, prependMessages } = useChatStore();
  const { mutateAsync: sendChat } = useSendChatMessage(token);
  const { colors } = useTheme();
  const { alert, alertComponent } = useCustomAlert();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  // Header height = padding(12*2) + logo(50) + safe area top
  const HEADER_HEIGHT = 74 + insets.top;
  

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Check if disclaimer was accepted today
  useEffect(() => {
    storage.getItem("disclaimerAcceptedDate").then((dateStr) => {
      if (dateStr) {
        const acceptedDate = new Date(dateStr);
        const now = new Date();
        // Same calendar day = still valid
        if (
          acceptedDate.getFullYear() === now.getFullYear() &&
          acceptedDate.getMonth() === now.getMonth() &&
          acceptedDate.getDate() === now.getDate()
        ) {
          setDisclaimerAccepted(true);
        }
      }
    }).catch(() => {
      // Storage failed — show disclaimer as fallback
    });
  }, []);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // First-time chat intro bottom sheet
  const [showChatIntro, setShowChatIntro] = useState(false);
  const introSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  
  //const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  
  const MESSAGES_PER_PAGE = 20;

  const { data: initialHistory, isLoading: isLoadingInitial } = useFetchChatHistory(
    token,
    MESSAGES_PER_PAGE,
    0
  );

  //keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to end when keyboard opens
       /* setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100); */
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Check if user has seen the chat intro
  // Small delay ensures SecureStore/keychain is ready after app launch
  useEffect(() => {
    const timer = setTimeout(() => {
      storage.getItem("hasSeenChatIntro").then((value) => {
        if (value !== "true") {
          analytics.chatIntroViewed();  
          setShowChatIntro(true);
          Animated.spring(introSlideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 9,
          }).start();
        }
      }).catch(() => {
        // SecureStore failed — don't show intro to avoid annoying the user
        console.warn('[ChatScreen] SecureStore read failed for hasSeenChatIntro');
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    analytics.screenViewed('Chat');
  }, []);

  

  const dismissChatIntro = () => {
    analytics.chatIntroDismissed();
    Animated.spring(introSlideAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start(() => {
      setShowChatIntro(false);
    });
    storage.setItem("hasSeenChatIntro", "true");
  };

  //Load initial history
  useEffect(() => {
    try {
    if (initialHistory && !initialLoadDone) {
      Sentry.addBreadcrumb({
        category: "chat",
        message: "Loading initial history",
        data: { messageCount: initialHistory.messages?.length || 0, hasMore: initialHistory.has_more },
        level: "info",
      });

      if (initialHistory.messages.length > 0) {
        setMessages(initialHistory.messages);
        setHasMore(initialHistory.has_more);
        //setOffset(MESSAGES_PER_PAGE);
      } else {
        const welcomeMessage: ChatMessage = {
          id: 'welcome-' + Date.now(),
          sender: 'ai',
          text: 'Hi! How are you doing today?',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
        setHasMore(false);
      }
      setInitialLoadDone(true);
    }
  } catch (error) {
    console.error("[ChatScreen] Error loading initial history:", error);
    Sentry.captureException(error, {
      tags: { screen: "ChatScreen", action: "loadInitialHistory" },
      extra: { 
        historyLength: initialHistory?.messages?.length,
        historyData: JSON.stringify(initialHistory?.messages?.slice(0, 2)),
      },
    });
    // Recover gracefully — show welcome message
    setMessages([{
      id: 'welcome-' + Date.now(),
      sender: 'ai',
      text: 'Hi! How are you doing today?',
      timestamp: new Date().toISOString(),
    }]);
    setInitialLoadDone(true);
  }
}, [initialHistory, initialLoadDone]);

  // No scrollToEnd needed — inverted FlatList automatically shows newest messages at bottom

  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !token) return;

    setIsLoadingMore(true);

    try {
      const oldestId = messages.length > 0
        ? Math.min(...messages.map(m => parseInt(m.id)).filter(id => !isNaN(id)))
        : undefined;

      const olderMessages = await getApiService().getChatHistory?.(MESSAGES_PER_PAGE, oldestId) ?? {
        messages: [],
        total_count: 0,
        has_more: false
      };
      
      if (olderMessages && olderMessages.messages.length > 0) {
        prependMessages(olderMessages.messages);
        //setOffset(offset + MESSAGES_PER_PAGE);
        setHasMore(olderMessages.has_more);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[ChatScreen] Error loading more messages:", error);
      Sentry.captureException(error, {
        tags: { screen: "ChatScreen", action: "loadMoreMessages" },
        extra: { currentMessageCount: messages.length, hasMore },
      });

    } finally {
      setIsLoadingMore(false);
    }
  };

  // Sort messages by timestamp to prevent order issues from race conditions
  // between addMessage, prependMessages, and React Query cache invalidation
  // Sort messages chronologically for display.
  // Uses inverted FlatList (newest at bottom, standard chat pattern).
  // Inverted FlatList renders index 0 at the BOTTOM, so we sort DESCENDING.
  //
  // Robust timestamp parsing handles:
  //   - ISO strings with/without timezone ("2025-03-23T04:10:04Z" vs "2025-03-23T04:10:04")
  //   - Invalid/missing timestamps (fall back to insertion order via id)
  //   - Device clock vs server clock differences (secondary sort by DB id)
  
  const displayMessages = React.useMemo(() => {
    return [...messages].reverse(); 
  }, [messages]);
  
/*
  const sortedMessages = React.useMemo(() => {
    const parseTime = (ts: string): number => {
      if (!ts) return 0;
      const t = new Date(ts).getTime();
      return isNaN(t) ? 0 : t;
    };

    return [...messages].sort((a, b) => {
      const timeA = parseTime(a.timestamp);
      const timeB = parseTime(b.timestamp);

      // If timestamps differ by more than 1 second, use timestamp order
      if (Math.abs(timeA - timeB) > 1000) return timeB - timeA; // DESCENDING for inverted

      // Same-second messages: use DB id (numeric) for stable ordering
      // DB ids are sequential — user message id = N, bot reply id = N+1
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      if (!isNaN(idA) && !isNaN(idB)) return idB - idA; // DESCENDING for inverted

      // Fallback: Date.now() string ids sort lexicographically (still works for ordering)
      return b.id.localeCompare(a.id); // DESCENDING for inverted
    });
  }, [messages]);

  */

  const handleSend = async () => {
    if (!input.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempId,//Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    //Step 1 : Add user message
    addMessage(userMessage);
    setInput("");

   // Step 2: Use requestAnimationFrame to let the UI "breathe" 
  // This ensures the user message is rendered before we trigger the AI bubble
  requestAnimationFrame(async () => {
    setIsTyping(true);

    analytics.chatMessageSent(userMessage.text.length);
    Sentry.addBreadcrumb({
      category: "chat",
      message: "User sent message",
      data: { messageLength: userMessage.text.length, messageCount: messages.length },
      level: "info",
    });


    try {
      //Pass the localId to the mutation so we can track it
      const botReply = await sendChat({ text: userMessage.text, localId: tempId });
      addMessage(botReply);

      // SUCCESS: Your backend returns 'user_message_id' and 'assistant_message_id'
      // Swap the user's temp message for the real one
  
      // Don't invalidate chat history cache here — the store already has both messages.
      // Invalidating triggers a refetch that causes unnecessary re-renders and can
      // momentarily flash messages in wrong order. The next time the user opens the
      // chat screen, useFetchChatHistory will get fresh data naturally.
      analytics.chatResponseReceived(
        botReply.text.length,
        !!(botReply.citations && botReply.citations.length > 0)
      );

      Sentry.addBreadcrumb({
        category: "chat",
        message: "Bot reply received",
        data: { responseLength: botReply.text.length, hasCitations: !!(botReply.citations?.length) },
        level: "info",
      });
      
    } catch (error) {
      console.error("Send failed:", error);
      Sentry.captureException(error, {
        tags: { screen: "ChatScreen", action: "sendMessage" },
        extra: { messageLength: userMessage.text.length, messageCount: messages.length },
      });


    // Show error message in chat so the user knows what happened
      // Show error message in chat so the user knows what happened
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        sender: 'ai',
        text: "I'm sorry, I wasn't able to respond. Please try sending your message again.",
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);

    } finally {
      setIsTyping(false);
    }
  });
};

  const handleClearChat = async () => {
    alert(
      "Clear Chat History",
      "This will permanently delete all your conversations. This cannot be undone.\n\nContinue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              const api = getApiService();
              await api.clearChatHistory();
              analytics.chatHistoryCleared();

              // Clear local state
              setMessages([]);
              //setOffset(0);
              setHasMore(false);

              // Add welcome message back
              const welcomeMessage: ChatMessage = {
                id: 'welcome-' + Date.now(),
                sender: 'ai',
                text: 'Hi! How are you doing today?',
                timestamp: new Date().toISOString(),
              };
              addMessage(welcomeMessage);

              alert("Success", "Chat history cleared");
            } catch (error) {
              console.error('Clear chat error:', error);
              Sentry.captureException(error, {
                tags: { screen: "ChatScreen", action: "clearChat" },
              });
              alert("Error", "Failed to clear chat history. Please try again.");
            }
          }
        }
      ]
    );
  };
  
  // Renders **bold** markdown, detects URLs as tappable links, and converts
  // [Sources: X, Y] inline markers into tappable citation links.
  //
  // The LLM writes [Sources: NIMH, APA] in health education responses. The backend
  // also attaches structured citation objects (citation_type="health_education")
  // with the actual URLs. This function matches the short names in [Sources: ...]
  // to the citation objects and renders them as tappable links.
  // If no citation match is found, the source name is still shown as plain text
  // so the user sees the attribution.
  const renderMarkdownText = (text: string, baseStyle: object, citations?: Citation[]) => {
    // Build a lookup from source short names to citation URLs
    // e.g. "NIMH" -> "https://www.nimh.nih.gov/...", "APA" -> "https://www.apa.org/..."
    const sourceUrlMap: Record<string, { url: string; title: string }> = {};

    // Fallback map: common health organizations the LLM might cite in [Sources: ...]
    // even when no matching citation object is attached (e.g. the LLM cites "Mayo Clinic"
    // but only NIMH and APA citation cards were attached). These are general landing pages.
    const KNOWN_SOURCES: Record<string, { url: string; title: string }> = {
      'NIMH':             { url: 'https://www.nimh.nih.gov/health', title: 'NIMH' },
      'APA':              { url: 'https://www.apa.org/topics', title: 'APA' },
      'MAYO CLINIC':      { url: 'https://www.mayoclinic.org/diseases-conditions', title: 'Mayo Clinic' },
      'HELPGUIDE':        { url: 'https://www.helpguide.org', title: 'HelpGuide' },
      'NAMI':             { url: 'https://www.nami.org/About-Mental-Illness', title: 'NAMI' },
      'CDC':              { url: 'https://www.cdc.gov/mental-health', title: 'CDC' },
      'SAMHSA':           { url: 'https://findtreatment.gov/', title: 'SAMHSA' },
      'HARVARD HEALTH':   { url: 'https://www.health.harvard.edu', title: 'Harvard Health' },
      'SLEEP FOUNDATION': { url: 'https://www.sleepfoundation.org', title: 'Sleep Foundation' },
      'WHO':              { url: 'https://www.who.int/health-topics/mental-health', title: 'WHO' },
      // Commonly cited by the LLM but not in the core 7 Tavily domains
      'IOCDF':                  { url: 'https://iocdf.org', title: 'IOCDF' },
      'INTERNATIONAL OCD FOUNDATION': { url: 'https://iocdf.org', title: 'IOCDF' },
      'National Institute of Mental Health': { url: 'https://www.nimh.nih.gov/health', title: 'NIMH' },
      'ADAA':                   { url: 'https://adaa.org', title: 'ADAA' },
      'ANXIETY AND DEPRESSION ASSOCIATION': { url: 'https://adaa.org', title: 'ADAA' },
      'PSYCHOLOGY TODAY':       { url: 'https://www.psychologytoday.com', title: 'Psychology Today' },
      'VERYWELL MIND':          { url: 'https://www.verywellmind.com', title: 'Verywell Mind' },
      'VERYWELL':               { url: 'https://www.verywellmind.com', title: 'Verywell Mind' },
      'MIND':                   { url: 'https://www.mind.org.uk', title: 'Mind' },
      'CHADD':                  { url: 'https://chadd.org', title: 'CHADD' },
      'DBSA':                   { url: 'https://www.dbsalliance.org', title: 'DBSA' },
      'NEDA':                   { url: 'https://www.nationaleatingdisorders.org', title: 'NEDA' },
      'PTSD FOUNDATION':        { url: 'https://www.ptsd.va.gov', title: 'VA PTSD' },
    };
    // Seed with fallbacks (citation-specific URLs will overwrite these below)
    Object.entries(KNOWN_SOURCES).forEach(([key, val]) => {
      sourceUrlMap[key] = val;
      sourceUrlMap[key.toLowerCase()] = val;
      // Also seed title-case versions: "Nimh" etc.
      sourceUrlMap[key.charAt(0) + key.slice(1).toLowerCase()] = val;
    });

    // Overwrite with actual citation URLs (more specific than fallbacks)
    if (citations) {
      for (const c of citations) {
        if (!c.url) continue;
        // Index every citation by organization name and title abbreviation
        // so [Sources: NIMH, SAMHSA, APA] can resolve regardless of citation_type
        if (c.organization) {
          sourceUrlMap[c.organization.toUpperCase()] = { url: c.url, title: c.title };
          sourceUrlMap[c.organization] = { url: c.url, title: c.title };
        }
        // Extract abbreviation from title like "Anxiety Disorders — NIMH" -> "NIMH"
        const dashMatch = c.title?.match(/—\s*(.+)$/);
        if (dashMatch) {
          const abbrev = dashMatch[1].trim();
          sourceUrlMap[abbrev.toUpperCase()] = { url: c.url, title: c.title };
          sourceUrlMap[abbrev] = { url: c.url, title: c.title };
        }
      }
    }

    const urlRegex = /(https?:\/\/[^\s,;)}\]>"']+)/g;
    const sourceBlockRegex = /\[Sources?:\s*([^\]]+)\]/gi;

    // Step 1: Split text into chunks — alternating between plain text and [Sources:] blocks
    type Chunk = { type: 'text'; value: string } | { type: 'sources'; names: string[] };
    const chunks: Chunk[] = [];
    let lastIdx = 0;
    let srcMatch;
    const srcRegex = new RegExp(sourceBlockRegex.source, 'gi');

    while ((srcMatch = srcRegex.exec(text)) !== null) {
      if (srcMatch.index > lastIdx) {
        chunks.push({ type: 'text', value: text.substring(lastIdx, srcMatch.index) });
      }
      const names = srcMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean);
      chunks.push({ type: 'sources', names });
      lastIdx = srcMatch.index + srcMatch[0].length;
    }
    if (lastIdx < text.length) {
      chunks.push({ type: 'text', value: text.substring(lastIdx) });
    }

    // Step 2: Render a text chunk with bold + URL support
    const renderTextChunk = (segment: string, keyPrefix: string): React.ReactNode[] => {
      const boldParts = segment.split(/\*\*(.*?)\*\*/g);
      return boldParts.map((part, i) => {
        const isBold = i % 2 === 1;
        const partUrlMatch = part.match(urlRegex);
        if (!partUrlMatch) {
          const style = isBold ? [baseStyle, { fontWeight: 'bold' as const }] : baseStyle;
          return <Text key={`${keyPrefix}-b${i}`} style={style}>{part}</Text>;
        }
        // Has URLs — split around them
        const urlParts: React.ReactNode[] = [];
        let uLastIdx = 0;
        let uMatch;
        const uRegex = new RegExp(urlRegex.source, 'g');
        while ((uMatch = uRegex.exec(part)) !== null) {
          if (uMatch.index > uLastIdx) {
            const before = part.substring(uLastIdx, uMatch.index);
            const style = isBold ? [baseStyle, { fontWeight: 'bold' as const }] : baseStyle;
            urlParts.push(<Text key={`${keyPrefix}-b${i}-t${uLastIdx}`} style={style}>{before}</Text>);
          }
          const url = uMatch[0];
          urlParts.push(
            <Text
              key={`${keyPrefix}-b${i}-u${uMatch.index}`}
              style={[baseStyle, { color: colors.primary, textDecorationLine: 'underline' as const }]}
              onPress={() => handleCitationPress(url)}
              accessibilityRole="link"
            >{url}</Text>
          );
          uLastIdx = uMatch.index + url.length;
        }
        if (uLastIdx < part.length) {
          const after = part.substring(uLastIdx);
          const style = isBold ? [baseStyle, { fontWeight: 'bold' as const }] : baseStyle;
          urlParts.push(<Text key={`${keyPrefix}-b${i}-t${uLastIdx}`} style={style}>{after}</Text>);
        }
        return urlParts;
      });
    };

    // Step 3: Render a [Sources: X, Y] chunk as inline tappable links
    const renderSourcesChunk = (names: string[], keyPrefix: string): React.ReactNode => {
      return (
        <Text key={keyPrefix} style={[baseStyle, { fontSize: 13, color: colors.subText }]}>
          {'('}
          {names.map((name: string, idx: number) => {
            const info = sourceUrlMap[name] || sourceUrlMap[name.toUpperCase()];
            return (
              <Text key={`${keyPrefix}-s${idx}`}>
                {idx > 0 && ', '}
                {info ? (
                  <Text
                    style={{ color: colors.primary, textDecorationLine: 'underline' as const }}
                    onPress={() => handleCitationPress(info.url)}
                    accessibilityRole="link"
                    accessibilityLabel={`Source: ${info.title}`}
                  >{name}</Text>
                ) : (
                  <Text>{name}</Text>
                )}
              </Text>
            );
          })}
          {')'}
        </Text>
      );
    };

    return (
      <Text style={baseStyle}>
        {chunks.map((chunk, i) =>
          chunk.type === 'sources'
            ? renderSourcesChunk(chunk.names, `c${i}`)
            : renderTextChunk(chunk.value, `c${i}`)
        )}
      </Text>
    );
  };

  const handleCitationPress = async (url: string) => {
    if (!url) return;
    try {
      if (Platform.OS === 'web') {
        // On web, Linking.openURL navigates the current tab away from the app.
        // Use window.open to open in a new tab instead.
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // On iOS and Android, open in the device browser.
        // Skipping canOpenURL — unreliable for https:// on Android 11+ without
        // a <queries> manifest entry. Direct openURL with error handling is sufficient.
        await Linking.openURL(url);
        analytics.resourceLinkOpened( url);  
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to open citation URL:", url, error);
      Sentry.captureException(error, {
        tags: { screen: "ChatScreen", action: "openCitationURL" },
        extra: { url },
      });
    }
  };

  const renderCitations = (citations?: Citation[]) => {
    if (!citations || citations.length === 0) return null;

    // Separate citation types:
    // - health_education: rendered inline via [Sources: X, Y] in renderMarkdownText
    // - everything else (curated resources, therapist referrals, web resources): shown as cards
    const resourceCards = citations.filter(c => c.citation_type !== 'health_education');
    
    if (resourceCards.length === 0) return null;
    
    return (
      <View style={styles.citationsContainer}>
        <Text style={[styles.citationsHeader, { color: colors.subText }]}>
          Resources:
        </Text>
        <Text style={[styles.citationDisclaimer, { color: colors.subText }]}>
        The following resources provide additional information. 
        Always consult a healthcare professional for medical advice.
        </Text>
        {resourceCards.map((citation, index) => (
          <TouchableOpacity
            key={citation.id || index.toString()}
            onPress={() => handleCitationPress(citation.url)}
            style={[styles.citationItem, { borderColor: colors.primary + '20' }]}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel={`Open ${citation.title}`}
            activeOpacity={0.6}
          >
            <View style={styles.citationContent}>
              <Text style={[styles.citationNumber, { color: colors.primary }]}>
                [{index + 1}]
              </Text>
              <View style={styles.citationText}>
                <Text style={[styles.citationTitle, { color: colors.primary }]} numberOfLines={2}>
                  {citation.title}
                </Text>
                <View style={styles.citationMeta}>
                  <Text style={[styles.citationType, { color: colors.subText }]}>
                    {citation.content_type}
                  </Text>
                  {citation.relevance_score > 0 && (
                    <Text style={[styles.citationRelevance, { color: colors.primary }]}>
                      {Math.round(citation.relevance_score * 100)}% relevant
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    try {
          const isUser = item.sender === "user";

    return (
      <View style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAI
      ]}>
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.messageRight : styles.messageLeft,
          ]}
        >
          <View
            style={[
              styles.bubble,
              { backgroundColor: isUser ? colors.userBubble : colors.aiBubble,
                // ADD: Different border radius for each side
              borderBottomLeftRadius: isUser ? 20 : 6,
              borderBottomRightRadius: isUser ? 6 : 20,
               },
            ]}
          >
            {isUser ? (
              <Text style={{ fontSize: 16, color: colors.text, lineHeight: 22 }}>
                {item.text}
              </Text>
            ) : (
              renderMarkdownText(item.text, { fontSize: 16, color: colors.text, lineHeight: 22 }, item.citations)
            )}
          </View>
          {item.sender === 'ai' && renderCitations(item.citations)}
          <Text style={[styles.timestamp, { color: colors.subText }]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })}
          </Text>
        </View>
      </View>
    );
  } catch (error) {
     // Prevent a single malformed message from crashing the entire chat
     Sentry.captureException(error, {
      tags: { screen: "ChatScreen", action: "renderMessage" },
      extra: { messageId: item?.id, sender: item?.sender, textLength: item?.text?.length },
    });
    return (
      <View style={styles.messageRow}>
        <Text style={{ color: colors.subText, fontStyle: 'italic', padding: 8 }}>
          Unable to display this message
        </Text>
      </View>
    );
  }
};

  const renderListHeader = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        {isLoadingMore ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity onPress={loadMoreMessages} style={styles.loadMoreButton}>
            <Text style={[styles.loadMoreText, { color: colors.primary }]}>
              Load older messages
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderListFooter = () => {
    return (
      <View>
        {isTyping && <TypingIndicator />}
        <View style={{ height: 20 }} />
      </View>
    );
  };

  if (!disclaimerAccepted) {
    return (
      <MenuProvider>
      <Layout title="Chat" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={disclaimerStyles.container}
        >
          <Text style={[disclaimerStyles.heading, { color: colors.text }]}>
            Important Information
          </Text>

          <View style={[disclaimerStyles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[disclaimerStyles.cardTitle, { color: colors.text }]}>
              Not a Replacement for Professional Care
            </Text>
            <Text style={[disclaimerStyles.cardText, { color: colors.subText }]}>
              This is an AI tool. It is not a licensed therapist and is not a replacement for human care. If you are having a hard time, please contact:
            </Text>
            <View style={disclaimerStyles.resourceList}>
              <TouchableOpacity onPress={() => Linking.openURL("tel:911")}>
                <Text style={[disclaimerStyles.resourceItem, { color: "#007AFF" }]}>
                  <Text style={disclaimerStyles.resourceBold}>Emergency Services:</Text> 911
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("tel:988")}>
                <Text style={[disclaimerStyles.resourceItem, { color: "#007AFF" }]}>
                  <Text style={disclaimerStyles.resourceBold}>Crisis Lifeline:</Text> 988 (Suicide & Crisis Lifeline)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("sms:741741?body=HOME")}>
                <Text style={[disclaimerStyles.resourceItem, { color: "#007AFF" }]}>
                  <Text style={disclaimerStyles.resourceBold}>Crisis Text Line:</Text> Text HOME to 741741
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("https://findahelpline.com/")}>
                <Text style={[disclaimerStyles.resourceItem, { color: "#007AFF" }]}>
                  <Text style={disclaimerStyles.resourceBold}>International helplines:</Text> Find all helplines around the world
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                disclaimerStyles.cardTitle,
                { color: colors.text, marginTop: 8 },
              ]}
            >
              Your Privacy & Data
            </Text>
            <Text style={[disclaimerStyles.cardText, { color: colors.subText }]}>
              Your data is encrypted and no personal information is shared with anyone.
            </Text>

            <Text
              style={[
                disclaimerStyles.cardTitle,
                { color: colors.text, marginTop: 8 },
              ]}
            >
              Usage Notice
            </Text>
            <Text style={[disclaimerStyles.cardText, { color: colors.subText }]}>
              This is an AI tool and can make mistakes. You must be 18 years or older to use it.
            </Text>
          </View>

          <TouchableOpacity
            testID="chat_disclaimer_continue"
            style={[disclaimerStyles.continueButton, { backgroundColor: colors.primary }]}
            onPress={() => 
            { analytics.chatDisclaimerAccepted();  
              setDisclaimerAccepted(true)
              storage.setItem("disclaimerAcceptedDate", new Date().toISOString()).catch(() => {});
            }}
          >
            <Text style={disclaimerStyles.continueButtonText}>I Understand. Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </Layout>
      </MenuProvider>
    );
  }

  if (isLoadingInitial) {
    return (
      <MenuProvider>
      <Layout title="Chat" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading conversation...</Text>
        </View>
      </Layout>
      </MenuProvider>
    );
  }

  return (
    <MenuProvider>
    <Layout
      title="Chat"
      onNavigate={(screen) => navigation.navigate(screen as never)}
      rightComponent={
        <Menu>
          <MenuTrigger>
            <View style={styles.menuButton}>
              <Text style={[styles.menuDots, { color: colors.text }]}>⋮</Text>
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={{
            optionsContainer: {
              borderRadius: 12,
              marginTop: 40,
              marginRight: 8,
              padding: 4,
            }
          }}>
            <MenuOption onSelect={handleClearChat}>
              <Text style={styles.menuOptionText}>Clear Chat History</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      }
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_HEIGHT : 0}
        >
            { /* FlatList takes up all available space */}
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            inverted={true}
            contentContainerStyle={[
              styles.chatContainer,
              { paddingBottom: Platform.OS === 'android' ? 20 : 10 }
            ]}
            ListHeaderComponent={renderListFooter}
            ListFooterComponent={renderListHeader}
            onEndReached={() => {
              // In inverted FlatList, "end" is the TOP (oldest messages)
              if (hasMore && !isLoadingMore) {
                loadMoreMessages();
              }
            }}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={400}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />

          {/* Input row - positioned at bottom */}
          <View style={[
            styles.inputRow, 
            { 
              borderColor: colors.inputBorder,
              backgroundColor: colors.background,
              paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 32,
              marginBottom: Platform.OS === 'android' ? 8 : 0,
            }
          ]}>
            <TouchableOpacity
              onPress={() => setShowEmoji(true)}
              style={styles.emojiBtn}
            >
              <Text style={{ fontSize: 24 }}>😊</Text>
            </TouchableOpacity>

            <TextInput
              testID="chat_input"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.inputBorder },
              ]}
              placeholder="Type your message"
              placeholderTextColor={colors.subText}
              value={input}
              onChangeText={setInput}
              multiline
              blurOnSubmit={false}
              autoFocus={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              onKeyPress={(e) => {
                // On web/desktop: Enter sends, Shift+Enter adds newline
                if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <TouchableOpacity testID="chat_send" onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.sendText}>→</Text>
            </TouchableOpacity>
          </View>

          <EmojiPicker
            onEmojiSelected={(emoji) => setInput((prev) => prev + emoji.emoji)}
            open={showEmoji}
            onClose={() => setShowEmoji(false)}
          />
        </KeyboardAvoidingView>
      </View>
    </Layout>
    {/* First-time chat intro — Modal ensures it renders above everything on all platforms */}
    <Modal
      visible={showChatIntro}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={introStyles.overlay}
        activeOpacity={1}
        onPress={dismissChatIntro}
      />
      <Animated.View
        style={[
          introStyles.sheet,
          { transform: [{ translateY: introSlideAnim }] },
        ]}
      >
        {/* Drag handle */}
        <View style={introStyles.handleContainer}>
          <View style={introStyles.handle} />
        </View>

        {/* Headline */}
        <Text style={introStyles.headlineDark}>Built to support you.</Text>
        <Text style={introStyles.headlineTeal}>
          Designed to know its own limits.
        </Text>

        {/* Subtext */}
        <Text style={introStyles.subtext}>
          Bodhira is different from a general AI. It connects your mood,
          journal and conversations to build a picture of your wellbeing over
          time and it has hard limits that protect you.
        </Text>

        {/* Feature bullets */}
        <View style={introStyles.bulletList}>
          <IntroBullet
            outerBg="#e8f4f5"
            dotColor="#4a9fa5"
            boldText="Longitudinal memory."
            text=" Remembers your mood trends, journal themes and past conversations not just this session."
          />
          <IntroBullet
            outerBg="#fff0e6"
            dotColor="#e07030"
            boldText="Architecturally safe."
            text=" Cannot diagnose you or suggest medications. These are hard constraints, not just instructions."
          />
          <IntroBullet
            outerBg="#ffeaea"
            dotColor="#e04040"
            boldText="Crisis-aware."
            text=" Detects distress signals and provides you with real support information immediately."
          />
          <IntroBullet
            outerBg="#f0f5ff"
            dotColor="#4060d0"
            boldText="Proactively helpful."
            text=" Surfaces curated resources when it notices a pattern  before you think to ask."
          />
        </View>

        {/* Primary button */}
        <TouchableOpacity
          style={introStyles.primaryButton}
          onPress={dismissChatIntro}
          activeOpacity={0.8}
        >
          <Text style={introStyles.primaryButtonText}>Start chatting</Text>
        </TouchableOpacity>

        {/* Secondary link */}
        <TouchableOpacity onPress={dismissChatIntro}>
          <Text style={introStyles.secondaryLink}>
            Don't show this again
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
    {alertComponent}
    </MenuProvider>
  );
};

// --- Intro bullet component ---
const IntroBullet = ({
  outerBg,
  dotColor,
  boldText,
  text,
}: {
  outerBg: string;
  dotColor: string;
  boldText: string;
  text: string;
}) => (
  <View style={introStyles.bulletRow}>
    <View
      style={[
        introStyles.bulletOuter,
        { backgroundColor: outerBg, borderColor: dotColor },
      ]}
    >
      <View
        style={[introStyles.bulletInner, { backgroundColor: dotColor }]}
      />
    </View>
    <Text style={introStyles.bulletText}>
      <Text style={introStyles.bulletBold}>{boldText}</Text>
      {text}
    </Text>
  </View>
);

// --- Intro bottom sheet styles ---
const introStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: "85%",
    zIndex: 101,
  },
  handleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  headlineDark: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  headlineTeal: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1AABBA",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  bulletList: {
    gap: 16,
    marginBottom: 28,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bulletOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  bulletInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bulletText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    flex: 1,
  },
  bulletBold: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  primaryButton: {
    backgroundColor: "#1AABBA",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryLink: {
    textAlign: "center",
    fontSize: 14,
    color: "#9CA3AF",
    paddingVertical: 8,
    color: "#bbb",
    marginBottom: 6,
  },
});

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  chatContainer: { 
    padding: 10,
    flexGrow: 1,
    // Note: do NOT add justifyContent here — inverted FlatList handles
    // bottom-pinning automatically. Adding flex-end breaks it.
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageContainer: { 
    marginVertical: 2, 
    flexShrink: 1
  },
  messageLeft: { 
    alignSelf: "flex-start",
    alignItems: 'flex-start',
    maxWidth: "95%",   // AI messages: use nearly full width for long responses
  },
  messageRight: { 
    alignSelf: "flex-end",
    alignItems: 'flex-end',
    maxWidth: "80%",   // User messages: shorter, right-aligned
  },
  bubble: { 
    padding: 12, //changed from 10 -> 16 for more padding
    borderRadius: 20, //changed from 16 -> 20 for more rounded corners
    flexShrink: 1,
    //Add shadow for depth:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,

  },
  timestamp: { 
    fontSize: 11, // changed from 10 -> 11 for more readability
    marginTop: 4, // changed from 2 -> 4 for more spacing
    textAlign: "right",
    fontWeight: '500', // changed from 'normal' -> 'medium' for more emphasis
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10, //changed from 10 -> 16 for more padding
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16, //more bottom padding
    // Removing shadow to fix weirdness in text box, ADD shadow at top:
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: -2 },
    //shadowOpacity: 0.05,
    //shadowRadius: 8,
    //elevation: 4,
  },
  emojiBtn: { 
    padding: 6 
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 6,
    maxHeight: 120,
    textAlignVertical: 'top',
    fontSize: 15, //Add explicit font size
    //backgroundColor: "#FAF8F5",
  },
  sendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sendText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 20,
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuDots: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  menuOptionText: {
    fontSize: 16,
    padding: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 8,
    width: '100%',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5B7C99',
    marginHorizontal: 2,
  },
  dot1: { 
    opacity: 0.4 
  },
  dot2: { 
    opacity: 0.6 
  },
  dot3: { 
    opacity: 0.8 
  },
  citationsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  citationsHeader: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  citationItem: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F8F8F8',
  },
  citationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  citationNumber: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
    marginTop: 1,
  },
  citationText: {
    flex: 1,
  },
  citationTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  citationMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  citationType: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  citationRelevance: {
    fontSize: 11,
    fontWeight: '500',
  },
  citationDisclaimer: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 14,
  },
});

const CuteBotAvatar = ({ size = 40 }: { size?: number }) => {
  return (
    <View style={[styles.botAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
        <Line x1="12" y1="3" x2="12" y2="7" stroke="#5B7C99" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="12" cy="2" r="1.5" fill="#5B7C99" />
        <Circle cx="12" cy="14" r="9.5" fill="#FFFFFF" stroke="#5B7C99" strokeWidth="1.5" />
        <Circle cx="10" cy="14" r="1" fill="#5B7C99" />
        <Circle cx="14" cy="14" r="1" fill="#5B7C99" />
        <Path d="M 10 17 Q 12 18.5 14 17" stroke="#5B7C99" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

const TypingIndicator = () => (
  <View style={[styles.messageRow, styles.messageRowAI]}>
    <View style={[styles.messageContainer, styles.messageLeft]}>
      <View style={[styles.bubble, { backgroundColor: "#E5E5EA" }]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  </View>
);

const disclaimerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    lineHeight: 20,
  },
  resourceList: {
    marginTop: 8,
  },
  resourceItem: {
    fontSize: 13,
    lineHeight: 24,
  },
  resourceBold: {
    fontWeight: "700",
  },
  continueButton: {
    width: "100%",
    maxWidth: 500,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ChatScreen;