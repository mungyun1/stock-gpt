import React from "react";
import { View, StyleSheet } from "react-native";
import { StockCategory, StockRecommendation } from "../../types/stock";
import CategoryHeader from "./CategoryHeader";
import StockCard from "./StockCard";

interface StockListProps {
  category: StockCategory;
  expandedStock: string | null;
  onBackPress: () => void;
  onStockPress: (stock: StockRecommendation) => void;
}

const StockList: React.FC<StockListProps> = ({
  category,
  expandedStock,
  onBackPress,
  onStockPress,
}) => {
  const stocks = category.stocks || [];

  return (
    <View style={styles.stocksContainer}>
      <CategoryHeader
        category={category}
        stockCount={stocks.length}
        onBackPress={onBackPress}
      />

      <View style={styles.stocksList}>
        {stocks.map((stock) => (
          <StockCard
            key={stock.id}
            stock={stock}
            isExpanded={expandedStock === stock.id}
            onPress={onStockPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stocksContainer: {
    padding: 20,
  },
  stocksList: {
    flex: 1,
  },
});

export default StockList;
