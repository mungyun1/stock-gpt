export type NewsCategory =
  | "all"
  | "us_market"
  | "us_tech"
  | "kr_kospi"
  | "kr_kosdaq"
  | "crypto_bitcoin"
  | "crypto_altcoin";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  imageUrl: string;
  category: NewsCategory;
  url: string;
};
