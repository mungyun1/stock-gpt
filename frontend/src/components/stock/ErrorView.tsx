import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColors } from "../../theme/colors";

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
  onBack?: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry, onBack }) => {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: colors.accent }]}>⚠️</Text>
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        데이터를 불러올 수 없습니다
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {error}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>
            다시 시도
          </Text>
        </TouchableOpacity>

        {onBack && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.backButtonText, { color: colors.textSecondary }]}
            >
              카테고리로 돌아가기
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  message: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
  },
});

export default ErrorView;
