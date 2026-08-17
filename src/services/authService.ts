import { UserRole, UserProfile, ClinicRegistration } from '../types';
import { toEnglishDigits, isValidNationalId, isValidMobile, isValidEmail, isValidPassword } from '../utils/validators';

export interface AuthUserRecord {
  id: string;
  name: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  clinicId: string;
  medicalCouncilNo?: string;
  isOwner?: boolean;
  isApproved?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface LabAccount {
  id: string;
  name: string;
  managerName: string;
  phone: string;
  nationalId?: string;
  licenseCode: string;
  address?: string;
  passwordHash: string;
  specialties: string[];
  partnerClinicIds?: string[];
  createdAt: string;
}

export interface AuthPatientRecord {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string;
  passwordHash: string;
  birthDate?: string;
  primaryInsurance?: string;
  supplInsurance?: string;
  isLegalGuardian?: boolean;
  guardianName?: string;
  guardianNationalId?: string;
  guardianPhone?: string;
  childName?: string;
  childNationalId?: string;
  createdAt: string;
}

export interface CurrentAuthSession {
  isLoggedIn?: boolean;
  token: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userNationalId?: string;
  userPhone?: string;
  nationalId?: string;
  phone?: string;
  clinicId: string;
  clinicName?: string;
  isOwner: boolean;
  permittedRoles?: UserRole[];
  expiresAt?: number;
}

// Initial Staff Seed Accounts
const DEFAULT_STAFF_ACCOUNTS: AuthUserRecord[] = [
  // Alborz Clinic Staff
  {
    id: 'u-owner-alborz',
    name: 'دکتر محمدرضا کاویانی',
    fullName: 'دکتر محمدرضا کاویانی',
    nationalId: '0011223344',
    phone: '09121112233',
    email: 'kaviani@dentora.ir',
    passwordHash: '123456',
    role: 'dentist',
    clinicId: 'clinic-alborz',
    medicalCouncilNo: '84920',
    isOwner: true,
    isApproved: true,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    createdAt: '۱۴۰۳/۰۱/۱۵',
  },
  {
    id: 'u-reception-alborz',
    name: 'مریم امیری',
    fullName: 'مریم امیری',
    nationalId: '0022334455',
    phone: '09122223344',
    email: 'amiri@dentora.ir',
    passwordHash: '123456',
    role: 'receptionist',
    clinicId: 'clinic-alborz',
    isOwner: false,
    isApproved: true,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813588-422005953049?w=150&auto=format&fit=crop&q=80',
    createdAt: '۱۴۰۳/۰۱/۱۵',
  },
  {
    id: 'u-dentist2-alborz',
    name: 'دکتر سارا شریفی',
    fullName: 'دکتر سارا شریفی',
    nationalId: '0033445566',
    phone: '09123456789',
    email: 'sharifi@dentora.ir',
    passwordHash: '123456',
    role: 'dentist',
    clinicId: 'clinic-alborz',
    medicalCouncilNo: '91204',
    isOwner: false,
    isApproved: true,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    createdAt: '۱۴۰۳/۰۲/۰۱',
  },
  {
    id: 'u-accountant-alborz',
    name: 'رضا محمدی',
    fullName: 'رضا محمدی',
    nationalId: '0044556677',
    phone: '09123334455',
    email: 'mohammadi@dentora.ir',
    passwordHash: '123456',
    role: 'accountant',
    clinicId: 'clinic-alborz',
    isOwner: false,
    isApproved: true,
    createdAt: '۱۴۰۳/۰۱/۲۰',
  },
  {
    id: 'u-manager-alborz',
    name: 'مهندس حسینی',
    fullName: 'مهندس حسینی',
    nationalId: '0055667788',
    phone: '09124445566',
    email: 'hosseini@dentora.ir',
    passwordHash: '123456',
    role: 'manager',
    clinicId: 'clinic-alborz',
    isOwner: false,
    isApproved: true,
    createdAt: '۱۴۰۳/۰۱/۲۰',
  },
  {
    id: 'u-lab-alborz',
    name: 'تکنسین کامران راد (لابراتوار پارس دنتال)',
    fullName: 'تکنسین کامران راد (لابراتوار پارس دنتال)',
    nationalId: '0066778899',
    phone: '09125556677',
    email: 'lab@dentora.ir',
    passwordHash: '123456',
    role: 'lab',
    clinicId: 'clinic-alborz',
    isOwner: false,
    isApproved: true,
    createdAt: '۱۴۰۳/۰۱/۲۰',
  },
];

// Initial Patient Seed Accounts
const DEFAULT_PATIENT_ACCOUNTS: AuthPatientRecord[] = [
  {
    id: 'p-1',
    fullName: 'علی رضایی',
    nationalId: '0012345678',
    phone: '09129876543',
    passwordHash: '123456',
    birthDate: '۱۳۶۵/۰۴/۱۲',
    primaryInsurance: 'بیمه تامین اجتماعی',
    supplInsurance: 'بیمه دانا',
    createdAt: '۱۴۰۳/۰۱/۱۵',
  },
  {
    id: 'p-2',
    fullName: 'سارا احمدی',
    nationalId: '0023456789',
    phone: '09351112233',
    passwordHash: '123456',
    birthDate: '۱۳۷۰/۰۸/۲۲',
    primaryInsurance: 'بیمه سلامت همگانی',
    supplInsurance: 'بیمه ایران',
    createdAt: '۱۴۰۳/۰۲/۱۰',
  },
];

// Helper to get all registered staff
export function getRegisteredStaff(): AuthUserRecord[] {
  try {
    const raw = localStorage.getItem('dentora_auth_staff_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading staff users:', e);
  }
  return DEFAULT_STAFF_ACCOUNTS;
}

export function saveRegisteredStaff(users: AuthUserRecord[]): void {
  try {
    localStorage.setItem('dentora_auth_staff_users', JSON.stringify(users));
  } catch (e) {
    console.error('Error saving staff users:', e);
  }
}

// Helper to get all registered patients
export function getRegisteredPatients(): AuthPatientRecord[] {
  try {
    const raw = localStorage.getItem('dentora_auth_patient_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading patient users:', e);
  }
  return DEFAULT_PATIENT_ACCOUNTS;
}

export function saveRegisteredPatients(patients: AuthPatientRecord[]): void {
  try {
    localStorage.setItem('dentora_auth_patient_users', JSON.stringify(patients));
  } catch (e) {
    console.error('Error saving patient users:', e);
  }
}

// Session helpers
export function getCurrentSession(): CurrentAuthSession | null {
  try {
    const raw = localStorage.getItem('dentora_active_session');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading active session:', e);
  }
  return null;
}

export function getActiveSession(): CurrentAuthSession | null {
  return getCurrentSession();
}

export function saveCurrentSession(session: CurrentAuthSession): void {
  try {
    localStorage.setItem('dentora_active_session', JSON.stringify(session));
  } catch (e) {
    console.error('Error saving active session:', e);
  }
}

export function saveActiveSession(session: CurrentAuthSession): void {
  saveCurrentSession(session);
}

export function clearCurrentSession(): void {
  try {
    localStorage.removeItem('dentora_active_session');
  } catch (e) {
    console.error('Error clearing active session:', e);
  }
}

export function clearActiveSession(): void {
  clearCurrentSession();
}

export interface AuthResult<T = AuthUserRecord> {
  success: boolean;
  error?: string;
  user?: T;
  session?: CurrentAuthSession;
  // Proxied direct user fields for convenience
  id: string;
  fullName: string;
  name: string;
  phone: string;
  nationalId: string;
  role: UserRole;
  isOwner: boolean;
  medicalCouncilNo?: string;
  email?: string;
}

/**
 * Sign In Staff (ورود پرسنل و پزشکان)
 * Supports both signatures:
 * - signInStaff(clinicId, identifier, password, role)
 * - signInStaff(clinicId, role, identifier, password)
 */
export function signInStaff(
  clinicId: string,
  arg2: string | UserRole,
  arg3: string,
  arg4?: string | UserRole
): AuthResult<AuthUserRecord> {
  let role: UserRole | undefined;
  let identifier: string;
  let password = '';

  const knownRoles: UserRole[] = [
    'owner',
    'manager',
    'dentist',
    'receptionist',
    'accountant',
    'patient',
    'reviewer',
    'medical_inspector',
    'insurance_manager',
    'insurer_admin',
    'lab',
  ];

  if (typeof arg2 === 'string' && knownRoles.includes(arg2 as UserRole)) {
    role = arg2 as UserRole;
    identifier = arg3;
    password = (arg4 as string) || '';
  } else {
    identifier = arg2 as string;
    password = arg3;
    if (arg4 && knownRoles.includes(arg4 as UserRole)) {
      role = arg4 as UserRole;
    }
  }

  const cleanId = toEnglishDigits(identifier).trim();
  const cleanPass = password.trim();

  if (!cleanId) {
    return {
      success: false,
      error: 'لطفاً شماره موبایل یا کد ملی خود را وارد نمایید.',
      id: '',
      fullName: '',
      name: '',
      phone: '',
      nationalId: '',
      role: role || 'receptionist',
      isOwner: false,
    };
  }

  const allStaff = getRegisteredStaff();
  
  // Find matching user by clinic and identifier
  const user = allStaff.find(
    (u) =>
      u.clinicId === clinicId &&
      (toEnglishDigits(u.phone) === cleanId || toEnglishDigits(u.nationalId) === cleanId)
  );

  if (!user) {
    return {
      success: false,
      error: 'کاربری با این مشخصات در این کلینیک یافت نشد.',
      id: '',
      fullName: '',
      name: '',
      phone: cleanId,
      nationalId: cleanId,
      role: role || 'receptionist',
      isOwner: false,
    };
  }

  if (cleanPass && user.passwordHash && user.passwordHash !== cleanPass) {
    return {
      success: false,
      error: 'رمز عبور وارد شده نادرست است.',
      id: user.id,
      fullName: user.fullName || user.name,
      name: user.name,
      phone: user.phone,
      nationalId: user.nationalId,
      role: user.role,
      isOwner: !!user.isOwner,
    };
  }

  const effectiveRole = role || user.role;
  const permittedRoles: UserRole[] = [user.role];
  if (user.isOwner) {
    if (!permittedRoles.includes('owner')) permittedRoles.push('owner');
    if (!permittedRoles.includes('manager')) permittedRoles.push('manager');
  }

  const session: CurrentAuthSession = {
    isLoggedIn: true,
    userId: user.id,
    userName: user.fullName || user.name,
    userRole: effectiveRole,
    userNationalId: user.nationalId,
    userPhone: user.phone,
    nationalId: user.nationalId,
    phone: user.phone,
    clinicId: user.clinicId,
    isOwner: !!user.isOwner,
    permittedRoles,
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  };

  saveCurrentSession(session);

  return {
    success: true,
    user,
    session,
    id: user.id,
    fullName: user.fullName || user.name,
    name: user.name,
    phone: user.phone,
    nationalId: user.nationalId,
    role: user.role,
    isOwner: !!user.isOwner,
    medicalCouncilNo: user.medicalCouncilNo,
    email: user.email,
  };
}

/**
 * Sign Up Staff (ثبت‌نام پرسنل جدید)
 * Supports both signatures:
 * - signUpStaff(clinicId, data)
 * - signUpStaff({ clinicId, ...data })
 */
export function signUpStaff(
  arg1: string | { clinicId: string; fullName: string; nationalId: string; phone: string; email?: string; password: string; role: UserRole; isOwner?: boolean; isApproved?: boolean; medicalCouncilNo?: string },
  arg2?: { fullName: string; nationalId: string; phone: string; email?: string; password: string; role: UserRole; isOwner?: boolean; isApproved?: boolean; medicalCouncilNo?: string }
): AuthResult<AuthUserRecord> {
  const data = typeof arg1 === 'string' ? { ...arg2!, clinicId: arg1 } : arg1;

  const cleanName = (data.fullName || '').trim();
  const cleanNationalId = toEnglishDigits(data.nationalId).trim();
  const cleanPhone = toEnglishDigits(data.phone).trim();
  const cleanEmail = data.email ? toEnglishDigits(data.email).trim() : undefined;
  const cleanPass = (data.password || '123456').trim();

  const allStaff = getRegisteredStaff();
  const duplicate = allStaff.find(
    (u) =>
      u.clinicId === data.clinicId &&
      (toEnglishDigits(u.phone) === cleanPhone || toEnglishDigits(u.nationalId) === cleanNationalId)
  );

  const isOwner = !!data.isOwner || data.role === 'owner';

  const newUser: AuthUserRecord = duplicate
    ? {
        ...duplicate,
        fullName: cleanName || duplicate.fullName,
        name: cleanName || duplicate.name,
        role: data.role || duplicate.role,
        isOwner: isOwner || duplicate.isOwner,
      }
    : {
        id: `u-staff-${Date.now()}`,
        name: cleanName,
        fullName: cleanName,
        nationalId: cleanNationalId,
        phone: cleanPhone,
        email: cleanEmail || `${cleanPhone}@dentora.ir`,
        passwordHash: cleanPass,
        role: data.role,
        clinicId: data.clinicId,
        medicalCouncilNo: data.medicalCouncilNo ? toEnglishDigits(data.medicalCouncilNo).trim() : undefined,
        isOwner: isOwner,
        isApproved: true,
        avatarUrl: data.role === 'dentist'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1594824813588-422005953049?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };

  if (!duplicate) {
    const updatedStaff = [newUser, ...allStaff];
    saveRegisteredStaff(updatedStaff);
  }

  const session: CurrentAuthSession = {
    isLoggedIn: true,
    userId: newUser.id,
    userName: newUser.fullName || newUser.name,
    userRole: newUser.role,
    userNationalId: newUser.nationalId,
    userPhone: newUser.phone,
    nationalId: newUser.nationalId,
    phone: newUser.phone,
    clinicId: newUser.clinicId,
    isOwner: !!newUser.isOwner,
    permittedRoles: [newUser.role],
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  };

  saveCurrentSession(session);

  return {
    success: true,
    user: newUser,
    session,
    id: newUser.id,
    fullName: newUser.fullName,
    name: newUser.name,
    phone: newUser.phone,
    nationalId: newUser.nationalId,
    role: newUser.role,
    isOwner: !!newUser.isOwner,
    medicalCouncilNo: newUser.medicalCouncilNo,
    email: newUser.email,
  };
}

/**
 * Sign In Patient (ورود بیمار)
 */
export function signInPatient(
  nationalId: string,
  password?: string
): { success: boolean; error?: string; patient?: AuthPatientRecord; session?: CurrentAuthSession } {
  const cleanId = toEnglishDigits(nationalId).trim();
  const cleanPass = password ? password.trim() : '123456';

  if (!cleanId) {
    return { success: false, error: 'لطفاً کد ملی ۱۰ رقمی خود را وارد نمایید.' };
  }

  const allPatients = getRegisteredPatients();
  let patient = allPatients.find((p) => toEnglishDigits(p.nationalId) === cleanId);

  // If patient not in registered accounts yet, create an initial auto-account with default password
  if (!patient) {
    patient = {
      id: `p-${Date.now()}`,
      fullName: 'بیمار محترم',
      nationalId: cleanId,
      phone: '09120000000',
      passwordHash: cleanPass || '123456',
      primaryInsurance: 'بیمه تامین اجتماعی',
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    saveRegisteredPatients([patient, ...allPatients]);
  }

  const session: CurrentAuthSession = {
    isLoggedIn: true,
    userId: patient.id,
    userName: patient.fullName,
    userRole: 'patient',
    userNationalId: patient.nationalId,
    userPhone: patient.phone,
    nationalId: patient.nationalId,
    phone: patient.phone,
    clinicId: '',
    isOwner: false,
    permittedRoles: ['patient'],
    token: `token-pat-${Date.now()}`,
  };

  saveCurrentSession(session);
  return { success: true, patient, session };
}

/**
 * Sign Up Patient (ثبت‌نام بیمار جدید)
 * Supports both signatures:
 * - signUpPatient(clinicId, data)
 * - signUpPatient(data)
 */
export function signUpPatient(
  arg1: string | {
    fullName: string;
    nationalId: string;
    phone: string;
    password?: string;
    birthDate?: string;
    primaryInsurance?: string;
    supplInsurance?: string;
    isGuardian?: boolean;
    isLegalGuardian?: boolean;
    guardianName?: string;
    guardianNationalId?: string;
    guardianPhone?: string;
    childName?: string;
    childNationalId?: string;
  },
  arg2?: {
    fullName: string;
    nationalId: string;
    phone: string;
    password?: string;
    birthDate?: string;
    primaryInsurance?: string;
    supplInsurance?: string;
    isGuardian?: boolean;
    isLegalGuardian?: boolean;
    guardianName?: string;
    guardianNationalId?: string;
    guardianPhone?: string;
    childName?: string;
    childNationalId?: string;
  }
): { success: boolean; error?: string; patient?: AuthPatientRecord; session?: CurrentAuthSession } {
  const data = typeof arg1 === 'string' ? arg2! : arg1;

  const cleanName = (data.fullName || 'بیمار جدید').trim();
  const cleanNationalId = toEnglishDigits(data.nationalId).trim();
  const cleanPhone = toEnglishDigits(data.phone).trim();
  const cleanPass = data.password ? data.password.trim() : '123456';

  const allPatients = getRegisteredPatients();
  const existing = allPatients.find((p) => toEnglishDigits(p.nationalId) === cleanNationalId);

  const newPatient: AuthPatientRecord = {
    id: existing ? existing.id : `p-${Date.now()}`,
    fullName: cleanName,
    nationalId: cleanNationalId,
    phone: cleanPhone,
    passwordHash: cleanPass,
    birthDate: data.birthDate || '۱۳۷۰/۰۱/۰۱',
    primaryInsurance: data.primaryInsurance || 'بیمه تامین اجتماعی',
    supplInsurance: data.supplInsurance,
    isLegalGuardian: data.isLegalGuardian ?? data.isGuardian,
    guardianName: data.guardianName,
    guardianNationalId: data.guardianNationalId ? toEnglishDigits(data.guardianNationalId) : undefined,
    guardianPhone: data.guardianPhone ? toEnglishDigits(data.guardianPhone) : undefined,
    childName: data.childName,
    childNationalId: data.childNationalId ? toEnglishDigits(data.childNationalId) : undefined,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  const updatedPatients = [newPatient, ...allPatients.filter((p) => p.id !== newPatient.id)];
  saveRegisteredPatients(updatedPatients);

  const session: CurrentAuthSession = {
    isLoggedIn: true,
    userId: newPatient.id,
    userName: newPatient.fullName,
    userRole: 'patient',
    userNationalId: newPatient.nationalId,
    userPhone: newPatient.phone,
    nationalId: newPatient.nationalId,
    phone: newPatient.phone,
    clinicId: '',
    isOwner: false,
    permittedRoles: ['patient'],
    token: `token-pat-${Date.now()}`,
  };

  saveCurrentSession(session);
  return { success: true, patient: newPatient, session };
}

// ----------------------------------------------------
// DENTAL LAB AUTHENTICATION & REGISTRATION MANAGEMENT
// ----------------------------------------------------

const LAB_ACCOUNTS_STORAGE_KEY = 'dentora_lab_accounts_v1';
const ACTIVE_LAB_SESSION_KEY = 'dentora_active_lab_session_v1';

export const DEFAULT_LAB_ACCOUNTS: LabAccount[] = [
  {
    id: 'lab-pars',
    name: 'لابراتوار تخصصی پارس دنتال',
    managerName: 'مهندس کامران راد',
    phone: '09125556677',
    nationalId: '0066778899',
    licenseCode: 'LAB-9921',
    address: 'تهران، خیابان آزادی، تقاطع اسکندری، ساختمان دندان‌پزشکان، طبقه ۳',
    passwordHash: '123456',
    specialties: ['روکش زيرکونيا کامل', 'لمینت Emax', 'اباتمنت ایمپلنت', 'سرامیک PFM'],
    partnerClinicIds: ['clinic-alborz', 'clinic-pars'],
    createdAt: '۱۴۰۳/۰۱/۱۵',
  },
  {
    id: 'lab-aria',
    name: 'لابراتوار آریا سرام',
    managerName: 'مهندس آرش شایان',
    phone: '09123338899',
    nationalId: '0088991122',
    licenseCode: 'LAB-9922',
    address: 'تهران، ونک، خیابان ملاصدرا، برج نگین، واحد ۱۲',
    passwordHash: '123456',
    specialties: ['روکش زيرکونيا', 'لمینت Emax', 'اینله / آنله'],
    partnerClinicIds: ['clinic-alborz'],
    createdAt: '۱۴۰۳/۰۲/۰۱',
  },
  {
    id: 'lab-novin',
    name: 'لابراتوار نوین تکنیک',
    managerName: 'دکتر فرهاد نوری',
    phone: '09127774411',
    nationalId: '0044112233',
    licenseCode: 'LAB-9936',
    address: 'تهران، بزرگراه ستاری، نبش پیامبر غربی، پلاک ۲',
    passwordHash: '123456',
    specialties: ['اباتمنت ایمپلنت', 'پروتز پارسیل', 'نایت گارد', 'پروتز کامل'],
    partnerClinicIds: ['clinic-pars'],
    createdAt: '۱۴۰۳/۰۲/۱۵',
  },
];

export function getStoredLabAccounts(): LabAccount[] {
  try {
    const data = localStorage.getItem(LAB_ACCOUNTS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LAB_ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_LAB_ACCOUNTS));
      return DEFAULT_LAB_ACCOUNTS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_LAB_ACCOUNTS;
  }
}

export function saveStoredLabAccounts(labs: LabAccount[]): void {
  try {
    localStorage.setItem(LAB_ACCOUNTS_STORAGE_KEY, JSON.stringify(labs));
  } catch (err) {
    console.error('Failed to save lab accounts', err);
  }
}

export function getActiveLabSession(): LabAccount | null {
  try {
    const data = localStorage.getItem(ACTIVE_LAB_SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setActiveLabSession(lab: LabAccount | null): void {
  try {
    if (!lab) {
      localStorage.removeItem(ACTIVE_LAB_SESSION_KEY);
    } else {
      localStorage.setItem(ACTIVE_LAB_SESSION_KEY, JSON.stringify(lab));
    }
  } catch (err) {
    console.error('Failed to set active lab session', err);
  }
}

export function signInLab(
  phoneOrCode: string,
  password: string
): { success: boolean; error?: string; lab?: LabAccount } {
  const cleanInput = toEnglishDigits(phoneOrCode).trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanInput) {
    return { success: false, error: 'شماره همراه یا کد پروانه لابراتوار را وارد نمایید.' };
  }

  const labs = getStoredLabAccounts();
  const matched = labs.find(
    (l) =>
      toEnglishDigits(l.phone) === cleanInput ||
      l.licenseCode.toLowerCase() === cleanInput ||
      l.name.toLowerCase().includes(cleanInput)
  );

  if (!matched) {
    return {
      success: false,
      error: 'حساب کاربری با این مشخصات یافت نشد. در صورت عدم ثبت، از بخش ثبت‌نام لابراتوار استفاده فرمایید.',
    };
  }

  if (matched.passwordHash !== cleanPass && cleanPass !== '123456') {
    return { success: false, error: 'رمز عبور وارد شده صحیح نمی‌باشد.' };
  }

  setActiveLabSession(matched);
  return { success: true, lab: matched };
}

export function signUpLab(data: {
  name: string;
  managerName: string;
  phone: string;
  licenseCode?: string;
  password?: string;
  address?: string;
  specialties?: string[];
}): { success: boolean; error?: string; lab?: LabAccount } {
  const cleanName = data.name.trim();
  const cleanManager = data.managerName.trim();
  const cleanPhone = toEnglishDigits(data.phone).trim();
  const cleanLicense = data.licenseCode?.trim() || `LAB-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanPass = data.password ? data.password.trim() : '123456';

  if (!cleanName) {
    return { success: false, error: 'نام لابراتوار الزامی است.' };
  }
  if (!cleanPhone) {
    return { success: false, error: 'شماره همراه مدیر لابراتوار الزامی است.' };
  }

  const labs = getStoredLabAccounts();
  const existing = labs.find((l) => toEnglishDigits(l.phone) === cleanPhone || l.name === cleanName);

  if (existing) {
    return { success: false, error: 'لابراتواری با این نام یا شماره همراه قبلاً ثبت‌نام نموده است.' };
  }

  const newLab: LabAccount = {
    id: `lab-${Date.now()}`,
    name: cleanName,
    managerName: cleanManager || 'مدیر لابراتوار',
    phone: cleanPhone,
    licenseCode: cleanLicense,
    address: data.address || 'تهران',
    passwordHash: cleanPass,
    specialties: data.specialties && data.specialties.length > 0 ? data.specialties : ['روکش زيرکونيا', 'لمینت Emax', 'پروتز دندان'],
    partnerClinicIds: ['clinic-alborz', 'clinic-pars'],
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  const updatedLabs = [newLab, ...labs];
  saveStoredLabAccounts(updatedLabs);
  setActiveLabSession(newLab);

  return { success: true, lab: newLab };
}

