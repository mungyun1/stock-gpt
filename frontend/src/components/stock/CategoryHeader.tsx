import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StockCategory } from "../../types/stock";
import { useThemeColors } from "../../theme/colors";
import { getCategoryGradient } from "../../utils/stockUtils";

interface CategoryHeaderProps {
  category: StockCategory;
  stockCount: number;
  onBackPress: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  stockCount,
  onBackPress,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.modernHeaderContainer,
        {
          shadowColor: colors.isDarkMode ? "#000" : "#6366F1",
          shadowOffset: { width: 0, height: colors.isDarkMode ? 6 : 4 },
          shadowOpacity: colors.isDarkMode ? 0.4 : 0.15,
          shadowRadius: colors.isDarkMode ? 15 : 10,
          elevation: colors.isDarkMode ? 10 : 6,
        },
      ]}
    >
      <LinearGradient
        colors={getCategoryGradient(category.id)}
        style={styles.modernHeaderGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={[
                styles.backButtonContainer,
                {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
              onPress={onBackPress}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color="white" />
              <Text style={styles.backText}>뒤로가기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerMainSection}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              ]}
            >
              <Text style={styles.categoryHeaderIcon}>{category.icon}</Text>
            </View>

            <View style={styles.headerTextSection}>
              <Text style={styles.modernCategoryTitle}>{category.name}</Text>
              <Text style={styles.modernCategorySubtitle}>
                {category.description}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.headerStatsSection,
              { borderTopColor: "rgba(255, 255, 255, 0.2)" },
            ]}
          >
            <View
              style={[
                styles.statItem,
                { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              ]}
            >
              <Ionicons name="list" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{stockCount}개 종목</Text>
            </View>
            <View
              style={[
                styles.statItem,
                { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              ]}
            >
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
          <View
            style={[
              styles.decorationCircle,
              { backgroundColor: "rgba(255, 255, 255, 0.08)" },
            ]}
          />
          <View
            style={[
              styles.decorationCircle2,
              { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            ]}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  modernHeaderContainer: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: "hidden",
  },
  modernHeaderGradient: {
    padding: 20,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 14,
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
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
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
    top: -30,
    right: -40,
  },
  decorationCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    bottom: -20,
    right: 10,
  },
});

export default CategoryHeader;
