import OpenAI from "openai";

// 주식 티커 심볼 패턴 (예: AAPL, MSFT, 005930.KS)
export const STOCK_TICKER_PATTERN = /\b[A-Z]{1,5}(\.[A-Z]{2})?\b/;

// 시장 분석 관련 키워드
export const MARKET_KEYWORDS = [
  "시장",
  "마켓",
  "market",
  "금리",
  "환율",
  "interest",
  "rate",
  "S&P",
  "SP500",
  "나스닥",
  "NASDAQ",
  "코스피",
  "KOSPI",
  "코스닥",
  "KOSDAQ",
  "증시",
  "지수",
  "index",
  "글로벌",
  "global",
];

// 입력 메시지 분석
export const analyzeUserInput = (
  message: string
): "stock" | "market" | "general" => {
  // 대소문자 구분 없이 검색하기 위해 소문자로 변환
  const lowerMessage = message.toLowerCase();

  // 티커 심볼이 있는지 확인
  const hasStockTicker = STOCK_TICKER_PATTERN.test(message);

  // 시장 분석 키워드가 있는지 확인
  const hasMarketKeyword = MARKET_KEYWORDS.some((keyword) =>
    lowerMessage.includes(keyword.toLowerCase())
  );

  if (hasStockTicker) return "stock";
  if (hasMarketKeyword) return "market";
  return "general";
};

// 지연 함수
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 스레드 제목 생성
export const generateThreadTitle = async (
  message: string,
  openai: OpenAI
): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "주어진 메시지를 기반으로 15자 이내의 간단한 대화 제목을 생성해주세요. 제목은 한국어로 작성하고, 메시지의 핵심 주제나 질문을 잘 반영해야 합니다.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const title =
      completion.choices[0]?.message?.content?.trim() || "새로운 대화";
    return title;
  } catch (error) {
    console.error("제목 생성 중 오류:", error);
    return "새로운 대화";
  }
};

// 생각하는 메시지 배열
export const THINKING_MESSAGES = [
  "답변을 생각하고 있어요...",
  "정보를 분석하고 있어요...",
  "최적의 답변을 준비중이에요...",
  "조금만 기다려주세요...",
  "거의 다 왔어요...",
];
