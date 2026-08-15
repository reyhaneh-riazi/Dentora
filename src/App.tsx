import React, { useState } from 'react';
import {
  UserRole,
  Patient,
  Appointment,
  WaitlistEntry,
  Invoice,
  InstallmentPlan,
  Claim,
  TodayMoneyBoard,
  GreenLaneStatus,
  LabOrder,
  AuditLog,
  ToothDetail,
  UserProfile,
  ClinicRegistration,
  BaseInsuranceContract,
  SupplementaryInsuranceContract,
  DoctorSubmission,
  DoctorRequestReminder,
} from './types';
import {
  mockPatients,
  mockAppointments,
  mockWaitlist,
  mockInvoices,
  mockInstallments,
  mockTodayMoneyBoard,
  mockClaims,
  mockGreenLaneStatus,
  mockLabOrders,
  mockAuditLogs,
  mockUsers,
  mockBranches,
  defaultBaseInsurances,
  defaultSupplementaryInsurances,
} from './data/mockData';

import { Header } from './components/Header';
import { DentoraLandingPage } from './components/landing/DentoraLandingPage';
import { ClinicPortalLanding } from './components/landing/ClinicPortalLanding';
import { InsurerLandingPage } from './components/landing/InsurerLandingPage';

import { AppointmentsView } from './components/reception/AppointmentsView';
import { DentistWorkspace } from './components/dentist/DentistWorkspace';
import { AccountantWorkspace } from './components/financial/AccountantWorkspace';
import { OwnerWorkspace } from './components/owner/OwnerWorkspace';
import { InsuranceBridgeView } from './components/insurance/InsuranceBridgeView';
import { InsuranceReviewerWorkspace } from './components/insurance/InsuranceReviewerWorkspace';
import { MedicalReviewerWorkspace } from './components/insurance/MedicalReviewerWorkspace';
import { InsuranceManagerWorkspace } from './components/insurance/InsuranceManagerWorkspace';
import { InsuranceAdminWorkspace } from './components/insurance/InsuranceAdminWorkspace';
import { PatientPortal } from './components/patient/PatientPortal';
import { ManagerWorkspace } from './components/manager/ManagerWorkspace';
import { LabPortalView } from './components/lab/LabPortalView';
import { MigrationView } from './components/migration/MigrationView';

export default function App() {
  // Navigation & View State
  const [viewMode, setViewMode] = useState<'dentora_landing' | 'clinic_portal' | 'insurer_landing' | 'workspace'>('dentora_landing');

  // Registered Clinics
  const defaultClinics: ClinicRegistration[] = [
    {
      id: 'clinic-alborz',
      name: 'کلینیک تخصصی البرز',
      nationalCode: '۱۴۰۰۸۸۸۷۷۶۶',
      ownerName: 'دکتر محمدرضا البرزی',
      ownerMobile: '09121112233',
      ownerRole: 'dentist',
      activeRoles: ['receptionist', 'dentist', 'accountant', 'manager', 'owner'],
      createdAt: '۱۴۰۳/۰۱/۱۵',
    },
    {
      id: 'clinic-pars',
      name: 'کلینیک دندان‌پزشکی پارس',
      nationalCode: '۱۴۰۰۱۲۳۴۵۶۷',
      ownerName: 'دکتر امیرحسین حسینی',
      ownerMobile: '09123334455',
      ownerRole: 'dentist',
      activeRoles: ['receptionist', 'dentist', 'accountant', 'owner'],
      createdAt: '۱۴۰۳/۰۲/۱۰',
    },
    {
      id: 'clinic-mehr',
      name: 'بیمارستان تخصصی دندان‌پزشکی مهر',
      nationalCode: '۱۴۰۰۷۷۷۶۶۵۵',
      ownerName: 'مهندس کامران کریمی',
      ownerMobile: '09125556677',
      ownerRole: 'manager',
      activeRoles: ['receptionist', 'dentist', 'accountant', 'manager', 'owner'],
      createdAt: '۱۴۰۳/۰۳/۲۰',
    },
  ];

  const [clinics, setClinics] = useState<ClinicRegistration[]>(defaultClinics);
  const [currentClinic, setCurrentClinic] = useState<ClinicRegistration>(defaultClinics[0]);

  // Session & User Privileges State
  const [currentRole, setCurrentRole] = useState<UserRole>('receptionist');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [currentUserName, setCurrentUserName] = useState<string>('مریم امیری');

  // Global Settings & Network Connection Status
  const [activeBranchId, setActiveBranchId] = useState<string>('br-1');
  const [insuranceModuleActive, setInsuranceModuleActive] = useState<boolean>(true);
  const [isInsuranceContracted, setIsInsuranceContracted] = useState<boolean>(true);
  const [bnplActive, setBnplActive] = useState<boolean>(true);
  const [hasAccountantRole, setHasAccountantRole] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Contracted Insurances State
  const [baseInsurances, setBaseInsurances] = useState<BaseInsuranceContract[]>(defaultBaseInsurances);
  const [supplementaryInsurances, setSupplementaryInsurances] = useState<SupplementaryInsuranceContract[]>(defaultSupplementaryInsurances);

  // Insurance & Owner Handlers
  const handleToggleBaseInsuranceContracted = (id: string) => {
    setBaseInsurances((prev) =>
      prev.map((b) => (b.id === id ? { ...b, contracted: !b.contracted } : b))
    );
  };

  const handleUpdateBaseInsuranceFranchise = (id: string, franchisePercent: number) => {
    setBaseInsurances((prev) =>
      prev.map((b) => (b.id === id ? { ...b, franchisePercent } : b))
    );
  };

  const handleToggleSupplementaryInsuranceContracted = (id: string) => {
    setSupplementaryInsurances((prev) =>
      prev.map((s) => (s.id === id ? { ...s, contracted: !s.contracted } : s))
    );
  };

  const handleToggleSupplementaryFastSettlement = (id: string) => {
    setSupplementaryInsurances((prev) =>
      prev.map((s) => (s.id === id ? { ...s, fastSettlementL4: !s.fastSettlementL4 } : s))
    );
  };

  const handleUpdateSupplementaryMaxCoverage = (id: string, maxCoveragePerPatient: number) => {
    setSupplementaryInsurances((prev) =>
      prev.map((s) => (s.id === id ? { ...s, maxCoveragePerPatient } : s))
    );
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole, isOwnerFlag: boolean) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole,
              isOwner: isOwnerFlag,
            }
          : u
      )
    );
  };

  const handleUpdateClinicInfo = (updated: Partial<ClinicRegistration>) => {
    setCurrentClinic((prev) => ({ ...prev, ...updated }));
  };

  const handleToggleHasAccountantRole = () => {
    setHasAccountantRole((prev) => !prev);
  };

  const handleToggleConnectionStatus = () => {
    if (connectionStatus === 'online') {
      setConnectionStatus('offline');
      setSyncNotice('وضعیت سیستم به حالت آفلاین تغییر یافت (تمامی تراکنش‌ها در حافظه محلی ذخیره می‌شوند).');
    } else if (connectionStatus === 'offline') {
      setConnectionStatus('syncing');
      setSyncNotice('همگام‌سازی اطلاعات در حال انجام است...');
      setTimeout(() => {
        setConnectionStatus('online');
        setSyncNotice('همگام‌سازی با موفقیت انجام گردید. سیستم به حالت آنلاین متصل شد.');
        setTimeout(() => setSyncNotice(null), 3000);
      }, 2000);
    }
  };

  const handleToggleInsuranceContracted = () => {
    setIsInsuranceContracted((prev) => !prev);
  };

  // Entities State
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(mockWaitlist);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [installments, setInstallments] = useState<InstallmentPlan[]>(mockInstallments);
  const [todayMoneyBoard, setTodayMoneyBoard] = useState<TodayMoneyBoard>(mockTodayMoneyBoard);
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [greenLane, setGreenLane] = useState<GreenLaneStatus>(mockGreenLaneStatus);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(mockLabOrders);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [doctorSubmissions, setDoctorSubmissions] = useState<DoctorSubmission[]>([
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
    {
      id: 'sub-2',
      patientId: 'p-2',
      patientName: 'مریم سادات حسینی',
      patientPhone: '09351112233',
      nationalId: '0078899112',
      dentistName: 'دکتر نوری',
      treatmentSummary: 'جرم‌گیری و بروساژ دو فک + گرافی تک‌دندان RVG',
      prescriptionSummary: 'دهان‌شویه کلرهگزیدین ۰.۱۲٪',
      clinicalNotes: 'جرم عمیق تحت لثه‌ای برطرف گردید.',
      toothFdi: 26,
      totalCost: 1500000,
      baseCovered: 450000,
      supplCovered: 600000,
      submittedAt: '۱۱:۱۰ امروز',
      status: 'pending',
    },
  ]);

  const [doctorRequests, setDoctorRequests] = useState<DoctorRequestReminder[]>([
    {
      id: 'dr-1',
      patientName: 'علیرضا محمدی',
      patientPhone: '۰۹۱۲۱۱۱۲۲۳۳',
      doctorName: 'دکتر نوری',
      reason: 'پیگیری ترمیم دندان ۱۴',
      suggestedDate: '۱۴۰۵/۰۵/۲۰',
      status: 'pending',
    },
    {
      id: 'dr-2',
      patientName: 'مرتضی کریمی',
      patientPhone: '۰۹۱۲۷۷۷۸۸۹۹',
      doctorName: 'دکتر کاویانی',
      reason: 'دومین جلسه عصب‌کشی دندان ۴۶',
      suggestedDate: '۱۴۰۵/۰۵/۲۲',
      status: 'pending',
    },
  ]);

  const handleAddDoctorReminder = (reminder: {
    patientName: string;
    patientPhone: string;
    doctorName: string;
    reason: string;
    suggestedDate: string;
  }) => {
    const newReminder: DoctorRequestReminder = {
      id: `dr-${Date.now()}`,
      patientName: reminder.patientName,
      patientPhone: reminder.patientPhone,
      doctorName: reminder.doctorName,
      reason: reminder.reason,
      suggestedDate: reminder.suggestedDate,
      status: 'pending',
    };
    setDoctorRequests((prev) => [newReminder, ...prev]);
  };

  // GreenLane Handlers
  const handleToggleGreenLaneActive = () => {
    setGreenLane((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleToggleGreenLaneModule = (moduleKey: keyof GreenLaneStatus['modules']) => {
    setGreenLane((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleKey]: !prev.modules[moduleKey],
      },
    }));
  };

  // Active Patient ID State
  const [activePatientId, setActivePatientId] = useState<string>('p-1');

  // Active Patient for Doctor Workspace & Patient Portal
  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const activeAppointment = appointments.find((a) => a.patientId === activePatient.id) || appointments[0];

  // ================= HANDLERS ================= //

  const handleRegisterClinic = (newClinic: ClinicRegistration) => {
    setClinics((prev) => [newClinic, ...prev]);
    setCurrentClinic(newClinic);
  };

  const handleSelectClinic = (clinic: ClinicRegistration) => {
    setCurrentClinic(clinic);
    setViewMode('clinic_portal');
  };

  const handleStaffLogin = (role: UserRole, mobileOrNationalId: string) => {
    setCurrentRole(role);
    
    // Determine if owner
    if (role === 'owner' || mobileOrNationalId.includes('1112233') || role === currentClinic.ownerRole) {
      setIsOwner(true);
      setCurrentUserName(currentClinic.ownerName);
    } else {
      setIsOwner(false);
      const roleNames: Record<string, string> = {
        receptionist: 'مریم امیری',
        dentist: 'دکتر کاویانی',
        accountant: 'رضا محمدی',
        manager: 'مهندس حسینی',
      };
      setCurrentUserName(roleNames[role] || 'کاربر پرسنل');
    }

    setViewMode('workspace');
  };

  const handlePatientLogin = (nationalId: string, isGuardian = false, newBookingDetails?: any) => {
    setCurrentRole('patient');
    setIsOwner(false);

    let existingPatient = patients.find(
      (p) => p.nationalId === nationalId || (p.phone && newBookingDetails?.patientPhone && p.phone === newBookingDetails.patientPhone)
    );

    if (!existingPatient && newBookingDetails) {
      // First-time visit booked online: Create fresh patient profile with check-in allergies & medical conditions
      const newPatient: Patient = {
        id: `p-new-${Date.now()}`,
        udrCode: `UDR-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: newBookingDetails.patientName || 'بیمار جدید',
        phone: newBookingDetails.patientPhone || '09120000000',
        nationalId: newBookingDetails.patientNationalId || nationalId || '1270001122',
        age: 28,
        gender: 'مرد',
        medicalHistory: newBookingDetails.medicalHistory && newBookingDetails.medicalHistory.length > 0 
          ? newBookingDetails.medicalHistory 
          : newBookingDetails.notes 
          ? [newBookingDetails.notes] 
          : [],
        allergies: newBookingDetails.allergies || [],
        primaryInsurance: {
          provider: newBookingDetails.primaryInsurance || 'بیمه تامین اجتماعی',
          policyNumber: 'INS-ONLINE-100',
          active: true,
        },
        supplementaryInsurance: newBookingDetails.supplInsurance ? {
          provider: newBookingDetails.supplInsurance,
          policyNumber: 'SUPPL-ONLINE-200',
          ceilingRemaining: 25000000,
          waitingPeriodDays: 0,
          active: true,
        } : undefined,
        teethMap: {},
        consentTokens: [],
      };

      const newApt: Appointment = {
        id: `apt-online-${Date.now()}`,
        patientId: newPatient.id,
        patientName: newPatient.fullName,
        patientPhone: newPatient.phone,
        nationalId: newPatient.nationalId,
        dentistId: newBookingDetails.dentistId || 'u-dentist1',
        dentistName: newBookingDetails.dentistName || 'دکتر کاویانی',
        branchId: 'br-1',
        date: newBookingDetails.date,
        timeSlot: newBookingDetails.slot,
        reason: newBookingDetails.reason || 'معاینه و ویزیت آنلاین اول',
        status: 'scheduled',
        isFirstVisit: true,
        visitFeePaid: true,
        checkInFormCompleted: newBookingDetails.checkInCompleted || false,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };

      setPatients((prev) => [newPatient, ...prev]);
      setAppointments((prev) => [newApt, ...prev]);
      setActivePatientId(newPatient.id);
      setCurrentUserName(newPatient.fullName);
    } else if (existingPatient) {
      if (newBookingDetails && (newBookingDetails.allergies || newBookingDetails.medicalHistory)) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === existingPatient.id
              ? {
                  ...p,
                  allergies: Array.from(new Set([...(p.allergies || []), ...(newBookingDetails.allergies || [])])),
                  medicalHistory: Array.from(new Set([...(p.medicalHistory || []), ...(newBookingDetails.medicalHistory || [])])),
                }
              : p
          )
        );
      }
      setActivePatientId(existingPatient.id);
      setCurrentUserName(existingPatient.fullName);
    } else {
      setActivePatientId(patients[0]?.id || 'p-101');
      setCurrentUserName(isGuardian ? 'علی رضایی (سرپرست بیمار)' : 'علی رضایی (بیمار)');
    }

    setViewMode('workspace');
  };

  const handleInsurerLogin = (providerName: string, role: UserRole = 'reviewer') => {
    setCurrentRole(role);
    setIsOwner(false);
    const roleTitles: Record<string, string> = {
      reviewer: 'بازبین ادعا',
      medical_inspector: 'بازبین پزشکی',
      insurance_manager: 'مدیر بیمه',
      insurer_admin: 'ادمین بیمه',
    };
    const roleTitle = roleTitles[role] || 'کارشناس بیمه';
    setCurrentUserName(`${roleTitle} (${providerName})`);
    setViewMode('workspace');
  };

  const handleLogout = () => {
    setViewMode('clinic_portal');
  };

  // Reception Handlers
  const handleConnectToDoctor = (appointmentId: string, note: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              status: 'in_unit',
              connectedToUnit: true,
              receptionNoteToDoctor: note,
            }
          : apt
      )
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      actorName: currentUserName,
      actorRole: currentRole,
      action: 'CONNECT_UNIT_DOCTOR',
      entityName: 'Appointment',
      entityId: appointmentId,
      hashWORM: `WORM-ETH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt))
    );
  };

  // Dentist Handlers
  const handleUpdatePatientTeeth = (updatedTeeth: Record<number, ToothDetail>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, teethMap: updatedTeeth } : p))
    );
  };

  const handleNextPatient = () => {
    const activeIdx = patients.findIndex((p) => p.id === activePatientId);
    const nextIdx = (activeIdx + 1) % patients.length;
    setActivePatientId(patients[nextIdx].id);
  };

  const handleFinishTreatment = (data: {
    patientId: string;
    patientName: string;
    treatmentPlan: string;
    totalCost: number;
    baseCovered: number;
    supplCovered: number;
    prescription: string[];
    clinicalNotes: string;
    toothFdi?: number;
    nextVisitDate?: string;
  }) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const timeFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const patientObj = patients.find((p) => p.id === data.patientId) || activePatient;

    // 1. Create a DoctorSubmission for Receptionist Panel
    const newSubmission: DoctorSubmission = {
      id: `sub-${Date.now()}`,
      patientId: patientObj.id,
      patientName: patientObj.fullName,
      patientPhone: patientObj.phone,
      nationalId: patientObj.nationalId,
      dentistName: currentUserName.includes('دکتر') ? currentUserName : 'دکتر کاویانی',
      treatmentSummary: data.treatmentPlan,
      prescriptionSummary: data.prescription.join(' + ') || 'بدون نسخه دارویی',
      clinicalNotes: data.clinicalNotes,
      toothFdi: data.toothFdi || 16,
      totalCost: data.totalCost,
      baseCovered: data.baseCovered,
      supplCovered: data.supplCovered,
      submittedAt: `${timeFa} امروز`,
      status: 'pending',
    };

    setDoctorSubmissions((prev) => [newSubmission, ...prev]);

    // Automatically register doctor request / reminder if next visit date is set
    if (data.nextVisitDate || data.treatmentPlan) {
      const newReminder: DoctorRequestReminder = {
        id: `dr-${Date.now()}`,
        patientName: patientObj.fullName,
        patientPhone: patientObj.phone,
        doctorName: currentUserName.includes('دکتر') ? currentUserName : 'دکتر کاویانی',
        reason: `پیگیری درمان دندان ${data.toothFdi || 16} (${data.treatmentPlan.split('\n')[0]})`,
        suggestedDate: data.nextVisitDate || '۱۴۰۵/۰۵/۲۵ (۲ هفته بعد)',
        status: 'pending',
      };
      setDoctorRequests((prev) => [newReminder, ...prev]);
    }

    // 2. Update Appointment Status
    setAppointments((prev) =>
      prev.map((a) => (a.patientId === patientObj.id ? { ...a, status: 'completed' as const } : a))
    );

    // 3. Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${todayFa} ${timeFa}`,
      actorName: currentUserName,
      actorRole: currentRole,
      action: 'SUBMIT_TREATMENT_TO_RECEPTION',
      entityName: 'DoctorSubmission',
      entityId: newSubmission.id,
      hashWORM: `WORM-ETH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    alert(
      'اطلاعات درمان و کارنامه بیمار با موفقیت ثبت شد و به بخش «ارسال‌های جدید پزشک» نزد منشی انتقال یافت. همچنین درخواست نوبت بعدی به بخش یادآوری‌های منشی ارسال گردید.'
    );
  };

  const handleApproveDoctorSubmission = (submissionId: string) => {
    const sub = doctorSubmissions.find((s) => s.id === submissionId);
    if (!sub) return;

    const todayFa = new Date().toLocaleDateString('fa-IR');
    const timeFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const patientObj =
      patients.find((p) => p.id === sub.patientId || p.nationalId === sub.nationalId) || activePatient;

    // A. Mark Submission as Approved
    setDoctorSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: 'approved' as const } : s))
    );

    // B. Append to Patient Medical History & Tooth Map (Both Dentist & Secretary Views)
    const historyEntry = `درمان توسط ${sub.dentistName} (${todayFa}): ${sub.treatmentSummary} - دندان ${sub.toothFdi || 16}`;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientObj.id || p.nationalId === patientObj.nationalId) {
          const newMedHistory = [...(p.medicalHistory || []), historyEntry];

          const fdi = sub.toothFdi || 16;
          const currentTooth = p.teethMap?.[fdi] || {
            fdiNumber: fdi,
            condition: 'filled',
            affectedSurfaces: ['Occlusal'],
            treatmentHistory: [],
          };

          const updatedTeethMap = {
            ...p.teethMap,
            [fdi]: {
              ...currentTooth,
              condition: 'filled' as const,
              treatmentHistory: [
                ...(currentTooth.treatmentHistory || []),
                {
                  id: `th-${Date.now()}`,
                  date: todayFa,
                  procedureName: sub.treatmentSummary.split('\n')[0] || 'ترمیم تخصصی دندان',
                  dentistName: sub.dentistName,
                  cost: sub.totalCost || 0,
                  status: 'completed' as const,
                },
              ],
            },
          };

          return {
            ...p,
            medicalHistory: newMedHistory,
            teethMap: updatedTeethMap,
          };
        }
        return p;
      })
    );

    // C. Create Invoice
    const cost = sub.totalCost || 3200000;
    const base = sub.baseCovered || Math.round(cost * 0.3);
    const suppl = sub.supplCovered || Math.round(cost * 0.4);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      patientId: patientObj.id,
      patientName: patientObj.fullName,
      dentistId: 'u-dentist1',
      dentistName: sub.dentistName,
      date: todayFa,
      totalAmount: cost,
      baseInsuranceCovered: base,
      supplInsuranceCovered: suppl,
      patientSharePaid: 0,
      paymentMethod: 'cash',
      status: 'pending_insurance',
      doctorCommissionAmount: Math.round(cost * 0.45),
      items: [
        {
          procedureName: sub.treatmentSummary.split('\n')[0] || 'درمان دندان‌پزشکی تخصصی',
          toothFdi: sub.toothFdi || 16,
          amount: cost,
        },
      ],
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // D. Create Claim if insurance coverage exists
    if (base > 0 || suppl > 0) {
      const newClaim: Claim = {
        id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
        claimNumber: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: patientObj.id,
        patientName: patientObj.fullName,
        nationalId: patientObj.nationalId,
        insuranceProvider: patientObj.primaryInsurance?.provider || 'بیمه تامین اجتماعی',
        toothFdi: sub.toothFdi || 16,
        treatmentName: sub.treatmentSummary.split('\n')[0] || 'عصب‌کشی و ترمیم تخصصی دندان',
        dateOfService: todayFa,
        claimedAmount: cost,
        baseApprovedAmount: base,
        supplApprovedAmount: suppl,
        deductionAmount: 0,
        status: 'express_review',
        riskScore: 8,
        greenLaneEligible: true,
        evidences: [
          {
            id: 'ev-1',
            title: 'رادیوگرافی دیجیتال قبل و بعد درمان',
            type: 'xray',
            uploaded: true,
            required: true,
          },
        ],
        narrativeText: sub.clinicalNotes || 'شرح بالینی و گزارش بیمه‌ای درمان تاییدشده منشی',
      };
      setClaims((prev) => [newClaim, ...prev]);
    }

    // E. Update Today Money Board
    setTodayMoneyBoard((prev) => ({
      ...prev,
      totalInvoicedToday: prev.totalInvoicedToday + cost,
      todaysPatientsCount: prev.todaysPatientsCount + 1,
    }));

    // F. Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${todayFa} ${timeFa}`,
      actorName: currentUserName,
      actorRole: currentRole,
      action: 'APPROVE_DOCTOR_SUBMISSION',
      entityName: 'PatientMedicalRecord',
      entityId: patientObj.id,
      hashWORM: `WORM-ETH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Financial Handlers
  const handlePayInstallment = (planId: string, installmentNo: number) => {
    setInstallments((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const updatedSchedule = plan.schedule.map((inst) =>
          inst.installmentNo === installmentNo
            ? { ...inst, status: 'paid' as const, paidAt: '۱۴۰۵/۰۵/۱۳' }
            : inst
        );
        const remaining = updatedSchedule
          .filter((i) => i.status !== 'paid')
          .reduce((sum, i) => sum + i.amount, 0);

        return {
          ...plan,
          remainingAmount: remaining,
          schedule: updatedSchedule,
        };
      })
    );
  };

  // Insurance Bridge Handlers
  const handleSubmitAppeal = (claimId: string, appealText: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'appealed',
              appealText,
              appealHistory: [
                ...(c.appealHistory || []),
                {
                  date: '۱۴۰۵/۰۵/۱۳',
                  text: appealText,
                  status: 'در انتظار بررسی مجدد',
                },
              ],
            }
          : c
      )
    );
  };

  const handleSendClaimToInsurance = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: 'express_review' } : c))
    );
  };

  // Insurance Reviewer Handlers
  const handleReviewDecision = (
    claimId: string,
    decision: 'approved' | 'rejected' | 'partially_approved',
    reason?: string
  ) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: decision,
              deductionReason: reason,
            }
          : c
      )
    );
  };

  // Patient Consent Handlers
  const handleGrantConsent = (purpose: string, expiryDays: number) => {
    const newToken = {
      id: `token-${Date.now()}`,
      purpose,
      grantedAt: '۱۴۰۵/۰۵/۱۳',
      expiresAt: `${expiryDays} روز دیگر`,
      active: true,
    };
    setPatients((prev) =>
      prev.map((p) =>
        p.id === activePatient.id
          ? { ...p, consentTokens: [...p.consentTokens, newToken] }
          : p
      )
    );
  };

  const handleRevokeConsent = (tokenId: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === activePatient.id
          ? {
              ...p,
              consentTokens: p.consentTokens.filter((t) => t.id !== tokenId),
            }
          : p
      )
    );
  };

  const handleUpdateDoctorCommission = (userId: string, rate: number) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, commissionRate: rate } : u)));
  };

  const handleAddEmployee = (newStaff: UserProfile) => {
    setUsers((prev) => [...prev, newStaff]);
  };

  const handleDeleteEmployee = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUpdateLabOrderStatus = (
    orderId: string,
    status: LabOrder['status'],
    milestone: string
  ) => {
    setLabOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, currentMilestone: milestone } : o))
    );
  };

  const handleAddLabOrder = (newOrder: LabOrder) => {
    setLabOrders((prev) => [newOrder, ...prev]);
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  // ================= VIEW RENDERING ================= //

  // 1. Dentora Main Landing Page
  if (viewMode === 'dentora_landing') {
    return (
      <DentoraLandingPage
        registeredClinics={clinics}
        onRegisterClinic={handleRegisterClinic}
        onSelectClinic={handleSelectClinic}
        onGoToInsurerPortal={() => setViewMode('insurer_landing')}
      />
    );
  }

  // 2. Insurer Portal Landing Page
  if (viewMode === 'insurer_landing') {
    return (
      <InsurerLandingPage
        onInsurerLogin={handleInsurerLogin}
        onBackToDentora={() => setViewMode('dentora_landing')}
      />
    );
  }

  // 3. Clinic Portal Landing Page
  if (viewMode === 'clinic_portal') {
    return (
      <ClinicPortalLanding
        clinic={currentClinic}
        onStaffLogin={handleStaffLogin}
        onPatientLogin={handlePatientLogin}
        onInsurerLogin={handleInsurerLogin}
        onBackToDentora={() => setViewMode('dentora_landing')}
      />
    );
  }

  // 3. Workspace Layout for Logged In User
  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased dir-rtl">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(r) => {
          setCurrentRole(r);
          if (r === 'owner') {
            setIsOwner(true);
            setCurrentUserName(currentClinic.ownerName);
          }
        }}
        branches={mockBranches}
        activeBranchId={activeBranchId}
        onBranchChange={(bId) => setActiveBranchId(bId)}
        clinics={clinics}
        currentClinic={currentClinic}
        onClinicSelect={(selectedClinic) => {
          setCurrentClinic(selectedClinic);
          // Set user name and owner flag appropriately based on selected clinic
          if (isOwner || currentRole === 'owner' || selectedClinic.ownerRole === currentRole) {
            setIsOwner(true);
            setCurrentUserName(selectedClinic.ownerName);
          }
        }}
        insuranceModuleActive={insuranceModuleActive}
        onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
        isInsuranceContracted={isInsuranceContracted}
        onToggleInsuranceContracted={handleToggleInsuranceContracted}
        hasAccountantRole={hasAccountantRole}
        onToggleHasAccountantRole={handleToggleHasAccountantRole}
        connectionStatus={connectionStatus}
        onToggleConnectionStatus={handleToggleConnectionStatus}
        greenLaneActive={greenLane.active}
        isOwner={isOwner || currentRole === 'owner'}
        currentUserName={currentUserName}
        clinicName={currentClinic.name}
        onLogout={handleLogout}
        onGoToDentoraLanding={() => setViewMode('dentora_landing')}
      />

      {/* Sync / Connection Status Banner */}
      {syncNotice && (
        <div className="bg-[#005581] text-[#fffffa] border-b border-[#72cdf4]/40 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#ffd200] animate-ping"></span>
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Reception Workspace */}
        {currentRole === 'receptionist' && (
          <AppointmentsView
            appointments={appointments}
            patients={patients}
            waitlist={waitlist}
            onConnectToDoctor={handleConnectToDoctor}
            onAddAppointment={handleAddAppointment}
            onCancelAppointment={handleCancelAppointment}
            onAddPatient={handleAddPatient}
            claims={claims}
            setClaims={setClaims}
            greenLane={greenLane}
            hasAccountantRole={hasAccountantRole}
            onToggleHasAccountantRole={handleToggleHasAccountantRole}
            insuranceModuleActive={insuranceModuleActive}
            onSubmitAppeal={handleSubmitAppeal}
            onSendClaimToInsurance={handleSendClaimToInsurance}
            doctorSubmissions={doctorSubmissions}
            onApproveDoctorSubmission={handleApproveDoctorSubmission}
            doctorRequests={doctorRequests}
            setDoctorRequests={setDoctorRequests}
            onAddDoctorReminder={handleAddDoctorReminder}
          />
        )}

        {/* Doctor Workspace */}
        {currentRole === 'dentist' && (
          <DentistWorkspace
            activePatient={activePatient}
            appointment={activeAppointment}
            allPatients={patients}
            appointments={appointments}
            onSelectPatientId={(id) => setActivePatientId(id)}
            onFinishTreatment={handleFinishTreatment}
            onAddDoctorReminder={handleAddDoctorReminder}
            onNextPatient={handleNextPatient}
            onUpdatePatientTeeth={handleUpdatePatientTeeth}
            insuranceModuleActive={insuranceModuleActive}
            isOwner={isOwner}
            currentClinic={currentClinic}
            onUpdateClinicInfo={handleUpdateClinicInfo}
            users={users}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
            isInsuranceContracted={isInsuranceContracted}
            onToggleInsuranceContracted={handleToggleInsuranceContracted}
            bnplActive={bnplActive}
            onToggleBnplActive={() => setBnplActive(!bnplActive)}
            hasAccountantRole={hasAccountantRole}
            onToggleHasAccountantRole={handleToggleHasAccountantRole}
            baseInsurances={baseInsurances}
            onToggleBaseInsuranceContracted={handleToggleBaseInsuranceContracted}
            onUpdateBaseInsuranceFranchise={handleUpdateBaseInsuranceFranchise}
            supplementaryInsurances={supplementaryInsurances}
            onToggleSupplementaryInsuranceContracted={handleToggleSupplementaryInsuranceContracted}
            onToggleSupplementaryFastSettlement={handleToggleSupplementaryFastSettlement}
            onUpdateSupplementaryMaxCoverage={handleUpdateSupplementaryMaxCoverage}
          />
        )}

        {/* Accountant Workspace */}
        {currentRole === 'accountant' && (
          <AccountantWorkspace
            moneyBoard={todayMoneyBoard}
            invoices={invoices}
            installments={installments}
            claims={claims}
            setClaims={setClaims}
            greenLane={greenLane}
            auditLogs={auditLogs}
            insuranceModuleActive={insuranceModuleActive}
            onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
            isInsuranceContracted={isInsuranceContracted}
            onToggleInsuranceContracted={handleToggleInsuranceContracted}
            hasAccountantRole={hasAccountantRole}
            onToggleHasAccountantRole={handleToggleHasAccountantRole}
            connectionStatus={connectionStatus}
            onToggleConnectionStatus={handleToggleConnectionStatus}
            onPayInstallment={handlePayInstallment}
            onSubmitAppeal={handleSubmitAppeal}
          />
        )}

        {/* Owner Role Routing */}
        {currentRole === 'owner' && (
          currentClinic.ownerRole === 'dentist' ? (
            <DentistWorkspace
              initialTab="owner_settings"
              activePatient={activePatient}
              appointment={activeAppointment}
              allPatients={patients}
              appointments={appointments}
              onSelectPatientId={(id) => setActivePatientId(id)}
              onFinishTreatment={handleFinishTreatment}
              onNextPatient={handleNextPatient}
              onUpdatePatientTeeth={handleUpdatePatientTeeth}
              insuranceModuleActive={insuranceModuleActive}
              isOwner={true}
              currentClinic={currentClinic}
              onUpdateClinicInfo={handleUpdateClinicInfo}
              users={users}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onUpdateUserRole={handleUpdateUserRole}
              onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
              isInsuranceContracted={isInsuranceContracted}
              onToggleInsuranceContracted={handleToggleInsuranceContracted}
              bnplActive={bnplActive}
              onToggleBnplActive={() => setBnplActive(!bnplActive)}
              hasAccountantRole={hasAccountantRole}
              onToggleHasAccountantRole={handleToggleHasAccountantRole}
              baseInsurances={baseInsurances}
              onToggleBaseInsuranceContracted={handleToggleBaseInsuranceContracted}
              onUpdateBaseInsuranceFranchise={handleUpdateBaseInsuranceFranchise}
              supplementaryInsurances={supplementaryInsurances}
              onToggleSupplementaryInsuranceContracted={handleToggleSupplementaryInsuranceContracted}
              onToggleSupplementaryFastSettlement={handleToggleSupplementaryFastSettlement}
              onUpdateSupplementaryMaxCoverage={handleUpdateSupplementaryMaxCoverage}
            />
          ) : currentClinic.ownerRole === 'manager' ? (
            <ManagerWorkspace
              initialTab="owner_settings"
              users={users}
              branches={mockBranches}
              insuranceModuleActive={insuranceModuleActive}
              onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
              onUpdateDoctorCommission={handleUpdateDoctorCommission}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              greenLane={greenLane}
              onToggleGreenLaneModule={handleToggleGreenLaneModule}
              onToggleGreenLaneActive={handleToggleGreenLaneActive}
              isOwner={true}
              currentClinic={currentClinic}
              onUpdateClinicInfo={handleUpdateClinicInfo}
              onUpdateUserRole={handleUpdateUserRole}
              isInsuranceContracted={isInsuranceContracted}
              onToggleInsuranceContracted={handleToggleInsuranceContracted}
              bnplActive={bnplActive}
              onToggleBnplActive={() => setBnplActive(!bnplActive)}
              hasAccountantRole={hasAccountantRole}
              onToggleHasAccountantRole={handleToggleHasAccountantRole}
              baseInsurances={baseInsurances}
              onToggleBaseInsuranceContracted={handleToggleBaseInsuranceContracted}
              onUpdateBaseInsuranceFranchise={handleUpdateBaseInsuranceFranchise}
              supplementaryInsurances={supplementaryInsurances}
              onToggleSupplementaryInsuranceContracted={handleToggleSupplementaryInsuranceContracted}
              onToggleSupplementaryFastSettlement={handleToggleSupplementaryFastSettlement}
              onUpdateSupplementaryMaxCoverage={handleUpdateSupplementaryMaxCoverage}
            />
          ) : (
            <OwnerWorkspace
              currentClinic={currentClinic}
              onUpdateClinicInfo={handleUpdateClinicInfo}
              users={users}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onUpdateUserRole={handleUpdateUserRole}
              insuranceModuleActive={insuranceModuleActive}
              onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
              isInsuranceContracted={isInsuranceContracted}
              onToggleInsuranceContracted={handleToggleInsuranceContracted}
              bnplActive={bnplActive}
              onToggleBnplActive={() => setBnplActive(!bnplActive)}
              hasAccountantRole={hasAccountantRole}
              onToggleHasAccountantRole={handleToggleHasAccountantRole}
              baseInsurances={baseInsurances}
              onToggleBaseInsuranceContracted={handleToggleBaseInsuranceContracted}
              onUpdateBaseInsuranceFranchise={handleUpdateBaseInsuranceFranchise}
              supplementaryInsurances={supplementaryInsurances}
              onToggleSupplementaryInsuranceContracted={handleToggleSupplementaryInsuranceContracted}
              onToggleSupplementaryFastSettlement={handleToggleSupplementaryFastSettlement}
              onUpdateSupplementaryMaxCoverage={handleUpdateSupplementaryMaxCoverage}
            />
          )
        )}

        {/* Manager Workspace */}
        {currentRole === 'manager' && (
          <ManagerWorkspace
            users={users}
            branches={mockBranches}
            insuranceModuleActive={insuranceModuleActive}
            onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
            onUpdateDoctorCommission={handleUpdateDoctorCommission}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            greenLane={greenLane}
            onToggleGreenLaneModule={handleToggleGreenLaneModule}
            onToggleGreenLaneActive={handleToggleGreenLaneActive}
            isOwner={isOwner}
            currentClinic={currentClinic}
            onUpdateClinicInfo={handleUpdateClinicInfo}
            onUpdateUserRole={handleUpdateUserRole}
            isInsuranceContracted={isInsuranceContracted}
            onToggleInsuranceContracted={handleToggleInsuranceContracted}
            bnplActive={bnplActive}
            onToggleBnplActive={() => setBnplActive(!bnplActive)}
            hasAccountantRole={hasAccountantRole}
            onToggleHasAccountantRole={handleToggleHasAccountantRole}
            baseInsurances={baseInsurances}
            onToggleBaseInsuranceContracted={handleToggleBaseInsuranceContracted}
            onUpdateBaseInsuranceFranchise={handleUpdateBaseInsuranceFranchise}
            supplementaryInsurances={supplementaryInsurances}
            onToggleSupplementaryInsuranceContracted={handleToggleSupplementaryInsuranceContracted}
            onToggleSupplementaryFastSettlement={handleToggleSupplementaryFastSettlement}
            onUpdateSupplementaryMaxCoverage={handleUpdateSupplementaryMaxCoverage}
          />
        )}

        {/* Insurance Reviewer Workspace */}
        {currentRole === 'reviewer' && (
          <InsuranceReviewerWorkspace
            claims={claims}
            setClaims={setClaims}
            onReviewDecision={handleReviewDecision}
          />
        )}

        {/* Medical Reviewer / Doctor Inspector Workspace */}
        {currentRole === 'medical_inspector' && (
          <MedicalReviewerWorkspace
            claims={claims}
            onReviewDecision={handleReviewDecision}
          />
        )}

        {/* Insurance Manager Workspace */}
        {currentRole === 'insurance_manager' && (
          <InsuranceManagerWorkspace
            claims={claims}
            onReviewDecision={handleReviewDecision}
          />
        )}

        {/* Insurance Admin Workspace */}
        {currentRole === 'insurer_admin' && (
          <InsuranceAdminWorkspace
            claims={claims}
            onReviewDecision={handleReviewDecision}
          />
        )}

        {/* Patient Portal Workspace */}
        {currentRole === 'patient' && (
          <PatientPortal
            patient={activePatient}
            appointments={appointments}
            invoices={invoices}
            installments={installments}
            claims={claims}
            insuranceModuleActive={insuranceModuleActive}
            isInsuranceContracted={isInsuranceContracted}
            onBookOnline={(dId, slot, dt, reason, isFirstVisit, checkInFormCompleted) => {
              const newApt: Appointment = {
                id: `apt-${Date.now()}`,
                patientId: activePatient.id,
                patientName: activePatient.fullName,
                patientPhone: activePatient.phone,
                nationalId: activePatient.nationalId,
                dentistId: dId,
                dentistName: dId === 'u-dentist2' ? 'دکتر شریفی' : 'دکتر کاویانی',
                branchId: 'br-1',
                date: dt,
                timeSlot: slot,
                reason,
                status: 'scheduled',
                isFirstVisit: isFirstVisit || false,
                visitFeePaid: isFirstVisit ? true : false,
                checkInFormCompleted: checkInFormCompleted || false,
                createdAt: '۱۴۰۵/۰۵/۱۴',
              };
              handleAddAppointment(newApt);
            }}
            onGrantConsent={handleGrantConsent}
            onRevokeConsent={handleRevokeConsent}
            onPayInvoice={(invId) => {
              setInvoices((prev) =>
                prev.map((inv) =>
                  inv.id === invId
                    ? {
                        ...inv,
                        status: 'paid',
                        patientSharePaid: inv.totalAmount - inv.baseInsuranceCovered - inv.supplInsuranceCovered,
                        paymentMethod: 'online',
                      }
                    : inv
                )
              );
            }}
            onPayInstallment={handlePayInstallment}
            onUpdatePatientInfo={(updatedInfo) => {
              setPatients((prev) =>
                prev.map((p) => (p.id === activePatient.id ? { ...p, ...updatedInfo } : p))
              );
            }}
          />
        )}

        {/* Lab Portal Workspace */}
        {currentRole === 'lab' && (
          <LabPortalView
            labOrders={labOrders}
            onUpdateOrderStatus={handleUpdateLabOrderStatus}
            onAddLabOrder={handleAddLabOrder}
          />
        )}

      </main>
    </div>
  );
}
