import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { mockStockCategories } from "../data/mockStockData";
import { StockCategory } from "../types/stock";
import { RootStackParamList } from "../types/navigation";
import { useThemeColors } from "../theme/colors";
import CommonHeader from "../components/CommonHeader";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StockCategory"
>;

const StockCategoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();

  const getCategoryColor = (categoryId: string): string => {
    const colorMap: { [key: string]: string } = {
      tech: "#2196F3",
      finance: "#4CAF50",
      healthcare: "#FF9800",
      energy: "#9C27B0",
      consumer: "#FF5722",
      default: "#607D8B",
    };
    return colorMap[categoryId] || colorMap.default;
  };

  const handleCategorySelect = (category: StockCategory) => {
    navigation.navigate("StockList", {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const renderCategoryCard = (category: StockCategory) => {
    const iconColor = getCategoryColor(category.id);

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          { backgroundColor: colors.cardBackground },
        ]}
        onPress={() => handleCategorySelect(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryIconContainer}>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="종목 추천" />
      <SafeAreaView
        style={[styles.content, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        >
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              투자 카테고리
            </Text>
            <View style={styles.sectionContent}>
              {mockStockCategories.map(renderCategoryCard)}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingHorizontal: 20,
    gap: 2,
  },
  categoryCard: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: "rgba(0, 0, 0, 0.05)",
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

export default StockCategoryScreen;
