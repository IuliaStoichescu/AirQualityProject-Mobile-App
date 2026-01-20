import { CONNECTION_STATE_CHANGE, ConnectionState } from "@aws-amplify/pubsub";
import { Hub } from "aws-amplify/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { pubsub } from "./amplify-iot";
import { BASE_DATA, SensorItem, numericBasedMessage } from "../constants/sensors";

interface IotContextType {
  latest: any;
  connState: ConnectionState;
  sensorData: SensorItem[];
  battery: { level: number; formatted: string; isLow: boolean };
  deviceID: string | null;
}

const IotContext = createContext<IotContextType>({
  latest: null,
  connState: ConnectionState.Disconnected,
  sensorData: BASE_DATA.map(item => ({ ...item, value: "0", message: "No data available" })),
  battery: { level: 0, formatted: "0.0", isLow: false },
  deviceID: null
});

export const IotProvider = ({ children }: { children: React.ReactNode }) => {
  const [latest, setLatest] = useState<any>(null);
  const [connState, setConnState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [sensorData, setSensorData] = useState<SensorItem[]>(
    BASE_DATA.map(item => ({ ...item, value: "0", message: "No data available" }))
  );
  const [battery, setBattery] = useState({ level: 0, formatted: "0.0", isLow: false });
  const [deviceID, setDeviceID] = useState<string | null>(null);

  useEffect(() => {
    if (!latest) {
      console.log("Latest is null, skipping sensor update");
      return;
    }

    console.log("Updating sensor data from latest:", JSON.stringify(latest));

    const newSensorData = BASE_DATA.map((item) => {
      const rawValue = latest[String(item.id)];
      console.log(`Sensor ${item.id} (${item.title}): "${String(item.id)}" = ${rawValue}`);
      
      const numericValue = rawValue !== undefined ? parseFloat(String(rawValue)) : 0;
      const updated = { ...item, value: String(numericValue) };
      const message = numericBasedMessage(updated);
      
      return { ...updated, message };
    });

    setSensorData(newSensorData);

    const bat = latest["Battery"] !== undefined ? Number(latest["Battery"]) : 0;
    console.log(`Battery: ${bat}%`);
    
    setBattery({
      level: bat,
      formatted: bat.toFixed(1),
      isLow: bat < 1 && bat > 0
    });

    const devID = latest["deviceID"] ? String(latest["deviceID"]) : null;
    console.log(`Device ID: ${devID}`);
    setDeviceID(devID);

    console.log("Sensor data updated successfully");
  }, [latest]);

  useEffect(() => {
    console.log("IotProvider: Initializing MQTT connection...");

    
   
    const hubListener = Hub.listen("pubsub", (capsule: any) => {
      console.log("Hub event received:", capsule.payload.event);
      if (capsule?.payload?.event === CONNECTION_STATE_CHANGE) {
        const newState = capsule.payload.data.connectionState;
        console.log("Connection State:", newState);
      if (capsule.payload.data.error) {
        console.error("Connection error details:", capsule.payload.data.error);
      }
        setConnState(newState);
      }
    });

    console.log("Subscribing to topic: 'outTopic'");
   
    let subscriptionActive = false;
   
    const sub = pubsub.subscribe({ topics: "outTopic" }).subscribe({
      next: (data) => {
        if (!subscriptionActive) {
          subscriptionActive = true;
          console.log("SUBSCRIPTION ACTIVE!");
        }
        console.log("MQTT MESSAGE RECEIVED!");
        console.log("Raw data:", data);
        console.log("Type:", typeof data);
        console.log("Keys:", Object.keys(data));
        console.log("Stringified:", JSON.stringify(data, null, 2));
        
        const msg = (data as any).msg ?? data;
        console.log("Extracted msg:", JSON.stringify(msg));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        setLatest(msg);
      },
      error: (err) => {
        console.error("MQTT ERROR");
        console.error(err);
      },
      complete: () => {
        console.log("MQTT Subscription completed");
      }
    });

    console.log("Subscription created");

    const testTimer = setTimeout(() => {
      console.log("TEST: Manually setting test data...");
      setLatest({
        "deviceID": "device123",
        "1": "",
        "2": "",
        "3": "",
        "4": "",
        "Battery": ""
      });
    }, 3000);

    return () => {
      console.log("Cleaning up MQTT subscriptions");
      clearTimeout(testTimer);
      sub.unsubscribe();
      hubListener();
    };
  }, []);

  return (
    <IotContext.Provider value={{ latest, connState, sensorData, battery, deviceID }}>
      {children}
    </IotContext.Provider>
  );
};

export const useIot = () => {
  const context = useContext(IotContext);
  if (!context) throw new Error("useIot must be used within IotProvider");
  return context;
};