import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StockCategory } from "../../types/stock";
import { useThemeColors } from "../../theme/colors";
import { getCategoryColor } from "../../utils/stockUtils";

interface CategoryCardProps {
  category: StockCategory;
  onPress: (category: StockCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const colors = useThemeColors();
  const iconColor = getCategoryColor(category.id);

  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: colors.isDarkMode ? "#000" : "#000",
          shadowOffset: { width: 0, height: colors.isDarkMode ? 2 : 1 },
          shadowOpacity: colors.isDarkMode ? 0.2 : 0.05,
          shadowRadius: colors.isDarkMode ? 4 : 2,
          elevation: colors.isDarkMode ? 3 : 1,
        },
      ]}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <View
          style={[
            styles.categoryIconContainer,
            {
              backgroundColor: colors.isDarkMode
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.05)",
            },
          ]}
        >
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

const styles = StyleSheet.create({
  categoryCard: {
    borderRadius: 12,
    marginBottom: 8,
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
});

export default CategoryCard;
