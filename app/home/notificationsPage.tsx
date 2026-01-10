// app/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useMMKVStorage } from '../../src/storage/mmkv';
import { Ionicons } from '@expo/vector-icons';

// Define color palette for alerts
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
  const [alertLogs] = useMMKVStorage<any[]>('notification_history', []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alert History (24h)</Text>
      <FlatList
        data={alertLogs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No recent alerts</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: getColorForItem(item.id) }]}>
            <Ionicons name="warning" size={20} color="red" />
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.msg}>{item.message}</Text>
              <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    elevation: 2 
  },
  content: { marginLeft: 10, flex: 1 },
  title: { fontWeight: 'bold', fontSize: 16 },
  msg: { color: '#444', marginVertical: 4 },
  time: { fontSize: 12, color: '#999', textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 50, color: '#ccc' }
});