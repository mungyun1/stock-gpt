import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeColors } from "../theme/colors";
import { RootTabParamList } from "../types/chat";
import { useChat } from "../hooks/useChat";
import { useThreads } from "../hooks/useThreads";
import { useSidebar } from "../hooks/useSidebar";
import { useTypingAnimation } from "../hooks/useTypingAnimation";

import {
  ChatHeader,
  MessageBubble,
  Sidebar,
  InputSection,
} from "../components/chat";

type NavigationProp = NativeStackNavigationProp<RootTabParamList>;

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();

  // 사이드바 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 커스텀 훅들
  const chat = useChat();
  const threads = useThreads();
  const sidebar = useSidebar();
  const typing = useTypingAnimation();

  // 스크롤 참조
  const scrollViewRef = useRef<ScrollView>(null);

  // React Navigation 제스처 비활성화
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        gestureEnabled: false,
        gestureDirection: "horizontal",
      });
    }, [navigation])
  );

  // 타이핑 애니메이션 효과
  useEffect(() => {
    if (chat.isTyping) {
      typing.startTypingAnimation();
    } else {
      typing.stopTypingAnimation();
    }
  }, [chat.isTyping, typing]);

  // 스레드 초기화
  useEffect(() => {
    const initializeThread = async () => {
      try {
        await threads.syncThreadsWithOpenAI();
      } catch (error) {
        console.error("스레드 초기화 중 오류:", error);
      }
    };

    initializeThread();
  }, []);

  // 스레드가 변경될 때 메시지 로드
  useEffect(() => {
    if (threads.threadId) {
      chat.loadThreadMessages(threads.threadId);
    } else {
      chat.clearMessages();
    }
  }, [threads.threadId]);

  // 사이드바 토글
  const handleToggleSidebar = useCallback(() => {
    sidebar.toggleSidebar(isSidebarOpen, (newState) => {
      setIsSidebarOpen(newState);

      // 사이드바를 열 때 스레드 목록 새로고침
      if (newState) {
        threads.syncThreadsWithOpenAI(true).catch((error) => {
          console.error("스레드 목록 새로고침 중 오류:", error);
        });
      }
    });
  }, [isSidebarOpen, sidebar, threads]);

  // 메시지 전송
  const handleSend = useCallback(async () => {
    if (!chat.input.trim() || chat.isLoading) return;

    let currentThreadId = threads.threadId;

    // 스레드가 없으면 새로 생성
    if (!currentThreadId) {
      const emptyNewThread = threads.threads.find(
        (thread) => thread.title === "새로운 대화" && !thread.last_message
      );

      if (emptyNewThread) {
        currentThreadId = emptyNewThread.id;
        threads.selectThread(emptyNewThread);
      } else {
        currentThreadId = await threads.createNewThread();
      }
    }

    if (!currentThreadId) return;

    const userMessage = chat.input.trim();

    await chat.sendMessage(
      userMessage,
      currentThreadId,
      (assistantMessage) => {
        // 성공 시 스레드 제목 업데이트
        const currentThread = threads.threads.find(
          (t) => t.id === currentThreadId
        );
        if (currentThread && currentThread.title === "새로운 대화") {
          threads.updateThreadTitle(currentThreadId, userMessage);
        } else {
          // 제목은 업데이트하지 않고 마지막 메시지만 업데이트
          threads.updateThreadTitle(currentThreadId, userMessage);
        }

        // thinking 애니메이션 중지
        typing.stopThinkingAnimation();
      },
      undefined, // onError
      (messageId) => {
        // thinking 애니메이션 시작
        typing.startThinkingAnimation(messageId, chat.updateMessage);
      },
      chat.updateMessage // onThinkingUpdate
    );
  }, [chat, threads, typing]);

  // 스레드 선택
  const handleThreadSelect = useCallback(
    async (thread: any) => {
      try {
        threads.selectThread(thread);

        // 사이드바 닫기
        setIsSidebarOpen(false);
        sidebar.closeSidebar();
      } catch (error) {
        console.error("스레드 선택 중 오류:", error);
      }
    },
    [threads, sidebar]
  );

  // 스레드 삭제
  const handleDeleteThread = useCallback(
    async (thread: any) => {
      const newThreadId = await threads.deleteThread(thread.id);

      // 삭제 후 사이드바 닫기
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        sidebar.closeSidebar();
      }
    },
    [threads, isSidebarOpen, sidebar]
  );

  // 새 스레드 생성
  const handleCreateNewThread = useCallback(async () => {
    try {
      // 사이드바가 열려있다면 닫기
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        sidebar.closeSidebar();
      }

      await threads.createNewThread();
    } catch (error) {
      console.error("새 스레드 생성 중 오류:", error);
    }
  }, [threads, isSidebarOpen, sidebar]);

  // 오버레이 터치
  const handleOverlayPress = useCallback(() => {
    setIsSidebarOpen(false);
    sidebar.closeSidebar();
  }, [sidebar]);

  // 메시지 재시도
  const handleRetry = useCallback(
    (messageId: string) => {
      if (threads.threadId) {
        chat.retryMessage(messageId, threads.threadId);
      }
    },
    [chat, threads.threadId]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Logo */}
      <Image
        source={require("../../assets/icon.png")}
        style={[styles.backgroundLogo, { tintColor: colors.primary }]}
        resizeMode="contain"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: "transparent" }]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <ChatHeader
          colors={colors}
          onToggleSidebar={handleToggleSidebar}
          onCreateNewThread={handleCreateNewThread}
        />

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
            {chat.messages.length === 0 ? (
              <View style={styles.welcomeContainer}></View>
            ) : (
              chat.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isUser={msg.isUser}
                  colors={colors}
                  onRetry={handleRetry}
                  typingDots={typing.typingDots}
                  messageOpacity={typing.messageOpacity}
                  interpolatedColor={typing.getInterpolatedColor(colors)}
                  thinkingMessages={typing.thinkingMessages}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Input Container */}
        <InputSection
          input={chat.input}
          isTyping={chat.isTyping}
          colors={colors}
          onInputChange={chat.setInput}
          onSend={handleSend}
        />

        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: sidebar.overlayAnimation,
              backgroundColor: "#000",
              pointerEvents: isSidebarOpen ? "auto" : "none",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={handleOverlayPress}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          threads={threads.threads}
          threadId={threads.threadId}
          editingThreadId={threads.editingThreadId}
          editingTitle={threads.editingTitle}
          colors={colors}
          sidebarAnimation={sidebar.sidebarAnimation}
          SIDEBAR_WIDTH={sidebar.SIDEBAR_WIDTH}
          onClose={() => {
            setIsSidebarOpen(false);
            sidebar.closeSidebar();
          }}
          onThreadSelect={handleThreadSelect}
          onCreateNewThread={handleCreateNewThread}
          onDeleteThread={handleDeleteThread}
          onStartEditingTitle={threads.startEditingTitle}
          onSaveThreadTitle={threads.saveThreadTitle}
          onCancelEditingTitle={threads.cancelEditingTitle}
          onEditingTitleChange={threads.setEditingTitle}
        />
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
});

export default ChatScreen;
