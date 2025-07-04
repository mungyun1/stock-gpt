import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StockRecommendation } from "../../utils/stockUtils";
import { useThemeColors } from "../../theme/colors";

interface QuickStatsProps {
  stock: StockRecommendation;
}

const QuickStats: React.FC<QuickStatsProps> = ({ stock }) => {
  const colors = useThemeColors();

  return (
    <View
      style={[styles.quickStatsContainer, { borderTopColor: colors.border }]}
    >
      <View style={styles.quickStat}>
        <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
          추천 이유
        </Text>
        <Text
          style={[
            styles.quickStatValue,
            { color: colors.isDarkMode ? "#4ADE80" : "#16A34A" },
          ]}
        >
          {stock.recommendation_reason.length > 20
            ? stock.recommendation_reason.substring(0, 20) + "..."
            : stock.recommendation_reason}
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
