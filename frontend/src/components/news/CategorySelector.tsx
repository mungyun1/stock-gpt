import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useThemeColors } from "../../theme/colors";
import { NewsCategory } from "../../types/news";
import { newsCategories } from "../../data/newsCategories";

interface CategorySelectorProps {
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
  colors: ReturnType<typeof useThemeColors>;
}

export const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
  colors,
}: CategorySelectorProps) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {newsCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && [
                styles.categoryButtonActive,
                { borderBottomColor: colors.primary },
              ],
            ]}
            onPress={() => onCategoryChange(category.id as NewsCategory)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.textSecondary },
                selectedCategory === category.id && [
                  styles.categoryTextActive,
                  { color: colors.primary },
                ],
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scrollView: {
    flexGrow: 0,
  },
  contentContainer: {
    gap: 16,
  },
  categoryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "transparent",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonActive: {
    borderBottomWidth: 2,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    textAlign: "center",
  },
  categoryTextActive: {
    fontFamily: "Pretendard-ExtraBold",
  },
});
