// src/hooks/useAlertMonitor.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useIot } from '../iot/iot_context';
import { useMMKVStorage } from '../storage/mmkv';
import { isVlaueOk } from '../constants/sensors';

export const useAlertMonitor = () => {
  const { sensorData, battery } = useIot();
  const [alertLogs, setAlertLogs] = useMMKVStorage<any[]>('notification_history', []);
  const [lastAlertTime, setLastAlertTime] = useMMKVStorage<Record<string, number>>('alert_cooldown', {});

  useEffect(() => {
    if (sensorData.length === 0 && battery.level === 0) return;

    const now = Date.now();
    const cooldown = 30 * 60 * 1000; // 30 mins
    let updatedLogs = [...alertLogs];
    let hasNew = false;

    const trigger = (id: string, title: string, msg: string) => {
      const last = lastAlertTime[id] || 0;
      if (now - last > cooldown) {
        const newAlert = { id: `${id}-${now}`, title, message: msg, timestamp: now };
        updatedLogs.unshift(newAlert);
        Notifications.scheduleNotificationAsync({
          content: { title, body: msg },
          trigger: null,
        });
        lastAlertTime[id] = now;
        hasNew = true;
      }
    };

    if (battery.isLow) trigger('battery', 'Low Battery', `Battery at ${battery.formatted}%`);

    sensorData.forEach(sensor => {
      if (!isVlaueOk(sensor)) trigger(String(sensor.id), sensor.title, sensor.message);
    });

    if (hasNew) {
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      setAlertLogs(updatedLogs.filter(log => log.timestamp > oneDayAgo));
      setLastAlertTime({ ...lastAlertTime });
    }
  }, [sensorData, battery]);
};