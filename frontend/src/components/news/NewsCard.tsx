import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useThemeColors } from "../../theme/colors";
import { NewsItem } from "../../types/news";
import { formatDate } from "../../utils/dateUtils";

interface NewsCardProps {
  news: NewsItem;
  onPress: (url: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}

export const NewsCard = ({ news, onPress, colors }: NewsCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.newsCard, { backgroundColor: "#ffffff" }]}
      onPress={() => onPress(news.url)}
      activeOpacity={0.7}
    >
      {/* 썸네일 이미지 */}
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: news.imageUrl }} style={styles.thumbnail} />
      </View>

      {/* 뉴스 콘텐츠 */}
      <View style={styles.contentContainer}>
        {/* 뉴스 제목 */}
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {news.title}
        </Text>

        {/* 뉴스 하단 정보 */}
        <View style={styles.metaContainer}>
          <View style={styles.sourceTimeContainer}>
            <Text style={[styles.source, { color: colors.textSecondary }]}>
              {news.source}
            </Text>
            <Text style={[styles.dot, { color: colors.textSecondary }]}>·</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {formatDate(news.date)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 22,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  sourceTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  source: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  dot: {
    fontSize: 13,
    marginHorizontal: 6,
    color: "#666666",
  },
  time: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#888888",
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
