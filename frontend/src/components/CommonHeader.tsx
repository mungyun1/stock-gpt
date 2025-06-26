import React, { FC } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, getFontWeight } from "../theme/colors";

interface CommonHeaderProps {
  title: string;
}

const CommonHeader: FC<CommonHeaderProps> = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.icon}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#0B4619", // 녹색 배경
  },
  safeArea: {
    backgroundColor: "#0B4619",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 12,
    tintColor: "white", // 아이콘을 하얀색으로
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily("bold"),
    fontWeight: getFontWeight("bold"),
    color: "white",
    flex: 1,
  },
});

export default CommonHeader;
