import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { RangeKey } from "../constants/picker";

interface DataPoint {
  deviceID: string;
  co2: string;
  pressure: string;
  humidity: string;
  temperature: string;
  battery: number;
  ts: number;
}

interface SensorChartProps {
  range: RangeKey;
  data: DataPoint[];
  NORMAL_MIN: number;
  NORMAL_MAX: number;
  name: string;
  unit: string;
  fieldName: 'co2' | 'temperature' | 'humidity' | 'pressure';
}

const localDayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getWeekBounds = (d: Date) => {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // Sunday start
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
};

export function SensorChart({
  range,
  data,
  NORMAL_MIN,
  NORMAL_MAX,
  name,
  unit,
  fieldName,
}: SensorChartProps) {
  const chartData = useMemo(() => {
    if (range === "day") {
      // Last 24 hours - only show hours that have passed or have data
      const hourlyData = new Map<number, number[]>();
      const now = new Date();
      const currentHour = now.getHours();

      type HourAgg = { sum: number; count: number; hadOut: boolean };
      const hourly = new Map<number, HourAgg>();

      data.forEach((item) => {
        const date = new Date(item.ts);
        const hour = date.getHours();
        const v = Number(item[fieldName]);
        if (!Number.isFinite(v)) return;

        const out = v < NORMAL_MIN || v > NORMAL_MAX;

        const prev = hourly.get(hour) ?? { sum: 0, count: 0, hadOut: false };
        hourly.set(hour, {
          sum: prev.sum + v,
          count: prev.count + 1,
          hadOut: prev.hadOut || out,
        });
      });


      const bars: {
        value: number;
        label: string;
        frontColor: string;
        spacing: number;
      }[] = [];

      // Only show up to current hour + 1
      for (let h = 0; h <= currentHour; h++) {
        const values = hourlyData.get(h) || [];
        const agg = hourly.get(h);
        const avg = agg && agg.count ? agg.sum / agg.count : 0;
        const isOutOfRange = agg ? agg.hadOut : false;

        bars.push({
          value: avg,
          label: `${h}h`,
          frontColor: isOutOfRange ? "#51d6f7" : "#006DFF",
          spacing: 2,
        });
      }

      const maxVal = Math.max(...bars.map((b) => b.value), NORMAL_MAX);
      const padded = maxVal * 1.2;

      return {
        bars,
        maxValue: padded,
        xAxisLabel: "Hour of Day",
      };
    } else if (range === "week") {
      // Last 7 days - show daily averages
      const dailyData = new Map<string, { values: number[]; date: Date }>();

      data.forEach((item) => {
        const date = new Date(item.ts);
        const dayKey = localDayKey(date);
        const v = Number(item[fieldName]);
        if (!Number.isFinite(v)) return;

        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, { values: [], date });
        }
        dailyData.get(dayKey)!.values.push(v);
      });

      const bars = Array.from(dailyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, { values, date }]) => {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const isOutOfRange = avg < NORMAL_MIN || avg > NORMAL_MAX;
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

          return {
            value: avg,
            label: dayName,
            frontColor: isOutOfRange ? "#51d6f7" : '#006DFF',
            spacing: 4,
          };
        });

      const maxVal = Math.max(...bars.map((b) => b.value), NORMAL_MAX);
      const padded = maxVal * 1.2;

      return {
        bars,
        maxValue: padded,
        xAxisLabel: "Day of Week",
      };
    } else {
      // Last 30 days - show weekly averages within this period
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Group data by week
      const weeklyData = new Map<string, { values: number[]; weekStart: Date }>();

      data.forEach((item) => {
        const date = new Date(item.ts);
        
        // Skip data older than 30 days
        if (date < thirtyDaysAgo) return;
        
        const { start } = getWeekBounds(date);
        const weekKey = localDayKey(start);
        const v = Number(item[fieldName]);
        if (!Number.isFinite(v)) return;

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { values: [], weekStart: start });
        }
        weeklyData.get(weekKey)!.values.push(v);
      });

      const bars = Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, { values, weekStart }]) => {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const isOutOfRange = avg < NORMAL_MIN || avg > NORMAL_MAX;

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          const monthStart = weekStart.toLocaleDateString("en-US", { month: "short" });
          const startDay = weekStart.getDate();
          const endDay = weekEnd.getDate();
          
          const label = `${monthStart} ${startDay}-${endDay}`;

          return {
            value: avg,
            label,
            frontColor: isOutOfRange ? "#51d6f7" : '#006DFF',
            spacing: 6,
          };
        });

      const maxVal = Math.max(...bars.map((b) => b.value), NORMAL_MAX);
      const padded = maxVal * 1.2;

      return {
        bars,
        maxValue: padded,
        xAxisLabel: "Week Range (Last 30 Days)",
      };
    }
  }, [range, data, NORMAL_MIN, NORMAL_MAX, fieldName]);

  const rangeLabel =
    range === "day" ? "Last 24 Hours" : range === "week" ? "Last 7 Days" : "Last 30 Days";

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>
        {name} Levels - {rangeLabel}
      </Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#006DFF' }]} />
          <Text style={styles.legendText}>
            Normal ({NORMAL_MIN}-{NORMAL_MAX} {unit})
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#51d6f7" }]} />
          <Text style={styles.legendText}>Out of Range</Text>
        </View>
      </View>

      {chartData.bars.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for this period</Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartData.bars}
              barWidth={range === "day" ? 20 : range === "week" ? 40 : 60}
              height={250}
              maxValue={chartData.maxValue}
              noOfSections={5}
              yAxisThickness={1}
              xAxisThickness={1}
              yAxisTextStyle={{ color: "#666", fontSize: 10 }}
              xAxisLabelTextStyle={{
                color: "#666",
                fontSize: 10,
                width: range === "day" ? 30 : range === "week" ? 50 : 70,
              }}
              isAnimated
              animationDuration={500}
              width={Math.max(
                300,
                chartData.bars.length * (range === "day" ? 25 : range === "week" ? 60 : 90)
              )}
              yAxisLabelWidth={40}
            />
          </ScrollView>
          <Text style={styles.axisLabel}>{chartData.xAxisLabel}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  axisLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  noDataContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
  },
});