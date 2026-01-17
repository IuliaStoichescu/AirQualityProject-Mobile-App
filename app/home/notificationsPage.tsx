import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useMMKVStorage } from '../../src/storage/mmkv';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { storage } from '../../src/storage/mmkv'; 

/**/

const ALERT_COLORS = [
  'rgb(255, 217, 203)',
  'rgb(255, 235, 205)',
  'rgb(255, 250, 205)',
  'rgb(224, 255, 255)',
  'rgb(230, 230, 250)',
  'rgb(255, 228, 225)',
  'rgb(240, 255, 240)',
  'rgb(255, 240, 245)',
];

const getColorForItem = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ALERT_COLORS[Math.abs(hash) % ALERT_COLORS.length];
};

export default function NotificationsPage() {
  const [alertLogs, setAlertLogs] = useMMKVStorage<any[]>('notification_history', []);
  const [lastAlertTime, setLastAlertTime] =
  useMMKVStorage<Record<string, number>>('alert_cooldown', {});
  const [unread, setUnread] = useMMKVStorage<string>('hasUnreadAlerts', '0');

  useFocusEffect(
  useCallback(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      if (unread !== '0') setUnread('0');
    });

    return () => {
      cancelled = true;
    };
  }, [unread, setUnread])
);

  const deleteOne = (id: string) => {
    const updatedList = alertLogs.filter(item => item.id !== id);
    setAlertLogs(updatedList);
  };

  const clearAll = () => {
    if (!alertLogs.length) return;

    Alert.alert(
      'Clear all alerts?',
      'This will delete all notifications from the last 24h.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => [setAlertLogs([]),setLastAlertTime({})] },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const borderColor = getColorForItem(item.id);

    return (
      <View style={styles.card}>
        <View style={[styles.leftBorder, { backgroundColor: borderColor }]} />

        <Ionicons name="warning" size={20} color="red" style={styles.icon} />

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.msg}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
        </View>

        <Pressable
          onPress={() => deleteOne(item.id)}
          hitSlop={10}
          style={({ pressed }) => [styles.trashBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="trash-outline" size={20} color="#666" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Alert History (24h)</Text>

        <Pressable
          onPress={clearAll}
          disabled={!alertLogs.length}
          style={({ pressed }) => [
            styles.clearBtn,
            !alertLogs.length && { opacity: 0.35 },
            pressed && alertLogs.length ? { opacity: 0.6 } : null,
          ]}
        >
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      <FlatList
        data={alertLogs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>All systems normal.</Text>
            <Text style={styles.emptySubtext}>No alerts in the last 24 hours.</Text>
          </View>}
        renderItem={renderItem}
        contentContainerStyle={!alertLogs.length ? { flex: 1 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: { fontSize: 22, fontWeight: 'bold' },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  clearText: { color: '#d11', fontWeight: '600' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },

  leftBorder: {
    width: 8,
    alignSelf: 'stretch',
  },

  icon: { marginLeft: 12 },

  content: { marginLeft: 10, flex: 1, paddingVertical: 12, paddingRight: 8 },
  title: { fontWeight: 'bold', fontSize: 16 },
  msg: { color: '#444', marginTop: 4 },
  time: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 6 },

  trashBtn: { paddingHorizontal: 12, paddingVertical: 12 },

  empty: { textAlign: 'center', marginTop: 50, color: '#bbb' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AEAEB2',
    marginTop: 8,
  },
});

