import { useRef, useEffect, useState, useCallback } from "react";
import { Animated } from "react-native";

export const useTypingAnimation = () => {
  // 타이핑 애니메이션을 위한 Animated.Value 배열
  const typingDots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // 생각하는 메시지 관련
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

  // 타이핑 점 애니메이션 함수
  const startTypingAnimation = useCallback(() => {
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
  }, [typingDots]);

  // 타이핑 점 애니메이션 중지 함수
  const stopTypingAnimation = useCallback(() => {
    typingDots.forEach((dot) => {
      dot.stopAnimation();
      dot.setValue(0);
    });
  }, [typingDots]);

  // 색상 애니메이션 시작
  const startColorAnimation = useCallback(() => {
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
  }, [colorAnimation]);

  // 색상 애니메이션 정지
  const stopColorAnimation = useCallback(() => {
    colorAnimation.stopAnimation();
    colorAnimation.setValue(0);
  }, [colorAnimation]);

  // 생각하는 애니메이션 시작 함수
  const startThinkingAnimation = useCallback(
    (
      messageId: string,
      onUpdateMessage?: (id: string, text: string) => void
    ) => {
      if (thinkingAnimationRef.current) {
        clearInterval(thinkingAnimationRef.current);
      }

      // 초기 메시지 설정
      onUpdateMessage?.(messageId, thinkingMessages[0]);

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
            onUpdateMessage?.(messageId, thinkingMessages[nextIndex]);
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
    },
    [thinkingMessages, startColorAnimation, messageOpacity]
  );

  // 생각하는 애니메이션 정지
  const stopThinkingAnimation = useCallback(() => {
    if (thinkingAnimationRef.current) {
      clearInterval(thinkingAnimationRef.current);
      thinkingAnimationRef.current = null;
    }
    stopColorAnimation();
  }, [stopColorAnimation]);

  // 색상 보간 함수 생성
  const getInterpolatedColor = useCallback(
    (colors: any) => {
      return colorAnimation.interpolate({
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
    },
    [colorAnimation]
  );

  // cleanup effect
  useEffect(() => {
    return () => {
      if (thinkingAnimationRef.current) {
        clearInterval(thinkingAnimationRef.current);
      }
      stopColorAnimation();
    };
  }, [stopColorAnimation]);

  return {
    typingDots,
    messageOpacity,
    thinkingMessages,
    currentThinkingMessage,
    startTypingAnimation,
    stopTypingAnimation,
    startThinkingAnimation,
    stopThinkingAnimation,
    getInterpolatedColor,
  };
};
