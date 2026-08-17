import React, { useState } from 'react';
import {
  Appointment,
  Patient,
  WaitlistEntry,
  ToothDetail,
  Claim,
  ClaimStatus,
  GreenLaneStatus,
  DoctorSubmission,
  DoctorRequestReminder,
  PatientQuestion as GlobalPatientQuestion,
  PatientInsuranceDispute,
  PatientImageRecord,
  UserProfile,
  ClinicRegistration,
} from '../../types';
import {
  SUGGESTED_BASE_INSURANCES,
  SUGGESTED_SUPPLEMENTARY_INSURANCES,
} from '../../data/insuranceConstants';
import { Odontogram } from '../dentist/Odontogram';
import { ImageXrayViewer } from '../dentist/ImageXrayViewer';
import { InsuranceDocsWorkspace } from './InsuranceDocsWorkspace';
import {
  Search,
  Plus,
  Calendar,
  Clock,
  UserCheck,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Bell,
  X,
  User,
  Check,
  FolderOpen,
  LayoutGrid,
  FileText,
  Phone,
  Send,
  SendHorizontal,
  Paperclip,
  Edit3,
  Sparkles,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  PhoneForwarded,
  Filter,
  CheckSquare,
  XCircle,
  UserPlus,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Download,
  Maximize2,
  Activity,
  HeartPulse,
  Stethoscope,
  PlusCircle,
  ShieldAlert,
  Unlock,
  Lock,
  Upload,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  MessageCircle,
  FileCheck,
  CreditCard,
  Printer,
  FileCheck2,
  ImageIcon,
} from 'lucide-react';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  waitlist: WaitlistEntry[];
  onConnectToDoctor: (appointmentId: string, note: string) => void;
  onAddAppointment: (apt: Appointment) => void;
  onCancelAppointment: (aptId: string) => void;
  onAddPatient?: (newPatient: Patient) => void;
  claims?: Claim[];
  setClaims?: React.Dispatch<React.SetStateAction<Claim[]>>;
  greenLane?: GreenLaneStatus;
  hasAccountantRole?: boolean;
  onToggleHasAccountantRole?: () => void;
  insuranceModuleActive?: boolean;
  onToggleInsuranceModule?: () => void;
  isInsuranceContracted?: boolean;
  onToggleInsuranceContracted?: () => void;
  onSubmitAppeal?: (claimId: string, appealText: string) => void;
  onSendClaimToInsurance?: (claimId: string) => void;
  doctorSubmissions?: DoctorSubmission[];
  onApproveDoctorSubmission?: (submissionId: string) => void;
  doctorRequests?: DoctorRequestReminder[];
  setDoctorRequests?: React.Dispatch<React.SetStateAction<DoctorRequestReminder[]>>;
  onAddDoctorReminder?: (reminder: {
    patientName: string;
    patientPhone: string;
    doctorName: string;
    reason: string;
    suggestedDate: string;
  }) => void;
  onUpdatePatient?: (patientId: string, updatedFields: Partial<Patient>) => void;
  onSavePatientImage?: (patientId: string, imageRecord: PatientImageRecord) => void;
  onUpdatePatientTeeth?: (patientId: string, updatedTeeth: Record<number, ToothDetail>) => void;
  patientQuestions?: GlobalPatientQuestion[];
  onReplyQuestion?: (questionId: string, replyMessage: string, senderRole: 'receptionist' | 'dentist', senderName: string) => void;
  insuranceDisputes?: PatientInsuranceDispute[];
  onReplyDispute?: (disputeId: string, responseMessage: string, status?: 'under_review' | 'approved_pay' | 'need_docs' | 'rejected') => void;
  users?: UserProfile[];
  currentClinic?: ClinicRegistration;
}

// Right Sidebar Navigation Tabs
type ReceptionTab =
  | 'today_kanban'
  | 'call_center'
  | 'patient_records'
  | 'insurance_docs'
  | 'insurance_inquiry'
  | 'create_raw_file'
  | 'doctor_reminders'
  | 'user_messages'
  | 'edit_checkin_form'
  | 'calendar_slots';

// Patient Question Definition (User Messages)
export interface PatientQuestion {
  id: string;
  patientName: string;
  patientPhone: string;
  subject: string;
  questionText: string;
  createdAt: string;
  status: 'pending' | 'answered';
  replyText?: string;
  repliedAt?: string;
  attachedDocs?: { title: string; type?: string; status?: string }[];
}

// Patient Insurance Appeal Inquiry Item
export interface PatientInsuranceAppealTrack {
  id: string;
  claimNumber: string;
  patientName: string;
  nationalId: string;
  patientPhone: string;
  insuranceProvider: string;
  claimedAmount: number;
  deductionAmount: number;
  appealReason: string;
  submittedDate: string;
  status: 'under_review' | 'approved_pay' | 'rejected';
  responseFromInsurer?: string;
  lastUpdated: string;
}

// Check-In Form Question Definition
export interface CheckInQuestion {
  id: string;
  text: string;
  type: 'text' | 'long_text' | 'choice' | 'boolean';
  typeLabel: string;
  required: boolean;
  options?: string[];
}

// No-Show Patient Record Definition
export interface NoShowRecord {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  dentistName: string;
  timeSlot: string;
  date: string;
  absenceReason: string;
  followUpStatus: 'pending' | 'called_rescheduled' | 'no_answer' | 'canceled_permanently';
  followUpNotes: string;
  loggedAt: string;
}

// Patient Detail Modal Sub-Tabs
type PatientFileSubTab =
  | 'general'
  | 'odontogram'
  | 'radiography'
  | 'visit_history'
  | 'ai_proposals'
  | 'edit_info';

// Call Center Phone Log
interface PhoneCallLog {
  id: string;
  callerName: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  time: string;
  notes: string;
}

// Sample Default Tooth Map for Odontogram fallback
const defaultTeethMap: Record<number, ToothDetail> = {
  16: { fdiNumber: 16, condition: 'decay', affectedSurfaces: ['Occlusal', 'Mesial'], notes: 'پوسیدگی عمیق تاج', treatmentHistory: [] },
  26: { fdiNumber: 26, condition: 'filled', affectedSurfaces: ['Occlusal'], notes: 'ترمیم قبلی کامپوزیت', treatmentHistory: [] },
  36: { fdiNumber: 36, condition: 'rct_needed', affectedSurfaces: ['Occlusal', 'Distal'], notes: 'عصب‌کشی اولیه', treatmentHistory: [] },
  46: { fdiNumber: 46, condition: 'crown', affectedSurfaces: ['Occlusal', 'Mesial', 'Distal', 'Buccal', 'Lingual'], notes: 'روکش زيرکونيا', treatmentHistory: [] },
};

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  patients,
  waitlist,
  onConnectToDoctor,
  onAddAppointment,
  onCancelAppointment,
  onAddPatient,
  claims = [],
  setClaims,
  greenLane,
  hasAccountantRole = true,
  onToggleHasAccountantRole,
  insuranceModuleActive = true,
  onToggleInsuranceModule,
  isInsuranceContracted = true,
  onToggleInsuranceContracted,
  onSubmitAppeal,
  onSendClaimToInsurance,
  doctorSubmissions: propsDoctorSubmissions,
  onApproveDoctorSubmission,
  doctorRequests: propsDoctorRequests,
  setDoctorRequests: propsSetDoctorRequests,
  onAddDoctorReminder,
  onUpdatePatient,
  onSavePatientImage,
  onUpdatePatientTeeth,
  patientQuestions: propsPatientQuestions,
  onReplyQuestion,
  insuranceDisputes: propsInsuranceDisputes,
  onReplyDispute,
  users = [],
  currentClinic,
}) => {
  // Dynamic clinic dentists from clinic owner and users
  const clinicDentists = React.useMemo(() => {
    const list: { id: string; name: string; specialty?: string }[] = [];
    if (currentClinic?.ownerRole === 'dentist' && currentClinic?.ownerName) {
      list.push({
        id: 'u-owner-dentist',
        name: currentClinic.ownerName.startsWith('دکتر') ? currentClinic.ownerName : `دکتر ${currentClinic.ownerName}`,
        specialty: 'مؤسس کلینیک و دندان‌پزشک',
      });
    }
    (users || []).forEach((u) => {
      if (u.role === 'dentist') {
        const already = list.some((x) => x.name === u.name || x.id === u.id);
        if (!already) {
          list.push({
            id: u.id,
            name: u.name,
            specialty: u.specialty || 'دندان‌پزشک معالج',
          });
        }
      }
    });
    if (list.length === 0) {
      list.push({
        id: 'u-dentist1',
        name: currentClinic?.ownerName ? (currentClinic.ownerName.startsWith('دکتر') ? currentClinic.ownerName : `دکتر ${currentClinic.ownerName}`) : 'دکتر کاویانی',
        specialty: 'دندان‌پزشک معالج',
      });
    }
    return list;
  }, [users, currentClinic]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ReceptionTab>('today_kanban');
  const [callCenterSubTab, setCallCenterSubTab] = useState<'quick_booking' | 'waitlist' | 'logs'>('quick_booking');
  const [searchQuery, setSearchQuery] = useState('');

  // Insurance Review Modal State (بررسی شرح بیمه)
  const [selectedSubmissionForInsuranceReview, setSelectedSubmissionForInsuranceReview] = useState<DoctorSubmission | null>(null);
  const [narrativeEditText, setNarrativeEditText] = useState<string>('');
  const [selectedClaimForDocReview, setSelectedClaimForDocReview] = useState<Claim | null>(null);
  const [insuranceDocFilter, setInsuranceDocFilter] = useState<'all' | 'pending' | 'greenlane' | 'appeals' | 'settled'>('all');
  const [showEvidencePreviewModal, setShowEvidencePreviewModal] = useState<{ title: string; type: string; url?: string } | null>(null);

  // User Messages & Appeals Sub-Tab
  const [userMessagesSubTab, setUserMessagesSubTab] = useState<'general_questions' | 'insurance_appeals'>('general_questions');

  // Action feedback toast
  const [receptionToast, setReceptionToast] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const showReceptionToast = (text: string, type: 'success' | 'info' = 'success') => {
    setReceptionToast({ text, type });
    setTimeout(() => setReceptionToast(null), 4000);
  };

  // Mock initial Patient Questions for Receptionist (including appeal & complaint message with attached docs)
  const [localPatientQuestions, setLocalPatientQuestions] = useState<PatientQuestion[]>([
    {
      id: 'q-appeal-patient',
      patientName: 'علی رضایی',
      patientPhone: '۰۹۱۲۹۸۷۶۵۴۳',
      subject: 'اعتراض به کسورات بیمه سامان و ارسال مدارک تکمیلی',
      questionText: 'با سلام و احترام، بیمه سامان مبلغ ۴۵۰,۰۰۰ تومان از هزینه عصب‌کشی من کسر کرده است. عکس گرافی RVG ثانویه و برگه تاییدیه پزشک معتمد را پیوست کردم، لطفاً پیگیری بفرمایید.',
      createdAt: '۱۰:۱۵ امروز',
      status: 'pending',
      attachedDocs: [
        { title: 'تصویر گرافی RVG ثانویه (تاییدشده)', type: 'xray', status: 'پیوست شد' },
        { title: 'برگه تاییدیه پزشک معتمد کلینیک', type: 'pre_auth_certificate', status: 'پیوست شد' },
      ],
    },
    {
      id: 'q-1',
      patientName: 'مریم رضایی',
      patientPhone: '۰۹۱۲۹۸۷۶۵۴۳',
      subject: 'استعلام سقف تعهدات بیمه تکمیلی سامان برای ایمپلنت',
      questionText: 'با سلام، من هفته آینده نوبت کاشت ایمپلنت دندان ۴۶ دارم. آیا بیمه تکمیلی سامان هزینه جراحی فک و پروتز رو کامل کاور می‌کنه یا نیاز به تاییدیه حضوری هست؟',
      createdAt: '۱۰:۱۵ امروز',
      status: 'pending',
    },
    {
      id: 'q-2',
      patientName: 'حسین ابراهیمی',
      patientPhone: '۰۹۳۵۱۱۱۲۲۳۳',
      subject: 'درد خفیف و احساس بلندی پانسمان بعد از عصب‌کشی دندان ۱۶',
      questionText: 'سلام خسته نباشید. دیروز توسط دکتر کاویانی عصب‌کشی انجام دادم. پانسمان کمی بلند به نظر میاد، ایا لازمه امروز بیام مطب کوتاه کنن؟',
      createdAt: 'دیروز ۱۸:۳۰',
      status: 'answered',
      replyText: 'سلام جناب ابراهیمی عزیز، احساس بلندی پانسمان طبیعی است. لطفاً امروز بین ساعت ۱۶ الی ۱۷ تشریف بیارید تا بدون نوبت تنظیم شود.',
      repliedAt: 'دیروز ۱۹:۰۰',
    },
  ]);

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Mock Patient Insurance Appeal Tracks for Receptionist
  const [localPatientAppeals, setLocalPatientAppeals] = useState<PatientInsuranceAppealTrack[]>([
    {
      id: 'app-1',
      claimNumber: 'CLM-1405-8821',
      patientName: 'علی رضایی',
      nationalId: '0012345678',
      patientPhone: '09129876543',
      insuranceProvider: 'بیمه تامین اجتماعی',
      claimedAmount: 3200000,
      deductionAmount: 450000,
      appealReason: 'عدم پذیرش تعرفه کامپوزیت ۳ سطحی دندان ۱۶ به دلیل عدم وضوح گرافی پری‌آپیکال اولیه',
      submittedDate: '۱۴۰۵/۰۵/۱۴',
      status: 'under_review',
      responseFromInsurer: 'پرونده در کمیسیون تخصصی دندانپزشکی سازمان تامین اجتماعی در حال بازبینی گرافی مجدد است.',
      lastUpdated: 'امروز ۰۹:۱۵',
    },
    {
      id: 'app-2',
      claimNumber: 'CLM-1405-3341',
      patientName: 'زهرا موسوی',
      nationalId: '0055443322',
      patientPhone: '09123334455',
      insuranceProvider: 'بیمه تکمیلی سامان',
      claimedAmount: 5800000,
      deductionAmount: 1200000,
      appealReason: 'اعتراض به کسر مبلغ جراحی افزایش طول تاج دندان ۴۶',
      submittedDate: '۱۴۰۵/۰۵/۱۰',
      status: 'approved_pay',
      responseFromInsurer: 'اعتراض بیمار و شرح بالینی پزشک تایید گردید. مبلغ ۱,۲۰۰,۰۰۰ تومان مابه‌التفاوت به حساب کلینیک واریز شد.',
      lastUpdated: 'دیروز ۱۱:۴۰',
    },
  ]);

  // Derived list of patient questions (from props or local)
  const displayPatientQuestions = propsPatientQuestions
    ? propsPatientQuestions.map((q) => ({
        id: q.id,
        patientName: q.patientName,
        patientPhone: q.patientPhone,
        subject: q.category || 'پرسش بیمار',
        questionText: q.question,
        createdAt: q.createdAt,
        status: (q.status === 'answered' ? 'answered' : 'pending') as 'pending' | 'answered',
        replyText: q.answer || (q.replies && q.replies.length > 0 ? q.replies[q.replies.length - 1].message : undefined),
        repliedAt: q.answeredAt || (q.replies && q.replies.length > 0 ? q.replies[q.replies.length - 1].createdAt : undefined),
        repliedBy: q.repliedBy || (q.replies && q.replies.length > 0 ? q.replies[q.replies.length - 1].senderName : undefined),
        attachedDocs: [],
      }))
    : localPatientQuestions;

  // Derived list of patient insurance appeals / disputes
  const displayPatientAppeals = propsInsuranceDisputes
    ? propsInsuranceDisputes.map((d) => ({
        id: d.id,
        claimNumber: d.claimNumber || `CLM-${d.id.slice(-4)}`,
        patientName: d.patientName,
        nationalId: d.nationalId,
        patientPhone: d.patientPhone,
        insuranceProvider: d.insuranceProvider,
        claimedAmount: d.claimedAmount || 0,
        deductionAmount: d.deductionAmount || 0,
        appealReason: `${d.topic ? d.topic + ': ' : ''}${d.message}`,
        submittedDate: d.lastUpdated || '۱۴۰۵/۰۵/۱۴',
        status: d.status as 'under_review' | 'approved_pay' | 'rejected',
        responseFromInsurer: d.responseMessage,
        lastUpdated: d.lastUpdated || 'هم‌اکنون',
        imageName: d.imageName,
        imageDesc: d.imageDesc,
      }))
    : localPatientAppeals;

  // Local state synchronization
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);
  const [localPatients, setLocalPatients] = useState<Patient[]>(patients);

  React.useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  React.useEffect(() => {
    setLocalPatients(patients);
  }, [patients]);

  React.useEffect(() => {
    if (propsDoctorSubmissions) {
      setDoctorSubmissions(propsDoctorSubmissions);
    }
  }, [propsDoctorSubmissions]);

  // Kanban Connection Modal / State
  const [selectedAptForConnect, setSelectedAptForConnect] = useState<Appointment | null>(null);
  const [receptionNote, setReceptionNote] = useState('');

  // Phone Booking Modal State & Multi-slot Selection
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newDentistName, setNewDentistName] = useState(clinicDentists[0]?.name || 'دکتر کاویانی');
  const [newReason, setNewReason] = useState('معاینه و پیگیری درمان');
  const [newTimeSlot, setNewTimeSlot] = useState('11:30');
  const [bookingSlotCount, setBookingSlotCount] = useState<number>(1);

  // Raw Patient File Creation Form State
  const [targetClaimIdForReview, setTargetClaimIdForReview] = useState<string | null>(null);
  const [rawFullName, setRawFullName] = useState('');
  const [rawNationalId, setRawNationalId] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [rawBirthDate, setRawBirthDate] = useState('۱۳۷۰/۰۴/۱۵');
  const [rawGender, setRawGender] = useState<'male' | 'female'>('male');
  const [rawPrimaryInsurance, setRawPrimaryInsurance] = useState('بیمه تامین اجتماعی');
  const [customPrimaryInsurance, setCustomPrimaryInsurance] = useState('');
  const [rawSupplementaryInsurance, setRawSupplementaryInsurance] = useState('بیمه سامان');
  const [customSupplementaryInsurance, setCustomSupplementaryInsurance] = useState('');
  const [rawMedicalHistory, setRawMedicalHistory] = useState('بدون بیماری زمینه خاص');
  const [rawAllergies, setRawAllergies] = useState('بدون حساسیت دارویی ثبت‌شده');
  const [rawEmergencyContact, setRawEmergencyContact] = useState('۰۹۱۲۱۱۱۲۲۳۳');

  // Patient Records Sub-Tab (All vs Pending Doctor Submissions)
  const [patientRecordSubTab, setPatientRecordSubTab] = useState<'all' | 'pending_doctor'>('all');
  
  // Selected Full Patient File View
  const [selectedPatientFile, setSelectedPatientFile] = useState<Patient | null>(null);
  const [patientFileTab, setPatientFileTab] = useState<PatientFileSubTab>('general');
  const [patientTeethState, setPatientTeethState] = useState<Record<number, ToothDetail>>(defaultTeethMap);
  const [selectedToothFdi, setSelectedToothFdi] = useState<number | null>(16);

  // Edit Patient Form State
  const [editPhone, setEditPhone] = useState('');
  const [editHistory, setEditHistory] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editEmergency, setEditEmergency] = useState('');

  // Doctor Submissions Pending Approval
  const [doctorSubmissions, setDoctorSubmissions] = useState<DoctorSubmission[]>([
    {
      id: 'sub-1',
      patientName: 'علی رضایی',
      patientPhone: '09129876543',
      nationalId: '0012345678',
      dentistName: 'دکتر کاویانی',
      treatmentSummary: 'درمان ریشه (RCT) دندان ۱۶ + ترمیم کامپوزیت ۳ سطحی',
      prescriptionSummary: 'کپسول آموکسی‌سیلین ۵۰۰ + قرص مفنامیک اسید ۲۵۰',
      submittedAt: '۱۰:۲۵ امروز',
      status: 'pending',
    },
    {
      id: 'sub-2',
      patientName: 'مریم سادات حسینی',
      patientPhone: '09351112233',
      nationalId: '0078899112',
      dentistName: 'دکتر نوری',
      treatmentSummary: 'جرم‌گیری و بروساژ دو فک + گرافی تک‌دندان RVG',
      prescriptionSummary: 'دهان‌شویه کلرهگزیدین ۰.۱۲٪',
      submittedAt: '۱۱:۱۰ امروز',
      status: 'pending',
    },
  ]);

  // Doctor Follow-Up Requests / Reminders
  const [localDoctorRequests, setLocalDoctorRequests] = useState<DoctorRequestReminder[]>([
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

  React.useEffect(() => {
    if (propsDoctorRequests) {
      setLocalDoctorRequests(propsDoctorRequests);
    }
  }, [propsDoctorRequests]);

  const activeDoctorRequests = propsDoctorRequests || localDoctorRequests;
  const updateDoctorRequests = (updater: (prev: DoctorRequestReminder[]) => DoctorRequestReminder[]) => {
    if (propsSetDoctorRequests) {
      propsSetDoctorRequests(updater);
    }
    setLocalDoctorRequests(updater);
  };

  // Insurance Real-Time Inquiry State
  const [entitlementNationalId, setEntitlementNationalId] = useState('0012345678');
  const [entitlementProvider, setEntitlementProvider] = useState('تامین اجتماعی');
  const [entitlementSupplementary, setEntitlementSupplementary] = useState('بیمه سامان (طرح طلایی)');
  const [isInquiringInsurance, setIsInquiringInsurance] = useState(false);
  const [entitlementResult, setEntitlementResult] = useState<any | null>({
    nationalId: '0012345678',
    patientName: 'علی رضایی',
    primaryInsurance: 'بیمه تامین اجتماعی (فعال)',
    supplementaryInsurance: 'بیمه سامان - طرح طلایی (فعال)',
    ceilingRemaining: 24500000,
    waitingPeriodDays: 0,
    franchisePercent: 10,
    trackingCode: 'EST-1405-9921',
    eligibleServices: ['عصب‌کشی (RCT)', 'ترمیم کامپوزیت', 'روکش زيرکونيا', 'جرم‌گیری', 'گرافی RVG تک‌دندان'],
    lastInquiryTime: '۱۰:۴۵ امروز',
  });
  const [inquiryHistory, setInquiryHistory] = useState<Array<{
    id: string;
    patientName: string;
    nationalId: string;
    provider: string;
    supplProvider?: string;
    ceiling: number;
    franchise: number;
    status: 'active' | 'expired' | 'no_entitlement';
    time: string;
    trackingCode: string;
    eligibleServices: string[];
  }>>([
    {
      id: 'inq-1',
      patientName: 'علی رضایی',
      nationalId: '0012345678',
      provider: 'تامین اجتماعی',
      supplProvider: 'بیمه سامان (طلایی)',
      ceiling: 24500000,
      franchise: 10,
      status: 'active',
      time: '۱۰:۴۵ امروز',
      trackingCode: 'EST-1405-9921',
      eligibleServices: ['عصب‌کشی (RCT)', 'ترمیم کامپوزیت', 'روکش زيرکونيا', 'جرم‌گیری', 'گرافی RVG تک‌دندان'],
    },
    {
      id: 'inq-2',
      patientName: 'سارا احمدی',
      nationalId: '0033221144',
      provider: 'بیمه سلامت ایرانیان',
      supplProvider: 'بیمه ایران',
      ceiling: 18000000,
      franchise: 15,
      status: 'active',
      time: '۰۹:۲۰ امروز',
      trackingCode: 'EST-1405-8843',
      eligibleServices: ['جرم‌گیری و بروساژ', 'ترمیم آمالگام ۲ سطحی', 'کشیدن دندان قدامی'],
    },
    {
      id: 'inq-3',
      patientName: 'کامران حسینی',
      nationalId: '0044556677',
      provider: 'بیمه نیروهای مسلح',
      supplProvider: 'فاقد بیمه تکمیلی',
      ceiling: 12000000,
      franchise: 20,
      status: 'active',
      time: '۰۸:۴۰ امروز',
      trackingCode: 'EST-1405-7729',
      eligibleServices: ['ویزیت و معاینه', 'رادیوگرافی RVG', 'پالپوتومی'],
    },
  ]);

  // No-Show Patient Records & Follow-Up Tracking
  const [noShowRecords, setNoShowRecords] = useState<NoShowRecord[]>([
    {
      id: 'ns-1',
      appointmentId: 'apt-2',
      patientName: 'کامران حسینی',
      patientPhone: '09123456789',
      dentistName: 'دکتر نوری',
      timeSlot: '09:00 - 09:30',
      date: '1405-05-13',
      absenceReason: 'عدم پاسخ به تماس تلفنی و عدم مراجعه',
      followUpStatus: 'pending',
      followUpNotes: 'منشی ۲ بار تماس گرفت، پاسخ نداد.',
      loggedAt: '۱۰:۱۵ امروز',
    },
  ]);

  // Check-In Form Configurator State (Matching Form پذیرش کلینیک Image)
  const [checkInQuestions, setCheckInQuestions] = useState<CheckInQuestion[]>([
    {
      id: 'q-1',
      text: 'آیا به دارویی حساسیت دارید؟',
      type: 'text',
      typeLabel: 'رشته',
      required: true,
    },
    {
      id: 'q-2',
      text: 'بیماری‌های زمینه‌ای (دیابت، فشارخون، قلبی...)',
      type: 'long_text',
      typeLabel: 'متن',
      required: false,
    },
    {
      id: 'q-3',
      text: 'داروهای مصرفی فعلی',
      type: 'long_text',
      typeLabel: 'متن',
      required: false,
    },
    {
      id: 'q-4',
      text: 'شکایت اصلی',
      type: 'choice',
      typeLabel: 'انتخابی',
      required: true,
      options: ['درد دندان', 'جرم‌گیری', 'ترمیم', 'معاینه عمومی', 'سایر'],
    },
    {
      id: 'q-5',
      text: 'آیا باردار هستید یا احتمال بارداری دارید؟',
      type: 'choice',
      typeLabel: 'انتخابی',
      required: false,
      options: ['بله', 'خیر', 'مرد'],
    },
  ]);

  // New Check-In Question Form Inputs
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<'text' | 'long_text' | 'choice' | 'boolean'>('text');
  const [newQRequired, setNewQRequired] = useState<boolean>(true);
  const [newQOptions, setNewQOptions] = useState('');

  // Local Waitlist State & Management
  const [localWaitlist, setLocalWaitlist] = useState<WaitlistEntry[]>(waitlist);
  const [waitlistSearchQuery, setWaitlistSearchQuery] = useState('');
  const [waitlistFilterPriority, setWaitlistFilterPriority] = useState<'all' | 'urgent' | 'normal'>('all');
  const [isAddWaitlistModalOpen, setIsAddWaitlistModalOpen] = useState(false);
  const [newWaitlistName, setNewWaitlistName] = useState('');
  const [newWaitlistPhone, setNewWaitlistPhone] = useState('');
  const [newWaitlistNationalId, setNewWaitlistNationalId] = useState('');
  const [newWaitlistReason, setNewWaitlistReason] = useState('درد شدید دندان ۴۶ (نوبت کنسلی)');
  const [newWaitlistPriority, setNewWaitlistPriority] = useState<'urgent' | 'normal'>('urgent');
  const [selectedWaitlistPatientForBooking, setSelectedWaitlistPatientForBooking] = useState<WaitlistEntry | null>(null);

  // Quick Smart Booking Form State
  const [quickBookingDateIndex, setQuickBookingDateIndex] = useState(0);
  const [quickBookingDoctor, setQuickBookingDoctor] = useState(clinicDentists[0]?.name || 'دکتر کاویانی');
  const [quickBookingStartSlot, setQuickBookingStartSlot] = useState('09:00');
  const [quickBookingSlotCount, setQuickBookingSlotCount] = useState(1);
  const [quickBookingName, setQuickBookingName] = useState('');
  const [quickBookingPhone, setQuickBookingPhone] = useState('');
  const [quickBookingNationalId, setQuickBookingNationalId] = useState('');
  const [quickBookingReason, setQuickBookingReason] = useState('معاینه و طرح درمان اولیه');

  // Call Center Logs & Filter State
  const [callLogSearchQuery, setCallLogSearchQuery] = useState('');
  const [callLogTypeFilter, setCallLogTypeFilter] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');
  const [callLogs] = useState<PhoneCallLog[]>([
    {
      id: 'cl-1',
      callerName: 'علیرضا محمدی',
      phone: '۰۹۱۲۱۱۱۲۲۳۳',
      type: 'incoming',
      time: '۰۹:۴۵',
      notes: 'استعلام زمان نوبت پیگیری ترمیم دندان ۱۴',
    },
    {
      id: 'cl-2',
      callerName: 'زهرا کاظمی',
      phone: '۰۹۳۵۴۴۴۵۵۶۶',
      type: 'outgoing',
      time: '۱۰:۱۵',
      notes: 'یادآوری نوبت عصر امروز ساعت ۱۶:۳۰',
    },
    {
      id: 'cl-3',
      callerName: 'امیرحسین رضایی',
      phone: '۰۹۱۲۹۹۹۸۸۷۷',
      type: 'missed',
      time: '۱۱:۰۵',
      notes: 'تماس ناموفق - نیازمند پیگیری و تماس مجدد منشی',
    },
    {
      id: 'cl-4',
      callerName: 'مریم سادات طباطبایی',
      phone: '۰۹۳۵۲۲۲۳۳۴۴',
      type: 'incoming',
      time: '۱۱:۴۰',
      notes: 'درخواست ثبت نوبت فوری در لیست انتظار برای ایمپلنت',
    },
  ]);

  // Secretary Interactive Calendar State
  const [calendarDateIndex, setCalendarDateIndex] = useState<number>(0);
  const datesList = ['۱۳ مرداد ۱۴۰۵ (امروز)', '۱۴ مرداد ۱۴۰۵ (فردا)', '۱۵ مرداد ۱۴۰۵ (پنج‌شنبه)'];
  const [selectedCalendarDoctor, setSelectedCalendarDoctor] = useState('همه پزشکان');
  const [slotToBook, setSlotToBook] = useState<string | null>(null);

  // Filtered Appointments
  const filteredAppointments = localAppointments.filter((apt) => {
    return (
      apt.patientName.includes(searchQuery) ||
      apt.nationalId.includes(searchQuery) ||
      apt.patientPhone.includes(searchQuery)
    );
  });

  // Filtered Patients
  const filteredPatients = localPatients.filter((p) => {
    return (
      p.fullName.includes(searchQuery) ||
      p.nationalId.includes(searchQuery) ||
      p.phone.includes(searchQuery) ||
      p.udrCode.includes(searchQuery)
    );
  });

  // Calculate Multi-Slot string
  const calculateMultiSlotString = (startSlot: string, count: number): string => {
    const cleanStart = startSlot.split(' - ')[0].trim();
    const startIndex = timeSlotsHourly.findIndex((s) => s.startsWith(cleanStart));
    if (startIndex === -1) return startSlot;

    const effectiveCount = Math.max(1, count);
    const endIndex = Math.min(startIndex + effectiveCount - 1, timeSlotsHourly.length - 1);
    const startPart = timeSlotsHourly[startIndex].split(' - ')[0];
    const endPart = timeSlotsHourly[endIndex].split(' - ')[1];

    if (effectiveCount === 1) {
      return `${startPart} - ${endPart}`;
    }

    const durationHours = effectiveCount * 0.5;
    const durationText = durationHours === 1 ? '۱ ساعت کامل' : `${durationHours} ساعت`;
    return `${startPart} - ${endPart} (${durationText} - ${effectiveCount} بازه متوالی)`;
  };

  // Helper to check if a calendar time slot is occupied by any appointment
  const findAppointmentForSlot = (slot: string, appointmentsList: Appointment[], doctorFilter: string) => {
    const parts = slot.split(' - ');
    const slotStart = parts[0].trim();
    const slotEnd = parts.length > 1 ? parts[1].trim() : slotStart;

    return appointmentsList.find((apt) => {
      if (apt.status === 'cancelled') return false;
      if (doctorFilter !== 'همه پزشکان' && apt.dentistName !== doctorFilter) return false;

      const aptSlot = apt.timeSlot || '';

      if (aptSlot === slot) return true;

      const times = aptSlot.match(/\d{2}:\d{2}/g);
      if (times && times.length >= 2) {
        const aptStart = times[0];
        const aptEnd = times[1];

        // Interval overlap formula: slot overlaps with appointment if slotStart < aptEnd AND slotEnd > aptStart
        return slotStart < aptEnd && slotEnd > aptStart;
      } else if (times && times.length === 1) {
        return aptSlot.includes(slotStart) || slotStart === times[0];
      }

      return aptSlot.includes(slotStart);
    });
  };

  // Move Appointment Status between Kanban Columns
  const handleMoveAppointmentStatus = (
    aptId: string,
    newStatus: Appointment['status'],
    note?: string
  ) => {
    setLocalAppointments((prev) =>
      prev.map((apt) =>
        apt.id === aptId
          ? {
              ...apt,
              status: newStatus,
              connectedToUnit: newStatus === 'in_unit',
              receptionNoteToDoctor: note || apt.receptionNoteToDoctor,
            }
          : apt
      )
    );

    if (newStatus === 'in_unit') {
      onConnectToDoctor(aptId, note || 'اتصال آنلاین به سیستم یونیت پزشک');
      alert('پرونده این بیمار روی یونیت سیستم پزشک معالج فعال گردید و پزشک می‌تواند اطلاعات کامل آن را مشاهده کند.');
    }
  };

  // Handlers
  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptForConnect) return;
    handleMoveAppointmentStatus(selectedAptForConnect.id, 'in_unit', receptionNote);
    setSelectedAptForConnect(null);
    setReceptionNote('');
  };

  const handleCreatePhoneBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !newPatientPhone) return;

    const timeSlotString = calculateMultiSlotString(newTimeSlot, bookingSlotCount);

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: `p-${Date.now()}`,
      patientName: newPatientName,
      patientPhone: newPatientPhone,
      nationalId: newNationalId || '00' + Math.floor(10000000 + Math.random() * 90000000),
      dentistId: 'u-dentist1',
      dentistName: newDentistName,
      branchId: 'br-1',
      date: '1405-05-13',
      timeSlot: timeSlotString,
      reason: newReason,
      status: 'scheduled',
      isFirstVisit: true,
      visitFeePaid: false,
      checkInFormCompleted: false,
      createdAt: '۱۴۰۵/۰۵/۱۳',
    };

    setLocalAppointments((prev) => [newApt, ...prev]);
    onAddAppointment(newApt);
    setIsPhoneModalOpen(false);
    setSlotToBook(null);
    setNewPatientName('');
    setNewPatientPhone('');
    setNewNationalId('');
    setBookingSlotCount(1);
    alert(`نوبت با موفقیت برای بیمار ${newPatientName} در بازه (${timeSlotString}) ثبت گردید.`);
  };

  const handleCreateRawPatientFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawFullName || !rawPhone) {
      alert('لطفاً نام کامل و شماره همراه بیمار را وارد کنید.');
      return;
    }

    const finalPrimary =
      rawPrimaryInsurance === '__other__'
        ? customPrimaryInsurance.trim() || 'سایر بیمه‌های پایه'
        : rawPrimaryInsurance;

    const finalSuppl =
      rawSupplementaryInsurance === '__other__'
        ? customSupplementaryInsurance.trim() || 'سایر بیمه‌های تکمیلی'
        : rawSupplementaryInsurance;

    const isPrimaryActive = !finalPrimary.includes('فاقد بیمه') && finalPrimary !== 'آزاد';
    const isSupplActive = !finalSuppl.includes('فاقد بیمه') && !finalSuppl.includes('بدون بیمه');

    const udrCode = `UDR-1405-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatientObj: Patient = {
      id: `p-${Date.now()}`,
      udrCode,
      fullName: rawFullName,
      nationalId: rawNationalId || '00' + Math.floor(10000000 + Math.random() * 90000000),
      phone: rawPhone,
      age: 35,
      gender: rawGender === 'male' ? 'مرد' : 'زن',
      medicalHistory: rawMedicalHistory ? rawMedicalHistory.split('،').map((s) => s.trim()) : [],
      allergies: rawAllergies ? rawAllergies.split('،').map((s) => s.trim()) : [],
      consentTokens: [],
      primaryInsurance: {
        provider: finalPrimary,
        policyNumber: isPrimaryActive ? 'POL-' + Math.floor(10000000 + Math.random() * 90000000) : 'آزاد',
        active: isPrimaryActive,
      },
      supplementaryInsurance: {
        provider: finalSuppl,
        policyNumber: isSupplActive ? 'SUP-' + Math.floor(10000000 + Math.random() * 90000000) : 'ندارد',
        ceilingRemaining: isSupplActive ? 30000000 : 0,
        waitingPeriodDays: 0,
        active: isSupplActive,
      },
      teethMap: defaultTeethMap,
    };

    setLocalPatients((prev) => [newPatientObj, ...prev]);
    if (onAddPatient) {
      onAddPatient(newPatientObj);
    }

    alert(`پرونده خام با موفقیت صادر گردید.\nنام بیمار: ${rawFullName}\nکد پرونده UDR: ${udrCode}\nبیمه پایه: ${finalPrimary}\nبیمه تکمیلی: ${finalSuppl}`);
    setRawFullName('');
    setRawNationalId('');
    setRawPhone('');
    setCustomPrimaryInsurance('');
    setCustomSupplementaryInsurance('');
    setActiveTab('patient_records');
  };

  const handleSendOnlineFsdSms = () => {
    if (!rawPhone) {
      alert('لطفاً ابتدا شماره همراه بیمار را وارد نمایید.');
      return;
    }
    alert(`لینک فرم ثبت پرونده اولیه به شماره ${rawPhone} پیامک شد.\nبیمار می‌تواند اطلاعات اولیه را آنلاین یا روی گوشی هوشمند خود وارد نماید.`);
  };

  // Handler to register a patient as No-Show / Absent
  const handleMarkAppointmentNoShow = (apt: Appointment) => {
    setLocalAppointments((prev) =>
      prev.map((item) => (item.id === apt.id ? { ...item, status: 'cancelled' } : item))
    );

    const newNoShow: NoShowRecord = {
      id: `ns-${Date.now()}`,
      appointmentId: apt.id,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      dentistName: apt.dentistName,
      timeSlot: apt.timeSlot,
      date: apt.date || '1405-05-13',
      absenceReason: 'عدم حضور در زمان مقرر (ثبت عدم حضور توسط منشی)',
      followUpStatus: 'pending',
      followUpNotes: 'نیازمند تماس تلفنی و هماهنگی نوبت مجدد',
      loggedAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setNoShowRecords((prev) => [newNoShow, ...prev]);
    alert(`عدم حضور بیمار ${apt.patientName} ثبت شد و به بخش پیگیری منتقل گردید.`);
  };

  // Handler to delete a question from Check-In form configuration
  const handleDeleteCheckInQuestion = (qId: string) => {
    setCheckInQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  // Handler to add a new question to Check-In form
  const handleAddCheckInQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) {
      alert('لطفاً متن سوال را وارد کنید.');
      return;
    }

    let typeLabel = 'رشته';
    if (newQType === 'long_text') typeLabel = 'متن';
    if (newQType === 'choice') typeLabel = 'انتخابی';
    if (newQType === 'boolean') typeLabel = 'بله/خیر';

    let parsedOptions: string[] | undefined = undefined;
    if (newQType === 'choice' && newQOptions.trim()) {
      parsedOptions = newQOptions.split('/').map((s) => s.trim()).filter(Boolean);
    } else if (newQType === 'boolean') {
      parsedOptions = ['بله', 'خیر'];
    }

    const newQuestion: CheckInQuestion = {
      id: `q-${Date.now()}`,
      text: newQText.trim(),
      type: newQType,
      typeLabel,
      required: newQRequired,
      options: parsedOptions,
    };

    setCheckInQuestions((prev) => [...prev, newQuestion]);
    setNewQText('');
    setNewQOptions('');
    alert('سوال جدید با موفقیت به فرم پذیرش اضافه شد.');
  };

  const handleApproveDoctorSubmission = (subId: string) => {
    if (onApproveDoctorSubmission) {
      onApproveDoctorSubmission(subId);
    }
    setDoctorSubmissions((prev) =>
      prev.map((sub) => (sub.id === subId ? { ...sub, status: 'approved' } : sub))
    );
    alert('پرونده ارسالی پزشک با موفقیت بررسی، تایید و در پرونده بیماران (بخش منشی و پزشک) ثبت نهایی گردید.');
  };

  const handleCheckEntitlementRealtime = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInquiringInsurance(true);
    setEntitlementResult(null);

    setTimeout(() => {
      setIsInquiringInsurance(false);
      setEntitlementResult({
        nationalId: entitlementNationalId,
        patientName: 'علی رضایی',
        primaryInsurance: `بیمه ${entitlementProvider} (استعلام آنلاین - استحقاق تایید شد)`,
        supplementaryInsurance: 'بیمه ایران - طرح طلایی (فعال)',
        ceilingRemaining: 28000000,
        waitingPeriodDays: 0,
        franchisePercent: 10,
        eligibleServices: [
          'عصب‌کشی کامل (RCT)',
          'ترمیم کامپوزیت ۳ سطحی',
          'روکش زيرکونيا',
          'جرم‌گیری و بروساژ',
          'عکس‌برداری RVG',
        ],
        lastInquiryTime: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      });
    }, 800);
  };

  const handleOpenPatientFile = (p: Patient) => {
    setSelectedPatientFile(p);
    setPatientFileTab('general');
    setPatientTeethState(p.teethMap || defaultTeethMap);
    setEditPhone(p.phone);
    setEditHistory(p.medicalHistory.join('، '));
    setEditAllergies('حساسیت دارویی به پنی‌سیلین');
    setEditEmergency('همسر: ۰۹۱۲۸۸۸۹۹۰۰');
  };

  const handleSavePatientEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientFile) return;

    selectedPatientFile.phone = editPhone;
    selectedPatientFile.medicalHistory = editHistory.split('،').map((s) => s.trim());
    alert('اطلاعات پرونده بیمار با موفقیت به‌روزرسانی شد.');
  };

  const pendingDoctorCount = doctorSubmissions.filter((s) => s.status === 'pending').length;
  const pendingRequestsCount = activeDoctorRequests.filter((r) => r.status === 'pending').length;

  const timeSlotsHourly = [
    '08:00 - 08:30',
    '08:30 - 09:00',
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '11:30 - 12:00',
    '12:00 - 12:30',
    '12:30 - 13:00',
    '16:00 - 16:30',
    '16:30 - 17:00',
    '17:00 - 17:30',
    '17:30 - 18:00',
    '18:00 - 18:30',
    '18:30 - 19:00',
  ];

  return (
    <div className="space-y-4">
      {/* Top Receptionist Header Banner */}
      <div className="bg-[#005581] text-white rounded-2xl p-4 shadow-md border border-[#005581] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black text-xl shadow">
            م
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black">میز کار و پورتال اختصاصی منشی و پذیرش</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] font-extrabold text-[10px]">
                Dentora Reception Pro
              </span>
            </div>
            <p className="text-xs text-cyan-100 mt-0.5">
              مدیریت کامل پرونده‌ها، کانبان نوبت‌ها، استعلام آنلاین بیمه و یادآوری درخواست‌های پزشک
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('call_center');
              setCallCenterSubTab('quick_booking');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ffd200] hover:bg-[#e6bd00] text-[#005581] font-black text-xs shadow transition cursor-pointer shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            <span>ورود به مرکز تماس تلفنی</span>
          </button>
        </div>
      </div>

      {/* Main Container: Right Sidebar Navigation + Workspace Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* RIGHT SIDEBAR NAVIGATION MENU */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm space-y-1.5 sticky top-4">
            <div className="px-3 py-2 text-xs font-black text-[#005581] dark:text-[#72cdf4] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>منوی دسترسی سریع منشی</span>
              <Building2 className="w-4 h-4" />
            </div>

            <button
              onClick={() => setActiveTab('today_kanban')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'today_kanban'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className={`w-4 h-4 ${activeTab === 'today_kanban' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>نوبت‌های امروز (برد کانبان)</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'today_kanban' ? 'bg-[#ffd200] text-[#005581]' : 'bg-slate-200 dark:bg-slate-700 text-slate-800'
              }`}>
                {localAppointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('call_center')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'call_center'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className={`w-4 h-4 ${activeTab === 'call_center' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>تماس تلفنی (ثبت نوبت، لیست انتظار و لاگ)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] font-mono font-black">
                مرکز تماس
              </span>
            </button>

            <button
              onClick={() => setActiveTab('patient_records')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'patient_records'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className={`w-4 h-4 ${activeTab === 'patient_records' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>پرونده بیماران و تاییدات</span>
              </div>
              {pendingDoctorCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono animate-pulse">
                  {pendingDoctorCount} جدید
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('create_raw_file')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'create_raw_file'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className={`w-4 h-4 ${activeTab === 'create_raw_file' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>ایجاد پرونده اولیه بیمار</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-[#005581] font-bold">
                پذیرش
              </span>
            </button>

            <button
              onClick={() => setActiveTab('edit_checkin_form')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'edit_checkin_form'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Edit3 className={`w-4 h-4 ${activeTab === 'edit_checkin_form' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>ویرایش فرم پذیرش بیمار</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-[#005581] font-bold">
                فرم
              </span>
            </button>

            <button
              onClick={() => setActiveTab('doctor_reminders')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'doctor_reminders'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className={`w-4 h-4 ${activeTab === 'doctor_reminders' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>درخواست‌های پزشک (یادآوری)</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] font-mono font-black">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('user_messages')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'user_messages'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className={`w-4 h-4 ${activeTab === 'user_messages' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>پیام‌های کاربران و پیگیری‌ها</span>
              </div>
              {displayPatientQuestions.filter((q) => q.status === 'pending').length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono animate-pulse">
                  {displayPatientQuestions.filter((q) => q.status === 'pending').length} جدید
                </span>
              )}
            </button>

            {insuranceModuleActive && (
              <button
                onClick={() => setActiveTab('insurance_docs')}
                className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'insurance_docs'
                    ? 'bg-[#005581] text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className={`w-4 h-4 ${activeTab === 'insurance_docs' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                  <span>مدارک و پرونده‌های بیمه</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd200] text-[#005581] font-bold">
                  {claims.length} پرونده
                </span>
              </button>
            )}

            {insuranceModuleActive && (
              <button
                onClick={() => setActiveTab('insurance_inquiry')}
                className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'insurance_inquiry'
                    ? 'bg-[#005581] text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'insurance_inquiry' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                  <span>استعلام آنلاین استحقاق بیمه</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-[#005581] font-bold">
                  آنلاین
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('calendar_slots')}
              className={`w-full text-right p-3 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'calendar_slots'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-4 h-4 ${activeTab === 'calendar_slots' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>تقویم نوبت‌ها و رزرو</span>
              </div>
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT AREA */}
        <div className="lg:col-span-3 space-y-4">
          {/* TAB 1: TODAY'S KANBAN BOARD */}
          {activeTab === 'today_kanban' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجوی سریع بیمار با نام، تلفن یا کد ملی..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#005581]"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">تاریخ کاری امروز کلینیک:</span>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                    ۱۳ مرداد ۱۴۰۵
                  </span>
                </div>
              </div>

              {/* KANBAN BOARD 4 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {/* Column 1: Scheduled */}
                <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2 font-black text-xs text-slate-800 dark:text-slate-200">
                      <Clock className="w-4 h-4 text-[#005581]" />
                      <span>۱. در انتظار حضور</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                      {filteredAppointments.filter((a) => a.status === 'scheduled').length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[550px] overflow-y-auto pr-0.5">
                    {filteredAppointments
                      .filter((a) => a.status === 'scheduled')
                      .map((apt) => {
                        const patientRecord = localPatients.find(
                          (p) => p.nationalId === apt.nationalId || p.phone === apt.patientPhone
                        );

                        return (
                          <div
                            key={apt.id}
                            className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 hover:border-[#005581] transition"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {apt.patientName}
                                </h4>
                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{apt.patientPhone}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
                                {apt.timeSlot}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 border-t border-slate-100 dark:border-slate-700/60 pt-2">
                              <div>پزشک: <strong className="text-slate-800 dark:text-slate-200">{apt.dentistName}</strong></div>
                              <div>علت: {apt.reason}</div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              {patientRecord ? (
                                <button
                                  onClick={() => handleOpenPatientFile(patientRecord)}
                                  className="w-full py-1.5 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-[#ffd200]" />
                                  <span>بررسی پرونده بیمار</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setRawFullName(apt.patientName);
                                    setRawPhone(apt.patientPhone);
                                    setRawNationalId(apt.nationalId);
                                    setActiveTab('create_raw_file');
                                  }}
                                  className="w-full py-1.5 rounded-lg bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                >
                                  <UserPlus className="w-3.5 h-3.5 text-[#005581]" />
                                  <span>ایجاد پرونده اولیه بیمار</span>
                                </button>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveAppointmentStatus(apt.id, 'checked_in')}
                                  className="flex-1 py-1.5 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-[#ffd200]" />
                                  <span>حاضر در سالن</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkAppointmentNoShow(apt)}
                                  className="px-2 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-200 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                                  title="ثبت عدم حضور بیمار"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>عدم حضور</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onCancelAppointment(apt.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0"
                                  title="لغو نوبت"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Column 2: Checked In */}
                <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/30 p-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/40 pb-2">
                    <div className="flex items-center gap-2 font-black text-xs text-amber-900 dark:text-amber-300">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>۲. حاضر در سالن انتظار</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold">
                      {filteredAppointments.filter((a) => a.status === 'checked_in').length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[550px] overflow-y-auto pr-0.5">
                    {filteredAppointments
                      .filter((a) => a.status === 'checked_in')
                      .map((apt) => {
                        const patientRecord = localPatients.find(
                          (p) => p.nationalId === apt.nationalId || p.phone === apt.patientPhone
                        );

                        return (
                          <div
                            key={apt.id}
                            className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-300 dark:border-amber-800 shadow-xs space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {apt.patientName}
                                </h4>
                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{apt.nationalId}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                حاضر در کلینیک
                              </span>
                            </div>

                            {!patientRecord && (
                              <div className="px-2 py-1 rounded-lg bg-sky-100 text-[#005581] text-[10px] font-bold flex items-center gap-1 border border-sky-300">
                                <AlertCircle className="w-3 h-3 text-[#005581] shrink-0" />
                                <span>ورود از ثبت تلفنی (نیازمند تکمیل پرونده اولیه)</span>
                              </div>
                            )}

                            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 border-t border-slate-100 dark:border-slate-700/60 pt-2">
                              <div>پزشک: <strong>{apt.dentistName}</strong></div>
                              <div>ساعت نوبت: <strong className="font-mono">{apt.timeSlot}</strong></div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              {!patientRecord && (
                                <button
                                  onClick={() => {
                                    setRawFullName(apt.patientName.replace(/\(.*\)/, '').trim());
                                    setRawPhone(apt.patientPhone);
                                    setRawNationalId(apt.nationalId);
                                    setActiveTab('create_raw_file');
                                  }}
                                  className="w-full py-1.5 rounded-lg bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                >
                                  <UserPlus className="w-3.5 h-3.5 text-[#005581]" />
                                  <span>ایجاد پرونده اولیه بیمار</span>
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedAptForConnect(apt)}
                                className="w-full py-1.5 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#ffd200]" />
                                <span>فراخوان و اتصال به یونیت پزشک</span>
                              </button>
                              <button
                                onClick={() => handleMoveAppointmentStatus(apt.id, 'scheduled')}
                                className="w-full py-1 text-slate-500 hover:text-slate-700 text-[10px] transition cursor-pointer text-center"
                              >
                                بازگشت به لیست در انتظار حضور
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Column 3: In Unit */}
                <div className="bg-[#005581]/5 dark:bg-[#005581]/10 rounded-2xl border border-[#005581]/30 p-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#005581]/20 pb-2">
                    <div className="flex items-center gap-2 font-black text-xs text-[#005581] dark:text-[#72cdf4]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffd200] animate-ping"></span>
                      <span>۳. روی یونیت پزشک</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#005581] text-white text-[10px] font-mono font-bold">
                      {filteredAppointments.filter((a) => a.status === 'in_unit').length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[550px] overflow-y-auto pr-0.5">
                    {filteredAppointments
                      .filter((a) => a.status === 'in_unit')
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-[#005581] shadow-sm space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {apt.patientName}
                              </h4>
                              <p className="text-[10px] text-[#005581] dark:text-[#72cdf4] font-bold mt-0.5">
                                در حال درمان فعال توسط {apt.dentistName}
                              </p>
                            </div>
                          </div>

                          {apt.receptionNoteToDoctor && (
                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                              پیام منشی: {apt.receptionNoteToDoctor}
                            </div>
                          )}

                          <div className="space-y-1.5 pt-1">
                            <span className="block text-center py-1 rounded bg-sky-100 text-[#005581] font-bold text-[10px]">
                              پرونده فعال روی یونیت پزشک معالج
                            </span>
                            <button
                              onClick={() => handleMoveAppointmentStatus(apt.id, 'completed')}
                              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>تکمیل درمان و خروج</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Column 4: Completed */}
                <div className="bg-slate-100/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2 font-black text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-[#005581]" />
                      <span>۴. درمان تکمیل‌شده</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 text-[10px] font-mono font-bold">
                      {filteredAppointments.filter((a) => a.status === 'completed').length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[550px] overflow-y-auto pr-0.5">
                    {filteredAppointments
                      .filter((a) => a.status === 'completed')
                      .map((apt) => {
                        const patientRecord = localPatients.find(
                          (p) => p.nationalId === apt.nationalId || p.phone === apt.patientPhone
                        );

                        return (
                          <div
                            key={apt.id}
                            className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                          >
                            <div className="font-bold text-slate-800 dark:text-slate-200">{apt.patientName}</div>
                            <div className="text-[10px] text-slate-500">پزشک: {apt.dentistName}</div>
                            <div className="text-[10px] text-[#005581] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> درمان کامل شد
                            </div>

                            {patientRecord && (
                              <button
                                onClick={() => handleOpenPatientFile(patientRecord)}
                                className="w-full py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] transition cursor-pointer text-center"
                              >
                                مشاهده پرونده کامل
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* SECTION: REGISTRATION AND FOLLOW-UP FOR NO-SHOW PATIENTS (ثبت و پیگیری بیمارانی که حاضر نشده‌اند) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4 mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#005581] flex items-center justify-center font-bold">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>ثبت و پیگیری بیمارانی که حاضر نشده‌اند (عدم حضور / No-Show)</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#005581] text-white font-mono text-[11px] font-black">
                          {noShowRecords.length} مورد
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        مدیریت عدم حضور بیماران امروز، ثبت علت غیبت، لاگ پیگیری تلفنی و امکان رزرو سریع نوبت مجدد
                      </p>
                    </div>
                  </div>
                </div>

                {noShowRecords.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    هیچ بیمار حاضر نشده‌ای ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {noShowRecords.map((ns) => (
                      <div
                        key={ns.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#005581] font-bold flex items-center justify-center text-xs">
                              {ns.patientName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {ns.patientName}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">
                                  ({ns.patientPhone})
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>پزشک: {ns.dentistName}</span>
                                <span>•</span>
                                <span>نوبت اولیه: <strong className="font-mono text-slate-700 dark:text-slate-300">{ns.timeSlot}</strong></span>
                                <span>•</span>
                                <span>زمان ثبت غیبت: {ns.loggedAt}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={ns.followUpStatus}
                              onChange={(e) => {
                                const st = e.target.value as NoShowRecord['followUpStatus'];
                                setNoShowRecords((prev) =>
                                  prev.map((item) => (item.id === ns.id ? { ...item, followUpStatus: st } : item))
                                );
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-100 cursor-pointer"
                            >
                              <option value="pending">در انتظار پیگیری تلفنی</option>
                              <option value="called_rescheduled">تماس گرفته شد (نوبت مجدد)</option>
                              <option value="no_answer">پاسخ نداد (پیامک فرستاده شد)</option>
                              <option value="canceled_permanently">انصراف کامل بیمار</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                setNewPatientName(ns.patientName);
                                setNewPatientPhone(ns.patientPhone);
                                setNewDentistName(ns.dentistName);
                                setIsPhoneModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                            >
                              <Calendar className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>رزرو مجدد</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500 font-medium shrink-0">علت عدم حضور:</span>
                            <input
                              type="text"
                              value={ns.absenceReason}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNoShowRecords((prev) =>
                                  prev.map((item) => (item.id === ns.id ? { ...item, absenceReason: val } : item))
                                );
                              }}
                              placeholder="مثال: فراموشی، ترافیک، عدم پاسخ..."
                              className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500 font-medium shrink-0">توضیحات پیگیری:</span>
                            <input
                              type="text"
                              value={ns.followUpNotes}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNoShowRecords((prev) =>
                                  prev.map((item) => (item.id === ns.id ? { ...item, followUpNotes: val } : item))
                                );
                              }}
                              placeholder="ثبت پاسخ بیمار یا نتیجه تماس..."
                              className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT RECORDS & COMPREHENSIVE FILE VIEW */}
          {activeTab === 'patient_records' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#005581]" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    جستجو و مدیریت جامع پرونده‌های بیماران
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                  <button
                    onClick={() => setPatientRecordSubTab('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      patientRecordSubTab === 'all'
                        ? 'bg-[#005581] text-white shadow'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    همه پرونده‌ها ({patients.length})
                  </button>
                  <button
                    onClick={() => setPatientRecordSubTab('pending_doctor')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      patientRecordSubTab === 'pending_doctor'
                        ? 'bg-[#005581] text-white shadow'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>ارسال‌های جدید پزشک</span>
                    {pendingDoctorCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                        {pendingDoctorCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-Tab 1: All Patients Grid */}
              {patientRecordSubTab === 'all' && (
                <div className="space-y-4">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="جستجوی پرونده با نام بیمار، کد ملی، شماره همراه یا کد پرونده UDR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 hover:border-[#005581] transition shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#005581] text-[#ffd200] font-black flex items-center justify-center text-base shadow-xs">
                              {p.fullName.slice(0, 1)}
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                                {p.fullName}
                              </h4>
                              <p className="text-xs font-mono text-[#005581] dark:text-[#72cdf4] font-bold mt-0.5">
                                کد پرونده UDR: {p.udrCode}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            {p.primaryInsurance.provider}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <span>کد ملی: <strong className="font-mono text-slate-800 dark:text-slate-200">{p.nationalId}</strong></span>
                            <span>شماره تماس: <strong className="font-mono text-slate-800 dark:text-slate-200">{p.phone}</strong></span>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
                            {/* Medical History & Allergies */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                                  <span>بیماری‌های زمینه‌ای:</span>
                                </span>
                                {p.allergies && (Array.isArray(p.allergies) ? p.allergies.length > 0 : Boolean(p.allergies)) ? (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-rose-500" />
                                    <span>حساسیت: {Array.isArray(p.allergies) ? p.allergies.join('، ') : p.allergies}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">فاقد حساسیت دارویی</span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {(() => {
                                  const cleanHistory = (p.medicalHistory || []).filter(
                                    (item) => !item.startsWith('ثبت تصویر') && !item.includes('[هوش مصنوعی]') && !item.includes('RVG') && !item.includes('OPG') && !item.startsWith('درمان توسط')
                                  );

                                  if (cleanHistory.length === 0) {
                                    return (
                                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        سلامت عمومی کامل / فاقد بیماری زمینه‌ای
                                      </span>
                                    );
                                  }

                                  return cleanHistory.map((item, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                                        item.includes('فشار') || item.includes('قلب') || item.includes('سکته')
                                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                          : item.includes('دیابت') || item.includes('قند')
                                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                          : item.includes('بارداری')
                                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                          : item.includes('آسم') || item.includes('تنفسی')
                                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                      {item}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </div>

                            {/* Recent Clinical Treatment Logs */}
                            {(() => {
                              const recentLogs: { id: string; date: string; procedure: string; dentist: string; toothFdi?: number }[] = [];
                              
                              // Extract from teethMap
                              Object.values(p.teethMap || {}).forEach((t: ToothDetail) => {
                                (t.treatmentHistory || []).forEach((th) => {
                                  recentLogs.push({
                                    id: th.id,
                                    date: th.date,
                                    procedure: th.procedureName,
                                    dentist: th.dentistName,
                                    toothFdi: t.fdiNumber,
                                  });
                                });
                              });

                              // Also check doctor submissions if matching
                              doctorSubmissions
                                .filter((s) => s.patientId === p.id || s.nationalId === p.nationalId)
                                .forEach((s) => {
                                  const proc = s.treatmentSummary.split('\n')[0].replace(/^[0-9.-]+\s*/, '').trim();
                                  if (!recentLogs.some((l) => l.procedure.includes(proc))) {
                                    recentLogs.unshift({
                                      id: s.id,
                                      date: s.submittedAt,
                                      procedure: proc,
                                      dentist: s.dentistName,
                                      toothFdi: s.toothFdi,
                                    });
                                  }
                                });

                              if (recentLogs.length === 0) return null;

                              return (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                                  <span className="text-[11px] font-bold text-[#005581] dark:text-[#72cdf4] flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5" />
                                    <span>سوابق درمان دندان‌پزشکی در کلینیک:</span>
                                  </span>
                                  <div className="space-y-1">
                                    {recentLogs.slice(0, 2).map((log, lIdx) => (
                                      <div
                                        key={lIdx}
                                        className="p-1.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/40 text-[11px] flex items-center justify-between text-slate-800 dark:text-slate-200"
                                      >
                                        <div className="flex items-center gap-1.5 truncate">
                                          {log.toothFdi && (
                                            <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[#005581] dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
                                              دندان {log.toothFdi}
                                            </span>
                                          )}
                                          <span className="font-bold truncate">{log.procedure}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono shrink-0 mr-1">{log.date}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            onClick={() => handleOpenPatientFile(p)}
                            className="w-full py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow"
                          >
                            <Eye className="w-4 h-4 text-[#ffd200]" />
                            <span>مشاهده پرونده کامل (اودنتوگرام، تصاویر، سوابق مراجعات)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Pending Doctor Submissions */}
              {patientRecordSubTab === 'pending_doctor' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#005581]/5 border border-[#005581]/20 text-xs text-[#005581] dark:text-[#72cdf4] font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#005581] shrink-0" />
                    <span>
                      این پرونده‌ها مستقیماً از سیستم درمان پزشک پس از ثبت معاینه یا دیکته صوتی ارسال شده‌اند و جهت ثبت مالی و بیمه‌ای نهایی در انتظار تایید منشی می‌باشند.
                    </span>
                  </div>

                  {doctorSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub.patientName}</strong>
                          <span className="text-xs font-mono text-slate-400">({sub.nationalId})</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                            پزشک معالج: {sub.dentistName}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{sub.submittedAt}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                          <span className="block font-bold text-slate-800 dark:text-slate-200">طرح درمان ارسال‌شده:</span>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{sub.treatmentSummary}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                          <span className="block font-bold text-slate-800 dark:text-slate-200">نسخه دارویی:</span>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{sub.prescriptionSummary}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-wrap items-center gap-2">
                          {insuranceModuleActive && (
                            <button
                              type="button"
                              onClick={() => {
                                // Find or create matching claim for this submission
                                let existingClaim = claims.find(
                                  (c) => c.patientName === sub.patientName || c.nationalId === sub.nationalId
                                );
                                if (!existingClaim) {
                                  const generatedClaim: Claim = {
                                    id: `CLM-SUB-${sub.id}`,
                                    claimNumber: `CLM-1405-${sub.id.slice(-4) || '9901'}`,
                                    patientId: `pat-${sub.id}`,
                                    patientName: sub.patientName,
                                    nationalId: sub.nationalId,
                                    patientPhone: sub.patientPhone,
                                    insuranceCompany: 'بیمه سامان (طرح طلایی)',
                                    insuranceProvider: 'بیمه سامان (طرح طلایی)',
                                    treatmentName: sub.treatmentSummary,
                                    toothFdi: sub.toothFdi || 16,
                                    dateOfService: '۱۴۰۴/۱۱/۲۰',
                                    totalAmount: 4500000,
                                    claimedAmount: 4500000,
                                    coveredAmount: 3150000,
                                    baseApprovedAmount: 1350000,
                                    supplApprovedAmount: 1800000,
                                    deductionAmount: 0,
                                    status: 'draft',
                                    riskScore: 12,
                                    submittedDate: sub.submittedAt,
                                    autoApprovalConfidence: 94,
                                    greenLaneEligible: true,
                                    evidences: [
                                      { id: 'ev-1', title: 'گرافی RVG دیجیتال قبل و بعد', type: 'xray', uploaded: true, required: true },
                                      { id: 'ev-2', title: 'احراز هویت و استعلام آنلاین استحقاق', type: 'pre_auth_certificate', uploaded: true, required: true },
                                    ],
                                    narrativeText:
                                      sub.clinicalNotes ||
                                      `بیمار ${sub.patientName} با کد ملی ${sub.nationalId} با شکایت از درد و ناراحتی دندان ${sub.toothFdi || 16} مراجعه نمود. بر اساس معاینات بالینی و رادیوگرافی RVG، درمان ${sub.treatmentSummary} انجام شد. مستندات بالینی، تعرفه مصوب و ادله توجیهی جهت درج در سامانه بیمه مورد تایید است.`,
                                  };
                                  if (setClaims) {
                                    setClaims((prev) => [generatedClaim, ...prev]);
                                  }
                                  existingClaim = generatedClaim;
                                }
                                setTargetClaimIdForReview(existingClaim.id);
                                setActiveTab('insurance_docs');
                              }}
                              className="px-4 py-2 rounded-xl bg-[#ffd200] hover:bg-amber-400 text-[#005581] font-black text-xs shadow transition cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <FileText className="w-4 h-4 text-[#005581]" />
                              <span>بررسی شرح بیمه</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const matchingPatient = localPatients.find(
                                (p) =>
                                  p.nationalId === sub.nationalId ||
                                  p.phone === sub.patientPhone ||
                                  p.fullName === sub.patientName
                              ) || {
                                id: `p-${sub.id}`,
                                udrCode: `UDR-1405-${sub.id}`,
                                fullName: sub.patientName,
                                nationalId: sub.nationalId,
                                phone: sub.patientPhone,
                                age: 38,
                                gender: 'مرد',
                                medicalHistory: [sub.treatmentSummary],
                                allergies: ['بدون حساسیت دارویی ثبت‌شده'],
                                consentTokens: [],
                                primaryInsurance: {
                                  provider: 'تامین اجتماعی',
                                  policyNumber: 'POL-998811',
                                  active: true,
                                },
                                supplementaryInsurance: {
                                  provider: 'بیمه سامان',
                                  policyNumber: 'SUP-445511',
                                  ceilingRemaining: 25000000,
                                  waitingPeriodDays: 0,
                                  active: true,
                                },
                                teethMap: defaultTeethMap,
                              };
                              handleOpenPatientFile(matchingPatient);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-[#ffd200]" />
                            <span>مشاهده پرونده کامل بیمار</span>
                          </button>

                          {sub.status === 'approved' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                              <Check className="w-4 h-4 text-emerald-700" /> ثبت نهایی در پرونده بیمار گردید
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveDoctorSubmission(sub.id)}
                              className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckSquare className="w-4 h-4 text-[#ffd200]" />
                              <span>تایید و ثبت نهایی در پرونده بیمار</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCTOR REQUESTS & REMINDERS */}
          {activeTab === 'doctor_reminders' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#ffd200]" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    یادآوری نوبت‌ها — درخواست‌های ارسالی پزشک ({pendingRequestsCount} در انتظار)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-sky-100 text-[#005581] font-bold">
                    نوبت‌های بعدی ثبت‌شده در اتاق پزشک
                  </span>
                </div>
              </div>

              {/* Exact Responsive Table matching user prompt structure */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#005581] text-white font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">بیمار</th>
                      <th className="p-3">پزشک معالج</th>
                      <th className="p-3">دلیل و شرح نوبت بعدی</th>
                      <th className="p-3">تاریخ پیشنهادی پزشک</th>
                      <th className="p-3">وضعیت</th>
                      <th className="p-3 text-center">عملیات پذیرش</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {activeDoctorRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          هیچ درخواست یادآوری نوبتی در حال حاضر وجود ندارد.
                        </td>
                      </tr>
                    ) : (
                      activeDoctorRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{req.patientName}</div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{req.patientPhone}</div>
                          </td>
                          <td className="p-3 text-slate-800 dark:text-slate-200 font-bold">{req.doctorName}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{req.reason}</td>
                          <td className="p-3 font-mono dir-ltr text-right font-bold text-[#005581] dark:text-sky-300">
                            {req.suggestedDate}
                          </td>
                          <td className="p-3">
                            {req.status === 'registered' ? (
                              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> نوبت ثبت شد
                              </span>
                            ) : req.status === 'dismissed' ? (
                              <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-600 font-bold text-[11px]">
                                رد شد
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold text-[11px] animate-pulse">
                                در انتظار تعیین وقت
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {req.status === 'pending' && (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setNewPatientName(req.patientName);
                                    setNewPatientPhone(req.patientPhone);
                                    setNewReason(req.reason);
                                    setNewDentistName(req.doctorName);
                                    setIsPhoneModalOpen(true);
                                    updateDoctorRequests((prev) =>
                                      prev.map((r) => (r.id === req.id ? { ...r, status: 'registered' } : r))
                                    );
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] shadow-xs cursor-pointer transition flex items-center gap-1"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-[#ffd200]" />
                                  <span>ثبت نوبت</span>
                                </button>
                                <button
                                  onClick={() =>
                                    updateDoctorRequests((prev) =>
                                      prev.map((r) => (r.id === req.id ? { ...r, status: 'dismissed' } : r))
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer transition"
                                >
                                  رد کردن
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REAL-TIME INSURANCE INQUIRY (استعلام آنلاین بیمه در پذیرش) */}
          {activeTab === 'insurance_inquiry' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-5">
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#005581]" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    استعلام برخط استحقاق درمان و سقف تعهدات بیمه
                  </h3>
                </div>
              </div>

              {/* REAL-TIME ENTITLEMENT INQUIRY */}
              <div className="space-y-4">
                <form
                  onSubmit={handleCheckEntitlementRealtime}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        کد ملی بیمار جهت استعلام آنلاین پوشش و سقف تعهدات:
                      </label>
                      <input
                        type="text"
                        value={entitlementNationalId}
                        onChange={(e) => setEntitlementNationalId(e.target.value)}
                        placeholder="مثلاً: 0012345678"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        سازمان بیمه‌گر:
                      </label>
                      <select
                        value={entitlementProvider}
                        onChange={(e) => setEntitlementProvider(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      >
                        <option value="تامین اجتماعی">بیمه تامین اجتماعی</option>
                        <option value="بیمه سلامت ایرانیان">بیمه سلامت ایرانیان</option>
                        <option value="بیمه نیروهای مسلح">بیمه نیروهای مسلح</option>
                        <option value="بیمه تکمیلی ایران / سامان / دانا">بیمه تکمیلی (ایران / سامان / دانا)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isInquiringInsurance}
                      className="px-6 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-black text-xs shadow transition cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 text-[#ffd200] ${isInquiringInsurance ? 'animate-spin' : ''}`} />
                      <span>{isInquiringInsurance ? 'در حال استعلام از مرکز داده بیمه...' : 'اجرای استعلام آنلاین بیمه'}</span>
                    </button>
                  </div>
                </form>

                {/* REAL-TIME INQUIRY RESULT CARD */}
                {isInquiringInsurance && (
                  <div className="p-6 rounded-2xl bg-[#005581]/5 border border-[#005581]/20 flex flex-col items-center justify-center space-y-2 text-center animate-pulse">
                    <RefreshCw className="w-8 h-8 text-[#005581] animate-spin" />
                    <p className="text-xs font-bold text-[#005581]">
                      در حال برقرار ارتباط امن با سرورهای بیمه و سامانه سپاس...
                    </p>
                  </div>
                )}

                {entitlementResult && !isInquiringInsurance && (
                  <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/20 border-2 border-[#005581]/40 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-sky-200 dark:border-sky-900/50 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#005581]" />
                        <h4 className="font-black text-sm text-[#005581] dark:text-sky-200">
                          استعلام آنلاین استحقاق درمان تایید شد
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#005581] bg-sky-200 dark:bg-sky-900 px-2.5 py-1 rounded-lg">
                        زمان ثبت: {entitlementResult.lastInquiryTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 space-y-1">
                        <span className="text-slate-400 block text-[11px]">نام و مشخصات بیمه‌شده:</span>
                        <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                          {entitlementResult.patientName} ({entitlementResult.nationalId})
                        </strong>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 space-y-1">
                        <span className="text-slate-400 block text-[11px]">بیمه پایه و تکمیلی:</span>
                        <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                          {entitlementResult.primaryInsurance}
                        </strong>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 space-y-1">
                        <span className="text-slate-400 block text-[11px]">سقف مانده تعهدات بیمه:</span>
                        <strong className="text-[#005581] dark:text-sky-300 font-black text-sm block">
                          {(entitlementResult.ceilingRemaining).toLocaleString('fa-IR')} تومان
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 space-y-2">
                      <span className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                        کدهای خدمات دندانپزشکی دارای پوشش بیمه (فرانشیز {entitlementResult.franchisePercent}٪):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {entitlementResult.eligibleServices.map((srv: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-sky-100 text-[#005581] font-bold text-[11px] border border-sky-300"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-[#005581]" /> {srv}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => alert('تخفیف بیمه طبق استعلام استحقاق روی فاکتور بیمار اعمال گردید.')}
                        className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-[#ffd200]" />
                        <span>اعمال خودکار سهم بیمه روی فاکتور پذیرش بیمار</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* TAB: INSURANCE DOCUMENTS & CLAIMS (مدارک و پرونده‌های بیمه) */}
          {activeTab === 'insurance_docs' && (
            <InsuranceDocsWorkspace
              claims={claims}
              setClaims={setClaims}
              patients={patients}
              hasAccountantRole={hasAccountantRole}
              onToggleHasAccountantRole={onToggleHasAccountantRole}
              insuranceModuleActive={insuranceModuleActive}
              onToggleInsuranceModule={onToggleInsuranceModule}
              isInsuranceContracted={isInsuranceContracted}
              onToggleInsuranceContracted={onToggleInsuranceContracted}
              onSubmitAppeal={onSubmitAppeal}
              onSendClaimToInsurance={onSendClaimToInsurance}
              greenLane={greenLane}
              targetClaimId={targetClaimIdForReview}
            />
          )}
          {activeTab === 'user_messages' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <span>پیام‌های کاربران و پیگیری‌های بیماران</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] text-[10px] font-extrabold">
                        Dentora User Inquiries
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {insuranceModuleActive && !isInsuranceContracted
                        ? 'پاسخگویی به سوالات عمومی بیماران و پیگیری مستقیم اعتراضات بیمه‌ای بیماران آزاد و دارای کسورات'
                        : 'پاسخگویی سریع به سوالات، درخواست‌ها و پیام‌های ارسالی بیماران کلینیک'}
                    </p>
                  </div>
                </div>

                {/* Sub-Tab Toggle */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setUserMessagesSubTab('general_questions')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      userMessagesSubTab === 'general_questions'
                        ? 'bg-[#005581] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-[#ffd200]" />
                    <span>سوالات و پیام‌های عمومی بیماران</span>
                    {displayPatientQuestions.filter((q) => q.status === 'pending').length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                        {displayPatientQuestions.filter((q) => q.status === 'pending').length}
                      </span>
                    )}
                  </button>

                  {/* ONLY SHOW INSURANCE APPEALS WHEN INSURANCE MODULE IS ACTIVE AND NOT CONTRACTED */}
                  {insuranceModuleActive && !isInsuranceContracted && (
                    <button
                      onClick={() => setUserMessagesSubTab('insurance_appeals')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        userMessagesSubTab === 'insurance_appeals'
                          ? 'bg-[#005581] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-[#ffd200]" />
                      <span>پیگیری اعتراضات بیمه‌ای بیماران</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-sky-100 text-[#005581] text-[10px] font-mono font-bold">
                        {displayPatientAppeals.length} مورد
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* SUB-TAB 1: GENERAL PATIENT QUESTIONS & COMPLAINTS WITH ATTACHED DOCS */}
              {(userMessagesSubTab === 'general_questions' || isInsuranceContracted || !insuranceModuleActive) && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 text-[#005581] dark:text-sky-200 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#005581] shrink-0" />
                    <span>
                      در این بخش می‌توانید پیام‌ها، اعتراضات بیمه‌ای و مدارک تکمیلی ارسال‌شده توسط بیماران را بررسی کرده و پاسخ دستی منشی را ارسال نمایید.
                    </span>
                  </div>

                  <div className="space-y-3">
                    {displayPatientQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{q.patientName}</strong>
                            <span className="text-xs font-mono text-slate-500">({q.patientPhone})</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-[#005581] dark:text-sky-300 font-bold">
                              {q.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">{q.createdAt}</span>
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              q.status === 'pending' ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {q.status === 'pending' ? 'در انتظار پاسخ منشی' : 'پاسخ داده شد'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="font-black text-slate-800 dark:text-slate-200 text-xs block">موضوع: {q.subject}</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{q.questionText}</p>

                          {/* Attached Supplementary Documents */}
                          {q.attachedDocs && q.attachedDocs.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                              <span className="text-[11px] font-bold text-[#005581] flex items-center gap-1">
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span>مدارک تکمیلی و عکس‌های پیوست‌شده توسط بیمار:</span>
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {q.attachedDocs.map((doc, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() =>
                                      alert('پیش‌نمایش مدرک پیوست‌شده تایید شد.')
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-[#005581] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#ffd200]" />
                                    <span>{doc.title}</span>
                                    <Eye className="w-3 h-3 text-[#005581]" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {q.status === 'answered' && q.replyText && (
                          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 text-sky-900 dark:text-sky-200 space-y-1">
                            <div className="flex items-center justify-between font-bold text-[11px]">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                                <span>پاسخ ثبت‌شده {q.repliedBy ? `توسط ${q.repliedBy}` : 'منشی کلینیک'}:</span>
                              </span>
                              <span className="font-mono text-[10px] text-sky-700">{q.repliedAt}</span>
                            </div>
                            <p className="leading-relaxed font-medium text-[11px]">{q.replyText}</p>
                          </div>
                        )}

                        {/* Response Input Box */}
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={replyTextMap[q.id] || ''}
                            onChange={(e) => setReplyTextMap({ ...replyTextMap, [q.id]: e.target.value })}
                            rows={2}
                            placeholder="متن پاسخ خود به بیمار را بنویسید..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const text = replyTextMap[q.id];
                                if (!text || !text.trim()) {
                                  alert('لطفا متن پاسخ را وارد نمایید.');
                                  return;
                                }
                                if (onReplyQuestion) {
                                  onReplyQuestion(q.id, text, 'receptionist', 'منشی کلینیک');
                                } else {
                                  setLocalPatientQuestions((prev) =>
                                    prev.map((item) =>
                                      item.id === q.id
                                        ? { ...item, status: 'answered', replyText: text, repliedAt: 'هم‌اکنون' }
                                        : item
                                    )
                                  );
                                }
                                setReplyTextMap({ ...replyTextMap, [q.id]: '' });
                                alert('پاسخ منشی با موفقیت ثبت شد و در پنل بیمار نمایش داده خواهد شد.');
                              }}
                              className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                            >
                              <SendHorizontal className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>ثبت و ارسال پاسخ دستی منشی</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: PATIENT INSURANCE APPEAL FOLLOW-UPS */}
              {insuranceModuleActive && !isInsuranceContracted && userMessagesSubTab === 'insurance_appeals' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-900 dark:text-amber-200 font-medium flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      در این بخش اعتراضات ثبت‌شده بیماران یا کسورات بیمه‌ای که توسط بیمار پیگیری گردیده است به صورت جداگانه قابل مشاهده و پاسخگویی مستقیم می‌باشد.
                    </span>
                  </div>

                  <div className="space-y-3">
                    {displayPatientAppeals.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">{app.patientName}</strong>
                            <span className="text-xs font-mono text-slate-500">({app.nationalId})</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-[#005581] font-bold">
                              {app.insuranceProvider}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#005581]">{app.claimNumber}</span>
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              app.status === 'under_review' ? 'bg-amber-100 text-amber-900' :
                              app.status === 'approved_pay' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {app.status === 'under_review' ? 'در حال بررسی در هیئت بیمه' :
                               app.status === 'approved_pay' ? 'تایید اعتراض و واریز مابه‌التفاوت' : 'رد اعتراض'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                            <span className="text-slate-500 font-bold block">مبلغ ادعا و کسورات:</span>
                            <div className="font-mono text-xs">
                              <span>ادعا: <strong>{app.claimedAmount.toLocaleString('fa-IR')}</strong></span>
                              <span className="block text-rose-600 font-bold">کسورات معترض‌عنه: {app.deductionAmount.toLocaleString('fa-IR')} تومان</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1 md:col-span-2">
                            <span className="text-slate-500 font-bold block">شرح اعتراض بیمار و مدارک:</span>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{app.appealReason}</p>
                            {app.imageName && (
                              <div className="mt-2 text-[11px] font-bold text-[#005581] flex items-center gap-1 bg-sky-50 dark:bg-sky-950/30 p-2 rounded-lg border border-sky-200">
                                <FileText className="w-3.5 h-3.5 text-[#ffd200]" />
                                <span>فایل پیوست: {app.imageName} {app.imageDesc ? `(${app.imageDesc})` : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {app.responseFromInsurer && (
                          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-1">
                            <div className="flex items-center justify-between font-bold text-[11px] text-[#005581] dark:text-sky-300">
                              <span>آخرین اعلام نظر کلینیک / بیمه:</span>
                              <span className="font-mono text-[10px] text-slate-500">{app.lastUpdated}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{app.responseFromInsurer}</p>
                          </div>
                        )}

                        {/* Manual Reply Box for Receptionist */}
                        <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                          <textarea
                            value={replyTextMap[app.id] || ''}
                            onChange={(e) => setReplyTextMap({ ...replyTextMap, [app.id]: e.target.value })}
                            rows={2}
                            placeholder="پاسخ منشی و اعلام وضعیت جدید به بیمار..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                          />
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const text = replyTextMap[app.id] || 'اعتراض شما توسط کلینیک تایید شد و مابه‌التفاوت واریز خواهد شد.';
                                  if (onReplyDispute) {
                                    onReplyDispute(app.id, text, 'approved_pay');
                                  }
                                  alert(`وضعیت اعتراض به «تایید و واریز» تغییر یافت.`);
                                  setReplyTextMap({ ...replyTextMap, [app.id]: '' });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                              >
                                تایید اعتراض و واریز
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const text = replyTextMap[app.id] || 'جهت پیگیری بیشتر نیاز به ارسال گرافی یا مدارک تکمیلی می‌باشد.';
                                  if (onReplyDispute) {
                                    onReplyDispute(app.id, text, 'need_docs');
                                  }
                                  alert(`وضعیت اعتراض به «نیاز به مدارک» تغییر یافت.`);
                                  setReplyTextMap({ ...replyTextMap, [app.id]: '' });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition cursor-pointer"
                              >
                                درخواست مدرک بیشتر
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const text = replyTextMap[app.id];
                                if (!text) {
                                  alert('لطفا متن پاسخ را وارد نمایید.');
                                  return;
                                }
                                if (onReplyDispute) {
                                  onReplyDispute(app.id, text, 'under_review');
                                }
                                alert(`پاسخ دستی منشی برای اعتراض ${app.patientName} ثبت شد.`);
                                setReplyTextMap({ ...replyTextMap, [app.id]: '' });
                              }}
                              className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                            >
                              <SendHorizontal className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>ارسال پاسخ منشی</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CREATE PATIENT FILE */}
          {activeTab === 'create_raw_file' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#005581] flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5 text-[#005581]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                      ایجاد پرونده اولیه بیمار (پذیرش اولیه‌)
                    </h3>
                    <p className="text-xs text-slate-500">
                      ثبت مشخصات پایه بیمار جهت ایجاد کد UDR اختصاصی و صدور پرونده اولیه کلینیک
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateRawPatientFile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نام و نام خانوادگی بیمار: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: رضا محمدی"
                      value={rawFullName}
                      onChange={(e) => setRawFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      شماره همراه بیمار: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="۰۹۱۲..."
                      value={rawPhone}
                      onChange={(e) => setRawPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      کد ملی ۱۰ رقمی:
                    </label>
                    <input
                      type="text"
                      placeholder="0012345678"
                      value={rawNationalId}
                      onChange={(e) => setRawNationalId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تاریخ تولد:
                    </label>
                    <input
                      type="text"
                      value={rawBirthDate}
                      onChange={(e) => setRawBirthDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">جنسیت:</label>
                    <select
                      value={rawGender}
                      onChange={(e) => setRawGender(e.target.value as 'male' | 'female')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="male">مرد</option>
                      <option value="female">زن</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">شماره تماس اضطراری:</label>
                    <input
                      type="text"
                      value={rawEmergencyContact}
                      onChange={(e) => setRawEmergencyContact(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      بیمه پایه اصلی:
                    </label>
                    <select
                      value={rawPrimaryInsurance}
                      onChange={(e) => setRawPrimaryInsurance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100"
                    >
                      {SUGGESTED_BASE_INSURANCES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {rawPrimaryInsurance === '__other__' && (
                      <input
                        type="text"
                        placeholder="نام بیمه پایه را وارد کنید..."
                        value={customPrimaryInsurance}
                        onChange={(e) => setCustomPrimaryInsurance(e.target.value)}
                        className="mt-2 w-full px-3 py-2 rounded-xl border border-[#72cdf4] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      بیمه تکمیلی:
                    </label>
                    <select
                      value={rawSupplementaryInsurance}
                      onChange={(e) => setRawSupplementaryInsurance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100"
                    >
                      {SUGGESTED_SUPPLEMENTARY_INSURANCES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {rawSupplementaryInsurance === '__other__' && (
                      <input
                        type="text"
                        placeholder="نام بیمه تکمیلی را وارد کنید..."
                        value={customSupplementaryInsurance}
                        onChange={(e) => setCustomSupplementaryInsurance(e.target.value)}
                        className="mt-2 w-full px-3 py-2 rounded-xl border border-[#72cdf4] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">سوابق بیماری‌های زمینه:</label>
                    <input
                      type="text"
                      value={rawMedicalHistory}
                      onChange={(e) => setRawMedicalHistory(e.target.value)}
                      placeholder="دیابت، فشار خون، بیماری قلبی..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">حساسیت‌های دارویی ثبت‌شده:</label>
                    <input
                      type="text"
                      value={rawAllergies}
                      onChange={(e) => setRawAllergies(e.target.value)}
                      placeholder="پنی‌سیلین، لیدوکایین..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('today_kanban')}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4 text-[#ffd200]" />
                    <span>ثبت نهایی و صدور کد پرونده UDR</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: SECRETARY INTERACTIVE CALENDAR WITH SLOTS */}
          {activeTab === 'calendar_slots' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
              {/* Calendar Date Navigator */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalendarDateIndex((prev) => Math.max(0, prev - 1))}
                    disabled={calendarDateIndex === 0}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="px-4 py-1.5 rounded-xl bg-[#005581] text-white font-black text-xs shadow flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#ffd200]" />
                    <span>{datesList[calendarDateIndex]}</span>
                  </div>

                  <button
                    onClick={() => setCalendarDateIndex((prev) => Math.min(datesList.length - 1, prev + 1))}
                    disabled={calendarDateIndex === datesList.length - 1}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">فیلتر پزشک:</span>
                  <select
                    value={selectedCalendarDoctor}
                    onChange={(e) => setSelectedCalendarDoctor(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="همه پزشکان">همه پزشکان کلینیک</option>
                    {clinicDentists.map((cd) => (
                      <option key={cd.id} value={cd.name}>
                        {cd.name} {cd.specialty ? `(${cd.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots Hourly Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  جدول بازه‌های زمانی نوبت‌دهی (ساعت به ساعت):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[550px] overflow-y-auto pr-1">
                  {timeSlotsHourly.map((slot) => {
                    const matchingApt = findAppointmentForSlot(slot, localAppointments, selectedCalendarDoctor);
                    const isLunch = slot.startsWith('13:');

                    return (
                      <div
                        key={slot}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 min-w-0 ${
                          isLunch
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            : matchingApt
                            ? 'bg-[#005581]/10 border-[#005581]'
                            : 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200 hover:border-[#005581]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs shrink-0 ${
                              matchingApt
                                ? 'bg-[#005581] text-white shadow-xs'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {matchingApt ? matchingApt.timeSlot.split('(')[0].trim() : slot}
                          </span>

                          <div className="min-w-0 flex-1">
                            {matchingApt ? (
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                    {matchingApt.patientName}
                                  </span>
                                  {matchingApt.timeSlot.includes('(') && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#005581]/15 text-[#005581] dark:text-cyan-300 font-bold text-[10px] shrink-0">
                                      {matchingApt.timeSlot.split('(')[1].replace(')', '')}
                                    </span>
                                  )}
                                </div>
                                <span
                                  className="text-[11px] text-slate-600 dark:text-slate-400 block truncate"
                                  title={`پزشک: ${matchingApt.dentistName} | علت: ${matchingApt.reason}`}
                                >
                                  پزشک: {matchingApt.dentistName} | علت: {matchingApt.reason}
                                </span>
                              </div>
                            ) : isLunch ? (
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">زمان استراحت / ناهار</span>
                            ) : (
                              <span className="text-xs font-bold text-[#005581] dark:text-sky-300">
                                بازه آزاد (آماده وقت‌دهی)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center justify-end min-w-[75px]">
                          {matchingApt ? (
                            <span className="px-2.5 py-1 rounded-lg bg-[#005581] text-white font-black text-[11px] shrink-0 whitespace-nowrap inline-flex items-center justify-center shadow-xs">
                              رزرو شده
                            </span>
                          ) : isLunch ? (
                            <Lock className="w-4 h-4 text-slate-500" />
                          ) : (
                            <button
                              onClick={() => {
                                setNewTimeSlot(slot.split(' - ')[0]);
                                setIsPhoneModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>رزرو این بازه</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CONSOLIDATED TELEPHONE CALLS & WAITLIST SECTION */}
          {activeTab === 'call_center' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
              {/* Top Banner inside Call Center */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#005581] text-white flex items-center justify-center font-bold shadow-md">
                    <PhoneCall className="w-6 h-6 text-[#ffd200]" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                      مرکز تماس تلفنی، لیست انتظار و نوبت‌دهی هوشمند
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ثبت سریع نوبت بر اساس تقویم زمان‌های خالی، سرچ و نوبت‌دهی در لیست انتظار و مدیریت لاگ تماس‌ها
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddWaitlistModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#ffd200] hover:bg-[#e6bd00] text-[#005581] font-black text-xs shadow transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Users className="w-4 h-4" />
                    <span>+ افزودن به لیست انتظار</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCallCenterSubTab('quick_booking')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Phone className="w-4 h-4 text-[#005581]" />
                    <span>ثبت نوبت تلفنی</span>
                  </button>
                </div>
              </div>

              {/* Unified Sub-Tab Switcher */}
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCallCenterSubTab('quick_booking')}
                  className={`w-full sm:flex-1 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    callCenterSubTab === 'quick_booking'
                      ? 'bg-[#005581] text-white shadow'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#ffd200]" />
                  <span>ثبت نوبت سریع و زمان‌های خالی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCallCenterSubTab('waitlist')}
                  className={`w-full sm:flex-1 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    callCenterSubTab === 'waitlist'
                      ? 'bg-[#005581] text-white shadow'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#ffd200]" />
                  <span>لیست انتظار بیماران (سرچ و نوبت‌دهی)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-mono text-[10px] font-bold">
                    {localWaitlist.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCallCenterSubTab('logs')}
                  className={`w-full sm:flex-1 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    callCenterSubTab === 'logs'
                      ? 'bg-[#005581] text-white shadow'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 text-[#ffd200]" />
                  <span>تاریخچه و لاگ تماس‌ها</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono text-[10px] font-bold">
                    {callLogs.length}
                  </span>
                </button>
              </div>

              {/* SUB-SECTION 1: QUICK SMART BOOKING */}
              {callCenterSubTab === 'quick_booking' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Date & Doctor Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        انتخاب تاریخ از تقویم:
                      </label>
                      <select
                        value={quickBookingDateIndex}
                        onChange={(e) => setQuickBookingDateIndex(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      >
                        {datesList.map((d, i) => (
                          <option key={i} value={i}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        انتخاب پزشک معالج:
                      </label>
                      <select
                        value={quickBookingDoctor}
                        onChange={(e) => setQuickBookingDoctor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      >
                        {clinicDentists.map((cd) => (
                          <option key={cd.id} value={cd.name}>
                            {cd.name} {cd.specialty ? `(${cd.specialty})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nearest Open Slots Cards (Smart Suggestion) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#005581]" />
                      <span>نزدیک‌ترین زمان‌های خالی پیشنهاد هوشمند سیستم (کلیک جهت انتخاب سریع):</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['09:00', '10:30', '11:30', '16:30'].map((slotTime) => (
                        <button
                          type="button"
                          key={slotTime}
                          onClick={() => setQuickBookingStartSlot(slotTime)}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs ${
                            quickBookingStartSlot.startsWith(slotTime)
                              ? 'bg-[#005581] border-[#005581] text-white font-black shadow'
                              : 'bg-sky-50 dark:bg-sky-950/20 border-sky-300 text-[#005581] dark:text-sky-300 hover:bg-sky-100 font-bold'
                          }`}
                        >
                          <div className="font-mono text-xs">ساعت {slotTime}</div>
                          <div className="text-[10px] opacity-80 mt-0.5">آزاد (آماده رزرو)</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fast Booking Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!quickBookingName || !quickBookingPhone) {
                        alert('لطفاً نام و شماره تلفن بیمار را وارد نمایید.');
                        return;
                      }
                      const calculatedTimeStr = calculateMultiSlotString(
                        quickBookingStartSlot,
                        quickBookingSlotCount
                      );
                      const newApt: Appointment = {
                        id: `apt-${Date.now()}`,
                        patientId: `p-${Date.now()}`,
                        patientName: quickBookingName,
                        patientPhone: quickBookingPhone,
                        nationalId: quickBookingNationalId || '0012345678',
                        dentistId: 'u-dentist1',
                        dentistName: quickBookingDoctor,
                        branchId: 'br-1',
                        date: '1405-05-13',
                        timeSlot: calculatedTimeStr,
                        reason: quickBookingReason,
                        status: 'scheduled',
                        isFirstVisit: true,
                        visitFeePaid: false,
                        checkInFormCompleted: false,
                        createdAt: '۱۴۰۵/۰۵/۱۳',
                      };
                      setLocalAppointments((prev) => [newApt, ...prev]);
                      onAddAppointment(newApt);
                      setQuickBookingName('');
                      setQuickBookingPhone('');
                      setQuickBookingNationalId('');
                      alert(`نوبت با موفقیت برای بیمار ${quickBookingName} ثبت گردید:\nبازه زمانی: ${calculatedTimeStr}`);
                      setActiveTab('today_kanban');
                    }}
                    className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          زمان شروع نوبت:
                        </label>
                        <select
                          value={quickBookingStartSlot.split(' - ')[0]}
                          onChange={(e) => setQuickBookingStartSlot(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                        >
                          {timeSlotsHourly.map((s) => {
                            const startTime = s.split(' - ')[0];
                            return (
                              <option key={s} value={startTime}>
                                ساعت {startTime}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          تعداد بازه‌های متوالی (طول درمان):
                        </label>
                        <select
                          value={quickBookingSlotCount}
                          onChange={(e) => setQuickBookingSlotCount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                        >
                          <option value={1}>۱ بازه (۳۰ دقیقه - معاینه و درمان معمولی)</option>
                          <option value={2}>۲ بازه متوالی (۱ ساعت کامل - عصب‌کشی / ترمیم پیچیده)</option>
                          <option value={3}>۳ بازه متوالی (۱.۵ ساعت - ایمپلنت / کامپوزیت زیبایی)</option>
                          <option value={4}>۴ بازه متوالی (۲ ساعت - جراحی فک و بازسازی)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-300 dark:border-sky-900/50 rounded-xl flex items-center justify-between shadow-xs">
                      <span className="font-bold text-[#005581] dark:text-sky-200 text-xs">
                        بازه زمانی رزرو شده پس از محاسبه متوالی:
                      </span>
                      <span className="font-mono font-black text-[#005581] dark:text-sky-300 text-sm">
                        {calculateMultiSlotString(quickBookingStartSlot, quickBookingSlotCount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          نام بیمار: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: نرگس رضایی"
                          value={quickBookingName}
                          onChange={(e) => setQuickBookingName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          شماره همراه: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="۰۹۱۲..."
                          value={quickBookingPhone}
                          onChange={(e) => setQuickBookingPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          کد ملی بیمار:
                        </label>
                        <input
                          type="text"
                          placeholder="0012345678"
                          value={quickBookingNationalId}
                          onChange={(e) => setQuickBookingNationalId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        علت مراجعه / خدمت دندانپزشکی:
                      </label>
                      <input
                        type="text"
                        value={quickBookingReason}
                        onChange={(e) => setQuickBookingReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                        <span>ثبت نهایی و ثبت در برد نوبت‌های امروز</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SUB-SECTION 2: SEARCHABLE WAITLIST */}
              {callCenterSubTab === 'waitlist' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Search & Priority Filter Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="جستجو در لیست انتظار (نام بیمار، شماره همراه، کد ملی، علت مراجعه)..."
                        value={waitlistSearchQuery}
                        onChange={(e) => setWaitlistSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => setWaitlistFilterPriority('all')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          waitlistFilterPriority === 'all'
                            ? 'bg-[#005581] text-white shadow'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        همه ({localWaitlist.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setWaitlistFilterPriority('urgent')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          waitlistFilterPriority === 'urgent'
                            ? 'bg-rose-600 text-white shadow'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        اورژانسی
                      </button>
                      <button
                        type="button"
                        onClick={() => setWaitlistFilterPriority('normal')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          waitlistFilterPriority === 'normal'
                            ? 'bg-[#005581] text-white shadow'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        عادی
                      </button>
                    </div>
                  </div>

                  {/* Waitlist Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {localWaitlist
                      .filter((w) => {
                        const matchesSearch =
                          w.patientName.includes(waitlistSearchQuery) ||
                          w.phone.includes(waitlistSearchQuery) ||
                          (w.nationalId && w.nationalId.includes(waitlistSearchQuery)) ||
                          w.reason.includes(waitlistSearchQuery);
                        const matchesPriority =
                          waitlistFilterPriority === 'all' || w.priority === waitlistFilterPriority;
                        return matchesSearch && matchesPriority;
                      })
                      .map((w) => (
                        <div
                          key={w.id}
                          className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {w.patientName}
                              </span>
                              {w.nationalId && (
                                <span className="text-xs font-mono text-slate-400">({w.nationalId})</span>
                              )}
                            </div>

                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                w.priority === 'urgent'
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'bg-amber-200 text-amber-900'
                              }`}
                            >
                              اولویت {w.priority === 'urgent' ? 'اورژانسی' : 'عادی'}
                            </span>
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="text-slate-600 dark:text-slate-300 font-medium">
                              شماره تماس: <strong className="font-mono dir-ltr inline-block">{w.phone}</strong>
                            </div>
                            <div className="text-slate-600 dark:text-slate-300 font-medium">
                              علت مراجعه: <strong className="text-slate-800 dark:text-slate-200">{w.reason}</strong>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setLocalWaitlist((prev) => prev.filter((item) => item.id !== w.id));
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs cursor-pointer"
                            >
                              حذف از لیست
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setQuickBookingName(w.patientName);
                                setQuickBookingPhone(w.phone);
                                setQuickBookingNationalId(w.nationalId || '');
                                setQuickBookingReason(w.reason);
                                setCallCenterSubTab('quick_booking');
                              }}
                              className="px-4 py-1.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>ثبت نوبت برای این بیمار</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 3: CALL LOGS */}
              {callCenterSubTab === 'logs' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="جستجو در لاگ تماس‌ها (نام، شماره، یادداشت)..."
                        value={callLogSearchQuery}
                        onChange={(e) => setCallLogSearchQuery(e.target.value)}
                        className="w-full sm:w-80 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setCallLogTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          callLogTypeFilter === 'all'
                            ? 'bg-[#005581] text-white shadow'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        همه تماس‌ها
                      </button>
                      <button
                        type="button"
                        onClick={() => setCallLogTypeFilter('incoming')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          callLogTypeFilter === 'incoming'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        ورودی
                      </button>
                      <button
                        type="button"
                        onClick={() => setCallLogTypeFilter('missed')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          callLogTypeFilter === 'missed'
                            ? 'bg-rose-600 text-white shadow'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        از دست رفته
                      </button>
                    </div>
                  </div>

                  {/* Call Logs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {callLogs
                      .filter((log) => {
                        const matchesType =
                          callLogTypeFilter === 'all' || log.type === callLogTypeFilter;
                        const matchesQuery =
                          log.callerName.includes(callLogSearchQuery) ||
                          log.phone.includes(callLogSearchQuery) ||
                          log.notes.includes(callLogSearchQuery);
                        return matchesType && matchesQuery;
                      })
                      .map((log) => (
                        <div
                          key={log.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold">
                              <span className="text-slate-900 dark:text-slate-100">{log.callerName}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  log.type === 'incoming'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : log.type === 'outgoing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800 animate-pulse'
                                }`}
                              >
                                {log.type === 'incoming'
                                  ? 'تماس ورودی'
                                  : log.type === 'outgoing'
                                  ? 'تماس خروجی'
                                  : 'تماس از دست رفته'}
                              </span>
                            </div>
                            <span className="font-mono text-slate-400 text-[11px]">{log.time}</span>
                          </div>

                          <div className="font-mono text-slate-500 dir-ltr text-right">{log.phone}</div>

                          <p className="text-slate-700 dark:text-slate-300 font-medium pt-2 border-t border-slate-200 dark:border-slate-700">
                            {log.notes}
                          </p>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setQuickBookingName(log.callerName);
                                setQuickBookingPhone(log.phone);
                                setQuickBookingReason(log.notes);
                                setCallCenterSubTab('quick_booking');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>ثبت نوبت سریع برای این تماس</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: EDIT CHECK-IN FORM (فرم پذیرش کلینیک) */}
          {activeTab === 'edit_checkin_form' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              {/* Form Title Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>فرم پذیرش کلینیک</span>
                </h2>
                <span className="text-xs px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 font-bold">
                  تنظیمات فرم ایجاد پرونده
                </span>
              </div>

              {/* List of Existing Form Questions */}
              <div className="space-y-4">
                {checkInQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4 transition hover:border-slate-300"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-slate-100">
                        <span className="text-slate-500 font-mono">{idx + 1}.</span>
                        <span>{q.text}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                          [{q.required ? 'اجباری' : 'اختیاری'} | {q.typeLabel}]
                        </span>
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
                          گزینه‌ها: {q.options.join(' / ')}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCheckInQuestion(q.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs transition cursor-pointer shrink-0 shadow-xs"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>

              {/* Divider Line */}
              <div className="border-b border-slate-200 dark:border-slate-800 my-6"></div>

              {/* Add New Question Section Form */}
              <form onSubmit={handleAddCheckInQuestionSubmit} className="space-y-4">
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  اضافه کردن سوال جدید
                </h3>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="متن سوال"
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-[#005581]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={newQType}
                      onChange={(e) => setNewQType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold"
                    >
                      <option value="text">رشته متن</option>
                      <option value="long_text">متن طولانی</option>
                      <option value="choice">انتخابی</option>
                      <option value="boolean">بله / خیر</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={newQRequired ? 'true' : 'false'}
                      onChange={(e) => setNewQRequired(e.target.value === 'true')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold"
                    >
                      <option value="true">اجباری</option>
                      <option value="false">اختیاری</option>
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="گزینه‌ها (فقط برای نوع انتخابی) - با / جدا کنید"
                    value={newQOptions}
                    onChange={(e) => setNewQOptions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-[#005581]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-black text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5 text-[#ffd200]" />
                  <span>اضافه کردن سوال</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FULL PATIENT FILE MODAL */}
      {selectedPatientFile && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#005581] text-[#ffd200] font-black flex items-center justify-center text-xl shadow">
                  {selectedPatientFile.fullName.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>پرونده کامل دندانپزشکی {selectedPatientFile.fullName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#005581]/10 text-[#005581] dark:text-[#72cdf4] text-xs font-mono font-bold">
                      کد UDR: {selectedPatientFile.udrCode}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    کد ملی: {selectedPatientFile.nationalId} | تلفن: {selectedPatientFile.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatientFile(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient File Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
              <button
                onClick={() => setPatientFileTab('general')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  patientFileTab === 'general'
                    ? 'bg-[#005581] text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                مشخصات و بیمه
              </button>

              <button
                onClick={() => setPatientFileTab('odontogram')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  patientFileTab === 'odontogram'
                    ? 'bg-[#005581] text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                اودنتوگرام و وضعیت دندان‌ها
              </button>

              <button
                onClick={() => setPatientFileTab('radiography')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  patientFileTab === 'radiography'
                    ? 'bg-[#005581] text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                تصاویر و رادیوگرافی (X-Ray)
              </button>

              <button
                onClick={() => setPatientFileTab('visit_history')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  patientFileTab === 'visit_history'
                    ? 'bg-[#005581] text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                سوابق مراجعات و درمان‌ها
              </button>

              <button
                onClick={() => setPatientFileTab('edit_info')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  patientFileTab === 'edit_info'
                    ? 'bg-[#005581] text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                ویرایش مشخصات
              </button>
            </div>

            {/* TAB CONTENT: General Info */}
            {patientFileTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
                    اطلاعات هویت و بیمه‌ای:
                  </h4>
                  <div>نام کامل: <strong className="text-slate-800 dark:text-slate-200">{selectedPatientFile.fullName}</strong></div>
                  <div>کد ملی: <strong className="font-mono">{selectedPatientFile.nationalId}</strong></div>
                  <div>شماره تماس: <strong className="font-mono">{selectedPatientFile.phone}</strong></div>
                  <div>بیمه پایه: <strong className="text-emerald-700">{selectedPatientFile.primaryInsurance.provider}</strong></div>
                  <div>شماره دفترچه/بیمه‌نامه: <strong className="font-mono">{selectedPatientFile.primaryInsurance.policyNumber}</strong></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-500" />
                      <span>سوابق پزشکی، بیماری‌های زمینه‌ای و حساسیت‌ها:</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#005581] dark:text-[#72cdf4] font-bold">
                      پرونده سلامت
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <span className="text-slate-500 font-bold text-[11px] block mb-1">بیماری‌های زمینه‌ای ثبت‌شده:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const cleanList = (selectedPatientFile.medicalHistory || []).filter(
                            (mh) => !mh.startsWith('ثبت تصویر') && !mh.includes('[هوش مصنوعی]') && !mh.includes('RVG') && !mh.includes('OPG') && !mh.startsWith('درمان توسط')
                          );

                          if (cleanList.length === 0) {
                            return (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                سلامت عمومی کامل / فاقد بیماری زمینه‌ای
                              </span>
                            );
                          }

                          return cleanList.map((mh, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs ${
                                mh.includes('فشار') || mh.includes('قلب')
                                  ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                  : mh.includes('دیابت') || mh.includes('قند')
                                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  : mh.includes('بارداری')
                                  ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                  : 'bg-sky-100 dark:bg-sky-950/50 text-[#005581] dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              {mh}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50">
                        <span className="text-slate-500 font-bold text-[11px] block">حساسیت دارویی ثبت‌شده:</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-bold text-xs mt-0.5 block">
                          {editAllergies || 'بدون حساسیت دارویی'}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 font-bold text-[11px] block">تماس اضطراری:</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200 text-xs mt-0.5 block">
                          {editEmergency || 'ثبت نشده'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Odontogram */}
            {patientFileTab === 'odontogram' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  نقشه کامل اودنتوگرام و آناتومی دندان‌های بیمار:
                </h4>
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <Odontogram
                    teethMap={patientTeethState}
                    onToothUpdate={(fdi, updated) =>
                      setPatientTeethState((prev) => ({ ...prev, [fdi]: updated }))
                    }
                    selectedToothFdi={selectedToothFdi}
                    onSelectTooth={(fdi) => setSelectedToothFdi(fdi)}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Radiography & Images */}
            {patientFileTab === 'radiography' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#005581]" />
                    <span>تصاویر رادیوگرافی و علائم بالینی ثبت‌شده توسط دندان‌پزشک ({selectedPatientFile.fullName}):</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">
                    تعداد تصاویر: {(selectedPatientFile.patientImages || []).length} مورد
                  </span>
                </div>
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <ImageXrayViewer
                    patientName={selectedPatientFile.fullName}
                    patientId={selectedPatientFile.id}
                    doctorName="دکتر معالج"
                    toothFdi={selectedToothFdi || 16}
                    patientImages={selectedPatientFile.patientImages || []}
                    onSavePatientImage={(imageRecord) => {
                      if (onSavePatientImage) {
                        onSavePatientImage(selectedPatientFile.id, imageRecord);
                      }
                      const existing = selectedPatientFile.patientImages || [];
                      const idx = existing.findIndex((img) => img.id === imageRecord.id);
                      const updatedImages = idx >= 0 ? existing.map((img, i) => (i === idx ? imageRecord : img)) : [imageRecord, ...existing];
                      setSelectedPatientFile((prev) => prev ? { ...prev, patientImages: updatedImages } : prev);
                    }}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Visit History */}
            {patientFileTab === 'visit_history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    تاریخچه تمام مراجعات، درمان‌ها، یادداشت‌های بالینی و نسخه‌های دارویی:
                  </h4>
                </div>

                {/* Clinical Notes from Doctor */}
                {selectedPatientFile.clinicalNotes && selectedPatientFile.clinicalNotes.length > 0 && (
                  <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                    <h5 className="text-xs font-bold text-[#005581] dark:text-[#72cdf4] flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>یادداشت‌ها و شرح‌های بالینی دندان‌پزشک:</span>
                    </h5>
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {selectedPatientFile.clinicalNotes.map((note, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescriptions issued */}
                {selectedPatientFile.prescriptions && selectedPatientFile.prescriptions.length > 0 && (
                  <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      <span>نسخه‌های دارویی صادرشده:</span>
                    </h5>
                    <div className="space-y-2 text-xs">
                      {selectedPatientFile.prescriptions.map((rx) => (
                        <div key={rx.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                            <span>پزشک: {rx.dentistName}</span>
                            <span className="font-mono text-slate-500">{rx.date}</span>
                          </div>
                          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                            {rx.items.map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ul>
                          {rx.instructions && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">دستور: {rx.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Treatment Logs from all teeth */}
                {(() => {
                  const allLogs = Object.values(selectedPatientFile.teethMap || {}).flatMap((t: ToothDetail) =>
                    (t.treatmentHistory || []).map((th) => ({ ...th, toothFdi: t.fdiNumber }))
                  );

                  if (allLogs.length === 0 && (!selectedPatientFile.medicalHistory || selectedPatientFile.medicalHistory.length === 0)) {
                    return (
                      <div className="p-6 text-center text-slate-400 text-xs italic">
                        هیچ سابقه درمانی ثبت‌شده‌ای در پرونده موجود نیست.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">سوابق اقدامات درمانی دندان‌ها:</h5>
                      {allLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex justify-between items-center"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#005581] text-white text-[10px]">
                                دندان {log.toothFdi}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {log.procedureName}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex gap-3">
                              <span>تاریخ: <strong className="font-mono">{log.date}</strong></span>
                              <span>پزشک: <strong>{log.dentistName}</strong></span>
                            </div>
                          </div>

                          <div className="font-mono font-bold text-[#005581] dark:text-[#72cdf4] text-xs">
                            {log.cost ? log.cost.toLocaleString('fa-IR') + ' تومان' : 'تعرفه بیمه‌ای'}
                          </div>
                        </div>
                      ))}

                      {selectedPatientFile.medicalHistory && selectedPatientFile.medicalHistory.length > 0 && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              پیشینه پزشکی و ملاحظات درمانی بیمار:
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedPatientFile.medicalHistory.map((mh, idx) => (
                              <div
                                key={idx}
                                className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-2xs"
                              >
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                <span>{mh}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB CONTENT: Edit Info */}
            {patientFileTab === 'edit_info' && (
              <form onSubmit={handleSavePatientEdits} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">شماره همراه:</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">شماره اضطراری:</label>
                    <input
                      type="text"
                      value={editEmergency}
                      onChange={(e) => setEditEmergency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">سوابق پزشکی و بیماری‌ها:</label>
                  <textarea
                    rows={2}
                    value={editHistory}
                    onChange={(e) => setEditHistory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow transition cursor-pointer"
                  >
                    ذخیره تغییرات پرونده
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONNECT TO DOCTOR MODAL */}
      {selectedAptForConnect && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#005581]" />
                <span>اتصال بیمار {selectedAptForConnect.patientName} به یونیت پزشک</span>
              </h3>
              <button
                onClick={() => setSelectedAptForConnect(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  یادداشت منشی جهت نمایش روی صفحه پزشک:
                </label>
                <textarea
                  rows={3}
                  value={receptionNote}
                  onChange={(e) => setReceptionNote(e.target.value)}
                  placeholder="مثلاً: عکس RVG بیمار آماده است، بیحسی تزریق شد..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAptForConnect(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] text-white font-bold shadow cursor-pointer"
                >
                  ارسال و اتصال فعال به یونیت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PHONE BOOKING MODAL */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#005581]" />
                <span>ثبت فوری نوبت جدید تلفنی</span>
              </h3>
              <button onClick={() => setIsPhoneModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePhoneBooking} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">نام و نام خانوادگی بیمار:</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">شماره همراه:</label>
                  <input
                    type="text"
                    required
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">پزشک معالج:</label>
                  <select
                    value={newDentistName}
                    onChange={(e) => setNewDentistName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {clinicDentists.map((cd) => (
                      <option key={cd.id} value={cd.name}>
                        {cd.name} {cd.specialty ? `(${cd.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">شروع بازه زمانی:</label>
                  <select
                    value={newTimeSlot.split(' - ')[0]}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  >
                    {timeSlotsHourly.map((s) => {
                      const startTime = s.split(' - ')[0];
                      return (
                        <option key={s} value={startTime}>
                          ساعت {startTime}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">تعداد بازه‌های متوالی (طول درمان):</label>
                  <select
                    value={bookingSlotCount}
                    onChange={(e) => setBookingSlotCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value={1}>۱ بازه (۳۰ دقیقه - درمان‌های معمولی)</option>
                    <option value={2}>۲ بازه متوالی (۱ ساعت - عصب‌کشی / جراحی)</option>
                    <option value={3}>۳ بازه متوالی (۱.۵ ساعت - ایمپلنت / زیبایی)</option>
                    <option value={4}>۴ بازه متوالی (۲ ساعت - درمان‌های طولانی کامپلکس)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">علت مراجعه / درمان:</label>
                  <input
                    type="text"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                  <span>ثبت نوبت تلفنی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PATIENT TO WAITLIST MODAL */}
      {isAddWaitlistModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  افزودن بیمار جدید به لیست انتظار کلینیک
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWaitlistModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newWaitlistName || !newWaitlistPhone) {
                  alert('لطفاً نام و شماره همراه بیمار را وارد کنید.');
                  return;
                }
                const newEntry: WaitlistEntry = {
                  id: `w-${Date.now()}`,
                  patientName: newWaitlistName,
                  phone: newWaitlistPhone,
                  nationalId: newWaitlistNationalId,
                  preferredDate: '۱۴۰۵/۰۵/۱۳',
                  reason: newWaitlistReason,
                  priority: newWaitlistPriority,
                  notified: false,
                };
                setLocalWaitlist((prev) => [newEntry, ...prev]);
                setNewWaitlistName('');
                setNewWaitlistPhone('');
                setNewWaitlistNationalId('');
                setIsAddWaitlistModalOpen(false);
                alert(`بیمار ${newWaitlistName} با موفقیت به لیست انتظار اضافه شد.`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام و نام خانوادگی بیمار: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کامران رستمی"
                  value={newWaitlistName}
                  onChange={(e) => setNewWaitlistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره همراه: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="۰۹۱۲..."
                    value={newWaitlistPhone}
                    onChange={(e) => setNewWaitlistPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">کد ملی:</label>
                  <input
                    type="text"
                    placeholder="0012345678"
                    value={newWaitlistNationalId}
                    onChange={(e) => setNewWaitlistNationalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  علت نوبت‌دهی / توضیحات:
                </label>
                <input
                  type="text"
                  value={newWaitlistReason}
                  onChange={(e) => setNewWaitlistReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">درجه اولویت:</label>
                <select
                  value={newWaitlistPriority}
                  onChange={(e) => setNewWaitlistPriority(e.target.value as 'urgent' | 'normal')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="urgent">اورژانسی (درد شدید / نوبت جایگزین فوری)</option>
                  <option value="normal">عادی (نوبت کنسلی / چکاپ)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWaitlistModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#ffd200]" />
                  <span>ثبت در لیست انتظار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCTOR SUBMISSION INSURANCE REVIEW (بررسی شرح بیمه) */}
      {selectedSubmissionForInsuranceReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <span>بررسی و تنظیم شرح بیمه و مستندات بالینی</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] text-[10px] font-extrabold">
                      Dentora Claim Review
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    بیمار: {selectedSubmissionForInsuranceReview.patientName} | پزشک معالج: {selectedSubmissionForInsuranceReview.dentistName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmissionForInsuranceReview(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Treatment and Insurance Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-slate-400 block font-bold text-[11px]">خلاصه خدمات ثبت‌شده پزشک:</span>
                <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                  {selectedSubmissionForInsuranceReview.treatmentSummary}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-[#005581] font-mono text-[10px] font-bold">
                    کد ملی: {selectedSubmissionForInsuranceReview.nationalId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    زمان: {selectedSubmissionForInsuranceReview.submittedAt}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-slate-400 block font-bold text-[11px]">نسخه دارویی و دستورات:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {selectedSubmissionForInsuranceReview.prescriptionSummary}
                </p>
                <div className="text-[11px] text-[#005581] dark:text-sky-300 font-bold pt-1">
                  وضعیت استعلام: دارای پوشش بیمه تکمیلی فعال
                </div>
              </div>
            </div>

            {/* Editable Narrative & Justification */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  متن شرح بالینی و ادله پزشکی (جهت ارسال به کارشناس بیمه):
                </label>
                <span className="text-[11px] text-slate-400 font-medium">قابل ویرایش توسط منشی</span>
              </div>
              <textarea
                rows={4}
                value={narrativeEditText}
                onChange={(e) => setNarrativeEditText(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs leading-relaxed focus:ring-2 focus:ring-[#005581] focus:outline-none"
                placeholder="شرح بالینی دندانپزشک، پوسیدگی، علائم پالپیت، گرافی و مستندات قانونی بیمه..."
              />
            </div>

            {/* Attached Evidences Preview */}
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#005581] dark:text-sky-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ضمائم بالینی و مدارک پیوست این پرونده:</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  تایید هوشمند GreenLane
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 text-[#005581] font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>گرافی RVG پری‌آپیکال قبل و بعد درمان</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 text-[#005581] font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>فرم رضایت‌نامه دیجیتال بیمار</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSubmissionForInsuranceReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
              >
                بستن
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleApproveDoctorSubmission(selectedSubmissionForInsuranceReview.id);
                    setSelectedSubmissionForInsuranceReview(null);
                    alert(`شرح بیمه با موفقیت تایید و در پرونده بیمار ${selectedSubmissionForInsuranceReview.patientName} ذخیره گردید.`);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4 text-[#ffd200]" />
                  <span>تایید شرح و ثبت نهایی در پرونده</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLAIM DETAIL & DOCUMENT REVIEW */}
      {selectedClaimForDocReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                    پرونده و اسناد بیمه: {selectedClaimForDocReview.patientName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    کد پیگیری: {selectedClaimForDocReview.id} | بیمه‌گر: {selectedClaimForDocReview.insuranceCompany}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaimForDocReview(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">مبلغ کل فاکتور:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold block mt-1">
                  {(selectedClaimForDocReview.totalAmount || 0).toLocaleString('fa-IR')} تومان
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <span className="text-[#005581] dark:text-sky-300 block text-[11px]">سهم قابل دریافت از بیمه:</span>
                <strong className="text-[#005581] dark:text-sky-200 font-black block mt-1">
                  {(selectedClaimForDocReview.coveredAmount || selectedClaimForDocReview.totalAmount * 0.7 || 0).toLocaleString('fa-IR')} تومان
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-amber-800 dark:text-amber-300 block text-[11px]">سهم پرداختی بیمار (فرانشیز):</span>
                <strong className="text-amber-900 dark:text-amber-200 font-bold block mt-1">
                  {(selectedClaimForDocReview.patientPaidAmount || selectedClaimForDocReview.totalAmount * 0.3 || 0).toLocaleString('fa-IR')} تومان
                </strong>
              </div>
            </div>

            {/* Evidences List */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#005581]" />
                <span>ضمائم و اسناد بالینی پیوست‌شده:</span>
              </h4>
              <div className="space-y-2">
                {selectedClaimForDocReview.evidences?.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#005581]" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ev.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-[#005581] font-mono">
                        {ev.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEvidencePreviewModal(ev)}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 text-xs font-bold text-[#005581] hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>پیش‌نمایش سند</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedClaimForDocReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                بستن
              </button>

              <div className="flex items-center gap-2">
                {!hasAccountantRole ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSendClaimToInsurance) {
                        onSendClaimToInsurance(selectedClaimForDocReview.id);
                      }
                      if (setClaims) {
                        setClaims((prev) =>
                          prev.map((c) =>
                            c.id === selectedClaimForDocReview.id
                              ? {
                                  ...c,
                                  status: 'submitted' as const,
                                  receptionApproved: true,
                                  accountantApproved: true,
                                  reviewRoute: c.riskScore && c.riskScore > 60 ? 'deep_review' : 'express',
                                }
                              : c
                          )
                        );
                      }
                      const pName = selectedClaimForDocReview.patientName;
                      const insName = selectedClaimForDocReview.insuranceCompany || selectedClaimForDocReview.insuranceProvider || 'سازمان بیمه‌گر';
                      setSelectedClaimForDocReview(null);
                      showReceptionToast(`✅ پرونده بیمار ${pName} با موفقیت تایید و مستقیماً به سازمان بیمه‌گر (${insName}) ارسال گردید.`);
                      alert(`پرونده بیمار ${pName} با موفقیت به سازمان بیمه‌گر (${insName}) ارسال شد.`);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>تایید و ارسال مستقیم به پورتال بیمه</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (setClaims) {
                        setClaims((prev) =>
                          prev.map((c) =>
                            c.id === selectedClaimForDocReview.id
                              ? {
                                  ...c,
                                  status: 'queued' as const,
                                  referredToAccountant: true,
                                  receptionApproved: true,
                                }
                              : c
                          )
                        );
                      }
                      const pName = selectedClaimForDocReview.patientName;
                      setSelectedClaimForDocReview(null);
                      showReceptionToast(`✅ مدارک پرونده ${pName} با موفقیت تایید و به کارتابل حسابداری کلینیک منتقل گردید.`);
                      alert(`مدارک پرونده ${pName} تایید و به کارتابل حسابداری کلینیک منتقل گردید.`);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-[#ffd200]" />
                    <span>تایید مدارک و ارسال به کارتابل حسابدار</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EVIDENCE / IMAGE PREVIEW */}
      {showEvidencePreviewModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#005581]" />
                <span>پیش‌نمایش مدرک: {showEvidencePreviewModal.title}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowEvidencePreviewModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center space-y-3 min-h-[220px]">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-[#ffd200]" />
              </div>
              <div className="text-center space-y-1">
                <div className="font-bold text-sm text-slate-200">{showEvidencePreviewModal.title}</div>
                <div className="text-xs text-slate-400 font-mono">نوع سند: {showEvidencePreviewModal.type}</div>
                <div className="text-xs text-emerald-400 font-medium">✓ دارای برچسب دیجیتال و واترمارک رسمی کلینیک دنتورا</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowEvidencePreviewModal(null)}
                className="px-4 py-2 rounded-xl bg-[#005581] text-white font-bold text-xs cursor-pointer"
              >
                تایید و بازگشت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Reception Action Toast Notification */}
      {receptionToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-5 py-3 rounded-2xl bg-emerald-700 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 border border-emerald-500">
            <CheckCircle2 className="w-5 h-5 text-[#ffd200] shrink-0" />
            <span>{receptionToast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
