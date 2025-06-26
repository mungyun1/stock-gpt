import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addMonths, isSameMonth } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";
import { getInitialMonth } from "../utils/calendarUtils";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import {
  MonthNavigation,
  EventCard,
  EmptyEvents,
} from "../components/calendar";
import CommonHeader from "../components/CommonHeader";

const CalendarScreen = () => {
  const colors = useThemeColors();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(100)).current;
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filteredEvents = useCalendarEvents(currentMonth);
  const initialMonth = getInitialMonth();
  const isCurrentMonth = isSameMonth(currentMonth, initialMonth);

  // 컨텐츠가 변경될 때마다 버튼 표시 여부 체크
  useEffect(() => {
    // 약간의 지연을 두어 렌더링이 완료된 후 체크
    const timer = setTimeout(() => {
      if (!isCurrentMonth) {
        showButton();
      } else {
        hideButton();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredEvents, isCurrentMonth]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  const handleGoToCurrentMonth = () => {
    setCurrentMonth(getInitialMonth());
  };

  const handleEventPress = (date: string) => {
    setSelectedDate(date);
  };

  const showButton = () => {
    if (isButtonVisible || isAnimating) return;

    setIsAnimating(true);
    setIsButtonVisible(true);

    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  const hideButton = () => {
    if (!isButtonVisible || isAnimating) return;

    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsButtonVisible(false);
      setIsAnimating(false);
    });
  };

  const handleScroll = (event: any) => {
    // event와 nativeEvent가 유효한지 체크
    if (!event || !event.nativeEvent) {
      return;
    }

    // 디바운싱 전에 필요한 값들을 미리 추출
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    if (!contentOffset || !contentSize || !layoutMeasurement) {
      return;
    }

    const scrollPosition = contentOffset.y;
    const scrollViewHeight = layoutMeasurement.height;
    const contentHeight = contentSize.height;

    // 기존 타이머가 있다면 취소
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 새로운 타이머로 디바운싱 적용
    scrollTimeoutRef.current = setTimeout(() => {
      // 스크롤이 없는 경우 (콘텐츠가 화면보다 작음)
      const hasNoScroll = contentHeight <= scrollViewHeight;

      // 전체 스크롤 가능한 높이
      const maxScrollDistance = Math.max(0, contentHeight - scrollViewHeight);

      // 스크롤이 90%에 도달했는지 확인
      const scrollPercentage =
        maxScrollDistance > 0 ? scrollPosition / maxScrollDistance : 0;
      const isScrolled90Percent = scrollPercentage >= 0.9;

      // 현재 월이 아니고, 스크롤이 90%에 도달하지 않았을 때만 버튼 표시
      const shouldShowButton =
        !isCurrentMonth && (hasNoScroll || !isScrolled90Percent);

      if (shouldShowButton) {
        showButton();
      } else {
        hideButton();
      }
    }, 50); // 50ms 디바운싱
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="캘린더" />
      <SafeAreaView
        style={[styles.content, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <View style={styles.mainContent}>
          <MonthNavigation
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {filteredEvents.length === 0 ? (
              <EmptyEvents />
            ) : (
              filteredEvents.map((event, index) => (
                <EventCard
                  key={index}
                  event={event}
                  onPress={handleEventPress}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Floating 현재 월로 돌아가기 버튼 */}
        <Animated.View
          style={[
            styles.floatingButton,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
              backgroundColor: colors.accent,
            },
          ]}
          pointerEvents={isCurrentMonth ? "none" : "auto"}
        >
          <TouchableOpacity
            style={styles.floatingButtonTouchable}
            onPress={handleGoToCurrentMonth}
            activeOpacity={0.8}
          >
            <Ionicons name="today" size={16} color="#FFFFFF" />
            <Text style={styles.floatingButtonText}>현재 월로 돌아오기</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100, // floating 버튼을 위한 여백
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  floatingButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default CalendarScreen;
