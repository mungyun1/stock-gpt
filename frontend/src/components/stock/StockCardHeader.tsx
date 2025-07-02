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

  // API 데이터에는 변화율 정보가 없으므로 기본값 사용
  const isPositive = true; // 추천 종목이므로 긍정적으로 표시
  const riskColors = getRiskColor("MEDIUM"); // 기본 위험도

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
            <Text style={styles.riskBadgeText}>추천</Text>
          </View>
        </View>
        <Text style={[styles.stockName, { color: colors.textSecondary }]}>
          {stock.company_name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.currentPrice, { color: colors.textPrimary }]}>
            ${stock.current_price.toFixed(2)}
          </Text>
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
              name="trending-up"
              size={14}
              color={getChangeColor(isPositive, colors.isDarkMode)}
            />
            <Text
              style={[
                styles.changeText,
                { color: getChangeColor(isPositive, colors.isDarkMode) },
              ]}
            >
              추천
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
});

export default StockCardHeader;
