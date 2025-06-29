import React, { useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme/colors";

interface SkeletonNewsCardProps {
  colors: ReturnType<typeof useThemeColors>;
}

export const SkeletonNewsCard = ({ colors }: SkeletonNewsCardProps) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
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
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* 썸네일 이미지 스켈레톤 */}
      <View style={styles.thumbnailContainer}>
        <Animated.View
          style={[
            styles.thumbnail,
            styles.skeleton,
            { opacity, backgroundColor: colors.border },
          ]}
        />
      </View>

      {/* 뉴스 콘텐츠 스켈레톤 */}
      <View style={styles.contentContainer}>
        {/* 제목 스켈레톤 */}
        <View>
          <Animated.View
            style={[
              styles.skeletonTitle,
              styles.skeleton,
              { opacity, backgroundColor: colors.border },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonTitleSecond,
              styles.skeleton,
              { opacity, backgroundColor: colors.border },
            ]}
          />
        </View>

        {/* 메타 정보 스켈레톤 */}
        <View style={styles.metaContainer}>
          <View style={styles.sourceTimeContainer}>
            <Animated.View
              style={[
                styles.skeletonSource,
                styles.skeleton,
                { opacity, backgroundColor: colors.border },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonDot,
                styles.skeleton,
                { opacity, backgroundColor: colors.border },
              ]}
            />
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
    </View>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 1,
    borderBottomWidth: 1,
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  sourceTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  skeleton: {
    borderRadius: 4,
  },
  skeletonTitle: {
    height: 22,
    width: "90%",
    marginBottom: 2,
  },
  skeletonTitleSecond: {
    height: 22,
    width: "70%",
    marginBottom: 8,
  },
  skeletonSource: {
    height: 13,
    width: 60,
  },
  skeletonDot: {
    height: 13,
    width: 4,
    marginHorizontal: 6,
  },
  skeletonTime: {
    height: 13,
    width: 50,
  },
});
