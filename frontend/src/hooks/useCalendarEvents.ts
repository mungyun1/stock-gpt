import { useMemo } from "react";
import { parseISO, startOfMonth, endOfMonth } from "date-fns";
import { CALENDAR_EVENTS } from "../data/calendarEvents";
import type { CalendarEvent } from "../types/calendar";

export const useCalendarEvents = (currentMonth: Date) => {
  const filteredEvents = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    return CALENDAR_EVENTS.filter((event) => {
      const eventDate = parseISO(event.date);
      return eventDate >= start && eventDate <= end;
    }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [currentMonth]);

  return filteredEvents;
};
