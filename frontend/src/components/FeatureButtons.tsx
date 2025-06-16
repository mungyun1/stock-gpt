import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";
import { RootStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const FeatureButtons: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();

  return (
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
        <MaterialCommunityIcons name="chart-line" size={24} color="white" />
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
          <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="calendar" size={20} color="#1976D2" />
          </View>
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            캘린더
          </Text>
          <Text style={styles.buttonSubtext}>일정 관리</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.background },
          ]}
          onPress={() => navigation.navigate("MarketNews")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
            <FontAwesome5 name="newspaper" size={18} color="#F57C00" />
          </View>
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            시장 동향
          </Text>
          <Text style={styles.buttonSubtext}>뉴스 & 분석</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryButtonsRow}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.background },
          ]}
          onPress={() => navigation.navigate("StockRecommendation")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#E8F5E8" }]}>
            <MaterialCommunityIcons
              name="trending-up"
              size={20}
              color="#388E3C"
            />
          </View>
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            주식 추천
          </Text>
          <Text style={styles.buttonSubtext}>TOP5 종목</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
            <Ionicons name="settings-outline" size={20} color="#7B1FA2" />
          </View>
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            설정
          </Text>
          <Text style={styles.buttonSubtext}>앱 설정</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.1)",
    minHeight: 100,
    justifyContent: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#999999",
    textAlign: "center",
  },
});

export default FeatureButtons;
