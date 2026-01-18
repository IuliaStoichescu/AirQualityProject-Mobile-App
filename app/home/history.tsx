import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useIot } from "@/src/iot/iot_context";

type HistoryRow = {
  deviceID: string;
  co2: string;
  pressure: string;
  humidity: string;
  temperature: string;
  battery: number;
  ts: number;
};

type DayGroup = {
  dayKey: string; // YYYY-MM-DD local
  dateLabel: string;
  items: HistoryRow[];
};

const RANGES = {
  co2: { min: 400, max: 1500, unit: "ppm" },
  temperature: { min: 16, max: 24, unit: "°C" },
  humidity: { min: 30, max: 60, unit: "%" },
  pressure: { min: 1000, max: 1030, unit: "hPa" },
};

const isOut = (v: number, min: number, max: number) =>
  Number.isFinite(v) && (v < min || v > max);

const localDayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDateHeader = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export default function HistoryScreen() {
  const { deviceID } = useIot();

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);//currently selected date for filtering
  const [showPicker, setShowPicker] = useState(false);//visibility of date picker

  const fetchHistory = useCallback(
    async (fromTS: number, toTS: number) => {
      if (!deviceID) {
        setRows([]);
        return;
      }

      const url =
        `*` +
        `?deviceID=${deviceID}&from=${fromTS}&to=${toTS}`;

      const res = await fetch(url);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : [];

      const mapped: HistoryRow[] = raw
        .filter((r: any) => r?.ts != null)
        .map((r: any) => ({
          deviceID: String(r.deviceID ?? ""),
          co2: String(r.co2 ?? ""),
          pressure: String(r.pressure ?? ""),
          humidity: String(r.humidity ?? ""),
          temperature: String(r.temperature ?? ""),
          battery: Number(r.battery ?? 0),
          ts: Number(r.ts),
        }))
        .sort((a, b) => b.ts - a.ts);

      setRows(mapped);
    },
    [deviceID]
  );

  // show last 24h history when we dont select a date
  useFocusEffect(
    useCallback(() => {
      let alive = true;

      const run = async () => {
        try {
          setLoading(true);
          if (!deviceID) {
            if (alive) setRows([]);
            return;
          }

          if (selectedDate) {
            // if user picked a date, keep that view
            const fromTS = startOfDay(selectedDate).getTime();
            const toTS = endOfDay(selectedDate).getTime();
            if (alive) await fetchHistory(fromTS, toTS);
            return;
          }

          const toTS = Date.now();
          const fromTS = toTS - 24 * 60 * 60 * 1000;

          if (alive) await fetchHistory(fromTS, toTS);
        } catch (e) {
          console.error("History fetch error:", e);
          if (alive) setRows([]);
        } finally {
          if (alive) setLoading(false);
        }
      };

      run();
      return () => {
        alive = false;
      };
    }, [deviceID, selectedDate, fetchHistory])
  );

  const applyDayFilter = useCallback(
    async (day: Date) => {
      setSelectedDate(day);
      setLoading(true);
      try {
        await fetchHistory(startOfDay(day).getTime(), endOfDay(day).getTime());
      } finally {
        setLoading(false);
      }
    },
    [fetchHistory]
  );

  const clearDateFilter = useCallback(async () => {
    setSelectedDate(null);
    setLoading(true);
    try {
      const toTS = Date.now();
      const fromTS = toTS - 24 * 60 * 60 * 1000;
      await fetchHistory(fromTS, toTS);
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  const groups: DayGroup[] = useMemo(() => {
    const map = new Map<string, HistoryRow[]>();

    for (const r of rows) {
      const d = new Date(r.ts);
      const key = localDayKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dayKey, items]) => {
        const dayDate = new Date(items[0].ts);
        return {
          dayKey,
          dateLabel: formatDateHeader(dayDate),
          items: items.sort((a, b) => b.ts - a.ts),
        };
      });
  }, [rows]);

  return (
    <View style={styles.container}>
      <Text style={styles.deviceTitle}>Device ID: {deviceID ?? "—"}</Text>
      <View style={styles.divider} />
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="calendar-outline" size={18} color="#262632ff" />
          <Text style={styles.filterBtnText}>
            {selectedDate ? formatDateHeader(selectedDate) : "Pick a date"}
          </Text>
        </Pressable>

        {selectedDate && (
          <Pressable
            onPress={clearDateFilter}
            style={({ pressed }) => [styles.clearDateBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.clearDateText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {showPicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={selectedDate ?? new Date()}
          mode="date"
          display="default"
          onChange={async (_event, date) => {
            setShowPicker(false);
            if (!date) return;
            await applyDayFilter(date);
          }}
        />
      )}

      {showPicker && Platform.OS === "web" && (
        <View style={{ marginBottom: 10 }}>
          <input
            type="date"
            value={selectedDate ? localDayKey(selectedDate) : ""}
            onChange={async (e) => {
              const value = e.target.value; // YYYY-MM-DD
              if (!value) return;
              const [y, m, d] = value.split("-").map(Number);
              const picked = new Date(y, m - 1, d);
              setShowPicker(false);
              await applyDayFilter(picked);
            }}
          />
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No history available.</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.dayKey}
          renderItem={({ item: group }) => (
            <View>
              <Text style={styles.dateHeader}>{group.dateLabel}</Text>

              {group.items.map((r) => {
                const t = new Date(r.ts);
                const co2 = Number(r.co2);
                const temp = Number(r.temperature);
                const hum = Number(r.humidity);
                const pres = Number(r.pressure);

                const cardOutOfRange =
                  isOut(co2, RANGES.co2.min, RANGES.co2.max) ||
                  isOut(temp, RANGES.temperature.min, RANGES.temperature.max) ||
                  isOut(hum, RANGES.humidity.min, RANGES.humidity.max) ||
                  isOut(pres, RANGES.pressure.min, RANGES.pressure.max);

                return (
                  <View key={String(r.ts)} style={{ marginBottom: 14 }}>
                    <Text style={styles.timeText}>{formatTime(t)}</Text>

                    <View style={[styles.card, cardOutOfRange && styles.cardAlert]}>
                      <View style={styles.iconGrid}>
                        <View style={styles.iconItem}>
                          <Ionicons name="cloud-outline" size={22} color="#3ac0f6" />
                          <Text style={styles.iconLabel}>CO2</Text>
                          <Text style={styles.iconValue}>
                            {co2} {RANGES.co2.unit}
                          </Text>
                        </View>

                        <View style={styles.iconItem}>
                          <Ionicons name="thermometer-outline" size={22} color="#f63a76" />
                          <Text style={styles.iconLabel}>Temp</Text>
                          <Text style={styles.iconValue}>
                            {temp} {RANGES.temperature.unit}
                          </Text>
                        </View>

                        <View style={styles.iconItem}>
                          <Ionicons name="water-outline" size={22} color="#f6be3a" />
                          <Text style={styles.iconLabel}>Humidity</Text>
                          <Text style={styles.iconValue}>
                            {hum} {RANGES.humidity.unit}
                          </Text>
                        </View>

                        <View style={styles.iconItem}>
                          <Ionicons name="speedometer-outline" size={22} color="#25af35" />
                          <Text style={styles.iconLabel}>Pressure</Text>
                          <Text style={styles.iconValue}>
                            {pres} {RANGES.pressure.unit}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  deviceTitle: {
    fontSize: 28,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#262632ff",
    width: "100%",
    marginBottom: 10,
    marginTop: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    flex: 1,
  },
  filterBtnText: {
    fontSize: 14,
    color: "#262632ff",
    fontWeight: "600",
  },
  clearDateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  clearDateText: {
    color: "#d11",
    fontWeight: "700",
  },
  dateHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 10,
  },
  timeText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#888888",
  },
  card: {
    backgroundColor: "rgb(216, 249, 238)",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: "hidden",
    paddingBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#30ff7c",
  },
  cardAlert: {
    backgroundColor: "#ffe8e8",
    borderLeftWidth: 5,
    borderLeftColor: "#ff3b30",
  },
  iconGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  iconItem: {
    alignItems: "center",
    flex: 1,
  },
  iconLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#777",
    fontWeight: "600",
  },
  iconValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
