import { Complaint, complaints as initialComplaints } from '@/data/complaints';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      id: 'department-officer',
      label: 'Department Officer',
      role: 'department-officer',
      description: 'Escalate to the department officer responsible for this issue.',
    },
    {
      id: 'nagaradhyaksha',
      label: 'Nagaradhyaksha',
      role: 'nagaradhyaksha',
      description: 'Escalate to municipal leadership for higher review.',
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

const defaultProfile: OfficialProfile = {
  name: 'Rahul Mehta',
  phone: '9420105073',
  email: 'rahul.mehta@malvan.gov.in',
  username: 'rahul_mehta',
  password: 'password123',
  employeeId: 'MMC-2026-N02',
  designation: 'Ward Officer',
  ward: 'Ward 2',
  locality: 'Malvan Bazaar',
  department: 'Water Department',
  role: 'nagarsevak',
  roleLabel: 'Nagarsevak',
  avatarInitial: 'R',
  language: 'English',
};

const defaultPreferences: OfficialPreferences = {
  theme: 'light',
  complaintUpdates: true,
  announcements: true,
  smsAlerts: true,
};

const defaultAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Monsoon Cleanliness Drive Scheduled',
    date: '18 July 2026',
    priority: 'Pinned',
    body: 'Malvan Municipal Council has organized a ward-wide cleanliness drive starting this Monday to clean deep gutters and prevent logging.',
  },
  {
    id: 'ann-2',
    title: 'Water Supply Maintenance Update',
    date: '17 July 2026',
    priority: 'High',
    body: 'Water supply to Ward 1 and Ward 3 will be partially suspended on July 20th between 9:00 AM and 1:00 PM due to pipeline repair work.',
  },
  {
    id: 'ann-3',
    title: 'New Citizen Grievance Guidelines',
    date: '15 July 2026',
    priority: 'Normal',
    body: 'Main Admin has updated the grievance escalation timeline. Officers are requested to review the updated SOP in their manuals.',
  },
];

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
        const [storedProfile, storedComplaints, storedPreferences, storedAnnouncements] = await Promise.all([
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(COMPLAINTS_KEY),
          AsyncStorage.getItem(PREFERENCES_KEY),
          AsyncStorage.getItem(ANNOUNCEMENTS_KEY),
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

        if (storedComplaints) {
          setComplaints(JSON.parse(storedComplaints));
        } else {
          setComplaints(initialComplaints);
          await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(initialComplaints));
        }

        if (storedPreferences) {
          setPreferences(JSON.parse(storedPreferences));
        } else {
          await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(defaultPreferences));
        }

        if (storedAnnouncements) {
          setAnnouncements(JSON.parse(storedAnnouncements));
        } else {
          await AsyncStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(defaultAnnouncements));
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
    setIsAuthenticated(true);
  };

  const updateComplaintStatus = async (id: string, status: Complaint['status'], noteText?: string) => {
    const timestamp = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        const notes = [...c.notes];
        if (noteText) {
          notes.push({
            id: `note-${Date.now()}`,
            author: profile.name,
            text: `Status updated to ${status}. Note: ${noteText}`,
            createdAt: timestamp,
          });
        } else {
          notes.push({
            id: `note-${Date.now()}`,
            author: profile.name,
            text: `Status updated to ${status}.`,
            createdAt: timestamp,
          });
        }
        return {
          ...c,
          status,
          updatedAt: timestamp,
          notes,
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
  };

  const addComplaintNote = async (id: string, text: string) => {
    const timestamp = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          updatedAt: timestamp,
          notes: [
            ...c.notes,
            {
              id: `note-${Date.now()}`,
              author: profile.name,
              text,
              createdAt: timestamp,
            },
          ],
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
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
    const timestamp = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          priority: 'Emergency' as const,
          assignedDepartment: target,
          is_escalated: true,
          escalated_to: target,
          updatedAt: timestamp,
          notes: [
            ...c.notes,
            {
              id: `note-${Date.now()}`,
              author: profile.name,
              text: `Escalated to ${target}. Reason: ${reason}`,
              createdAt: timestamp,
            },
          ],
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
  };

  const softDeleteComplaint = async (id: string, deletedBy: string, reason: string) => {
    const timestamp = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          is_deleted: true,
          deleted_by: deletedBy,
          deleted_at: timestamp,
          delete_reason: reason,
          updatedAt: timestamp,
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
  };

  const restoreComplaint = async (id: string) => {
    const timestamp = new Date().toISOString();
    const updated = complaints.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          is_deleted: false,
          deleted_by: undefined,
          deleted_at: undefined,
          delete_reason: undefined,
          updatedAt: timestamp,
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setProfile(defaultProfile);
    setPreferences(defaultPreferences);
    setComplaints(initialComplaints);
    await Promise.all([
      AsyncStorage.removeItem(PROFILE_KEY),
      AsyncStorage.removeItem(PREFERENCES_KEY),
      AsyncStorage.removeItem(COMPLAINTS_KEY),
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
