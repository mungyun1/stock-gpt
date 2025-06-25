import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { mockStockCategories } from "../data/mockStockData";
import { StockRecommendation } from "../types/stock";
import { RootStackParamList } from "../types/navigation";
import { useThemeColors } from "../theme/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StockList"
>;
type RouteProp_ = RouteProp<RootStackParamList, "StockList">;

const StockListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const colors = useThemeColors();
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const { categoryId, categoryName } = route.params;

  // 카테고리 데이터 찾기
  const category = mockStockCategories.find((cat) => cat.id === categoryId);
  const stocks = category?.stocks || [];

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const getRiskColor = (riskLevel: string): readonly [string, string] => {
    switch (riskLevel) {
      case "LOW":
        return ["#22C55E", "#16A34A"] as const;
      case "MEDIUM":
        return ["#F59E0B", "#D97706"] as const;
      case "HIGH":
        return ["#EF4444", "#DC2626"] as const;
      default:
        return ["#6B7280", "#4B5563"] as const;
    }
  };

  const getRiskText = (riskLevel: string): string => {
    switch (riskLevel) {
      case "LOW":
        return "낮음";
      case "MEDIUM":
        return "보통";
      case "HIGH":
        return "높음";
      default:
        return "알 수 없음";
    }
  };

  const getCategoryGradient = (
    categoryId: string
  ): readonly [string, string] => {
    const gradients: { [key: string]: readonly [string, string] } = {
      tech: ["#6366F1", "#8B5CF6"] as const,
      finance: ["#06B6D4", "#0891B2"] as const,
      healthcare: ["#10B981", "#059669"] as const,
      energy: ["#F59E0B", "#D97706"] as const,
      consumer: ["#EC4899", "#BE185D"] as const,
      default: ["#6366F1", "#8B5CF6"] as const,
    };
    return gradients[categoryId] || gradients.default;
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

  const renderStockCard = (stock: StockRecommendation) => {
    const isExpanded = expandedStock === stock.id;
    const isPositive = stock.changePercent >= 0;
    const riskColors = getRiskColor(stock.riskLevel);

    return (
      <View
        key={stock.id}
        style={[styles.stockCard, isExpanded && styles.expandedCard]}
      >
        <LinearGradient
          colors={["#FFFFFF", "#FAFBFF"]}
          style={styles.stockCardGradient}
        >
          <TouchableOpacity
            style={styles.stockHeader}
            onPress={() => handleStockPress(stock)}
            activeOpacity={0.95}
          >
            <View style={styles.stockInfo}>
              <View style={styles.stockTitleRow}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <View
                  style={[styles.riskBadge, { backgroundColor: riskColors[0] }]}
                >
                  <Text style={styles.riskBadgeText}>
                    {getRiskText(stock.riskLevel)}
                  </Text>
                </View>
              </View>
              <Text style={styles.stockName}>{stock.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>
                  ${stock.currentPrice.toFixed(2)}
                </Text>
                <View
                  style={[
                    styles.changeContainer,
                    { backgroundColor: isPositive ? "#DCFCE7" : "#FEE2E2" },
                  ]}
                >
                  <Ionicons
                    name={isPositive ? "trending-up" : "trending-down"}
                    size={14}
                    color={isPositive ? "#16A34A" : "#DC2626"}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: isPositive ? "#16A34A" : "#DC2626" },
                    ]}
                  >
                    {isPositive ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {!isExpanded && (
            <View style={styles.quickStatsContainer}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>목표가</Text>
                <Text style={styles.quickStatValue}>
                  ${stock.targetPrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>상승여력</Text>
                <Text style={[styles.quickStatValue, styles.quickStatPositive]}>
                  +
                  {(
                    ((stock.targetPrice - stock.currentPrice) /
                      stock.currentPrice) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>PER</Text>
                <Text style={styles.quickStatValue}>
                  {stock.peRatio.toFixed(1)}
                </Text>
              </View>
            </View>
          )}

          {!isExpanded && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => handleStockPress(stock)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#F8FAFC", "#F1F5F9"]}
                style={styles.expandButtonGradient}
              >
                <Text style={styles.expandButtonText}>자세히 보기</Text>
                <Ionicons name="chevron-down" size={16} color="#6366F1" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.priceAnalysisSection}>
                <Text style={styles.sectionTitleExpanded}>가격 분석</Text>
                <View style={styles.priceAnalysis}>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>현재가</Text>
                    <Text style={styles.priceValue}>
                      ${stock.currentPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>목표가</Text>
                    <Text style={[styles.priceValue, styles.targetPrice]}>
                      ${stock.targetPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>상승여력</Text>
                    <Text style={[styles.priceValue, styles.potentialGain]}>
                      +
                      {(
                        ((stock.targetPrice - stock.currentPrice) /
                          stock.currentPrice) *
                        100
                      ).toFixed(1)}
                      %
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.metricsContainer}>
                <Text style={styles.sectionTitleExpanded}>핵심 지표</Text>
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
                      <Text style={styles.metricValue}>
                        {stock.peRatio.toFixed(1)}
                      </Text>
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
                    <LinearGradient
                      colors={riskColors}
                      style={styles.metricGradient}
                    >
                      <View style={styles.metricIconContainer}>
                        <Ionicons
                          name="shield-checkmark"
                          size={24}
                          color="#FFFFFF"
                        />
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
                <Text style={styles.sectionTitleExpanded}>기업 정보</Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <View style={styles.infoIconContainer}>
                      <Ionicons name="business" size={20} color="#6366F1" />
                    </View>
                    <Text style={styles.infoLabel}>섹터</Text>
                    <Text style={styles.infoValue}>{stock.sector}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={styles.infoIconContainer}>
                      <Ionicons name="layers" size={20} color="#6366F1" />
                    </View>
                    <Text style={styles.infoLabel}>산업</Text>
                    <Text style={styles.infoValue}>{stock.industry}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.recommendationContainer}>
                <LinearGradient
                  colors={["#F0F4FF", "#E0E7FF"]}
                  style={styles.recommendationGradient}
                >
                  <View style={styles.recommendationHeader}>
                    <View style={styles.aiIconContainer}>
                      <Ionicons name="sparkles" size={24} color="#6366F1" />
                    </View>
                    <Text style={styles.recommendationTitle}>
                      AI 분석 리포트
                    </Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {stock.recommendationReason}
                  </Text>
                  <View style={styles.confidenceLevel}>
                    <Text style={styles.confidenceLabel}>신뢰도</Text>
                    <View style={styles.confidenceBar}>
                      <View style={[styles.confidenceFill, { width: "85%" }]} />
                    </View>
                    <Text style={styles.confidencePercent}>85%</Text>
                  </View>
                </LinearGradient>
              </View>

              <TouchableOpacity
                style={styles.collapseButton}
                onPress={() => handleStockPress(stock)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#F8FAFC", "#F1F5F9"]}
                  style={styles.collapseButtonGradient}
                >
                  <Ionicons name="chevron-up" size={16} color="#64748B" />
                  <Text style={styles.collapseButtonText}>간단히 보기</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        >
          <View style={styles.stocksContainer}>
            <View style={styles.modernHeaderContainer}>
              <LinearGradient
                colors={getCategoryGradient(categoryId)}
                style={styles.modernHeaderGradient}
              >
                <View style={styles.headerContent}>
                  <View style={styles.headerMainSection}>
                    <View style={styles.iconWrapper}>
                      <Text style={styles.categoryHeaderIcon}>
                        {category?.icon}
                      </Text>
                    </View>

                    <View style={styles.headerTextSection}>
                      <Text style={styles.modernCategoryTitle}>
                        {categoryName}
                      </Text>
                      <Text style={styles.modernCategorySubtitle}>
                        {category?.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.headerStatsSection}>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="list"
                        size={16}
                        color="rgba(255,255,255,0.9)"
                      />
                      <Text style={styles.statText}>
                        {stocks.length}개 종목
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color="rgba(255,255,255,0.9)"
                      />
                      <Text style={styles.statText}>AI 추천</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.headerDecoration}>
                  <View style={styles.decorationCircle} />
                  <View style={styles.decorationCircle2} />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.stocksList}>{stocks.map(renderStockCard)}</View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// 스타일 정의는 기존과 동일하지만 필요한 부분만 포함
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  stocksContainer: {
    padding: 20,
  },
  modernHeaderContainer: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modernHeaderGradient: {
    padding: 24,
    position: "relative",
  },
  headerContent: {
    position: "relative",
    zIndex: 2,
  },
  headerMainSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryHeaderIcon: {
    fontSize: 28,
  },
  headerTextSection: {
    flex: 1,
  },
  modernCategoryTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  modernCategorySubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
  },
  headerStatsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
    marginLeft: 6,
  },
  headerDecoration: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  decorationCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: -30,
    right: -40,
  },
  decorationCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -20,
    right: 10,
  },
  stocksList: {
    flex: 1,
  },
  stockCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  stockCardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  expandedCard: {},
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
    color: "#1E293B",
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
    color: "#64748B",
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
    color: "#1E293B",
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
  quickStatsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 16,
  },
  quickStat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  quickStatValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  quickStatPositive: {
    color: "#059669",
  },
  expandButton: {
    borderRadius: 16,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  expandButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  expandButtonText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
    marginRight: 8,
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceAnalysisSection: {
    marginBottom: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
  },
  sectionTitleExpanded: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  priceAnalysis: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  priceItem: {
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  targetPrice: {
    color: "#6366F1",
  },
  potentialGain: {
    color: "#059669",
  },
  metricsContainer: {
    marginBottom: 24,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  metricGradient: {
    padding: 20,
    borderRadius: 16,
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
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    alignItems: "center",
  },
  infoIconContainer: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
    textAlign: "center",
  },
  recommendationContainer: {
    marginBottom: 24,
  },
  recommendationGradient: {
    borderRadius: 20,
    padding: 24,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aiIconContainer: {
    marginRight: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  recommendationText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  confidenceLevel: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E7FF",
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginRight: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E7FF",
    borderRadius: 4,
    marginRight: 12,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  confidencePercent: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "700",
  },
  collapseButton: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  collapseButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  collapseButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default StockListScreen;
