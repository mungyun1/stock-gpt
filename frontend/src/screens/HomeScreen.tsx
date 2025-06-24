import React, { FC, ReactNode } from "react";
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
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import HeaderSection from "../components/HeaderSection";
import FeaturesModal from "../components/FeaturesModal";
import { RootStackParamList } from "../types/navigation";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

interface FeatureButtonProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconBgColor: string;
  isPrimary?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FeatureButton: FC<FeatureButtonProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  iconBgColor,
  isPrimary = false,
}) => {
  const colors = useThemeColors();
  const isPressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isPressed.value ? 0.95 : 1, {
            damping: 15,
            stiffness: 300,
          }),
        },
      ],
    };
  });

  return (
    <AnimatedPressable
      style={[
        styles.featureButton,
        isPrimary
          ? [styles.primaryButton, { backgroundColor: colors.accent }]
          : { backgroundColor: colors.cardBackground },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={() => {
        isPressed.value = true;
      }}
      onPressOut={() => {
        isPressed.value = false;
      }}
    >
      <View
        style={[
          styles.iconContainer,
          isPrimary
            ? styles.primaryIconContainer
            : { backgroundColor: iconBgColor },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.buttonTitle,
          isPrimary ? styles.primaryButtonTitle : { color: colors.textPrimary },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.buttonSubtitle,
          isPrimary && styles.primaryButtonSubtitle,
        ]}
      >
        {subtitle}
      </Text>
    </AnimatedPressable>
  );
};

const HomeScreen = () => {
  const colors = useThemeColors();
  const navigation = useNavigation<NavigationProp>();
  const { showModal, fadeAnim, openModal, closeModal } = useModalAnimation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.mainSection}>
          <HeaderSection />
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <FeatureButton
                icon={
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={32}
                    color="#FFFFFF"
                  />
                }
                title="주식 분석"
                subtitle="AI 기반 분석"
                onPress={() => navigation.navigate("Chat")}
                iconBgColor="#E3F2FD"
                isPrimary
              />
              <FeatureButton
                icon={<Ionicons name="calendar" size={28} color="#F57C00" />}
                title="캘린더"
                subtitle="일정 관리"
                onPress={() => navigation.navigate("Calendar")}
                iconBgColor="#FFF3E0"
              />
            </View>
            <View style={styles.gridRow}>
              <FeatureButton
                icon={
                  <FontAwesome5 name="newspaper" size={24} color="#388E3C" />
                }
                title="시장 동향"
                subtitle="섹터별 뉴스"
                onPress={() => navigation.navigate("MarketNews")}
                iconBgColor="#E8F5E8"
              />
              <FeatureButton
                icon={
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={28}
                    color="#7B1FA2"
                  />
                }
                title="주식 추천"
                subtitle="TOP5 종목"
                onPress={() => navigation.navigate("StockRecommendation")}
                iconBgColor="#F3E5F5"
              />
            </View>
          </View>
        </View>
      </View>

      <FeaturesModal
        visible={showModal}
        fadeAnim={fadeAnim}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  mainSection: {
    alignItems: "center",
    paddingVertical: 20,
    width: "100%",
  },
  gridContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 16,
  },
  gridRow: {
    flexDirection: "row",
    gap: 16,
  },
  featureButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    padding: 24,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 60,
    height: 60,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    textAlign: "center",
    lineHeight: 22,
  },
  primaryButtonTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 24,
  },
  buttonSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#999999",
    textAlign: "center",
    lineHeight: 18,
  },
  primaryButtonSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
  },
});

export default HomeScreen;
