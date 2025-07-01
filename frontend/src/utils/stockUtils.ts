import { StockRecommendation } from "../types/stock";

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
