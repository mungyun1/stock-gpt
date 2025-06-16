import { NewsCategory, NewsItem } from "../types/news";

export const newsCategories = [
  { id: "all", name: "전체" },
  { id: "us_market", name: "미국 증시" },
  { id: "us_tech", name: "미국 기술주" },
  { id: "kr_kospi", name: "코스피" },
  { id: "kr_kosdaq", name: "코스닥" },
  { id: "crypto_bitcoin", name: "비트코인" },
  { id: "crypto_altcoin", name: "알트코인" },
] as const;

export const SAMPLE_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "연준, 물가 안정시까지 금리 동결 유지 시사",
    summary:
      "파월 의장은 최근 물가 상승세가 여전히 목표치를 상회하고 있어 금리 인하는 시기상조라고 언급...",
    source: "WSJ",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/200",
    category: "us_market",
    url: "https://www.wsj.com",
  },
  {
    id: "2",
    title: "삼성전자, 1분기 실적 예상치 상회",
    summary:
      "AI 수요 증가로 인한 메모리 반도체 가격 상승이 실적 개선을 견인...",
    source: "연합뉴스",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/201",
    category: "kr_kospi",
    url: "https://www.yna.co.kr",
  },
  {
    id: "3",
    title: "비트코인, 7만달러 돌파",
    summary: "현물 ETF 순매수세와 반감기 앞둔 수급 기대감으로 상승세 지속...",
    source: "CoinDesk",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/202",
    category: "crypto_bitcoin",
    url: "https://www.coindesk.com",
  },
];
