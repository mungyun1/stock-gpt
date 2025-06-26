import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";
import CommonHeader from "./CommonHeader";

interface HelpScreenProps {
  onBack: () => void;
}

interface HelpItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips?: string[];
}

const HelpItem: React.FC<HelpItemProps> = ({
  icon,
  title,
  description,
  tips,
}) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.helpItem, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.helpHeader}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={[styles.helpTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.helpDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {tips && tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: colors.accent }]}>
            💡 사용 팁
          </Text>
          {tips.map((tip, index) => (
            <Text
              key={index}
              style={[styles.tipItem, { color: colors.textSecondary }]}
            >
              • {tip}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
  const colors = useThemeColors();

  const helpSections = [
    {
      icon: (
        <MaterialCommunityIcons name="chart-line" size={24} color="#2196F3" />
      ),
      title: "AI 주식 분석",
      description:
        "OpenAI GPT를 활용한 실시간 주식 분석 서비스입니다. 종목명이나 티커를 입력하면 AI가 상세한 분석을 제공합니다.",
      tips: [
        "삼성전자, AAPL 등 종목명이나 티커로 검색하세요",
        "시장 분석을 원하면 '코스피', '나스닥' 등으로 질문하세요",
        "채팅 기록은 자동으로 저장되어 언제든 다시 확인할 수 있습니다",
        "좌상단 메뉴 버튼으로 이전 대화를 확인할 수 있습니다",
      ],
    },
    {
      icon: <Ionicons name="calendar" size={24} color="#FF9800" />,
      title: "투자 캘린더",
      description:
        "FOMC, GDP, CPI 등 주요 경제 지표 발표 일정과 중요한 투자 관련 이벤트를 관리할 수 있습니다.",
      tips: [
        "좌우 화살표로 월별 일정을 확인하세요",
        "중요도에 따라 이벤트가 색상별로 구분됩니다",
        "현재 월이 아닐 때는 '이번 달로' 버튼이 나타납니다",
        "이벤트를 터치하면 상세 정보를 확인할 수 있습니다",
      ],
    },
    {
      icon: <FontAwesome5 name="newspaper" size={20} color="#4CAF50" />,
      title: "시장 뉴스",
      description:
        "실시간 주식 시장 및 경제 뉴스를 카테고리별로 확인할 수 있습니다. 반도체, 바이오, 금융 등 분야별 뉴스를 제공합니다.",
      tips: [
        "상단 카테고리 탭으로 관심 분야를 선택하세요",
        "아래로 스크롤하면 더 많은 뉴스가 자동으로 로드됩니다",
        "뉴스 카드를 터치하면 원문 사이트로 이동합니다",
        "아래로 당기면 최신 뉴스를 새로고침할 수 있습니다",
      ],
    },
    {
      icon: (
        <MaterialCommunityIcons name="trending-up" size={24} color="#9C27B0" />
      ),
      title: "종목 추천",
      description:
        "AI가 분석한 카테고리별 추천 종목을 확인할 수 있습니다. 기술주, 금융주, 헬스케어 등 다양한 섹터별로 제공됩니다.",
      tips: [
        "카테고리를 선택하면 해당 섹터의 추천 종목을 확인할 수 있습니다",
        "각 종목의 현재가와 변동률을 실시간으로 확인하세요",
        "종목을 터치하면 상세 정보를 볼 수 있습니다",
        "정기적으로 업데이트되는 추천 목록을 확인하세요",
      ],
    },
  ];

  const generalTips = [
    "앱 하단의 탭바를 통해 원하는 기능으로 쉽게 이동할 수 있습니다",
    "모든 화면에서 상단 헤더로 현재 위치를 확인할 수 있습니다",
    "다크모드와 라이트모드를 지원합니다 (시스템 설정에 따라 자동 변경)",
    "인터넷 연결이 필요한 기능들은 오프라인에서 제한될 수 있습니다",
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title=" 도움말" />

      <SafeAreaView
        style={[styles.content, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.helpContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableOpacity
            style={[
              styles.backButtonContainer,
              { borderBottomColor: colors.border },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#9E9E9E" />
            <Text style={[styles.backText, { color: "#9E9E9E" }]}>
              뒤로가기
            </Text>
          </TouchableOpacity>
          <View style={styles.appInfoSection}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
              버전 1.0.0
            </Text>
            <Text
              style={[styles.appDescription, { color: colors.textSecondary }]}
            >
              AI 기반 주식 투자 도우미 앱으로, 실시간 시장 분석과 투자 정보를
              제공합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              🚀 주요 기능
            </Text>
            {helpSections.map((section, index) => (
              <HelpItem
                key={index}
                icon={section.icon}
                title={section.title}
                description={section.description}
                tips={section.tips}
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              💡 일반 사용법
            </Text>
            <View
              style={[
                styles.helpItem,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              {generalTips.map((tip, index) => (
                <Text
                  key={index}
                  style={[styles.generalTip, { color: colors.textSecondary }]}
                >
                  • {tip}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ⚠️ 주의사항
            </Text>
            <View
              style={[
                styles.helpItem,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text
                style={[styles.disclaimer, { color: colors.textSecondary }]}
              >
                • 본 앱의 분석과 추천은 참고용이며, 투자 결정에 대한 책임은
                사용자에게 있습니다.
              </Text>
              <Text
                style={[styles.disclaimer, { color: colors.textSecondary }]}
              >
                • 실시간 데이터는 지연될 수 있으며, 투자 전 공식 자료를
                확인하시기 바랍니다.
              </Text>
              <Text
                style={[styles.disclaimer, { color: colors.textSecondary }]}
              >
                • AI 분석은 과거 데이터를 기반으로 하며, 미래 수익을 보장하지
                않습니다.
              </Text>
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
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  backText: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  helpContainer: {
    padding: 24,
    paddingTop: 16,
  },
  appInfoSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.1)",
  },
  logoImage: {
    width: 120,
    height: 40,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: "Pretendard-Bold",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 16,
  },
  helpItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    flex: 1,
  },
  helpDescription: {
    fontSize: 15,
    fontFamily: "Pretendard-Regular",
    lineHeight: 22,
    marginBottom: 12,
  },
  tipsContainer: {
    backgroundColor: "rgba(33, 150, 243, 0.05)",
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    lineHeight: 20,
    marginBottom: 4,
  },
  generalTip: {
    fontSize: 15,
    fontFamily: "Pretendard-Regular",
    lineHeight: 22,
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default HelpScreen;
