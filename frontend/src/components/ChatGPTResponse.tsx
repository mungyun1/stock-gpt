import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useThemeColors } from "../theme/colors";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
  content: string;
  isLoading?: boolean;
}

const ChatGPTResponse: React.FC<Props> = ({ content, isLoading }) => {
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      <MarkdownRenderer content={content} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default ChatGPTResponse;
