import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeColors } from "../theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Markdown from "react-native-markdown-display";

import { Message } from "../types/chat";

type RootTabParamList = {
  Chat: undefined;
  MarketNews: undefined;
  Calendar: undefined;
  StockList: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootTabParamList>;

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
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const titleInputRef = useRef<TextInput>(null);

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

  // React Navigation 제스처 비활성화
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        gestureEnabled: false,
        gestureDirection: "horizontal",
      });
    }, [navigation])
  );

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

  const ASSISTANT_ID = process.env.EXPO_PUBLIC_OPENAI_ASSISTANT_ID;
  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const OPENAI_BASE_URL = "https://api.openai.com/v1";

  // OpenAI API 요청을 위한 헤더
  const getOpenAIHeaders = () => ({
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2",
  });

  useEffect(() => {
    initializeThread();
  }, []);

  const initializeThread = async () => {
    try {
      await loadThreadsFromOpenAI();
    } catch (error) {
      console.error("스레드 초기화 중 오류:", error);
      // 오류 발생 시 빈 상태로 시작 (사용자가 메시지를 보낼 때 생성)
      console.log("초기화 오류로 인해 빈 상태로 시작");
    }
  };

  // OpenAI에서 스레드 목록을 가져오는 함수
  const loadThreadsFromOpenAI = async (keepCurrentSelection = false) => {
    try {
      const existingThreadIds = await AsyncStorage.getItem(THREADS_STORAGE_KEY);
      let threadIds: string[] = [];

      if (existingThreadIds) {
        const parsedThreads: Thread[] = JSON.parse(existingThreadIds);
        threadIds = parsedThreads.map((thread) => thread.id);
      }

      if (threadIds.length === 0) {
        // 저장된 스레드가 없으면 빈 상태로 시작 (사용자가 메시지를 보낼 때 생성)
        console.log("저장된 스레드가 없음, 빈 상태로 시작");
        return;
      }

      // 각 스레드 ID에 대해 OpenAI에서 최신 정보 가져오기
      const threadPromises = threadIds.map(async (threadId) => {
        try {
          // 스레드 정보 가져오기
          const threadResponse = await fetch(
            `${OPENAI_BASE_URL}/threads/${threadId}`,
            {
              method: "GET",
              headers: getOpenAIHeaders(),
            }
          );

          if (!threadResponse.ok) {
            console.warn(
              `스레드 ${threadId} 로드 실패:`,
              threadResponse.status
            );
            return null;
          }

          const threadData = await threadResponse.json();

          // 스레드의 최신 메시지 가져오기
          const messagesResponse = await fetch(
            `${OPENAI_BASE_URL}/threads/${threadId}/messages?limit=1`,
            {
              method: "GET",
              headers: getOpenAIHeaders(),
            }
          );

          let lastMessage = "";
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            if (messagesData.data && messagesData.data.length > 0) {
              const latestMessage = messagesData.data[0];
              if (
                latestMessage.content &&
                latestMessage.content[0]?.type === "text"
              ) {
                lastMessage =
                  latestMessage.content[0].text.value.substring(0, 50) + "...";
              }
            }
          }

          return {
            id: threadData.id,
            title: threadData.metadata?.title || "새로운 대화",
            created_at: new Date(threadData.created_at * 1000),
            last_message: lastMessage,
          } as Thread;
        } catch (error) {
          console.warn(`스레드 ${threadId} 처리 중 오류:`, error);
          return null;
        }
      });

      const loadedThreads = await Promise.all(threadPromises);
      const validThreads = loadedThreads.filter(
        (thread) => thread !== null
      ) as Thread[];

      if (validThreads.length === 0) {
        // 유효한 스레드가 없으면 빈 상태로 시작 (사용자가 메시지를 보낼 때 생성)
        console.log("유효한 스레드가 없음, 빈 상태로 시작");
        return;
      }

      // 생성 시간 순으로 정렬 (최신순)
      const sortedThreads = validThreads.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setThreads(sortedThreads);

      // AsyncStorage 업데이트
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(sortedThreads)
      );

      // 현재 선택을 유지하거나 가장 최근 스레드 선택
      if (!keepCurrentSelection || !threadId) {
        const mostRecentThread = sortedThreads[0];
        if (mostRecentThread) {
          setThreadId(mostRecentThread.id);
          await loadThreadMessages(mostRecentThread.id);
        }
      }
    } catch (error) {
      console.error("OpenAI 스레드 로드 중 오류:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    Keyboard.dismiss();

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    let currentThreadId = threadId;

    if (!currentThreadId) {
      // 먼저 기존에 비어있는 "새로운 대화" 스레드가 있는지 확인
      const emptyNewThread = threads.find(
        (thread) => thread.title === "새로운 대화" && !thread.last_message
      );

      if (emptyNewThread) {
        // 빈 "새로운 대화" 스레드가 있으면 해당 스레드를 사용
        console.log("메시지 전송 시 기존 빈 스레드 사용:", emptyNewThread.id);
        currentThreadId = emptyNewThread.id;
        setThreadId(currentThreadId);
      } else {
        // 빈 스레드가 없을 때만 새로 생성
        await createNewThread();
        // createNewThread에서 설정된 새로운 threadId를 기다림
        return; // handleSend를 다시 호출하도록 사용자가 다시 전송해야 함
      }
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      await sendMessageToAssistant(userMessage, currentThreadId);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        isUser: false,
        createdAt: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const toggleSidebar = () => {
    Keyboard.dismiss();
    const newSidebarState = !isSidebarOpen;
    const toValue = newSidebarState ? 0 : -SIDEBAR_WIDTH;
    const overlayToValue = newSidebarState ? 0.5 : 0;

    // 상태를 먼저 업데이트
    setIsSidebarOpen(newSidebarState);

    // 애니메이션을 즉시 시작
    Animated.parallel([
      Animated.spring(sidebarAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 65, // 적당한 속도로 조정
        friction: 10, // 부드러운 애니메이션
      }),
      Animated.timing(overlayAnimation, {
        toValue: overlayToValue,
        duration: 250, // 조금 더 여유있게
        useNativeDriver: true,
      }),
    ]).start();

    // 사이드바를 열 때 스레드 목록 새로고침 (백그라운드에서 실행)
    if (newSidebarState) {
      loadThreadsFromOpenAI(true).catch((error) => {
        console.error("스레드 목록 새로고침 중 오류:", error);
      });
    }
  };

  const handleRetry = async (failedMessageId: string) => {
    // 실패한 메시지 찾기
    const failedMessage = messages.find((msg) => msg.id === failedMessageId);
    if (!failedMessage?.lastUserMessage) return;

    // 실패한 메시지 제거
    setMessages((prev) => prev.filter((msg) => msg.id !== failedMessageId));

    // 메시지 재전송
    await sendMessageToAssistant(failedMessage.lastUserMessage);
  };

  // 생각하는 메시지 배열 추가
  const thinkingMessages = [
    "답변을 생각하고 있어요...",
    "정보를 분석하고 있어요...",
    "최적의 답변을 준비중이에요...",
    "조금만 기다려주세요...",
    "거의 다 왔어요...",
  ];
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState(0);
  const thinkingAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const [messageOpacity] = useState(new Animated.Value(1));
  const [colorAnimation] = useState(new Animated.Value(0));

  // 색상 보간 함수 생성
  const interpolatedColor = colorAnimation.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [
      colors.accent,
      colors.textPrimary,
      colors.accent,
      colors.textSecondary,
      colors.accent,
      colors.textPrimary,
    ],
  });

  // 색상 애니메이션 시작
  const startColorAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  // 색상 애니메이션 정지
  const stopColorAnimation = () => {
    colorAnimation.stopAnimation();
    colorAnimation.setValue(0);
  };

  // cleanup effect 수정
  useEffect(() => {
    return () => {
      if (thinkingAnimationRef.current) {
        clearInterval(thinkingAnimationRef.current);
      }
      stopColorAnimation();
    };
  }, []);

  // 생각하는 애니메이션 시작 함수 수정
  const startThinkingAnimation = (messageId: string) => {
    if (thinkingAnimationRef.current) {
      clearInterval(thinkingAnimationRef.current);
    }

    // 초기 메시지 설정
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, text: thinkingMessages[0] } : msg
      )
    );

    // 색상 애니메이션 시작
    startColorAnimation();

    thinkingAnimationRef.current = setInterval(() => {
      // 페이드 아웃
      Animated.timing(messageOpacity, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // 메시지 변경
        setCurrentThinkingMessage((prev) => {
          const nextIndex = (prev + 1) % thinkingMessages.length;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageId
                ? { ...msg, text: thinkingMessages[nextIndex] }
                : msg
            )
          );
          return nextIndex;
        });

        // 페이드 인
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);
  };

  // 생각하는 애니메이션 정지
  const stopThinkingAnimation = () => {
    if (thinkingAnimationRef.current) {
      clearInterval(thinkingAnimationRef.current);
      thinkingAnimationRef.current = null;
    }
  };

  const sendMessageToAssistant = async (
    userMessage: string,
    useThreadId?: string
  ) => {
    const currentThreadId = useThreadId || threadId;
    if (!currentThreadId) {
      return;
    }

    try {
      // 메시지 생성
      const createdMessageResponse = await fetch(
        `${OPENAI_BASE_URL}/threads/${currentThreadId}/messages`,
        {
          method: "POST",
          headers: getOpenAIHeaders(),
          body: JSON.stringify({
            role: "user",
            content: userMessage,
          }),
        }
      );

      if (!createdMessageResponse.ok) {
        throw new Error(
          `Failed to create message: ${createdMessageResponse.status}`
        );
      }

      const createdMessage = await createdMessageResponse.json();

      // Run 생성
      const runResponse = await fetch(
        `${OPENAI_BASE_URL}/threads/${currentThreadId}/runs`,
        {
          method: "POST",
          headers: getOpenAIHeaders(),
          body: JSON.stringify({
            assistant_id: ASSISTANT_ID!,
          }),
        }
      );

      if (!runResponse.ok) {
        throw new Error(`Failed to create run: ${runResponse.status}`);
      }

      const run = await runResponse.json();

      // Run 상태 확인
      let runStatus = await fetch(
        `${OPENAI_BASE_URL}/threads/${currentThreadId}/runs/${run.id}`,
        {
          method: "GET",
          headers: getOpenAIHeaders(),
        }
      );
      let runStatusData = await runStatus.json();

      while (
        runStatusData.status === "in_progress" ||
        runStatusData.status === "queued"
      ) {
        await delay(1000);
        runStatus = await fetch(
          `${OPENAI_BASE_URL}/threads/${currentThreadId}/runs/${run.id}`,
          {
            method: "GET",
            headers: getOpenAIHeaders(),
          }
        );
        runStatusData = await runStatus.json();
      }

      if (runStatusData.status === "failed") {
        throw new Error(`Run failed: ${runStatusData.last_error?.message}`);
      }

      // 메시지 목록 가져오기
      const messagesResponse = await fetch(
        `${OPENAI_BASE_URL}/threads/${currentThreadId}/messages`,
        {
          method: "GET",
          headers: getOpenAIHeaders(),
        }
      );
      if (!messagesResponse.ok) {
        throw new Error(`Failed to fetch messages: ${messagesResponse.status}`);
      }

      const messagesList = await messagesResponse.json();

      const assistantMessage = messagesList.data.find(
        (msg: any) =>
          msg.role === "assistant" && msg.created_at > createdMessage.created_at
      );

      if (assistantMessage && assistantMessage.content[0].type === "text") {
        const assistantText = assistantMessage.content[0].text.value;
        const analysisMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: assistantText,
          isUser: false,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, analysisMessage]);

        // 현재 스레드의 제목이 "새로운 대화"인 경우에만 제목 업데이트
        const currentThread = threads.find((t) => t.id === currentThreadId);
        if (currentThread && currentThread.title === "새로운 대화") {
          await updateThreadTitle(currentThreadId, userMessage);
        } else {
          // 제목은 업데이트하지 않고 마지막 메시지만 업데이트
          setThreads((prevThreads) =>
            prevThreads.map((thread) =>
              thread.id === currentThreadId
                ? {
                    ...thread,
                    last_message: userMessage.substring(0, 50) + "...",
                  }
                : thread
            )
          );
        }
      }
    } catch (error) {
      console.error("메시지 전송 중 오류:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.",
        isUser: false,
        createdAt: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleThreadSelect = async (thread: Thread) => {
    try {
      setThreadId(thread.id);

      // 사이드바 닫기 애니메이션 실행
      setIsSidebarOpen(false);
      Animated.parallel([
        Animated.spring(sidebarAnimation, {
          toValue: -SIDEBAR_WIDTH,
          useNativeDriver: true,
          tension: 70, // 닫기는 조금 더 빠르게
          friction: 9,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      await loadThreadMessages(thread.id);
    } catch (error) {
      console.error("스레드 선택 중 오류:", error);
    }
  };

  const confirmDeleteThread = (thread: Thread) => {
    Alert.alert(
      "대화 삭제",
      `"${thread.title}" 대화를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => handleDeleteThread(thread.id),
        },
      ]
    );
  };

  const handleDeleteThread = async (threadIdToDelete: string) => {
    try {
      // API 호출로 OpenAI에서 스레드 삭제
      const response = await fetch(
        `${OPENAI_BASE_URL}/threads/${threadIdToDelete}`,
        {
          method: "DELETE",
          headers: getOpenAIHeaders(),
        }
      );

      // API 응답이 실패하더라도 로컬에서는 제거 (이미 삭제된 경우 등)
      if (!response.ok) {
        console.warn(
          `OpenAI 스레드 삭제 실패: ${response.status}, 로컬에서만 제거`
        );
      }

      // 로컬 스레드 목록에서 삭제
      const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
      setThreads(updatedThreads);

      // AsyncStorage 업데이트
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(updatedThreads)
      );

      // 삭제된 스레드가 현재 활성 스레드인 경우 처리
      if (threadId === threadIdToDelete) {
        setThreadId(null);
        setMessages([]);

        // 다른 스레드가 남아있는 경우
        if (updatedThreads.length > 0) {
          // 가장 최근 스레드 선택 (생성 시간 기준)
          const mostRecentThread = updatedThreads.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];

          if (mostRecentThread) {
            setThreadId(mostRecentThread.id);
            await loadThreadMessages(mostRecentThread.id);
          } else {
            // 예외적으로 스레드가 있지만 선택할 수 없는 경우 새 스레드 생성
            await createNewThread();
          }
        } else {
          // 모든 스레드가 삭제된 경우 새 스레드 생성
          await createNewThread();
        }
      }

      // 삭제 후 사이드바 닫기 (사용자 경험 개선)
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        Animated.parallel([
          Animated.spring(sidebarAnimation, {
            toValue: -SIDEBAR_WIDTH,
            useNativeDriver: true,
            tension: 70,
            friction: 9,
          }),
          Animated.timing(overlayAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error("스레드 삭제 중 오류:", error);

      // 오류가 발생해도 로컬에서는 제거 (네트워크 오류 등의 경우)
      const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
      setThreads(updatedThreads);

      try {
        await AsyncStorage.setItem(
          THREADS_STORAGE_KEY,
          JSON.stringify(updatedThreads)
        );
      } catch (storageError) {
        console.error("AsyncStorage 업데이트 중 오류:", storageError);
      }

      // 현재 스레드가 삭제된 경우 새 스레드 생성
      if (threadId === threadIdToDelete) {
        setThreadId(null);
        setMessages([]);

        if (updatedThreads.length > 0) {
          const mostRecentThread = updatedThreads.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];

          if (mostRecentThread) {
            setThreadId(mostRecentThread.id);
            try {
              await loadThreadMessages(mostRecentThread.id);
            } catch (loadError) {
              console.error("메시지 로딩 중 오류:", loadError);
              await createNewThread();
            }
          } else {
            await createNewThread();
          }
        } else {
          await createNewThread();
        }
      }
    }
  };

  const updateThreadTitle = async (threadId: string, lastMessage: string) => {
    try {
      const newTitle = await generateThreadTitle(lastMessage);

      // 제목 생성에 실패한 경우 (여전히 "새로운 대화"인 경우) 업데이트하지 않음
      if (newTitle === "새로운 대화") {
        console.warn("제목 생성에 실패하여 기존 제목을 유지합니다.");
        // 마지막 메시지만 업데이트
        const updatedThreads = threads.map((thread) =>
          thread.id === threadId
            ? { ...thread, last_message: lastMessage.substring(0, 50) + "..." }
            : thread
        );
        setThreads(updatedThreads);
        await AsyncStorage.setItem(
          THREADS_STORAGE_KEY,
          JSON.stringify(updatedThreads)
        );
        return;
      }

      // OpenAI 스레드 메타데이터 업데이트
      const response = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}`, {
        method: "POST",
        headers: getOpenAIHeaders(),
        body: JSON.stringify({
          metadata: {
            title: newTitle,
            last_message: lastMessage.substring(0, 50) + "...",
          },
        }),
      });

      if (!response.ok) {
        console.warn(
          `OpenAI 스레드 메타데이터 업데이트 실패: ${response.status}`
        );
      }

      // 로컬 상태 업데이트
      const updatedThreads = threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              title: newTitle,
              last_message: lastMessage.substring(0, 50) + "...",
            }
          : thread
      );
      setThreads(updatedThreads);
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(updatedThreads)
      );
    } catch (error) {
      console.error("스레드 제목 업데이트 중 오류:", error);
      // 오류 발생 시 마지막 메시지만 업데이트
      const updatedThreads = threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, last_message: lastMessage.substring(0, 50) + "..." }
          : thread
      );
      setThreads(updatedThreads);
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(updatedThreads)
      );
    }
  };

  const startEditingTitle = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
    // 다음 프레임에서 포커스
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  const saveThreadTitle = async (threadId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      // 제목이 비어있으면 원래대로 되돌림
      setEditingThreadId(null);
      setEditingTitle("");
      return;
    }

    try {
      // OpenAI 스레드 메타데이터 업데이트
      const response = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}`, {
        method: "POST",
        headers: getOpenAIHeaders(),
        body: JSON.stringify({
          metadata: {
            title: newTitle.trim(),
            last_message:
              threads.find((t) => t.id === threadId)?.last_message || "",
          },
        }),
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        const updatedThreads = threads.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              title: newTitle.trim(),
            };
          }
          return thread;
        });
        setThreads(updatedThreads);

        // AsyncStorage에도 저장
        await AsyncStorage.setItem(
          THREADS_STORAGE_KEY,
          JSON.stringify(updatedThreads)
        );
      }
    } catch (error) {
      console.error("스레드 제목 업데이트 중 오류:", error);
    } finally {
      setEditingThreadId(null);
      setEditingTitle("");
    }
  };

  const cancelEditingTitle = () => {
    setEditingThreadId(null);
    setEditingTitle("");
  };

  const createNewThread = async () => {
    try {
      // 사이드바가 열려있다면 닫기 애니메이션 실행
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        Animated.parallel([
          Animated.spring(sidebarAnimation, {
            toValue: -SIDEBAR_WIDTH,
            useNativeDriver: true,
            tension: 70,
            friction: 9,
          }),
          Animated.timing(overlayAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // 먼저 기존에 비어있는 "새로운 대화" 스레드가 있는지 확인
      const emptyNewThread = threads.find(
        (thread) => thread.title === "새로운 대화" && !thread.last_message
      );

      if (emptyNewThread) {
        // 빈 "새로운 대화" 스레드가 있으면 해당 스레드를 선택
        console.log("기존 빈 스레드 사용:", emptyNewThread.id);
        setThreadId(emptyNewThread.id);
        setMessages([]);
        return;
      }

      // 빈 스레드가 없을 때만 새로 생성
      const response = await fetch(`${OPENAI_BASE_URL}/threads`, {
        method: "POST",
        headers: getOpenAIHeaders(),
        body: JSON.stringify({
          metadata: {
            title: "새로운 대화",
            last_message: "",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.status}`);
      }

      const newThread = await response.json();
      const threadTitle = "새로운 대화";

      const newThreadData: Thread = {
        id: newThread.id,
        title: threadTitle,
        created_at: new Date(newThread.created_at * 1000),
        last_message: "",
      };

      const updatedThreads = [newThreadData, ...threads];
      setThreads(updatedThreads);

      // AsyncStorage에 저장
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(updatedThreads)
      );
      setThreadId(newThread.id);
      setMessages([]);
      console.log("새 스레드 생성 완료:", newThread.id);
    } catch (error) {
      console.error("새 스레드 생성 중 오류:", error);
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const loadThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(
        `${OPENAI_BASE_URL}/threads/${threadId}/messages`,
        {
          method: "GET",
          headers: getOpenAIHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const messagesList = await response.json();

      const convertedMessages: Message[] = messagesList.data
        .map((msg: any) => ({
          id: msg.id,
          text: msg.content[0].type === "text" ? msg.content[0].text.value : "",
          isUser: msg.role === "user",
          createdAt: new Date(msg.created_at * 1000),
        }))
        .reverse();

      setMessages(convertedMessages);
    } catch (error) {
      console.error("메시지 로딩 중 오류:", error);
    }
  };

  const generateThreadTitle = async (message: string) => {
    try {
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: getOpenAIHeaders(),
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "사용자의 메시지를 바탕으로 간단하고 명확한 대화 제목을 생성해주세요. 제목은 15자 이내로 작성하고, 핵심 키워드를 포함해야 합니다.",
            },
            {
              role: "user",
              content: `다음 메시지에 대한 적절한 대화 제목을 생성해주세요: "${message}"`,
            },
          ],
          max_tokens: 50,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate title: ${response.status}`);
      }

      const data = await response.json();
      let title = data.choices?.[0]?.message?.content?.trim();

      // API 응답이 없거나 비어있는 경우 간단한 제목 생성
      if (!title) {
        // 메시지의 첫 15자로 제목 생성
        title = message.substring(0, 15).trim();
        if (title.length < message.length) {
          title += "...";
        }
      }

      // 따옴표 제거 및 길이 제한
      const cleanTitle = title.replace(/^["']|["']$/g, "");
      return cleanTitle.length > 20
        ? cleanTitle.substring(0, 17) + "..."
        : cleanTitle;
    } catch (error) {
      console.error("제목 생성 중 오류:", error);
      // API 오류 시 메시지의 첫 부분으로 제목 생성
      const fallbackTitle = message.substring(0, 15).trim();
      return fallbackTitle.length < message.length
        ? fallbackTitle + "..."
        : fallbackTitle;
    }
  };

  // 마크다운 스타일 설정
  const markdownStyles = {
    body: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "Pretendard-Regular",
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontFamily: "Pretendard-Bold",
      marginVertical: 16,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    heading2: {
      fontSize: 20,
      fontFamily: "Pretendard-SemiBold",
      marginVertical: 12,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    heading3: {
      fontSize: 18,
      fontFamily: "Pretendard-SemiBold",
      marginVertical: 10,
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    paragraph: {
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: `${colors.accent}08`,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginVertical: 8,
      borderRadius: 4,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      marginVertical: 4,
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
    },
    table: {
      borderWidth: 1,
      borderColor: `${colors.border}50`,
      borderRadius: 12,
      marginVertical: 12,
      overflow: "hidden" as const,
      backgroundColor: colors.cardBackground,
    },
    thead: {
      backgroundColor: `${colors.accent}10`,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.border}50`,
    },
    tr: {
      flexDirection: "row" as const,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.border}30`,
    },
    th: {
      flex: 1,
      padding: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    td: {
      flex: 1,
      padding: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    strong: {
      fontFamily: "Pretendard-SemiBold",
      color: colors.accent,
    },
    em: {
      fontStyle: "italic" as const,
    },
    hr: {
      backgroundColor: `${colors.border}50`,
      height: 1,
      marginVertical: 16,
    },
    link: {
      color: colors.accent,
      textDecorationLine: "underline" as const,
    },
    image: {
      borderRadius: 12,
      marginVertical: 8,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Logo - Fixed Position */}
      <Image
        source={require("../../assets/icon.png")}
        style={styles.backgroundLogo}
        resizeMode="contain"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: "transparent" }]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: colors.cardBackground }}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.cardBackground,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.sidebarToggleButton}
              onPress={toggleSidebar}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="menu-outline"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <Image
              source={require("../../assets/title.png")}
              style={styles.headerTitle}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={[
                styles.newChatHeaderButton,
                { backgroundColor: `${colors.accent}08` },
              ]}
              onPress={createNewThread}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="add" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Chat Messages */}
        <View
          style={[styles.messagesWrapper, { backgroundColor: "transparent" }]}
        >
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContentContainer,
              { flexGrow: 1 },
            ]}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 ? (
              <View style={styles.welcomeContainer}></View>
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
                        ? [
                            styles.userMessage,
                            {
                              backgroundColor: colors.accent,
                            },
                          ]
                        : [
                            styles.aiMessage,
                            {
                              borderTopWidth: 0.5,
                              borderBottomWidth: 0.5,
                              borderColor: `${colors.border}50`,
                            },
                          ],
                    ]}
                  >
                    {!msg.isUser && (
                      <View style={styles.aiMessageHeader}>
                        <View
                          style={[
                            styles.avatarContainer,
                            { backgroundColor: `${colors.accent}08` },
                          ]}
                        >
                          <Ionicons
                            name="terminal-outline"
                            size={14}
                            color={colors.accent}
                            style={{ opacity: 0.8 }}
                          />
                        </View>
                        <Text
                          style={[
                            styles.aiLabel,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Stock GPT
                        </Text>
                      </View>
                    )}
                    {msg.id === "typing" ? (
                      <TypingIndicator />
                    ) : (
                      <>
                        {thinkingMessages.includes(msg.text) ? (
                          <Animated.Text
                            style={[
                              styles.messageText,
                              {
                                opacity: messageOpacity,
                                color: interpolatedColor,
                              },
                            ]}
                          >
                            {msg.text}
                          </Animated.Text>
                        ) : msg.isUser ? (
                          <Text
                            style={[styles.messageText, { color: "#FFFFFF" }]}
                          >
                            {msg.text}
                          </Text>
                        ) : (
                          <Markdown
                            style={markdownStyles}
                            onLinkPress={(url: string) => {
                              Linking.openURL(url);
                              return false;
                            }}
                          >
                            {msg.text}
                          </Markdown>
                        )}
                        {msg.error && (
                          <TouchableOpacity
                            style={[
                              styles.retryButton,
                              { backgroundColor: colors.accent },
                            ]}
                            onPress={() => handleRetry(msg.id)}
                          >
                            <Ionicons
                              name="refresh"
                              size={16}
                              color="#FFFFFF"
                            />
                            <Text style={styles.retryButtonText}>
                              다시 시도
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

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
          <Pressable
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => inputRef.current && inputRef.current.focus()}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                },
              ]}
              placeholder={
                isTyping
                  ? "응답을 기다리는 중..."
                  : "Stalk에게 투자 조언을 받으세요."
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
                name={isTyping ? "time-outline" : "arrow-forward"}
                size={14}
                color={
                  input.trim() && !isTyping ? "#FFFFFF" : colors.textSecondary
                }
              />
            </TouchableOpacity>
          </Pressable>
        </View>

        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnimation,
              backgroundColor: "#000",
              pointerEvents: isSidebarOpen ? "auto" : "none",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={toggleSidebar}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.background, // 배경색 통일
              transform: [{ translateX: sidebarAnimation }],
            },
          ]}
        >
          <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, backgroundColor: colors.background }}
          >
            <View style={styles.sidebarContent}>
              <View
                style={[
                  styles.sidebarHeader,
                  {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.headerContent}>
                  <Text
                    style={[styles.sidebarTitle, { color: colors.textPrimary }]}
                  >
                    대화 목록 ({threads.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={toggleSidebar}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={colors.textSecondary}
                      style={{ opacity: 0.6 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={[
                  styles.threadList,
                  { backgroundColor: colors.cardBackground },
                ]}
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
                        backgroundColor:
                          thread.id === threadId
                            ? `${colors.accent}08`
                            : "transparent",
                      },
                    ]}
                    onPress={() => handleThreadSelect(thread)}
                  >
                    <View style={styles.threadItemInner}>
                      <View
                        style={[
                          styles.threadIconContainer,
                          {
                            backgroundColor:
                              thread.id === threadId
                                ? `${colors.accent}15`
                                : `${colors.accent}08`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={15}
                          color={colors.accent}
                          style={{
                            opacity: thread.id === threadId ? 1 : 0.8,
                          }}
                        />
                      </View>
                      <View style={styles.threadTextContainer}>
                        {editingThreadId === thread.id ? (
                          <TextInput
                            ref={titleInputRef}
                            style={[
                              styles.threadTitleInput,
                              {
                                color: colors.textPrimary,
                                borderColor: colors.accent,
                              },
                            ]}
                            value={editingTitle}
                            onChangeText={setEditingTitle}
                            onBlur={() =>
                              saveThreadTitle(thread.id, editingTitle)
                            }
                            onSubmitEditing={() =>
                              saveThreadTitle(thread.id, editingTitle)
                            }
                            onKeyPress={({ nativeEvent }) => {
                              if (nativeEvent.key === "Escape") {
                                cancelEditingTitle();
                              }
                            }}
                            autoFocus
                            selectTextOnFocus
                            maxLength={30}
                            placeholder="제목을 입력하세요"
                            placeholderTextColor={colors.textSecondary}
                          />
                        ) : (
                          <Text
                            style={[
                              styles.threadTitle,
                              {
                                color: colors.textPrimary,
                                opacity: thread.id === threadId ? 1 : 0.9,
                              },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {thread.title || "새로운 대화"}
                          </Text>
                        )}
                        {thread.last_message && (
                          <Text
                            style={[
                              styles.threadLastMessage,
                              {
                                color: colors.textSecondary,
                                opacity: thread.id === threadId ? 0.8 : 0.6,
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
                    <View style={styles.threadActions}>
                      {editingThreadId !== thread.id && (
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => startEditingTitle(thread)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name="create-outline"
                            size={16}
                            color={colors.accent}
                            style={{ opacity: 0.7 }}
                          />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => confirmDeleteThread(thread)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={15}
                          color={colors.textSecondary}
                          style={{ opacity: 0.4 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[
                  styles.newChatButton,
                  {
                    backgroundColor: `${colors.accent}08`,
                  },
                ]}
                onPress={createNewThread}
              >
                <View style={styles.newChatButtonContent}>
                  <Ionicons name="add-circle" size={17} color={colors.accent} />
                  <Text
                    style={[styles.newChatButtonText, { color: colors.accent }]}
                  >
                    새로운 대화
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesWrapper: {
    flex: 1,
    position: "relative",
  },
  backgroundLogo: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 120,
    height: 120,
    marginTop: -60,
    marginLeft: -60,
    opacity: 0.08,
    zIndex: 0,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
    height: "100%",
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
    padding: 16,
    height: 68,
    borderBottomWidth: 0.5,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarTitle: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    letterSpacing: -0.3,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
  },
  threadList: {
    flex: 1,
  },
  threadListContent: {
    paddingVertical: 4,
  },
  threadItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    paddingRight: 12,
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
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  threadTextContainer: {
    flex: 1,
  },
  threadTitle: {
    fontSize: 15,
    fontFamily: "Pretendard-Medium",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  threadLastMessage: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
    opacity: 0.8,
  },
  newChatButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  newChatButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  newChatButtonText: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    letterSpacing: -0.3,
  },

  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 16 : 24,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Pretendard-Regular",
    lineHeight: 28,
    opacity: 0.8,
  },
  messageWrapper: {
    marginVertical: 12,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
    paddingLeft: "15%",
    marginVertical: 8,
  },
  aiMessageWrapper: {
    width: "100%",
    marginVertical: 0,
  },
  aiMessageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 4,
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  aiLabel: {
    fontSize: 13,
    fontFamily: "Pretendard-SemiBold",
    opacity: 0.5,
    letterSpacing: -0.3,
  },
  messageContainer: {
    width: "100%",
  },
  userMessage: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Pretendard-Regular",
    lineHeight: 24,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.5,
  },
  inputContainer: {
    borderTopWidth: 1,
    padding: 12,
    width: "100%",
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
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
    fontFamily: "Pretendard-Regular",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 18,
    maxHeight: 100,
    lineHeight: 18,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  thinkingDotsContainer: {
    marginTop: 8,
    opacity: 0.7,
  },
  threadTitleInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  threadActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 8,
    opacity: 0.8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 68,
    borderBottomWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarToggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    height: 24,
    alignSelf: "center",
  },
  newChatHeaderButton: {
    padding: 8,
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChatScreen;
