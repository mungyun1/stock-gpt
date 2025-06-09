export type CalendarEvent = {
  date: string;
  title: string;
  description: string;
  type: "FOMC" | "earnings" | "economic" | "other";
};
