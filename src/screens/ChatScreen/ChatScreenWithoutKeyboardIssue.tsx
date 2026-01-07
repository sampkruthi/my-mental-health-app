import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useChatStore } from "../../stores/chatStore";
import { useAuth } from "../../context/AuthContext";
import { useSendChatMessage, useFetchChatHistory } from "../../api/hooks";
import EmojiPicker from "rn-emoji-keyboard";
import type { ChatMessage } from "../../api/types";
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import Svg, { Line, Circle, Path } from "react-native-svg";
import { getApiService } from "../../../services/api";

const { width } = Dimensions.get("window");

const ChatScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const { messages, addMessage, setMessages, prependMessages } = useChatStore();
  const { mutateAsync: sendChat } = useSendChatMessage(token);
  const { colors } = useTheme();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  
  // Pagination state
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  
  const MESSAGES_PER_PAGE = 20;

  // Initial load - get last 20 messages
  const { data: initialHistory, isLoading: isLoadingInitial } = useFetchChatHistory(
    token,
    MESSAGES_PER_PAGE,
    0
  );

  // Load initial history
  useEffect(() => {
    if (initialHistory && !initialLoadDone) {
      if (initialHistory.messages.length > 0) {
        setMessages(initialHistory.messages);
        setHasMore(initialHistory.has_more);
        setOffset(MESSAGES_PER_PAGE);
      } else {
        // No history - show welcome message
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
  }, [initialHistory, initialLoadDone]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0 && initialLoadDone) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, initialLoadDone]);

  // Load more messages when scrolling up
  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !token) return;

    setIsLoadingMore(true);
    console.log(`[ChatScreen] Loading more messages: offset=${offset}`);

    try {
      //const olderMessages = await getApiService().getChatHistory?.(MESSAGES_PER_PAGE, offset);

      const olderMessages = await getApiService().getChatHistory?.(MESSAGES_PER_PAGE, offset) ?? {
        messages: [],
        total_count: 0,
        has_more: false
      };
      
      
      if (olderMessages && olderMessages.messages.length > 0) {
        prependMessages(olderMessages.messages); // Add to beginning
        setOffset(offset + MESSAGES_PER_PAGE);
        setHasMore(olderMessages.has_more);
        console.log(`[ChatScreen] Loaded ${olderMessages.messages.length} older messages`);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[ChatScreen] Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput("");
    setIsTyping(true);

    try {
      const botReply = await sendChat({ text: userMessage.text });
      addMessage(botReply);
    } catch (error) {
      console.error("Send failed:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
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
              { backgroundColor: isUser ? colors.userBubble : colors.aiBubble },
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.text,
              }}
            >
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.subText }]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  // Header component - shows when loading older messages
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

  if (isLoadingInitial) {
    return (
      <Layout title="Chat" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading conversation...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout
    title="Chat"
    onNavigate={(screen) => navigation.navigate(screen as never)}
  >
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}  // Adjusted for header
    >
      <View style={styles.chatWrapper}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatContainer}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onScroll={(event) => {
            const { contentOffset } = event.nativeEvent;
            if (contentOffset.y < 100 && hasMore && !isLoadingMore) {
              loadMoreMessages();
            }
          }}
          scrollEventThrottle={400}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"  // ← ADD THIS
        />

        <View style={[styles.inputRow, { 
          borderColor: colors.inputBorder,
          backgroundColor: colors.background  // ← ADD THIS
        }]}>
          <TouchableOpacity
            onPress={() => setShowEmoji(true)}
            style={styles.emojiBtn}
          >
            <Text style={{ fontSize: 24 }}>😊</Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.inputBorder },
            ]}
            placeholder="Type your message…"
            placeholderTextColor={colors.subText}
            value={input}
            onChangeText={setInput}
            multiline
            blurOnSubmit={false}  // ← ADD THIS
            autoFocus={false}
            returnKeyType="default"
          />

          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>

        <EmojiPicker
          onEmojiSelected={(emoji) => setInput((prev) => prev + emoji.emoji)}
          open={showEmoji}
          onClose={() => setShowEmoji(false)}
        />
      </View>
    </KeyboardAvoidingView>
  </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  chatWrapper: {
    flex: 1,
    width: width > 800 ? 900 : "100%",
    alignSelf: "center",
    padding: 10,
  },
  chatContainer: { padding: 10,
    paddingBottom: 20
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
  messageContainer: { marginVertical: 4, maxWidth: "85%", flexShrink: 1 },
  messageLeft: { alignSelf: "flex-start" },
  messageRight: { alignSelf: "flex-end" },
  bubble: { padding: 10, borderRadius: 16, flexShrink: 1 },
  timestamp: { fontSize: 10, marginTop: 2, textAlign: "right" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,  
    borderTopWidth: 1,
  },
  emojiBtn: { padding: 6 },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 6,
    maxHeight: 120,
    textAlignVertical: 'center',
  },
  sendBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "bold" },
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
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
});

// Bot avatar and typing indicator components (unchanged)
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

export default ChatScreen;