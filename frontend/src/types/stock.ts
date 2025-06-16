export interface StockRecommendation {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  recommendationReason: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  targetPrice: number;
  sector: string;
  industry: string;
}

export interface StockCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  stocks: StockRecommendation[];
}

export interface StockRecommendationScreenProps {
  navigation: any;
}
