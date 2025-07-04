import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockRecommendation } from "../../utils/stockUtils";
import { useThemeColors } from "../../theme/colors";
import {
  getRiskColor,
  getRiskText,
  getChangeColor,
  getChangeBackgroundColor,
  getAnalystRatingText,
  getAnalystRatingColor,
  formatFinancialMetric,
  calculateUpside,
} from "../../utils/stockUtils";

interface StockCardHeaderProps {
  stock: StockRecommendation;
  onPress: (stock: StockRecommendation) => void;
}

const StockCardHeader: React.FC<StockCardHeaderProps> = ({
  stock,
  onPress,
}) => {
  const colors = useThemeColors();

  // 실제 데이터 기반으로 계산
  const upside = calculateUpside(stock.current_price, stock.target_price);
  const isPositive = upside ? upside > 0 : true; // 상승여력이 있으면 긍정적
  const riskColors = getRiskColor(stock.risk_level || "MEDIUM");
  const analystRating = getAnalystRatingText(stock.analyst_rating);
  const ratingColor = getAnalystRatingColor(stock.analyst_rating);

  return (
    <TouchableOpacity
      style={styles.stockHeader}
      onPress={() => onPress(stock)}
      activeOpacity={0.95}
    >
      <View style={styles.stockInfo}>
        <View style={styles.stockTitleRow}>
          <Text style={[styles.stockSymbol, { color: colors.textPrimary }]}>
            {stock.ticker}
          </Text>
          <View style={[styles.riskBadge, { backgroundColor: riskColors[0] }]}>
            <Text style={styles.riskBadgeText}>
              {getRiskText(stock.risk_level || "MEDIUM")}
            </Text>
          </View>
        </View>

        <Text style={[styles.stockName, { color: colors.textSecondary }]}>
          {stock.company_name}
        </Text>

        {/* 부가 정보 */}
        <View style={styles.metaInfoRow}>
          <Text style={[styles.metaInfo, { color: colors.textSecondary }]}>
            {stock.sector || "N/A"} • PER{" "}
            {formatFinancialMetric(stock.per_ratio, "ratio")}
          </Text>
          {stock.analyst_rating && (
            <View
              style={[
                styles.ratingBadge,
                { backgroundColor: ratingColor + "20" },
              ]}
            >
              <Text style={[styles.ratingText, { color: ratingColor }]}>
                {analystRating}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={[styles.currentPrice, { color: colors.textPrimary }]}>
              ${stock.current_price.toFixed(2)}
            </Text>
            {stock.target_price && (
              <Text
                style={[styles.targetPrice, { color: colors.textSecondary }]}
              >
                목표: ${stock.target_price.toFixed(2)}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.changeContainer,
              {
                backgroundColor: getChangeBackgroundColor(
                  isPositive,
                  colors.isDarkMode
                ),
              },
            ]}
          >
            <Ionicons
              name={upside && upside > 0 ? "trending-up" : "trending-down"}
              size={14}
              color={getChangeColor(isPositive, colors.isDarkMode)}
            />
            <Text
              style={[
                styles.changeText,
                { color: getChangeColor(isPositive, colors.isDarkMode) },
              ]}
            >
              {upside ? `${upside.toFixed(1)}%` : "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 20,
  },
  stockInfo: {
    flex: 1,
    marginRight: 16,
  },
  stockTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stockSymbol: {
    fontSize: 22,
    fontWeight: "800",
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  stockName: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: "800",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  metaInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaInfo: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Pretendard-SemiBold",
  },
  priceContainer: {
    flex: 1,
  },
  targetPrice: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
    marginTop: 2,
  },
});

export default StockCardHeader;
