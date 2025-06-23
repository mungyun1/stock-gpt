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
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeColors } from "../theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Markdown from "react-native-markdown-display";

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
  error?: boolean;
  lastUserMessage?: string;
};

type Thread = {
  id: string;
  title: string;
  created_at: Date;
  last_message?: string;
};

// 백엔드 응답 타입 정의
interface StockAnalysisResponse {
  stock_info: any; // yfinance에서 반환하는 데이터 타입
  analysis: string;
}

interface MarketAnalysisResponse {
  market_data: {
    [key: string]: {
      name?: string;
      current_price?: number;
      change_percent?: number;
      previous_close?: number;
      volume?: number;
      price_history?: number[];
      volume_history?: number[];
      error?: string;
      rate?: number;
      change?: number;
    };
  };
  analysis: string;
}

// 백엔드 요청 타입 정의
interface StockAnalysisRequest {
  ticker: string;
}

interface MarketAnalysisRequest {
  indices: string[];
  lookback_days?: number;
  include_news?: boolean;
}

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
    React.useCallback(() => {
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

  useEffect(() => {
    initializeThread();
  }, []);

  const initializeThread = async () => {
    try {
      const existingThreads = await AsyncStorage.getItem(THREADS_STORAGE_KEY);
      if (existingThreads) {
        const parsedThreads: Thread[] = JSON.parse(existingThreads);
        setThreads(parsedThreads);

        // 가장 최근 스레드 찾기
        const mostRecentThread = parsedThreads
          .filter((thread) => thread.last_message)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];

        if (mostRecentThread) {
          setThreadId(mostRecentThread.id);
          await loadThreadMessages(mostRecentThread.id);
        } else {
          await createNewThread();
        }
      } else {
        await createNewThread();
      }
    } catch (error) {
      // 스레드 초기화 중 오류 처리
    }
  };

  const saveThreads = async (updatedThreads: Thread[]) => {
    try {
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(updatedThreads)
      );
      setThreads(updatedThreads);
    } catch (error) {
      // 스레드 저장 중 오류 처리
    }
  };

  // 티커 추출 함수
  const extractTicker = (message: string): string | null => {
    const tickerPattern = /\b[A-Z]{1,5}\b/g;
    const matches = message.match(tickerPattern);
    return matches ? matches[0] : null;
  };

  // 주식 티커 패턴
  const STOCK_TICKER_PATTERN = /\b[A-Z]{1,5}\b/g;

  // 백엔드 URL
  const BACKEND_URL = "http://localhost:8000";

  // 시장 분석 관련 키워드
  const MARKET_KEYWORDS = [
    "시장",
    "마켓",
    "market",
    "금리",
    "환율",
    "interest",
    "rate",
    "S&P",
    "SP500",
    "나스닥",
    "NASDAQ",
    "코스피",
    "KOSPI",
    "코스닥",
    "KOSDAQ",
    "증시",
    "지수",
    "index",
    "글로벌",
    "global",
  ];

  // 입력 메시지 분석
  const analyzeUserInput = (
    message: string
  ): "stock" | "market" | "general" => {
    // 대소문자 구분 없이 검색하기 위해 소문자로 변환
    const lowerMessage = message.toLowerCase();

    // 티커 심볼이 있는지 확인
    const hasStockTicker = STOCK_TICKER_PATTERN.test(message);

    // 시장 분석 키워드가 있는지 확인
    const hasMarketKeyword = MARKET_KEYWORDS.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (hasStockTicker) return "stock";
    if (hasMarketKeyword) return "market";
    return "general";
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

    if (!threadId) {
      await createNewThread();
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      const messageType = analyzeUserInput(userMessage);

      if (messageType === "stock") {
        const ticker = extractTicker(userMessage);
        if (ticker) {
          const stockRequest: StockAnalysisRequest = { ticker };

          const response = await fetch(`${BACKEND_URL}/analyze`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(stockRequest),
          });

          if (response.ok) {
            const data: StockAnalysisResponse = await response.json();
            const analysisMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: data.analysis,
              isUser: false,
              createdAt: new Date(),
            };
            setMessages((prev) => [...prev, analysisMessage]);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          await sendMessageToAssistant(userMessage);
        }
      } else if (messageType === "market") {
        const marketRequest: MarketAnalysisRequest = {
          indices: ["^GSPC", "^IXIC", "^DJI", "^KS11", "^KQ11"],
          lookback_days: 30,
          include_news: true,
        };

        const response = await fetch(`${BACKEND_URL}/market-analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(marketRequest),
        });

        if (response.ok) {
          const data: MarketAnalysisResponse = await response.json();
          const analysisMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.analysis,
            isUser: false,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, analysisMessage]);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        await sendMessageToAssistant(userMessage);
      }
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

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  const toggleSidebar = () => {
    Keyboard.dismiss();
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
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSidebarOpen(!isSidebarOpen);
    });
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

  const sendMessageToAssistant = async (userMessage: string) => {
    if (!threadId) {
      return;
    }

    try {
      // 메시지 생성
      const createdMessageResponse = await fetch(
        `${BACKEND_URL}/threads/${threadId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thread_id: threadId,
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
        `${BACKEND_URL}/threads/${threadId}/runs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thread_id: threadId,
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
        `${BACKEND_URL}/threads/${threadId}/runs/${run.id}`
      );
      let runStatusData = await runStatus.json();

      while (
        runStatusData.status === "in_progress" ||
        runStatusData.status === "queued"
      ) {
        await delay(1000);
        runStatus = await fetch(
          `${BACKEND_URL}/threads/${threadId}/runs/${run.id}`
        );
        runStatusData = await runStatus.json();
      }

      if (runStatusData.status === "failed") {
        throw new Error(`Run failed: ${runStatusData.last_error?.message}`);
      }

      // 메시지 목록 가져오기
      const messagesResponse = await fetch(
        `${BACKEND_URL}/threads/${threadId}/messages`
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
      }
    } catch (error) {
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
      setIsSidebarOpen(false);
      await loadThreadMessages(thread.id);
    } catch (error) {
      // 스레드 선택 중 오류 처리
    }
  };

  const handleDeleteThread = async (threadIdToDelete: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/threads/${threadIdToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.status}`);
      }

      const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
      await saveThreads(updatedThreads);

      if (threadId === threadIdToDelete) {
        setThreadId(null);
        setMessages([]);
        if (updatedThreads.length > 0) {
          const mostRecentThread = updatedThreads
            .filter((thread) => thread.last_message)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0];

          if (mostRecentThread) {
            setThreadId(mostRecentThread.id);
            await loadThreadMessages(mostRecentThread.id);
          } else {
            await createNewThread();
          }
        } else {
          await createNewThread();
        }
      }
    } catch (error) {
      // 스레드가 이미 삭제된 경우 로컬에서만 제거
      const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
      await saveThreads(updatedThreads);
    }
  };

  const updateThreadTitle = async (threadId: string, lastMessage: string) => {
    try {
      const newTitle = await generateThreadTitle(lastMessage);
      const updatedThreads = threads.map((thread) =>
        thread.id === threadId ? { ...thread, title: newTitle } : thread
      );
      await saveThreads(updatedThreads);
    } catch (error) {
      // 스레드 제목 업데이트 중 오류 처리
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
      await saveThreads(updatedThreads);
    } catch (error) {
      // 스레드 제목 업데이트 중 오류 처리
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
      const response = await fetch(`${BACKEND_URL}/threads/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.status}`);
      }

      const newThread = await response.json();
      const threadTitle = "새로운 대화";

      const newThreadData: Thread = {
        id: newThread.id,
        title: threadTitle,
        created_at: new Date(),
      };

      const updatedThreads = [newThreadData, ...threads];
      await saveThreads(updatedThreads);
      setThreadId(newThread.id);
      setMessages([]);
    } catch (error) {
      // 새 스레드 생성 중 오류 처리
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
      const response = await fetch(
        `${BACKEND_URL}/threads/${threadId}/messages`
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
      // 이전 메시지 로딩 중 오류 처리
    }
  };

  const generateThreadTitle = async (message: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/generate-title`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate title: ${response.status}`);
      }

      const data = await response.json();
      return data.title || "새로운 대화";
    } catch (error) {
      return "새로운 대화";
    }
  };

  // 마크다운 스타일 설정
  const markdownStyles = {
    body: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      marginVertical: 16,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    heading2: {
      fontSize: 20,
      fontFamily: "Inter_600SemiBold",
      marginVertical: 12,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    heading3: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
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
      fontFamily: "Inter_600SemiBold",
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
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
          <TouchableOpacity onPress={toggleSidebar} style={styles.headerButton}>
            <Ionicons name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerTitleButton}
          >
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Stock GPT
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="refresh" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
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
                          <Ionicons name="refresh" size={16} color="#FFFFFF" />
                          <Text style={styles.retryButtonText}>다시 시도</Text>
                        </TouchableOpacity>
                      )}
                    </>
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
                isTyping ? "응답을 기다리는 중..." : "질문을 입력하세요"
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
                size={16}
                color={
                  input.trim() && !isTyping ? "#FFFFFF" : colors.textSecondary
                }
                style={{
                  transform: [{ rotate: isTyping ? "0deg" : "-90deg" }],
                }}
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
              backgroundColor: colors.cardBackground,
              transform: [{ translateX: sidebarAnimation }],
            },
          ]}
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
                      onPress={() => handleDeleteThread(thread.id)}
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
        </Animated.View>
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
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
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
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  threadLastMessage: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Platform.OS === "ios" ? 12 : 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    height: Platform.OS === "ios" ? 56 : 64,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleButton: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
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
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_600SemiBold",
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
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.5,
  },
  inputContainer: {
    borderTopWidth: 1,
    padding: 16,
    width: "100%",
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
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
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 20,
    maxHeight: 120,
    lineHeight: 20,
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
});

export default ChatScreen;
