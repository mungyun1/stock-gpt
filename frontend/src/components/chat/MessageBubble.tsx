import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { MessageBubbleProps } from "../../types/chat";
import { TypingIndicator } from "./TypingIndicator";

interface ExtendedMessageBubbleProps extends MessageBubbleProps {
  typingDots?: any[];
  messageOpacity?: Animated.Value;
  interpolatedColor?: Animated.AnimatedInterpolation<string | number>;
  thinkingMessages?: string[];
}

export const MessageBubble: React.FC<ExtendedMessageBubbleProps> = ({
  message,
  isUser,
  colors,
  onRetry,
  typingDots,
  messageOpacity,
  interpolatedColor,
  thinkingMessages = [],
}) => {
  // 마크다운 스타일 설정
  const markdownStyles = {
    body: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "Pretendard-Regular",
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontFamily: "Pretendard-Bold",
      marginVertical: 16,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    heading2: {
      fontSize: 20,
      fontFamily: "Pretendard-SemiBold",
      marginVertical: 12,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    heading3: {
      fontSize: 18,
      fontFamily: "Pretendard-SemiBold",
      marginVertical: 10,
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    paragraph: {
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: `${colors.accent}08`,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginVertical: 8,
      borderRadius: 4,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      marginVertical: 4,
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
    },
    table: {
      borderWidth: 1,
      borderColor: `${colors.border}50`,
      borderRadius: 12,
      marginVertical: 12,
      overflow: "hidden" as const,
      backgroundColor: colors.cardBackground,
    },
    thead: {
      backgroundColor: `${colors.accent}10`,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.border}50`,
    },
    tr: {
      flexDirection: "row" as const,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.border}30`,
    },
    th: {
      flex: 1,
      padding: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    td: {
      flex: 1,
      padding: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    strong: {
      fontFamily: "Pretendard-SemiBold",
      color: colors.accent,
    },
    em: {
      fontStyle: "italic" as const,
    },
    hr: {
      backgroundColor: `${colors.border}50`,
      height: 1,
      marginVertical: 16,
    },
    link: {
      color: colors.accent,
      textDecorationLine: "underline" as const,
    },
    image: {
      borderRadius: 12,
      marginVertical: 8,
    },
  };

  const renderMessageContent = () => {
    if (message.id === "typing" && typingDots) {
      return (
        <TypingIndicator typingDots={typingDots} accentColor={colors.accent} />
      );
    }

    if (
      (message.isThinking || thinkingMessages.includes(message.text)) &&
      messageOpacity &&
      interpolatedColor
    ) {
      return (
        <Animated.Text
          style={[
            styles.messageText,
            {
              opacity: messageOpacity,
              color: interpolatedColor,
            },
          ]}
        >
          {message.text}
        </Animated.Text>
      );
    }

    if (isUser) {
      return (
        <Text style={[styles.messageText, { color: "#FFFFFF" }]}>
          {message.text}
        </Text>
      );
    }

    return (
      <Markdown
        style={markdownStyles}
        onLinkPress={(url: string) => {
          Linking.openURL(url);
          return false;
        }}
      >
        {message.text}
      </Markdown>
    );
  };

  return (
    <View
      style={[
        styles.messageWrapper,
        isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
      ]}
    >
      <View
        style={[
          styles.messageContainer,
          isUser
            ? [styles.userMessage, { backgroundColor: colors.accent }]
            : [
                styles.aiMessage,
                {
                  borderTopWidth: 0.5,
                  borderBottomWidth: 0.5,
                  borderColor: `${colors.border}50`,
                },
              ],
        ]}
      >
        {!isUser && (
          <View style={styles.aiMessageHeader}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: `${colors.accent}08` },
              ]}
            >
              <Ionicons
                name="terminal-outline"
                size={14}
                color={colors.accent}
                style={{ opacity: 0.8 }}
              />
            </View>
            <Text style={[styles.aiLabel, { color: colors.textSecondary }]}>
              Stock GPT
            </Text>
          </View>
        )}

        {renderMessageContent()}

        {message.error && onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => onRetry(message.id)}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginVertical: 12,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
    paddingLeft: "15%",
    marginVertical: 8,
  },
  aiMessageWrapper: {
    width: "100%",
    marginVertical: 0,
  },
  messageContainer: {
    width: "100%",
  },
  userMessage: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    padding: 12,
  },
  aiMessageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 4,
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  aiLabel: {
    fontSize: 13,
    fontFamily: "Pretendard-SemiBold",
    opacity: 0.5,
    letterSpacing: -0.3,
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Pretendard-Regular",
    lineHeight: 24,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.5,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
  },
});
