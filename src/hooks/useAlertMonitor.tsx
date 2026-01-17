import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useIot } from '../iot/iot_context';
import { useMMKVStorage } from '../storage/mmkv';
import { isVlaueOk } from '../constants/sensors';
import { storage } from '../storage/mmkv'; 

export const useAlertMonitor = () => {
  const { sensorData, battery } = useIot();
  const [alertLogs, setAlertLogs] = useMMKVStorage<any[]>('notification_history', []);
  const [lastAlertTime, setLastAlertTime] =
    useMMKVStorage<Record<string, number>>('alert_cooldown', {});
  const [unread, setUnread] = useMMKVStorage<string>('hasUnreadAlerts', '0');

  useEffect(() => {
    if (sensorData.length === 0 && battery.level === 0) return;

    const now = Date.now();
    const cooldown = 1 * 60 * 1000;//1 min cooldown
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let updatedLogs = [...alertLogs];
    let updatedCooldowns = { ...lastAlertTime };
    let hasNew = false;

    const trigger = async (id: string, title: string, msg: string) => {
      const last = updatedCooldowns[id] || 0;

      if (now - last > cooldown) {
        updatedLogs.unshift({ id: `${id}-${now}`, title, message: msg, timestamp: now });
        updatedCooldowns[id] = now;
        hasNew = true;

        try {
          await Notifications.scheduleNotificationAsync({
            content: { title, body: msg },
            trigger: null,
          });
        } catch (e) {
          console.log('Notification scheduling error:', e);
        }
      }
    };

    (async () => {
      if (battery.isLow) {
        await trigger('battery:low', 'Low Battery', `Battery at ${battery.formatted}%`);
      }

      for (const sensor of sensorData) {
        const type = sensor.message === 'No data available' ? 'nodata' : 'threshold';
        if (!isVlaueOk(sensor)) {
          await trigger(`${sensor.id}:${type}`, sensor.title, sensor.message);
        }
      }

      if (hasNew) {
        setAlertLogs(updatedLogs.filter((l) => l.timestamp > oneDayAgo));
        setLastAlertTime(updatedCooldowns);
        setUnread('1');
      }
    })();
  }, [sensorData, battery, alertLogs, lastAlertTime, setAlertLogs, setLastAlertTime]);
};
