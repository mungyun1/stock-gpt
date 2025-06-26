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
}: CategorySelectorProps) => {
  return (
    <View style={styles.container}>
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
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => onCategoryChange(category.id as NewsCategory)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scrollView: {
    flexGrow: 0,
  },
  contentContainer: {
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "transparent",
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#0B4619",
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    color: "#666666",
    textAlign: "center",
  },
  categoryTextActive: {
    color: "#0B4619",
    fontFamily: "Pretendard-Bold",
  },
});
