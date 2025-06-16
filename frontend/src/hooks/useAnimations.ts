import { useRef, useEffect, useState } from "react";
import { Animated, Dimensions } from "react-native";
import { THINKING_MESSAGES } from "../utils/chatUtils";

const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.75;

export const useAnimations = (colors: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState(0);

  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // 타이핑 애니메이션을 위한 Animated.Value 배열
  const typingDots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const [messageOpacity] = useState(new Animated.Value(1));
  const [colorAnimation] = useState(new Animated.Value(0));

  const thinkingAnimationRef = useRef<NodeJS.Timeout | null>(null);

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

  // 생각하는 애니메이션 시작 함수
  const startThinkingAnimation = (messageId: string, setMessages: any) => {
    if (thinkingAnimationRef.current) {
      clearInterval(thinkingAnimationRef.current);
    }

    // 초기 메시지 설정
    setMessages((prev: any) =>
      prev.map((msg: any) =>
        msg.id === messageId ? { ...msg, text: THINKING_MESSAGES[0] } : msg
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
          const nextIndex = (prev + 1) % THINKING_MESSAGES.length;
          setMessages((prevMessages: any) =>
            prevMessages.map((msg: any) =>
              msg.id === messageId
                ? { ...msg, text: THINKING_MESSAGES[nextIndex] }
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

  // 사이드바 토글 함수
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
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSidebarOpen(!isSidebarOpen);
    });
  };

  // 사이드바 닫기 함수
  const closeSidebar = () => {
    const overlayToValue = 0;
    Animated.parallel([
      Animated.spring(sidebarAnimation, {
        toValue: -SIDEBAR_WIDTH,
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
      setIsSidebarOpen(false);
    });
  };

  useEffect(() => {
    if (isTyping) {
      startTypingAnimation();
    } else {
      stopTypingAnimation();
    }
  }, [isTyping]);

  // cleanup effect
  useEffect(() => {
    return () => {
      if (thinkingAnimationRef.current) {
        clearInterval(thinkingAnimationRef.current);
      }
      stopColorAnimation();
    };
  }, []);

  return {
    isSidebarOpen,
    isTyping,
    setIsTyping,
    sidebarAnimation,
    overlayAnimation,
    typingDots,
    messageOpacity,
    interpolatedColor,
    SIDEBAR_WIDTH,
    startThinkingAnimation,
    stopThinkingAnimation,
    stopColorAnimation,
    toggleSidebar,
    closeSidebar,
  };
};
