import React, { FC, ReactNode, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../theme/colors";
import { useModalAnimation } from "../hooks/useModalAnimation";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../types/navigation";
import CommonHeader from "../components/CommonHeader";
import HelpScreen from "../components/HelpScreen";
import AppInfoScreen from "../components/AppInfoScreen";
import SettingsScreen from "./SettingsScreen";
import InvestmentCalculatorScreen from "../components/InvestmentCalculatorScreen";

type NavigationProp = BottomTabNavigationProp<RootTabParamList, "Home">;

interface MenuItemProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  showArrow?: boolean;
}

interface MenuSectionProps {
  title: string;
  children: ReactNode;
}

const MenuItem: FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
}) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
        {showArrow && (
          <MaterialIcons
            name="keyboard-arrow-right"
            size={24}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const MenuSection: FC<MenuSectionProps> = ({ title, children }) => {
  const colors = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

const HomeScreen = () => {
  const colors = useThemeColors();
  const navigation = useNavigation<NavigationProp>();
  const [currentScreen, setCurrentScreen] = useState<
    "main" | "help" | "appInfo" | "settings" | "calculator"
  >("main");

  const showHelp = () => {
    setCurrentScreen("help");
  };

  const showAppInfo = () => {
    setCurrentScreen("appInfo");
  };

  const showSettings = () => {
    setCurrentScreen("settings");
  };

  const showCalculator = () => {
    setCurrentScreen("calculator");
  };

  const showMain = () => {
    setCurrentScreen("main");
  };

  if (currentScreen === "help") {
    return <HelpScreen onBack={showMain} />;
  }

  if (currentScreen === "appInfo") {
    return <AppInfoScreen onBack={showMain} />;
  }

  if (currentScreen === "settings") {
    return <SettingsScreen onBack={showMain} />;
  }

  if (currentScreen === "calculator") {
    return <InvestmentCalculatorScreen onBack={showMain} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="더보기" />
      <SafeAreaView
        style={[styles.safeAreaContent, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <MenuSection title="주요 기능">
            <MenuItem
              icon={
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color="#2196F3"
                />
              }
              title="주식 분석"
              subtitle="AI 기반 종목 분석 및 상담"
              onPress={() => navigation.navigate("Chat")}
            />
            <MenuItem
              icon={<Ionicons name="calendar" size={24} color="#FF9800" />}
              title="투자 캘린더"
              subtitle="중요 일정 및 이벤트 관리"
              onPress={() => navigation.navigate("Calendar")}
            />
            <MenuItem
              icon={<FontAwesome5 name="newspaper" size={20} color="#4CAF50" />}
              title="시장 뉴스"
              subtitle="실시간 증시 및 경제 뉴스"
              onPress={() => navigation.navigate("MarketNews")}
            />
            <MenuItem
              icon={
                <MaterialCommunityIcons
                  name="trending-up"
                  size={24}
                  color="#9C27B0"
                />
              }
              title="주식 추천"
              subtitle="AI 추천 TOP5 종목"
              onPress={() => navigation.navigate("StockStack")}
            />
          </MenuSection>

          <MenuSection title="투자 도구">
            <MenuItem
              icon={
                <MaterialCommunityIcons
                  name="calculator"
                  size={24}
                  color="#607D8B"
                />
              }
              title="투자 계산기"
              subtitle="수익률 계산"
              onPress={showCalculator}
            />
            <MenuItem
              icon={
                <MaterialCommunityIcons
                  name="chart-pie"
                  size={24}
                  color="#FF5722"
                />
              }
              title="포트폴리오 분석"
              subtitle="자산 배분 및 리스크 분석"
              onPress={() => {}}
            />
            <MenuItem
              icon={
                <MaterialIcons name="notifications" size={24} color="#FFC107" />
              }
              title="알림 설정"
              subtitle="주가 알림 및 뉴스 알림"
              onPress={() => {}}
            />
          </MenuSection>

          <MenuSection title="서비스 정보">
            <MenuItem
              icon={
                <MaterialIcons name="help-outline" size={24} color="#9E9E9E" />
              }
              title="도움말"
              subtitle="사용법 및 FAQ"
              onPress={showHelp}
            />
            <MenuItem
              icon={
                <MaterialIcons name="info-outline" size={24} color="#9E9E9E" />
              }
              title="앱 정보"
              subtitle="버전 정보 및 업데이트"
              onPress={showAppInfo}
            />
            <MenuItem
              icon={<MaterialIcons name="settings" size={24} color="#9E9E9E" />}
              title="설정"
              subtitle="개인화 및 환경 설정"
              onPress={showSettings}
            />
          </MenuSection>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContent: {
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
  menuItem: {
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
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    lineHeight: 20,
  },
});

export default HomeScreen;
