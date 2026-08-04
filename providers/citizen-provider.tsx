import {
    DEPT_AROGYA,
    DEPT_BANDHKAM,
    DEPT_PANI,
    DEPT_SWACHHATA,
    DEPT_UDYANE,
    DEPT_VIDYUT,
} from '@/data/complaints';
import type { CitizenComplaint, CitizenPreferences, CitizenProfile } from '@/types/citizen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createCitizenComplaint, getCategories, getCitizenComplaints, isCitizenAuthConfigured, uploadCitizenComplaintImage } from '@/services/citizen-api';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

// Maps citizen complaint category labels to official department names.
// The citizen never picks a department — this mapping is automatic.
const CITIZEN_CATEGORY_TO_DEPT: Record<string, string> = {
  Water:          DEPT_PANI,
  Garbage:        DEPT_SWACHHATA,
  'Street Light': DEPT_VIDYUT,
  Road:           DEPT_BANDHKAM,
  Drainage:       DEPT_BANDHKAM,
  'Stray Animals': DEPT_AROGYA,
  Tree:           DEPT_UDYANE,
  Other:          DEPT_AROGYA,
};

function resolveDepartment(category: string): string {
  return CITIZEN_CATEGORY_TO_DEPT[category] ?? DEPT_AROGYA;
}

const PROFILE_KEY = '@seva-setu/citizen-profile';
const COMPLAINTS_KEY_PREFIX = '@seva-setu/citizen-complaints';
const LEGACY_COMPLAINTS_KEY = '@seva-setu/citizen-complaints';
const PREFERENCES_KEY = '@seva-setu/citizen-preferences';
const USERS_KEY = '@seva-setu/citizen-users';
const LEGACY_PROFILE_KEYS = ['citizen', '@citizen_user_data'] as const;

const defaultPreferences: CitizenPreferences = {
  theme: 'system',
  complaintUpdates: true,
  announcements: true,
  smsAlerts: false,
};

type NewComplaint = Omit<CitizenComplaint, 'id' | 'submittedAt' | 'status' | 'ward' | 'locality'>;

const categoryAliases: Record<string, string> = { 'Street Lights': 'Street Light', Animals: 'Stray Animals' };

type CitizenContextValue = {
  ready: boolean;
  profile?: CitizenProfile;
  complaints: CitizenComplaint[];
  preferences: CitizenPreferences;
  saveProfile: (profile: CitizenProfile) => Promise<void>;
  submitComplaint: (complaint: NewComplaint) => Promise<CitizenComplaint>;
  savePreferences: (preferences: CitizenPreferences) => Promise<void>;
  logout: () => Promise<void>;
  getStoredProfile: (mobile: string) => Promise<CitizenProfile | undefined>;
};

const CitizenContext = createContext<CitizenContextValue | undefined>(undefined);

const complaintsKeyFor = (mobile: string) => `${COMPLAINTS_KEY_PREFIX}:${mobile}`;

const normalizeProfile = (next: CitizenProfile): CitizenProfile => ({
  ...next,
  name: next.fullName || next.name || '',
  phone: next.mobile || next.phone || '',
  avatar: next.profileImage || next.avatar || '',
});

async function readUsersMap(): Promise<Record<string, CitizenProfile>> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeUsersMap(users: Record<string, CitizenProfile>) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function readComplaintsForMobile(mobile: string): Promise<CitizenComplaint[]> {
  const raw = await AsyncStorage.getItem(complaintsKeyFor(mobile));
  return raw ? JSON.parse(raw) : [];
}

async function writeComplaintsForMobile(mobile: string, next: CitizenComplaint[]) {
  await AsyncStorage.setItem(complaintsKeyFor(mobile), JSON.stringify(next));
}

async function loadLiveComplaints(profile: CitizenProfile) {
  const [items, categories] = await Promise.all([getCitizenComplaints(), getCategories()]);
  const categoryById = new Map(categories.map((category) => [category.id, categoryAliases[category.name] ?? category.name]));
  return items.map((item): CitizenComplaint => ({
    id: String(item.id), title: item.title, description: item.description,
    category: categoryById.get(item.category_id) ?? 'Other', ward: profile.ward, locality: profile.locality,
    status: item.status, submittedAt: item.created_at, images: item.image_url ? [item.image_url] : [],
  }));
}

async function persistSessionProfile(profile: CitizenProfile) {
  await Promise.all([
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile)),
    AsyncStorage.setItem(LEGACY_PROFILE_KEYS[0], JSON.stringify(profile)),
    AsyncStorage.setItem(LEGACY_PROFILE_KEYS[1], JSON.stringify(profile)),
  ]);
}

async function clearSessionStorage() {
  await AsyncStorage.multiRemove([PROFILE_KEY, PREFERENCES_KEY, ...LEGACY_PROFILE_KEYS]);
}

export function CitizenProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<CitizenProfile>();
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [preferences, setPreferences] = useState<CitizenPreferences>(defaultPreferences);

  useEffect(() => {
    void (async () => {
      const [storedProfile, storedPreferences, legacyComplaintsRaw] = await Promise.all([
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(PREFERENCES_KEY),
        AsyncStorage.getItem(LEGACY_COMPLAINTS_KEY),
      ]);

      if (storedProfile) {
        const parsedProfile = normalizeProfile(JSON.parse(storedProfile));
        setProfile(parsedProfile);

        let storedComplaints = await readComplaintsForMobile(parsedProfile.mobile);
        if (storedComplaints.length === 0 && legacyComplaintsRaw) {
          storedComplaints = JSON.parse(legacyComplaintsRaw);
          await writeComplaintsForMobile(parsedProfile.mobile, storedComplaints);
          await AsyncStorage.removeItem(LEGACY_COMPLAINTS_KEY);
        }

        setComplaints(storedComplaints);
      }

      if (storedPreferences) setPreferences(JSON.parse(storedPreferences));
      setReady(true);
    })();
  }, []);

  const value = useMemo<CitizenContextValue>(
    () => ({
      ready,
      profile,
      complaints,
      preferences,
      getStoredProfile: async (mobile: string) => {
        const users = await readUsersMap();
        return users[mobile];
      },
      saveProfile: async (next) => {
        const unifiedProfile = normalizeProfile(next);
        const users = await readUsersMap();
        users[unifiedProfile.mobile] = unifiedProfile;

        let userComplaints = await readComplaintsForMobile(unifiedProfile.mobile);
        if (isCitizenAuthConfigured) {
          try {
            userComplaints = await loadLiveComplaints(unifiedProfile);
            await writeComplaintsForMobile(unifiedProfile.mobile, userComplaints);
          } catch {
            // A profile may be created before any complaint exists; preserve the last local cache if offline.
          }
        }

        setProfile(unifiedProfile);
        setComplaints(userComplaints);

        await Promise.all([persistSessionProfile(unifiedProfile), writeUsersMap(users)]);
      },
      submitComplaint: async (draft) => {
        if (!profile) throw new Error('Citizen profile is required.');
        const created = await createCitizenComplaint({
          category: draft.category,
          title: draft.title,
          description: draft.description,
          location: draft.title,
        });
        const complaint: CitizenComplaint = {
          ...draft,
          id: String(created.id),
          ward: profile.ward,
          locality: profile.locality,
          submittedAt: created.created_at,
          status: created.status,
          assignedDepartment: draft.category === 'Garbage' ? 'Sanitation Department' : undefined,
          images: draft.photoUri ? [draft.photoUri] : [],
        };
        if (draft.photoUri) await uploadCitizenComplaintImage(created.id, draft.photoUri);
        const next = [complaint, ...complaints];
        setComplaints(next);
        await writeComplaintsForMobile(profile.mobile, next);
        return complaint;
      },
      savePreferences: async (next) => {
        setPreferences(next);
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
      },
      logout: async () => {
        await clearSessionStorage();
        setProfile(undefined);
        setComplaints([]);
        setPreferences(defaultPreferences);
      },
    }),
    [complaints, preferences, profile, ready],
  );

  return <CitizenContext.Provider value={value}>{children}</CitizenContext.Provider>;
}

export function useCitizen() {
  const context = useContext(CitizenContext);
  if (!context) throw new Error('useCitizen must be used inside CitizenProvider.');
  return context;
}
