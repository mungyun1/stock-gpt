export type NewsCategory =
  | "semiconductor"
  | "ai"
  | "defense"
  | "bio_pharma"
  | "electric_vehicle"
  | "renewable_energy"
  | "fintech";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl: string;
  category: NewsCategory;
  url: string;
};
