import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { StockCategory } from "../../types/stock";
import { StockRecommendation } from "../../utils/stockUtils";
import { useThemeColors } from "../../theme/colors";
import CategoryHeader from "./CategoryHeader";
import StockCard from "./StockCard";
import { Ionicons } from "@expo/vector-icons";
import ErrorView from "./ErrorView";

interface StockListProps {
  category: StockCategory;
  recommendations: StockRecommendation[];
  expandedStock: string | null;
  loading: boolean;
  error: string | null;
  onBackPress: () => void;
  onStockPress: (stock: StockRecommendation) => void;
  updatedAt?: string;
  onRetry?: () => void;
}

const StockList: React.FC<StockListProps> = ({
  category,
  recommendations,
  expandedStock,
  loading,
  error,
  onBackPress,
  onStockPress,
  updatedAt,
  onRetry,
}) => {
  const colors = useThemeColors();

  return (
    <View style={styles.stocksContainer}>
      <CategoryHeader
        category={category}
        stockCount={recommendations.length}
        onBackPress={onBackPress}
      />
      {loading ? (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            추천 종목을 분석하고 있습니다...
          </Text>
        </View>
      ) : error ? (
        <ErrorView
          error={error}
          onRetry={onRetry || (() => {})}
          onBack={onBackPress}
        />
      ) : (
        <>
          {updatedAt && (
            <View
              style={[
                styles.updateNotice,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Ionicons
                name="calendar"
                size={16}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.updateText, { color: colors.primary }]}>
                {" "}
                <Text style={{ fontWeight: "bold" }}>업데이트</Text>:{" "}
                {updatedAt}
              </Text>
            </View>
          )}
          <View style={styles.stocksList}>
            {recommendations.map((stock) => (
              <StockCard
                key={stock.ticker}
                stock={stock}
                isExpanded={expandedStock === stock.ticker}
                onPress={onStockPress}
              />
            ))}
          </View>
        </>
      )}
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
  updateNotice: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  updateText: {
    fontSize: 14,
    fontFamily: "Pretendard-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },
});

export default StockList;
