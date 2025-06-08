import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";

type CalendarEvent = {
  date: string;
  title: string;
  description: string;
  type: "FOMC" | "earnings" | "economic" | "other";
};

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    date: "2024-03-20",
    title: "FOMC 회의",
    description: "연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2024-03-28",
    title: "미국 GDP 발표",
    description: "2024년 1분기 미국 GDP 예비치 발표",
    type: "economic",
  },
  {
    date: "2024-04-10",
    title: "미국 CPI 발표",
    description: "3월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
];

const CalendarScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          투자 일정
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Calendar Events */}
      <ScrollView style={styles.content}>
        {SAMPLE_EVENTS.map((event, index) => (
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
              <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                {event.date}
              </Text>
              <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
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
        ))}
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
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    flex: 1,
    padding: 20,
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
