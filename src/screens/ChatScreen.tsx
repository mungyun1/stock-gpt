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
  Animated,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeColors } from "../theme/colors";

type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.75;

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const [messages, setMessages] = useState<
    Array<{
      text: string;
      isUser: boolean;
      links?: Array<{ text: string; url: string }>;
    }>
  >([]);

  const [threads] = useState([
    { id: 1, title: "금융 앱 기획안" },
    { id: 2, title: "Brainy" },
    { id: 3, title: "백엔드 지식 질문" },
    { id: 4, title: "수학학원 업무" },
    { id: 5, title: "투자 전략" },
  ]);

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? -SIDEBAR_WIDTH : 0;
    const overlayToValue = isSidebarOpen ? 0 : 0.5;

    Animated.parallel([
      Animated.spring(sidebarAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnimation, {
        toValue: overlayToValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsSidebarOpen(!isSidebarOpen);
  };

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

  const handleDeleteThread = (id: number) => {
    // TODO: 실제 삭제 로직 구현
    console.log("Delete thread:", id);
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
        {/* Overlay */}
        {isSidebarOpen && (
          <Pressable style={styles.overlay} onPress={toggleSidebar}>
            <Animated.View
              style={[
                styles.overlayBackground,
                {
                  opacity: overlayAnimation,
                },
              ]}
            />
          </Pressable>
        )}

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.cardBackground,
              transform: [{ translateX: sidebarAnimation }],
            },
          ]}
        >
          <View style={styles.sidebarContent}>
            <View
              style={[
                styles.sidebarHeader,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <View style={styles.headerContent}>
                <Text style={[styles.sidebarTitle, { color: colors.accent }]}>
                  채팅 목록
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleSidebar}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={colors.textSecondary}
                    style={{ opacity: 0.6 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={styles.threadList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.threadListContent}
            >
              {threads.map((thread) => (
                <TouchableOpacity
                  key={thread.id}
                  style={[
                    styles.threadItem,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                  onPress={() => {
                    toggleSidebar();
                  }}
                >
                  <View style={styles.threadItemInner}>
                    <View
                      style={[
                        styles.threadIconContainer,
                        { backgroundColor: `${colors.accent}15` },
                      ]}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={16}
                        color={colors.accent}
                        style={{ opacity: 0.8 }}
                      />
                    </View>
                    <Text
                      style={[
                        styles.threadTitle,
                        {
                          color: colors.textPrimary,
                          opacity: 0.87,
                        },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {thread.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteThread(thread.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={colors.textSecondary}
                      style={{ opacity: 0.4 }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.newChatButton, { backgroundColor: colors.accent }]}
              onPress={() => {
                toggleSidebar();
              }}
            >
              <View style={styles.newChatButtonContent}>
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.newChatButtonText}>새로운 채팅</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={styles.headerTitleButton}
          >
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Stock GPT
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="refresh" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContentContainer}
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
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayBackground: {
    backgroundColor: "#000",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 1000,
  },
  sidebarContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  sidebarHeader: {
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  sidebarTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  closeButton: {
    padding: 4,
    marginRight: -4,
  },
  threadList: {
    flex: 1,
  },
  threadListContent: {
    paddingTop: 4,
  },
  threadItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    paddingRight: 4,
  },
  threadItemInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
  },
  threadIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  threadTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  deleteButton: {
    padding: 8,
    opacity: 0.8,
  },
  deleteIcon: {
    opacity: 0.6,
  },
  newChatButton: {
    margin: 20,
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 14,
  },
  newChatButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  newChatButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTitleButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    flexGrow: 1,
    padding: 24,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
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
