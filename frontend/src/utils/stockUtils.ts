// 카테고리별 색상 매핑
export const getCategoryColor = (categoryId: string): string => {
  const colorMap: { [key: string]: string } = {
    semiconductor: "#2196F3",
    ai: "#4CAF50",
    bio_pharma: "#FF9800",
    energy: "#9C27B0",
    finance: "#FF5722",
    default: "#607D8B",
  };
  return colorMap[categoryId] || colorMap.default;
};

// 카테고리별 그라데이션 색상 매핑
export const getCategoryGradient = (
  categoryId: string
): readonly [string, string] => {
  const gradients: { [key: string]: readonly [string, string] } = {
    semiconductor: ["#1e3c72", "#2a5298"] as const, // 깊은 파란색 (반도체/기술)
    ai: ["#8360c3", "#2ebf91"] as const, // 보라-민트 (AI/미래)
    bio_pharma: ["#56ab2f", "#a8e6cf"] as const, // 그린 계열 (바이오/의료)
    energy: ["#ff6b6b", "#ffa726"] as const, // 빨강-오렌지 (에너지)
    finance: ["#1565c0", "#42a5f5"] as const, // 블루 계열 (금융)
    default: ["#667EEA", "#764BA2"] as const,
  };
  return gradients[categoryId] || gradients.default;
};

// 시가총액 포맷팅
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(1)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(1)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(1)}M`;
  }
  return `$${marketCap.toLocaleString()}`;
};

// 위험도별 색상 매핑
export const getRiskColor = (riskLevel: string): readonly [string, string] => {
  switch (riskLevel) {
    case "LOW":
      return ["#22C55E", "#16A34A"] as const;
    case "MEDIUM":
      return ["#F59E0B", "#D97706"] as const;
    case "HIGH":
      return ["#EF4444", "#DC2626"] as const;
    default:
      return ["#6B7280", "#4B5563"] as const;
  }
};

// 위험도 텍스트 변환
export const getRiskText = (riskLevel: string): string => {
  switch (riskLevel) {
    case "LOW":
      return "낮음";
    case "MEDIUM":
      return "보통";
    case "HIGH":
      return "높음";
    default:
      return "알 수 없음";
  }
};

// 상승여력 계산
export const calculatePotentialGain = (
  currentPrice: number,
  targetPrice: number
): number => {
  return ((targetPrice - currentPrice) / currentPrice) * 100;
};

// 변화율 색상 계산
export const getChangeColor = (
  isPositive: boolean,
  isDarkMode: boolean
): string => {
  if (isPositive) {
    return isDarkMode ? "#4ADE80" : "#16A34A";
  } else {
    return isDarkMode ? "#F87171" : "#DC2626";
  }
};

// 변화율 배경색 계산
export const getChangeBackgroundColor = (
  isPositive: boolean,
  isDarkMode: boolean
): string => {
  if (isPositive) {
    return isDarkMode ? "#1B4332" : "#DCFCE7";
  } else {
    return isDarkMode ? "#450A0A" : "#FEE2E2";
  }
};

// 추가 유틸리티 함수들

// 애널리스트 등급 텍스트 변환
export const getAnalystRatingText = (rating?: string): string => {
  switch (rating) {
    case "STRONG_BUY":
      return "적극 매수";
    case "BUY":
      return "매수";
    case "HOLD":
      return "보유";
    case "SELL":
      return "매도";
    case "STRONG_SELL":
      return "적극 매도";
    default:
      return "등급 없음";
  }
};

// 애널리스트 등급 색상
export const getAnalystRatingColor = (rating?: string): string => {
  switch (rating) {
    case "STRONG_BUY":
      return "#16A34A";
    case "BUY":
      return "#22C55E";
    case "HOLD":
      return "#F59E0B";
    case "SELL":
      return "#EF4444";
    case "STRONG_SELL":
      return "#DC2626";
    default:
      return "#6B7280";
  }
};

// 재무 지표 포맷팅
export const formatFinancialMetric = (
  value?: number | string,
  type: "percentage" | "ratio" | "currency" | "number" = "number"
): string => {
  if (value === undefined || value === null || value === "N/A") return "N/A";

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "N/A";

  switch (type) {
    case "percentage":
      return `${numValue.toFixed(1)}%`;
    case "ratio":
      return numValue.toFixed(2);
    case "currency":
      if (numValue >= 1e12) return `$${(numValue / 1e12).toFixed(1)}T`;
      if (numValue >= 1e9) return `$${(numValue / 1e9).toFixed(1)}B`;
      if (numValue >= 1e6) return `$${(numValue / 1e6).toFixed(1)}M`;
      return `$${numValue.toLocaleString()}`;
    case "number":
    default:
      if (numValue >= 1e9) return `${(numValue / 1e9).toFixed(1)}B`;
      if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(1)}M`;
      return numValue.toLocaleString();
  }
};

// 52주 위치에 따른 색상
export const getWeek52PositionColor = (position?: number): string => {
  if (!position) return "#6B7280";
  if (position >= 80) return "#16A34A"; // 높은 위치 - 녹색
  if (position >= 60) return "#22C55E"; // 중상 위치 - 연녹색
  if (position >= 40) return "#F59E0B"; // 중간 위치 - 주황색
  if (position >= 20) return "#EF4444"; // 중하 위치 - 빨간색
  return "#DC2626"; // 낮은 위치 - 진빨간색
};

// 목표가 대비 상승 여력 계산
export const calculateUpside = (
  currentPrice: number,
  targetPrice?: number
): number | null => {
  if (!targetPrice || targetPrice <= 0 || currentPrice <= 0) return null;
  return ((targetPrice - currentPrice) / currentPrice) * 100;
};

const API_BASE_URL = "http://localhost:8000";

export interface StockRecommendation {
  ticker: string;
  company_name: string;
  current_price: number;
  per_ratio?: number;
  peg_ratio?: number;
  pbr_ratio?: number;
  roe?: number;
  debt_to_equity?: number;
  profit_margin?: number;
  revenue_growth?: number;
  dividend_yield?: number;
  market_cap?: number;
  eps?: number;
  target_price?: number;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
  analyst_rating?: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  sector?: string;
  industry?: string;
  country?: string;
  week_52_low?: number | string;
  week_52_high?: number | string;
  week_52_position?: number;
  recommendation_reason: string;
  updated_at: string;
  key_metrics?: {
    revenue_growth_3y?: number;
    earnings_growth_3y?: number;
    dividend_growth_5y?: number;
    dividend_growth_10y?: number;
    payout_ratio?: number;
    fcf_yield?: number;
    free_cash_flow?: number;
    consecutive_years?: number;
    consecutive_dividend_years?: number;
    rd_expense_ratio?: number;
    gross_margin?: number;
    operating_margin?: number;
    ai_revenue_growth?: number;
    market_share_gpu?: number;
    beta?: number;
    global_presence?: number;
    competitive_advantages?: string[];
    growth_drivers?: string[];
    value_factors?: string[];
    dividend_stability?: string[];
    defensive_factors?: string[];
  };
}

export interface StockRecommendationResponse {
  category: string;
  recommendations: StockRecommendation[];
  updated_at: string;
}

export const fetchStockRecommendations = async (
  category: string
): Promise<StockRecommendationResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/stock-recommendations/${category}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("추천 종목 데이터 가져오기 실패:", error);
    throw error;
  }
};
