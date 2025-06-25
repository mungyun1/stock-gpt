import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme/colors";

const EmptyEvents: React.FC = () => {
  const colors = useThemeColors();

  return (
    <View style={styles.centerContainer}>
      <Text style={[styles.noEventsText, { color: colors.textSecondary }]}>
        이번 달 등록된 일정이 없습니다.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },
});

export default EmptyEvents;
