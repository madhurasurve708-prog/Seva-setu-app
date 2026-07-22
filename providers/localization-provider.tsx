import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'English' | 'Marathi';

const en = {
  // Navigation & Shell
  dashboard: 'Dashboard',
  wardRepresentative: 'Ward Representative',
  today: 'Today',
  // Shared settings labels
  selectLanguage: 'Select Language',
  languageEnglish: 'English',
  languageMarathi: 'मराठी',
  // Common labels
  noComplaints: 'No complaints found',
  wardComplaints: 'Ward Complaints',
  escalatedComplaints: 'Escalated Complaints',
  escalatedDesc: 'Complaints escalated to admin for review',
  noEscalated: 'No escalated complaints at this time.',
  // Announcement (read-only for dept)
  latestNotices: 'Latest Notices',
  noAnnouncements: 'No announcements from admin yet.',
  adminNotices: 'Admin Notices',
  readOnly: 'Published by Main Admin',

  complaintExplorer: 'Complaint Explorer',
  wardWise: 'Ward Wise',
  categoryWise: 'Category Wise',
  departmentWise: 'Department Wise',
  totalComplaints: 'Total Complaints',
  pending: 'Pending',
  inProgress: 'In Progress',
  resolved: 'Resolved',
  escalated: 'Escalated',
  blockedUsers: 'Blocked Users',
  announcements: 'Announcements',
  citizens: 'Citizens',
  nagarsevaks: 'Nagarsevaks',
  departmentOfficers: 'Department Officers',
  departments: 'Departments',
  analytics: 'Analytics',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  logout: 'Logout',
  search: 'Search complaints...',
  filters: 'Filters',
  reset: 'Reset',
  all: 'All',

  // Greetings & Banners
  goodMorning: 'Good Morning,',
  goodAfternoon: 'Good Afternoon,',
  goodEvening: 'Good Evening,',
  goodNight: 'Good Night,',
  welcome: 'Welcome,',
  bannerSubtitle: 'Monitor, manage and resolve citizen complaints efficiently across your ward.',
  viewComplaints: 'View Complaints',
  filed: 'Filed',
  successRate: 'Success rate',

  // Sections
  complaintCategories: 'Complaint Categories',
  latestAnnouncements: 'Latest Announcements',
  priorityComplaints: 'Priority Complaints',
  viewAll: 'View All',
  tapToFilter: "Tap an icon to see that category's complaints.",
  urgentNeedsAttention: 'Complaints that need attention first.',

  // Categories
  all_cat: 'All Categories',
  water: 'Water Supply',
  garbage: 'Garbage Disposal',
  streetlights: 'Street Light',
  road: 'Road Damage',
  gutter: 'Gutter Blockage',
  animals: 'Animal Issues',
  traffic: 'Traffic Congestion',
  drainage: 'Drainage Issues',
  tree: 'Fallen Tree',
  other: 'Other Grievances',

  // Complaint Details & Forms
  complaintDetails: 'Complaint Details',
  citizenInfo: 'Citizen Information',
  name: 'Full Name',
  phone: 'Phone Number',
  locality: 'Locality / Area',
  ward: 'Ward Number',
  photos: 'Grievance Photos',
  uploadPhoto: 'Upload Photo',
  updateStatus: 'Update Grievance Status',
  reopen: 'Reopen (Pending)',
  acceptInProgress: 'Accept / In Progress',
  markResolved: 'Mark Resolved',
  timelineHistory: 'Timeline History',
  addNote: 'Add Note',
  escalateToDept: 'Escalate to Department',
  dateFiled: 'Date Filed',
  noPhotos: 'No photos attached by citizen',
  saveChanges: 'Save Changes',

  // Profile Form & Subtitles
  myProfile: 'My Profile',
  tapToChangePhoto: 'Tap to change profile picture',
  officialDemographics: 'Official Demographics',
  demographicsSubtitle: 'Ward info is attached from your municipal registrations record.',
  email: 'Email Address',
  username: 'Username',
  password: 'Password',
  employeeId: 'Employee ID',
  designation: 'Designation',
  department: 'Department',

  // Settings
  preferences: 'Preferences',
  notifications: 'Notifications',
  appearance: 'Appearance',
  privacyPermissions: 'Privacy & Permissions',
  security: 'Security',
  supportHelp: 'Support & Help',
  helpFAQs: 'Help & FAQs',
  privacyPolicy: 'Privacy Policy',
  termsConditions: 'Terms & Conditions',
  aboutSevaSetu: 'About Seva Setu',
  appVersion: 'App Version',
  changePassword: 'Change Password',
  darkMode: 'Dark Mode',
  language: 'Language',
  appMenu: 'App Menu',
  selectDepartment: 'Select Department',
  departmentSelection: 'Department Selection',
  departmentLogin: 'Department Login',
  departmentAccess: 'Complaint Resolution Access',
  selectYourDepartment: 'Select your department',
  demoCredentials: 'Demo credentials',
  departmentId: 'Department ID',
  signIn: 'Sign In',
  signingIn: 'Signing in…',
  officerDetails: 'Officer Details',
  responsibilities: 'Responsibilities',
  assigned: 'Assigned',
  addRemark: 'Add Remark',
  uploadCompletionPhoto: 'Upload Completion Photo',
  softDelete: 'Soft Delete',
  restore: 'Restore',
  deleteReason: 'Delete Reason',
  deletedComplaints: 'Deleted Complaints',
  activeComplaints: 'Active Complaints',
  deletedBy: 'Deleted By',
  deletedAt: 'Deleted At',
  confirmDelete: 'Confirm Delete',
  enterReason: 'Please enter a reason',
  enterPassword: 'Enter your password',
  forgotPassword: 'Forgot password?',
  showPassword: 'Show Password',
  hidePassword: 'Hide Password',
  allWards: 'All Wards',
  wardFilter: 'Ward Filter',
  complaintId: 'Complaint ID',
  citizenName: 'Citizen Name',
  localityArea: 'Locality / Area',
  category: 'Category',
  priority: 'Priority',
  status: 'Status',
  createdDate: 'Created Date',
  viewDetails: 'View Details',
  restoredSuccess: 'Complaint restored successfully',
  deletedSuccess: 'Complaint soft deleted successfully',
  validationError: 'Validation Error',
  loading: 'Loading...',
  errorInvalidCredentials: 'Invalid Department ID or Password.',
  errorRequired: 'Both fields are required.',
  deptPublicWorks: 'Public Works',
  deptPublicWorksTitle: 'Public Works Department',
  deptPublicWorksSubtitle: 'Baukhana / Public Works Department',
  deptWaterSupply: 'Water Supply',
  deptWaterSupplyTitle: 'Water Supply Department',
  deptWaterSupplySubtitle: 'Pani purvatha / Water Supply Department',
  deptSolidWaste: 'Solid Waste Management',
  deptSolidWasteTitle: 'Solid Waste Management Department',
  deptSolidWasteSubtitle: 'Ghan kachra / Solid Waste Management Department',
  deptSanitationHealth: 'Sanitation & Health',
  deptSanitationHealthTitle: 'Sanitation & Health Department',
  deptSanitationHealthSubtitle: 'Swachhata & Aarogya / Sanitation & Health Department',
  deptDrainageSewerage: 'Drainage & Sewerage',
  deptDrainageSewerageTitle: 'Drainage & Sewerage Department',
  deptDrainageSewerageSubtitle: 'Jalnissaran / Drainage & Sewerage Department',
  nagarsevak: 'Nagarsevak',
  nagaradhyaksha: 'Nagaradhyaksha',
  deptOfficer: 'Department Officer',
};

const mr: Record<keyof typeof en, string> = {
  // Navigation & Shell
  dashboard: 'डॅशबोर्ड',
  wardRepresentative: 'वॉर्ड प्रतिनिधी',
  today: 'आज',
  selectLanguage: 'भाषा निवडा',
  languageEnglish: 'English',
  languageMarathi: 'मराठी',
  noComplaints: 'कोणत्याही तक्रारी आढळल्या नाहीत',
  wardComplaints: 'वॉर्ड तक्रारी',
  escalatedComplaints: 'वर्ग केलेल्या तक्रारी',
  escalatedDesc: 'आढाव्यासाठी प्रशासनाकडे वर्ग केलेल्या तक्रारी',
  noEscalated: 'सध्या कोणत्याही वर्ग केलेल्या तक्रारी नाहीत.',
  latestNotices: 'नवीनतम सूचना',
  noAnnouncements: 'मुख्य प्रशासकाकडून अद्याप कोणत्याही घोषणा नाहीत.',
  adminNotices: 'प्रशासक सूचना',
  readOnly: 'मुख्य प्रशासकाद्वारे प्रकाशित',
  complaintExplorer: 'तक्रार शोधक',
  wardWise: 'वॉर्डनिहाय',
  categoryWise: 'वर्गनिहाय',
  departmentWise: 'विभागनिहाय',
  totalComplaints: 'एकूण तक्रारी',
  pending: 'प्रलंबित',
  inProgress: 'प्रगतीपथावर',
  resolved: 'निकाली',
  escalated: 'वर्ग केलेले',
  blockedUsers: 'ब्लॉक वापरकर्ते',
  announcements: 'घोषणा',
  citizens: 'नागरिक',
  nagarsevaks: 'नगरसेवक',
  departmentOfficers: 'विभाग अधिकारी',
  departments: 'विभाग',
  analytics: 'विश्लेषण',
  reports: 'अहवाल',
  settings: 'सेटिंग्ज',
  profile: 'प्रोफाइल',
  logout: 'लॉगआउट',
  search: 'तक्रारी शोधा...',
  filters: 'फिल्टर्स',
  reset: 'रीसेट',
  all: 'सर्व',

  // Greetings & Banners
  goodMorning: 'शुभ प्रभात,',
  goodAfternoon: 'शुभ दुपार,',
  goodEvening: 'शुभ संध्याकाळ,',
  goodNight: 'शुभ रात्री,',
  welcome: 'स्वागत आहे,',
  bannerSubtitle: 'तुमच्या वॉर्डातील नागरिकांच्या तक्रारींचे कार्यक्षमतेने संनियंत्रण, व्यवस्थापन आणि निराकरण करा.',
  viewComplaints: 'तक्रारी पहा',
  filed: 'दाखल',
  successRate: 'यशस्वी दर',

  // Sections
  complaintCategories: 'तक्रार श्रेणी',
  latestAnnouncements: 'नवीनतम घोषणा',
  priorityComplaints: 'प्राधान्य तक्रारी',
  viewAll: 'सर्व पहा',
  tapToFilter: 'त्या श्रेणीतील तक्रारी पाहण्यासाठी चिन्हावर टॅप करा.',
  urgentNeedsAttention: 'तक्रारी ज्यांवर आधी लक्ष देणे आवश्यक आहे.',

  // Categories
  all_cat: 'सर्व श्रेणी',
  water: 'पाणी पुरवठा',
  garbage: 'कचरा व्यवस्थापन',
  streetlights: 'पथदिवे',
  road: 'रस्ता दुरुस्ती',
  gutter: 'गटार तुंबणे',
  animals: 'प्राण्यांच्या समस्या',
  traffic: 'वाहतूक कोंडी',
  drainage: 'सांडपाणी समस्या',
  tree: 'झाड पडणे',
  other: 'इतर तक्रारी',

  // Complaint Details & Forms
  complaintDetails: 'तक्रार तपशील',
  citizenInfo: 'नागरिक माहिती',
  name: 'पूर्ण नाव',
  phone: 'फोन नंबर',
  locality: 'परिसर / रस्ता',
  ward: 'वॉर्ड क्रमांक',
  photos: 'तक्रार फोटो',
  uploadPhoto: 'फोटो अपलोड करा',
  updateStatus: 'तक्रार स्थिती अद्ययावत करा',
  reopen: 'पुन्हा उघडा (प्रलंबित)',
  acceptInProgress: 'स्वीकारा / प्रगतीपथावर',
  markResolved: 'निकाली काढा',
  timelineHistory: 'टाइमलाइन इतिहास',
  addNote: 'नोंद जोडा',
  escalateToDept: 'विभागाकडे वर्ग करा',
  dateFiled: 'दाखल तारीख',
  noPhotos: 'नागरिकाने फोटो जोडलेले नाहीत',
  saveChanges: 'बदल जतन करा',

  // Profile Form & Subtitles
  myProfile: 'माझी प्रोफाइल',
  tapToChangePhoto: 'प्रोफाइल फोटो बदलण्यासाठी टॅप करा',
  officialDemographics: 'अधिकृत लोकसंख्याशास्त्र',
  demographicsSubtitle: 'वॉर्ड माहिती तुमच्या नगरपरिषद नोंदणीतून जोडलेली आहे.',
  email: 'ईमेल पत्ता',
  username: 'वापरकर्ता नाव',
  password: 'पासवर्ड',
  employeeId: 'कर्मचारी आयडी',
  designation: 'पदनाम',
  department: 'विभाग',

  // Settings
  preferences: 'प्राधान्ये',
  notifications: 'सूचना',
  appearance: 'देखावा',
  privacyPermissions: 'गोपनीयता आणि परवानग्या',
  security: 'सुरक्षा',
  supportHelp: 'मदत व सहाय्य',
  helpFAQs: 'मदत व विचारले जाणारे प्रश्न',
  privacyPolicy: 'गोपनीयता धोरण',
  termsConditions: 'अटी व शर्ती',
  aboutSevaSetu: 'सेवा सेतू बद्दल',
  appVersion: 'अ‍ॅप आवृत्ती',
  changePassword: 'पासवर्ड बदला',
  darkMode: 'गडद थीम',
  language: 'भाषा',
  appMenu: 'अॅप मेनू',
  selectDepartment: 'विभाग निवडा',
  departmentSelection: 'विभाग निवड',
  departmentLogin: 'विभाग लॉगिन',
  departmentAccess: 'तक्रार निराकरण प्रवेश',
  selectYourDepartment: 'आपला विभाग निवडा',
  demoCredentials: 'डेमो क्रेडेंशियल्स',
  departmentId: 'विभाग आयडी',
  signIn: 'साइन इन',
  signingIn: 'साइन इन होत आहे…',
  officerDetails: 'अधिकारी तपशील',
  responsibilities: 'जबाबदाऱ्या',
  assigned: 'नियुक्त',
  addRemark: 'शेरा जोडा',
  uploadCompletionPhoto: 'पूर्णतेचा फोटो अपलोड करा',
  softDelete: 'काढून टाका (Soft Delete)',
  restore: 'पुनर्संचयित करा',
  deleteReason: 'हटवण्याचे कारण',
  deletedComplaints: 'हटवलेल्या तक्रारी',
  activeComplaints: 'सक्रिय तक्रारी',
  deletedBy: 'कोणाद्वारे हटवले',
  deletedAt: 'कधी हटवले',
  confirmDelete: 'हटवण्याची पुष्टी करा',
  enterReason: 'कृपया कारण प्रविष्ट करा',
  enterPassword: 'पासवर्ड प्रविष्ट करा',
  forgotPassword: 'पासवर्ड विसरलात?',
  showPassword: 'पासवर्ड दाखवा',
  hidePassword: 'पासवर्ड लपवा',
  allWards: 'सर्व वॉर्ड',
  wardFilter: 'वॉर्ड फिल्टर',
  complaintId: 'तक्रार आयडी',
  citizenName: 'नागरिकाचे नाव',
  localityArea: 'परिसर / क्षेत्र',
  category: 'श्रेणी',
  priority: 'प्राधान्य',
  status: 'स्थिती',
  createdDate: 'तयार तारीख',
  viewDetails: 'तपशील पहा',
  restoredSuccess: 'तक्रार यशस्वीरित्या पुनर्संचयित केली',
  deletedSuccess: 'तक्रार यशस्वीरित्या सॉफ्ट डिलीट केली',
  validationError: 'वैधता त्रुटी',
  loading: 'लोड होत आहे...',
  errorInvalidCredentials: 'अवैध विभाग आयडी किंवा पासवर्ड.',
  errorRequired: 'दोन्ही फील्ड आवश्यक आहेत.',
  deptPublicWorks: 'बांधकाम विभाग',
  deptPublicWorksTitle: 'बांधकाम विभाग',
  deptPublicWorksSubtitle: 'सार्वजनिक कार्य विभाग',
  deptWaterSupply: 'पाणीपुरवठा विभाग',
  deptWaterSupplyTitle: 'पाणीपुरवठा विभाग',
  deptWaterSupplySubtitle: 'पाणी पुरवठा विभाग',
  deptSolidWaste: 'घनकचरा व्यवस्थापन विभाग',
  deptSolidWasteTitle: 'घनकचरा व्यवस्थापन विभाग',
  deptSolidWasteSubtitle: 'घनकचरा व्यवस्थापन विभाग',
  deptSanitationHealth: 'स्वच्छता व आरोग्य विभाग',
  deptSanitationHealthTitle: 'स्वच्छता व आरोग्य विभाग',
  deptSanitationHealthSubtitle: 'स्वच्छता व आरोग्य विभाग',
  deptDrainageSewerage: 'जलनिस्सारण व गटार विभाग',
  deptDrainageSewerageTitle: 'जलनिस्सारण व गटार विभाग',
  deptDrainageSewerageSubtitle: 'जलनिस्सारण व गटार विभाग',
  nagarsevak: 'नगरसेवक',
  nagaradhyaksha: 'नगराध्यक्ष',
  deptOfficer: 'विभाग अधिकारी',
};

const KEY = '@seva-setu/language';

type Value = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string) => string;
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
      t: (key: string) => {
        const transKey = key as keyof typeof en;
        return (language === 'Marathi' ? mr[transKey] : en[transKey]) || en[transKey] || key;
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
