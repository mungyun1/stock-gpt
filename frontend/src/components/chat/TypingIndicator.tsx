import React from "react";
import { View, Animated, StyleSheet } from "react-native";
import { TypingAnimationProps } from "../../types/chat";

interface TypingIndicatorProps {
  typingDots: Animated.Value[];
  accentColor: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingDots,
  accentColor,
}) => {
  return (
    <View style={styles.typingContainer}>
      {typingDots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              backgroundColor: accentColor,
              opacity: dot,
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    paddingHorizontal: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
