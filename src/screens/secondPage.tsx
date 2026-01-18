import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from "react-native";
import  {TimeRangeDropdown, RangeKey} from "../constants/picker";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useIot } from "../iot/iot_context";
import { useFocusEffect } from "expo-router";
import { SensorChart } from "../helpers/chartsForSensors";

export default function SecondRoute() {
  const [range, setRange] = useState<RangeKey>("day");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { deviceID } = useIot();
  const NORMAL_MIN_TEMP = 16;
  const NORMAL_MAX_TEMP = 24;
  const [temperature, setTemperature] = useState<any[]>([]);

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
            const tempRows = rows
            .filter((r: any) => r?.ts != null && r?.temperature != null)
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
        setTemperature(tempRows);
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
            
            <SensorChart range={range} data={temperature} NORMAL_MIN={NORMAL_MIN_TEMP} NORMAL_MAX={NORMAL_MAX_TEMP} name="Temperature" unit="°C" fieldName="temperature" />
          )}
        </ScrollView>
      );
  }

 const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: '#bc9ee9',
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