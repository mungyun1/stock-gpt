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
          <Ionicons name="calendar" size={24} color={colors.accent} />
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
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
          <FontAwesome5 name="newspaper" size={24} color={colors.accent} />
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            시장 동향
          </Text>
        </TouchableOpacity>
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
});

export default FeatureButtons;
