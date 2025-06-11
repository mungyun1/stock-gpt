import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Animated,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";
import { useNewsQuery } from "../hooks/useNewsQuery";
import { NewsCategory, NewsItem } from "../types/news";
import type { InfiniteData } from "@tanstack/react-query";

const categories = [
  { id: "all", name: "전체" },
  { id: "us_market", name: "미국 증시" },
  { id: "us_tech", name: "미국 기술주" },
  { id: "kr_kospi", name: "코스피" },
  { id: "kr_kosdaq", name: "코스닥" },
  { id: "crypto_bitcoin", name: "비트코인" },
  { id: "crypto_altcoin", name: "알트코인" },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일`;
};

const SAMPLE_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "연준, 물가 안정시까지 금리 동결 유지 시사",
    summary:
      "파월 의장은 최근 물가 상승세가 여전히 목표치를 상회하고 있어 금리 인하는 시기상조라고 언급...",
    source: "WSJ",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/200",
    category: "us_market",
    url: "https://www.wsj.com",
  },
  {
    id: "2",
    title: "삼성전자, 1분기 실적 예상치 상회",
    summary:
      "AI 수요 증가로 인한 메모리 반도체 가격 상승이 실적 개선을 견인...",
    source: "연합뉴스",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/201",
    category: "kr_kospi",
    url: "https://www.yna.co.kr",
  },
  {
    id: "3",
    title: "비트코인, 7만달러 돌파",
    summary: "현물 ETF 순매수세와 반감기 앞둔 수급 기대감으로 상승세 지속...",
    source: "CoinDesk",
    date: "2024-03-21",
    imageUrl: "https://picsum.photos/200/202",
    category: "crypto_bitcoin",
    url: "https://www.coindesk.com",
  },
];

const getDomainFromUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain;
  } catch {
    return url;
  }
};

const SkeletonNewsCard = ({
  colors,
}: {
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.newsCard,
        {
          backgroundColor: colors.cardBackground,
          marginHorizontal: 16,
          marginBottom: 16,
        },
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          { marginVertical: 12, marginHorizontal: 12 },
        ]}
      >
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              borderRadius: 12,
              marginBottom: 6,
            },
            styles.skeleton,
            { opacity, backgroundColor: colors.border },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonDomain,
            styles.skeleton,
            { opacity, backgroundColor: colors.border },
          ]}
        />
      </View>
      <View style={[styles.newsContent, { flex: 1, padding: 12 }]}>
        <View>
          <Animated.View
            style={[
              styles.skeletonTitle,
              styles.skeleton,
              { opacity, backgroundColor: colors.border },
            ]}
          />
        </View>
        <View style={[styles.newsFooter, { marginTop: 8 }]}>
          <Animated.View
            style={[
              styles.skeletonTime,
              styles.skeleton,
              { opacity, backgroundColor: colors.border },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

type NewsResponse = {
  items: NewsItem[];
  nextPage: number | null;
};

const MarketNewsScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("all");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNewsQuery(selectedCategory);

  const allNews = React.useMemo(() => {
    const newsItems =
      (data as InfiniteData<NewsResponse>)?.pages.flatMap(
        (page) => page.items
      ) ?? [];
    // URL을 기준으로 중복 제거
    const uniqueNews = newsItems.filter(
      (news, index, self) => index === self.findIndex((n) => n.url === news.url)
    );
    return uniqueNews;
  }, [data]);

  const onRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleScroll = (event: NativeScrollEvent) => {
    const { layoutMeasurement, contentOffset, contentSize } = event;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isCloseToBottom) {
      handleLoadMore();
    }
  };

  const handleNewsPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("오류", "이 링크를 열 수 없습니다.", [{ text: "확인" }]);
      }
    } catch (error) {
      Alert.alert("오류", "링크를 여는 중 문제가 발생했습니다.", [
        { text: "확인" },
      ]);
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

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
        <TouchableOpacity onPress={onRefresh} disabled={isFetching}>
          <Ionicons
            name="refresh"
            size={24}
            color={isFetching ? colors.textSecondary : colors.textPrimary}
          />
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
      <ScrollView
        style={styles.newsList}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={onRefresh}
          />
        }
        onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
        scrollEventThrottle={400}
      >
        {isLoading ? (
          <View>
            {[1, 2, 3, 4, 5].map((index) => (
              <SkeletonNewsCard key={index} colors={colors} />
            ))}
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.textPrimary }]}>
              {error instanceof Error
                ? error.message
                : "뉴스를 불러오는데 실패했습니다"}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
              onPress={onRefresh}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {allNews.map((news: NewsItem) => (
              <TouchableOpacity
                key={news.id}
                style={[
                  styles.newsCard,
                  { backgroundColor: colors.cardBackground },
                ]}
                onPress={() => handleNewsPress(news.url)}
                activeOpacity={0.7}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: news.imageUrl }}
                    style={styles.newsImage}
                  />
                  <Text style={[styles.domain, { color: colors.accent }]}>
                    {getDomainFromUrl(news.url)}
                  </Text>
                </View>
                <View style={styles.newsContent}>
                  <View>
                    <Text
                      style={[styles.newsTitle, { color: colors.textPrimary }]}
                    >
                      {news.title}
                    </Text>
                  </View>
                  <View style={styles.newsFooter}>
                    <Text
                      style={[styles.newsTime, { color: colors.textSecondary }]}
                    >
                      {formatDate(news.date)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {renderFooter()}
          </>
        )}
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
    paddingHorizontal: 16,
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
    paddingTop: 16,
  },
  imageContainer: {
    width: 120,
    marginVertical: 12,
    marginHorizontal: 12,
    alignItems: "center",
  },
  newsImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 6,
  },
  domain: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
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
    elevation: 3,
    marginHorizontal: 16,
  },
  newsContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    lineHeight: 22,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  newsTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    opacity: 0.6,
    minWidth: 90,
  },
  loadingContainer: {
    paddingTop: 16,
  },
  skeleton: {
    borderRadius: 12,
  },
  skeletonTitle: {
    height: 44,
    width: "100%",
  },
  skeletonDomain: {
    height: 13,
    width: 80,
    marginTop: 4,
  },
  skeletonTime: {
    height: 12,
    width: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
} as const);

export default MarketNewsScreen;
