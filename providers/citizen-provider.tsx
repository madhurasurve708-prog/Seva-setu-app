import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import type { CitizenComplaint, CitizenPreferences, CitizenProfile } from '@/types/citizen';

const PROFILE_KEY = '@seva-setu/citizen-profile';
const COMPLAINTS_KEY = '@seva-setu/citizen-complaints';
const PREFERENCES_KEY = '@seva-setu/citizen-preferences';
const defaultPreferences: CitizenPreferences = { theme: 'system', complaintUpdates: true, announcements: true, smsAlerts: false };

type NewComplaint = Omit<CitizenComplaint, 'id' | 'submittedAt' | 'status' | 'ward' | 'locality'>;
type CitizenContextValue = {
  ready: boolean; profile?: CitizenProfile; complaints: CitizenComplaint[]; preferences: CitizenPreferences;
  saveProfile: (profile: CitizenProfile) => Promise<void>; submitComplaint: (complaint: NewComplaint) => Promise<CitizenComplaint>;
  savePreferences: (preferences: CitizenPreferences) => Promise<void>; logout: () => Promise<void>;
};
const CitizenContext = createContext<CitizenContextValue | undefined>(undefined);

export function CitizenProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false); const [profile, setProfile] = useState<CitizenProfile>();
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]); const [preferences, setPreferences] = useState(defaultPreferences);
  useEffect(() => { void (async () => { const [storedProfile, storedComplaints, storedPreferences] = await Promise.all([AsyncStorage.getItem(PROFILE_KEY), AsyncStorage.getItem(COMPLAINTS_KEY), AsyncStorage.getItem(PREFERENCES_KEY)]); if (storedProfile) setProfile(JSON.parse(storedProfile)); if (storedComplaints) setComplaints(JSON.parse(storedComplaints)); if (storedPreferences) setPreferences(JSON.parse(storedPreferences)); setReady(true); })(); }, []);
  const value = useMemo<CitizenContextValue>(() => ({
    ready, profile, complaints, preferences,
    saveProfile: async (next) => { setProfile(next); await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)); },
    submitComplaint: async (draft) => { if (!profile) throw new Error('Citizen profile is required.'); const complaint: CitizenComplaint = { ...draft, id: `SS-${Date.now().toString().slice(-6)}`, ward: profile.ward, locality: profile.locality, submittedAt: new Date().toISOString(), status: 'Pending', assignedDepartment: draft.category === 'Garbage' ? 'Sanitation Department' : undefined }; const next = [complaint, ...complaints]; setComplaints(next); await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(next)); return complaint; },
    savePreferences: async (next) => { setPreferences(next); await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); },
    logout: async () => { setProfile(undefined); await AsyncStorage.removeItem(PROFILE_KEY); },
  }), [complaints, preferences, profile, ready]);
  return <CitizenContext.Provider value={value}>{children}</CitizenContext.Provider>;
}

export function useCitizen() { const context = useContext(CitizenContext); if (!context) throw new Error('useCitizen must be used inside CitizenProvider.'); return context; }
