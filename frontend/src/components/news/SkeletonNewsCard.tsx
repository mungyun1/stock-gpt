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
    <View style={styles.newsCard}>
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
    marginHorizontal: 16,
    marginBottom: 1,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    gap: 8,
  },
  skeleton: {
    borderRadius: 4,
  },
  skeletonTitle: {
    height: 16,
    width: "90%",
    marginBottom: 6,
  },
  skeletonTitleSecond: {
    height: 16,
    width: "70%",
    marginBottom: 8,
  },
  skeletonSource: {
    height: 12,
    width: 60,
  },
  skeletonTime: {
    height: 12,
    width: 50,
  },
});
