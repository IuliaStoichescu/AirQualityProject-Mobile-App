import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type RangeKey = "day" | "week" | "month";

const OPTIONS: { label: string; value: RangeKey }[] = [
  { label: "Per day", value: "day" },
  { label: "Per week", value: "week" },
  { label: "Per month", value: "month" },
];

export function TimeRangeDropdown({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => OPTIONS.find((o) => o.value === value)?.label ?? "Select",
    [value]
  );

  return (
    <>
      <View style={styles.row}>
        <Text style={styles.viewLabel}>View Charts        
        </Text>
        <Pressable style={styles.input} onPress={() => setOpen(true)}>
          <Text style={styles.inputText}>{selectedLabel}</Text>
          <Ionicons name="chevron-down" size={18} />
        </Pressable>
      </View>

      <Modal transparent visible={open} animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        <View style={styles.dropdown}>
          <FlatList
            data={OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <TouchableOpacity
                  style={[styles.item, selected && styles.selectedItem]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.itemText, selected && styles.selectedText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
   // borderRadius: 12,
  },
  viewLabel: {
      marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    backgroundColor: "#fff",
  },
  inputText: {
    fontSize: 14,
    color: "#222",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  dropdown: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 120, 
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 12,
    backgroundColor: "#fff",
    maxHeight: 220,
    overflow: "hidden",
  },

  item: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  selectedItem: {
    backgroundColor: "#f3f3f3",
  },
  itemText: {
    fontSize: 14,
    color: "#222",
  },
  selectedText: {
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
});
