import React, { FC } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useThemeColors } from "../theme/colors";

interface HeaderSectionProps {
  marginTop?: number;
}

const HeaderSection: FC<HeaderSectionProps> = () => {
  const colors = useThemeColors();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.taglineContainer}>
          <Text
            style={[
              styles.mainTagline,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            나만의 투자 도우미
          </Text>
          <View
            style={[styles.underline, { backgroundColor: colors.accent }]}
          />

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Stock GPT와 함께하는 투자
          </Text>

          <View style={styles.featureContainer}>
            <View style={styles.featureBadge}>
              <Text style={styles.badgeEmoji}>🤖</Text>
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>
                AI 분석
              </Text>
            </View>

            <View style={styles.featureBadge}>
              <Text style={styles.badgeEmoji}>🎯</Text>
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>
                맞춤형
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 28,
    width: "100%",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    width: "100%",
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 280,
    height: 140,
    resizeMode: "contain",
  },
  taglineContainer: {
    alignItems: "center",
    width: "100%",
  },
  mainTagline: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -1,
  },
  underline: {
    height: 4,
    width: 80,
    borderRadius: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    opacity: 0.75,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  featureContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.15)",
  },
  badgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});

export default HeaderSection;
