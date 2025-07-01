import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StockRecommendation } from "../../types/stock";
import { useThemeColors } from "../../theme/colors";
import {
  formatMarketCap,
  getRiskColor,
  getRiskText,
  calculatePotentialGain,
} from "../../utils/stockUtils";

interface StockExpandedContentProps {
  stock: StockRecommendation;
  onPress: (stock: StockRecommendation) => void;
}

const StockExpandedContent: React.FC<StockExpandedContentProps> = ({
  stock,
  onPress,
}) => {
  const colors = useThemeColors();
  const riskColors = getRiskColor(stock.riskLevel);
  const potentialGain = calculatePotentialGain(
    stock.currentPrice,
    stock.targetPrice
  );

  return (
    <View style={styles.expandedContent}>
      <View style={styles.priceAnalysisSection}>
        <Text
          style={[styles.sectionTitleExpanded, { color: colors.textPrimary }]}
        >
          가격 분석
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
              ${stock.currentPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              목표가
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: colors.isDarkMode ? "#60A5FA" : "#0EA5E9" },
              ]}
            >
              ${stock.targetPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              상승여력
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: colors.isDarkMode ? "#4ADE80" : "#16A34A" },
              ]}
            >
              +{potentialGain.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <Text
          style={[styles.sectionTitleExpanded, { color: colors.textPrimary }]}
        >
          핵심 지표
        </Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <LinearGradient
              colors={["#1E293B", "#334155"]}
              style={styles.metricGradient}
            >
              <View style={styles.metricIconContainer}>
                <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>시가총액</Text>
              <Text style={styles.metricValue}>
                {formatMarketCap(stock.marketCap)}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient
              colors={["#1D4ED8", "#2563EB"]}
              style={styles.metricGradient}
            >
              <View style={styles.metricIconContainer}>
                <Ionicons name="analytics" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>PER</Text>
              <Text style={styles.metricValue}>{stock.peRatio.toFixed(1)}</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient
              colors={["#059669", "#10B981"]}
              style={styles.metricGradient}
            >
              <View style={styles.metricIconContainer}>
                <Ionicons name="cash" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>배당수익률</Text>
              <Text style={styles.metricValue}>
                {stock.dividendYield.toFixed(2)}%
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient colors={riskColors} style={styles.metricGradient}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>위험도</Text>
              <Text style={styles.metricValue}>
                {getRiskText(stock.riskLevel)}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      <View style={styles.companyInfo}>
        <Text
          style={[styles.sectionTitleExpanded, { color: colors.textPrimary }]}
        >
          기업 정보
        </Text>
        <View style={styles.infoRow}>
          <View
            style={[
              styles.infoItem,
              { backgroundColor: colors.isDarkMode ? "#1B1E2B" : "#F8FAFC" },
            ]}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="business" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              섹터
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {stock.sector}
            </Text>
          </View>
          <View
            style={[
              styles.infoItem,
              { backgroundColor: colors.isDarkMode ? "#1B1E2B" : "#F8FAFC" },
            ]}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="layers" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              산업
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {stock.industry}
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
              AI 분석 리포트
            </Text>
          </View>
          <Text
            style={[styles.recommendationText, { color: colors.textSecondary }]}
          >
            {stock.recommendationReason}
          </Text>
          <View style={styles.confidenceLevel}>
            <Text
              style={[styles.confidenceLabel, { color: colors.textSecondary }]}
            >
              신뢰도
            </Text>
            <View
              style={[
                styles.confidenceBar,
                { backgroundColor: colors.isDarkMode ? "#2D3548" : "#E2E8F0" },
              ]}
            >
              <View
                style={[
                  styles.confidenceFill,
                  { width: "85%", backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.confidencePercent, { color: colors.primary }]}>
              85%
            </Text>
          </View>
        </LinearGradient>
      </View>

      <TouchableOpacity
        style={styles.collapseButton}
        onPress={() => onPress(stock)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            colors.isDarkMode ? ["#2D3548", "#252A3C"] : ["#F8FAFC", "#F1F5F9"]
          }
          style={styles.collapseButtonGradient}
        >
          <Ionicons name="chevron-up" size={16} color={colors.textSecondary} />
          <Text
            style={[styles.collapseButtonText, { color: colors.textSecondary }]}
          >
            간단히 보기
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  expandedContent: {
    marginTop: 20,
  },
  priceAnalysisSection: {
    marginBottom: 20,
  },
  sectionTitleExpanded: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  priceAnalysis: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  priceItem: {
    alignItems: "center",
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  metricGradient: {
    padding: 16,
    alignItems: "center",
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
  },
  companyInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  infoIconContainer: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    marginRight: 8,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  recommendationContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  recommendationGradient: {
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiIconContainer: {
    marginRight: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  confidenceLevel: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 12,
    marginRight: 12,
    fontWeight: "500",
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  confidencePercent: {
    fontSize: 12,
    fontWeight: "600",
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
    marginLeft: 8,
  },
});

export default StockExpandedContent;
