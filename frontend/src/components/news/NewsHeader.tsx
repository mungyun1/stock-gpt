import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../theme/colors";

interface NewsHeaderProps {
  onBackPress: () => void;
  onRefreshPress: () => void;
  isRefreshing: boolean;
  colors: ReturnType<typeof useThemeColors>;
}

export const NewsHeader = ({
  onBackPress,
  onRefreshPress,
  isRefreshing,
  colors,
}: NewsHeaderProps) => {
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity onPress={onBackPress}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
        시장 동향
      </Text>
      <TouchableOpacity onPress={onRefreshPress} disabled={isRefreshing}>
        <Ionicons
          name="refresh"
          size={24}
          color={isRefreshing ? colors.textSecondary : colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Pretendard-SemiBold",
  },
});
