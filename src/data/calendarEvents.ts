import { CalendarEvent } from "../types/calendar";

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // FOMC 회의 일정 (2025년)
  {
    date: "2025-01-29",
    title: "FOMC 회의",
    description: "1월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-03-19",
    title: "FOMC 회의",
    description: "3월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-05-07",
    title: "FOMC 회의",
    description: "5월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-06-18",
    title: "FOMC 회의",
    description: "6월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-07-30",
    title: "FOMC 회의",
    description: "7월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-09-17",
    title: "FOMC 회의",
    description: "9월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-11-10",
    title: "FOMC 회의",
    description: "11월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-12-29",
    title: "FOMC 회의",
    description: "12월 연방공개시장위원회(FOMC) 정례회의 및 기준금리 결정",
    type: "FOMC",
  },

  // 한국 금통위 회의 일정 (2025년)
  {
    date: "2025-01-16",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-02-25",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-04-17",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-05-29",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-07-10",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-08-28",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-10-23",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },
  {
    date: "2025-11-27",
    title: "한국 금통위",
    description: "한국은행 금융통화위원회 본회의 및 기준금리 결정",
    type: "FOMC",
  },

  // CPI (소비자물가지수) 발표 일정
  {
    date: "2025-01-14",
    title: "미국 CPI 발표",
    description: "2024년 12월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-02-13",
    title: "미국 CPI 발표",
    description: "2025년 1월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-03-13",
    title: "미국 CPI 발표",
    description: "2025년 2월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-04-11",
    title: "미국 CPI 발표",
    description: "2025년 3월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-05-13",
    title: "미국 CPI 발표",
    description: "2025년 4월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-06-12",
    title: "미국 CPI 발표",
    description: "2025년 5월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-07-11",
    title: "미국 CPI 발표",
    description: "2025년 6월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-08-13",
    title: "미국 CPI 발표",
    description: "2025년 7월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-09-12",
    title: "미국 CPI 발표",
    description: "2025년 8월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-10-14",
    title: "미국 CPI 발표",
    description: "2025년 9월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-11-13",
    title: "미국 CPI 발표",
    description: "2025년 10월 소비자물가지수(CPI) 발표",
    type: "economic",
  },
  {
    date: "2025-12-11",
    title: "미국 CPI 발표",
    description: "2025년 11월 소비자물가지수(CPI) 발표",
    type: "economic",
  },

  // GDP 발표 일정
  {
    date: "2025-01-30",
    title: "미국 GDP 발표",
    description: "2024년 4분기 GDP 속보치 발표",
    type: "economic",
  },
  {
    date: "2025-02-27",
    title: "미국 GDP 발표",
    description: "2024년 4분기 GDP 수정치 발표",
    type: "economic",
  },
  {
    date: "2025-03-27",
    title: "미국 GDP 발표",
    description: "2024년 4분기 GDP 확정치 발표",
    type: "economic",
  },
  {
    date: "2025-04-24",
    title: "미국 GDP 발표",
    description: "2025년 1분기 GDP 속보치 발표",
    type: "economic",
  },
  {
    date: "2025-05-29",
    title: "미국 GDP 발표",
    description: "2025년 1분기 GDP 수정치 발표",
    type: "economic",
  },
  {
    date: "2025-06-26",
    title: "미국 GDP 발표",
    description: "2025년 1분기 GDP 확정치 발표",
    type: "economic",
  },
  {
    date: "2025-07-24",
    title: "미국 GDP 발표",
    description: "2025년 2분기 GDP 속보치 발표",
    type: "economic",
  },
  {
    date: "2025-08-28",
    title: "미국 GDP 발표",
    description: "2025년 2분기 GDP 수정치 발표",
    type: "economic",
  },
  {
    date: "2025-09-25",
    title: "미국 GDP 발표",
    description: "2025년 2분기 GDP 확정치 발표",
    type: "economic",
  },
  {
    date: "2025-10-29",
    title: "미국 GDP 발표",
    description: "2025년 3분기 GDP 속보치 발표",
    type: "economic",
  },
  {
    date: "2025-11-26",
    title: "미국 GDP 발표",
    description: "2025년 3분기 GDP 수정치 발표",
    type: "economic",
  },
  {
    date: "2025-12-23",
    title: "미국 GDP 발표",
    description: "2025년 3분기 GDP 확정치 발표",
    type: "economic",
  },

  // 실업률 발표 일정
  {
    date: "2025-01-03",
    title: "미국 실업률 발표",
    description: "2024년 12월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-02-07",
    title: "미국 실업률 발표",
    description: "2025년 1월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-03-07",
    title: "미국 실업률 발표",
    description: "2025년 2월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-04-04",
    title: "미국 실업률 발표",
    description: "2025년 3월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-05-02",
    title: "미국 실업률 발표",
    description: "2025년 4월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-06-06",
    title: "미국 실업률 발표",
    description: "2025년 5월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-07-03",
    title: "미국 실업률 발표",
    description: "2025년 6월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-08-01",
    title: "미국 실업률 발표",
    description: "2025년 7월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-09-05",
    title: "미국 실업률 발표",
    description: "2025년 8월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-10-03",
    title: "미국 실업률 발표",
    description: "2025년 9월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-11-07",
    title: "미국 실업률 발표",
    description: "2025년 10월 실업률 발표",
    type: "economic",
  },
  {
    date: "2025-12-05",
    title: "미국 실업률 발표",
    description: "2025년 11월 실업률 발표",
    type: "economic",
  },
];
