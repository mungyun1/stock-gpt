import React from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme/colors";

interface SkeletonNewsCardProps {
  colors: ReturnType<typeof useThemeColors>;
}

export const SkeletonNewsCard = ({ colors }: SkeletonNewsCardProps) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.newsCard,
        {
          backgroundColor: colors.cardBackground,
          marginHorizontal: 16,
          marginBottom: 16,
        },
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          { marginVertical: 12, marginHorizontal: 12 },
        ]}
      >
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              borderRadius: 12,
              marginBottom: 6,
            },
            styles.skeleton,
            { opacity, backgroundColor: colors.border },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonDomain,
            styles.skeleton,
            { opacity, backgroundColor: colors.border },
          ]}
        />
      </View>
      <View style={[styles.newsContent, { flex: 1, padding: 12 }]}>
        <View>
          <Animated.View
            style={[
              styles.skeletonTitle,
              styles.skeleton,
              { opacity, backgroundColor: colors.border },
            ]}
          />
        </View>
        <View style={[styles.newsFooter, { marginTop: 8 }]}>
          <Animated.View
            style={[
              styles.skeletonTime,
              styles.skeleton,
              { opacity, backgroundColor: colors.border },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    width: 120,
    alignItems: "center",
  },
  newsContent: {
    justifyContent: "space-between",
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeleton: {
    borderRadius: 12,
  },
  skeletonTitle: {
    height: 44,
    width: "100%",
  },
  skeletonDomain: {
    height: 13,
    width: 80,
    marginTop: 4,
  },
  skeletonTime: {
    height: 12,
    width: 60,
  },
});
