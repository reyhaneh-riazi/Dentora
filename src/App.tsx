import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Patient,
  Appointment,
  WaitlistEntry,
  Invoice,
  InstallmentPlan,
  Claim,
  ClaimAppeal,
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
  PatientQuestion,
  PatientQuestionReply,
  PatientInsuranceDispute,
  PatientImageRecord,
  PreTreatmentApproval,
  RadiologyImagingLink,
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
import {
  getStoredClinics,
  saveStoredClinics,
  getClinicData,
  saveClinicData,
  initClinicData,
  getAllClinicsLabOrders,
  updateLabOrderInClinicStore,
  addLabOrderToClinicStore,
} from './services/clinicDataStore';
import {
  signInStaff,
  signUpStaff,
  signUpPatient,
  saveActiveSession,
  clearActiveSession,
} from './services/authService';

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
  const [viewMode, setViewMode] = useState<'dentora_landing' | 'clinic_portal' | 'insurer_landing' | 'lab_portal' | 'workspace'>('dentora_landing');

  // Registered Clinics from Local Store
  const [clinics, setClinics] = useState<ClinicRegistration[]>(() => getStoredClinics());
  const [currentClinic, setCurrentClinic] = useState<ClinicRegistration>(() => {
    const stored = getStoredClinics();
    return stored.length > 0 ? stored[0] : {
      id: 'clinic-alborz',
      name: 'کلینیک تخصصی البرز',
      nationalCode: '۱۴۰۰۸۸۸۷۷۶۶',
      ownerName: 'دکتر محمدرضا البرزی',
      ownerMobile: '09121112233',
      ownerRole: 'dentist',
      activeRoles: ['receptionist', 'dentist', 'accountant', 'manager', 'owner'],
      createdAt: '۱۴۰۳/۰۱/۱۵',
    };
  });

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

  // Entities State - Initialized from persistent store per currentClinic
  const initialClinicData = getClinicData(currentClinic.id);

  const [patients, setPatients] = useState<Patient[]>(() => initialClinicData.patients);
  const [appointments, setAppointments] = useState<Appointment[]>(() => initialClinicData.appointments);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => initialClinicData.waitlist);
  const [invoices, setInvoices] = useState<Invoice[]>(() => initialClinicData.invoices);
  const [installments, setInstallments] = useState<InstallmentPlan[]>(() => initialClinicData.installments);
  const [todayMoneyBoard, setTodayMoneyBoard] = useState<TodayMoneyBoard>(() => initialClinicData.todayMoneyBoard);
  const [claims, setClaims] = useState<Claim[]>(() => initialClinicData.claims);
  const [greenLane, setGreenLane] = useState<GreenLaneStatus>(() => initialClinicData.greenLane);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(() => initialClinicData.labOrders);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => initialClinicData.auditLogs);
  const [users, setUsers] = useState<UserProfile[]>(() => initialClinicData.users);
  const [doctorSubmissions, setDoctorSubmissions] = useState<DoctorSubmission[]>(() => initialClinicData.doctorSubmissions);
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequestReminder[]>(() => initialClinicData.doctorRequests);
  const [patientQuestions, setPatientQuestions] = useState<PatientQuestion[]>(() => initialClinicData.patientQuestions);
  const [insuranceDisputes, setInsuranceDisputes] = useState<PatientInsuranceDispute[]>(() => initialClinicData.insuranceDisputes);
  const [baseInsurances, setBaseInsurances] = useState<BaseInsuranceContract[]>(() => initialClinicData.baseInsurances);
  const [supplementaryInsurances, setSupplementaryInsurances] = useState<SupplementaryInsuranceContract[]>(() => initialClinicData.supplementaryInsurances);
  const [preTreatmentApprovals, setPreTreatmentApprovals] = useState<PreTreatmentApproval[]>(() => initialClinicData.preTreatmentApprovals || []);
  const [radiologyLinks, setRadiologyLinks] = useState<RadiologyImagingLink[]>(() => initialClinicData.radiologyLinks || []);

  // Function to load a clinic's full data bundle into state
  const loadClinicDataIntoState = (clinicId: string) => {
    const data = getClinicData(clinicId);
    setPatients(data.patients);
    setAppointments(data.appointments);
    setWaitlist(data.waitlist);
    setInvoices(data.invoices);
    setInstallments(data.installments);
    setTodayMoneyBoard(data.todayMoneyBoard);
    setClaims(data.claims);
    setGreenLane(data.greenLane);
    setLabOrders(data.labOrders);
    setAuditLogs(data.auditLogs);
    setUsers(data.users);
    setDoctorSubmissions(data.doctorSubmissions);
    setDoctorRequests(data.doctorRequests);
    setPatientQuestions(data.patientQuestions);
    setInsuranceDisputes(data.insuranceDisputes);
    setBaseInsurances(data.baseInsurances);
    setSupplementaryInsurances(data.supplementaryInsurances);
    setPreTreatmentApprovals(data.preTreatmentApprovals || []);
    setRadiologyLinks(data.radiologyLinks || []);
    if (data.patients.length > 0) {
      setActivePatientId(data.patients[0].id);
    }
  };

  // Synchronize state changes with persistent clinic storage
  useEffect(() => {
    saveClinicData(currentClinic.id, {
      patients,
      appointments,
      waitlist,
      invoices,
      installments,
      todayMoneyBoard,
      claims,
      greenLane,
      labOrders,
      auditLogs,
      users,
      doctorSubmissions,
      doctorRequests,
      patientQuestions,
      insuranceDisputes,
      baseInsurances,
      supplementaryInsurances,
      preTreatmentApprovals,
      radiologyLinks,
    });
  }, [
    currentClinic.id,
    patients,
    appointments,
    waitlist,
    invoices,
    installments,
    todayMoneyBoard,
    claims,
    greenLane,
    labOrders,
    auditLogs,
    users,
    doctorSubmissions,
    doctorRequests,
    patientQuestions,
    insuranceDisputes,
    baseInsurances,
    supplementaryInsurances,
    preTreatmentApprovals,
    radiologyLinks,
  ]);

  const handleUploadPreTreatmentApproval = (approval: PreTreatmentApproval) => {
    setPreTreatmentApprovals((prev) => [approval, ...prev]);
  };

  const handleRegisterRadiologyLink = (link: RadiologyImagingLink) => {
    setRadiologyLinks((prev) => [link, ...prev]);
  };

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

  const handleAskQuestion = (data: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientNationalId: string;
    category: string;
    question: string;
    dentistId?: string;
    dentistName?: string;
  }) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const newQ: PatientQuestion = {
      id: `qa-${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientNationalId: data.patientNationalId,
      dentistId: data.dentistId || 'u-dentist1',
      dentistName: data.dentistName || 'دکتر کاویانی',
      category: data.category,
      question: data.question,
      createdAt: todayFa,
      status: 'pending',
      isClinicalUrgent: data.category === 'درد' || data.category === 'پزشکی' || data.category === 'مراقبت‌های پس از درمان',
      replies: [],
    };
    setPatientQuestions((prev) => [newQ, ...prev]);
  };

  const handleReplyQuestion = (
    questionId: string,
    replyMessage: string,
    senderRole: 'receptionist' | 'dentist',
    senderName: string
  ) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const timeFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const formattedTime = `${todayFa} - ${timeFa}`;

    setPatientQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newReply: PatientQuestionReply = {
            id: `rep-${Date.now()}`,
            senderRole,
            senderName,
            message: replyMessage,
            createdAt: formattedTime,
          };
          return {
            ...q,
            status: 'answered' as const,
            answer: replyMessage,
            answeredAt: formattedTime,
            repliedBy: senderName,
            replies: [...(q.replies || []), newReply],
          };
        }
        return q;
      })
    );
  };

  const handleSubmitInsuranceDispute = (data: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    nationalId: string;
    claimNumber: string;
    insuranceProvider: string;
    topic: string;
    message: string;
    imageName?: string;
    imageDesc?: string;
    claimedAmount: number;
    deductionAmount: number;
  }) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const newDispute: PatientInsuranceDispute = {
      id: `obj-${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      nationalId: data.nationalId,
      claimNumber: data.claimNumber,
      insuranceProvider: data.insuranceProvider,
      topic: data.topic,
      message: data.message,
      imageName: data.imageName,
      imageDesc: data.imageDesc,
      claimedAmount: data.claimedAmount,
      deductionAmount: data.deductionAmount,
      status: 'under_review',
      responseMessage: 'پیام اعتراض شما در واحد بیمه کلینیک دریافت گردید و به کارشناس ارجاع شد.',
      lastUpdated: todayFa,
      createdAt: todayFa,
    };
    setInsuranceDisputes((prev) => [newDispute, ...prev]);
  };

  const handleReplyInsuranceDispute = (
    disputeId: string,
    responseMessage: string,
    status: 'under_review' | 'approved_pay' | 'need_docs' | 'rejected' = 'under_review'
  ) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    setInsuranceDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status,
              responseMessage,
              lastUpdated: todayFa,
            }
          : d
      )
    );
  };

  // Active Patient ID State
  const [activePatientId, setActivePatientId] = useState<string>('p-1');

  // Active Patient for Doctor Workspace & Patient Portal
  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-default',
    udrCode: 'UDR-0001',
    fullName: 'پرونده بیمار',
    phone: '۰۹۱۲۰۰۰۰۰۰۰',
    nationalId: '۰۰۰۰۰۰۰۰۰۰',
    birthDate: '۱۳۷۰/۰۱/۰۱',
    address: 'تهران',
    age: 30,
    gender: 'مرد',
    medicalHistory: [],
    allergies: [],
    primaryInsurance: { provider: 'بیمه تامین اجتماعی', policyNumber: 'INS-1001', active: true },
    teethMap: {},
    consentTokens: [],
  };
  const activeAppointment = appointments.find((a) => a.patientId === activePatient.id) || appointments[0] || {
    id: 'apt-default',
    patientId: activePatient.id,
    patientName: activePatient.fullName,
    patientPhone: activePatient.phone,
    nationalId: activePatient.nationalId,
    dentistId: 'u-dentist1',
    dentistName: 'دکتر دندان‌پزشک',
    branchId: 'br-1',
    date: 'امروز',
    timeSlot: '۱۰:۰۰',
    reason: 'معاینه',
    status: 'scheduled',
    isFirstVisit: false,
    visitFeePaid: true,
    checkInFormCompleted: true,
    createdAt: 'امروز',
  };

  // ================= HANDLERS ================= //

  const handleRegisterClinic = (
    newClinic: ClinicRegistration,
    ownerPassword = 'password123',
    ownerNationalId?: string
  ) => {
    // 1. Initialize fresh zero-data for new clinic
    initClinicData(newClinic.id, false);

    // 2. Register owner user in authService
    signUpStaff(newClinic.id, {
      fullName: newClinic.ownerName,
      nationalId: ownerNationalId || '0012345678',
      phone: newClinic.ownerMobile,
      password: ownerPassword,
      role: newClinic.ownerRole,
      isOwner: true,
      isApproved: true,
    });

    // 3. Save new clinic in clinics registry
    const updatedClinics = [newClinic, ...clinics];
    setClinics(updatedClinics);
    saveStoredClinics(updatedClinics);

    // 4. Set current clinic and load zero-data
    setCurrentClinic(newClinic);
    loadClinicDataIntoState(newClinic.id);

    // 5. Log in owner directly into their new workspace
    setCurrentRole(newClinic.ownerRole);
    setIsOwner(true);
    setCurrentUserName(newClinic.ownerName);
    saveActiveSession({
      token: `tok-${Date.now()}`,
      userId: `u-owner-${newClinic.id}`,
      userName: newClinic.ownerName,
      userRole: newClinic.ownerRole,
      clinicId: newClinic.id,
      clinicName: newClinic.name,
      isOwner: true,
      phone: newClinic.ownerMobile,
      nationalId: ownerNationalId,
      expiresAt: Date.now() + 86400000,
    });

    setViewMode('workspace');
  };

  const handleSelectClinic = (clinic: ClinicRegistration) => {
    setCurrentClinic(clinic);
    loadClinicDataIntoState(clinic.id);
    setViewMode('clinic_portal');
  };

  const handleStaffLogin = (
    role: UserRole,
    mobileOrNationalId: string,
    fullName?: string,
    password?: string,
    extra?: { nationalId?: string; email?: string; medicalCouncilNo?: string }
  ) => {
    // If fullName is provided, this is a signup flow
    if (fullName) {
      const isOwnerRole = role === 'owner' || (role === currentClinic.ownerRole && fullName === currentClinic.ownerName);
      const staffUser = signUpStaff(currentClinic.id, {
        fullName,
        nationalId: extra?.nationalId || (mobileOrNationalId.length === 10 ? mobileOrNationalId : '0012345678'),
        phone: mobileOrNationalId,
        password: password || '123456',
        email: extra?.email,
        medicalCouncilNo: extra?.medicalCouncilNo,
        role: role === 'owner' ? (currentClinic.ownerRole || 'dentist') : role,
        isOwner: isOwnerRole,
        isApproved: true,
      });

      // Add to users list if not already present
      setUsers((prev) => {
        if (prev.some((u) => u.id === staffUser.id || u.phone === staffUser.phone)) return prev;
        return [
          ...prev,
          {
            id: staffUser.id,
            name: staffUser.fullName,
            phone: staffUser.phone,
            nationalId: staffUser.nationalId,
            role: staffUser.role,
            branchIds: ['br-1'],
            isOwner: staffUser.isOwner,
            medicalCouncilNo: staffUser.medicalCouncilNo,
            email: staffUser.email,
          },
        ];
      });

      setCurrentRole(role);
      setIsOwner(staffUser.isOwner);
      setCurrentUserName(staffUser.fullName);
      setViewMode('workspace');
      return;
    }

    // Login Flow
    const authResult = signInStaff(currentClinic.id, mobileOrNationalId, password || '', role);
    if (authResult.success && authResult.user) {
      setCurrentRole(role);
      setIsOwner(authResult.user.isOwner);
      setCurrentUserName(authResult.user.fullName);
      setViewMode('workspace');
    } else {
      // Fallback for demo users
      const isClinicOwner =
        role === 'owner' ||
        mobileOrNationalId === currentClinic.ownerMobile ||
        mobileOrNationalId.includes('1112233');

      const existingUser = users.find(
        (u) =>
          u.phone === mobileOrNationalId ||
          u.nationalId === mobileOrNationalId ||
          (u.role === role && !fullName)
      );

      const resolvedName = existingUser?.name || (isClinicOwner ? currentClinic.ownerName : 'پرسنل کلینیک');
      setCurrentRole(role);
      setIsOwner(isClinicOwner);
      setCurrentUserName(resolvedName);
      saveActiveSession({
        token: `tok-${Date.now()}`,
        userId: existingUser?.id || `u-${Date.now()}`,
        userName: resolvedName,
        userRole: role,
        clinicId: currentClinic.id,
        clinicName: currentClinic.name,
        isOwner: isClinicOwner,
        phone: mobileOrNationalId,
        expiresAt: Date.now() + 86400000,
      });
      setViewMode('workspace');
    }
  };

  const handlePatientLogin = (nationalId: string, isGuardian = false, newBookingDetails?: any) => {
    setCurrentRole('patient');
    setIsOwner(false);

    let existingPatient = patients.find(
      (p) => 
        (p.nationalId && p.nationalId.trim() === nationalId.trim()) || 
        (p.phone && p.phone.trim() === nationalId.trim()) ||
        (newBookingDetails?.patientPhone && p.phone === newBookingDetails.patientPhone) ||
        (newBookingDetails?.patientNationalId && p.nationalId === newBookingDetails.patientNationalId)
    );

    if (newBookingDetails && !existingPatient) {
      // First-time visit or online registration: Create fresh patient profile with user's real information
      const newPatient: Patient = {
        id: `p-new-${Date.now()}`,
        udrCode: `UDR-${nationalId ? nationalId.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`,
        fullName: newBookingDetails.patientName || (isGuardian ? 'کودک بیمار' : 'بیمار جدید'),
        phone: newBookingDetails.patientPhone || (nationalId.startsWith('09') ? nationalId : '09120000000'),
        nationalId: newBookingDetails.patientNationalId || nationalId || '1270001122',
        birthDate: newBookingDetails.birthDate || '۱۳۷۰/۰۱/۰۱',
        address: newBookingDetails.address || 'تهران',
        age: newBookingDetails.age || 28,
        gender: newBookingDetails.gender || 'مرد',
        medicalHistory: newBookingDetails.medicalHistory && newBookingDetails.medicalHistory.length > 0 
          ? newBookingDetails.medicalHistory 
          : newBookingDetails.notes 
          ? [newBookingDetails.notes] 
          : [],
        allergies: newBookingDetails.allergies || [],
        primaryInsurance: {
          provider: newBookingDetails.primaryInsurance || 'بیمه تامین اجتماعی',
          policyNumber: `INS-${Math.floor(100000 + Math.random() * 900000)}`,
          active: true,
        },
        supplementaryInsurance: newBookingDetails.supplInsurance ? {
          provider: newBookingDetails.supplInsurance,
          policyNumber: `SUPPL-${Math.floor(100000 + Math.random() * 900000)}`,
          ceilingRemaining: 30000000,
          waitingPeriodDays: 0,
          active: true,
        } : undefined,
        teethMap: {},
        consentTokens: [],
      };

      if (newBookingDetails.date && newBookingDetails.slot) {
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
          reason: newBookingDetails.reason || 'ویزیت و معاینه اولیه آنلاین',
          status: 'scheduled',
          isFirstVisit: true,
          visitFeePaid: true,
          checkInFormCompleted: newBookingDetails.checkInCompleted || false,
          createdAt: new Date().toLocaleDateString('fa-IR'),
        };
        setAppointments((prev) => [newApt, ...prev]);
      }

      setPatients((prev) => [newPatient, ...prev]);
      setActivePatientId(newPatient.id);
      setCurrentUserName(newPatient.fullName);

      signUpPatient(currentClinic.id, {
        fullName: newPatient.fullName,
        nationalId: newPatient.nationalId,
        phone: newPatient.phone,
        password: newBookingDetails.password || '123456',
        birthDate: newPatient.birthDate,
        primaryInsurance: newPatient.primaryInsurance?.provider,
        supplInsurance: newPatient.supplementaryInsurance?.provider,
        isGuardian,
        guardianName: newBookingDetails.guardianName,
        guardianNationalId: newBookingDetails.guardianNationalId,
        guardianPhone: newBookingDetails.guardianPhone,
      });
    } else if (existingPatient) {
      if (newBookingDetails) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === existingPatient.id
              ? {
                  ...p,
                  fullName: newBookingDetails.patientName || p.fullName,
                  phone: newBookingDetails.patientPhone || p.phone,
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
      // Patient logging in with unknown national ID
      const isMobile = nationalId.startsWith('09');
      const realPhone = isMobile ? nationalId : '0912' + (nationalId.slice(-7).padStart(7, '0'));
      const realNatId = isMobile ? ('00' + nationalId.slice(-8)) : nationalId;
      const generatedPatient: Patient = {
        id: `p-${Date.now()}`,
        udrCode: `UDR-${realNatId.slice(-4)}`,
        fullName: isGuardian ? `بیمار (سرپرست: کد ملی ${realNatId})` : `بیمار (کد ملی ${realNatId})`,
        phone: realPhone,
        nationalId: realNatId,
        birthDate: '۱۳۷۲/۰۵/۱۴',
        address: 'تهران',
        age: 30,
        gender: 'مرد',
        medicalHistory: [],
        allergies: [],
        primaryInsurance: {
          provider: 'بیمه تامین اجتماعی',
          policyNumber: `INS-${realNatId.slice(-6)}`,
          active: true,
        },
        supplementaryInsurance: {
          provider: 'بیمه تکمیلی دانا',
          policyNumber: `SUPPL-${realNatId.slice(-6)}`,
          ceilingRemaining: 35000000,
          waitingPeriodDays: 0,
          active: true,
        },
        teethMap: {},
        consentTokens: [],
      };
      setPatients((prev) => [generatedPatient, ...prev]);
      setActivePatientId(generatedPatient.id);
      setCurrentUserName(generatedPatient.fullName);
    }

    saveActiveSession({
      token: `tok-pat-${Date.now()}`,
      userId: `u-pat-${nationalId}`,
      userName: existingPatient?.fullName || 'بیمار دنتورا',
      userRole: 'patient',
      clinicId: currentClinic.id,
      clinicName: currentClinic.name,
      isOwner: false,
      nationalId,
      expiresAt: Date.now() + 86400000,
    });

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
    clearActiveSession();
    setIsOwner(false);
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
    const currentActive = patients.find((p) => p.id === activePatientId) || patients[0];
    
    // Check if there are other distinct patients already loaded in clinic patients
    const otherClinicPatients = patients.filter(
      (p) => p.id !== activePatientId && p.fullName !== currentActive?.fullName
    );

    if (otherClinicPatients.length > 0) {
      // Advance to the next distinct clinic patient
      const nextPat = otherClinicPatients[0];
      setActivePatientId(nextPat.id);

      // Ensure an active unit appointment exists for this patient
      const existingApt = appointments.find((a) => a.patientId === nextPat.id);
      if (!existingApt) {
        const newApt: Appointment = {
          id: `apt-${Date.now()}`,
          patientId: nextPat.id,
          patientName: nextPat.fullName,
          patientPhone: nextPat.phone,
          nationalId: nextPat.nationalId,
          dentistId: 'u-dentist1',
          dentistName: currentUserName.includes('دکتر') ? currentUserName : 'دکتر کاویانی',
          branchId: activeBranchId,
          date: '1405-05-13',
          timeSlot: '11:30 - 12:15',
          reason: nextPat.clinicalNotes?.[0]?.slice(0, 40) || 'معاینه و ادامه درمان تخصصی',
          status: 'in_unit',
          isFirstVisit: false,
          visitFeePaid: true,
          checkInFormCompleted: true,
          connectedToUnit: true,
          receptionNoteToDoctor: `بیمار ${nextPat.fullName} فراخوان شد و روی یونیت قرار گرفت.`,
          createdAt: 'امروز',
        };
        setAppointments((prev) => [newApt, ...prev]);
      } else {
        setAppointments((prev) =>
          prev.map((a) => (a.id === existingApt.id ? { ...a, status: 'in_unit', connectedToUnit: true } : a))
        );
      }
    } else {
      // Clinic has only 1 patient! Use the default system patients pool (mockPatients)
      // Pick a default patient who is NOT the current active patient and not already added by name or nationalId
      const candidate =
        mockPatients.find(
          (dp) =>
            dp.fullName !== currentActive?.fullName &&
            !patients.some((p) => p.nationalId === dp.nationalId || p.fullName === dp.fullName)
        ) ||
        mockPatients.find((dp) => dp.fullName !== currentActive?.fullName) ||
        mockPatients[0];

      if (candidate) {
        const freshPatient: Patient = {
          ...candidate,
          id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };

        const newApt: Appointment = {
          id: `apt-${Date.now()}`,
          patientId: freshPatient.id,
          patientName: freshPatient.fullName,
          patientPhone: freshPatient.phone,
          nationalId: freshPatient.nationalId,
          dentistId: 'u-dentist1',
          dentistName: currentUserName.includes('دکتر') ? currentUserName : 'دکتر کاویانی',
          branchId: activeBranchId,
          date: '1405-05-13',
          timeSlot: '12:00 - 12:45',
          reason: 'معاینه و ادامه درمان تخصصی',
          status: 'in_unit',
          isFirstVisit: false,
          visitFeePaid: true,
          checkInFormCompleted: true,
          connectedToUnit: true,
          receptionNoteToDoctor: `بیمار جدید از صف سیستم (${freshPatient.fullName}) متصل شد.`,
          createdAt: 'امروز',
        };

        setPatients((prev) => [...prev, freshPatient]);
        setAppointments((prev) => [newApt, ...prev]);
        setActivePatientId(freshPatient.id);
      }
    }
  };

  const handleUpdatePatient = (patientId: string, updatedFields: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId || p.nationalId === patientId ? { ...p, ...updatedFields } : p))
    );
  };

  const handleSavePatientImage = (patientId: string, imageRecord: PatientImageRecord) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId || p.nationalId === patientId) {
          const existingImages = p.patientImages || [];
          const idx = existingImages.findIndex((img) => img.id === imageRecord.id);
          let updatedImages: PatientImageRecord[];
          if (idx >= 0) {
            updatedImages = existingImages.map((img, i) => (i === idx ? imageRecord : img));
          } else {
            updatedImages = [imageRecord, ...existingImages];
          }

          // Clinical notes get radiographic summary, while medicalHistory remains clean for systemic diseases
          const newClinicalNotes = [
            ...(p.clinicalNotes || []),
            `[${todayFa} ${imageRecord.doctorName || 'دندان‌پزشک'}] ثبت گرافی دندان ${imageRecord.toothFdi || 16}: ${imageRecord.summaryText || imageRecord.doctorNotes || imageRecord.title}`,
          ];

          const cleanMedHistory = (p.medicalHistory || []).filter(
            (item) => !item.startsWith('ثبت تصویر') && !item.includes('[هوش مصنوعی]') && !item.includes('RVG') && !item.includes('OPG')
          );

          return {
            ...p,
            patientImages: updatedImages,
            medicalHistory: cleanMedHistory,
            clinicalNotes: newClinicalNotes,
          };
        }
        return p;
      })
    );
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
    teethFdiList?: number[];
    nextVisitDate?: string;
  }) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const timeFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const patientObj = patients.find((p) => p.id === data.patientId) || activePatient;
    const docName = currentUserName.includes('دکتر') ? currentUserName : (currentClinic?.ownerRole === 'dentist' ? currentClinic.ownerName : 'دکتر کاویانی');

    // Determine all treated teeth
    const treatedTeethList = data.teethFdiList && data.teethFdiList.length > 0
      ? data.teethFdiList
      : (data.toothFdi ? [data.toothFdi] : [16]);
    const primaryFdi = data.toothFdi || treatedTeethList[0] || 16;

    const cleanProcedureName = data.treatmentPlan
      ? data.treatmentPlan.split('\n')[0].replace(/^[0-9.-]+\s*/, '').trim()
      : 'درمان تخصصی دندان‌پزشکی';

    // 1. Update Patient object (syncs teethMap, treatmentHistory, clinicalNotes, prescriptions)
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientObj.id || p.nationalId === patientObj.nationalId) {
          // Keep medicalHistory strictly for systemic medical conditions
          const cleanMedHistory = (p.medicalHistory || []).filter(
            (item) => !item.startsWith('ثبت تصویر') && !item.includes('[هوش مصنوعی]') && !item.includes('RVG') && !item.includes('OPG') && !item.startsWith('درمان توسط')
          );

          const teethMention = treatedTeethList.length > 1
            ? `دندان‌های ${treatedTeethList.join(' و ')}`
            : `دندان ${primaryFdi}`;

          const newClinicalNotes = [
            ...(p.clinicalNotes || []),
            `[${todayFa} ${docName}] ${teethMention}: ${data.clinicalNotes || data.treatmentPlan}`,
          ];

          const newPrescriptions = data.prescription && data.prescription.length > 0
            ? [
                ...(p.prescriptions || []),
                {
                  id: `rx-${Date.now()}`,
                  date: todayFa,
                  dentistName: docName,
                  items: data.prescription,
                  instructions: 'طبق دستور پزشک مصرف شود.',
                },
              ]
            : (p.prescriptions || []);

          let updatedTeethMap = { ...p.teethMap };
          treatedTeethList.forEach((toothNum) => {
            const currentTooth = updatedTeethMap[toothNum] || {
              fdiNumber: toothNum,
              condition: 'filled' as const,
              affectedSurfaces: ['Occlusal'],
              treatmentHistory: [],
            };
            updatedTeethMap[toothNum] = {
              ...currentTooth,
              condition: 'filled' as const,
              treatmentHistory: [
                ...(currentTooth.treatmentHistory || []),
                {
                  id: `th-${Date.now()}-${toothNum}`,
                  date: todayFa,
                  procedureName: cleanProcedureName,
                  dentistName: docName,
                  cost: Math.round((data.totalCost || 0) / treatedTeethList.length),
                  status: 'completed' as const,
                },
              ],
            };
          });

          return {
            ...p,
            medicalHistory: cleanMedHistory,
            clinicalNotes: newClinicalNotes,
            prescriptions: newPrescriptions,
            teethMap: updatedTeethMap,
          };
        }
        return p;
      })
    );

    // 2. Create a DoctorSubmission for Receptionist Panel
    const newSubmission: DoctorSubmission = {
      id: `sub-${Date.now()}`,
      patientId: patientObj.id,
      patientName: patientObj.fullName,
      patientPhone: patientObj.phone,
      nationalId: patientObj.nationalId,
      dentistName: docName,
      treatmentSummary: data.treatmentPlan,
      prescriptionSummary: data.prescription.join(' + ') || 'بدون نسخه دارویی',
      clinicalNotes: data.clinicalNotes,
      toothFdi: primaryFdi,
      teethFdiList: treatedTeethList,
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
        doctorName: docName,
        reason: `پیگیری درمان ${treatedTeethList.length > 1 ? `دندان‌های ${treatedTeethList.join(' و ')}` : `دندان ${primaryFdi}`} (${data.treatmentPlan.split('\n')[0]})`,
        suggestedDate: data.nextVisitDate || '۱۴۰۵/۰۵/۲۵ (۲ هفته بعد)',
        status: 'pending',
      };
      setDoctorRequests((prev) => [newReminder, ...prev]);
    }

    // 3. Update Appointment Status
    setAppointments((prev) =>
      prev.map((a) => (a.patientId === patientObj.id ? { ...a, status: 'completed' as const } : a))
    );

    // 4. Automatically create unpaid invoice for patient (creating debt until paid)
    const cost = data.totalCost || 3200000;
    const base = data.baseCovered || 0;
    const suppl = data.supplCovered || 0;

    const invoiceItems = treatedTeethList.map((toothNum) => ({
      procedureName: `${cleanProcedureName} (دندان ${toothNum})`,
      toothFdi: toothNum,
      amount: Math.round(cost / treatedTeethList.length),
    }));

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      patientId: patientObj.id,
      patientName: patientObj.fullName,
      dentistId: 'u-dentist1',
      dentistName: docName,
      date: todayFa,
      totalAmount: cost,
      baseInsuranceCovered: base,
      supplInsuranceCovered: suppl,
      patientSharePaid: 0,
      paymentMethod: 'cash',
      status: 'pending_insurance',
      doctorCommissionAmount: Math.round(cost * 0.45),
      items: invoiceItems.length > 0 ? invoiceItems : [
        {
          procedureName: cleanProcedureName,
          toothFdi: primaryFdi,
          amount: cost,
        },
      ],
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // 5. Audit Log
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
      'اطلاعات درمان، تصاویر، علائم و کارنامه بیمار ثبت شد و بلافاصله در پرونده پزشک، منشی و پورتال بیمار همگام‌سازی گردید.'
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

    // B. Append to Patient Tooth Map & Clinical Notes (Both Dentist & Secretary Views)
    const cleanProcedure = sub.treatmentSummary
      ? sub.treatmentSummary.split('\n')[0].replace(/^[0-9.-]+\s*/, '').trim()
      : 'درمان تخصصی دندان‌پزشکی';

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientObj.id || p.nationalId === patientObj.nationalId) {
          const cleanMedHistory = (p.medicalHistory || []).filter(
            (item) => !item.startsWith('ثبت تصویر') && !item.includes('[هوش مصنوعی]') && !item.includes('RVG') && !item.includes('OPG') && !item.startsWith('درمان توسط')
          );

          const newClinicalNotes = [
            ...(p.clinicalNotes || []),
            `[${todayFa} ${sub.dentistName}] ${sub.clinicalNotes || sub.treatmentSummary}`,
          ];

          const rxItems = sub.prescriptionSummary && sub.prescriptionSummary !== 'بدون نسخه دارویی'
            ? sub.prescriptionSummary.split(' + ')
            : [];

          const newPrescriptions = rxItems.length > 0
            ? [
                ...(p.prescriptions || []),
                {
                  id: `rx-${Date.now()}`,
                  date: todayFa,
                  dentistName: sub.dentistName,
                  items: rxItems,
                  instructions: 'طبق دستور پزشک مصرف شود.',
                },
              ]
            : (p.prescriptions || []);

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
                  procedureName: cleanProcedure,
                  dentistName: sub.dentistName,
                  cost: sub.totalCost || 0,
                  status: 'completed' as const,
                },
              ],
            },
          };

          return {
            ...p,
            medicalHistory: cleanMedHistory,
            clinicalNotes: newClinicalNotes,
            prescriptions: newPrescriptions,
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

    const subTreatedTeeth = sub.teethFdiList && sub.teethFdiList.length > 0
      ? sub.teethFdiList
      : (sub.toothFdi ? [sub.toothFdi] : [16]);
    const primaryTooth = sub.toothFdi || subTreatedTeeth[0] || 16;

    const invoiceItems = subTreatedTeeth.map((toothNum) => ({
      procedureName: `${cleanProcedure} (دندان ${toothNum})`,
      toothFdi: toothNum,
      amount: Math.round(cost / subTreatedTeeth.length),
    }));

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
      items: invoiceItems.length > 0 ? invoiceItems : [
        {
          procedureName: sub.treatmentSummary.split('\n')[0] || 'درمان دندان‌پزشکی تخصصی',
          toothFdi: primaryTooth,
          amount: cost,
        },
      ],
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // D. Create Claim if insurance coverage exists
    if (base > 0 || suppl > 0) {
      const claimItems = subTreatedTeeth.map((toothNum, idx) => ({
        id: `ci-${Date.now()}-${idx + 1}`,
        toothNumber: toothNum,
        procedureTitle: `${cleanProcedure} دندان ${toothNum}`,
        procedureCode: 'DNT-GEN-PRC',
        surfaceDetail: 'سطوح استاندارد',
        tariffAmount: Math.round(cost / subTreatedTeeth.length),
        claimedAmount: Math.round(cost / subTreatedTeeth.length),
        baseShare: Math.round(base / subTreatedTeeth.length),
        supplementaryShare: Math.round(suppl / subTreatedTeeth.length),
      }));

      const newClaim: Claim = {
        id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
        claimNumber: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: patientObj.id,
        patientName: patientObj.fullName,
        nationalId: patientObj.nationalId,
        dentistName: sub.dentistName,
        insuranceProvider: patientObj.primaryInsurance?.provider || 'بیمه تامین اجتماعی',
        toothFdi: primaryTooth,
        teethFdiList: subTreatedTeeth,
        items: claimItems,
        treatmentName: sub.treatmentSummary.split('\n')[0] || 'عصب‌کشی و ترمیم تخصصی دندان',
        dateOfService: todayFa,
        claimedAmount: cost,
        baseApprovedAmount: base,
        supplApprovedAmount: suppl,
        deductionAmount: 0,
        status: 'draft',
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

  // Reception / Secretary Manual Payment Registration (POS & Cash)
  const handleRegisterPatientPayment = (paymentData: {
    patientId: string;
    patientName: string;
    nationalId?: string;
    phone?: string;
    amount: number;
    paymentMethod: 'pos' | 'cash' | 'transfer';
    posTerminalName?: string;
    trackingCode: string;
    notes?: string;
    reason?: string;
    submissionId?: string;
  }) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const timeFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const {
      patientId,
      patientName,
      nationalId = '',
      amount,
      paymentMethod,
      posTerminalName = 'دستگاه ۱ - بانک پاسارگاد',
      trackingCode,
      notes = '',
      reason = 'دریافتی صندوق و پذیرش درمان دندان‌پزشکی',
      submissionId,
    } = paymentData;

    // 1. Update Today's Money Board (Instant sync with Accountant & Dashboards)
    setTodayMoneyBoard((prev) => ({
      ...prev,
      receivedTodayCashPos: prev.receivedTodayCashPos + amount,
      totalInvoicedToday: Math.max(prev.totalInvoicedToday, prev.receivedTodayCashPos + amount),
    }));

    // 2. Update or create invoice
    setInvoices((prev) => {
      const matchIndex = prev.findIndex(
        (inv) =>
          (inv.patientId === patientId || (inv.patientName && inv.patientName === patientName)) &&
          inv.status !== 'paid'
      );

      if (matchIndex >= 0) {
        const existing = prev[matchIndex];
        const newPaid = (existing.patientSharePaid || 0) + amount;
        const patientNet = existing.totalAmount - existing.baseInsuranceCovered - existing.supplInsuranceCovered;
        const newStatus = newPaid >= patientNet ? 'paid' : 'partial';

        const updatedInvoice: Invoice = {
          ...existing,
          patientSharePaid: newPaid,
          status: newStatus,
          paymentMethod,
          posTerminalName,
          trackingCode,
          paidAt: `${todayFa} ${timeFa}`,
          paymentNotes: notes || existing.paymentNotes,
        };

        const clone = [...prev];
        clone[matchIndex] = updatedInvoice;
        return clone;
      } else {
        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          patientId,
          patientName,
          patientNationalId: nationalId,
          dentistId: 'u-dentist1',
          dentistName: 'دکتر کاویانی',
          date: todayFa,
          totalAmount: amount,
          baseInsuranceCovered: 0,
          supplInsuranceCovered: 0,
          patientSharePaid: amount,
          paymentMethod,
          status: 'paid',
          doctorCommissionAmount: Math.round(amount * 0.45),
          posTerminalName,
          trackingCode,
          paidAt: `${todayFa} ${timeFa}`,
          paymentNotes: notes,
          items: [
            {
              procedureName: reason || 'دریافتی و تسویه درمان دندان‌پزشکی',
              toothFdi: 16,
              amount,
            },
          ],
        };
        return [newInvoice, ...prev];
      }
    });

    // 3. Update doctor submission if submissionId provided
    if (submissionId) {
      setDoctorSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                paymentReceived: {
                  amount,
                  method: paymentMethod,
                  posTerminalName,
                  trackingCode,
                  paidAt: `${todayFa} ${timeFa}`,
                  notes,
                },
              }
            : s
        )
      );
    }

    // 4. Record WORM audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `${todayFa} ${timeFa}`,
      actorName: currentUserName,
      actorRole: currentRole,
      action: 'PATIENT_PAYMENT_COLLECTED',
      entityName: 'FinancialPaymentReceipt',
      entityId: patientId,
      hashWORM: `WORM-PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Financial Handlers
  const handlePayInstallment = (planId: string, installmentNo: number) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const timeFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    let collectedAmount = 0;
    let targetPlan: InstallmentPlan | undefined;

    setInstallments((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        targetPlan = plan;
        const updatedSchedule = plan.schedule.map((inst) => {
          if (inst.installmentNo === installmentNo) {
            collectedAmount = inst.amount;
            return { ...inst, status: 'paid' as const, paidAt: todayFa };
          }
          return inst;
        });
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

    if (collectedAmount > 0 && targetPlan) {
      // 1. Update Today's Money Board
      setTodayMoneyBoard((prev) => ({
        ...prev,
        receivedTodayCashPos: prev.receivedTodayCashPos + collectedAmount,
        installmentsDueToday: Math.max(0, prev.installmentsDueToday - collectedAmount),
        installmentsOverdueTotal: Math.max(0, prev.installmentsOverdueTotal - collectedAmount),
      }));

      // 2. Generate a paid invoice entry for the collected installment
      const newInvoice: Invoice = {
        id: `inv-inst-${Date.now()}`,
        patientId: targetPlan.patientId,
        patientName: targetPlan.patientName,
        dentistId: 'u-dentist1',
        dentistName: 'دکتر کاویانی',
        date: todayFa,
        totalAmount: collectedAmount,
        baseInsuranceCovered: 0,
        supplInsuranceCovered: 0,
        patientSharePaid: collectedAmount,
        paymentMethod: 'pos',
        posTerminalName: 'دستگاه پوز ۱ - صندوق مطب',
        trackingCode: `POS-INST-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: `${todayFa} ${timeFa}`,
        status: 'paid',
        doctorCommissionAmount: Math.round(collectedAmount * 0.45),
        items: [
          {
            procedureName: `وصول قسط شماره ${installmentNo} - پرونده درمانی ${targetPlan.patientName}`,
            toothFdi: 16,
            amount: collectedAmount,
          },
        ],
        paymentNotes: `دریافت وجه قسط شماره ${installmentNo} به مبلغ ${collectedAmount.toLocaleString()} تومان با کارتخوان مطب`,
      };
      setInvoices((prev) => [newInvoice, ...prev]);

      // 3. Add WORM audit log
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: `${todayFa} ${timeFa}`,
        actorName: currentUserName,
        actorRole: currentRole,
        action: 'INSTALLMENT_PAID',
        entityName: 'InstallmentPlan',
        entityId: planId,
        hashWORM: `WORM-INST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  // Insurance Bridge Handlers
  const handleSubmitAppeal = (
    claimId: string,
    appealText: string,
    additionalEvidenceUrls?: string[],
    category?: string,
    ruleCitation?: string
  ) => {
    const todayFa = new Date().toLocaleDateString('fa-IR');
    const newAppealId = `app-${Date.now()}`;
    const finalEvidenceUrls =
      additionalEvidenceUrls && additionalEvidenceUrls.length > 0
        ? additionalEvidenceUrls
        : [
            'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
          ];

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const newAppeal: ClaimAppeal = {
          id: newAppealId,
          claimId: c.id,
          createdAt: todayFa,
          reason: appealText,
          status: 'pending',
          submittedBy: 'حسابدار کلینیک',
          dentistName: c.dentistName || 'دکتر کاویانی',
          category: category || 'کسورات غیرمجاز تعرفه‌ای',
          ruleCitation: ruleCitation || 'بند ۱۲ آیین‌نامه تعرفه درمان شورای عالی بیمه',
          additionalEvidenceUrls: finalEvidenceUrls,
        };
        return {
          ...c,
          status: 'appealed' as const,
          appealReason: appealText,
          appealText,
          appealReasonCategory: category,
          appealInsuranceRegulation: ruleCitation,
          additionalEvidenceUrls: finalEvidenceUrls,
          appeals: [newAppeal, ...(c.appeals || []).filter((a) => a.id !== newAppealId)],
          appealHistory: [
            ...(c.appealHistory || []),
            {
              date: todayFa,
              text: appealText,
              status: 'در انتظار بررسی مجدد توسط بازبین ادعا',
            },
          ],
        };
      })
    );
  };

  const handleSendClaimToInsurance = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'submitted',
              receptionApproved: true,
              accountantApproved: true,
              submittedDate: 'امروز',
            }
          : c
      )
    );
  };

  // Insurance Reviewer Handlers
  const handleReviewDecision = (
    claimId: string,
    decision: 'approved' | 'rejected' | 'partially_approved' | 'partially_rejected',
    deductionOrReason?: number | string,
    reasonText?: string
  ) => {
    const deduction = typeof deductionOrReason === 'number' ? deductionOrReason : 0;
    const finalReason = typeof deductionOrReason === 'string' ? deductionOrReason : reasonText;

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const isApprovedOrPartial = decision === 'approved' || decision === 'partially_approved';
        const updatedAppeals = (c.appeals || []).map((a) => ({
          ...a,
          status: isApprovedOrPartial ? ('accepted' as const) : ('rejected' as const),
          responseNotes: finalReason || (decision === 'approved' ? 'اعتراض کلینیک پذیرفته شد و پرونده بدون کسورات تسویه گردید.' : isApprovedOrPartial ? 'اعتراض کلینیک بررسی شد و بخش مصوب پرونده تایید و تسویه گردید.' : 'اعتراض کلینیک رد شد.'),
        }));

        const claimAmount = c.claimedAmount || c.totalAmount || c.totalClaimedAmount || 5200000;

        if (isApprovedOrPartial) {
          const appliedDeduction = decision === 'approved' ? 0 : (deduction || Math.round(claimAmount * 0.2));
          const approvedAmount = Math.max(0, claimAmount - appliedDeduction);

          return {
            ...c,
            status: 'settled' as const,
            appeals: updatedAppeals,
            baseApprovedAmount: c.baseApprovedAmount || Math.round(approvedAmount * 0.3),
            supplApprovedAmount: c.supplApprovedAmount || Math.round(approvedAmount * 0.7),
            deductionAmount: appliedDeduction,
            deductionReason: appliedDeduction > 0 ? (finalReason || 'تایید جزئی ادعا با کسر مازاد سقف تعرفه مصوب بیمه') : undefined,
            totalApprovedAmount: approvedAmount,
            doctorReviewerDiagnosis: finalReason || (decision === 'approved' ? 'تایید کامل مدارک بالینی و رادیولوژی توسط بازبین و انتقال به تسویه‌شده' : 'تایید جزئی مدارک بالینی و تسویه سهم مصوب بیمه'),
          };
        } else {
          return {
            ...c,
            status: 'rejected' as const,
            appeals: updatedAppeals,
            deductionAmount:
              deduction ||
              c.deductionAmount ||
              claimAmount,
            deductionReason:
              finalReason ||
              (decision === 'partially_rejected'
                ? 'رد جزئی ادعا به دلیل نقص در مدارک یا عدم انطباق با تعرفه مصوب'
                : 'رد کامل ادعا به دلیل عدم تطابق با دستورالعمل‌های بیمه‌ای'),
            doctorReviewerDiagnosis: finalReason,
          };
        }
      })
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
    milestone: string,
    targetClinicId?: string
  ) => {
    setLabOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, currentMilestone: milestone } : o))
    );
    updateLabOrderInClinicStore(orderId, status, milestone, targetClinicId || currentClinic.id);
  };

  const handleAddLabOrder = (newOrder: LabOrder, targetClinicId?: string) => {
    const clinicId = targetClinicId || newOrder.clinicId || currentClinic.id;
    const clinicObj = clinics.find((c) => c.id === clinicId) || currentClinic;
    const orderWithClinic: LabOrder = {
      ...newOrder,
      clinicId: clinicId,
      clinicName: clinicObj.name,
    };
    setLabOrders((prev) => [orderWithClinic, ...prev]);
    addLabOrderToClinicStore(clinicId, orderWithClinic);
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
        onGoToLabPortal={() => setViewMode('lab_portal')}
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

  // 3. Lab Portal Standalone Landing Page (Multi-Clinic Aggregated)
  if (viewMode === 'lab_portal') {
    const allLabOrders = getAllClinicsLabOrders();
    return (
      <div className="min-h-screen bg-[#fffffa] text-[#0b2535] font-sans antialiased dir-rtl">
        <LabPortalView
          labOrders={allLabOrders.length > 0 ? allLabOrders : labOrders}
          clinics={clinics}
          onUpdateOrderStatus={handleUpdateLabOrderStatus}
          onAddLabOrder={handleAddLabOrder}
          onBackToLanding={() => setViewMode('dentora_landing')}
        />
      </div>
    );
  }

  // 4. Clinic Portal Landing Page
  if (viewMode === 'clinic_portal') {
    return (
      <ClinicPortalLanding
        clinic={currentClinic}
        users={users}
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
            onUpdatePatient={handleUpdatePatient}
            onSavePatientImage={handleSavePatientImage}
            onUpdatePatientTeeth={handleUpdatePatientTeeth}
            claims={claims}
            setClaims={setClaims}
            greenLane={greenLane}
            hasAccountantRole={hasAccountantRole}
            onToggleHasAccountantRole={handleToggleHasAccountantRole}
            insuranceModuleActive={insuranceModuleActive}
            onToggleInsuranceModule={() => setInsuranceModuleActive(!insuranceModuleActive)}
            isInsuranceContracted={isInsuranceContracted}
            onToggleInsuranceContracted={handleToggleInsuranceContracted}
            onSubmitAppeal={handleSubmitAppeal}
            onSendClaimToInsurance={handleSendClaimToInsurance}
            doctorSubmissions={doctorSubmissions}
            onApproveDoctorSubmission={handleApproveDoctorSubmission}
            doctorRequests={doctorRequests}
            setDoctorRequests={setDoctorRequests}
            onAddDoctorReminder={handleAddDoctorReminder}
            patientQuestions={patientQuestions}
            onReplyQuestion={handleReplyQuestion}
            insuranceDisputes={insuranceDisputes}
            onReplyDispute={handleReplyInsuranceDispute}
            invoices={invoices}
            onRegisterPayment={handleRegisterPatientPayment}
            users={users}
            currentClinic={currentClinic}
            preTreatmentApprovals={preTreatmentApprovals}
            onUploadPreTreatmentApproval={handleUploadPreTreatmentApproval}
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
            onUpdatePatient={(updated) => handleUpdatePatient(activePatient.id, updated)}
            onSavePatientImage={handleSavePatientImage}
            onFinishTreatment={handleFinishTreatment}
            onAddDoctorReminder={handleAddDoctorReminder}
            onNextPatient={handleNextPatient}
            onUpdatePatientTeeth={handleUpdatePatientTeeth}
            insuranceModuleActive={insuranceModuleActive}
            currentUserName={currentUserName}
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
            labOrders={labOrders}
            onAddLabOrder={handleAddLabOrder}
            onUpdateLabOrderStatus={handleUpdateLabOrderStatus}
            patientQuestions={patientQuestions}
            onReplyQuestion={handleReplyQuestion}
            invoices={invoices}
            radiologyLinks={radiologyLinks}
            onRegisterRadiologyLink={handleRegisterRadiologyLink}
          />
        )}

        {/* Accountant Workspace */}
        {currentRole === 'accountant' && (
          <AccountantWorkspace
            moneyBoard={todayMoneyBoard}
            invoices={invoices}
            setInvoices={setInvoices}
            installments={installments}
            setInstallments={setInstallments}
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
            onRecordPayment={handleRegisterPatientPayment}
            onSubmitAppeal={handleSubmitAppeal}
            onSendClaimToInsurance={handleSendClaimToInsurance}
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
              onUpdatePatient={(updated) => handleUpdatePatient(activePatient.id, updated)}
              onSavePatientImage={handleSavePatientImage}
              onFinishTreatment={handleFinishTreatment}
              onAddDoctorReminder={handleAddDoctorReminder}
              onNextPatient={handleNextPatient}
              onUpdatePatientTeeth={handleUpdatePatientTeeth}
              insuranceModuleActive={insuranceModuleActive}
              currentUserName={currentUserName}
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
              labOrders={labOrders}
              onAddLabOrder={handleAddLabOrder}
              onUpdateLabOrderStatus={handleUpdateLabOrderStatus}
              patientQuestions={patientQuestions}
              onReplyQuestion={handleReplyQuestion}
              radiologyLinks={radiologyLinks}
              onRegisterRadiologyLink={handleRegisterRadiologyLink}
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
            setClaims={setClaims}
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
            users={users}
            currentClinic={currentClinic}
            questions={patientQuestions}
            onAskQuestion={handleAskQuestion}
            insuranceDisputes={insuranceDisputes}
            onSubmitDispute={handleSubmitInsuranceDispute}
            preTreatmentApprovals={preTreatmentApprovals}
            onUploadPreTreatmentApproval={handleUploadPreTreatmentApproval}
            radiologyLinks={radiologyLinks}
            onRegisterRadiologyLink={handleRegisterRadiologyLink}
            onBookOnline={(dId, slot, dt, reason, isFirstVisit, checkInFormCompleted) => {
              const matchedDoctor = users.find((u) => u.id === dId);
              const docName =
                matchedDoctor?.name ||
                (dId === 'u-owner-dentist' || dId.startsWith('u-owner')
                  ? (currentClinic.ownerName.startsWith('دکتر') ? currentClinic.ownerName : `دکتر ${currentClinic.ownerName}`)
                  : (dId === 'u-dentist2' ? 'دکتر شریفی' : 'دکتر کاویانی'));
              const newApt: Appointment = {
                id: `apt-${Date.now()}`,
                patientId: activePatient.id,
                patientName: activePatient.fullName,
                patientPhone: activePatient.phone,
                nationalId: activePatient.nationalId,
                dentistId: dId,
                dentistName: docName,
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
            labOrders={getAllClinicsLabOrders().length > 0 ? getAllClinicsLabOrders() : labOrders}
            clinics={clinics}
            onUpdateOrderStatus={handleUpdateLabOrderStatus}
            onAddLabOrder={handleAddLabOrder}
            onBackToLanding={() => setViewMode('dentora_landing')}
          />
        )}

      </main>
    </div>
  );
}
