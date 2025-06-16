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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categories}
    >
      {newsCategories.map((category) => (
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
          onPress={() => onCategoryChange(category.id as NewsCategory)}
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
  );
};

const styles = StyleSheet.create({
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
});
