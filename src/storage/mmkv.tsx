import { useCallback, useEffect, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'appStorage' });

type SetStateAction<T> = T | ((prev: T) => T);

export function useMMKVStorage<T>(key: string, defaultValue: T) {
  const readValue = useCallback((): T => {
    const storedValue = storage.getString(key);
    return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
  }, [key, defaultValue]);

  const [value, setValue] = useState<T>(readValue);

  useEffect(() => {
    const sub = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        setValue(readValue());
      }
    });
    return () => sub.remove();
  }, [key, readValue]);

  const setStoredValue = useCallback(
    (newValue: SetStateAction<T>) => {
      setValue((prev) => {
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (p: T) => T)(prev)
            : newValue;

        storage.set(key, JSON.stringify(nextValue));
        return nextValue;
      });
    },
    [key]
  );

  return [value, setStoredValue] as const;
}
