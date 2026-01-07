// src/screens/ChatScreen/ChatScreen.tsx
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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from "../../constants/styles";
//import BotLogo from "../../images/Chatbot_logo.png";
import BotLogo from "../../images/Botlogo_transparent.png";

const { width } = Dimensions.get("window");

const ChatScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const { messages, addMessage } = useChatStore();
  const { mutateAsync: sendChat } = useSendChatMessage(token);
  const { colors } = useTheme();

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      // Use setTimeout to ensure the layout is complete before scrolling
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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

    try {
      const botReply = await sendChat({ text: userMessage.text });
      addMessage(botReply);
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === "user";
    return (
      <View style={isUser ? styles.userMessageRow : styles.aiMessageRow}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image
              source={BotLogo}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? colors.userBubble : colors.aiBubble,
              ...SHADOWS.small,
            },
          ]}
        >
          <Text style={[styles.messageText, { color: colors.text }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Layout
      title="Chat"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
            showsVerticalScrollIndicator={false}
          />

          {/* Input Area */}
          <View
            style={[
              styles.inputSection,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowEmoji(!showEmoji)}
                style={styles.emojiBtn}
              >
                <Ionicons
                  name="happy-outline"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                placeholder="Type your message…"
                placeholderTextColor={colors.subText}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim()}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: input.trim()
                      ? colors.primary
                      : colors.inputBorder,
                  },
                ]}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
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

  aiMessageRow: {
    flexDirection: "row",
    marginVertical: SPACING.sm,
    maxWidth: "95%",
    alignItems: "flex-end",
    alignSelf: "flex-start",
  },

  userMessageRow: {
    flexDirection: "row",
    marginVertical: SPACING.sm,
    maxWidth: "95%",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },

  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: SPACING.sm,
    marginLeft: 0,
    flexShrink: 0,
  },

  avatar: {
    width: 32,
    height: 32,
  },

  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    maxWidth: "85%",
  },

  messageText: { fontSize: TYPOGRAPHY.sizes.md },

  inputSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },

  emojiBtn: { padding: SPACING.sm },

  input: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.sizes.md,
    maxHeight: 100,
    marginHorizontal: SPACING.sm,
  },

  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
