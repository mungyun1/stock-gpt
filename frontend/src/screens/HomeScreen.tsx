import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../theme/colors";
import { useModalAnimation } from "../hooks/useModalAnimation";
import HeaderSection from "../components/HeaderSection";
import FeatureButtons from "../components/FeatureButtons";
import MoreButton from "../components/MoreButton";
import FeaturesModal from "../components/FeaturesModal";

const HomeScreen = () => {
  const colors = useThemeColors();
  const { showModal, fadeAnim, openModal, closeModal } = useModalAnimation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainSection}>
          <HeaderSection />
          <FeatureButtons />
          <MoreButton onPress={openModal} />
        </View>
      </ScrollView>

      <FeaturesModal
        visible={showModal}
        fadeAnim={fadeAnim}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    height: "100%",
  },
  mainSection: {
    alignItems: "center",
    paddingVertical: 32,
    width: "100%",
  },
});

export default HomeScreen;
