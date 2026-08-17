import {
  ClinicRegistration,
  Patient,
  Appointment,
  Invoice,
  InstallmentPlan,
  Claim,
  LabOrder,
  DentalLab,
  LabStaffAccount,
  PatientQuestion,
  PatientInsuranceDispute,
  WaitlistEntry,
  UserProfile,
  BaseInsuranceContract,
  SupplementaryInsuranceContract,
  TodayMoneyBoard,
  GreenLaneStatus,
  Branch,
  DoctorSubmission,
  DoctorRequestReminder,
  AuditLog,
} from '../types';
import {
  mockPatients,
  mockAppointments,
  mockInvoices,
  mockInstallments,
  mockClaims,
  mockLabOrders,
  mockDentalLabs,
  mockAuditLogs,
  mockWaitlist,
  mockUsers,
  defaultBaseInsurances,
  defaultSupplementaryInsurances,
  mockTodayMoneyBoard,
  mockGreenLaneStatus,
  mockBranches,
} from '../data/mockData';

export interface ClinicDataState {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  installments: InstallmentPlan[];
  claims: Claim[];
  labOrders: LabOrder[];
  auditLogs: AuditLog[];
  patientQuestions: PatientQuestion[];
  insuranceDisputes: PatientInsuranceDispute[];
  waitlist: WaitlistEntry[];
  users: UserProfile[];
  doctorSubmissions: DoctorSubmission[];
  doctorRequests: DoctorRequestReminder[];
  baseInsurances: BaseInsuranceContract[];
  supplementaryInsurances: SupplementaryInsuranceContract[];
  todayMoneyBoard: TodayMoneyBoard;
  greenLane: GreenLaneStatus;
  branches?: Branch[];
}

export type ClinicStorageData = ClinicDataState;

export const defaultClinicsList: ClinicRegistration[] = [
  {
    id: 'clinic-alborz',
    name: 'کلینیک دندان‌پزشکی تخصصی البرز',
    nationalCode: '۱۰۱۰۲۸۳۷۴۶۵',
    ownerName: 'دکتر محمدرضا کاویانی',
    ownerMobile: '09121112233',
    ownerRole: 'dentist',
    activeRoles: ['receptionist', 'dentist', 'accountant', 'manager', 'owner', 'lab'],
    createdAt: '۱۴۰۳/۰۱/۱۵',
  },
  {
    id: 'clinic-pars',
    name: 'مرکز جراحی و دندان‌پزشکی پارس',
    nationalCode: '۱۰۸۶۱۵۲۴۳۳۰',
    ownerName: 'مهندس حمیدرضا شریفی',
    ownerMobile: '09122223344',
    ownerRole: 'manager',
    activeRoles: ['receptionist', 'dentist', 'accountant', 'manager', 'owner', 'lab'],
    createdAt: '۱۴۰۳/۰۴/۲۰',
  },
];

const defaultQuestionsSeed: PatientQuestion[] = [
  {
    id: 'qa-1',
    patientId: 'p-1',
    patientName: 'علی رضایی',
    patientPhone: '09129876543',
    patientNationalId: '0012345678',
    dentistId: 'u-dentist1',
    dentistName: 'دکتر کاویانی',
    category: 'مراقبت‌های پس از درمان',
    question: 'سلام آقای دکتر، بعد از جلسه عصب‌کشی دندان ۴۶ مقداری درد ضربان‌دار در محل فک دارم. آیا مصرف قرص ایبوپروفن ۴۰۰ هر ۶ ساعت مجاز است؟',
    createdAt: '۱۴۰۵/۰۵/۱۴ - ۱۰:۳۰',
    status: 'pending',
    isClinicalUrgent: true,
    replies: [],
  },
  {
    id: 'qa-2',
    patientId: 'p-2',
    patientName: 'سارا احمدی',
    patientPhone: '09351112233',
    patientNationalId: '0023456789',
    dentistId: 'u-dentist1',
    dentistName: 'دکتر کاویانی',
    category: 'اقساط',
    question: 'آیا برای پرداخت قسط دوم درمان ایمپلنت، امکان پرداخت آنلاین مستقیم از طریق پورتال دنتورا بدون مراجعه حضوری وجود دارد؟',
    createdAt: '۱۴۰۵/۰۵/۱۲ - ۱۶:۴۵',
    status: 'answered',
    isClinicalUrgent: false,
    replies: [
      {
        id: 'rep-1',
        senderRole: 'receptionist',
        senderName: 'مریم امیری (منشی)',
        message: 'بله خانم احمدی عزیز، در تب اقساط پورتال خود می‌توانید با فشردن دکمه پرداخت آنلاین، قسط مورد نظر را تسویه فرمایید.',
        createdAt: '۱۴۰۵/۰۵/۱۲ - ۱۷:۰۰',
      },
    ],
    answer: 'بله خانم احمدی عزیز، در تب اقساط پورتال خود می‌توانید با فشردن دکمه پرداخت آنلاین، قسط مورد نظر را تسویه فرمایید.',
    answeredAt: '۱۴۰۵/۰۵/۱۲ - ۱۷:۰۰',
    repliedBy: 'مریم امیری (منشی)',
  },
];

const defaultDisputesSeed: PatientInsuranceDispute[] = [
  {
    id: 'obj-1',
    patientId: 'p-1',
    patientName: 'علی رضایی',
    patientPhone: '09129876543',
    nationalId: '0012345678',
    claimNumber: 'CLM-9021',
    insuranceProvider: 'بیمه تکمیلی دانا',
    topic: 'اعتراض به عدم تایید مدرک رادیوگرافی OPG دندان ۴۶',
    message: 'مبلغ ۳۵۰,۰۰۰ تومان بابت پریاپیکال و ریشه توسط ارزیاب کسر گردیده است. تصویر گرافی واضح مجدداً پیوست گردید.',
    imageName: 'radiography_opg_46.jpg',
    imageDesc: 'تصویر واضح گرافی پریاپیکال دندان ۴۶',
    claimedAmount: 3500000,
    deductionAmount: 350000,
    createdAt: '۱۴۰۵/۰۵/۰۸',
    status: 'under_review',
    responseMessage: 'پیام شما در واحد بیمه کلینیک دریافت گردید و جهت بررسی مجدد مدارک به کمیسیون بیمه ارسال شد.',
    lastUpdated: '۱۴۰۵/۰۵/۰۹',
  },
];

const defaultSubmissionsSeed: DoctorSubmission[] = [
  {
    id: 'sub-1',
    patientId: 'p-1',
    patientName: 'علی رضایی',
    patientPhone: '09129876543',
    nationalId: '0012345678',
    dentistName: 'دکتر کاویانی',
    treatmentSummary: 'درمان ریشه (RCT) دندان ۱۶ + ترمیم کامپوزیت ۳ سطحی',
    prescriptionSummary: 'کپسول آموکسی‌سیلین ۵۰۰ + قرص مفنامیک اسید ۲۵۰',
    clinicalNotes: 'پوسیدگی عمیق کلاس ۲ دندان ۱۶ منجر به درگیری پالپ گردیده بود.',
    toothFdi: 16,
    totalCost: 3800000,
    baseCovered: 1140000,
    supplCovered: 1520000,
    submittedAt: '۱۰:۲۵ امروز',
    status: 'pending',
  },
];

const defaultDoctorRequestsSeed: DoctorRequestReminder[] = [
  {
    id: 'dr-1',
    patientName: 'علیرضا محمدی',
    patientPhone: '۰۹۱۲۱۱۱۲۲۳۳',
    doctorName: 'دکتر نوری',
    reason: 'پیگیری ترمیم دندان ۱۴',
    suggestedDate: '۱۴۰۵/۰۵/۲۰',
    status: 'pending',
  },
];

const ZERO_MONEY_BOARD: TodayMoneyBoard = {
  receivedTodayCashPos: 0,
  insurancePendingTotal: 0,
  installmentsDueToday: 0,
  installmentsOverdueTotal: 0,
  totalInvoicedToday: 0,
  blockedClaimsCount: 0,
};

// Clinics Storage
export function loadClinics(): ClinicRegistration[] {
  try {
    const raw = localStorage.getItem('dentora_registered_clinics');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading clinics from localStorage:', e);
  }
  return defaultClinicsList;
}

export function getStoredClinics(): ClinicRegistration[] {
  return loadClinics();
}

export function saveClinics(clinics: ClinicRegistration[]): void {
  try {
    localStorage.setItem('dentora_registered_clinics', JSON.stringify(clinics));
  } catch (e) {
    console.error('Error saving clinics to localStorage:', e);
  }
}

export function saveStoredClinics(clinics: ClinicRegistration[]): void {
  saveClinics(clinics);
}

// Clinic Data Storage
export function loadClinicData(clinicId: string, clinicInfo?: ClinicRegistration): ClinicDataState {
  const storageKey = `dentora_data_${clinicId}`;
  
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        patients: parsed.patients || [],
        appointments: parsed.appointments || [],
        invoices: parsed.invoices || [],
        installments: parsed.installments || [],
        claims: parsed.claims || [],
        labOrders: parsed.labOrders || [],
        auditLogs: parsed.auditLogs || [],
        patientQuestions: parsed.patientQuestions || [],
        insuranceDisputes: parsed.insuranceDisputes || [],
        waitlist: parsed.waitlist || [],
        users: parsed.users || [],
        doctorSubmissions: parsed.doctorSubmissions || [],
        doctorRequests: parsed.doctorRequests || [],
        baseInsurances: parsed.baseInsurances || defaultBaseInsurances,
        supplementaryInsurances: parsed.supplementaryInsurances || defaultSupplementaryInsurances,
        todayMoneyBoard: parsed.todayMoneyBoard || ZERO_MONEY_BOARD,
        greenLane: parsed.greenLane || mockGreenLaneStatus,
        branches: parsed.branches || mockBranches,
      };
    }
  } catch (e) {
    console.error(`Error reading clinic data for ${clinicId}:`, e);
  }

  // If this is a default seed clinic (e.g. clinic-alborz or clinic-pars), load seed data
  if (clinicId === 'clinic-alborz' || clinicId === 'clinic-pars') {
    const isAlborz = clinicId === 'clinic-alborz';
    const clinicSpecificLabOrders: LabOrder[] = isAlborz
      ? [
          {
            id: 'lab-alb-301',
            orderNumber: 'LAB-9921',
            patientId: 'p-101',
            patientName: 'علی رضایی',
            dentistName: 'دکتر حسینی',
            toothFdi: 36,
            labName: 'لابراتوار تخصصی پارس دنتال',
            clinicId: 'clinic-alborz',
            clinicName: 'کلینیک دندان‌پزشکی البرز (شعبه ونک)',
            itemType: 'روکش زيرکونيا',
            status: 'in_furnace',
            orderedDate: '۱۴۰۵/۰۵/۰۶',
            expectedDeliveryDate: '۱۴۰۵/۰۵/۱۶',
            currentMilestone: 'مرحله پخت پودر زيرکونيا در کوره سانتر',
          },
          {
            id: 'lab-alb-302',
            orderNumber: 'LAB-9922',
            patientId: 'p-102',
            patientName: 'زهرا حسینی',
            dentistName: 'دکتر شریفی',
            toothFdi: 11,
            labName: 'لابراتوار آریا سرام',
            clinicId: 'clinic-alborz',
            clinicName: 'کلینیک دندان‌پزشکی البرز (شعبه ونک)',
            itemType: 'روکش زيرکونيا',
            status: 'shipped',
            orderedDate: '۱۴۰۵/۰۵/۰۸',
            expectedDeliveryDate: '۱۴۰۵/۰۵/۱۴',
            currentMilestone: 'تحویل به پیک جهت ارسال به کلینیک',
          },
        ]
      : [
          {
            id: 'lab-pars-301',
            orderNumber: 'LAB-9935',
            patientId: 'p-201',
            patientName: 'مریم ناصری',
            dentistName: 'دکتر کاویانی',
            toothFdi: 24,
            labName: 'لابراتوار تخصصی پارس دنتال',
            clinicId: 'clinic-pars',
            clinicName: 'مرکز تخصصی دندان‌پزشکی پارس',
            itemType: 'لمینت Emax',
            status: 'designing',
            orderedDate: '۱۴۰۵/۰۵/۱۰',
            expectedDeliveryDate: '۱۴۰۵/۰۵/۱۸',
            currentMilestone: 'در حال اسکن و طراحی دیجیتال CAD/CAM لمینت',
          },
          {
            id: 'lab-pars-302',
            orderNumber: 'LAB-9936',
            patientId: 'p-202',
            patientName: 'سهراب بختیاری',
            dentistName: 'دکتر نوری',
            toothFdi: 46,
            labName: 'لابراتوار نوین تکنیک',
            clinicId: 'clinic-pars',
            clinicName: 'مرکز تخصصی دندان‌پزشکی پارس',
            itemType: 'اباتمنت ایمپلنت',
            status: 'in_furnace',
            orderedDate: '۱۴۰۵/۰۵/۰۹',
            expectedDeliveryDate: '۱۴۰۵/۰۵/۱۷',
            currentMilestone: 'مرحله کستینگ و پخت تیتانیوم/زیرکونیا',
          },
        ];

    const seedData: ClinicDataState = {
      patients: mockPatients,
      appointments: mockAppointments,
      invoices: mockInvoices,
      installments: mockInstallments,
      claims: mockClaims,
      labOrders: clinicSpecificLabOrders,
      auditLogs: mockAuditLogs,
      patientQuestions: defaultQuestionsSeed,
      insuranceDisputes: defaultDisputesSeed,
      waitlist: mockWaitlist,
      users: mockUsers,
      doctorSubmissions: defaultSubmissionsSeed,
      doctorRequests: defaultDoctorRequestsSeed,
      baseInsurances: defaultBaseInsurances,
      supplementaryInsurances: defaultSupplementaryInsurances,
      todayMoneyBoard: mockTodayMoneyBoard,
      greenLane: mockGreenLaneStatus,
      branches: mockBranches,
    };
    saveClinicData(clinicId, seedData);
    return seedData;
  }

  // For any NEW clinic: ZERO-DATA Initialization
  const ownerUser: UserProfile = {
    id: `u-owner-${clinicId}`,
    name: clinicInfo?.ownerName || 'مدیر و مالک کلینیک',
    phone: clinicInfo?.ownerMobile || '09120000000',
    nationalId: '0011223344',
    role: clinicInfo?.ownerRole === 'dentist' ? 'dentist' : 'manager',
    branchIds: ['br-1'],
    isOwner: true,
    email: `${clinicId}@dentora.ir`,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  };

  const initialZeroData: ClinicDataState = {
    patients: [],
    appointments: [],
    invoices: [],
    installments: [],
    claims: [],
    labOrders: [],
    auditLogs: [],
    patientQuestions: [],
    insuranceDisputes: [],
    waitlist: [],
    users: [ownerUser],
    doctorSubmissions: [],
    doctorRequests: [],
    baseInsurances: defaultBaseInsurances,
    supplementaryInsurances: defaultSupplementaryInsurances,
    todayMoneyBoard: ZERO_MONEY_BOARD,
    greenLane: {
      active: true,
      trustLevel: 'L0',
      modules: {
        GL_M1_IdentityConsent: true,
        GL_M2_VisualFdiChart: true,
        GL_M3_ImageEvidence: true,
        GL_M4_CleanBilling: true,
        GL_M5_WormConsentToken: true,
      },
      cleanClaimRate: 100,
      averageSettlementHours: 24,
    },
    branches: [
      {
        id: 'br-1',
        name: clinicInfo ? `شعبه اصلی ${clinicInfo.name}` : 'شعبه مرکزی',
        code: 'BR-01',
        address: 'تهران، بلوار اصلی، پلاک ۱',
        phone: clinicInfo?.ownerMobile || '02188889999',
        active: true,
      },
    ],
  };

  saveClinicData(clinicId, initialZeroData);
  return initialZeroData;
}

export function getClinicData(clinicId: string, clinicInfo?: ClinicRegistration): ClinicDataState {
  return loadClinicData(clinicId, clinicInfo);
}

export function initClinicData(clinicId: string, isSeed = false, clinicInfo?: ClinicRegistration): ClinicDataState {
  if (isSeed) {
    return loadClinicData('clinic-alborz', clinicInfo);
  }
  const storageKey = `dentora_data_${clinicId}`;
  localStorage.removeItem(storageKey);
  return loadClinicData(clinicId, clinicInfo);
}

export function saveClinicData(clinicId: string, data: ClinicDataState): void {
  try {
    const storageKey = `dentora_data_${clinicId}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving clinic data for ${clinicId}:`, e);
  }
}

export interface MultiClinicLabOrder extends LabOrder {
  clinicId: string;
  clinicName: string;
}

/**
 * Retrieves all lab orders across all registered clinics in the system
 * so the dental lab portal can manage orders for all clinics collaboratively.
 */
export function getAllClinicsLabOrders(): MultiClinicLabOrder[] {
  const clinics = loadClinics();
  const allOrders: MultiClinicLabOrder[] = [];
  const seenIds = new Set<string>();

  for (const clinic of clinics) {
    const clinicData = loadClinicData(clinic.id, clinic);
    if (Array.isArray(clinicData.labOrders)) {
      for (const order of clinicData.labOrders) {
        let uniqueId = order.id;
        if (seenIds.has(uniqueId)) {
          uniqueId = `${clinic.id}_${order.id}`;
        }
        seenIds.add(uniqueId);

        allOrders.push({
          ...order,
          id: uniqueId,
          clinicId: order.clinicId || clinic.id,
          clinicName: order.clinicName || clinic.name,
        });
      }
    }
  }
  return allOrders;
}

/**
 * Updates a lab order's status and milestone across the appropriate clinic store,
 * ensuring bidirectional synchronization.
 */
export function updateLabOrderInClinicStore(
  orderId: string,
  status: LabOrder['status'],
  milestone: string,
  targetClinicId?: string
): { success: boolean; clinicId?: string; order?: LabOrder } {
  const clinics = loadClinics();

  const isMatch = (o: LabOrder, clinicId: string) => {
    return o.id === orderId || `${clinicId}_${o.id}` === orderId || `${clinicId}-${o.id}` === orderId;
  };

  if (targetClinicId) {
    const clinic = clinics.find((c) => c.id === targetClinicId);
    if (clinic) {
      const data = loadClinicData(clinic.id, clinic);
      const orderIdx = data.labOrders.findIndex((o) => isMatch(o, clinic.id));
      if (orderIdx !== -1) {
        data.labOrders[orderIdx] = {
          ...data.labOrders[orderIdx],
          status,
          currentMilestone: milestone,
          clinicId: clinic.id,
          clinicName: clinic.name,
        };
        saveClinicData(clinic.id, data);
        return { success: true, clinicId: clinic.id, order: data.labOrders[orderIdx] };
      }
    }
  }

  // If clinicId is not provided, search through all registered clinics
  for (const clinic of clinics) {
    const data = loadClinicData(clinic.id, clinic);
    const orderIdx = data.labOrders.findIndex((o) => isMatch(o, clinic.id));
    if (orderIdx !== -1) {
      data.labOrders[orderIdx] = {
        ...data.labOrders[orderIdx],
        status,
        currentMilestone: milestone,
        clinicId: clinic.id,
        clinicName: clinic.name,
      };
      saveClinicData(clinic.id, data);
      return { success: true, clinicId: clinic.id, order: data.labOrders[orderIdx] };
    }
  }

  return { success: false };
}

/**
 * Adds a new lab order to a specific clinic's data store.
 */
export function addLabOrderToClinicStore(
  targetClinicId: string,
  newOrder: LabOrder
): boolean {
  const clinics = loadClinics();
  const clinic = clinics.find((c) => c.id === targetClinicId) || clinics[0];
  if (!clinic) return false;

  const data = loadClinicData(clinic.id, clinic);
  const orderWithClinic: LabOrder = {
    ...newOrder,
    clinicId: clinic.id,
    clinicName: clinic.name,
  };
  data.labOrders = [orderWithClinic, ...data.labOrders];
  saveClinicData(clinic.id, data);
  return true;
}

const LABS_STORAGE_KEY = 'dentora_registered_labs';
const ACTIVE_LAB_SESSION_KEY = 'dentora_active_lab_session';
const ACTIVE_LAB_STAFF_KEY = 'dentora_active_lab_staff';

export function getStoredLabs(): DentalLab[] {
  try {
    const raw = localStorage.getItem(LABS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored labs:', e);
  }
  return mockDentalLabs;
}

export function saveStoredLabs(labs: DentalLab[]): void {
  try {
    localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(labs));
  } catch (e) {
    console.error('Error saving stored labs:', e);
  }
}

export function registerLabWithAccount(
  labData: Omit<DentalLab, 'id' | 'createdAt' | 'active' | 'staffAccounts' | 'creatorStaffId'>,
  creatorAccount: {
    fullName: string;
    username: string;
    password?: string;
    mobile: string;
  }
): { lab: DentalLab; staff: LabStaffAccount } {
  const currentLabs = getStoredLabs();
  const labId = `lab-${Date.now()}`;
  const staffId = `staff-${Date.now()}`;
  const createdAt = new Date().toLocaleDateString('fa-IR');

  const creatorStaff: LabStaffAccount = {
    id: staffId,
    labId,
    fullName: creatorAccount.fullName || labData.managerName,
    username: creatorAccount.username.trim().toLowerCase(),
    password: creatorAccount.password || '123456',
    role: 'owner',
    mobile: creatorAccount.mobile || labData.phone,
    isCreator: true,
    createdAt,
  };

  const newLab: DentalLab = {
    ...labData,
    id: labId,
    active: true,
    createdAt,
    creatorStaffId: staffId,
    staffAccounts: [creatorStaff],
  };

  const updated = [newLab, ...currentLabs];
  saveStoredLabs(updated);
  setActiveLabSession(newLab);
  setActiveLabStaffSession(creatorStaff);

  return { lab: newLab, staff: creatorStaff };
}

export function addStaffToLab(
  labId: string,
  staffData: {
    fullName: string;
    username: string;
    password?: string;
    role: 'technician' | 'staff';
    mobile: string;
  }
): LabStaffAccount | null {
  const currentLabs = getStoredLabs();
  const labIndex = currentLabs.findIndex((l) => l.id === labId);
  if (labIndex === -1) return null;

  const targetLab = currentLabs[labIndex];
  const newStaffId = `staff-${Date.now()}`;
  const newStaff: LabStaffAccount = {
    id: newStaffId,
    labId,
    fullName: staffData.fullName,
    username: staffData.username.trim().toLowerCase(),
    password: staffData.password || '123456',
    role: staffData.role,
    mobile: staffData.mobile,
    isCreator: false,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  const updatedAccounts = [...(targetLab.staffAccounts || []), newStaff];
  const updatedLab: DentalLab = {
    ...targetLab,
    staffAccounts: updatedAccounts,
  };

  currentLabs[labIndex] = updatedLab;
  saveStoredLabs(currentLabs);

  const activeLab = getActiveLabSession();
  if (activeLab && activeLab.id === labId) {
    setActiveLabSession(updatedLab);
  }

  return newStaff;
}

export function authenticateLabStaff(
  usernameOrMobile: string,
  password?: string
): { lab: DentalLab; staff: LabStaffAccount } | null {
  const labs = getStoredLabs();
  const search = usernameOrMobile.trim().toLowerCase();

  for (const lab of labs) {
    if (lab.staffAccounts && lab.staffAccounts.length > 0) {
      for (const staff of lab.staffAccounts) {
        const matchUser =
          staff.username.toLowerCase() === search ||
          staff.mobile === search ||
          staff.fullName.toLowerCase().includes(search);

        if (matchUser) {
          if (!password || !staff.password || staff.password === password) {
            setActiveLabSession(lab);
            setActiveLabStaffSession(staff);
            return { lab, staff };
          }
        }
      }
    } else {
      // Fallback if lab has no staff accounts yet (mock lab fallback)
      if (
        lab.phone === search ||
        lab.mobile === search ||
        lab.managerName.toLowerCase().includes(search) ||
        lab.name.toLowerCase().includes(search)
      ) {
        const defaultStaff: LabStaffAccount = {
          id: `staff-${lab.id}-default`,
          labId: lab.id,
          fullName: lab.managerName,
          username: lab.id,
          password: '123',
          role: 'owner',
          mobile: lab.phone,
          isCreator: true,
          createdAt: lab.createdAt,
        };
        setActiveLabSession(lab);
        setActiveLabStaffSession(defaultStaff);
        return { lab, staff: defaultStaff };
      }
    }
  }

  return null;
}

export function getActiveLabSession(): DentalLab | null {
  try {
    const raw = localStorage.getItem(ACTIVE_LAB_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading active lab session:', e);
  }
  return null;
}

export function setActiveLabSession(lab: DentalLab): void {
  try {
    localStorage.setItem(ACTIVE_LAB_SESSION_KEY, JSON.stringify(lab));
  } catch (e) {
    console.error('Error saving active lab session:', e);
  }
}

export function clearActiveLabSession(): void {
  try {
    localStorage.removeItem(ACTIVE_LAB_SESSION_KEY);
    localStorage.removeItem(ACTIVE_LAB_STAFF_KEY);
  } catch (e) {
    console.error('Error clearing active lab session:', e);
  }
}

export function getActiveLabStaffSession(): LabStaffAccount | null {
  try {
    const raw = localStorage.getItem(ACTIVE_LAB_STAFF_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading active lab staff:', e);
  }
  return null;
}

export function setActiveLabStaffSession(staff: LabStaffAccount): void {
  try {
    localStorage.setItem(ACTIVE_LAB_STAFF_KEY, JSON.stringify(staff));
  } catch (e) {
    console.error('Error saving active lab staff:', e);
  }
}



