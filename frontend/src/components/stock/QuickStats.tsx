import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StockRecommendation } from "../../types/stock";
import { useThemeColors } from "../../theme/colors";
import { calculatePotentialGain } from "../../utils/stockUtils";

interface QuickStatsProps {
  stock: StockRecommendation;
}

const QuickStats: React.FC<QuickStatsProps> = ({ stock }) => {
  const colors = useThemeColors();
  const potentialGain = calculatePotentialGain(
    stock.currentPrice,
    stock.targetPrice
  );

  return (
    <View
      style={[styles.quickStatsContainer, { borderTopColor: colors.border }]}
    >
      <View style={styles.quickStat}>
        <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
          목표가
        </Text>
        <Text style={[styles.quickStatValue, { color: colors.textPrimary }]}>
          ${stock.targetPrice.toFixed(2)}
        </Text>
      </View>
      <View style={styles.quickStat}>
        <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
          상승여력
        </Text>
        <Text
          style={[
            styles.quickStatValue,
            { color: colors.isDarkMode ? "#4ADE80" : "#16A34A" },
          ]}
        >
          +{potentialGain.toFixed(1)}%
        </Text>
      </View>
      <View style={styles.quickStat}>
        <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
          PER
        </Text>
        <Text style={[styles.quickStatValue, { color: colors.textPrimary }]}>
          {stock.peRatio.toFixed(1)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  quickStat: {
    alignItems: "center",
    flex: 1,
  },
  quickStatLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default QuickStats;
