import AsyncStorage from '@react-native-async-storage/async-storage';
import { complaints as initialComplaints, type Complaint, type ComplaintStatus } from '@/data/complaints';
import type { OfficialProfile } from '@/providers/official-provider';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type DepartmentContextValue = { ready: boolean; isAuthenticated: boolean; profile: OfficialProfile | null; complaints: Complaint[]; login: (profile: OfficialProfile) => Promise<void>; logout: () => Promise<void>; updateStatus: (id: string, status: ComplaintStatus, note?: string) => Promise<void>; addNote: (id: string, note: string) => Promise<void>; };
const PROFILE_KEY = '@seva-setu/department-profile';
const COMPLAINTS_KEY = '@seva-setu/department-complaints';
const DepartmentContext = createContext<DepartmentContextValue | undefined>(undefined);

export function DepartmentProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false); const [profile, setProfile] = useState<OfficialProfile | null>(null); const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  useEffect(() => { void (async () => { try { const [storedProfile, storedComplaints] = await Promise.all([AsyncStorage.getItem(PROFILE_KEY), AsyncStorage.getItem(COMPLAINTS_KEY)]); if (storedProfile) setProfile(JSON.parse(storedProfile) as OfficialProfile); if (storedComplaints) setComplaints(JSON.parse(storedComplaints) as Complaint[]); } finally { setReady(true); } })(); }, []);
  const saveComplaints = async (next: Complaint[]) => { setComplaints(next); await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(next)); };
  const updateStatus = async (id: string, status: ComplaintStatus, note?: string) => { const timestamp = new Date().toISOString(); await saveComplaints(complaints.map((c) => c.id !== id ? c : { ...c, status, updatedAt: timestamp, notes: [...c.notes, { id: `dept-note-${Date.now()}`, author: profile?.name ?? 'Department Officer', text: note ? `Status updated to ${status}: ${note}` : `Status updated to ${status}.`, createdAt: timestamp }] })); };
  const addNote = async (id: string, note: string) => { const timestamp = new Date().toISOString(); await saveComplaints(complaints.map((c) => c.id !== id ? c : { ...c, updatedAt: timestamp, notes: [...c.notes, { id: `dept-note-${Date.now()}`, author: profile?.name ?? 'Department Officer', text: note, createdAt: timestamp }] })); };
  const value = useMemo(() => ({ ready, isAuthenticated: Boolean(profile), profile, complaints, login: async (next: OfficialProfile) => { setProfile(next); await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)); }, logout: async () => { setProfile(null); await AsyncStorage.removeItem(PROFILE_KEY); }, updateStatus, addNote }), [ready, profile, complaints]);
  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>;
}
export function useDepartment() { const context = useContext(DepartmentContext); if (!context) throw new Error('useDepartment must be used inside DepartmentProvider.'); return context; }
