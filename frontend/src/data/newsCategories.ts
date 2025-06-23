import { NewsCategory, NewsItem } from "../types/news";

export const newsCategories = [
  { id: "all", name: "전체" },
  { id: "semiconductor", name: "반도체" },
  { id: "ai", name: "AI" },
  { id: "defense", name: "방산" },
  { id: "bio_pharma", name: "바이오/제약" },
  { id: "electric_vehicle", name: "전기차" },
  { id: "renewable_energy", name: "신재생에너지" },
  { id: "fintech", name: "핀테크" },
] as const;

export const SAMPLE_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "삼성전자, 차세대 D램 개발 성공",
    summary:
      "삼성전자가 AI 데이터센터 수요에 대응하기 위한 고대역폭 메모리(HBM4) 개발에 성공했다고 발표...",
    source: "전자신문",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/200",
    category: "semiconductor",
    url: "https://www.etnews.com",
  },
  {
    id: "2",
    title: "네이버, 초거대 AI 'HyperCLOVA X' 상용화",
    summary:
      "네이버가 자체 개발한 초거대 AI 모델 'HyperCLOVA X'를 기업용 서비스로 본격 출시...",
    source: "조선비즈",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/201",
    category: "ai",
    url: "https://biz.chosun.com",
  },
  {
    id: "3",
    title: "한화시스템, 해외 방산 수주 1조원 돌파",
    summary:
      "한화시스템이 올해 해외 방산 수주액이 1조원을 넘어서며 역대 최고치를 기록...",
    source: "머니투데이",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/202",
    category: "defense",
    url: "https://www.mt.co.kr",
  },
  {
    id: "4",
    title: "셀트리온, 신약 임상 3상 성공",
    summary:
      "셀트리온이 개발 중인 항암 바이오시밀러의 임상 3상 시험에서 긍정적 결과를 확인...",
    source: "바이오스펙테이터",
    date: "2024-03-20",
    imageUrl: "https://picsum.photos/200/203",
    category: "bio_pharma",
    url: "https://www.biospectator.com",
  },
  {
    id: "5",
    title: "현대차, 전기차 전용 플랫폼 'E-GMP' 업그레이드",
    summary:
      "현대차그룹이 차세대 전기차 전용 플랫폼 개발을 통해 충전 속도와 주행거리를 크게 개선...",
    source: "오토타임즈",
    date: "2024-03-20",
    imageUrl: "https://picsum.photos/200/204",
    category: "electric_vehicle",
    url: "https://www.autotimes.co.kr",
  },
  {
    id: "6",
    title: "한화큐셀, 태양광 모듈 생산량 세계 1위 달성",
    summary:
      "한화큐셀이 2024년 태양광 모듈 생산량에서 세계 1위를 기록하며 신재생에너지 시장을 선도...",
    source: "에너지데일리",
    date: "2024-03-19",
    imageUrl: "https://picsum.photos/200/205",
    category: "renewable_energy",
    url: "https://www.energydaily.co.kr",
  },
  {
    id: "7",
    title: "토스, 해외 송금 서비스 일본 진출",
    summary:
      "비바리퍼블리카(토스)가 일본 시장 진출을 위한 해외 송금 서비스를 본격 출시...",
    source: "한국경제",
    date: "2024-03-19",
    imageUrl: "https://picsum.photos/200/206",
    category: "fintech",
    url: "https://www.hankyung.com",
  },
];
