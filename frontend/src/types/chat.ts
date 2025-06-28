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

// ChatScreen에서 사용하는 추가 타입들
export type RootTabParamList = {
  Chat: undefined;
  MarketNews: undefined;
  Calendar: undefined;
  StockList: undefined;
  Home: undefined;
};

export interface OpenAIMessage {
  id: string;
  role: "user" | "assistant";
  content: Array<{
    type: string;
    text: {
      value: string;
    };
  }>;
  created_at: number;
}

export interface OpenAIThread {
  id: string;
  created_at: number;
  metadata?: {
    title?: string;
    last_message?: string;
  };
}

export interface OpenAIRun {
  id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  last_error?: {
    message: string;
  };
}

export interface ChatState {
  messages: Message[];
  threads: Thread[];
  threadId: string | null;
  isLoading: boolean;
  isTyping: boolean;
  input: string;
}

export interface SidebarState {
  isOpen: boolean;
  editingThreadId: string | null;
  editingTitle: string;
}

export interface TypingAnimationProps {
  isVisible: boolean;
  accentColor: string;
}

export interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  colors: any;
  onRetry?: (messageId: string) => void;
}
