import { Complaint } from '@/data/complaints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addOfficialComplaintNote, escalateOfficialComplaint, getOfficialAnnouncements, getOfficialComplaints, updateOfficialComplaintStatus } from '@/services/official-api';
import { clearOfficialAccessToken, getOfficialAccessToken } from '@/services/api-client';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

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
  setAuthenticatedUser: (profile: OfficialProfile) => Promise<void>;
  saveProfile: (profile: OfficialProfile) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint['status'], noteText?: string) => Promise<void>;
  addComplaintNote: (id: string, text: string) => Promise<void>;
  uploadComplaintImage: (id: string, imageUri: string) => Promise<void>;
  escalateComplaint: (id: string, department: string, reason: string) => Promise<void>;
  softDeleteComplaint: (id: string, deletedBy: string, reason: string) => Promise<void>;
  restoreComplaint: (id: string) => Promise<void>;
  savePreferences: (preferences: OfficialPreferences) => Promise<void>;
  logout: () => Promise<void>;
};

const OfficialContext = createContext<OfficialContextValue | undefined>(undefined);

export function OfficialProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<OfficialProfile>(defaultProfile);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [preferences, setPreferences] = useState<OfficialPreferences>(defaultPreferences);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);

  useEffect(() => {
    void (async () => {
      try {
        const [storedProfile, storedPreferences, token] = await Promise.all([
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(PREFERENCES_KEY),
          getOfficialAccessToken(),
        ]);

        if (storedProfile && token) {
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
          const liveComplaints = await getOfficialComplaints(normalizedProfile.role, token);
          setComplaints(liveComplaints);
          setTimeout(() => {
            void (async () => {
              try {
                setAnnouncements(await getOfficialAnnouncements(normalizedProfile.role, token));
              } catch (err) {
                console.error('Failed to load announcements:', err);
              }
            })();
          }, 8000);
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

  const saveProfile = async (next: OfficialProfile) => {
    const updated = {
      ...next,
      avatarInitial: getAvatarInitial(next.name),
      role: next.role ?? defaultProfile.role,
      roleLabel: next.roleLabel ?? defaultProfile.roleLabel,
    };
    setProfile(updated);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  };

  const savePreferences = async (next: OfficialPreferences) => {
    setPreferences(next);
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  };

  const setAuthenticatedUser = async (next: OfficialProfile) => {
    await saveProfile(next);
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired. Please sign in again.');
    const liveComplaints = await getOfficialComplaints(next.role, token);
    setComplaints(liveComplaints);
    setIsAuthenticated(true);
    setTimeout(() => {
      void (async () => {
        try {
          setAnnouncements(await getOfficialAnnouncements(next.role, token));
        } catch (err) {
          console.error('Failed to load announcements:', err);
        }
      })();
    }, 8000);
  };

  const updateComplaintStatus = async (id: string, status: Complaint['status'], noteText?: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await updateOfficialComplaintStatus(profile.role, id, status, token);
    if (noteText) await addOfficialComplaintNote(profile.role, id, noteText, token);
    setComplaints(await getOfficialComplaints(profile.role, token));
  };

  const addComplaintNote = async (id: string, text: string) => {
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await addOfficialComplaintNote(profile.role, id, text, token);
    setComplaints(await getOfficialComplaints(profile.role, token));
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
    if (profile.role !== 'nagarsevak') throw new Error('The deployed backend does not support this escalation for this role.');
    const token = await getOfficialAccessToken();
    if (!token) throw new Error('Your session has expired.');
    await escalateOfficialComplaint(id, reason, target, token);
    setComplaints(await getOfficialComplaints(profile.role, token));
  };

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
      setAuthenticatedUser,
      saveProfile,
      updateComplaintStatus,
      addComplaintNote,
      uploadComplaintImage,
      escalateComplaint,
      softDeleteComplaint,
      restoreComplaint,
      savePreferences,
      logout,
    }),
    [ready, isAuthenticated, profile, complaints, preferences, announcements]
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
