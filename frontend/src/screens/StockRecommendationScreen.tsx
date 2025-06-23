import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { mockStockCategories } from "../data/mockStockData";
import { StockCategory, StockRecommendation } from "../types/stock";
import { RootStackParamList } from "../types/navigation";
import { useThemeColors } from "../theme/colors";
import AppHeader from "../components/AppHeader";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StockRecommendation"
>;

const StockRecommendationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] =
    useState<StockCategory | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

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
        return ["#4CAF50", "#66BB6A"] as const;
      case "MEDIUM":
        return ["#FF9800", "#FFB74D"] as const;
      case "HIGH":
        return ["#F44336", "#EF5350"] as const;
      default:
        return ["#757575", "#9E9E9E"] as const;
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
      tech: ["#667eea", "#764ba2"] as const,
      finance: ["#f093fb", "#f5576c"] as const,
      healthcare: ["#4facfe", "#00f2fe"] as const,
      energy: ["#fa709a", "#fee140"] as const,
      consumer: ["#a8edea", "#fed6e3"] as const,
      default: ["#667eea", "#764ba2"] as const,
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
      <TouchableOpacity
        key={stock.id}
        style={[styles.stockCard, isExpanded && styles.expandedCard]}
        onPress={() => handleStockPress(stock)}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={["#ffffff", "#f8f9ff"]}
          style={styles.stockCardGradient}
        >
          <View style={styles.stockHeader}>
            <View style={styles.stockInfo}>
              <View style={styles.stockTitleRow}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              </View>
              <Text style={styles.stockName}>{stock.name}</Text>
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.currentPrice}>
                ${stock.currentPrice.toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleStockPress(stock)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#F7FAFC", "#EDF2F7"]}
                  style={styles.detailButtonGradient}
                >
                  <Text style={styles.detailButtonText}>
                    {isExpanded ? "접기" : "상세보기"}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#4A5568"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.priceAnalysisSection}>
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
                    <Text style={styles.priceLabel}>등락률</Text>
                    <Text
                      style={[
                        styles.priceValue,
                        { color: isPositive ? "#4CAF50" : "#F44336" },
                      ]}
                    >
                      {isPositive ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.metricsContainer}>
                <Text style={styles.sectionTitleExpanded}>핵심 지표</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <LinearGradient
                      colors={["#2D3748", "#4A5568"]}
                      style={styles.metricGradient}
                    >
                      <Ionicons name="bar-chart" size={24} color="white" />
                      <Text style={styles.metricLabel}>시가총액</Text>
                      <Text style={styles.metricValue}>
                        {formatMarketCap(stock.marketCap)}
                      </Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.metricCard}>
                    <LinearGradient
                      colors={["#2B6CB0", "#3182CE"]}
                      style={styles.metricGradient}
                    >
                      <Ionicons name="analytics" size={24} color="white" />
                      <Text style={styles.metricLabel}>PER</Text>
                      <Text style={styles.metricValue}>
                        {stock.peRatio.toFixed(1)}
                      </Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.metricCard}>
                    <LinearGradient
                      colors={["#38A169", "#48BB78"]}
                      style={styles.metricGradient}
                    >
                      <Ionicons name="cash" size={24} color="white" />
                      <Text style={styles.metricLabel}>배당수익률</Text>
                      <Text style={styles.metricValue}>
                        {stock.dividendYield.toFixed(2)}%
                      </Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.metricCard}>
                    <LinearGradient
                      colors={["#805AD5", "#9F7AEA"]}
                      style={styles.metricGradient}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={24}
                        color="white"
                      />
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
                    <Ionicons name="business" size={18} color="#667eea" />
                    <Text style={styles.infoLabel}>섹터</Text>
                    <Text style={styles.infoValue}>{stock.sector}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="layers" size={18} color="#667eea" />
                    <Text style={styles.infoLabel}>산업</Text>
                    <Text style={styles.infoValue}>{stock.industry}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.recommendationContainer}>
                <LinearGradient
                  colors={["#f8f9ff", "#e8eeff"]}
                  style={styles.recommendationGradient}
                >
                  <View style={styles.recommendationHeader}>
                    <Ionicons name="bulb" size={24} color="#667eea" />
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
                style={styles.buyButton}
                onPress={() => handleBuyPress(stock)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#2D3748", "#4A5568"]}
                  style={styles.buyButtonGradient}
                >
                  <Ionicons name="wallet" size={20} color="white" />
                  <Text style={styles.buyButtonText}>투자하기</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCategoryCard = (category: StockCategory) => {
    const isSelected = selectedCategory?.id === category.id;
    const gradientColors = getCategoryGradient(category.id);

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard]}
        onPress={() => setSelectedCategory(isSelected ? null : category)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isSelected ? gradientColors : ["#ffffff", "#f8f9ff"]}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryContent}>
            <View style={styles.categoryIconContainer}>
              <Text
                style={[
                  styles.categoryIcon,
                  isSelected && styles.selectedCategoryIcon,
                ]}
              >
                {category.icon}
              </Text>
            </View>
            <Text
              style={[
                styles.categoryName,
                isSelected && styles.selectedCategoryName,
              ]}
            >
              {category.name}
            </Text>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="white" />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.headerGradient}
      >
        <AppHeader
          title="주식 추천"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          backgroundColor="transparent"
          titleColor="white"
          iconColor="white"
          elevated={false}
        />
      </LinearGradient>

      <SafeAreaView style={styles.content} edges={["bottom"]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!selectedCategory ? (
            <View style={styles.categoriesContainer}>
              <LinearGradient
                colors={["#f8f9ff", "transparent"]}
                style={styles.titleGradient}
              >
                <View style={styles.titleContainer}>
                  <Ionicons name="grid" size={28} color="#667eea" />
                  <Text
                    style={[styles.sectionTitle, { color: colors.textPrimary }]}
                  >
                    투자 카테고리를 선택해주세요
                  </Text>
                </View>
              </LinearGradient>
              <View style={styles.categoriesGrid}>
                {mockStockCategories.map(renderCategoryCard)}
              </View>
            </View>
          ) : (
            <View style={styles.stocksContainer}>
              <View style={styles.modernHeaderContainer}>
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.modernHeaderGradient}
                >
                  <View style={styles.headerContent}>
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
                        <Text style={styles.statText}>
                          {selectedCategory.stocks.length}개 종목
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons
                          name="trending-up"
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

              <View style={styles.stocksList}>
                {selectedCategory.stocks.map(renderStockCard)}
              </View>
            </View>
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
  headerGradient: {
    paddingTop: 0,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    flex: 1,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  categoriesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryGradient: {
    borderRadius: 20,
    padding: 16,
  },
  categoryContent: {
    alignItems: "center",
    position: "relative",
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 28,
  },
  selectedCategoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  selectedCategoryName: {
    color: "white",
  },
  selectedIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 4,
  },
  stocksContainer: {
    padding: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: 16,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryHeaderIcon: {
    fontSize: 28,
  },
  selectedCategoryTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  stocksList: {
    flex: 1,
  },
  stockCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  stockCardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  expandedCard: {},
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stockLogoContainer: {
    marginRight: 12,
  },
  stockLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stockLogoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  stockInfo: {
    flex: 1,
    marginRight: 16,
  },
  stockTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expandIcon: {
    padding: 4,
  },
  stockSymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  stockName: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 20,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  changeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 80,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  changeSubText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailCard: {
    width: "48%",
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "700",
  },
  additionalInfo: {
    marginBottom: 20,
  },
  riskSection: {
    marginBottom: 12,
  },
  riskGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  riskTextWhite: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  sectorInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sectorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    flex: 0.45,
    justifyContent: "center",
  },
  sectorText: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "500",
    marginLeft: 6,
  },
  recommendationContainer: {
    marginBottom: 20,
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
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
  },
  buyButton: {
    borderRadius: 16,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  buyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  categoryHeaderGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTextInfo: {
    flexDirection: "column",
    marginLeft: 16,
    flex: 1,
  },
  modernHeaderContainer: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
    marginBottom: 16,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTextSection: {
    flex: 1,
  },
  modernCategoryTitle: {
    fontSize: 26,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: -20,
    right: -30,
  },
  decorationCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -10,
    right: 20,
  },
  detailButton: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailButtonText: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "600",
    marginRight: 6,
  },
  priceAnalysisSection: {
    marginBottom: 20,
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    padding: 16,
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
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  targetPrice: {
    color: "#667eea",
  },
  metricsContainer: {
    marginBottom: 20,
  },
  sectionTitleExpanded: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "white",
    marginTop: 8,
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
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    textAlign: "center",
  },
  confidenceLevel: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginRight: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginRight: 12,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#667eea",
    borderRadius: 3,
  },
  confidencePercent: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
});

export default StockRecommendationScreen;
