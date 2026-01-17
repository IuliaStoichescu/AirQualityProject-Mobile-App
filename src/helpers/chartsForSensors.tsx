import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart } from 'react-native-gifted-charts';
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

interface CO2ChartProps {
  range: RangeKey;
  data: DataPoint[];
  NORMAL_MIN: number;
  NORMAL_MAX: number;
  name: string;
  unit: string;
  outOfBoundsValue?: number;
}

export function CO2Chart({ range, data, NORMAL_MIN, NORMAL_MAX, name, unit, outOfBoundsValue }: CO2ChartProps) {
  const chartData = useMemo(() => {
    if (range === "day") {
      const hourlyData = new Map<number, number[]>();
      
      data.forEach(item => {
        const date = new Date(item.ts);
        const hour = date.getHours();
        const co2Value = parseFloat(item.co2);
        
        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, []);
        }
        hourlyData.get(hour)!.push(co2Value);
      });

      const bars = [];
      for (let h = 0; h < 24; h++) {
        const values = hourlyData.get(h) || [];
        const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        const isOutOfRange = avg > 0 && (avg < NORMAL_MIN || avg > NORMAL_MAX);
        
        bars.push({
          value: avg,
          label: `${h}h`,
          frontColor: isOutOfRange ? '#FF5252' : '#4CAF50',
          spacing: 2,
        });
      }
      
      return { 
        bars, 
        maxValue: outOfBoundsValue, 
        yAxisLabel: '{<%= name %>} {<%= unit %>}',
        xAxisLabel: 'Hour of Day'
      };
    } 
    else if (range === "week") {
      const dailyData = new Map<string, { values: number[], date: Date }>();
      
      data.forEach(item => {
        const date = new Date(item.ts);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const co2Value = parseFloat(item.co2);
        
        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, { values: [], date });
        }
        dailyData.get(dayKey)!.values.push(co2Value);
      });

      const bars = Array.from(dailyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, { values, date }]) => {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const isOutOfRange = avg < NORMAL_MIN || avg > NORMAL_MAX;
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          return {
            value: avg,
            label: dayName,
            frontColor: isOutOfRange ? '#FF5252' : '#4CAF50',
            spacing: 4,
          };
        });
      
      const maxVal = Math.max(...bars.map(b => b.value), 2000);
      return { 
        bars, 
        maxValue: Math.ceil(maxVal / 500) * 500, 
        yAxisLabel: 'Avg CO2 (ppm)',
        xAxisLabel: 'Day of Week'
      };
    } 
    else {
      const weeklyData = new Map<string, { values: number[], date: Date }>();
      
      data.forEach(item => {
        const date = new Date(item.ts);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        const co2Value = parseFloat(item.co2);
        
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { values: [], date: weekStart });
        }
        weeklyData.get(weekKey)!.values.push(co2Value);
      });

      const bars = Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, { values, date }]) => {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const isOutOfRange = avg < NORMAL_MIN || avg > NORMAL_MAX;
          
          const weekEnd = new Date(date);
          weekEnd.setDate(date.getDate() + 6);
          
          const monthStart = date.toLocaleDateString('en-US', { month: 'short' });
          const label = `${monthStart} ${date.getDate()}-${weekEnd.getDate()}`;
          
          return {
            value: avg,
            label,
            frontColor: isOutOfRange ? '#FF5252' : '#4CAF50',
            spacing: 6,
          };
        });
      
      const maxVal = Math.max(...bars.map(b => b.value), 2000);
      return { 
        bars, 
        maxValue: Math.ceil(maxVal / 500) * 500, 
        yAxisLabel: 'Avg CO2 (ppm)',
        xAxisLabel: 'Week Range'
      };
    }
  }, [range, data]);

  const rangeLabel = range === "day" ? "Per Day" : range === "week" ? "Per Week" : "Per Month";

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{name} Levels - {rangeLabel}</Text>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Normal ({NORMAL_MIN}-{NORMAL_MAX} {unit})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF5252' }]} />
          <Text style={styles.legendText}>Out of Range</Text>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData.bars}
          barWidth={range === "day" ? 20 : range === "week" ? 40 : 60}
          height={250}
          maxValue={chartData.maxValue}
          noOfSections={5}
          yAxisThickness={1}
          xAxisThickness={1}
          yAxisTextStyle={{ color: '#666', fontSize: 10 }}
          xAxisLabelTextStyle={{ 
            color: '#666', 
            fontSize: 10, 
            width: range === "day" ? 30 : range === "week" ? 50 : 70 
          }}
          isAnimated
          animationDuration={500}
          width={range === "day" ? 600 : chartData.bars.length * (range === "week" ? 60 : 90)}
          yAxisLabelWidth={40}
        />
      </ScrollView>
      
      <Text style={styles.axisLabel}>{chartData.xAxisLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  axisLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
});