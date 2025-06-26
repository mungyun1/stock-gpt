import { useColorScheme, Platform } from "react-native";

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

// 폰트 설정 (실제 Pretendard 폰트 사용)
export const getFontFamily = (
  weight: "regular" | "medium" | "semibold" | "bold" | "extrabold"
) => {
  switch (weight) {
    case "regular":
      return "Pretendard-Regular";
    case "medium":
      return "Pretendard-Medium";
    case "semibold":
      return "Pretendard-SemiBold";
    case "bold":
      return "Pretendard-Bold";
    case "extrabold":
      return "Pretendard-ExtraBold";
    default:
      return "Pretendard-Regular";
  }
};

export const getFontWeight = (
  weight: "regular" | "medium" | "semibold" | "bold" | "extrabold"
): any => {
  // Pretendard 폰트를 사용할 때는 fontWeight를 normal로 설정
  // 실제 굵기는 폰트 파일 자체에서 결정됨
  return "normal";
};
