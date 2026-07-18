import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import type { CitizenComplaint, CitizenPreferences, CitizenProfile } from '@/types/citizen';

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

        const userComplaints = await readComplaintsForMobile(unifiedProfile.mobile);

        setProfile(unifiedProfile);
        setComplaints(userComplaints);

        await Promise.all([persistSessionProfile(unifiedProfile), writeUsersMap(users)]);
      },
      submitComplaint: async (draft) => {
        if (!profile) throw new Error('Citizen profile is required.');
        const complaint: CitizenComplaint = {
          ...draft,
          id: `SS-${Date.now().toString().slice(-6)}`,
          ward: profile.ward,
          locality: profile.locality,
          submittedAt: new Date().toISOString(),
          status: 'Pending',
          assignedDepartment: draft.category === 'Garbage' ? 'Sanitation Department' : undefined,
        };
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
