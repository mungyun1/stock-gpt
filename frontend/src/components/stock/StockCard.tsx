import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StockRecommendation } from "../../utils/stockUtils";
import { useThemeColors } from "../../theme/colors";
import StockCardHeader from "./StockCardHeader";
import QuickStats from "./QuickStats";
import StockExpandedContent from "./StockExpandedContent";

interface StockCardProps {
  stock: StockRecommendation;
  isExpanded: boolean;
  onPress: (stock: StockRecommendation) => void;
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  isExpanded,
  onPress,
}) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.stockCard, isExpanded && styles.expandedCard]}>
      <LinearGradient
        colors={
          colors.isDarkMode ? ["#252A3C", "#1B1E2B"] : ["#FFFFFF", "#FAFBFF"]
        }
        style={[
          styles.stockCardGradient,
          colors.isDarkMode && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          },
        ]}
      >
        <StockCardHeader stock={stock} onPress={onPress} />

        {!isExpanded && <QuickStats stock={stock} />}

        {!isExpanded && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => onPress(stock)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                colors.isDarkMode
                  ? ["#2D3548", "#252A3C"]
                  : ["#F8FAFC", "#F1F5F9"]
              }
              style={styles.expandButtonGradient}
            >
              <Text
                style={[styles.expandButtonText, { color: colors.textPrimary }]}
              >
                자세히 보기
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textPrimary}
              />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isExpanded && <StockExpandedContent stock={stock} onPress={onPress} />}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  stockCard: {
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
  stockCardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  expandedCard: {},
  expandButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  expandButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default StockCard;
