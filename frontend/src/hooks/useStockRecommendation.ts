import { useState } from "react";
import { Alert } from "react-native";
import { StockCategory, StockRecommendation } from "../types/stock";

export const useStockRecommendation = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<StockCategory | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const handleCategorySelect = (category: StockCategory) => {
    setSelectedCategory(category);
    setExpandedStock(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setExpandedStock(null);
  };

  const handleStockPress = (stock: StockRecommendation) => {
    if (expandedStock === stock.id) {
      setExpandedStock(null);
    } else {
      setExpandedStock(stock.id);
    }
  };

  const handleBuyPress = (stock: StockRecommendation) => {
    Alert.alert(
      "매수 확인",
      `${stock.name} (${stock.symbol}) 주식을 매수하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "매수",
          onPress: () =>
            Alert.alert("매수 완료", "주식 매수가 완료되었습니다."),
        },
      ]
    );
  };

  return {
    selectedCategory,
    expandedStock,
    handleCategorySelect,
    handleBackToCategories,
    handleStockPress,
    handleBuyPress,
  };
};
