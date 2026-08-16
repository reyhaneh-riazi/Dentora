import React, { useState } from 'react';
import {
  Patient,
  Appointment,
  ToothDetail,
  UserProfile,
  UserRole,
  ClinicRegistration,
  BaseInsuranceContract,
  SupplementaryInsuranceContract,
} from '../../types';
import { mockPatients } from '../../data/mockData';
import { Odontogram } from './Odontogram';
import { ImageXrayViewer } from './ImageXrayViewer';
import { DoctorCalendarView } from './DoctorCalendarView';
import { PatientRecordsView } from './PatientRecordsView';
import { PatientCommView } from './PatientCommView';
import { OwnerWorkspace } from '../owner/OwnerWorkspace';
import {
  Stethoscope,
  FolderOpen,
  MessageSquare,
  Calendar,
  FlaskConical,
  HelpCircle,
  Mic,
  MicOff,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  FileText,
  Send,
  Clock,
  AlertCircle,
  PenTool,
  Search,
  CheckCircle2,
  ShieldAlert,
  Plus,
  Building,
  DollarSign,
  SendHorizontal,
  Check,
  Camera,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  PauseCircle,
  Play,
  RotateCcw,
  SkipForward,
  UserCheck,
  History,
  Info,
  Crown,
} from 'lucide-react';

interface DentistWorkspaceProps {
  activePatient: Patient;
  appointment: Appointment;
  allPatients?: Patient[];
  appointments?: Appointment[];
  onSelectPatientId?: (patientId: string) => void;
  onUpdatePatient?: (updatedPatient: Partial<Patient>) => void;
  onFinishTreatment?: (data: {
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
  }) => void;
  onAddDoctorReminder?: (reminder: {
    patientName: string;
    patientPhone: string;
    doctorName: string;
    reason: string;
    suggestedDate: string;
  }) => void;
  onNextPatient: () => void;
  onUpdatePatientTeeth: (updatedTeeth: Record<number, ToothDetail>) => void;
  insuranceModuleActive?: boolean;
  initialTab?: DentistNavTab;

  // Owner Props
  isOwner?: boolean;
  currentClinic?: ClinicRegistration;
  onUpdateClinicInfo?: (updated: Partial<ClinicRegistration>) => void;
  users?: UserProfile[];
  onAddEmployee?: (employee: UserProfile) => void;
  onDeleteEmployee?: (id: string) => void;
  onUpdateUserRole?: (userId: string, newRole: UserRole, isOwner: boolean) => void;
  onToggleInsuranceModule?: () => void;
  isInsuranceContracted?: boolean;
  onToggleInsuranceContracted?: () => void;
  bnplActive?: boolean;
  onToggleBnplActive?: () => void;
  hasAccountantRole?: boolean;
  onToggleHasAccountantRole?: () => void;
  baseInsurances?: BaseInsuranceContract[];
  onToggleBaseInsuranceContracted?: (id: string) => void;
  onUpdateBaseInsuranceFranchise?: (id: string, franchisePercent: number) => void;
  supplementaryInsurances?: SupplementaryInsuranceContract[];
  onToggleSupplementaryInsuranceContracted?: (id: string) => void;
  onToggleSupplementaryFastSettlement?: (id: string) => void;
  onUpdateSupplementaryMaxCoverage?: (id: string, maxCoverage: number) => void;
}

type DentistNavTab =
  | 'clinical_workbench'
  | 'patient_records'
  | 'patient_comm'
  | 'my_schedule'
  | 'lab_section'
  | 'patient_qa'
  | 'owner_settings';

// Sequential Steps for Clinical Workbench
type WorkbenchStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const DentistWorkspace: React.FC<DentistWorkspaceProps> = ({
  activePatient,
  appointment,
  allPatients = [],
  appointments = [],
  onSelectPatientId,
  onUpdatePatient,
  onFinishTreatment,
  onAddDoctorReminder,
  onNextPatient,
  onUpdatePatientTeeth,
  insuranceModuleActive = true,
  isOwner = true,
  currentClinic,
  onUpdateClinicInfo,
  users = [],
  onAddEmployee,
  onDeleteEmployee,
  onUpdateUserRole,
  onToggleInsuranceModule,
  isInsuranceContracted = true,
  onToggleInsuranceContracted,
  bnplActive = true,
  onToggleBnplActive,
  hasAccountantRole = true,
  onToggleHasAccountantRole,
  baseInsurances = [],
  onToggleBaseInsuranceContracted,
  onUpdateBaseInsuranceFranchise,
  supplementaryInsurances = [],
  onToggleSupplementaryInsuranceContracted,
  onToggleSupplementaryFastSettlement,
  onUpdateSupplementaryMaxCoverage,
  initialTab,
}) => {
  // Main Navigation Tab
  const [activeNavTab, setActiveNavTab] = useState<DentistNavTab>(initialTab || 'clinical_workbench');

  // Patients list state for records and messaging
  const [patientsList, setPatientsList] = useState<Patient[]>(
    allPatients && allPatients.length > 0 ? allPatients : mockPatients
  );

  React.useEffect(() => {
    if (allPatients && allPatients.length > 0) {
      setPatientsList(allPatients);
    }
  }, [allPatients]);

  const handleUpdatePatientInList = (updated: Patient) => {
    setPatientsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (onUpdatePatient) {
      onUpdatePatient(updated);
    }
  };

  // Allergy & Medical Alerts State & Handlers
  const [allergiesModalOpen, setAllergiesModalOpen] = useState(false);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [newHistoryInput, setNewHistoryInput] = useState('');

  const handleAddAllergy = (allergy: string) => {
    if (!allergy.trim()) return;
    const updatedAllergies = Array.from(new Set([...(activePatient.allergies || []), allergy.trim()]));
    if (onUpdatePatient) {
      onUpdatePatient({ allergies: updatedAllergies });
    }
    setNewAllergyInput('');
  };

  const handleRemoveAllergy = (allergyToRemove: string) => {
    const updatedAllergies = (activePatient.allergies || []).filter((a) => a !== allergyToRemove);
    if (onUpdatePatient) {
      onUpdatePatient({ allergies: updatedAllergies });
    }
  };

  const handleAddHistory = (historyItem: string) => {
    if (!historyItem.trim()) return;
    const updatedHistory = Array.from(new Set([...(activePatient.medicalHistory || []), historyItem.trim()]));
    if (onUpdatePatient) {
      onUpdatePatient({ medicalHistory: updatedHistory });
    }
    setNewHistoryInput('');
  };

  const handleRemoveHistory = (historyToRemove: string) => {
    const updatedHistory = (activePatient.medicalHistory || []).filter((h) => h !== historyToRemove);
    if (onUpdatePatient) {
      onUpdatePatient({ medicalHistory: updatedHistory });
    }
  };

  // Workbench Sequential Step (1 to 7 with skippable 'imaging')
  const [workbenchStep, setWorkbenchStep] = useState<WorkbenchStep>(1);

  // Selected Tooth FDI
  const [selectedToothFdi, setSelectedToothFdi] = useState<number | null>(16);

  // Step 2: Dental ASR & Optical Pen Dictation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [dictationText, setDictationText] = useState(
    'بیمار با پوسیدگی عمیق دندان ۱۶ مراجعه نمود. عصب‌کشی ۲ کاناله انجام شد و نیازمند ترمیم مجدد و روکش می‌باشد.'
  );
  const [opticalPenActive, setOpticalPenActive] = useState(false);
  const [isAnalyzingDictation, setIsAnalyzingDictation] = useState(false);
  const [aiProposalAutoGenerated, setAiProposalAutoGenerated] = useState(false);

  // Proposed AI Treatment Plan & Prescription (Editable)
  const [proposedTreatmentPlan, setProposedTreatmentPlan] = useState<string>(
    '۱. درمان ریشه (RCT) دندان ۱۶ - ۲ کانال\n۲. ترمیم کامپوزیت خلفی ۳ سطحی (MOD)\n۳. قالب‌گیری و ساخت روکش زیرکونیا'
  );
  const [proposedPrescription, setProposedPrescription] = useState<string[]>([
    'کپسول آموکسی‌سیلین ۵۰۰ میلی‌گرم - هر ۸ ساعت ۱ عدد (در صورت عدم حساسیت)',
    'قرص ژلوفن ۴۰۰ میلی‌گرم - هر ۸ ساعت هنگام درد'
  ]);
  const [newPrescriptionInput, setNewPrescriptionInput] = useState('');
  const [editSummaryNotice, setEditSummaryNotice] = useState<string | null>(null);

  // Step 3: Gemini Copilot Interactive Scrollable Chat Thread
  interface CopilotChatMessage {
    id: string;
    sender: 'doctor' | 'ai';
    text: string;
    time: string;
  }

  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotChatHistory, setCopilotChatHistory] = useState<CopilotChatMessage[]>([
    {
      id: 'c-1',
      sender: 'doctor',
      text: 'آیا برای درمان عصب‌کشی دندان ۱۶ در این بیمار با توجه به سوابق پزشکی و بیمه‌ای محدودیتی وجود دارد؟',
      time: '۱۰:۱۴',
    },
    {
      id: 'c-2',
      sender: 'ai',
      text: 'بر اساس پرونده پزشکی متصل بیمار (بدون حساسیت دارویی ثبت‌شده)، درمان ریشه دندان ۱۶ کاملاً استاندارد است. تزریق بی‌حسی لیدوکایین ۲٪ با اپی‌نفرین ۱:۱۰۰.۰۰۰ بدون تداخل بوده و کد تعرفه بیمه‌ای مربوطه قابل پوشش می‌باشد.',
      time: '۱۰:۱۵',
    },
  ]);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);

  // Step 4: Clinical Note & Next Visit Date
  const [clinicalNotes, setClinicalNotes] = useState(
    'پولپوتومی و شستشوی کانال‌ها با هیپوکلریت انجام شد. پانسمان موقت قرار داده شد.'
  );
  const [nextVisitDate, setNextVisitDate] = useState('۱ هفته آینده (۱۴۰۳/۰۵/۲۵) - جلسه دوم RCT');
  const [followupSentToReception, setFollowupSentToReception] = useState(false);

  // Step 5: Contracted Dentist Financial Breakdown
  const [dentistCommissionRate, setDentistCommissionRate] = useState(70); // 70% Dentist, 30% Center
  const [treatmentCostTotal, setTreatmentCostTotal] = useState(3500000); // 3,500,000 Toman

  // Step 6: Insurance Narrative (Drafted by AI, editable by dentist)
  const [insuranceNarrative, setInsuranceNarrative] = useState(
    'به دلیل پوسیدگی کلاس ۲ عمیق و درگیری شاخک پالپی دندان ۱۶، درمان ریشه عصب‌کشی مجدد و ترمیم کامپوزیت با کد تعرفه ۱۲.۲ انجام گرفت.'
  );
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);

  // Step 7: Submission State to Receptionist Panel
  const [isSubmittedToReception, setIsSubmittedToReception] = useState(false);

  // External Imaging Paused Treatments State (توقف میان درمان و بازگشت به درمان نیمه‌رهاشده)
  const [pausedTreatments, setPausedTreatments] = useState<
    { id: string; patientName: string; udrCode: string; date: string; reason: string; stepToResume: WorkbenchStep }[]
  >([
    {
      id: 'PAUSE-881',
      patientName: 'رضا علیزاده',
      udrCode: 'UDR-8812',
      date: '۱۴۰۳/۰۵/۱۸ - ۱۰:۳۰',
      reason: 'ارجاع به مرکز تصویربرداری بیرونی جهت OPG پانورامیک',
      stepToResume: 4,
    },
  ]);
  const [isTreatmentPausedCurrent, setIsTreatmentPausedCurrent] = useState(false);

  // Step 12.3: Lab Order States with Transparent Construction Stages
  const [labOrders, setLabOrders] = useState([
    {
      id: 'LAB-201',
      patient: activePatient.fullName,
      tooth: 16,
      type: 'روکش زيرکونيا کامل',
      shade: 'A2',
      labName: 'لابراتوار تخصصی آریا',
      status: 'در حال ساخت کست اولیه',
      deliveryDate: '۱۴۰۳/۰۵/۲۵',
      stages: [
        { name: 'ثبت سفارش و دریافت قالب', done: true, delayReason: '' },
        { name: 'ریخته‌گری کست و دیجیتایز ۳D', done: true, delayReason: '' },
        { name: 'تراش فرز و شیدینگ رنگ A2', done: false, delayReason: 'در انتظار تامین پودر سرامیک زیرکونیا' },
        { name: 'کنترل کیفیت و ارسال به مطب', done: false, delayReason: '' },
      ],
    },
  ]);

  // Search in Patient Records
  const [searchRecordQuery, setSearchRecordQuery] = useState('');

  // Patient Comm Chat input
  const [patientMsgInput, setPatientMsgInput] = useState('');
  const [commMessages, setCommMessages] = useState([
    { id: '1', sender: 'patient', text: 'سلام آقای دکتر، بعد از جلسه امروز عصب‌کشی درد خفیفی دارم، آیا مسکن بخورم؟', time: '۰۹:۱۵' },
    { id: '2', sender: 'doctor', text: 'سلام و وقت بخیر. بله تا ۲۴ ساعت آینده احساس درد هنگام جویدن طبیعی است. یک عدد ژلوفن ۴۰۰ مصرف کنید.', time: '۰۹:۲۵' },
  ]);

  // Patient Q&A Items with Doctor Answer Registration
  const [qaItems, setQaItems] = useState([
    {
      id: 'q1',
      patientName: 'مریم حسینی',
      udr: 'UDR-8841',
      category: 'پروتز و روکش',
      question: 'دکتر جان آیا بعد از تحویل روکش زيرکونيا می‌تونم غذای سفت بخورم؟',
      status: 'pending' as 'pending' | 'answered',
      time: '۱۰:۲۰ - امروز',
      aiSuggestion: 'تا ۲۴ ساعت اول پس از چسباندن نهایی روکش از فشار آوردن با اجسام بسیار سفت خودداری شود و شستشو با آب‌نمک ولرم انجام گیرد.',
      doctorAnswer: '',
      answeredAt: '',
    },
    {
      id: 'q2',
      patientName: 'علی محمدی',
      udr: 'UDR-7012',
      category: 'جراحی و عصب‌کشی',
      question: 'سلام آقای دکتر، ۲ روز از جراحی عصب‌کشی می‌گذره ولی هنوز موقع جویدن احساس تیر کشیدن دارم. طبیعیه؟',
      status: 'pending' as 'pending' | 'answered',
      time: '۰۸:۴۵ - امروز',
      aiSuggestion: 'احساس درد و حساسیت تا ۳ الی ۵ روز پس از درمان ریشه (RCT) هنگام جویدن طبیعی است. مصرف مسکن ژلوفن ۴۰۰ هر ۸ ساعت توصیه می‌شود.',
      doctorAnswer: '',
      answeredAt: '',
    },
    {
      id: 'q3',
      patientName: 'سارا امیری',
      udr: 'UDR-9102',
      category: 'ترمیم و زیبایی',
      question: 'سلام وقت بخیر، بعد از انجام جرم‌گیری دندان‌هام به آب سرد حساس شدند. آیا خمیردندان خاصی پیشنهاد می‌کنید؟',
      status: 'answered' as 'pending' | 'answered',
      time: 'دیروز ۱۶:۳۰',
      aiSuggestion: 'استفاده از خمیردندان ضدحساسیت (سنسوداین یا کرست) به مدت ۲ هفته و خودداری از آشامیدن نوشیدنی‌های داغ یا بسیار سرد.',
      doctorAnswer: 'سلام خانم امیری. حساسیت کوتاه‌مدت پس از برطرف شدن جرم‌های عمقی کاملاً طبیعی است. حتماً از خمیردندان ضدحساسیت مانند سنسوداین روزی ۲ بار استفاده فرمایید.',
      answeredAt: 'دیروز ۱۷:۱۰ - دکتر کاویانی',
    },
  ]);

  const [doctorAnswerDrafts, setDoctorAnswerDrafts] = useState<Record<string, string>>({});
  const [qaFilter, setQaFilter] = useState<'all' | 'pending' | 'answered'>('all');

  const handleSaveDoctorAnswer = (qId: string) => {
    const text = doctorAnswerDrafts[qId];
    if (!text || !text.trim()) return;

    setQaItems((prev) =>
      prev.map((item) => {
        if (item.id === qId) {
          return {
            ...item,
            status: 'answered',
            doctorAnswer: text,
            answeredAt: 'هم‌اکنون - توسط دکتر کاویانی',
          };
        }
        return item;
      })
    );
  };

  // Schedule Appointments list state for Doctor Calendar
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([
    appointment,
    {
      id: 'apt-2',
      patientId: 'p-7012',
      patientName: 'رضا علیزاده',
      patientPhone: '۰۹۱۲۹۸۷۶۵۴۳',
      nationalId: '۰۰۱۲۳۴۵۶۷۸',
      dentistId: 'doc-1',
      dentistName: 'دکتر کاویانی',
      branchId: 'br-1',
      date: '۱۴۰۵/۰۵/۱۸',
      timeSlot: '۱۰:۱۵ - ۱۱:۰۰',
      reason: 'ترمیم کامپوزیت عمیق دندان ۳۶',
      status: 'scheduled',
      isFirstVisit: false,
      visitFeePaid: true,
      checkInFormCompleted: true,
      receptionNoteToDoctor: 'عکس RVG جدید گرفته شد و در پرونده ثبت گردید.',
      createdAt: '۰۸:۰۰',
    },
    {
      id: 'apt-3',
      patientId: 'p-8841',
      patientName: 'مریم حسینی',
      patientPhone: '۰۹۱۸۵۵۵۴۴۳۳',
      nationalId: '۰۰۹۸۷۶۵۴۳۲',
      dentistId: 'doc-1',
      dentistName: 'دکتر کاویانی',
      branchId: 'br-1',
      date: '۱۴۰۵/۰۵/۱۸',
      timeSlot: '۱۱:۰۰ - ۱۱:۴۵',
      reason: 'تحویل روکش زیرکونیوم دندان ۲۱',
      status: 'scheduled',
      isFirstVisit: false,
      visitFeePaid: true,
      checkInFormCompleted: true,
      createdAt: '۰۸:۳۰',
    },
    {
      id: 'apt-4',
      patientId: 'p-9102',
      patientName: 'سارا امیری',
      patientPhone: '۰۹۱۲۴۴۴۳۳۲۲',
      nationalId: '۰۰۳۳۴۴۵۵۶۶',
      dentistId: 'doc-1',
      dentistName: 'دکتر کاویانی',
      branchId: 'br-1',
      date: '۱۴۰۵/۰۵/۱۸',
      timeSlot: '۱۴:۱۵ - ۱۵:۰۰',
      reason: 'معاینه اولیه و عکس‌برداری فک',
      status: 'checked_in',
      isFirstVisit: true,
      visitFeePaid: true,
      checkInFormCompleted: true,
      receptionNoteToDoctor: 'فرم رضایت‌نامه WORM توسط بیمار امضا شد.',
      createdAt: '۰۹:۰۰',
    },
  ]);

  const handleAddAppointment = (newApt: Appointment) => {
    setAppointmentsList((prev) => [newApt, ...prev]);
  };

  const handleUpdateAppointmentStatus = (aptId: string, newStatus: Appointment['status']) => {
    setAppointmentsList((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a))
    );
  };

  // Handle Tooth FDI Update
  const handleToothUpdate = (fdi: number, updatedDetail: ToothDetail) => {
    const updatedMap = {
      ...activePatient.teethMap,
      [fdi]: updatedDetail,
    };
    onUpdatePatientTeeth(updatedMap);
  };

  // Step 2: Voice Dictation & Auto-AI Proposal Generation upon completion
  const handleToggleRecording = () => {
    if (isRecording) {
      // User turned off recording -> Automatically trigger AI proposal extraction!
      setIsRecording(false);
      handleAnalyzeDictation();
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  const handleAnalyzeDictation = () => {
    setIsAnalyzingDictation(true);
    setTimeout(() => {
      setProposedTreatmentPlan(
        `۱. درمان ریشه (RCT) دندان ${selectedToothFdi || 16} - عصب‌کشی کانال‌ها\n۲. ترمیم کامپوزیت عمیق ۳ سطحی (MOD)\n۳. اندازه گیری قالب روکش زيرکونيا`
      );
      setProposedPrescription([
        'کپسول آموکسی‌سیلین ۵۰۰ میلی‌گرم - هر ۸ ساعت ۱ عدد',
        'قرص مفنامیک اسید ۲۵۰ - هر ۶ ساعت هنگام درد',
      ]);
      setInsuranceNarrative(
        `پوسیدگی عمیق کلاس ۲ دندان ${selectedToothFdi || 16} منجر به درگیری پالپ شده و درمان عصب‌کشی کامل و ترمیم به همراه شواهد RVG الزامی می‌باشد.`
      );
      setIsAnalyzingDictation(false);
      setAiProposalAutoGenerated(true);
    }, 800);
  };

  // Step 3: Ask Gemini AI Copilot (Interactive Chat Thread)
  const handleAskCopilot = (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuestion || copilotQuestion;
    if (!queryText.trim()) return;

    const currentTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const doctorMsg: CopilotChatMessage = {
      id: `c-doc-${Date.now()}`,
      sender: 'doctor',
      text: queryText,
      time: currentTime,
    };

    setCopilotChatHistory((prev) => [...prev, doctorMsg]);
    if (!customQuestion) setCopilotQuestion('');
    setIsLoadingCopilot(true);

    setTimeout(() => {
      const aiReplyText = `پاسخ هوش مصنوعی دنتورا برای بیمار ${activePatient.fullName}:\nدر خصوص پرسش مطرح شده: «${queryText}»، با توجه به بررسی پرونده UDR بیمار و عدم ثبت حساسیت‌های دارویی، پروتکل استاندارد شامل استفاده از بی‌حسی لیدوکایین ۲٪ با اپی‌نفرین ۱:۱۰۰.۰۰۰ بدون تداخل دارویی بوده و دوز درمانی استاندارد توصیه می‌گردد.`;
      const aiMsg: CopilotChatMessage = {
        id: `c-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      setCopilotChatHistory((prev) => [...prev, aiMsg]);
      setIsLoadingCopilot(false);
    }, 800);
  };

  // Step 4: Save Next Visit Date & Notify Receptionist
  const handleSaveNextVisit = () => {
    if (!nextVisitDate) {
      alert('لطفاً تاریخ پیشنهادی جلسه بعدی را مشخص نمایید.');
      return;
    }
    setFollowupSentToReception(true);
    if (onAddDoctorReminder) {
      onAddDoctorReminder({
        patientName: activePatient.fullName,
        patientPhone: activePatient.phone,
        doctorName: currentClinic?.name ? `دکتر معالج (${currentClinic.name})` : 'دکتر معالج',
        reason: `پیگیری درمان دندان ${selectedToothFdi || 16}: ${proposedTreatmentPlan.split('\n')[0] || 'جلسه بعدی درمان'}`,
        suggestedDate: nextVisitDate,
      });
    }
    alert(`درخواست نوبت بعدی برای تاریخ ${nextVisitDate} با موفقیت در بخش یادآوری‌های منشی ثبت شد.`);
  };

  // Step 7: Final Submit Record to Receptionist Panel
  const handleSubmitToReception = () => {
    setIsSubmittedToReception(true);

    if (onFinishTreatment) {
      const baseShare = Math.round(treatmentCostTotal * 0.3); // 30% base insurance share
      const supplShare = (insuranceModuleActive && activePatient.supplementaryInsurance) ? Math.round(treatmentCostTotal * 0.4) : 0; // 40% suppl share
      
      onFinishTreatment({
        patientId: activePatient.id,
        patientName: activePatient.fullName,
        treatmentPlan: proposedTreatmentPlan,
        totalCost: treatmentCostTotal,
        baseCovered: baseShare,
        supplCovered: supplShare,
        prescription: proposedPrescription,
        clinicalNotes: insuranceNarrative || clinicalNotes,
        toothFdi: selectedToothFdi || 16,
        nextVisitDate: nextVisitDate || undefined,
      });
    }
  };

  // External Imaging Pause Action
  const handlePauseTreatmentForExternalImaging = () => {
    setIsTreatmentPausedCurrent(true);
    const newPaused = {
      id: `PAUSE-${Math.floor(100 + Math.random() * 900)}`,
      patientName: activePatient.fullName,
      udrCode: activePatient.udrCode,
      date: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      reason: 'توقف درمان جهت مراجعه به مرکز تصویربرداری بیرونی و ارایه لینک/تصاویر',
      stepToResume: 4 as WorkbenchStep,
    };
    setPausedTreatments([newPaused, ...pausedTreatments]);
  };

  const handleResumeTreatment = (id: string) => {
    setPausedTreatments(pausedTreatments.filter((p) => p.id !== id));
    setIsTreatmentPausedCurrent(false);
    setWorkbenchStep(4);
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: 'clinical_workbench', label: 'میز کار بالینی (۷ مرحله)', icon: Stethoscope, badge: 'مرحله ۱۲.۲' },
    { id: 'patient_records', label: 'پرونده بیماران', icon: FolderOpen, badge: 'UDR' },
    { id: 'patient_comm', label: 'ارتباط با بیماران', icon: MessageSquare, badge: 'پیام‌ها' },
    { id: 'my_schedule', label: 'برنامه زمانی من', icon: Calendar, badge: 'تقویم' },
    { id: 'lab_section', label: 'بخش لابراتوار', icon: FlaskConical, badge: 'مرحله ۱۲.۳' },
    { id: 'patient_qa', label: 'میز پرسش‌های بیماران', icon: HelpCircle, badge: 'مشاوره' },
    ...(isOwner
      ? [{ id: 'owner_settings', label: 'تنظیمات مالک کلینیک', icon: Crown, badge: 'Owner' }]
      : []),
  ];

  // Calculate Cash Splits for Contracted Dentist
  const dentistShareAmount = Math.round((treatmentCostTotal * dentistCommissionRate) / 100);
  const centerShareAmount = treatmentCostTotal - dentistShareAmount;

  // Step metadata for sequential flow
  const stepsList = [
    { key: 1, title: '۱. پیشینه و پیام منشی', subtitle: 'اطلاعات اولیه و یادداشت پذیرش' },
    { key: 2, title: '۲. دیکته صوتی و طرح درمان', subtitle: 'دیکته صوتی، قلم نوری و استخراج خودکار AI' },
    { key: 3, title: '۳. اودنتوگرام و مشاوره AI', subtitle: 'ثبت ۶ سطح دندان و چت با Copilot' },
    { key: 4, title: '۴. رادیوگرافی و تصویربرداری', subtitle: 'Web-PACS، علامت‌گذاری هوشمند و ارجاع' },
    { key: 5, title: '۵. نسخه و زمان مراجعه بعدی', subtitle: 'تنظیم نسخه دارویی و ارسال پیگیری به منشی' },
    { key: 6, title: '۶. بازبینی پرونده و مالی', subtitle: 'بررسی کل و سهم نقدی دندان‌پزشک' },
    { key: 7, title: '۷. شرح بیمه و ارسال به منشی', subtitle: 'تأیید نهایی و ارسال کامل پرونده به منشی' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Right Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4 order-first">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 sticky top-[80px]">
          <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-2">
            <h3 className="text-xs font-black text-[#005581] dark:text-[#72cdf4] flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#005581]" />
              <span>میز کار دندان‌پزشک</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">سیستم جامع بالینی دنتورا</p>
          </div>

          {menuItems.map((item) => {
            const isActive = activeNavTab === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNavTab(item.id as DentistNavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#005581] text-white shadow-md shadow-[#005581]/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-[#ffd200] text-[#005581]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* 1. CLINICAL WORKBENCH (میز کار بالینی - ۷ مرحله گام‌به‌گام) */}
        {activeNavTab === 'clinical_workbench' && (
          <div className="space-y-4">
            {/* Connected Patient Top Banner & Next Patient Trigger */}
            <div className="bg-[#005581] text-white rounded-2xl p-4 shadow-md border border-[#005581] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black text-xl shadow">
                  {activePatient.fullName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#ffd200] text-[#005581] font-mono font-bold">
                      {activePatient.udrCode}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      متصل شده توسط منشی
                    </span>
                    {appointment.receptionNoteToDoctor && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30 flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3 h-3 text-amber-300" />
                        یادداشت منشی: {appointment.receptionNoteToDoctor}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black mt-1 text-white flex items-center gap-2">
                    <span>{activePatient.fullName}</span>
                    <span className="text-xs font-normal text-[#72cdf4]">
                      ({activePatient.age} ساله · کد ملی: {activePatient.nationalId})
                    </span>
                  </h2>
                  <div className="text-xs text-[#72cdf4] flex flex-wrap gap-3 mt-1">
                    <span>علت مراجعه: <strong className="text-white">{appointment.reason}</strong></span>
                    <span>بیمه اولیه: <strong className="text-white">{activePatient.primaryInsurance.provider}</strong></span>
                    {insuranceModuleActive && activePatient.supplementaryInsurance && (
                      <span className="text-[#ffe552]">
                        بیمه تکمیلی: <strong>{activePatient.supplementaryInsurance.provider}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Queue Switcher & Next Patient Trigger */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                {allPatients.length > 0 && onSelectPatientId && (
                  <select
                    value={activePatient.id}
                    onChange={(e) => {
                      onSelectPatientId(e.target.value);
                      setIsSubmittedToReception(false);
                      setWorkbenchStep(1);
                      setIsTreatmentPausedCurrent(false);
                    }}
                    className="bg-[#003858] text-[#fffffa] text-xs font-bold px-3 py-2.5 rounded-xl border border-[#72cdf4]/40 shadow-xs cursor-pointer outline-none hover:bg-[#00304c] transition"
                  >
                    {allPatients.map((p) => {
                      const apt = appointments.find((a) => a.patientId === p.id);
                      const statusLabel = apt?.status === 'in_unit' ? ' (روی یونیت)' : apt?.status === 'waiting' ? ' (در انتظار)' : '';
                      return (
                        <option key={p.id} value={p.id}>
                          بیمار: {p.fullName} {statusLabel}
                        </option>
                      );
                    })}
                  </select>
                )}

                <button
                  onClick={() => {
                    onNextPatient();
                    setIsSubmittedToReception(false);
                    setWorkbenchStep(1);
                    setIsTreatmentPausedCurrent(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-black text-xs shadow-md transition cursor-pointer"
                >
                  <span>بیمار بعدی در صف</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Paused Treatments Notification Bar (اگر درمان‌های نیمه‌رهاشده جهت مرکز بیرونی وجود داشته باشد) */}
            {pausedTreatments.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <PauseCircle className="w-5 h-5 text-amber-600 animate-pulse" />
                    <span>لیست درمان‌های نیمه‌رهاشده (معلق برای دریافت تصاویر مرکز بیرونی):</span>
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    {pausedTreatments.length} مورد معلق
                  </span>
                </div>
                <div className="space-y-1.5">
                  {pausedTreatments.map((pt) => (
                    <div
                      key={pt.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {pt.patientName} ({pt.udrCode})
                        </span>
                        <span className="text-slate-500 text-[11px]">- {pt.reason}</span>
                      </div>
                      <button
                        onClick={() => handleResumeTreatment(pt.id)}
                        className="px-3 py-1 bg-[#005581] hover:bg-[#004266] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-[#ffd200]" />
                        <span>بازگشت و ادامه درمان</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sequential Step Progress Tracker (استپر مراحل بالینی) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-xs text-[#005581] dark:text-[#72cdf4] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#005581]" />
                  <span>مراحل ۷ گانه جریان معاینه و درمان بالینی</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  مرحله فعلی: {stepsList.find((s) => s.key === workbenchStep)?.title}
                </span>
              </div>

              {/* Horizontal Stepper Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center">
                {stepsList.map((stepItem) => {
                  const isCurrent = workbenchStep === stepItem.key;
                  return (
                    <button
                      key={String(stepItem.key)}
                      onClick={() => setWorkbenchStep(stepItem.key as WorkbenchStep)}
                      className={`p-2 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-between gap-1 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md ring-2 ring-[#ffd200]'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#005581]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isCurrent ? 'bg-[#ffd200] text-[#005581]' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {stepItem.key}
                      </span>
                      <span className="line-clamp-1 text-[10px]">{stepItem.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: پیشینه و پیام منشی */}
            {workbenchStep === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-[#005581]" />
                      <span>مرحله ۱: پیشینه بیمار و پیام منشی</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      بررسی اطلاعات اولیه بیمار، پیام ارسال‌شده توسط پذیرش و پرونده پزشکی قبلی
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#005581] text-white font-bold text-xs rounded-lg">گام ۱ از ۷</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Patient Info Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#005581]" />
                      <span>مشخصات بیمار:</span>
                    </h4>
                    <div className="space-y-1 text-slate-700 dark:text-slate-300">
                      <div>نام کامل: <strong className="text-slate-900 dark:text-slate-100">{activePatient.fullName}</strong></div>
                      <div>شناسه طولی UDR: <strong className="font-mono text-[#005581]">{activePatient.udrCode}</strong></div>
                      <div>کد ملی: <strong className="font-mono">{activePatient.nationalId}</strong></div>
                      <div>سن: <strong>{activePatient.age} سال</strong></div>
                      <div>بیمه اصلی: <strong>{activePatient.primaryInsurance.provider}</strong></div>
                      <div>بیمه تکمیلی: <strong>{activePatient.supplementaryInsurance?.provider || 'ندارد'}</strong></div>
                      <div>حساسیت‌های دارویی: <strong className="text-rose-600">{activePatient.allergies.join(', ') || 'هیچ مواردی ثبت نشده'}</strong></div>
                    </div>
                  </div>

                  {/* Secretary Note Card */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 space-y-2">
                    <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                      <span>پیام و یادداشت پذیرش/منشی به پزشک:</span>
                    </h4>
                    <p className="text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
                      {appointment.receptionNoteToDoctor ||
                        'بیمار توسط منشی به سیستم پزشک متصل شد. بیمار علائم درد شدید در ناحیه دندان ۱۶ دارد و فرم رضایت اولیه الکترونیک را امضا نموده است.'}
                    </p>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWorkbenchStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    <span>ادامه به مرحله ۲: دیکته صوتی و طرح درمان</span>
                    <ArrowLeft className="w-4 h-4 text-[#ffd200]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: دیکته صوتی، قلم نوری و طرح درمان (بدون تصویربرداری) */}
            {workbenchStep === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Mic className="w-5 h-5 text-[#005581]" />
                      <span>مرحله ۲: معاینه، دیکته صوتی فارسی و استخراج خودکار طرح درمان</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      دیکته صوتی هوش مصنوعی فارسی و قلم نوری با استخراج فوری طرح درمان و نسخه پیشنهادی
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#005581] text-white font-bold text-xs rounded-lg">گام ۲ از ۷</span>
                </div>

                {/* Dictation Box */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#005581]" />
                      <span>شرح معاینه و دیکته فارسی پزشک:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOpticalPenActive(!opticalPenActive)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          opticalPenActive
                            ? 'bg-[#005581] text-white border-[#005581]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{opticalPenActive ? 'ورود قلم نوری فعال' : 'فعال‌سازی قلم نوری'}</span>
                      </button>

                      <button
                        onClick={handleToggleRecording}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
                          isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#005581] text-white hover:bg-[#004266]'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-[#ffd200]" />}
                        <span>{isRecording ? 'اتمام ضبط و استخراج خودکار AI' : 'شروع دیکته صوتی به AI'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      rows={3}
                      value={dictationText}
                      onChange={(e) => setDictationText(e.target.value)}
                      placeholder="متن معاینه را دیکته کنید یا با قلم نوری بنویسید..."
                      className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#005581]"
                    ></textarea>
                    <button
                      onClick={handleAnalyzeDictation}
                      disabled={isAnalyzingDictation}
                      className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow flex flex-col items-center justify-center gap-1 min-w-[140px] cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#ffd200]" />
                      <span>{isAnalyzingDictation ? 'در حال استخراج...' : 'بازاستخراج دستی AI'}</span>
                    </button>
                  </div>

                  {/* Automatic AI Extraction Status & Proposal Preview */}
                  {(isAnalyzingDictation || aiProposalAutoGenerated) && (
                    <div className="p-3.5 rounded-2xl bg-[#005581]/5 border border-[#005581]/20 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold text-[#005581] dark:text-[#72cdf4]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#005581] animate-spin" />
                          <span>طرح درمان و نسخه استخراج‌شده توسط AI:</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> استخراج موفق
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                            طرح درمان استخراج‌شده:
                          </strong>
                          <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                            {proposedTreatmentPlan}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                            نسخه دارویی پیشنهادی:
                          </strong>
                          <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                            {proposedPrescription.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWorkbenchStep(1)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی (پیشینه بیمار)</span>
                  </button>
                  <button
                    onClick={() => setWorkbenchStep(3)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    <span>ادامه به مرحله ۳: اودنتوگرام و مشاوره AI</span>
                    <ArrowLeft className="w-4 h-4 text-[#ffd200]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: اودنتوگرام و شرح AI */}
            {workbenchStep === 3 && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-[#005581]" />
                        <span>مرحله ۳: ثبت وضعیت دندان‌ها روی اودنتوگرام (۶ بخش هر دندان)</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        کلیک روی سطوح مزیال، دیستال، باکال، لینگوال، مایل و انسیزال/اکلوزال جهت اعمال درمان
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#005581] text-white font-bold text-xs rounded-lg">گام ۳ از ۷</span>
                  </div>

                  <Odontogram
                    teethMap={activePatient.teethMap}
                    onToothUpdate={handleToothUpdate}
                    selectedToothFdi={selectedToothFdi}
                    onSelectTooth={(fdi) => setSelectedToothFdi(fdi)}
                  />
                </div>

                {/* Gemini AI Copilot Scrollable Chat Thread */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#005581]" />
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        مشاوره بالینی و گفتگو با هوش مصنوعی AI Copilot:
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#005581]/10 text-[#005581] font-bold">
                      تاریخچه پیام‌ها و اسکرول تعاملی
                    </span>
                  </div>

                  {/* Scrollable Messages Thread */}
                  <div className="max-h-[300px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    {copilotChatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${
                          msg.sender === 'doctor' ? 'mr-auto flex-row-reverse' : 'ml-auto'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                            msg.sender === 'doctor'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-[#005581] text-[#ffd200]'
                          }`}
                        >
                          {msg.sender === 'doctor' ? 'پزشک' : <Sparkles className="w-3.5 h-3.5" />}
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed space-y-1 shadow-xs ${
                            msg.sender === 'doctor'
                              ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                              : 'bg-[#005581] text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1 text-[10px] opacity-80">
                            <span className="font-bold">{msg.sender === 'doctor' ? 'سوال پزشک' : 'پاسخ هوش مصنوعی دنتورا'}</span>
                            <span className="font-mono">{msg.time}</span>
                          </div>
                          <p className="whitespace-pre-line font-medium">{msg.text}</p>
                        </div>
                      </div>
                    ))}

                    {isLoadingCopilot && (
                      <div className="flex items-center gap-2 text-xs text-[#005581] dark:text-[#72cdf4] font-bold p-2">
                        <Sparkles className="w-4 h-4 animate-spin text-[#005581]" />
                        <span>هوش مصنوعی در حال بررسی پرونده و پاسخ‌دهی...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Clinical Query Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-slate-400 text-[10px] font-bold shrink-0">پرسش‌های سریع:</span>
                    <button
                      onClick={() => handleAskCopilot(undefined, 'آیا لیدوکایین با داروهای فشار خون بیمار تداخل دارد؟')}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#005581]/10 text-slate-700 dark:text-slate-300 rounded-lg shrink-0 cursor-pointer font-medium border border-slate-200 dark:border-slate-700"
                    >
                      + تداخل لیدوکایین با داروهای بیمار
                    </button>
                    <button
                      onClick={() => handleAskCopilot(undefined, 'دوز پیشنهادی آموکسی‌سیلین پس از RCT چقدر است؟')}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#005581]/10 text-slate-700 dark:text-slate-300 rounded-lg shrink-0 cursor-pointer font-medium border border-slate-200 dark:border-slate-700"
                    >
                      + دوز آموکسی‌سیلین بعد از RCT
                    </button>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={(e) => handleAskCopilot(e)} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="سوال درباره تداخل دارویی، دوز تجویزی یا پروتکل جراحی..."
                      value={copilotQuestion}
                      onChange={(e) => setCopilotQuestion(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#005581]"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingCopilot}
                      className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <SendHorizontal className="w-3.5 h-3.5 text-[#ffd200]" />
                      <span>{isLoadingCopilot ? 'پاسخ...' : 'ارسال'}</span>
                    </button>
                  </form>
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setWorkbenchStep(2)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی (دیکته صوتی)</span>
                  </button>

                  <button
                    onClick={() => setWorkbenchStep(4)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    <span>ادامه به مرحله ۴: رادیوگرافی و تصویربرداری</span>
                    <ArrowLeft className="w-4 h-4 text-[#ffd200]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: رادیوگرافی و تصویربرداری بالینی (محل انحصاری Web-PACS و ارجاع) */}
            {workbenchStep === 4 && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                        <Camera className="w-5 h-5 text-[#005581]" />
                        <span>مرحله ۴: رادیوگرافی و تصویربرداری بالینی (Web-PACS)</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        بررسی گرافی‌های دندانی، علامت‌گذاری هوشمند روی عکس، مدیریت یادداشت‌ها و ارجاع به مرکز بیرونی
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#005581] text-white font-bold text-xs rounded-lg">گام ۴ از ۷</span>
                  </div>
                </div>

                {/* Web-PACS Image Viewer with On-Image Markers, Visible Text & Interactive Edit Popover */}
                <ImageXrayViewer
                  patientName={activePatient.fullName}
                  toothFdi={selectedToothFdi || 16}
                  onRevisionTreatmentPlan={() => {
                    setProposedTreatmentPlan((prev) => `${prev}\n۴. نیاز به روکش پس از بررسی گرافی`);
                    alert('طرح درمان با توجه به علائم گرافی به‌روزرسانی شد.');
                  }}
                  onSaveToDossier={(summary) => {
                    setDictationText((prev) => `${prev ? prev + '\n' : ''}[یافته‌های تصویربرداری PACS]:\n${summary}`);
                  }}
                />

                {/* External Imaging Center Referral & Pause Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <PauseCircle className="w-4 h-4 text-amber-500" />
                      <span>ارجاع به مرکز تصویربرداری بیرونی (خارج مطب):</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      اگر بیمار برای تصویربرداری به مرکز بیرونی ارجاع می‌شود، درمان را متوقف و ذخیره کنید تا پس از بازگشت بیمار در همین مرحله ادامه یابد.
                    </p>
                  </div>

                  <button
                    onClick={handlePauseTreatmentForExternalImaging}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer transition"
                  >
                    <PauseCircle className="w-4 h-4 text-white" />
                    <span>توقف میان‌درمان و ذخیره جهت بازگشت بعدی بیمار</span>
                  </button>
                </div>

                {/* Paused list notice if any */}
                {pausedTreatments.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="text-amber-900 dark:text-amber-200">
                      <strong>درمان‌های متوقف‌شده جهت تصویربرداری بیرونی:</strong> {pausedTreatments.length} مورد در جریان است.
                    </div>
                    <div className="flex gap-2">
                      {pausedTreatments.map((pt) => (
                        <button
                          key={pt.id}
                          onClick={() => handleResumeTreatment(pt.id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          ادامه درمان {pt.patientName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setWorkbenchStep(3)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی (اودنتوگرام)</span>
                  </button>

                  <button
                    onClick={() => setWorkbenchStep(5)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    <span>ادامه به مرحله ۵: نسخه و زمان مراجعه بعدی</span>
                    <ArrowLeft className="w-4 h-4 text-[#ffd200]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: نسخه و نوبت بعدی */}
            {workbenchStep === 5 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#005581]" />
                      <span>مرحله ۵: تنظیم نسخه دارویی، نوت و زمان مراجعه بعدی</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      ویرایش نسخه پیشنهادی دارویی، ثبت یادداشت بالینی و ارسال پیام زمان مراجعه به منشی
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#005581] text-white font-bold text-xs rounded-lg">گام ۵ از ۷</span>
                </div>

                {/* Editable Prescription List */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#005581]" />
                      <span>نسخه دارویی (قابل ویرایش):</span>
                    </h4>
                    <button
                      onClick={() => setProposedPrescription([...proposedPrescription, 'داروی جدید'])}
                      className="text-[11px] text-[#005581] font-bold underline cursor-pointer"
                    >
                      + افزودن داروی جدید
                    </button>
                  </div>

                  <div className="space-y-2">
                    {proposedPrescription.map((rx, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rx}
                          onChange={(e) => {
                            const updated = [...proposedPrescription];
                            updated[idx] = e.target.value;
                            setProposedPrescription(updated);
                          }}
                          className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                        <button
                          onClick={() => setProposedPrescription(proposedPrescription.filter((_, i) => i !== idx))}
                          className="text-rose-500 font-bold text-xs px-2 cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Note & Next Visit Date */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">یادداشت بالینی و ثبت زمان مراجعه بعدی:</h4>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="یادداشت بالینی دندان‌پزشک..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  ></textarea>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={nextVisitDate}
                      onChange={(e) => setNextVisitDate(e.target.value)}
                      placeholder="زمان تقریبی مراجعه بعدی (اختیاری)..."
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                    <button
                      onClick={handleSaveNextVisit}
                      className="px-4 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
                    >
                      ثبت زمان و ارسال پیام پیگیری به منشی
                    </button>
                  </div>

                  {followupSentToReception && (
                    <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>پیام پیگیری زمان مراجعه بعدی به صورت خودکار برای منشی ارسال گردید.</span>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWorkbenchStep(4)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی (تصویربرداری)</span>
                  </button>
                  <button
                    onClick={() => setWorkbenchStep(6)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    <span>ادامه به مرحله ۶: بازبینی پرونده و محاسبه مالی</span>
                    <ArrowLeft className="w-4 h-4 text-[#ffd200]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: بازبینی پرونده و محاسبه سهم نقدی */}
            {workbenchStep === 6 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#005581]" />
                      <span>مرحله ۶: بازبینی پرونده بالینی و سهم نقدی دندان‌پزشک</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      محاسبه تفکیکی سهم مرکز / دندان‌پزشک بر اساس درصد تعیین‌شده مدیر کلینیک
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#005581] text-white font-bold text-xs rounded-lg">گام ۶ از ۷</span>
                </div>

                {/* Case Summary Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">خلاصه پرونده درمانی:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                    <div>طرح درمان: <strong>{proposedTreatmentPlan.replace(/\n/g, ' - ')}</strong></div>
                    <div>نسخه دارویی: <strong>{proposedPrescription.join(' ، ')}</strong></div>
                  </div>
                </div>

                {/* Contracted Dentist Cash Breakdown */}
                <div className="p-4 rounded-xl bg-[#005581]/5 border border-[#005581]/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#005581] dark:text-[#72cdf4] flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-[#ffd200]" />
                      <span>محاسبه سهم نقدی دندان‌پزشک قراردادی:</span>
                    </h4>
                    <span className="text-xs px-2.5 py-1 rounded bg-[#005581] text-white font-mono font-bold">
                      درصد مدیر: {dentistCommissionRate}٪ پزشک / {100 - dentistCommissionRate}٪ کلینیک
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 text-[11px]">مبلغ کل خدمات درمان:</div>
                      <div className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                        {treatmentCostTotal.toLocaleString()} تومان
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                      <div className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                        سهم نقدی دندان‌پزشک ({dentistCommissionRate}٪):
                      </div>
                      <div className="text-base font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
                        {dentistShareAmount.toLocaleString()} تومان
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                        سهم مرکز / کلینیک ({100 - dentistCommissionRate}٪):
                      </div>
                      <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">
                        {centerShareAmount.toLocaleString()} تومان
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWorkbenchStep(5)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی (نسخه و نوبت بعدی)</span>
                  </button>
                  <button
                    onClick={() => setWorkbenchStep(7)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    <span>ادامه به مرحله ۷: شرح بیمه و ارسال نهایی</span>
                    <ArrowLeft className="w-4 h-4 text-[#ffd200]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: شرح بیمه و ارسال نهایی به منشی */}
            {workbenchStep === 7 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <SendHorizontal className="w-5 h-5 text-[#005581]" />
                      <span>مرحله ۷: شرح بیمه و ارسال نهایی پرونده به پنل منشی</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      بررسی و تأیید نهایی متن شرح خدمات برای تاییدیه بیمه پایه/تکمیلی و ارسال همزمان پرونده به پذیرش
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg">مرحله پایانی (گام ۷ از ۷)</span>
                </div>

                {/* AI Insurance Narrative Editor */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>شرح بیمه پیشنهادی هوش مصنوعی (قابل ویرایش/تأیید پزشک):</span>
                    </h4>
                    <button
                      onClick={() => {
                        setIsGeneratingNarrative(true);
                        setTimeout(() => {
                          setInsuranceNarrative(
                            `شرح بیمه اصلاحی: به علت درگیری عمیق پالپ دندان ${selectedToothFdi || 16}، درمان ریشه ۲ کاناله به همراه ترمیم کامپوزیت انجام شد.`
                          );
                          setIsGeneratingNarrative(false);
                        }, 600);
                      }}
                      className="text-[11px] font-bold text-[#005581] underline cursor-pointer"
                    >
                      {isGeneratingNarrative ? 'تولید مجدد...' : 'تولید مجدد با AI'}
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={insuranceNarrative}
                    onChange={(e) => setInsuranceNarrative(e.target.value)}
                    className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#005581]"
                  ></textarea>
                </div>

                {/* Full Review Checklist */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">چک‌لیست اقلام آماده ارسال به منشی:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>۱. طرح درمان پیشنهادی و نوت بالینی آماده ارسال است.</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>۲. نسخه دارویی تجویزی ثبت و تایید گردید.</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>۳. شرح رسمی بیمه توسط پزشک بازبینی و آماده تایید شد.</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>۴. سهم نقدی دندان‌پزشک ({dentistShareAmount.toLocaleString()} تومان) محاسبه گردید.</span>
                    </div>
                  </div>
                </div>

                {/* Primary Final Submission Action */}
                {!isSubmittedToReception ? (
                  <div className="p-5 rounded-2xl bg-[#005581]/10 border border-[#005581]/30 flex flex-col items-center justify-center text-center space-y-3">
                    <SendHorizontal className="w-10 h-10 text-[#005581] animate-bounce" />
                    <div>
                      <h4 className="font-bold text-[#005581] text-base">آماده ارسال کامل پرونده به منشی</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mt-1">
                        با کلیک بر دکمه زیر، پرونده کامل برای پذیرش ارسال شده و وضعیت بیمار جهت تسویه آپدیت می‌گردد.
                      </p>
                    </div>
                    <button
                      onClick={handleSubmitToReception}
                      className="px-6 py-3 bg-[#005581] hover:bg-[#004266] text-white font-black text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <SendHorizontal className="w-5 h-5 text-[#ffd200]" />
                      <span>ارسال پرونده کامل (نسخه + طرح درمان + شرح بیمه) به منشی</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 text-emerald-900 dark:text-emerald-100 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-base">پرونده با موفقیت برای پنل منشی ارسال شد!</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                        نسخه، طرح درمان و شرح بیمه بیمار {activePatient.fullName} در اختیار پذیرش قرار گرفت.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onNextPatient();
                        setIsSubmittedToReception(false);
                        setWorkbenchStep(1);
                      }}
                      className="px-6 py-2.5 bg-[#ffd200] text-[#005581] font-black text-xs rounded-xl shadow hover:bg-[#ffe552] cursor-pointer"
                    >
                      فراخوان و پذیرش بیمار بعدی در صف
                    </button>
                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="flex justify-start pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWorkbenchStep(6)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبلی (بازبینی پرونده و مالی)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Patient Records (پرونده بیماران) */}
        {activeNavTab === 'patient_records' && (
          <PatientRecordsView
            patients={patientsList}
            onUpdatePatient={handleUpdatePatientInList}
            onSelectPatientToExamine={() => {
              setActiveNavTab('clinical_workbench');
              setWorkbenchStep(1);
            }}
          />
        )}

        {/* 3. Patient Communication (ارتباط با بیماران) */}
        {activeNavTab === 'patient_comm' && (
          <PatientCommView
            patients={patientsList}
            onOpenPatientRecord={() => setActiveNavTab('patient_records')}
          />
        )}

        {/* 4. My Schedule (برنامه زمانی من - تعیین تایم‌های آزاد دندان‌پزشک جهت نوبت‌دهی منشی) */}
        {activeNavTab === 'my_schedule' && (
          <DoctorCalendarView
            appointments={appointmentsList}
            patients={patientsList}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onSelectPatientToExamine={() => {
              setActiveNavTab('clinical_workbench');
              setWorkbenchStep(1);
            }}
          />
        )}

        {/* 5. Lab Section (بخش لابراتوار) */}
        {activeNavTab === 'lab_section' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#005581] dark:text-[#72cdf4] text-base flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-[#005581]" />
                  <span>مدیریت سفارشات لابراتوار و مراحل ساخت شفاف (مرحله ۱۲.۳)</span>
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {labOrders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      کد {ord.id} - بیمار {ord.patient} ({ord.type})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#ffd200] text-[#005581] font-bold text-[10px]">
                      {ord.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ord.stages.map((stg, i) => (
                      <div key={i} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 text-[11px] font-bold">
                        {i + 1}. {stg.name} {stg.done ? <Check className="w-3.5 h-3.5 text-emerald-600 inline-block mr-1" /> : ''}
                        {stg.delayReason && <span className="block text-amber-600 text-[10px]">علت تأخیر: {stg.delayReason}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Patient Q&A (میز پرسش‌های بیماران و ثبت پاسخ دندان‌پزشک) */}
        {activeNavTab === 'patient_qa' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#005581] dark:text-[#72cdf4] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#005581]" />
                  <span>میز پرسش‌های بیماران و ثبت پاسخ تخصصی دندان‌پزشک</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  پاسخ‌دهی به پرسش‌های آنلاین بیماران همراه با پیشنهاد هوش مصنوعی و ثبت رسمی در پرونده
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setQaFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    qaFilter === 'all'
                      ? 'bg-[#005581] text-white shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
                  }`}
                >
                  همه سوالات ({qaItems.length})
                </button>
                <button
                  onClick={() => setQaFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    qaFilter === 'pending'
                      ? 'bg-amber-500 text-slate-900 shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  در انتظار پاسخ ({qaItems.filter((i) => i.status === 'pending').length})
                </button>
                <button
                  onClick={() => setQaFilter('answered')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    qaFilter === 'answered'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                  }`}
                >
                  پاسخ‌داده‌شده ({qaItems.filter((i) => i.status === 'answered').length})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {qaItems
                .filter((item) => (qaFilter === 'all' ? true : item.status === qaFilter))
                .map((item) => {
                  const draftText = doctorAnswerDrafts[item.id] ?? (item.doctorAnswer || '');

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition space-y-4 ${
                        item.status === 'pending'
                          ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                            {item.patientName}
                          </span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                            {item.udr}
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#005581]/10 text-[#005581] dark:text-[#72cdf4] font-bold">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{item.time}</span>
                          {item.status === 'pending' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-900 font-bold text-[10px] shadow-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              در انتظار پاسخ پزشک
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] shadow-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              پاسخ داده شد
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 space-y-1">
                        <div className="text-[11px] font-bold text-slate-400">متن سوال بیمار:</div>
                        <p className="text-sm leading-relaxed">{item.question}</p>
                      </div>

                      {/* AI Suggestion Box */}
                      <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-[#005581] dark:text-cyan-300">
                            <Sparkles className="w-4 h-4 text-[#ffd200]" />
                            <span>پیشنهاد پیش‌نویس پاسخ توسط هوش مصنوعی (AI Draft):</span>
                          </div>
                          {item.status === 'pending' && (
                            <button
                              onClick={() =>
                                setDoctorAnswerDrafts((prev) => ({ ...prev, [item.id]: item.aiSuggestion }))
                              }
                              className="px-2.5 py-1 bg-[#005581] text-white rounded-lg text-[10px] font-bold shadow hover:bg-[#004266] cursor-pointer flex items-center gap-1"
                            >
                              <span>استفاده از متن AI</span>
                            </button>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                          {item.aiSuggestion}
                        </p>
                      </div>

                      {/* Doctor Answer Registration / Display Section */}
                      {item.status === 'answered' && item.doctorAnswer ? (
                        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
                          <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-bold border-b border-emerald-200 dark:border-emerald-800 pb-2">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              پاسخ رسمی ثبت‌شده توسط دندان‌پزشک:
                            </span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">
                              {item.answeredAt}
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                            {item.doctorAnswer}
                          </p>
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() =>
                                setQaItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, status: 'pending' } : i))
                                )
                              }
                              className="text-[11px] text-[#005581] dark:text-[#72cdf4] font-bold hover:underline cursor-pointer"
                            >
                              ویرایش و ثبت مجدد پاسخ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            تایپ پاسخ رسمی دندان‌پزشک به بیمار:
                          </label>
                          <textarea
                            rows={3}
                            value={draftText}
                            onChange={(e) =>
                              setDoctorAnswerDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            placeholder="متن پاسخ تخصصی دندان‌پزشک را اینجا تایپ کنید یا از پیشنهاد AI استفاده کنید..."
                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#005581]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSaveDoctorAnswer(item.id)}
                              disabled={!draftText.trim()}
                              className={`px-5 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer ${
                                draftText.trim()
                                  ? 'bg-[#005581] hover:bg-[#004266] text-white'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>ثبت و ارسال پاسخ رسمی دندان‌پزشک</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 7. OWNER SETTINGS (تنظیمات ویژه مالک) */}
        {activeNavTab === 'owner_settings' && (
          <div className="space-y-4">
            <OwnerWorkspace
            currentClinic={
              currentClinic || {
                id: 'cl-1',
                name: 'کلینیک تخصصی دندان‌پزشکی البرز',
                registrationCode: 'DNT-998822',
                ownerName: 'دکتر محمدرضا حسینی',
                ownerMobile: '09121112233',
                address: 'تهران، خیابان پاسداران، بوستان دوم، پلاک ۴۲',
                postalCode: '1945811223',
                phone: '021-22558800',
                establishedYear: '1398',
                totalChairs: 6,
                branchCount: 2,
                medicalLicenseNo: '104882',
              }
            }
              onUpdateClinicInfo={onUpdateClinicInfo}
              users={users}
              onAddEmployee={onAddEmployee || (() => {})}
              onDeleteEmployee={onDeleteEmployee || (() => {})}
              onUpdateUserRole={onUpdateUserRole || (() => {})}
              insuranceModuleActive={insuranceModuleActive}
              onToggleInsuranceModule={onToggleInsuranceModule || (() => {})}
              isInsuranceContracted={isInsuranceContracted}
              onToggleInsuranceContracted={onToggleInsuranceContracted || (() => {})}
              bnplActive={bnplActive}
              onToggleBnplActive={onToggleBnplActive || (() => {})}
              hasAccountantRole={hasAccountantRole}
              onToggleHasAccountantRole={onToggleHasAccountantRole || (() => {})}
              baseInsurances={baseInsurances}
              onToggleBaseInsuranceContracted={onToggleBaseInsuranceContracted || (() => {})}
              onUpdateBaseInsuranceFranchise={onUpdateBaseInsuranceFranchise || (() => {})}
              supplementaryInsurances={supplementaryInsurances}
              onToggleSupplementaryInsuranceContracted={
                onToggleSupplementaryInsuranceContracted || (() => {})
              }
              onToggleSupplementaryFastSettlement={
                onToggleSupplementaryFastSettlement || (() => {})
              }
              onUpdateSupplementaryMaxCoverage={
                onUpdateSupplementaryMaxCoverage || (() => {})
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
