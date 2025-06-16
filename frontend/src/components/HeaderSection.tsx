import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useThemeColors } from "../theme/colors";

interface HeaderSectionProps {
  marginTop?: number;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ marginTop = 48 }) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.headerContainer, { marginTop }]}>
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
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  header: {
    alignItems: "center",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
    marginBottom: 32,
  },
});

export default HeaderSection;
