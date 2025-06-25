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
    <View style={[styles.monthNav, { backgroundColor: colors.cardBackground }]}>
      <TouchableOpacity
        style={[
          styles.monthButton,
          {
            backgroundColor: colors.background,
            opacity: canGoPrev ? 1 : 0.5,
          },
        ]}
        onPress={onPrevMonth}
        disabled={!canGoPrev}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.monthText, { color: colors.textPrimary }]}>
        {format(currentMonth, "yyyy년 M월", { locale: ko })}
      </Text>
      <TouchableOpacity
        style={[
          styles.monthButton,
          {
            backgroundColor: colors.background,
            opacity: canGoNext ? 1 : 0.5,
          },
        ]}
        onPress={onNextMonth}
        disabled={!canGoNext}
      >
        <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  monthText: {
    fontSize: 17,
    fontFamily: "Pretendard-SemiBold",
    marginHorizontal: 16,
  },
});

export default MonthNavigation;
