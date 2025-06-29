import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface ChatHeaderProps {
  colors: any;
  onToggleSidebar: () => void;
  onCreateNewThread: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  colors,
  onToggleSidebar,
  onCreateNewThread,
}) => {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: colors.cardBackground }}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.sidebarToggleButton}
          onPress={onToggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/title.png")}
          style={[styles.headerTitle, { tintColor: colors.textPrimary }]}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={[
            styles.newChatHeaderButton,
            { backgroundColor: `${colors.accent}08` },
          ]}
          onPress={onCreateNewThread}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 62,
    borderBottomWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarToggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    height: 24,
    alignSelf: "center",
  },
  newChatHeaderButton: {
    padding: 8,
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
