import React, { FC, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors, useTheme } from "../theme/colors";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import CommonHeader from "../components/CommonHeader";

interface SettingsScreenProps {
  onBack: () => void;
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  type: "toggle" | "action";
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingItem: FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  type,
  value,
  onValueChange,
  onPress,
}) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.cardBackground }]}
      onPress={type === "action" ? onPress : undefined}
      activeOpacity={type === "action" ? 0.7 : 1}
    >
      <View style={styles.settingItemContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.settingSubtitle, { color: colors.textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {type === "toggle" && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.textSecondary, true: "#4CAF50" }}
            thumbColor="#ffffff"
          />
        )}
        {type === "action" && (
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

const SettingsScreen: FC<SettingsScreenProps> = ({ onBack }) => {
  const colors = useThemeColors();
  const { themeMode, isDarkMode, setThemeMode } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(false);

  const handleDarkModeToggle = (value: boolean) => {
    setThemeMode(value ? "dark" : "light");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="설정" />
      <SafeAreaView
        style={[styles.safeAreaContent, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
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

          {/* 알림 설정 */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              알림 설정
            </Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={
                  <MaterialIcons
                    name="notifications"
                    size={24}
                    color="#FFC107"
                  />
                }
                title="푸시 알림"
                subtitle="전체 알림 수신 여부"
                type="toggle"
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
              <SettingItem
                icon={
                  <MaterialIcons name="trending-up" size={24} color="#2196F3" />
                }
                title="주가 알림"
                subtitle="관심 종목 가격 변동 알림"
                type="toggle"
                value={priceAlerts}
                onValueChange={setPriceAlerts}
              />
              <SettingItem
                icon={
                  <MaterialIcons name="article" size={24} color="#4CAF50" />
                }
                title="뉴스 알림"
                subtitle="중요 경제 뉴스 알림"
                type="toggle"
                value={newsAlerts}
                onValueChange={setNewsAlerts}
              />
            </View>
          </View>

          {/* 화면 설정 */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              화면 설정
            </Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={
                  <MaterialIcons name="dark-mode" size={24} color="#9E9E9E" />
                }
                title="다크모드"
                subtitle="어두운 테마 사용"
                type="toggle"
                value={isDarkMode}
                onValueChange={handleDarkModeToggle}
              />
              <SettingItem
                icon={
                  <MaterialIcons
                    name="font-download"
                    size={24}
                    color="#FF9800"
                  />
                }
                title="글자 크기"
                subtitle="앱 내 글자 크기 조정"
                type="action"
                onPress={() => {}}
              />
            </View>
          </View>

          {/* 계정 설정 */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              계정 설정
            </Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={<MaterialIcons name="person" size={24} color="#9C27B0" />}
                title="프로필 관리"
                subtitle="개인 정보 수정"
                type="action"
                onPress={() => {}}
              />
              <SettingItem
                icon={
                  <MaterialIcons name="security" size={24} color="#FF5722" />
                }
                title="보안 설정"
                subtitle="비밀번호 및 인증 설정"
                type="action"
                onPress={() => {}}
              />
              <SettingItem
                icon={<MaterialIcons name="backup" size={24} color="#607D8B" />}
                title="데이터 백업"
                subtitle="설정 및 관심 종목 백업"
                type="action"
                onPress={() => {}}
              />
            </View>
          </View>

          {/* 기타 */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              기타
            </Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={
                  <MaterialIcons name="privacy-tip" size={24} color="#795548" />
                }
                title="개인정보 처리방침"
                type="action"
                onPress={() => {}}
              />
              <SettingItem
                icon={
                  <MaterialIcons name="description" size={24} color="#795548" />
                }
                title="서비스 이용약관"
                type="action"
                onPress={() => {}}
              />
              <SettingItem
                icon={<MaterialIcons name="logout" size={24} color="#F44336" />}
                title="로그아웃"
                type="action"
                onPress={() => {}}
              />
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
  safeAreaContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    gap: 2,
  },
  settingItem: {
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
  settingItemContent: {
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
  settingTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: "Pretendard-Regular",
    lineHeight: 20,
  },
});

export default SettingsScreen;
