import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StockRecommendation } from "../../utils/stockUtils";
import {
  formatFinancialMetric,
  getAnalystRatingText,
  getAnalystRatingColor,
  getWeek52PositionColor,
  calculateUpside,
} from "../../utils/stockUtils";
import { useThemeColors } from "../../theme/colors";

interface FinancialMetricsProps {
  stock: StockRecommendation;
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({ stock }) => {
  const colors = useThemeColors();

  const upside = calculateUpside(stock.current_price, stock.target_price);
  const week52Color = getWeek52PositionColor(stock.week_52_position);
  const ratingColor = getAnalystRatingColor(stock.analyst_rating);

  const MetricRow = ({
    label,
    value,
    type = "number",
    color,
    suffix,
  }: {
    label: string;
    value?: number | string;
    type?: "percentage" | "ratio" | "currency" | "number";
    color?: string;
    suffix?: string;
  }) => (
    <View style={styles.metricRow}>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[styles.metricValue, { color: color || colors.textPrimary }]}
      >
        {formatFinancialMetric(value, type)}
        {suffix || ""}
      </Text>
    </View>
  );

  const ProgressBar = ({
    percentage,
    color,
    label,
  }: {
    percentage?: number;
    color: string;
    label: string;
  }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.progressValue, { color }]}>
          {percentage ? `${percentage.toFixed(1)}%` : "N/A"}
        </Text>
      </View>
      <View
        style={[
          styles.progressTrack,
          { backgroundColor: colors.isDarkMode ? "#374151" : "#E5E7EB" },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: color,
              width: percentage ? `${Math.min(percentage, 100)}%` : "0%",
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      {/* 주요 지표 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          주요 지표
        </Text>
        <View style={styles.metricsList}>
          <MetricRow label="PER" value={stock.per_ratio} type="ratio" />
          <MetricRow label="PEG" value={stock.peg_ratio} type="ratio" />
          <MetricRow label="ROE" value={stock.roe} type="percentage" />
          <MetricRow
            label="부채비율"
            value={stock.debt_to_equity}
            type="ratio"
          />
          <MetricRow
            label="순이익률"
            value={stock.profit_margin}
            type="percentage"
          />
          <MetricRow
            label="매출성장률"
            value={stock.revenue_growth}
            type="percentage"
          />
        </View>
      </View>

      {/* 투자 지표 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          투자 지표
        </Text>
        <View style={styles.metricsList}>
          <MetricRow
            label="목표가"
            value={stock.target_price}
            type="currency"
          />
          <MetricRow
            label="상승여력"
            value={upside || undefined}
            type="percentage"
            color={upside && upside > 0 ? "#16A34A" : "#EF4444"}
          />
          <MetricRow
            label="애널리스트"
            value={getAnalystRatingText(stock.analyst_rating)}
            color={ratingColor}
          />
          <MetricRow
            label="배당수익률"
            value={stock.dividend_yield}
            type="percentage"
          />
        </View>
      </View>

      {/* 52주 위치 */}
      {stock.week_52_position && (
        <View style={styles.section}>
          <ProgressBar
            percentage={stock.week_52_position}
            color={week52Color}
            label="52주 위치"
          />
          <View style={styles.weekRangeContainer}>
            <Text
              style={[styles.weekRangeText, { color: colors.textSecondary }]}
            >
              최저: {formatFinancialMetric(stock.week_52_low, "currency")}
            </Text>
            <Text
              style={[styles.weekRangeText, { color: colors.textSecondary }]}
            >
              최고: {formatFinancialMetric(stock.week_52_high, "currency")}
            </Text>
          </View>
        </View>
      )}

      {/* 경쟁 우위 */}
      {stock.key_metrics?.competitive_advantages && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            경쟁 우위
          </Text>
          <View style={styles.tagsContainer}>
            {stock.key_metrics.competitive_advantages.map(
              (advantage, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: colors.isDarkMode
                        ? "#374151"
                        : "#F3F4F6",
                      borderColor: colors.primary + "20",
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {advantage}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      )}

      {/* 성장 동력 */}
      {stock.key_metrics?.growth_drivers && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            성장 동력
          </Text>
          <View style={styles.tagsContainer}>
            {stock.key_metrics.growth_drivers.map((driver, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: "#22C55E20",
                    borderColor: "#22C55E40",
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: "#16A34A" }]}>
                  {driver}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricRow: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
  },
  metricValue: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Pretendard-Medium",
  },
  progressValue: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  weekRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  weekRangeText: {
    fontSize: 12,
    fontFamily: "Pretendard-Regular",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
  },
  metricsList: {
    flexDirection: "column",
    gap: 10,
  },
});

export default FinancialMetrics;
