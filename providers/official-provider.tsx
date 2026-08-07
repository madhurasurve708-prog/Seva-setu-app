import { Complaint } from '@/data/complaints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addOfficialComplaintNote, createMainAdminAnnouncement, escalateOfficialComplaint, getOfficialAnnouncements, getOfficialComplaints, type AnnouncementInput, updateOfficialComplaintStatus, getNagarsevakComplaintTimeline, getMainAdminComplaintDetail, updateNagarsevakProfileName, updateNagarsevakProfilePhone, changeNagarsevakPassword } from '@/services/official-api';
import { clearOfficialAccessToken, getOfficialAccessToken } from '@/services/api-client';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type UserRole = 'citizen' | 'nagarsevak' | 'department-officer' | 'nagaradhyaksha' | 'main-admin';

export interface EscalationTarget {
  id: string;
  label: string;
  role: UserRole;
  description: string;
}

export interface OfficialProfile {
  name: string;
  phone: string;
  email: string;
  username: string;
  password?: string;
  employeeId: string;
  designation: string;
  ward: string;
  locality: string;
  department: string;
  role: UserRole;
  roleLabel: string;
  avatarUri?: string;
  avatarInitial: string;
  language: string;
}

export interface OfficialPreferences {
  theme: 'light' | 'dark' | 'system';
  complaintUpdates: boolean;
  announcements: boolean;
  smsAlerts: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  priority: 'Emergency' | 'High' | 'Normal' | 'Pinned';
  body: string;
}

const PROFILE_KEY = '@seva-setu/official-profile';
const COMPLAINTS_KEY = '@seva-setu/official-complaints';
const PREFERENCES_KEY = '@seva-setu/official-preferences';
const ANNOUNCEMENTS_KEY = '@seva-setu/official-announcements';

export const escalationTargetsByRole: Record<UserRole, EscalationTarget[]> = {
  citizen: [],
  nagarsevak: [
    {
      id: 'public-works',
      label: 'बांधकाम विभाग (Public Works)',
      role: 'department-officer',
      description: 'Roads, bridges, footpaths and public infrastructure issues.',
    },
    {
      id: 'water-supply',
      label: 'पाणी पुरवठा विभाग (Water Supply)',
      role: 'department-officer',
      description: 'Water pipeline leaks, supply disruptions and connection issues.',
    },
    {
      id: 'solid-waste',
      label: 'घनकचरा व्यवस्थापन विभाग (Solid Waste Management)',
      role: 'department-officer',
      description: 'Garbage collection, dumping grounds and waste disposal.',
    },
    {
      id: 'sanitation',
      label: 'स्वच्छता व आरोग्य विभाग (Sanitation & Health)',
      role: 'department-officer',
      description: 'Public sanitation, health hazards and hygiene complaints.',
    },
    {
      id: 'drainage',
      label: 'जलनिस्सारण विभाग (Drainage & Sewerage)',
      role: 'department-officer',
      description: 'Drainage blockages, sewerage overflow and flood-prone areas.',
    },
    {
      id: 'main-admin',
      label: 'Main Admin',
      role: 'main-admin',
      description: 'Escalate directly to municipal Main Admin for urgent or unresolved issues.',
    },
  ],
  'department-officer': [
    {
      id: 'nagaradhyaksha',
      label: 'Nagaradhyaksha',
      role: 'nagaradhyaksha',
      description: 'Escalate to municipal leadership for higher review.',
    },
  ],
  'nagaradhyaksha': [],
  'main-admin': [],
};

export function getAvatarInitial(name: string) {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) {
    return 'U';
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'U';
  }

  return parts[0].charAt(0).toUpperCase();
}

export function getEscalationTargets(role: UserRole | string | undefined) {
  return escalationTargetsByRole[(role as UserRole) ?? 'nagarsevak'] ?? escalationTargetsByRole.nagarsevak;
}

const defaultProfile: OfficialProfile = { name: '', phone: '', email: '', username: '', employeeId: '', designation: '', ward: '', locality: '', department: '', role: 'nagarsevak', roleLabel: 'Nagarsevak', avatarInitial: 'U', language: 'English' };

const defaultPreferences: OfficialPreferences = {
  theme: 'light',
  complaintUpdates: true,
  announcements: true,
  smsAlerts: true,
};

const defaultAnnouncements: Announcement[] = [];

type OfficialContextValue = {
  ready: boolean;
  isAuthenticated: boolean;
  profile: OfficialProfile;
  complaints: Complaint[];
  preferences: OfficialPreferences;
  announcements: Announcement[];
  announcementsLoading: boolean;
  announcementsError?: string;
  loadAnnouncements: (force?: boolean) => Promise<void>;
  complaintsLoading: boolean;
  complaintsError?: string;
  loadComplaints: (force?: boolean) => Promise<void>;
  setAuthenticatedUser: (profile: OfficialProfile) => Promise<void>;
  saveProfile: (profile: OfficialProfile) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint['status'], noteText?: string) => Promise<void>;
  addComplaintNote: (id: string, text: string) => Promise<void>;
  publishAnnouncement: (input: AnnouncementInput) => Promise<void>;
  uploadComplaintImage: (id: string, imageUri: string) => Promise<void>;
  escalateComplaint: (id: string, department: string, reason: string) => Promise<void>;
  fetchNotes: (id: string) => Promise<any[]>;
  softDeleteComplaint: (id: string, deletedBy: string, reason: string) => Promise<void>;
  restoreComplaint: (id: string) => Promise<void>;
  savePreferences: (preferences: OfficialPreferences) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
};

const OfficialContext = createContext<OfficialContextValue | undefined>(undefined);

export function OfficialProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<OfficialProfile>(defaultProfile);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [preferences, setPreferences] = useState<OfficialPreferences>(defaultPreferences);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string>();
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState<string>();
  const complaintsRequest = useRef<Promise<void> | null>(null);
  const announcementsRequest = useRef<Promise<void> | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [storedProfile, storedPreferences] = await Promise.all([
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(PREFERENCES_KEY),
        ]);

        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile) as Partial<OfficialProfile>;
          const normalizedProfile: OfficialProfile = {
            ...defaultProfile,
            ...parsedProfile,
            avatarInitial: parsedProfile.avatarInitial || getAvatarInitial(parsedProfile.name ?? defaultProfile.name),
            role: parsedProfile.role ?? defaultProfile.role,
            roleLabel: parsedProfile.roleLabel ?? defaultProfile.roleLabel,
          };
          setProfile(normalizedProfile);
          setIsAuthenticated(true);
        }

        if (storedPreferences) {
          setPreferences(JSON.parse(storedPreferences));
        } else {
          await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(defaultPreferences));
        }

      } catch (err) {
        console.error('Failed to load official state from AsyncStorage:', err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const loadComplaints = useCallback(async (force = false) => {
    if (!force && complaintsRequest.current) return complaintsRequest.current;
    const request = (async () => {
      const token = await getOfficialAccessToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      setComplaintsLoading(true);
      setComplaintsError(undefined);
      try {
        setComplaints(await getOfficialComplaints(profile.role, token));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load complaints.';
        setComplaintsError(message);
        throw error;
      } finally {
        setComplaintsLoading(false);
      }
    })();
    complaintsRequest.current = request;
    try { await request; } finally { complaintsRequest.current = null; }
  }, [profile.role]);

  const loadAnnouncements = useCallback(async (force = false) => {
    if (!force && announcementsRequest.current) return announcementsRequest.current;
    const request = (async () => {
      const token = await getOfficialAccessToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      setAnnouncementsLoading(true);
      setAnnouncementsError(undefined);
      try {
        setAnnouncements(await getOfficialAnnouncements(profile.role, token));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load announcements.';
        setAnnouncementsError(message);
        throw error;
      } finally {
        setAnnouncementsLoading(false);
      }
    })();
    announcementsRequest.current = request;
    try { await request; } finally { announcementsRequest.current = null; }
  }, [profile.role]);

  const saveProfile = async (next: OfficialProfile) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired. Please sign in again.');

    if (profile.role === 'nagarsevak') {
      if (next.name !== profile.name) {
        await updateNagarsevakProfileName(next.name, token);
      }
      if (next.phone !== profile.phone) {
        await updateNagarsevakProfilePhone(next.phone, token);
      }
    }

    const updated = {
      ...next,
      avatarInitial: getAvatarInitial(next.name),
      role: next.role ?? defaultProfile.role,
      roleLabel: next.roleLabel ?? defaultProfile.roleLabel,
    };
    setProfile(updated);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  };

  const changePassword = async (current: string, nextPassword: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired. Please sign in again.');

    if (profile.role === 'nagarsevak') {
      await changeNagarsevakPassword(current, nextPassword, token);
    } else {
      throw new Error('Password changes are not supported for this role.');
    }
  };

  const savePreferences = async (next: OfficialPreferences) => {
    setPreferences(next);
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  };

  const setAuthenticatedUser = async (next: OfficialProfile) => {
    await saveProfile(next);
    setIsAuthenticated(true);
  };

  const updateComplaintStatus = async (id: string, status: Complaint['status'], noteText?: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await updateOfficialComplaintStatus(profile.role, id, status, token);
    if (noteText) await addOfficialComplaintNote(profile.role, id, noteText, token);
    await loadComplaints(true);
  };

  const addComplaintNote = async (id: string, text: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await addOfficialComplaintNote(profile.role, id, text, token);
    await loadComplaints(true);
  };

  const publishAnnouncement = async (input: AnnouncementInput) => {
    if (profile.role !== 'main-admin') throw new Error('Only Main Admin can publish announcements.');
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await createMainAdminAnnouncement(input, token);
    await loadAnnouncements(true);
  };

  const uploadComplaintImage = async (id: string, imageUri: string) => {
    const timestamp = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          updatedAt: timestamp,
          images: [...(c.images || []), imageUri],
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
  };

  const escalateComplaint = async (id: string, target: string, reason: string) => {
    if (profile.role !== 'nagarsevak' && profile.role !== 'department-officer') throw new Error('This role does not support escalation.');
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await escalateOfficialComplaint(profile.role, id, reason, target, token);
    await loadComplaints(true);
  };

  const fetchNotes = useCallback(async (id: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    
    if (profile.role === 'nagarsevak') {
      const timeline = await getNagarsevakComplaintTimeline(id, token);
      return timeline.map((h: any) => ({
        id: String(h.id || Math.random()),
        author: `${h.author_name} (${h.author_role})`,
        text: String(h.note_text),
        createdAt: String(h.created_at),
      }));
    } else if (profile.role === 'main-admin') {
      const detail = await getMainAdminComplaintDetail(id, token);
      const history = (detail.history || []) as any[];
      return history.map((h: any) => ({
        id: String(h.id || Math.random()),
        author: `${h.author_name} (${h.author_role})`,
        text: String(h.note_text),
        createdAt: String(h.created_at),
      }));
    }
    return [];
  }, [profile.role]);

  const softDeleteComplaint = async (id: string, deletedBy: string, reason: string) => {
    throw new Error('The deployed backend does not expose complaint deletion.');
  };

  const restoreComplaint = async (id: string) => {
    throw new Error('The deployed backend does not expose complaint restoration.');
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setProfile(defaultProfile);
    setPreferences(defaultPreferences);
    setComplaints([]);
    await Promise.all([
      AsyncStorage.removeItem(PROFILE_KEY),
      AsyncStorage.removeItem(PREFERENCES_KEY),
      AsyncStorage.removeItem(COMPLAINTS_KEY),
      AsyncStorage.removeItem(ANNOUNCEMENTS_KEY),
      clearOfficialAccessToken(),
    ]);
  };

  const value = useMemo<OfficialContextValue>(
    () => ({
      ready,
      isAuthenticated,
      profile,
      complaints,
      preferences,
      announcements,
      announcementsLoading,
      announcementsError,
      loadAnnouncements,
      complaintsLoading,
      complaintsError,
      loadComplaints,
      setAuthenticatedUser,
      saveProfile,
      updateComplaintStatus,
      addComplaintNote,
      publishAnnouncement,
      uploadComplaintImage,
      escalateComplaint,
      fetchNotes,
      softDeleteComplaint,
      restoreComplaint,
      savePreferences,
      logout,
      changePassword,
    }),
    [ready, isAuthenticated, profile, complaints, preferences, announcements, announcementsLoading, announcementsError, loadAnnouncements, complaintsLoading, complaintsError, loadComplaints, fetchNotes]
  );

  return <OfficialContext.Provider value={value}>{children}</OfficialContext.Provider>;
}

export function useOfficial() {
  const context = useContext(OfficialContext);
  if (!context) {
    throw new Error('useOfficial must be used inside OfficialProvider.');
  }
  return context;
}
