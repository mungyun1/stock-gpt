import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";

interface MoreButtonProps {
  onPress: () => void;
}

const MoreButton: React.FC<MoreButtonProps> = ({ onPress }) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.moreButton, { borderColor: colors.border }]}
      onPress={onPress}
    >
      <Text style={[styles.moreButtonText, { color: colors.textSecondary }]}>
        더 알아보기
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    fontFamily: "Pretendard-Regular",
  },
});

export default MoreButton;
