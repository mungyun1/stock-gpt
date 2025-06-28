// 종목 분석 요청을 감지하는 패턴들
const STOCK_ANALYSIS_PATTERNS = [
  /([A-Z]{1,5})\s*(종목|주식|분석)/i,
  /([A-Z]{1,5})\s*(어때|어떻게)/i,
  /([가-힣]+)\s*(종목|주식|분석)/i,
  /([가-힣]+)\s*(어때|어떻게)/i,
  /(분석해줘|분석해주세요|분석)\s*([A-Z]{1,5}|[가-힣]+)/i,
  /([A-Z]{1,5}|[가-힣]+)\s*(투자|매수|매도)/i,
];

// 한국 주요 종목 코드 매핑
const KOREAN_STOCK_MAPPING: { [key: string]: string } = {
  삼성전자: "005930.KS",
  sk하이닉스: "000660.KS",
  네이버: "035420.KS",
  카카오: "035720.KS",
  lg화학: "051910.KS",
  현대차: "005380.KS",
  기아: "000270.KS",
  포스코홀딩스: "005490.KS",
  신한지주: "055550.KS",
  kb금융: "105560.KS",
  하나금융지주: "086790.KS",
  셀트리온: "068270.KS",
  lg전자: "066570.KS",
  현대모비스: "012330.KS",
  아모레퍼시픽: "090430.KS",
  naver: "035420.KS",
  kakao: "035720.KS",
};

/**
 * 메시지가 종목 분석 요청인지 확인
 */
export const isStockAnalysisRequest = (message: string): boolean => {
  return STOCK_ANALYSIS_PATTERNS.some((pattern) => pattern.test(message));
};

/**
 * 메시지에서 종목 코드를 추출
 */
export const extractStockTicker = (message: string): string | null => {
  // 먼저 영어 종목 코드 패턴 매칭 (AAPL, TSLA 등)
  const englishTickerMatch = message.match(/\b([A-Z]{1,5})\b/);
  if (englishTickerMatch) {
    return englishTickerMatch[1];
  }

  // 한국어 종목명 패턴 매칭
  for (const [koreanName, ticker] of Object.entries(KOREAN_STOCK_MAPPING)) {
    if (message.toLowerCase().includes(koreanName.toLowerCase())) {
      return ticker;
    }
  }

  return null;
};

/**
 * 백엔드에 종목 분석 요청
 */
export const requestStockAnalysis = async (
  ticker: string,
  threadId: string,
  assistantId: string
): Promise<any> => {
  try {
    const response = await fetch(
      "http://localhost:8001/analyze-stock-with-assistant",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker,
          thread_id: threadId,
          assistant_id: assistantId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("종목 분석 요청 중 오류:", error);
    throw error;
  }
};
