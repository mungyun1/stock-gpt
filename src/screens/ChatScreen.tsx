import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../theme/colors";

const ChatScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<
    Array<{
      text: string;
      isUser: boolean;
      links?: Array<{ text: string; url: string }>;
    }>
  >([]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isUser: true }]);
      // 예시 AI 응답
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "네, 관련 정보를 찾아보았습니다. 삼성전자의 최근 주가 동향과 분석 보고서를 확인해보세요.",
            isUser: false,
            links: [
              {
                text: "삼성전자 주가 정보",
                url: "https://finance.naver.com/item/main.naver?code=005930",
              },
              {
                text: "투자자 분석 리포트",
                url: "https://finance.naver.com/research/",
              },
            ],
          },
        ]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 1000);
      setMessage("");
      Keyboard.dismiss();
    }
  };

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.cardBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Stock GPT
          </Text>
          <TouchableOpacity>
            <Ionicons name="refresh" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView
          style={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text
                style={[styles.welcomeText, { color: colors.textSecondary }]}
              >
                어떤 투자 정보를 알고 싶으세요?
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageWrapper,
                  msg.isUser
                    ? styles.userMessageWrapper
                    : styles.aiMessageWrapper,
                ]}
              >
                <View
                  style={[
                    styles.message,
                    msg.isUser
                      ? [
                          styles.userMessage,
                          { backgroundColor: colors.messageUser },
                        ]
                      : [
                          styles.aiMessage,
                          { backgroundColor: colors.messageAI },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      msg.isUser
                        ? styles.userMessageText
                        : styles.aiMessageText,
                      { color: msg.isUser ? "#FFFFFF" : colors.textPrimary },
                    ]}
                  >
                    {msg.text}
                  </Text>
                  {msg.links && (
                    <View style={styles.linksContainer}>
                      {msg.links.map((link, linkIndex) => (
                        <TouchableOpacity
                          key={linkIndex}
                          style={[
                            styles.linkButton,
                            {
                              backgroundColor: colors.cardBackground,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => handleLink(link.url)}
                        >
                          <Text
                            style={[styles.linkText, { color: colors.accent }]}
                          >
                            {link.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.cardBackground,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={message}
              onChangeText={setMessage}
              placeholder="무엇이든 물어보세요"
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="center"
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="default"
              returnKeyType="send"
              textContentType="none"
              autoFocus={false}
              keyboardAppearance={
                colors.background === "#000000" ? "dark" : "light"
              }
              onSubmitEditing={handleSend}
              textAlign="left"
              scrollEnabled={false}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: message.trim()
                    ? colors.accent
                    : colors.cardBackground,
                },
                !message.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <Ionicons
                name="send"
                size={24}
                color={message.trim() ? "#FFFFFF" : colors.textSecondary}
                style={{ transform: [{ rotate: "45deg" }] }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  messagesContainer: {
    flex: 1,
    padding: 24,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 120,
  },
  welcomeText: {
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 36,
  },
  messageWrapper: {
    marginVertical: 12,
    flexDirection: "row",
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
  },
  aiMessageWrapper: {
    justifyContent: "flex-start",
  },
  message: {
    maxWidth: "85%",
    padding: 16,
    borderRadius: 16,
  },
  userMessage: {
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  aiMessageText: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  linksContainer: {
    marginTop: 12,
    gap: 10,
  },
  linkButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  inputContainer: {
    borderTopWidth: 1,
    padding: 16,
    paddingHorizontal: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "ios" ? 12 : 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    minHeight: Platform.OS === "ios" ? 24 : "auto",
    marginRight: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    paddingTop: Platform.OS === "ios" ? 0 : 0,
    paddingBottom: Platform.OS === "ios" ? 0 : 0,
  },
  sendButton: {
    padding: 10,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
