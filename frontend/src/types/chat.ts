export type MessageLink = {
  text: string;
  url: string;
};

export type Message = {
  text: string;
  isUser: boolean;
  id: string;
  createdAt: Date;
  links?: MessageLink[];
  error?: boolean;
  lastUserMessage?: string;
};

export type Thread = {
  id: string;
  title: string;
  created_at: Date;
  last_message?: string;
};

// 백엔드 응답 타입 정의
export interface StockAnalysisResponse {
  stock_info: any; // yfinance에서 반환하는 데이터 타입
  analysis: string;
}

export interface MarketAnalysisResponse {
  market_data: {
    [key: string]: {
      name?: string;
      current_price?: number;
      change_percent?: number;
      previous_close?: number;
      volume?: number;
      price_history?: number[];
      volume_history?: number[];
      error?: string;
      rate?: number;
      change?: number;
    };
  };
  analysis: string;
}

// 백엔드 요청 타입 정의
export interface StockAnalysisRequest {
  ticker: string;
}

export interface MarketAnalysisRequest {
  indices: string[];
  lookback_days?: number;
  include_news?: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
};
