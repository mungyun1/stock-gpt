// 종목 분석 요청을 감지하는 패턴들
const STOCK_ANALYSIS_PATTERNS = [
  /([A-Z]{1,5})\s*(종목|주식|분석|어때|어떻게|투자|매수|매도)/i,
  /([가-힣]+)\s*(종목|주식|분석|어때|어떻게|투자|매수|매도)/i,
  /(분석해줘|분석해주세요|분석|어때)\s*([A-Z]{1,5}|[가-힣]+)/i,
  /([A-Z]{1,5}|[가-힣]+)\s*(분석해줘|분석해주세요)/i,
  /\b([A-Z]{2,5})\b/i, // 단순히 티커만 있어도 주식으로 간주
  /(주식|종목|투자|분석)/i, // 주식 관련 키워드가 있으면 주식으로 간주
];

// 한국 주요 종목 코드 매핑 + 미국 주식
const KOREAN_STOCK_MAPPING: { [key: string]: string } = {
  // 한국 주식
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

  // 미국 주식 (한국어 이름)
  애플: "AAPL",
  테슬라: "TSLA",
  마이크로소프트: "MSFT",
  구글: "GOOGL",
  아마존: "AMZN",
  메타: "META",
  엔비디아: "NVDA",
  넷플릭스: "NFLX",

  // 영어 이름도 추가
  apple: "AAPL",
  tesla: "TSLA",
  microsoft: "MSFT",
  google: "GOOGL",
  amazon: "AMZN",
  meta: "META",
  nvidia: "NVDA",
  netflix: "NFLX",
};

/**
 * 메시지가 종목 분석 요청인지 확인
 */
export const isStockAnalysisRequest = (message: string): boolean => {
  const result = STOCK_ANALYSIS_PATTERNS.some((pattern) =>
    pattern.test(message)
  );
  console.log(`🔍 주식 감지: "${message}" → ${result}`);
  return result;
};

/**
 * 메시지에서 종목 코드를 추출
 */
export const extractStockTicker = (message: string): string | null => {
  console.log(`🔍 티커 추출 시작: "${message}"`);

  // 먼저 영어 종목 코드 패턴 매칭 (AAPL, TSLA 등)
  const englishTickerMatch = message.match(/\b([A-Z]{1,5})\b/);
  if (englishTickerMatch) {
    console.log(`✅ 영어 티커 발견: ${englishTickerMatch[1]}`);
    return englishTickerMatch[1];
  }

  // 한국어/영어 종목명 패턴 매칭
  const lowerMessage = message.toLowerCase();
  for (const [stockName, ticker] of Object.entries(KOREAN_STOCK_MAPPING)) {
    if (lowerMessage.includes(stockName.toLowerCase())) {
      console.log(`✅ 종목명 매칭: "${stockName}" → ${ticker}`);
      return ticker;
    }
  }

  console.log(`❌ 티커를 찾을 수 없음: "${message}"`);
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
      "http://localhost:8000/analyze-stock-with-assistant",
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
