import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";
import {
  format,
  addMonths,
  parseISO,
  startOfMonth,
  endOfMonth,
  getYear,
  getMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { CALENDAR_EVENTS } from "../data/calendarEvents";
import type { CalendarEvent } from "../types/calendar";

const getInitialMonth = () => {
  const now = new Date();
  const currentMonth = getMonth(now);
  // 2025년의 현재 월로 설정
  return new Date(2025, currentMonth, 1);
};

const CalendarScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());

  // 현재 월의 이벤트만 필터링
  const filteredEvents = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    return CALENDAR_EVENTS.filter((event) => {
      const eventDate = parseISO(event.date);
      return eventDate >= start && eventDate <= end;
    }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [currentMonth]);

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "FOMC":
        return "#FF6B6B";
      case "earnings":
        return "#4D96FF";
      case "economic":
        return "#6BCB77";
      default:
        return "#FFD93D";
    }
  };

  const canGoToPrevMonth = () => {
    const prevMonth = addMonths(currentMonth, -1);
    return getYear(prevMonth) === 2025;
  };

  const canGoToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    return getYear(nextMonth) === 2025;
  };

  const handlePrevMonth = () => {
    if (canGoToPrevMonth()) {
      setCurrentMonth((prevMonth) => addMonths(prevMonth, -1));
    }
  };

  const handleNextMonth = () => {
    if (canGoToNextMonth()) {
      setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          투자 일정
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Month Navigation */}
      <View
        style={[styles.monthNav, { backgroundColor: colors.cardBackground }]}
      >
        <TouchableOpacity
          style={[
            styles.monthButton,
            {
              backgroundColor: colors.background,
              opacity: canGoToPrevMonth() ? 1 : 0.5,
            },
          ]}
          onPress={handlePrevMonth}
          disabled={!canGoToPrevMonth()}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.textPrimary }]}>
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </Text>
        <TouchableOpacity
          style={[
            styles.monthButton,
            {
              backgroundColor: colors.background,
              opacity: canGoToNextMonth() ? 1 : 0.5,
            },
          ]}
          onPress={handleNextMonth}
          disabled={!canGoToNextMonth()}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Calendar Events */}
      <ScrollView style={styles.content}>
        {filteredEvents.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text
              style={[styles.noEventsText, { color: colors.textSecondary }]}
            >
              이번 달 등록된 일정이 없습니다.
            </Text>
          </View>
        ) : (
          filteredEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.eventCard,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => setSelectedDate(event.date)}
            >
              <View
                style={[
                  styles.eventIndicator,
                  { backgroundColor: getEventTypeColor(event.type) },
                ]}
              />
              <View style={styles.eventContent}>
                <Text
                  style={[styles.eventDate, { color: colors.textSecondary }]}
                >
                  {format(parseISO(event.date), "M월 d일 (eee)", {
                    locale: ko,
                  })}
                </Text>
                <Text
                  style={[styles.eventTitle, { color: colors.textPrimary }]}
                >
                  {event.title}
                </Text>
                <Text
                  style={[
                    styles.eventDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {event.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  monthText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  eventCard: {
    flexDirection: "row",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});

export default CalendarScreen;
