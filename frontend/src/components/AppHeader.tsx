import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showRefreshButton?: boolean;
  showCloseButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onRefreshPress?: () => void;
  onClosePress?: () => void;
  onTitlePress?: () => void;
  isRefreshing?: boolean;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  iconColor?: string;
  elevated?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showMenuButton = false,
  showRefreshButton = false,
  showCloseButton = false,
  onBackPress,
  onMenuPress,
  onRefreshPress,
  onClosePress,
  onTitlePress,
  isRefreshing = false,
  rightComponent,
  backgroundColor,
  titleColor,
  iconColor,
  elevated = true,
}) => {
  const colors = useThemeColors();

  const headerBackgroundColor = backgroundColor || colors.cardBackground;

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={headerBackgroundColor}
        translucent={false}
      />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: headerBackgroundColor }]}
        edges={["top"]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: headerBackgroundColor,
              borderBottomColor: elevated
                ? `${colors.border}40`
                : "transparent",
              borderBottomWidth: elevated ? 0.5 : 0,
            },
            elevated && styles.elevated,
          ]}
        >
          {/* Left Side */}
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                style={[styles.iconButton, styles.actionButton]}
                onPress={onBackPress}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={iconColor || colors.textPrimary}
                />
              </TouchableOpacity>
            )}
            {showMenuButton && (
              <TouchableOpacity
                style={[styles.iconButton, styles.actionButton]}
                onPress={onMenuPress}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="menu"
                  size={24}
                  color={iconColor || colors.textPrimary}
                />
              </TouchableOpacity>
            )}
            {showCloseButton && (
              <TouchableOpacity
                style={[styles.iconButton, styles.actionButton]}
                onPress={onClosePress}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={iconColor || colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Center */}
          <View style={styles.centerSection}>
            {onTitlePress ? (
              <TouchableOpacity
                onPress={onTitlePress}
                activeOpacity={0.7}
                style={styles.titleButton}
                hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
              >
                <Text
                  style={[
                    styles.title,
                    { color: titleColor || colors.textPrimary },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
                {subtitle && (
                  <Text
                    style={[styles.subtitle, { color: colors.textSecondary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {subtitle}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <Text
                  style={[
                    styles.title,
                    { color: titleColor || colors.textPrimary },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
                {subtitle && (
                  <Text
                    style={[styles.subtitle, { color: colors.textSecondary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {subtitle}
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Right Side */}
          <View style={styles.rightSection}>
            {rightComponent}
            {showRefreshButton && (
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  styles.actionButton,
                  isRefreshing && styles.refreshingButton,
                ]}
                onPress={onRefreshPress}
                disabled={isRefreshing}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh"
                  size={22}
                  color={
                    isRefreshing
                      ? colors.textSecondary
                      : iconColor || colors.textPrimary
                  }
                  style={[
                    styles.refreshIcon,
                    isRefreshing && styles.refreshing,
                  ]}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    zIndex: 1000,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: Platform.OS === "ios" ? 60 : 68,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "ios" ? 14 : 18,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 44,
    justifyContent: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    maxWidth: "70%",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 44,
    justifyContent: "flex-end",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  actionButton: {
    backgroundColor: "transparent",
  },
  refreshingButton: {
    opacity: 0.5,
  },
  refreshIcon: {},
  refreshing: {
    transform: [{ rotate: "180deg" }],
  },
  titleButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.6,
    textAlign: "center",
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
    textAlign: "center",
    opacity: 0.75,
    letterSpacing: -0.1,
    lineHeight: 16,
  },
});

export default AppHeader;
