import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";

interface FeatureCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  const colors = useThemeColors();

  return (
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
          <MaterialCommunityIcons name={icon} size={24} color={colors.accent} />
        </View>
        <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
      </View>
      <Text
        style={[styles.featureDescription, { color: colors.textSecondary }]}
      >
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default FeatureCard;
