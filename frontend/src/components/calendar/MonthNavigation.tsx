import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useThemeColors } from "../../theme/colors";
import { canGoToPrevMonth, canGoToNextMonth } from "../../utils/calendarUtils";

interface MonthNavigationProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}) => {
  const colors = useThemeColors();
  const canGoPrev = canGoToPrevMonth(currentMonth);
  const canGoNext = canGoToNextMonth(currentMonth);

  return (
    <View style={styles.monthNav}>
      <TouchableOpacity
        style={[
          styles.monthButton,
          {
            backgroundColor: "transparent",
          },
        ]}
        onPress={onPrevMonth}
        disabled={!canGoPrev}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={canGoPrev ? colors.accent : colors.textSecondary}
        />
      </TouchableOpacity>

      <View style={styles.monthTextContainer}>
        <Text style={[styles.monthText, { color: colors.textPrimary }]}>
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.monthButton,
          {
            backgroundColor: "transparent",
          },
        ]}
        onPress={onNextMonth}
        disabled={!canGoNext}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={canGoNext ? colors.accent : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: "#F0F0F0",
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  monthTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  monthText: {
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: "600",
    letterSpacing: -0.5,
  },
});

export default MonthNavigation;
