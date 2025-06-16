import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColors } from "../../theme/colors";

interface ErrorViewProps {
  error: Error | null;
  onRetry: () => void;
  colors: ReturnType<typeof useThemeColors>;
}

export const ErrorView = ({ error, onRetry, colors }: ErrorViewProps) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorText, { color: colors.textPrimary }]}>
        {error instanceof Error
          ? error.message
          : "뉴스를 불러오는데 실패했습니다"}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.accent }]}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
