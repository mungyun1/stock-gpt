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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { mockStockCategories } from "../data/mockStockData";
import { StockCategory, StockRecommendation } from "../types/stock";
import { useThemeColors } from "../theme/colors";
import CommonHeader from "../components/CommonHeader";

const StockCategoryScreen: React.FC = () => {
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] =
    useState<StockCategory | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const getCategoryColor = (categoryId: string): string => {
    const colorMap: { [key: string]: string } = {
      semiconductor: "#2196F3",
      ai: "#4CAF50",
      bio_pharma: "#FF9800",
      energy: "#9C27B0",
      finance: "#FF5722",
      default: "#607D8B",
    };
    return colorMap[categoryId] || colorMap.default;
  };

  const getCategoryGradient = (
    categoryId: string
  ): readonly [string, string] => {
    const gradients: { [key: string]: readonly [string, string] } = {
      semiconductor: ["#1e3c72", "#2a5298"] as const, // 깊은 파란색 (반도체/기술)
      ai: ["#8360c3", "#2ebf91"] as const, // 보라-민트 (AI/미래)
      bio_pharma: ["#56ab2f", "#a8e6cf"] as const, // 그린 계열 (바이오/의료)
      energy: ["#ff6b6b", "#ffa726"] as const, // 빨강-오렌지 (에너지)
      finance: ["#1565c0", "#42a5f5"] as const, // 블루 계열 (금융)
      default: ["#667EEA", "#764BA2"] as const,
    };
    return gradients[categoryId] || gradients.default;
  };

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

  const renderCategoryCard = (category: StockCategory) => {
    const iconColor = getCategoryColor(category.id);

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          { backgroundColor: colors.cardBackground },
        ]}
        onPress={() => handleCategorySelect(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryIconContainer}>
            <Text style={[styles.categoryIcon, { color: iconColor }]}>
              {category.icon}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.categoryName, { color: colors.textPrimary }]}>
              {category.name}
            </Text>
            <Text
              style={[
                styles.categoryDescription,
                { color: colors.textSecondary },
              ]}
            >
              {category.description || "맞춤 추천을 받아보세요"}
            </Text>
          </View>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={24}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
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

  const renderStockListView = () => {
    if (!selectedCategory) return null;

    const stocks = selectedCategory.stocks || [];

    return (
      <View style={styles.stocksContainer}>
        <View style={styles.modernHeaderContainer}>
          <LinearGradient
            colors={getCategoryGradient(selectedCategory.id)}
            style={styles.modernHeaderGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity
                  style={styles.backButtonContainer}
                  onPress={handleBackToCategories}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={22} color="white" />
                  <Text style={styles.backText}>뒤로가기</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.headerMainSection}>
                <View style={styles.iconWrapper}>
                  <Text style={styles.categoryHeaderIcon}>
                    {selectedCategory.icon}
                  </Text>
                </View>

                <View style={styles.headerTextSection}>
                  <Text style={styles.modernCategoryTitle}>
                    {selectedCategory.name}
                  </Text>
                  <Text style={styles.modernCategorySubtitle}>
                    {selectedCategory.description}
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
                  <Text style={styles.statText}>{stocks.length}개 종목</Text>
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
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="종목 추천" />
      <SafeAreaView
        style={[styles.content, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        >
          {!selectedCategory ? (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                투자 카테고리
              </Text>
              <View style={styles.sectionContent}>
                {mockStockCategories.map(renderCategoryCard)}
              </View>
            </View>
          ) : (
            renderStockListView()
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingHorizontal: 20,
    gap: 2,
  },
  categoryCard: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    lineHeight: 20,
  },
  // 주식 목록 관련 스타일
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
  headerTopRow: {
    marginBottom: 16,
    alignItems: "flex-start",
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    marginLeft: 10,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  quickStat: {
    alignItems: "center",
    flex: 1,
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  quickStatValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
  },
  quickStatPositive: {
    color: "#16A34A",
  },
  expandButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  expandButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
    marginRight: 8,
  },
  expandedContent: {
    marginTop: 20,
  },
  priceAnalysisSection: {
    marginBottom: 20,
  },
  sectionTitleExpanded: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  priceAnalysis: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
  },
  priceItem: {
    alignItems: "center",
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "700",
  },
  targetPrice: {
    color: "#0EA5E9",
  },
  potentialGain: {
    color: "#16A34A",
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
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  infoIconContainer: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 8,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 12,
    color: "#1E293B",
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
    color: "#1E293B",
  },
  recommendationText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 16,
  },
  confidenceLevel: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 12,
    fontWeight: "500",
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginRight: 12,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  confidencePercent: {
    fontSize: 12,
    color: "#6366F1",
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
    color: "#64748B",
    marginLeft: 8,
  },
});

export default StockCategoryScreen;
