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
} from "react-native";
import { useChatStore } from "../../stores/chatStore";
import { useAuth } from "../../context/AuthContext";
import { useSendChatMessage } from "../../api/hooks";
import EmojiPicker from "rn-emoji-keyboard";
import type { ChatMessage } from "../../api/types";
import Layout from "../../components/UI/layout";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import Svg, { Line, Circle, Path } from "react-native-svg";


const { width } = Dimensions.get("window");

const ChatScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const { messages, addMessage } = useChatStore();
  const { mutateAsync: sendChat } = useSendChatMessage(token);
  const { colors } = useTheme();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: 'Hi! How are you doing today?',
        timestamp: new Date().toISOString(),
      };
      addMessage(welcomeMessage);
    }
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

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
      setIsTyping(false);  // ← STOP typing indicator
    }
  };
  //New renderMessage for Avatar


  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === "user";
    
    return (
      <View style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAI
      ]}>
        {/* Avatar only for AI messages, on the left */}
        {!isUser && (<CuteBotAvatar />)}
        
        {/* Message bubble */}
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
            <Text style={[styles.messageText, { color: colors.text }]}>
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
  

  /* Commenting and adding new renderMessage for BotAvatar test
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === "user";
    return (
      
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
          <Text style={[styles.messageText, { color: colors.text }]}>{item.text}</Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.subText }]}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  */
  return (
    <Layout
      title="Chat"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.chatWrapper}>
          <FlatList
            ref={flatListRef}
            data={[...messages].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.chatContainer}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}  
          />

          <View
            style={[
              styles.inputRow,
              { borderColor: colors.inputBorder },
            ]}
          >
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
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Enter") handleSend();
              }}
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

  chatWrapper: {
    flex: 1,
    width: width > 800 ? 900 : "100%",
    alignSelf: "center",
    padding: 10,
  },

  chatContainer: { padding: 10 },

  messageContainer: { marginVertical: 4, maxWidth: "95%" },
  messageLeft: { alignSelf: "flex-start" },
  messageRight: { alignSelf: "flex-end" },
  bubble: { padding: 10, borderRadius: 16 },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, marginTop: 2, textAlign: "right" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
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
  },
  messageRowAI: {
    justifyContent: 'flex-start',  // AI messages on left
    alignItems: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',  // User messages on right
    alignItems: 'flex-end',
  },

  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
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
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
});

const CuteBotAvatar = ({ size = 40 }: { size?: number }) => {
  return (
    <View style={[styles.botAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
        {/* Antenna */}
        <Line x1="12" y1="3" x2="12" y2="7" stroke="#5B7C99" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="12" cy="2" r="1.5" fill="#5B7C99" />
        
        {/* Face circle */}
        <Circle cx="12" cy="14" r="9.5" fill="#FFFFFF" stroke="#5B7C99" strokeWidth="1.5" />
        
        {/* Eyes */}
        <Circle cx="10" cy="14" r="1" fill="#5B7C99" />
        <Circle cx="14" cy="14" r="1" fill="#5B7C99" />
        
        {/* Smile */}
        <Path d="M 10 17 Q 12 18.5 14 17" stroke="#5B7C99" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

const TypingIndicator = () => (
  <View style={[styles.messageRow, styles.messageRowAI]}>
    <CuteBotAvatar size={40} />
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
