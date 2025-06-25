import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useThemeColors } from "../../theme/colors";
import { getEventTypeColor } from "../../utils/calendarUtils";
import type { CalendarEvent } from "../../types/calendar";

interface EventCardProps {
  event: CalendarEvent;
  onPress: (date: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => onPress(event.date)}
    >
      <View
        style={[
          styles.eventIndicator,
          { backgroundColor: getEventTypeColor(event.type) },
        ]}
      />
      <View style={styles.eventContent}>
        <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
          {format(parseISO(event.date), "M월 d일 (eee)", {
            locale: ko,
          })}
        </Text>
        <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
          {event.title}
        </Text>
        <Text
          style={[styles.eventDescription, { color: colors.textSecondary }]}
        >
          {event.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    fontFamily: "Pretendard-Regular",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    lineHeight: 20,
  },
});

export default EventCard;
