import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";
import FeatureCard from "./FeatureCard";

interface FeaturesModalProps {
  visible: boolean;
  fadeAnim: Animated.Value;
  onClose: () => void;
}

const FeaturesModal: React.FC<FeaturesModalProps> = ({
  visible,
  fadeAnim,
  onClose,
}) => {
  const colors = useThemeColors();

  const features = [
    {
      icon: "robot" as const,
      title: "AI 기반 분석",
      description:
        "GPT 기술을 활용한 맞춤형 주식 분석과 투자 전략을 제시해드립니다",
    },
    {
      icon: "calendar-clock" as const,
      title: "투자 일정 관리",
      description:
        "FOMC, GDP, CPI 등 주요 경제지표 발표 일정을 한눈에 확인하세요",
    },
    {
      icon: "chart-timeline-variant" as const,
      title: "실시간 시장 동향",
      description:
        "미국/한국 증시와 가상자산 시장의 최신 뉴스를 실시간으로 확인하세요",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
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
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                🛠️ 주요 기능
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
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
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default FeaturesModal;
