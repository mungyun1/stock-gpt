import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import ChatScreen from "./src/screens/ChatScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import MarketNewsScreen from "./src/screens/MarketNewsScreen";
import StockCategoryScreen from "./src/screens/StockRecommendationScreen";
import StockListScreen from "./src/screens/StockListScreen";
import { Ionicons } from "@expo/vector-icons";
// import { useFonts } from "expo-font";
import { View, ActivityIndicator, I18nManager, Platform } from "react-native";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeColors } from "./src/theme/colors";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();
const StockStack = createNativeStackNavigator();

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function StockStackNavigator() {
  return (
    <StockStack.Navigator screenOptions={{ headerShown: false }}>
      <StockStack.Screen name="StockCategory" component={StockCategoryScreen} />
      <StockStack.Screen name="StockList" component={StockListScreen} />
    </StockStack.Navigator>
  );
}

function TabNavigator() {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      initialRouteName="Chat"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Pretendard-SemiBold",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: "채팅",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MarketNews"
        component={MarketNewsScreen}
        options={{
          tabBarLabel: "뉴스",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: "캘린더",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StockStack"
        component={StockStackNavigator}
        options={{
          tabBarLabel: "종목 추천",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "더보기",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === "ios") {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
