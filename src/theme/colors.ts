import { useColorScheme } from "react-native";

export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    // 배경색
    background: isDark ? "#1B1E2B" : "#FFFFFF",
    // 카드/버튼 배경색
    cardBackground: isDark ? "#252A3C" : "#F8F9FA",
    // 주요 텍스트 색상
    textPrimary: isDark ? "#FFFFFF" : "#212529",
    // 부가 텍스트 색상
    textSecondary: isDark ? "#A0A7B7" : "#6C757D",
    // 강조 색상
    accent: isDark ? "#3B82F6" : "#0B4619",
    // 구분선 색상
    border: isDark ? "#2D3548" : "#DEE2E6",
    // 입력창 배경
    inputBackground: isDark ? "#1B1E2B" : "#FFFFFF",
    // 메시지 배경색
    messageUser: isDark ? "#3B82F6" : "#0B4619",
    messageAI: isDark ? "#252A3C" : "#F8F9FA",
    // 주요 색상
    primary: isDark ? "#3B82F6" : "#0B4619",
  };
};
