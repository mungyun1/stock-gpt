import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";
import CommonHeader from "./CommonHeader";

interface InvestmentCalculatorProps {
  onBack: () => void;
}

const InvestmentCalculatorScreen: React.FC<InvestmentCalculatorProps> = ({
  onBack,
}) => {
  const colors = useThemeColors();
  const [calculatorType, setCalculatorType] = useState<"stock" | "bond">(
    "stock"
  );

  // 주식 계산기 상태
  const [stockInitialInvestment, setStockInitialInvestment] = useState("");
  const [stockFinalValue, setStockFinalValue] = useState("");
  const [stockInvestmentPeriod, setStockInvestmentPeriod] = useState("");
  const [stockDividends, setStockDividends] = useState("");
  const [stockResults, setStockResults] = useState<{
    totalReturn: number;
    totalReturnRate: number;
    annualizedReturn: number;
    totalProfit: number;
  } | null>(null);

  // 채권 계산기 상태
  const [bondFaceValue, setBondFaceValue] = useState("");
  const [bondPurchasePrice, setBondPurchasePrice] = useState("");
  const [bondCouponRate, setBondCouponRate] = useState("");
  const [bondMaturityYears, setBondMaturityYears] = useState("");
  const [bondResults, setBondResults] = useState<{
    yieldToMaturity: number;
    currentYield: number;
    totalReturn: number;
    annualCouponPayment: number;
  } | null>(null);

  const formatNumber = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDecimal = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts[1];
    }
    return numericValue;
  };

  const parseNumber = (value: string): number => {
    return Number(value.replace(/,/g, ""));
  };

  const calculateStockReturn = () => {
    const initial = parseNumber(stockInitialInvestment);
    const final = parseNumber(stockFinalValue);
    const period = parseNumber(stockInvestmentPeriod);
    const dividendAmount = parseNumber(stockDividends || "0");

    if (!initial || !final || !period) {
      Alert.alert("오류", "모든 필수 필드를 입력해주세요.");
      return;
    }

    if (initial <= 0 || final <= 0 || period <= 0) {
      Alert.alert("오류", "모든 값은 0보다 커야 합니다.");
      return;
    }

    // 총 수익률 계산
    const totalProfit = final - initial + dividendAmount;
    const totalReturnRate = (totalProfit / initial) * 100;

    // 연평균 수익률 계산 (복리)
    const annualizedReturn = (Math.pow(final / initial, 1 / period) - 1) * 100;

    setStockResults({
      totalReturn: final + dividendAmount,
      totalReturnRate,
      annualizedReturn,
      totalProfit,
    });
  };

  const calculateBondReturn = () => {
    const faceValue = parseNumber(bondFaceValue);
    const purchasePrice = parseNumber(bondPurchasePrice);
    const couponRate = parseNumber(bondCouponRate);
    const maturityYears = parseNumber(bondMaturityYears);

    if (!faceValue || !purchasePrice || !couponRate || !maturityYears) {
      Alert.alert("오류", "모든 필수 필드를 입력해주세요.");
      return;
    }

    if (
      faceValue <= 0 ||
      purchasePrice <= 0 ||
      couponRate < 0 ||
      maturityYears <= 0
    ) {
      Alert.alert("오류", "올바른 값을 입력해주세요.");
      return;
    }

    // 연간 쿠폰 지급액
    const annualCouponPayment = (faceValue * couponRate) / 100;

    // 현재 수익률 (Current Yield)
    const currentYield = (annualCouponPayment / purchasePrice) * 100;

    // 만기수익률 (YTM) 근사 계산
    const totalCouponPayments = annualCouponPayment * maturityYears;
    const capitalGain = faceValue - purchasePrice;
    const totalReturn = totalCouponPayments + capitalGain;
    const yieldToMaturity =
      (totalReturn / (purchasePrice * maturityYears)) * 100;

    setBondResults({
      yieldToMaturity,
      currentYield,
      totalReturn,
      annualCouponPayment,
    });
  };

  const resetCalculator = () => {
    if (calculatorType === "stock") {
      setStockInitialInvestment("");
      setStockFinalValue("");
      setStockInvestmentPeriod("");
      setStockDividends("");
      setStockResults(null);
    } else {
      setBondFaceValue("");
      setBondPurchasePrice("");
      setBondCouponRate("");
      setBondMaturityYears("");
      setBondResults(null);
    }
  };

  const renderStockCalculator = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          초기 투자금액 (원) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={stockInitialInvestment}
          onChangeText={(text) => setStockInitialInvestment(formatNumber(text))}
          placeholder="예: 1,000,000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          최종 평가금액 (원) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={stockFinalValue}
          onChangeText={(text) => setStockFinalValue(formatNumber(text))}
          placeholder="예: 1,200,000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          투자 기간 (년) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={stockInvestmentPeriod}
          onChangeText={(text) => setStockInvestmentPeriod(formatNumber(text))}
          placeholder="예: 2"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          배당금 총액 (원)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={stockDividends}
          onChangeText={(text) => setStockDividends(formatNumber(text))}
          placeholder="예: 50,000 (선택사항)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: colors.accent }]}
          onPress={calculateStockReturn}
        >
          <Text style={styles.calculateButtonText}>수익률 계산</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={resetCalculator}
        >
          <Text style={[styles.resetButtonText, { color: colors.textPrimary }]}>
            초기화
          </Text>
        </TouchableOpacity>
      </View>

      {stockResults && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            계산 결과
          </Text>

          <View
            style={[
              styles.resultCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                총 수익금
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color:
                      stockResults.totalProfit >= 0 ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                {stockResults.totalProfit >= 0 ? "+" : ""}
                {stockResults.totalProfit.toLocaleString()}원
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                총 수익률
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color:
                      stockResults.totalReturnRate >= 0 ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                {stockResults.totalReturnRate >= 0 ? "+" : ""}
                {stockResults.totalReturnRate.toFixed(2)}%
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                연평균 수익률
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color:
                      stockResults.annualizedReturn >= 0
                        ? "#4CAF50"
                        : "#F44336",
                  },
                ]}
              >
                {stockResults.annualizedReturn >= 0 ? "+" : ""}
                {stockResults.annualizedReturn.toFixed(2)}%
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                최종 총액
              </Text>
              <Text style={[styles.resultValue, { color: colors.textPrimary }]}>
                {stockResults.totalReturn.toLocaleString()}원
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <MaterialIcons
              name="info-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              연평균 수익률은 복리 기준으로 계산됩니다. 배당금은 총 수익에
              포함되며, 세금은 고려되지 않습니다.
            </Text>
          </View>
        </View>
      )}
    </>
  );

  const renderBondCalculator = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          액면가 (원) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={bondFaceValue}
          onChangeText={(text) => setBondFaceValue(formatNumber(text))}
          placeholder="예: 10,000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          매입가격 (원) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={bondPurchasePrice}
          onChangeText={(text) => setBondPurchasePrice(formatNumber(text))}
          placeholder="예: 9,500"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          연 쿠폰 이자율 (%) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={bondCouponRate}
          onChangeText={(text) => setBondCouponRate(formatDecimal(text))}
          placeholder="예: 3.5"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          만기까지 기간 (년) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          value={bondMaturityYears}
          onChangeText={(text) => setBondMaturityYears(formatNumber(text))}
          placeholder="예: 5"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: colors.accent }]}
          onPress={calculateBondReturn}
        >
          <Text style={styles.calculateButtonText}>수익률 계산</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={resetCalculator}
        >
          <Text style={[styles.resetButtonText, { color: colors.textPrimary }]}>
            초기화
          </Text>
        </TouchableOpacity>
      </View>

      {bondResults && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            계산 결과
          </Text>

          <View
            style={[
              styles.resultCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                만기수익률 (YTM)
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color:
                      bondResults.yieldToMaturity >= 0 ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                {bondResults.yieldToMaturity.toFixed(2)}%
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                현재수익률
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color:
                      bondResults.currentYield >= 0 ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                {bondResults.currentYield.toFixed(2)}%
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                연간 쿠폰 지급액
              </Text>
              <Text style={[styles.resultValue, { color: colors.textPrimary }]}>
                {bondResults.annualCouponPayment.toLocaleString()}원
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text
                style={[styles.resultLabel, { color: colors.textSecondary }]}
              >
                만기까지 총 수익
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color: bondResults.totalReturn >= 0 ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                {bondResults.totalReturn >= 0 ? "+" : ""}
                {bondResults.totalReturn.toLocaleString()}원
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <MaterialIcons
              name="info-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              만기수익률은 근사값으로 계산됩니다. 실제 YTM은 복잡한 수식으로
              정확히 계산해야 합니다.
            </Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="투자 수익률 계산기" />
      <SafeAreaView
        style={[styles.safeAreaContent, { backgroundColor: colors.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[
              styles.backButtonContainer,
              { borderBottomColor: colors.border },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#9E9E9E" />
            <Text style={[styles.backText, { color: "#9E9E9E" }]}>
              뒤로가기
            </Text>
          </TouchableOpacity>

          {/* 계산기 타입 선택 */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                calculatorType === "stock" && {
                  backgroundColor: colors.accent,
                },
                { borderColor: colors.accent },
              ]}
              onPress={() => setCalculatorType("stock")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  calculatorType === "stock"
                    ? { color: "#FFFFFF" }
                    : { color: colors.accent },
                ]}
              >
                주식 수익률
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                calculatorType === "bond" && { backgroundColor: colors.accent },
                { borderColor: colors.accent },
              ]}
              onPress={() => setCalculatorType("bond")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  calculatorType === "bond"
                    ? { color: "#FFFFFF" }
                    : { color: colors.accent },
                ]}
              >
                채권 수익률
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {calculatorType === "stock"
                ? "주식 투자 정보 입력"
                : "채권 투자 정보 입력"}
            </Text>

            {calculatorType === "stock"
              ? renderStockCalculator()
              : renderBondCalculator()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  backText: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
    marginLeft: 8,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  calculateButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default InvestmentCalculatorScreen;
