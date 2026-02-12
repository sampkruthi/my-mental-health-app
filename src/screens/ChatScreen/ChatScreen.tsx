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
  

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  
  const [offset, setOffset] = useState(0);
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
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
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

  //Load initial history
  useEffect(() => {
    if (initialHistory && !initialLoadDone) {
      if (initialHistory.messages.length > 0) {
        setMessages(initialHistory.messages);
        setHasMore(initialHistory.has_more);
        setOffset(MESSAGES_PER_PAGE);
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
  }, [initialHistory, initialLoadDone]);

  //Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0 && initialLoadDone) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, initialLoadDone]);

  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !token) return;

    setIsLoadingMore(true);

    try {
      const olderMessages = await getApiService().getChatHistory?.(MESSAGES_PER_PAGE, offset) ?? {
        messages: [],
        total_count: 0,
        has_more: false
      };
      
      if (olderMessages && olderMessages.messages.length > 0) {
        prependMessages(olderMessages.messages);
        setOffset(offset + MESSAGES_PER_PAGE);
        setHasMore(olderMessages.has_more);
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
              { backgroundColor: isUser ? colors.userBubble : colors.aiBubble,
                // ADD: Different border radius for each side
              borderBottomLeftRadius: isUser ? 20 : 6,
              borderBottomRightRadius: isUser ? 6 : 20,
               },
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.text,
                lineHeight: 22,
                //textAlign: isUser ? 'right' : 'left',
              }}
            >
              {item.text}
            </Text>
          </View>
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
      <Layout title="Chat" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={disclaimerStyles.container}
        >
          <Text style={[disclaimerStyles.icon]}>⚠️</Text>
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
                <Text style={[disclaimerStyles.resourceItem, { color: colors.text }]}>
                  🚨 <Text style={disclaimerStyles.resourceBold}>Emergency Services:</Text> 911
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("tel:988")}>
                <Text style={[disclaimerStyles.resourceItem, { color: colors.text }]}>
                  📞 <Text style={disclaimerStyles.resourceBold}>Crisis Lifeline:</Text> 988 (Suicide & Crisis Lifeline)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("sms:741741?body=HOME")}>
                <Text style={[disclaimerStyles.resourceItem, { color: colors.text }]}>
                  💬 <Text style={disclaimerStyles.resourceBold}>Crisis Text Line:</Text> Text HOME to 741741
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[disclaimerStyles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[disclaimerStyles.cardTitle, { color: colors.text }]}>
              Your Privacy & Data
            </Text>
            <Text style={[disclaimerStyles.cardText, { color: colors.subText }]}>
              🔒 Your data is encrypted and no personal information is shared with anyone.
            </Text>
          </View>

          <View style={[disclaimerStyles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[disclaimerStyles.cardTitle, { color: colors.text }]}>
              Usage Notice
            </Text>
            <Text style={[disclaimerStyles.cardText, { color: colors.subText }]}>
              This is an AI tool and can make mistakes. You must be 18 years or older to use it.
            </Text>
          </View>

          <TouchableOpacity
            style={[disclaimerStyles.continueButton, { backgroundColor: colors.primary }]}
            onPress={() => setDisclaimerAccepted(true)}
          >
            <Text style={disclaimerStyles.continueButtonText}>I Understand, Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </Layout>
    );
  }

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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
        >
            { /* FlatList takes up all available space */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              styles.chatContainer,
              { paddingBottom: Platform.OS === 'android' ? 100 : 10 }
            ]}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderListFooter}
            onScroll={(event) => {
              const { contentOffset } = event.nativeEvent;
              if (contentOffset.y < 100 && hasMore && !isLoadingMore) {
                loadMoreMessages();
              }
            }}
            scrollEventThrottle={400}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
          />

          {/* Input row - positioned at bottom */}
          <View style={[
            styles.inputRow, 
            { 
              borderColor: colors.inputBorder,
              backgroundColor: colors.background,
            }
          ]}>
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
              placeholder="Type your message"
              placeholderTextColor={colors.subText}
              value={input}
              onChangeText={setInput}
              multiline
              blurOnSubmit={false}
              autoFocus={false}
              returnKeyType="default"
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />

            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
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
  );
};

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
    maxWidth: "85%",
    flexShrink: 1
  },
  messageLeft: { 
    alignSelf: "flex-start",
    alignItems: 'flex-start', 
  },
  messageRight: { 
    alignSelf: "flex-end",
    alignItems: 'flex-end', 
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
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    /*
    backgroundColor: "#66B6A3",
    width: 44,  // ADD: explicit width
    height: 44,  // ADD: explicit height
    borderRadius: 22,  // HALF of width/height for perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,  // ADD: space from input
    // ADD shadow to make it pop:
    shadowColor: "#66B6A3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, */
  },
  sendText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 20,
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
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
  },
  resourceList: {
    marginTop: 12,
  },
  resourceItem: {
    fontSize: 14,
    lineHeight: 28,
  },
  resourceBold: {
    fontWeight: "700",
  },
  continueButton: {
    width: "100%",
    maxWidth: 500,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ChatScreen;