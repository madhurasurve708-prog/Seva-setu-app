import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { en } from '@/translations/en';
import { mr } from '@/translations/mr';

export type AppLanguage = 'English' | 'Marathi';

const KEY = '@seva-setu/language';

type Value = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LocalizationContext = createContext<Value | undefined>(undefined);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>('English');

  useEffect(() => {
    void AsyncStorage.getItem(KEY).then((saved) => {
      if (saved === 'Marathi' || saved === 'English') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = async (next: AppLanguage) => {
    setLanguageState(next);
    await AsyncStorage.setItem(KEY, next);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, params?: Record<string, string | number>) => {
        const transKey = key as keyof typeof en;
        let str = (language === 'Marathi' ? mr[transKey] : en[transKey]) || en[transKey] || key;
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
          });
        }
        return str;
      },
    }),
    [language]
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useTranslation must be used inside LocalizationProvider.');
  }
  return context;
}
