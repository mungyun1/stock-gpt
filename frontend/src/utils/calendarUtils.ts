import { addMonths, getYear, getMonth } from "date-fns";

export const getInitialMonth = () => {
  const now = new Date();
  const currentMonth = getMonth(now);
  // 2025년의 현재 월로 설정
  return new Date(2025, currentMonth, 1);
};

export const canGoToPrevMonth = (currentMonth: Date) => {
  const prevMonth = addMonths(currentMonth, -1);
  return getYear(prevMonth) === 2025;
};

export const canGoToNextMonth = (currentMonth: Date) => {
  const nextMonth = addMonths(currentMonth, 1);
  return getYear(nextMonth) === 2025;
};

export const getEventTypeColor = (type: string) => {
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
