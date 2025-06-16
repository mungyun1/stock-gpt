import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addMonths } from "date-fns";
import { useThemeColors } from "../theme/colors";
import { getInitialMonth } from "../utils/calendarUtils";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import {
  CalendarHeader,
  MonthNavigation,
  EventCard,
  EmptyEvents,
} from "../components/calendar";

const CalendarScreen = () => {
  const colors = useThemeColors();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());

  const filteredEvents = useCalendarEvents(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  const handleEventPress = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <CalendarHeader title="투자 일정" />

      <MonthNavigation
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <ScrollView style={styles.content}>
        {filteredEvents.length === 0 ? (
          <EmptyEvents />
        ) : (
          filteredEvents.map((event, index) => (
            <EventCard key={index} event={event} onPress={handleEventPress} />
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
  content: {
    flex: 1,
    padding: 20,
  },
});

export default CalendarScreen;
