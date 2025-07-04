import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { StockCategory } from "../types/stock";
import {
  StockRecommendation,
  StockRecommendationResponse,
  fetchStockRecommendations,
} from "../utils/stockUtils";

export const useStockRecommendation = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<StockCategory | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // 카테고리 선택 시 추천 종목 데이터 가져오기
  useEffect(() => {
    if (selectedCategory) {
      fetchRecommendations(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchRecommendations = async (categoryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data: StockRecommendationResponse = await fetchStockRecommendations(
        categoryId
      );
      setRecommendations(data.recommendations);
      setUpdatedAt(data.updated_at || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 가져오는데 실패했습니다."
      );
      setUpdatedAt(null);
      console.error("추천 종목 데이터 가져오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: StockCategory) => {
    setSelectedCategory(category);
    setExpandedStock(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setExpandedStock(null);
    setRecommendations([]);
    setError(null);
    setUpdatedAt(null);
  };

  const handleStockPress = (stock: StockRecommendation) => {
    if (expandedStock === stock.ticker) {
      setExpandedStock(null);
    } else {
      setExpandedStock(stock.ticker);
    }
  };

  const handleRetry = () => {
    if (selectedCategory) {
      fetchRecommendations(selectedCategory.id);
    }
  };

  return {
    selectedCategory,
    expandedStock,
    recommendations,
    loading,
    error,
    updatedAt,
    handleCategorySelect,
    handleBackToCategories,
    handleStockPress,
    handleRetry,
  };
};
