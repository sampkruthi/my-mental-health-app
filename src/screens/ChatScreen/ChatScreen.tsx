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
});

export default ChatScreen;
