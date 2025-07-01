import { useColorScheme } from "react-native";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 테마 타입 정의
export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

// 테마 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 테마 프로바이더 컴포넌트
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const systemColorScheme = useColorScheme();

  // 다크모드 여부 계산
  const isDarkMode =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  // 초기 테마 설정 로드
  useEffect(() => {
    loadThemeMode();
  }, []);

  // 테마 설정 로드
  const loadThemeMode = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem("themeMode");
      if (
        savedThemeMode &&
        ["light", "dark", "system"].includes(savedThemeMode)
      ) {
        setThemeModeState(savedThemeMode as ThemeMode);
      }
    } catch (error) {
      console.error("Failed to load theme mode:", error);
    }
  };

  // 테마 설정 저장 및 변경
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마 컨텍스트 사용 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useThemeColors = () => {
  const { isDarkMode } = useTheme();

  return {
    // 배경색
    background: isDarkMode ? "#1B1E2B" : "#FFFFFF",
    // 카드/버튼 배경색
    cardBackground: isDarkMode ? "#252A3C" : "#F8F9FA",
    // 주요 텍스트 색상
    textPrimary: isDarkMode ? "#FFFFFF" : "#212529",
    // 부가 텍스트 색상
    textSecondary: isDarkMode ? "#A0A7B7" : "#6C757D",
    // 강조 색상
    accent: isDarkMode ? "#16A34A" : "#0B4619",
    // 구분선 색상
    border: isDarkMode ? "#2D3548" : "#DEE2E6",
    // 입력창 배경
    inputBackground: isDarkMode ? "#1B1E2B" : "#FFFFFF",
    // 메시지 배경색
    messageUser: isDarkMode ? "#16A34A" : "#0B4619",
    messageAI: isDarkMode ? "#252A3C" : "#F8F9FA",
    // 주요 색상
    primary: isDarkMode ? "#16A34A" : "#0B4619",
    // 다크모드 여부
    isDarkMode,
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
