import React, { FC } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../theme/colors";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import CommonHeader from "./CommonHeader";

interface AppInfoScreenProps {
  onBack: () => void;
}

interface InfoItemProps {
  label: string;
  value: string;
  showDivider?: boolean;
}

const InfoItem: FC<InfoItemProps> = ({ label, value, showDivider = true }) => {
  const colors = useThemeColors();

  return (
    <View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
      </View>
      {showDivider && (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      )}
    </View>
  );
};

const AppInfoScreen: FC<AppInfoScreenProps> = ({ onBack }) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="앱정보" />

      <SafeAreaView
        style={[styles.safeAreaContent, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
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

          {/* App Logo and Name */}
          <View style={styles.logoSection}>
            <Image
              source={require("../../assets/icon.png")}
              style={[styles.appIcon, { tintColor: colors.textPrimary }]}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: colors.textPrimary }]}>
              Stalk
            </Text>
            <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
              AI 기반 주식 투자 도우미
            </Text>
          </View>

          {/* App Information */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <InfoItem label="버전" value="1.0.0" />
            <InfoItem label="빌드" value="2024.01.01" />
            <InfoItem label="개발자" value="Mungyun Park" />
            <InfoItem label="라이선스" value="MIT License" />
            <InfoItem
              label="지원 OS"
              value="iOS 14.0+, Android 8.0+"
              showDivider={false}
            />
          </View>

          {/* Description */}
          <View
            style={[
              styles.descriptionCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text
              style={[styles.descriptionTitle, { color: colors.textPrimary }]}
            >
              앱 소개
            </Text>
            <Text
              style={[styles.descriptionText, { color: colors.textSecondary }]}
            >
              Stalk는 인공지능 기술을 활용하여 개인 투자자들에게 맞춤형 주식
              분석과 투자 가이드를 제공하는 앱입니다. 실시간 시장 데이터와 AI
              분석을 통해 더 나은 투자 결정을 도와드립니다.
            </Text>
          </View>

          {/* Features */}
          <View
            style={[
              styles.featuresCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.featuresTitle, { color: colors.textPrimary }]}>
              주요 기능
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text
                  style={[styles.featureText, { color: colors.textSecondary }]}
                >
                  AI 기반 주식 분석 및 상담
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text
                  style={[styles.featureText, { color: colors.textSecondary }]}
                >
                  실시간 시장 뉴스 및 정보
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text
                  style={[styles.featureText, { color: colors.textSecondary }]}
                >
                  투자 캘린더 및 일정 관리
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text
                  style={[styles.featureText, { color: colors.textSecondary }]}
                >
                  개인 맞춤형 주식 추천
                </Text>
              </View>
            </View>
          </View>

          {/* Contact */}
          <View
            style={[
              styles.contactCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>
              문의하기
            </Text>
            <TouchableOpacity style={styles.contactItem}>
              <MaterialIcons name="email" size={24} color="#2196F3" />
              <Text style={[styles.contactText, { color: colors.textPrimary }]}>
                mungyun1234@naver.com
              </Text>
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.copyrightSection}>
            <Text
              style={[styles.copyrightText, { color: colors.textSecondary }]}
            >
              © 2025 Mungyun Park. All rights reserved.
            </Text>
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
  safeAreaContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 16,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Pretendard-Bold",
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  descriptionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: "Pretendard-Regular",
    lineHeight: 24,
  },
  featuresCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Pretendard-Regular",
    flex: 1,
  },
  contactCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
  },
  copyrightSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  copyrightText: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },
});

export default AppInfoScreen;
