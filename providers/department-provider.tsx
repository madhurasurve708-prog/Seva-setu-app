import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Complaint, type ComplaintStatus } from '@/data/complaints';
import type { OfficialProfile } from '@/providers/official-provider';
import { addDepartmentComplaintNote, getDepartmentComplaints, updateDepartmentComplaintStatus, getDepartmentComplaintTimeline, escalateOfficialComplaint, changeOfficialPassword } from '@/services/official-api';
import { clearOfficialAccessToken, getOfficialAccessToken } from '@/services/api-client';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type DepartmentContextValue = {
  ready: boolean;
  isAuthenticated: boolean;
  profile: OfficialProfile | null;
  complaints: Complaint[];
  complaintsLoading: boolean;
  complaintsError?: string;
  loadComplaints: (force?: boolean) => Promise<void>;
  login: (profile: OfficialProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateStatus: (id: string, status: ComplaintStatus, note?: string) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
  fetchNotes: (id: string) => Promise<any[]>;
  escalateComplaint: (id: string, reason: string) => Promise<void>;
  changePassword: (nextPassword: string) => Promise<void>;
};

const PROFILE_KEY = '@seva-setu/department-profile';
const COMPLAINTS_KEY = '@seva-setu/department-complaints';
const DepartmentContext = createContext<DepartmentContextValue | undefined>(undefined);

export function DepartmentProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false); const [profile, setProfile] = useState<OfficialProfile | null>(null); const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false); const [complaintsError, setComplaintsError] = useState<string>(); const complaintsRequest = useRef<Promise<void> | null>(null);
  useEffect(() => { void (async () => { try { const storedProfile = await AsyncStorage.getItem(PROFILE_KEY); if (storedProfile) setProfile(JSON.parse(storedProfile) as OfficialProfile); } finally { setReady(true); } })(); }, []);
  const loadComplaints = useCallback(async (force = false) => { if (!force && complaintsRequest.current) return complaintsRequest.current; const request = (async () => { const token = await getOfficialAccessToken(); if (!token) throw new Error('Your session has expired.'); setComplaintsLoading(true); setComplaintsError(undefined); try { await saveComplaints(await getDepartmentComplaints(token)); } catch (error) { const message = error instanceof Error ? error.message : 'Unable to load complaints.'; setComplaintsError(message); throw error; } finally { setComplaintsLoading(false); } })(); complaintsRequest.current = request; try { await request; } finally { complaintsRequest.current = null; } }, []);
  const saveComplaints = async (next: Complaint[]) => { setComplaints(next); await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(next)); };
  const updateStatus = async (id: string, status: ComplaintStatus, note?: string) => { const token = await getOfficialAccessToken(); if (!token) throw new Error('Your session has expired.'); await updateDepartmentComplaintStatus(id, status, token); if (note) await addDepartmentComplaintNote(id, note, token); await loadComplaints(true); };
  const addNote = async (id: string, note: string) => { const token = await getOfficialAccessToken(); if (!token) throw new Error('Your session has expired.'); await addDepartmentComplaintNote(id, note, token); await loadComplaints(true); };
  
  const fetchNotes = useCallback(async (id: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    const timeline = await getDepartmentComplaintTimeline(id, token);
    return timeline.map((h: any) => ({
      id: String(h.id || Math.random()),
      author: `${h.author_name} (${h.author_role})`,
      text: String(h.note_text),
      createdAt: String(h.created_at),
    }));
  }, []);

  const escalateComplaint = async (id: string, reason: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await escalateOfficialComplaint('department-officer', id, reason, 'Main Admin', token);
    await loadComplaints(true);
  };

  const changePassword = async (nextPassword: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await changeOfficialPassword(nextPassword, token);
  };

  const value = useMemo(() => ({ ready, isAuthenticated: Boolean(profile), profile, complaints, complaintsLoading, complaintsError, loadComplaints, login: async (next: OfficialProfile) => { setProfile(next); await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)); }, logout: async () => { setProfile(null); setComplaints([]); await Promise.all([AsyncStorage.removeItem(PROFILE_KEY), clearOfficialAccessToken()]); }, updateStatus, addNote, fetchNotes, escalateComplaint, changePassword }), [ready, profile, complaints, complaintsLoading, complaintsError, loadComplaints, fetchNotes]);
  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>;
}
export function useDepartment() { const context = useContext(DepartmentContext); if (!context) throw new Error('useDepartment must be used inside DepartmentProvider.'); return context; }
