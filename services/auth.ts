import {
    DEPT_AROGYA,
    DEPT_BANDHKAM,
    DEPT_PANI,
    DEPT_SWACHHATA,
    DEPT_UDYANE,
    DEPT_VIDYUT,
} from '@/data/complaints';

// ─── Department Officers — Demo Credentials ──────────────────────────────────
export interface DeptDemoCredential {
  deptName: string;
  username: string;
  password: string;
  officerName: string;
  phone: string;
  email: string;
  designation: string;
  employeeId: string;
}

export const DEPT_DEMO_CREDENTIALS: DeptDemoCredential[] = [
  {
    deptName: DEPT_BANDHKAM,
    username: 'bandhkaam',
    password: 'dept@123',
    officerName: 'Ramesh Sawant',
    phone: '9420100101',
    email: 'ramesh.sawant@malvan.gov.in',
    designation: 'Junior Engineer',
    employeeId: 'MMC-2026-D01',
  },
  {
    deptName: DEPT_PANI,
    username: 'water',
    password: 'dept@123',
    officerName: 'Ajay More',
    phone: '9420100102',
    email: 'ajay.more@malvan.gov.in',
    designation: 'Water Works Engineer',
    employeeId: 'MMC-2026-D02',
  },
  {
    deptName: DEPT_SWACHHATA,
    username: 'garbage',
    password: 'dept@123',
    officerName: 'Sneha Jadhav',
    phone: '9420100103',
    email: 'sneha.jadhav@malvan.gov.in',
    designation: 'Sanitation Inspector',
    employeeId: 'MMC-2026-D03',
  },
  {
    deptName: DEPT_VIDYUT,
    username: 'electric',
    password: 'dept@123',
    officerName: 'Vijaya Patil',
    phone: '9420100104',
    email: 'vijaya.patil@malvan.gov.in',
    designation: 'Electrical Supervisor',
    employeeId: 'MMC-2026-D04',
  },
  {
    deptName: DEPT_UDYANE,
    username: 'environment',
    password: 'dept@123',
    officerName: 'Pooja Naik',
    phone: '9420100105',
    email: 'pooja.naik@malvan.gov.in',
    designation: 'Garden Superintendent',
    employeeId: 'MMC-2026-D05',
  },
  {
    deptName: DEPT_AROGYA,
    username: 'health',
    password: 'dept@123',
    officerName: 'Dr. Vilas Palan',
    phone: '9420100106',
    email: 'vilas.palan@malvan.gov.in',
    designation: 'Health Officer',
    employeeId: 'MMC-2026-D06',
  },
];
