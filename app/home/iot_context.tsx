import React, { createContext, useContext, useEffect, useState } from 'react';
import { pubsub } from '../iot/amplify-iot';

const IotContext = createContext<{ latest: any }>({ latest: null });

export const IotProvider = ({ children }: { children: React.ReactNode }) => {
  const [latest, setLatest] = useState<any>(null);

  useEffect(() => {
    const sub = pubsub.subscribe({ topics: 'outTopic' }).subscribe({
      next: (msg) => setLatest(msg),
      error: (err) => console.log('MQTT error:', err),
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <IotContext.Provider value={{ latest }}>
      {children}
    </IotContext.Provider>
  );
};

export const useIot = () => useContext(IotContext);