import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";

type NewsCategory = "all" | "us" | "kr" | "crypto";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  imageUrl: string;
  category: NewsCategory;
};

const SAMPLE_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "연준, 물가 안정시까지 금리 동결 유지 시사",
    summary:
      "파월 의장은 최근 물가 상승세가 여전히 목표치를 상회하고 있어 금리 인하는 시기상조라고 언급...",
    source: "WSJ",
    time: "1시간 전",
    imageUrl: "https://picsum.photos/200/200",
    category: "us",
  },
  {
    id: "2",
    title: "삼성전자, 1분기 실적 예상치 상회",
    summary:
      "AI 수요 증가로 인한 메모리 반도체 가격 상승이 실적 개선을 견인...",
    source: "연합뉴스",
    time: "2시간 전",
    imageUrl: "https://picsum.photos/200/201",
    category: "kr",
  },
  {
    id: "3",
    title: "비트코인, 7만달러 돌파",
    summary: "현물 ETF 순매수세와 반감기 앞둔 수급 기대감으로 상승세 지속...",
    source: "CoinDesk",
    time: "30분 전",
    imageUrl: "https://picsum.photos/200/202",
    category: "crypto",
  },
];

const MarketNewsScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("all");

  const categories = [
    { id: "all", name: "전체" },
    { id: "us", name: "미국 증시" },
    { id: "kr", name: "한국 증시" },
    { id: "crypto", name: "가상자산" },
  ];

  const filteredNews =
    selectedCategory === "all"
      ? SAMPLE_NEWS
      : SAMPLE_NEWS.filter((news) => news.category === selectedCategory);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          시장 동향
        </Text>
        <TouchableOpacity>
          <Ionicons name="refresh" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categories}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
              {
                backgroundColor:
                  selectedCategory === category.id
                    ? colors.accent
                    : colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category.id as NewsCategory)}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === category.id
                      ? "#FFFFFF"
                      : colors.textPrimary,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News List */}
      <ScrollView style={styles.newsList}>
        {filteredNews.map((news) => (
          <TouchableOpacity
            key={news.id}
            style={[
              styles.newsCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Image source={{ uri: news.imageUrl }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text style={[styles.newsTitle, { color: colors.textPrimary }]}>
                {news.title}
              </Text>
              <Text
                style={[styles.newsSummary, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {news.summary}
              </Text>
              <View style={styles.newsFooter}>
                <Text style={[styles.newsSource, { color: colors.accent }]}>
                  {news.source}
                </Text>
                <Text
                  style={[styles.newsTime, { color: colors.textSecondary }]}
                >
                  {news.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  categoriesContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  categories: {
    padding: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonActive: {
    borderWidth: 0,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  newsList: {
    flex: 1,
    padding: 16,
  },
  newsCard: {
    flexDirection: "row",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsImage: {
    width: 100,
    height: 100,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsSource: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  newsTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

export default MarketNewsScreen;
