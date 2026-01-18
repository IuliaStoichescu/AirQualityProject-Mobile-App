import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useIot } from '@/src/iot/iot_context';
import { TimeRangeDropdown, RangeKey } from "../constants/picker";
import { Ionicons } from "@expo/vector-icons";
import { SensorChart } from "../helpers/chartsForSensors"; 

export default function FirstRoute() {
  const [range, setRange] = useState<RangeKey>("day");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { deviceID } = useIot();
  const NORMAL_MIN_CO2 = 400;
  const NORMAL_MAX_CO2 = 1500;
  const [co2, setCo2] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          if (!deviceID) return;
          
          const toTS = Date.now();
          let fromTS;
          
          if (range === "day") {
            fromTS = toTS - 24 * 60 * 60 * 1000; // Last 24 hours
          } else if (range === "week") {
            fromTS = toTS - 7 * 24 * 60 * 60 * 1000; // Last 7 days
          } else {
            fromTS = toTS - 30 * 24 * 60 * 60 * 1000; // Last 30 days
          }

          const url =
            `*` +
            `?deviceID=${deviceID}&from=${fromTS}&to=${toTS}`;

          const res = await fetch(url);
          const json = await res.json();
          const rows = Array.isArray(json) ? json : [];
          const co2Rows = rows
          .filter((r: any) => r?.ts != null && r?.co2 != null)
          .map((r: any) => ({
            deviceID: String(r.deviceID ?? ""),
            co2: String(r.co2),
            pressure: String(r.pressure ?? ""),
            humidity: String(r.humidity ?? ""),
            temperature: String(r.temperature ?? ""),
            battery: Number(r.battery ?? 0),
            ts: Number(r.ts),
          }));

        setData(rows);
        setCo2(co2Rows);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [deviceID, range])
  );

  return (
    <ScrollView style={styles.scene}>
      <View style={styles.pickerWrapper}>
        <Ionicons name="bar-chart-outline" size={20} color="#4CAF50" />
        <TimeRangeDropdown value={range} onChange={setRange} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No data available</Text>
          <Text style={styles.emptySubtext}>
            {deviceID ? "No sensor readings found" : "No device selected"}
          </Text>
        </View>
      ) : (
        
        <SensorChart range={range} data={co2} NORMAL_MIN={NORMAL_MIN_CO2} NORMAL_MAX={NORMAL_MAX_CO2} name="CO2" unit="ppm" fieldName="co2" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: '#35ddd7',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});