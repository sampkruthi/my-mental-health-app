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
import { useChatStore } from "../stores/chatStore";
import { useAuth } from "../context/AuthContext";
import { useSendChatMessage } from "../api/hooks";
import EmojiPicker from "rn-emoji-keyboard";
import type { ChatMessage } from "../api/types";
import Layout from "../components/UI/layout";
import { useTheme } from "../context/ThemeContext";


const { width } = Dimensions.get("window");

const ChatScreen = () => {
  const { token } = useAuth();
  const { messages, addMessage } = useChatStore();
  const { mutateAsync: sendChat } = useSendChatMessage(token);
  const { colors } = useTheme();

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    addMessage({ ...newMessage, id: newMessage.id.toString() });

    setInput("");

    try {
      const botReply = await sendChat({ text: input });
      addMessage({
        ...botReply,
        id: (Date.now() + 1).toString(),
        sender: "ai",
      });
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

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
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <Layout title="Chat" onNavigate={() => {}}>
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
          />

          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={() => setShowEmoji(true)}
              style={styles.emojiBtn}
            >
              <Text style={{ fontSize: 24 }}>😊</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type your message…"
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
  container: { flex: 1 }, // Keep full height

  // Wrapper to center chat and control width
  chatWrapper: {
    flex: 1,
    width: width > 800 ? 900 : "100%", // Use fixed width on desktop, full on mobile
    alignSelf: "center",               // center horizontally
    padding: 10,
  },

  chatContainer: { padding: 10 },      // padding inside FlatList

  // Messages
  messageContainer: { marginVertical: 4, maxWidth: "95%" }, // make bubbles wider
  messageLeft: { alignSelf: "flex-start" },
  messageRight: { alignSelf: "flex-end" },
  bubble: { padding: 10, borderRadius: 16 },                 // slightly bigger padding
  userBubble: { backgroundColor: "#DCF8C6" },
  assistantBubble: { backgroundColor: "#E5E5EA" },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: "#888", marginTop: 2, textAlign: "right" },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  emojiBtn: { padding: 6 },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
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
});

export default ChatScreen;
