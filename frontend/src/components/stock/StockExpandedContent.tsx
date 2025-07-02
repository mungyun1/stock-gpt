import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StockRecommendation } from "../../utils/stockUtils";
import { useThemeColors } from "../../theme/colors";

interface StockExpandedContentProps {
  stock: StockRecommendation;
  onPress: (stock: StockRecommendation) => void;
}

const StockExpandedContent: React.FC<StockExpandedContentProps> = ({
  stock,
  onPress,
}) => {
  const colors = useThemeColors();

  return (
    <View style={styles.expandedContent}>
      <View style={styles.priceAnalysisSection}>
        <Text
          style={[styles.sectionTitleExpanded, { color: colors.textPrimary }]}
        >
          주식 정보
        </Text>
        <View
          style={[
            styles.priceAnalysis,
            { backgroundColor: colors.isDarkMode ? "#1B1E2B" : "#F8FAFC" },
          ]}
        >
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              현재가
            </Text>
            <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
              ${stock.current_price.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              티커
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: colors.isDarkMode ? "#60A5FA" : "#0EA5E9" },
              ]}
            >
              {stock.ticker}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              업데이트
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: colors.isDarkMode ? "#4ADE80" : "#16A34A" },
              ]}
            >
              {new Date(stock.updated_at).toLocaleDateString("ko-KR")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recommendationContainer}>
        <LinearGradient
          colors={
            colors.isDarkMode ? ["#1B1E2B", "#252A3C"] : ["#F0F4FF", "#E0E7FF"]
          }
          style={styles.recommendationGradient}
        >
          <View style={styles.recommendationHeader}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
            </View>
            <Text
              style={[
                styles.recommendationTitle,
                { color: colors.textPrimary },
              ]}
            >
              AI 추천 이유
            </Text>
          </View>
          <Text
            style={[styles.recommendationText, { color: colors.textSecondary }]}
          >
            {stock.recommendation_reason}
          </Text>
        </LinearGradient>
      </View>

      <TouchableOpacity
        style={styles.collapseButton}
        onPress={() => onPress(stock)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            colors.isDarkMode ? ["#2D3548", "#252A3C"] : ["#F8FAFC", "#F1F5F9"]
          }
          style={styles.collapseButtonGradient}
        >
          <Text
            style={[styles.collapseButtonText, { color: colors.textPrimary }]}
          >
            접기
          </Text>
          <Ionicons name="chevron-up" size={16} color={colors.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  expandedContent: {
    paddingTop: 20,
  },
  priceAnalysisSection: {
    marginBottom: 24,
  },
  sectionTitleExpanded: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  priceAnalysis: {
    borderRadius: 16,
    padding: 20,
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  recommendationContainer: {
    marginBottom: 24,
  },
  recommendationGradient: {
    borderRadius: 16,
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  collapseButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  collapseButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  collapseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default StockExpandedContent;
