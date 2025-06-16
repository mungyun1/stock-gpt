import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useThemeColors } from "../../theme/colors";
import { NewsItem } from "../../types/news";
import { formatDate } from "../../utils/dateUtils";
import { getDomainFromUrl } from "../../utils/urlUtils";

interface NewsCardProps {
  news: NewsItem;
  onPress: (url: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}

export const NewsCard = ({ news, onPress, colors }: NewsCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.newsCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => onPress(news.url)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: news.imageUrl }} style={styles.newsImage} />
        <Text style={[styles.domain, { color: colors.accent }]}>
          {getDomainFromUrl(news.url)}
        </Text>
      </View>
      <View style={styles.newsContent}>
        <View>
          <Text style={[styles.newsTitle, { color: colors.textPrimary }]}>
            {news.title}
          </Text>
        </View>
        <View style={styles.newsFooter}>
          <Text style={[styles.newsTime, { color: colors.textSecondary }]}>
            {formatDate(news.date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});
