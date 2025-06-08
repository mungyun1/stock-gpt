import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeColors } from "../theme/colors";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 섹션 */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Stock GPT
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              AI 주식 투자 어드바이저
            </Text>
          </View>
        </View>

        {/* 기능 버튼 섹션 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate("Chat")}
          >
            <MaterialCommunityIcons name="chart-line" size={24} color="white" />
            <Text style={styles.primaryButtonText}>주식 분석하기</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Ionicons name="briefcase" size={24} color={colors.accent} />
              <Text
                style={[styles.secondaryButtonText, { color: colors.accent }]}
              >
                포트폴리오
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <FontAwesome5 name="globe" size={24} color={colors.accent} />
              <Text
                style={[styles.secondaryButtonText, { color: colors.accent }]}
              >
                시장 동향
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View
            style={[
              styles.featureCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.featureHeader}>
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <MaterialCommunityIcons
                  name="robot"
                  size={24}
                  color={colors.accent}
                />
              </View>
              <Text
                style={[styles.featureTitle, { color: colors.textPrimary }]}
              >
                AI 기반 분석
              </Text>
            </View>
            <Text
              style={[
                styles.featureDescription,
                { color: colors.textSecondary },
              ]}
            >
              실시간 데이터와 AI 기술을 활용한 정확한 투자 분석
            </Text>
          </View>

          <View
            style={[
              styles.featureCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.featureHeader}>
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <MaterialCommunityIcons
                  name="chart-multiple"
                  size={24}
                  color={colors.accent}
                />
              </View>
              <Text
                style={[styles.featureTitle, { color: colors.textPrimary }]}
              >
                맞춤형 전략
              </Text>
            </View>
            <Text
              style={[
                styles.featureDescription,
                { color: colors.textSecondary },
              ]}
            >
              개인 맞춤형 포트폴리오 구성 및 투자 전략 제시
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Stock GPT와 투자해요📊
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 40,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    opacity: 0.8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "white",
  },
  secondaryButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.1)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 16,
  },
  featureCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.1)",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  featureDescription: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default HomeScreen;
