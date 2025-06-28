import { useRef, useCallback } from "react";
import { Animated, Keyboard, Dimensions } from "react-native";

const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.75;

export const useSidebar = () => {
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  const openSidebar = useCallback(() => {
    Keyboard.dismiss();

    Animated.parallel([
      Animated.spring(sidebarAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sidebarAnimation, overlayAnimation]);

  const closeSidebar = useCallback(() => {
    Animated.parallel([
      Animated.spring(sidebarAnimation, {
        toValue: -SIDEBAR_WIDTH,
        useNativeDriver: true,
        tension: 70,
        friction: 9,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sidebarAnimation, overlayAnimation]);

  const toggleSidebar = useCallback(
    (isOpen: boolean, onToggle?: (newState: boolean) => void) => {
      const newSidebarState = !isOpen;

      if (newSidebarState) {
        openSidebar();
      } else {
        closeSidebar();
      }

      onToggle?.(newSidebarState);
    },
    [openSidebar, closeSidebar]
  );

  return {
    sidebarAnimation,
    overlayAnimation,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    SIDEBAR_WIDTH,
  };
};
