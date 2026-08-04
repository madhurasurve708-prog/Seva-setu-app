import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Complaint, type ComplaintStatus } from '@/data/complaints';
import type { OfficialProfile } from '@/providers/official-provider';
import { addDepartmentComplaintNote, getDepartmentComplaints, updateDepartmentComplaintStatus } from '@/services/official-api';
import { clearOfficialAccessToken, getOfficialAccessToken } from '@/services/api-client';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type DepartmentContextValue = { ready: boolean; isAuthenticated: boolean; profile: OfficialProfile | null; complaints: Complaint[]; login: (profile: OfficialProfile) => Promise<void>; logout: () => Promise<void>; updateStatus: (id: string, status: ComplaintStatus, note?: string) => Promise<void>; addNote: (id: string, note: string) => Promise<void>; };
const PROFILE_KEY = '@seva-setu/department-profile';
const COMPLAINTS_KEY = '@seva-setu/department-complaints';
const DepartmentContext = createContext<DepartmentContextValue | undefined>(undefined);

export function DepartmentProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false); const [profile, setProfile] = useState<OfficialProfile | null>(null); const [complaints, setComplaints] = useState<Complaint[]>([]);
  useEffect(() => { void (async () => { try { const [storedProfile, token] = await Promise.all([AsyncStorage.getItem(PROFILE_KEY), getOfficialAccessToken()]); if (storedProfile && token) { const next = JSON.parse(storedProfile) as OfficialProfile; setProfile(next); setComplaints(await getDepartmentComplaints(token)); } } finally { setReady(true); } })(); }, []);
  const saveComplaints = async (next: Complaint[]) => { setComplaints(next); await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(next)); };
  const updateStatus = async (id: string, status: ComplaintStatus, note?: string) => { const token = await getOfficialAccessToken(); if (!token) throw new Error('Your session has expired.'); await updateDepartmentComplaintStatus(id, status, token); if (note) await addDepartmentComplaintNote(id, note, token); await saveComplaints(await getDepartmentComplaints(token)); };
  const addNote = async (id: string, note: string) => { const token = await getOfficialAccessToken(); if (!token) throw new Error('Your session has expired.'); await addDepartmentComplaintNote(id, note, token); await saveComplaints(await getDepartmentComplaints(token)); };
  const value = useMemo(() => ({ ready, isAuthenticated: Boolean(profile), profile, complaints, login: async (next: OfficialProfile) => { setProfile(next); await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)); const token = await getOfficialAccessToken(); if (token) await saveComplaints(await getDepartmentComplaints(token)); }, logout: async () => { setProfile(null); setComplaints([]); await Promise.all([AsyncStorage.removeItem(PROFILE_KEY), clearOfficialAccessToken()]); }, updateStatus, addNote }), [ready, profile, complaints]);
  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>;
}
export function useDepartment() { const context = useContext(DepartmentContext); if (!context) throw new Error('useDepartment must be used inside DepartmentProvider.'); return context; }
