import { useCallback, useState } from 'react';
import { createMMKV } from 'react-native-mmkv'

  export const storage = createMMKV(
    {
      id :"appStorage"
    }
  )
export function useMMKVStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = storage.getString(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue);
    storage.set(key, JSON.stringify(newValue));
  }, [key]);

  return [value, setStoredValue] as const;
}