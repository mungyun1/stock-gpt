import React, { useState, useRef, useEffect } from "react";
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
import OpenAI from "openai";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type MessageLink = {
  text: string;
  url: string;
};

type Message = {
  text: string;
  isUser: boolean;
  id: string;
  createdAt: Date;
  links?: MessageLink[];
};

type Thread = {
  id: string;
  title: string;
  created_at: Date;
  last_message?: string;
};

const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.75;
const THREADS_STORAGE_KEY = "@stock_gpt_threads";

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // 타이핑 애니메이션을 위한 Animated.Value 배열
  const typingDots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // 타이핑 애니메이션 함수
  const startTypingAnimation = () => {
    const createAnimation = (index: number) => {
      return Animated.sequence([
        Animated.delay(index * 200),
        Animated.loop(
          Animated.sequence([
            Animated.timing(typingDots[index], {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(typingDots[index], {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    Animated.parallel(
      typingDots.map((_, index) => createAnimation(index))
    ).start();
  };

  // 타이핑 애니메이션 중지 함수
  const stopTypingAnimation = () => {
    typingDots.forEach((dot) => {
      dot.stopAnimation();
      dot.setValue(0);
    });
  };

  useEffect(() => {
    if (isTyping) {
      startTypingAnimation();
    } else {
      stopTypingAnimation();
    }
  }, [isTyping]);

  // 타이핑 애니메이션 컴포넌트
  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      {typingDots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              backgroundColor: colors.accent,
              opacity: dot,
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  const openai = useRef(
    new OpenAI({
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  ).current;

  const ASSISTANT_ID = process.env.EXPO_PUBLIC_OPENAI_ASSISTANT_ID;

  useEffect(() => {
    const loadAndInitialize = async () => {
      try {
        const storedThreads = await AsyncStorage.getItem(THREADS_STORAGE_KEY);
        if (storedThreads) {
          const parsedThreads = JSON.parse(storedThreads).map(
            (thread: Thread) => ({
              ...thread,
              created_at: new Date(thread.created_at),
            })
          );
          setThreads(parsedThreads);

          // 가장 최근 스레드 선택 및 메시지 로드
          if (parsedThreads.length > 0) {
            const mostRecentThread = parsedThreads[0];
            setThreadId(mostRecentThread.id);
            await loadThreadMessages(mostRecentThread.id);
          }
        } else {
          // 저장된 스레드가 없을 경우에만 새 스레드 초기화
          await initializeThread();
        }
      } catch (error) {
        console.error("스레드 초기화 중 오류:", error);
      }
    };

    loadAndInitialize();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const initializeThread = async () => {
    try {
      console.log("스레드 초기화 시작");
      console.log(
        "API Key:",
        process.env.EXPO_PUBLIC_OPENAI_API_KEY?.substring(0, 5) + "..."
      );
      console.log("Assistant ID:", ASSISTANT_ID);

      // 새 스레드 생성
      const thread = await openai.beta.threads.create();
      console.log("새 스레드 생성됨:", thread.id);

      setThreadId(thread.id);

      // 새 스레드를 스레드 목록에 추가
      const newThread: Thread = {
        id: thread.id,
        title: "새로운 대화",
        created_at: new Date(),
      };

      setThreads((prev) => [newThread, ...prev]);
      await saveThreads([newThread, ...threads]);
    } catch (error) {
      console.error("스레드 초기화 중 오류:", error);
    }
  };

  const saveThreads = async (updatedThreads: Thread[]) => {
    try {
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(updatedThreads)
      );
    } catch (error) {
      console.error("스레드 저장 중 오류:", error);
    }
  };

  const createNewThread = async () => {
    try {
      const thread = await openai.beta.threads.create();

      // 첫 메시지가 입력되기 전까지는 빈 제목 사용
      const newThread: Thread = {
        id: thread.id,
        title: "",
        created_at: new Date(),
      };

      const updatedThreads = [newThread, ...threads];
      setThreads(updatedThreads);
      await saveThreads(updatedThreads);

      setThreadId(thread.id);
      setMessages([]);
      toggleSidebar();
    } catch (error) {
      console.error("새 스레드 생성 중 오류:", error);
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleRateLimit = async () => {
    const maxRetries = 3;
    const baseDelay = 2000; // 2초
    let retryAttempt = 0;

    const retry = async () => {
      retryAttempt++;
      if (retryAttempt <= maxRetries) {
        const waitTime = baseDelay * Math.pow(2, retryAttempt - 1); // 지수 백오프
        console.log(
          `Rate limit 도달. ${
            waitTime / 1000
          }초 후 재시도 (${retryAttempt}/${maxRetries})...`
        );

        setMessages((prev) => [
          ...prev,
          {
            text: `API 사용량 제한에 도달했습니다. ${
              waitTime / 1000
            }초 후 재시도합니다...`,
            isUser: false,
            id: Date.now().toString(),
            createdAt: new Date(),
          },
        ]);

        await delay(waitTime);
        return true; // 재시도
      }
      return false; // 재시도 중단
    };

    return retry();
  };

  const loadThreadMessages = async (threadId: string) => {
    try {
      setIsLoading(true);
      console.log("이전 메시지 로딩 시작:", threadId);

      const messagesList = await openai.beta.threads.messages.list(threadId);
      console.log("메시지 목록 받음:", messagesList.data.length + "개");

      // 메시지를 시간순으로 정렬 (오래된 메시지가 먼저 오도록)
      const formattedMessages = messagesList.data
        .filter((msg) => {
          const content = msg.content[0];
          return (
            content &&
            "type" in content &&
            content.type === "text" &&
            "text" in content &&
            "value" in content.text
          );
        })
        .map((msg) => {
          const content = msg.content[0];
          return {
            text:
              "text" in content && "value" in content.text
                ? content.text.value
                : "",
            isUser: msg.role === "user",
            id: msg.id,
            createdAt: new Date(msg.created_at * 1000),
          };
        })
        .reverse();

      console.log("메시지 변환 완료");
      setMessages(formattedMessages);

      // 스크롤을 아래로 이동
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error("이전 메시지 로딩 중 오류:", error);
      if (error?.error?.code === "rate_limit_exceeded") {
        // rate limit 처리
        const shouldRetry = await handleRateLimit();
        if (shouldRetry) {
          return await loadThreadMessages(threadId);
        }
      }
      setMessages([
        {
          text: "이전 메시지를 불러오는 중 오류가 발생했습니다.",
          isUser: false,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThreadSelect = async (thread: Thread) => {
    try {
      setThreadId(thread.id);
      await loadThreadMessages(thread.id);
      toggleSidebar();
    } catch (error) {
      console.error("스레드 선택 중 오류:", error);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await openai.beta.threads.delete(threadId);
      const updatedThreads = threads.filter((t) => t.id !== threadId);
      setThreads(updatedThreads);
      await saveThreads(updatedThreads);

      if (threadId === threadId) {
        setThreadId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("스레드 삭제 중 오류:", error);
    }
  };

  const updateThreadTitle = async (threadId: string, lastMessage: string) => {
    const updatedThreads = threads.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            last_message: lastMessage,
            // 첫 메시지인 경우 제목 업데이트
            title: thread.title.endsWith("...")
              ? lastMessage.substring(0, 30) + "..."
              : thread.title,
          }
        : thread
    );
    setThreads(updatedThreads);
    await saveThreads(updatedThreads);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    try {
      if (!threadId) {
        // 새 스레드 생성
        const thread = await openai.beta.threads.create();
        console.log("새 스레드 생성됨:", thread.id);

        const newThread: Thread = {
          id: thread.id,
          title: userMessage,
          created_at: new Date(),
        };

        setThreadId(thread.id);
        setThreads((prev) => [newThread, ...prev]);
        await saveThreads([newThread, ...threads]);
      }

      // 사용자 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          text: userMessage,
          isUser: true,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ]);

      // AI 응답 대기 중 메시지 추가
      setIsTyping(true);
      setMessages((prev) => [
        ...prev,
        {
          text: "•••",
          isUser: false,
          id: "typing",
          createdAt: new Date(),
        },
      ]);

      // 스크롤을 아래로 이동
      scrollViewRef.current?.scrollToEnd({ animated: true });

      // AI 응답 받기
      await sendMessageToAssistant(userMessage);

      // 타이핑 중 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));
      setIsTyping(false);
    } catch (error) {
      console.error("메시지 전송 중 오류:", error);
      // 에러 발생 시 타이핑 중 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));
      setIsTyping(false);
    }
  };

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

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

  const sendMessageToAssistant = async (userMessage: string) => {
    if (!threadId || !ASSISTANT_ID) {
      console.error("스레드 ID 또는 어시스턴트 ID가 없음:", {
        threadId,
        ASSISTANT_ID,
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("사용자 메시지 생성 시작");

      // Assistant ID 유효성 검사
      try {
        const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
        console.log("Assistant 정보:", {
          name: assistant.name,
          model: assistant.model,
          instructions: assistant.instructions?.substring(0, 50) + "...",
        });
      } catch (error: any) {
        if (error?.error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }
        console.error("Assistant ID가 유효하지 않음:", error);
        throw new Error("Assistant ID가 유효하지 않습니다.");
      }

      // 사용자 메시지 생성
      let createdMessage;
      try {
        createdMessage = await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: userMessage,
        });
        console.log("사용자 메시지 생성 완료:", createdMessage.id);
      } catch (error: any) {
        if (error?.error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }
        throw error;
      }

      // Assistant 실행
      console.log("Assistant 실행 시작");
      let run;
      try {
        run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: ASSISTANT_ID,
        });
        console.log("Assistant 실행 요청 완료:", run.id);
      } catch (error: any) {
        if (error?.error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }
        throw error;
      }

      // 실행 상태 확인
      let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
        thread_id: threadId,
      });
      console.log("초기 실행 상태:", runStatus.status);

      let retryCount = 0;
      const maxStatusRetries = 30; // 30초 타임아웃

      while (
        runStatus.status !== "completed" &&
        retryCount < maxStatusRetries
      ) {
        await delay(1000);
        try {
          runStatus = await openai.beta.threads.runs.retrieve(run.id, {
            thread_id: threadId,
          });
          console.log("실행 상태 업데이트:", runStatus.status);
        } catch (error: any) {
          if (error?.error?.code === "rate_limit_exceeded") {
            const shouldRetry = await handleRateLimit();
            if (shouldRetry) {
              continue;
            }
          }
          throw error;
        }

        if (runStatus.status === "failed") {
          const runDetails = await openai.beta.threads.runs.retrieve(run.id, {
            thread_id: threadId,
          });
          console.error("실행 실패 상세:", runDetails);

          if (runDetails.last_error?.code === "rate_limit_exceeded") {
            const shouldRetry = await handleRateLimit();
            if (shouldRetry) {
              return await sendMessageToAssistant(userMessage);
            }
          }

          throw new Error(
            `Assistant 실행 실패: ${
              runDetails.last_error?.message || "알 수 없는 오류"
            }`
          );
        }

        if (runStatus.status === "expired") {
          throw new Error("Assistant 실행 시간 초과");
        }

        if (runStatus.status === "requires_action") {
          console.log("Assistant가 추가 작업 요청:", runStatus);
        }

        retryCount++;
      }

      if (retryCount >= maxStatusRetries) {
        throw new Error("Assistant 응답 시간 초과");
      }

      // 메시지 목록 가져오기
      let messages;
      try {
        console.log("메시지 목록 요청");
        messages = await openai.beta.threads.messages.list(threadId);
        const lastMessage = messages.data[0];
        console.log("받은 메시지:", lastMessage);

        if (
          lastMessage.role === "assistant" &&
          lastMessage.content[0].type === "text"
        ) {
          const assistantMessage = {
            text: lastMessage.content[0].text.value,
            isUser: false,
            id: lastMessage.id,
            createdAt: new Date(lastMessage.created_at * 1000),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          await updateThreadTitle(threadId, userMessage);
          console.log("응답 메시지 처리 완료");
        }
      } catch (error: any) {
        if (error?.error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }
        throw error;
      }
    } catch (error: any) {
      console.error("메시지 전송 중 상세 오류:", error);

      // 사용자에게 오류 메시지 표시
      const errorMessage =
        error?.error?.code === "rate_limit_exceeded"
          ? "API 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요."
          : `오류가 발생했습니다: ${
              error.message || "알 수 없는 오류가 발생했습니다"
            }`;

      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
          isUser: false,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
                      // 현재 선택된 스레드 강조
                      ...(thread.id === threadId && {
                        backgroundColor: `${colors.accent}10`,
                      }),
                    },
                  ]}
                  onPress={() => handleThreadSelect(thread)}
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
                    <View style={styles.threadTextContainer}>
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
                        {thread.title || "새로운 채팅"}
                      </Text>
                      {thread.last_message && (
                        <Text
                          style={[
                            styles.threadLastMessage,
                            {
                              color: colors.textSecondary,
                            },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {thread.last_message}
                        </Text>
                      )}
                    </View>
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
              onPress={createNewThread}
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
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.isUser
                    ? styles.userMessageWrapper
                    : styles.aiMessageWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageContainer,
                    msg.isUser
                      ? [styles.userMessage, { backgroundColor: colors.accent }]
                      : [
                          styles.aiMessage,
                          {
                            backgroundColor: colors.cardBackground,
                            borderColor: colors.border,
                          },
                        ],
                  ]}
                >
                  {msg.id === "typing" ? (
                    <TypingIndicator />
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        {
                          color: msg.isUser ? "#FFFFFF" : colors.textPrimary,
                        },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Container */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.cardBackground,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                },
              ]}
              placeholder={
                isTyping ? "응답을 기다리는 중..." : "메시지를 입력하세요..."
              }
              placeholderTextColor={colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!isTyping}
              textAlignVertical="center"
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    input.trim() && !isTyping
                      ? colors.accent
                      : colors.cardBackground,
                  opacity: !input.trim() || isTyping ? 0.5 : 1,
                },
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <Ionicons
                name={isTyping ? "time-outline" : "send"}
                size={24}
                color={
                  input.trim() && !isTyping ? "#FFFFFF" : colors.textSecondary
                }
                style={{
                  transform: [{ rotate: isTyping ? "0deg" : "45deg" }],
                }}
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
  threadTextContainer: {
    flex: 1,
  },
  threadTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  threadLastMessage: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    opacity: 0.6,
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
  messageContainer: {
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
  messageText: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
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
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 24,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    paddingHorizontal: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default ChatScreen;
