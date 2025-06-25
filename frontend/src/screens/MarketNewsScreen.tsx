import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../theme/colors";
import { useNewsQuery } from "../hooks/useNewsQuery";
import { useNewsScroll } from "../hooks/useNewsScroll";
import { NewsCategory, NewsItem } from "../types/news";
import type { InfiniteData } from "@tanstack/react-query";

// Components
import {
  CategorySelector,
  NewsCard,
  SkeletonNewsCard,
  ErrorView,
} from "../components/news";

type NewsResponse = {
  items: NewsItem[];
  nextPage: number | null;
};

const MarketNewsScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] =
    useState<NewsCategory>("semiconductor");

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

  const { handleScroll } = useNewsScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage: !!isFetchingNextPage,
    fetchNextPage,
  });

  const allNews = useMemo(() => {
    const newsItems =
      (data as InfiniteData<NewsResponse>)?.pages.flatMap(
        (page) => page.items
      ) ?? [];
    // URL을 기준으로 중복 제거
    const uniqueNews = newsItems.filter(
      (news, index, self) => index === self.findIndex((n) => n.url === news.url)
    );
    // 날짜 기준으로 최신순 정렬
    return uniqueNews.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data]);

  const onRefresh = () => {
    refetch();
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
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        colors={colors}
      />

      <ScrollView
        style={styles.newsList}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={onRefresh}
          />
        }
        onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
        scrollEventThrottle={16}
      >
        {isLoading ? (
          <View>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
              <SkeletonNewsCard key={index} colors={colors} />
            ))}
          </View>
        ) : isError ? (
          <ErrorView error={error} onRetry={onRefresh} colors={colors} />
        ) : (
          <>
            {allNews.map((news: NewsItem) => (
              <NewsCard
                key={news.id}
                news={news}
                onPress={handleNewsPress}
                colors={colors}
              />
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
  newsList: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MarketNewsScreen;
