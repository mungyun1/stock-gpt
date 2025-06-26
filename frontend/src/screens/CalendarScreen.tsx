import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { addMonths } from "date-fns";
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
  const navigation = useNavigation();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="캘린더" />
      <SafeAreaView
        style={[styles.content, { backgroundColor: colors.background }]}
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.mainContent}>
          <View style={styles.navigationWrapper}>
            <MonthNavigation
              currentMonth={currentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
  navigationWrapper: {
    paddingBottom: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
});

export default CalendarScreen;
