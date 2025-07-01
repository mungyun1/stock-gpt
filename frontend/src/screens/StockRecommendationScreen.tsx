import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockStockCategories } from "../data/mockStockData";
import { useThemeColors } from "../theme/colors";
import { useStockRecommendation } from "../hooks/useStockRecommendation";
import CommonHeader from "../components/CommonHeader";
import { CategoryCard, StockList } from "../components/stock";

const StockRecommendationScreen: React.FC = () => {
  const colors = useThemeColors();
  const {
    selectedCategory,
    expandedStock,
    handleCategorySelect,
    handleBackToCategories,
    handleStockPress,
  } = useStockRecommendation();

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
                {mockStockCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={handleCategorySelect}
                  />
                ))}
              </View>
            </View>
          ) : (
            <StockList
              category={selectedCategory}
              expandedStock={expandedStock}
              onBackPress={handleBackToCategories}
              onStockPress={handleStockPress}
            />
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
});

export default StockRecommendationScreen;
