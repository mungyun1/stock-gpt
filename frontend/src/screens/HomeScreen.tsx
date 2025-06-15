import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Pressable,
  Image,
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
  Calendar: undefined;
  MarketNews: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [showFeatures, setShowFeatures] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setShowFeatures(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowFeatures(false);
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainSection}>
          {/* 헤더 섹션 */}
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <Image
                source={require("../../assets/logo.png")}
                style={{
                  width: 240,
                  height: 120,
                  resizeMode: "contain",
                }}
              />
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    fontSize: 20,
                    marginBottom: 32,
                    opacity: 0.7,
                  },
                ]}
              >
                투자 조언을 받아보세요!
              </Text>
            </View>
          </View>

          {/* 기능 버튼 섹션 */}
          <View
            style={[
              styles.buttonContainer,
              {
                backgroundColor: colors.cardBackground,
                borderRadius: 20,
                marginHorizontal: 24,
                padding: 24,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.accent }]}
              onPress={() => navigation.navigate("Chat")}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color="white"
              />
              <Text style={styles.primaryButtonText}>주식 분석하기</Text>
            </TouchableOpacity>

            <View style={styles.secondaryButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => navigation.navigate("Calendar")}
              >
                <Ionicons name="calendar" size={24} color={colors.accent} />
                <Text
                  style={[styles.secondaryButtonText, { color: colors.accent }]}
                >
                  캘린더
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => navigation.navigate("MarketNews")}
              >
                <FontAwesome5
                  name="newspaper"
                  size={24}
                  color={colors.accent}
                />
                <Text
                  style={[styles.secondaryButtonText, { color: colors.accent }]}
                >
                  시장 동향
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 더 알아보기 버튼 */}
          <TouchableOpacity
            style={[styles.moreButton, { borderColor: colors.border }]}
            onPress={openModal}
          >
            <Text
              style={[styles.moreButtonText, { color: colors.textSecondary }]}
            >
              더 알아보기
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 기능 설명 모달 */}
      <Modal
        visible={showFeatures}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                backgroundColor: colors.cardBackground,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  {
                    backgroundColor: colors.cardBackground,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.modalTitle, { color: colors.textPrimary }]}
                >
                  🛠️ 주요 기능
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={[
                  styles.modalScroll,
                  { backgroundColor: colors.cardBackground },
                ]}
                contentContainerStyle={styles.featuresContainer}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
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
                      style={[
                        styles.featureTitle,
                        { color: colors.textPrimary },
                      ]}
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
                    GPT 기술을 활용한 맞춤형 주식 분석과 투자 전략을
                    제시해드립니다
                  </Text>
                </View>

                <View
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
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
                        name="calendar-clock"
                        size={24}
                        color={colors.accent}
                      />
                    </View>
                    <Text
                      style={[
                        styles.featureTitle,
                        { color: colors.textPrimary },
                      ]}
                    >
                      투자 일정 관리
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.featureDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    FOMC, GDP, CPI 등 주요 경제지표 발표 일정을 한눈에
                    확인하세요
                  </Text>
                </View>

                <View
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
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
                        name="chart-timeline-variant"
                        size={24}
                        color={colors.accent}
                      />
                    </View>
                    <Text
                      style={[
                        styles.featureTitle,
                        { color: colors.textPrimary },
                      ]}
                    >
                      실시간 시장 동향
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.featureDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    미국/한국 증시와 가상자산 시장의 최신 뉴스를 실시간으로
                    확인하세요
                  </Text>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    height: "100%",
  },
  mainSection: {
    alignItems: "center",
    paddingVertical: 32,
    width: "100%",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 48,
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
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "92%",
    maxWidth: 500,
    padding: 32,
    marginHorizontal: 0,
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
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 8,
  },
  moreButtonText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
  },
  modalContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.1)",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
  },
  modalScroll: {
    flexGrow: 1,
  },
  featuresContainer: {
    padding: 24,
    paddingTop: 16,
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.1)",
    backgroundColor: "white",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  featureDescription: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    opacity: 0.8,
  },
});

export default HomeScreen;
