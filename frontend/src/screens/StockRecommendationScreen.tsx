import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
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
      tech: "#FFFFFF",
      finance: "#FFFFFF",
      healthcare: "#FFFFFF",
      energy: "#FFFFFF",
      consumer: "#FFFFFF",
      default: "#FFFFFF",
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
    const backgroundColor = getCategoryColor(category.id);

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard]}
        onPress={() => handleCategorySelect(category)}
        activeOpacity={0.9}
      >
        <View style={[styles.categoryBackground, { backgroundColor }]}>
          <View style={styles.categoryContent}>
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
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
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        >
          <View style={styles.categoriesContainer}>
            <View style={styles.titleSection}>
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.titleGradient}
              >
                <View style={styles.titleContainer}>
                  <View style={styles.titleIconContainer}>
                    <Ionicons name="grid" size={28} color="white" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>투자 카테고리 선택</Text>
                    <Text style={styles.sectionSubtitle}>
                      맞춤 추천을 받아보세요
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.categoriesGrid}>
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
  categoriesContainer: {
    flex: 1,
  },
  titleSection: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  titleGradient: {
    padding: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  categoriesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryBackground: {
    borderRadius: 20,
    padding: 20,
  },
  categoryContent: {
    alignItems: "center",
    position: "relative",
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
});

export default StockCategoryScreen;
