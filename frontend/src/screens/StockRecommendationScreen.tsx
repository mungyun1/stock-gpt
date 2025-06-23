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

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case "LOW":
        return "#4CAF50";
      case "MEDIUM":
        return "#FF9800";
      case "HIGH":
        return "#F44336";
      default:
        return "#757575";
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

    return (
      <TouchableOpacity
        key={stock.id}
        style={[styles.stockCard, isExpanded && styles.expandedCard]}
        onPress={() => handleStockPress(stock)}
        activeOpacity={0.8}
      >
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockName}>{stock.name}</Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>
              ${stock.currentPrice.toFixed(2)}
            </Text>
            <View
              style={[
                styles.changeContainer,
                { backgroundColor: isPositive ? "#E8F5E8" : "#FFEBEE" },
              ]}
            >
              <Text
                style={[
                  styles.changeText,
                  { color: isPositive ? "#4CAF50" : "#F44336" },
                ]}
              >
                {isPositive ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </Text>
              <Text
                style={[
                  styles.changeText,
                  { color: isPositive ? "#4CAF50" : "#F44336" },
                ]}
              >
                {isPositive ? "+" : ""}${stock.changeAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>시가총액:</Text>
              <Text style={styles.detailValue}>
                {formatMarketCap(stock.marketCap)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PER:</Text>
              <Text style={styles.detailValue}>{stock.peRatio.toFixed(1)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>배당수익률:</Text>
              <Text style={styles.detailValue}>
                {stock.dividendYield.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>목표가:</Text>
              <Text style={styles.detailValue}>
                ${stock.targetPrice.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>위험도:</Text>
              <View style={styles.riskContainer}>
                <View
                  style={[
                    styles.riskIndicator,
                    { backgroundColor: getRiskColor(stock.riskLevel) },
                  ]}
                />
                <Text style={styles.riskText}>
                  {getRiskText(stock.riskLevel)}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>섹터:</Text>
              <Text style={styles.detailValue}>{stock.sector}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>산업:</Text>
              <Text style={styles.detailValue}>{stock.industry}</Text>
            </View>

            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationTitle}>추천 이유</Text>
              <Text style={styles.recommendationText}>
                {stock.recommendationReason}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => handleBuyPress(stock)}
            >
              <Ionicons name="cart-outline" size={20} color="white" />
              <Text style={styles.buyButtonText}>매수하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryCard = (category: StockCategory) => {
    const isSelected = selectedCategory?.id === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}
        onPress={() => setSelectedCategory(isSelected ? null : category)}
        activeOpacity={0.8}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text
          style={[
            styles.categoryName,
            isSelected && styles.selectedCategoryName,
          ]}
        >
          {category.name}
        </Text>
        <Text
          style={[
            styles.categoryDescription,
            isSelected && styles.selectedCategoryDescription,
          ]}
        >
          {category.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="주식 추천"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={colors.cardBackground}
        elevated={true}
      />

      <SafeAreaView style={styles.content} edges={["bottom"]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!selectedCategory ? (
            <View style={styles.categoriesContainer}>
              <Text
                style={[styles.sectionTitle, { color: colors.textPrimary }]}
              >
                카테고리 선택
              </Text>
              {mockStockCategories.map(renderCategoryCard)}
            </View>
          ) : (
            <View style={styles.stocksContainer}>
              <View style={styles.categoryHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>
                    {selectedCategory.icon}
                  </Text>
                  <Text style={styles.selectedCategoryTitle}>
                    {selectedCategory.name}
                  </Text>
                </View>
              </View>

              <Text style={styles.categoryDescription}>
                {selectedCategory.description}
              </Text>

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

  content: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategoryCard: {
    backgroundColor: "#007AFF",
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  selectedCategoryName: {
    color: "white",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  selectedCategoryDescription: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  stocksContainer: {
    padding: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCategoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  stocksList: {
    marginTop: 20,
  },
  stockCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandedCard: {
    paddingBottom: 20,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: "#666666",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  riskContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  riskText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  recommendationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  buyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default StockRecommendationScreen;
