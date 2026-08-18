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
  LabOrder,
  DentalLab,
  PatientQuestion,
  PatientImageRecord,
} from '../../types';
import { mockPatients } from '../../data/mockData';
import { Odontogram } from './Odontogram';
import { ImageXrayViewer } from './ImageXrayViewer';
import { DoctorCalendarView } from './DoctorCalendarView';
import { PatientRecordsView } from './PatientRecordsView';
import { OwnerWorkspace } from '../owner/OwnerWorkspace';
import { getStoredLabAccounts } from '../../services/authService';
import { getStoredLabs } from '../../services/clinicDataStore';
import { getClinicalProfileByReason } from '../../utils/clinicalReasonMapping';
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
  X,
  Loader2,
  ShieldCheck,
  CheckCheck,
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
    teethFdiList?: number[];
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
  onSavePatientImage?: (patientId: string, imageRecord: PatientImageRecord) => void;
  insuranceModuleActive?: boolean;
  initialTab?: DentistNavTab;
  currentUserName?: string;

  // Lab Orders & Cross-Panel Sync
  labOrders?: LabOrder[];
  onAddLabOrder?: (newOrder: LabOrder) => void;
  onUpdateLabOrderStatus?: (orderId: string, status: LabOrder['status'], milestone: string) => void;

  // Patient Q&A Cross-Panel Sync
  patientQuestions?: PatientQuestion[];
  onReplyQuestion?: (
    questionId: string,
    replyMessage: string,
    senderRole: 'receptionist' | 'dentist',
    senderName: string
  ) => void;

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
  onSavePatientImage,
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
  currentUserName,
  labOrders = [],
  onAddLabOrder,
  onUpdateLabOrderStatus,
  patientQuestions = [],
  onReplyQuestion,
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

  // Selected Tooth FDI & Reason Clinical Profile
  const initialProfile = React.useMemo(() => {
    return getClinicalProfileByReason(appointment.reason, activePatient, appointment);
  }, [appointment.reason, activePatient, appointment]);

  const [selectedToothFdi, setSelectedToothFdi] = useState<number | null>(initialProfile.defaultToothFdi);

  // Step 2: Dental ASR & Optical Pen Dictation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [dictationText, setDictationText] = useState(initialProfile.dictationSample);
  const [opticalPenActive, setOpticalPenActive] = useState(false);
  const [isAnalyzingDictation, setIsAnalyzingDictation] = useState(false);
  const [aiProposalAutoGenerated, setAiProposalAutoGenerated] = useState(false);

  // Proposed AI Treatment Plan & Prescription (Editable - Reason Driven)
  const [proposedTreatmentPlan, setProposedTreatmentPlan] = useState<string>(initialProfile.proposedTreatmentPlan);
  const [proposedPrescription, setProposedPrescription] = useState<string[]>(initialProfile.prescription);
  const [newPrescriptionInput, setNewPrescriptionInput] = useState('');
  const [editSummaryNotice, setEditSummaryNotice] = useState<string | null>(null);

  // Sync state when activePatient or appointment reason changes
  React.useEffect(() => {
    const profile = getClinicalProfileByReason(appointment.reason, activePatient, appointment);
    setSelectedToothFdi(profile.defaultToothFdi);
    setDictationText(profile.dictationSample);
    setProposedTreatmentPlan(profile.proposedTreatmentPlan);
    setProposedPrescription(profile.prescription);
    setClinicalNotes(profile.clinicalNotes);
    setInsuranceNarrative(profile.insuranceNarrative);
    setNextVisitDate('');
    setTreatmentCostTotal(profile.estimatedCost);
    setEPrescriptionSent(false);
    setIsSendingEPrescription(false);
    setCopilotChatHistory([
      {
        id: `c-1-${Date.now()}`,
        sender: 'doctor',
        text: `با توجه به علت مراجعه بیمار («${appointment.reason || 'معاینه'}»)، سوابق پزشکی و حساسیت‌های ثبت‌شده، نکات بالینی و تجویز دارویی چیست؟`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `c-2-${Date.now()}`,
        sender: 'ai',
        text: `بررسی هوش مصنوعی دنتورا بر اساس پرونده UDR بیمار (${activePatient.fullName}):\nعلت مراجعه: «${appointment.reason || 'معاینه عمومی'}»\nدسته‌بندی بالینی: ${profile.category}\n${profile.copilotSummary}\nپیشنهاد رادیوگرافی: ${profile.xrayRecommendation}`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [activePatient.id, appointment.id, appointment.reason]);

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
      text: `با توجه به علت مراجعه بیمار («${appointment.reason || 'معاینه'}»)، سوابق پزشکی و حساسیت‌های ثبت‌شده، نکات بالینی و تجویز دارویی چیست؟`,
      time: '۱۰:۱۴',
    },
    {
      id: 'c-2',
      sender: 'ai',
      text: `بررسی هوش مصنوعی دنتورا بر اساس پرونده UDR بیمار (${activePatient.fullName}):\nعلت مراجعه: «${appointment.reason || 'معاینه عمومی'}»\nدسته‌بندی بالینی: ${initialProfile.category}\n${initialProfile.copilotSummary}\nپیشنهاد رادیوگرافی: ${initialProfile.xrayRecommendation}`,
      time: '۱۰:۱۵',
    },
  ]);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);

  // Step 4 & 5: Clinical Note & Next Visit Date (Optional & Empty by default)
  const [clinicalNotes, setClinicalNotes] = useState(initialProfile.clinicalNotes);
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [followupSentToReception, setFollowupSentToReception] = useState(false);

  // Step 5: Electronic Prescription System Transmission State
  const [isSendingEPrescription, setIsSendingEPrescription] = useState(false);
  const [ePrescriptionSent, setEPrescriptionSent] = useState(false);
  const [ePrescriptionTrackingCode, setEPrescriptionTrackingCode] = useState('IR-170075');
  const [ePrescriptionSentTime, setEPrescriptionSentTime] = useState('');

  // Step 5: Contracted Dentist Financial Breakdown
  const [dentistCommissionRate, setDentistCommissionRate] = useState(70); // 70% Dentist, 30% Center
  const [treatmentCostTotal, setTreatmentCostTotal] = useState(initialProfile.estimatedCost);

  // Step 6: Insurance Narrative (Drafted by AI, editable by dentist)
  const [insuranceNarrative, setInsuranceNarrative] = useState(initialProfile.insuranceNarrative);
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

  // Registered Labs
  const registeredLabs = getStoredLabs();

  // Lab Orders State & Modal Form State
  const [isNewLabModalOpen, setIsNewLabModalOpen] = useState(false);
  const [labPatientId, setLabPatientId] = useState(activePatient.id);
  const [labPatientName, setLabPatientName] = useState(activePatient.fullName);
  const [labToothFdi, setLabToothFdi] = useState<number>(selectedToothFdi || 16);
  const [labItemType, setLabItemType] = useState<string>('روکش زيرکونيا کامل');
  const [labShade, setLabShade] = useState<string>('A2');
  const [labAlloy, setLabAlloy] = useState<string>('زیرکونیا چند لایه (Multi-layer Zirconia)');
  const [selectedLabId, setSelectedLabId] = useState<string>(registeredLabs[0]?.id || 'lab-pars');
  const [labName, setLabName] = useState<string>(registeredLabs[0]?.name || 'لابراتوار دیجیتال پارس دنتال (CAD/CAM)');
  const [labDentistName, setLabDentistName] = useState<string>(
    currentUserName || (currentClinic?.ownerRole === 'dentist' ? currentClinic.ownerName : 'دکتر سارا فرهمند')
  );
  const [labDentistSpecialty, setLabDentistSpecialty] = useState<string>('متخصص پروتزهای دندانی و زیبایی');
  const [labExpectedDate, setLabExpectedDate] = useState<string>('۱۴۰۵/۰۵/۲۵');
  const [labDoctorNotes, setLabDoctorNotes] = useState<string>('مارجین چمفر، شیدینگ رنگ طبیعی مطابق دندان مجاور، چک کانتکت مزیال و دیستال');

  // Active Lab Orders (from prop or default)
  const currentLabOrders: LabOrder[] = labOrders && labOrders.length > 0
    ? labOrders
    : [
        {
          id: 'LAB-201',
          orderNumber: 'LAB-201',
          patientId: activePatient.id,
          patientName: activePatient.fullName,
          dentistName: currentUserName || (currentClinic?.ownerRole === 'dentist' ? currentClinic.ownerName : 'دکتر سارا فرهمند'),
          dentistSpecialty: 'متخصص پروتزهای دندانی و زیبایی',
          dentistPhone: '09121112233',
          toothFdi: 16,
          itemType: 'روکش زيرکونيا کامل',
          shade: 'A2',
          alloyOrMaterial: 'زیرکونیا چندلایه',
          labId: 'lab-pars',
          labName: 'لابراتوار دیجیتال پارس دنتال (CAD/CAM)',
          status: 'designing',
          orderedDate: '۱۴۰۵/۰۵/۱۸',
          expectedDeliveryDate: '۱۴۰۵/۰۵/۲۵',
          currentMilestone: 'در حال ساخت کست اولیه و طراحی 3D',
          doctorNotes: 'مارجین چمفر، چک اکلوژن',
          stages: [
            { name: 'ثبت سفارش و دریافت قالب در لابراتوار', done: true },
            { name: 'ریخته‌گری کست و دیجیتایز ۳D (CAD/CAM)', done: true },
            { name: 'تراش فرز و پخت در کوره سانتر رنگ A2', done: false, delayReason: 'در انتظار نوبت کوره پخت' },
            { name: 'کنترل کیفیت، استریلیزاسیون و ارسال به مطب', done: false },
          ],
        },
      ];

  const handleCreateNewLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = `LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetPatient = allPatients.find(p => p.id === labPatientId) || activePatient;
    const chosenLab = registeredLabs.find(l => l.id === selectedLabId);

    const newOrder: LabOrder = {
      id: orderNum,
      orderNumber: orderNum,
      patientId: targetPatient.id,
      patientName: targetPatient.fullName,
      dentistName: labDentistName.trim() || currentUserName || 'دکتر معالج',
      dentistSpecialty: labDentistSpecialty,
      dentistPhone: currentClinic?.ownerMobile || '09121112233',
      toothFdi: labToothFdi,
      itemType: labItemType,
      shade: labShade,
      alloyOrMaterial: labAlloy,
      labId: selectedLabId,
      labName: chosenLab ? chosenLab.name : labName,
      clinicId: currentClinic?.id || 'clinic-alborz',
      clinicName: currentClinic?.name || 'کلینیک دنتورا',
      status: 'ordered',
      orderedDate: new Date().toLocaleDateString('fa-IR'),
      expectedDeliveryDate: labExpectedDate,
      currentMilestone: 'ثبت سفارش در مطب و ارسال به کارتابل لابراتوار',
      doctorNotes: labDoctorNotes,
      stages: [
        { name: 'ثبت سفارش و دریافت قالب / اسکن در لابراتوار', done: true },
        { name: 'طراحی 3D CAD/CAM و کست دیجیتال', done: false },
        { name: `پخت کوره سانتر و شیدینگ رنگ ${labShade}`, done: false },
        { name: 'کنترل نهایی کیفیت و ارسال به مطب', done: false },
      ],
    };

    if (onAddLabOrder) {
      onAddLabOrder(newOrder, currentClinic?.id);
    }

    setIsNewLabModalOpen(false);
    alert(`سفارش لابراتوار شماره ${orderNum} برای بیمار «${targetPatient.fullName}» با موفقیت ثبت شد و به کارتابل مسئول ${newOrder.labName} ارسال گردید.`);
  };

  // Search in Patient Records
  const [searchRecordQuery, setSearchRecordQuery] = useState('');

  // Patient Comm Chat input
  const [patientMsgInput, setPatientMsgInput] = useState('');
  const [commMessages, setCommMessages] = useState([
    { id: '1', sender: 'patient', text: 'سلام آقای دکتر، بعد از جلسه امروز عصب‌کشی درد خفیفی دارم، آیا مسکن بخورم؟', time: '۰۹:۱۵' },
    { id: '2', sender: 'doctor', text: 'سلام و وقت بخیر. بله تا ۲۴ ساعت آینده احساس درد هنگام جویدن طبیعی است. یک عدد ژلوفن ۴۰۰ مصرف کنید.', time: '۰۹:۲۵' },
  ]);

  // Clinical AI Suggestion Generator based on keyword & category
  const generateClinicalAiSuggestion = (category?: string, question?: string) => {
    const qLower = `${question || ''} ${category || ''}`.toLowerCase();
    
    // 1. RCT, Nerve, Pulp, Pain after root canal
    if (qLower.includes('عصب') || qLower.includes('rct') || qLower.includes('ریشه') || qLower.includes('فشار') || qLower.includes('تیر کشیدن') || qLower.includes('پانسمان')) {
      return 'احساس درد، تیر کشیدن یا احساس فشار هنگام جویدن تا ۳ الی ۵ روز پس از درمان ریشه (RCT) کاملاً طبیعی است. مصرف کپسول نوافن یا قرص ژلوفن ۴۰۰ هر ۸ ساعت همراه غذا توصیه می‌شود. از جویدن خوراکی‌های سفت با این سمت دهان تا اتمام ترمیم نهایی خودداری فرمایید. در صورت افتادن کامل پانسمان با مطب هماهنگ شوید.';
    }
    
    // 2. Crown, Veneer, Prosthesis, Zirconia, Emax
    if (qLower.includes('روکش') || qLower.includes('پروتز') || qLower.includes('زیرکونیا') || qLower.includes('چسب') || qLower.includes('لمینت') || qLower.includes('emax') || qLower.includes('شید')) {
      return 'تا ۲۴ ساعت اول پس از چسباندن نهایی روکش از جویدن خوراکی‌های بسیار چسبنده یا سفت (مانند آدامس و ته دیگ) خودداری فرمایید. شستشوی آرام با آب‌نمک ولرم و استفاده از نخ دندان مخصوص (Super Floss) از طرفین توصیه می‌شود. در صورت احساس بلندی در بایت یا تماس نامتعارف دندان مقابل، جهت تنظیم در مطب حضور یابید.';
    }
    
    // 3. Sensitivity, Cold/Hot, Scaling, Bleaching
    if (qLower.includes('حساس') || qLower.includes('سرد') || qLower.includes('گرم') || qLower.includes('جرم') || qLower.includes('بروساژ') || qLower.includes('سفید کردن') || qLower.includes('بلیچینگ')) {
      return 'حساسیت موقت دندان‌ها به آب سرد یا گرم پس از جرم‌گیری عمقی یا ترمیم‌های جدید کلاس ۲ کاملاً گذرا است. مصرف روزانه ۲ بار خمیردندان ضدحساسیت (سنسوداین یا کرست Pro-Relief) به مدت ۲ هفته و پرهیز از نوشیدنی‌های یخ‌زده یا بیش از حد داغ توصیه می‌شود.';
    }
    
    // 4. Surgery, Extraction, Bleeding, Sutures, Implant fixture
    if (qLower.includes('خون') || qLower.includes('جراحی') || qLower.includes('کشیدن') || qLower.includes('بخیه') || qLower.includes('ایمپلنت') || qLower.includes('دندان عقل') || qLower.includes('فیکسچر')) {
      return 'گاز استریل را تا ۱ ساعت با فشار ملایم فک نگه داشته و آب دهان را تف نکنید (بلع آرام). تا ۲۴ ساعت از نوشیدنی‌های داغ، استفاده از نی و استعمال دخانیات اکیداً پرهیز شود. کمپرس سرد از روی گونه (۱۰ دقیقه بگذارید و ۵ دقیقه بردارید) تورم را مهار می‌کند. از روز دوم شستشوی ملایم با دهان‌شویه کلرهگزیدین ۰.۱۲٪ دو بار در روز را آغاز فرمایید.';
    }
    
    // 5. Antibiotics, Prescriptions, Allergy, Swelling
    if (qLower.includes('آنتی‌بیوتیک') || qLower.includes('چرک') || qLower.includes('عفونت') || qLower.includes('دارو') || qLower.includes('مسکن') || qLower.includes('آموکسی') || qLower.includes('مترونیدازول') || qLower.includes('ورم') || qLower.includes('تورم')) {
      return 'دوره آنتی‌بیوتیک تجویزی (آموکسی‌سیلین ۵۰۰ هر ۸ ساعت یا مترونیدازول ۲۵۰) را دقیقاً سر موعد تا اتمام کامل بسته‌ها مصرف فرمایید و از قطع زودهنگام خودداری نمایید. برای کاهش التهاب و تسکین درد، از مسکن مفنامیک اسید یا نوافن به همراه یک لیوان پر آب استفاده کنید. در صورت بروز تنگی نفس یا کهیر بلافاصله دارو را متوقف کرده و اطلاع دهید.';
    }
    
    // Default clinical response
    return 'پاسخ بالینی پزشک: وضعیت شرح‌داده‌شده بررسی گردید. با رعایت دقیق بهداشت دهان، مسواک نرم و مصرف داروهای تجویزی در ساعات مقرر، بهبود حاصل خواهد شد. در صورت تداوم، افزایش شدت درد یا مشاهده تورم لثه، جهت معاینه بالینی حضوری با کلینیک هماهنگ فرمایید.';
  };

  // Merged Patient Q&A Items with Doctor Answer Registration
  const [doctorAnswerDrafts, setDoctorAnswerDrafts] = useState<Record<string, string>>({});
  const [qaFilter, setQaFilter] = useState<'all' | 'pending' | 'answered'>('all');

  // Strictly filter CLINICAL & TREATMENT questions for dentist workspace (exclude finance, disputes, insurance, billing, appointments)
  const isClinicalCategory = (cat?: string, questionText?: string) => {
    const textToCheck = `${cat || ''} ${questionText || ''}`.toLowerCase();
    
    // Non-clinical keywords to strictly reject from Doctor Q&A
    const nonClinical = ['اقساط', 'مالی', 'بیمه', 'پرداخت', 'نوبت', 'حسابداری', 'هزینه', 'قبض', 'اعتراض', 'bnpl', 'صندوق', 'فاکتور', 'کسورات', 'تعرفه'];
    if (nonClinical.some(nc => textToCheck.includes(nc))) {
      return false;
    }
    
    return true;
  };

  const rawQuestions = patientQuestions && patientQuestions.length > 0
    ? patientQuestions.filter(q => isClinicalCategory(q.category, q.question))
    : [
        {
          id: 'qa-1',
          patientName: 'علی رضایی',
          patientPhone: '09129876543',
          patientNationalId: '0012345678',
          category: 'مراقبت‌های پس از درمان',
          question: 'بعد از عصب‌کشی دیروز دندان شماره ۴۶ کمی احساس فشار دارم، چه مسکنی مصرف کنم؟',
          createdAt: '۱۴۰۵/۰۵/۱۰',
          status: 'answered' as const,
          isClinicalUrgent: false,
          replies: [],
          answer: 'سلام بیمار گرامی. احساس فشار خفیف تا ۷۲ ساعت طبیعی است. می‌توانید هر ۸ ساعت یک عدد کپسول نوافن یا قرص ژلوفن مصرف کنید. در صورت بروز تورم یا درد شدید با مطب تماس بگیرید.',
          answeredAt: '۱۴۰۵/۰۵/۱۰ - ۱۱:۳۰',
          repliedBy: 'دکتر کاویانی',
        },
        {
          id: 'q1',
          patientName: 'مریم حسینی',
          patientPhone: '09351112233',
          patientNationalId: '0088419922',
          category: 'پروتز و روکش',
          question: 'دکتر جان آیا بعد از تحویل روکش زيرکونيا می‌تونم غذای سفت بخورم؟',
          status: 'pending' as const,
          createdAt: '۱۰:۲۰ - امروز',
          isClinicalUrgent: false,
          replies: [],
        },
        {
          id: 'q2',
          patientName: 'علی محمدی',
          patientPhone: '09127012345',
          patientNationalId: '0070125544',
          category: 'جراحی و عصب‌کشی',
          question: 'سلام آقای دکتر، ۲ روز از جراحی عصب‌کشی می‌گذره ولی هنوز موقع جویدن احساس تیر کشیدن دارم. طبیعیه؟',
          status: 'pending' as const,
          createdAt: '۰۸:۴۵ - امروز',
          isClinicalUrgent: true,
          replies: [],
        },
      ];

  const combinedQaList = rawQuestions.map((q) => {
    const aiDraft = generateClinicalAiSuggestion(q.category, q.question);
    const lastReply = q.replies && q.replies.length > 0 ? q.replies[q.replies.length - 1] : undefined;
    const finalAnswer = q.answer || lastReply?.message || '';
    const finalAnsweredAt = q.answeredAt || lastReply?.createdAt || '';
    const finalRepliedBy = q.repliedBy || lastReply?.senderName || '';

    return {
      id: q.id,
      patientName: q.patientName,
      udr: `UDR-${q.patientPhone ? q.patientPhone.slice(-4) : (q.patientNationalId ? q.patientNationalId.slice(-4) : '0000')}`,
      category: q.category || 'مراقبت‌های بالینی و درمانی',
      question: q.question,
      status: (q.status === 'answered' || !!finalAnswer) ? ('answered' as const) : ('pending' as const),
      time: q.createdAt,
      aiSuggestion: aiDraft,
      doctorAnswer: finalAnswer,
      answeredAt: finalAnsweredAt,
      repliedBy: finalRepliedBy,
      isClinicalUrgent: q.isClinicalUrgent,
    };
  });

  const handleSaveDoctorAnswer = (qId: string) => {
    const text = doctorAnswerDrafts[qId];
    if (!text || !text.trim()) {
      alert('لطفاً متن پاسخ دندان‌پزشک را تایپ کنید یا از دکمه پیش‌نویس هوش مصنوعی استفاده نمایید.');
      return;
    }

    const docName = currentUserName || (currentClinic?.ownerRole === 'dentist' ? currentClinic.ownerName : 'دکتر معالج');

    if (onReplyQuestion) {
      onReplyQuestion(qId, text, 'dentist', docName);
    }

    setDoctorAnswerDrafts((prev) => ({ ...prev, [qId]: '' }));
    alert(`پاسخ تخصصی دندان‌پزشک (${docName}) با موفقیت ثبت شد و بلافاصله در پورتال بیمار نمایش داده خواهد شد.`);
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
      // Analyze dictation text merged with appointment reason
      const combinedReason = `${dictationText} ${appointment.reason || ''}`;
      const profile = getClinicalProfileByReason(combinedReason, activePatient, appointment);

      setProposedTreatmentPlan(profile.proposedTreatmentPlan);
      setProposedPrescription(profile.prescription);
      setClinicalNotes(profile.clinicalNotes);
      setInsuranceNarrative(profile.insuranceNarrative);
      setNextVisitDate(profile.nextVisitSuggestion);
      setTreatmentCostTotal(profile.estimatedCost);

      setIsAnalyzingDictation(false);
      setAiProposalAutoGenerated(true);
    }, 700);
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
      const qLower = queryText.toLowerCase();
      const allergies = activePatient.allergies || [];
      const hasAllergy = allergies.length > 0;
      const profile = getClinicalProfileByReason(appointment.reason, activePatient, appointment);

      let aiReplyText = `پاسخ هوش مصنوعی دنتورا برای بیمار ${activePatient.fullName} (علت مراجعه: «${appointment.reason || 'معاینه'}»):\n`;

      if (qLower.includes('تداخل') || qLower.includes('دارو') || qLower.includes('حساسیت') || qLower.includes('لیدوکایین')) {
        if (hasAllergy) {
          aiReplyText += `هشدار بالینی: بیمار دارای سابقه حساسیت ثبت‌شده به [${allergies.join('، ')}] می‌باشد. در پروتکل دارویی از خانواده دارویی آلرژن اجتناب شده و آنتی‌بیوتیک جایگزین ایمن تجویز گردید. تزریق بی‌حسی استاندارد ۲٪ بدون کنترااندیکاسیون بلامانع است.`;
        } else {
          aiReplyText += `بر اساس پرونده UDR بیمار، هیچ‌گونه حساسیت دارویی ثبت نشده است. تجویز داروهای استاندارد ضدالتهابی، مسکن و آنتی‌بیوتیک با دوز درمانی بالینی ایمن و بدون تداخل می‌باشد.`;
        }
      } else if (qLower.includes('دوز') || qLower.includes('آموکسی') || qLower.includes('نسخه') || qLower.includes('مسکن')) {
        aiReplyText += `پروتکل نسخه پیشنهادی منطبق با علت مراجعه (${profile.category}):\n` + profile.prescription.map((rx, idx) => `${idx + 1}. ${rx}`).join('\n');
      } else if (qLower.includes('رادیوگرافی') || qLower.includes('گرافی') || qLower.includes('opg') || qLower.includes('عکس')) {
        aiReplyText += `توصیه تصویربرداری تشخیصی: ${profile.xrayRecommendation}`;
      } else {
        aiReplyText += `با بررسی علت مراجعه «${appointment.reason}» و دسته‌بندی درمانی «${profile.category}»، درمان بر اساس استانداردهای بالینی توصیه می‌شود. طرح درمان پیشنهادی و مستندات لازم برای پوشش بیمه‌ای آماده و منطبق با پرونده است.`;
      }

      const aiMsg: CopilotChatMessage = {
        id: `c-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      setCopilotChatHistory((prev) => [...prev, aiMsg]);
      setIsLoadingCopilot(false);
    }, 700);
  };

  // Step 5: Send Electronic Prescription to Insurer System
  const handleSendEPrescription = () => {
    setIsSendingEPrescription(true);
    setTimeout(() => {
      setIsSendingEPrescription(false);
      setEPrescriptionSent(true);
      setEPrescriptionTrackingCode('IR-170075');
      setEPrescriptionSentTime(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  };

  // Step 5: Save Next Visit Date & Notify Receptionist (Optional)
  const handleSaveNextVisit = () => {
    if (!nextVisitDate.trim()) {
      alert('فیلد تاریخ مراجعه بعدی خالی است. این بخش اختیاری است و در صورت تمایل می‌توانید تاریخی مانند «۲ هفته آینده» وارد کنید.');
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
    alert(`پیام پیگیری زمان مراجعه بعدی (${nextVisitDate}) با موفقیت برای منشی ارسال شد.`);
  };

  // Step 7: Final Submit Record to Receptionist Panel
  const handleSubmitToReception = () => {
    setIsSubmittedToReception(true);

    if (onFinishTreatment) {
      const baseShare = Math.round(treatmentCostTotal * 0.3); // 30% base insurance share
      const supplShare = (insuranceModuleActive && activePatient.supplementaryInsurance) ? Math.round(treatmentCostTotal * 0.4) : 0; // 40% suppl share
      
      // Extract all teeth referenced in odontogram, selected tooth, or plan notes
      const planNumbers = (proposedTreatmentPlan + ' ' + (insuranceNarrative || clinicalNotes))
        .match(/\b(1[1-8]|2[1-8]|3[1-8]|4[1-8])\b/g)
        ?.map(Number) || [];
      const odontogramNumbers = odontogramFindings.map((f) => f.toothNumber);
      const combinedTreatedTeeth = Array.from(
        new Set([
          ...(selectedToothFdi ? [selectedToothFdi] : []),
          ...odontogramNumbers,
          ...planNumbers,
        ])
      );

      onFinishTreatment({
        patientId: activePatient.id,
        patientName: activePatient.fullName,
        treatmentPlan: proposedTreatmentPlan,
        totalCost: treatmentCostTotal,
        baseCovered: baseShare,
        supplCovered: supplShare,
        prescription: proposedPrescription,
        clinicalNotes: insuranceNarrative || clinicalNotes,
        toothFdi: selectedToothFdi || combinedTreatedTeeth[0] || 16,
        teethFdiList: combinedTreatedTeeth.length > 0 ? combinedTreatedTeeth : [selectedToothFdi || 16],
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
  const pendingClinicalCount = combinedQaList.filter((q) => q.status === 'pending').length;
  const menuItems = [
    { id: 'clinical_workbench', label: 'میز کار بالینی (۷ مرحله)', icon: Stethoscope, badge: 'مرحله ۱۲.۲' },
    { id: 'patient_records', label: 'پرونده بیماران', icon: FolderOpen, badge: 'UDR' },
    { id: 'my_schedule', label: 'برنامه زمانی من', icon: Calendar, badge: 'تقویم' },
    { id: 'lab_section', label: 'بخش لابراتوار', icon: FlaskConical, badge: 'سفارشات' },
    {
      id: 'patient_qa',
      label: 'پرسش‌های بالینی بیماران',
      icon: HelpCircle,
      badge: pendingClinicalCount > 0 ? `${pendingClinicalCount} نیاز به پاسخ` : 'مشاوره',
    },
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

  // Helper to extract formatted items from the odontogram
  const odontogramFindings = React.useMemo(() => {
    const conditionLabels: Record<string, string> = {
      decay: 'پوسیدگی دندانی',
      rct_needed: 'نیاز به عصب‌کشی (درمان ریشه/اندو)',
      crown: 'روکش دندان',
      implant: 'ایمپلنت',
      extracted: 'کشیده شده',
      filled: 'ترمیم شده',
      in_progress: 'در حال درمان',
      healthy: 'سالم',
    };

    const surfaceLabels: Record<string, string> = {
      Mesial: 'مزیال (M)',
      Distal: 'دیستال (D)',
      Occlusal: 'اکلوزال (O)',
      Buccal: 'باکال (B)',
      Lingual: 'لینگوال (L)',
      Incisal: 'انسیزال (I)',
      Root: 'ریشه (R)',
    };

    const findings: Array<{
      toothNumber: number;
      conditionText: string;
      surfacesText?: string;
      notes?: string;
      treatments?: string[];
    }> = [];

    const teethMap = activePatient.teethMap || {};
    (Object.entries(teethMap) as [string, ToothDetail][]).forEach(([fdiStr, detail]) => {
      const fdi = parseInt(fdiStr, 10);
      if (detail && detail.condition && detail.condition !== 'healthy') {
        const condLabel = conditionLabels[detail.condition] || detail.condition;
        const surfaces = (detail.affectedSurfaces || []).map((s) => surfaceLabels[s] || s);
        findings.push({
          toothNumber: fdi,
          conditionText: condLabel,
          surfacesText: surfaces.length > 0 ? surfaces.join('، ') : undefined,
          notes: detail.notes,
          treatments: (detail.treatmentHistory || []).map((t) => t.procedureName),
        });
      }
    });

    // If teethMap has no non-healthy findings yet, include the active selected tooth if present
    if (findings.length === 0 && selectedToothFdi) {
      findings.push({
        toothNumber: selectedToothFdi,
        conditionText: initialProfile.category || 'در حال بررسی بالینی و طرح درمان',
        surfacesText: 'مزیال (M)، اکلوزال (O)',
        notes: 'دندان کاندید درمان در جلسه جاری',
      });
    }

    return findings;
  }, [activePatient.teethMap, selectedToothFdi, initialProfile]);

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
                      (تاریخ تولد: {activePatient.birthDate || `${1405 - activePatient.age}/۰۴/۱۵`} · کد ملی: {activePatient.nationalId})
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
                      <span>مرحله ۱: پیشینه بیمار، تاریخ تولد، حساسیت‌ها و پیام منشی</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      مشخصات کامل پرونده، تاریخ تولد، تطابق سوابق پزشکی، حساسیت‌های دارویی، سوابق درمان‌های قبلی و فرم چک‌این
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#005581] text-white font-bold text-xs rounded-lg">گام ۱ از ۷</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Patient Info Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                        <UserCheck className="w-4 h-4 text-[#005581]" />
                        <span>مشخصات و پرونده هویتی بیمار:</span>
                      </h4>
                      <button
                        onClick={() => setAllergiesModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-[#005581]/10 hover:bg-[#005581]/20 text-[#005581] dark:text-[#72cdf4] font-bold text-[11px] transition cursor-pointer"
                      >
                        ویرایش حساسیت‌ها و سوابق
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                      <div>نام کامل: <strong className="text-slate-900 dark:text-slate-100">{activePatient.fullName}</strong></div>
                      <div>شناسه طولی UDR: <strong className="font-mono text-[#005581]">{activePatient.udrCode}</strong></div>
                      <div>کد ملی: <strong className="font-mono text-slate-900 dark:text-slate-100">{activePatient.nationalId}</strong></div>
                      <div>
                        تاریخ تولد: <strong className="font-mono text-slate-900 dark:text-slate-100">{activePatient.birthDate || `${1405 - activePatient.age}/۰۴/۱۵`}</strong>
                      </div>
                      <div>شماره همراه: <strong className="font-mono text-slate-900 dark:text-slate-100">{activePatient.phone}</strong></div>
                      <div>بیمه پایه: <strong>{activePatient.primaryInsurance?.provider || 'فاقد بیمه پایه'}</strong></div>
                      <div>بیمه تکمیلی: <strong>{activePatient.supplementaryInsurance?.provider || 'فاقد بیمه تکمیلی'}</strong></div>
                      <div>
                        علت مراجعه انتخابی: <strong className="text-[#005581] dark:text-[#72cdf4]">{appointment.reason || 'معاینه دوره‌ای'}</strong>
                      </div>
                    </div>

                    {/* Allergies Alert Box */}
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1">
                      <div className="font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>حساسیت‌های دارویی (ثبت‌شده در چک‌این/پروفایل):</span>
                        </span>
                        {activePatient.allergies && activePatient.allergies.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 font-bold">
                            {activePatient.allergies.length} مورد
                          </span>
                        )}
                      </div>
                      {activePatient.allergies && activePatient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activePatient.allergies.map((alg, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[11px] shadow-xs"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-rose-600/80 dark:text-rose-400/80 text-[11px] italic">
                          هیچ حساسیت دارویی ثبت نشده است (پروفایل ایمن).
                        </p>
                      )}
                    </div>

                    {/* Medical History Alert Box */}
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>سوابق بیماری و پزشکی:</span>
                      </div>
                      {activePatient.medicalHistory && activePatient.medicalHistory.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activePatient.medicalHistory.map((med, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold text-[11px]"
                            >
                              {med}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-amber-700/80 dark:text-amber-400/80 text-[11px] italic">
                          سوابق بیماری خاصی در پرونده ثبت نشده است.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Secretary Note Card & Check-in Status */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-sm">
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                        <span>پیام و یادداشت پذیرش/منشی به پزشک:</span>
                      </h4>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
                        {appointment.receptionNoteToDoctor ||
                          'بیمار توسط منشی به سیستم پزشک متصل شد. بیمار علائم درد شدید در ناحیه دندان ۱۶ دارد و فرم رضایت اولیه الکترونیک را امضا نموده است.'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>وضعیت پذیرش و نوبت‌دهی:</span>
                      </div>
                      <div>وضعیت یونیت: <strong className="text-emerald-700 dark:text-emerald-300">مستقر روی یونیت دندان‌پزشکی</strong></div>
                      <div>فرم چک‌این آنلاین: <strong className="text-emerald-700 dark:text-emerald-300">{appointment.checkInFormCompleted ? 'تکمیل و تایید شده' : 'تکمیل در پذیرش'}</strong></div>
                      <div>پرداخت هزینه ویزیت: <strong className="text-emerald-700 dark:text-emerald-300">{appointment.visitFeePaid ? 'پرداخت شده' : 'رایگان / دوره‌ای'}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Real Treatment History & Past Visits Section (بدون اطلاعات دیفالت) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-[#005581] dark:text-[#72cdf4]" />
                      <span>مراجعات و سوابق اقدامات درمانی قبلی بیمار (ثبت‌شده در پرونده):</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      پرونده: {activePatient.udrCode}
                    </span>
                  </div>

                  {(() => {
                    const realTreatments = (
                      Object.values(activePatient.teethMap || {}) as ToothDetail[]
                    ).flatMap((t) =>
                      (t.treatmentHistory || []).map((th) => ({
                        ...th,
                        toothFdi: t.fdiNumber,
                      }))
                    );

                    if (realTreatments.length === 0 && (!activePatient.clinicalNotes || activePatient.clinicalNotes.length === 0)) {
                      return (
                        <div className="p-4 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs italic">
                          اولین مراجعه بیمار به کلینیک / فاقد سابقه اقدام درمانی ثبت‌شده در جلسات قبل.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {realTreatments.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                              اقدامات درمانی ثبت‌شده روی دندان‌ها در مراجعات گذشته:
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              {realTreatments.map((th) => (
                                <div
                                  key={th.id}
                                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs"
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#005581] text-white text-[11px]">
                                      دندان #{th.toothFdi}
                                    </span>
                                    <strong className="text-slate-900 dark:text-slate-100 text-xs">
                                      {th.procedureName}
                                    </strong>
                                    {th.status === 'completed' ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                                        تکمیل‌شده
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                                        در حال درمان
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                                    <span>پزشک: <strong className="text-slate-700 dark:text-slate-300">{th.dentistName}</strong></span>
                                    <span>تاریخ: <strong className="font-mono text-slate-700 dark:text-slate-300">{th.date}</strong></span>
                                    {th.cost && (
                                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        {th.cost.toLocaleString('fa-IR')} تومان
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activePatient.clinicalNotes && activePatient.clinicalNotes.length > 0 && (
                          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
                            <span className="text-[11px] font-bold text-[#005581] dark:text-[#72cdf4] block">
                              شرح بالینی و یادداشت‌های دندان‌پزشک در مراجعات قبل:
                            </span>
                            <div className="space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                              {activePatient.clinicalNotes.map((note, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30">
                                  {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                  patientId={activePatient.id}
                  doctorName={currentUserName || (currentClinic?.ownerRole === 'dentist' ? currentClinic.ownerName : 'دکتر کاویانی')}
                  toothFdi={selectedToothFdi || 16}
                  patientImages={activePatient.patientImages || []}
                  onRevisionTreatmentPlan={() => {
                    setProposedTreatmentPlan((prev) => `${prev}\n۴. نیاز به روکش پس از بررسی گرافی`);
                    alert('طرح درمان با توجه به علائم گرافی به‌روزرسانی شد.');
                  }}
                  onSavePatientImage={(imageRecord) => {
                    if (onSavePatientImage) {
                      onSavePatientImage(activePatient.id, imageRecord);
                    }
                  }}
                  onSaveToDossier={(summary) => {
                    setDictationText((prev) => `${prev ? prev + '\n' : ''}[یافته‌های تصویربرداری PACS]:\n${summary}`);
                    if (onUpdatePatient) {
                      const todayFa = new Date().toLocaleDateString('fa-IR');
                      const doc = currentUserName || 'پزشک';
                      const newNotes = [...(activePatient.clinicalNotes || []), `[${todayFa} ${doc}] یافته‌های رادیوگرافی: ${summary}`];
                      const newMedHistory = Array.from(new Set([...(activePatient.medicalHistory || []), `تصویربرداری و علائم بالینی دندان ${selectedToothFdi || 16}`]));
                      onUpdatePatient({ clinicalNotes: newNotes, medicalHistory: newMedHistory });
                    }
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

                {/* Electronic Prescription System Submission Card */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          سامانه نسخه الکترونیک (بیمه سلامت / تامین اجتماعی)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          ارسال مستقیم و آنی اقلام نسخه به درگاه الکترونیک سازمان‌های بیمه‌گر
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      <span>کد ملی: <strong className="text-slate-900 dark:text-slate-100">{activePatient.nationalId || '۰۰۱۲۳۴۵۶۷۸'}</strong></span>
                      <span className="text-slate-300">|</span>
                      <span>بیمه پایه: <strong className="text-slate-900 dark:text-slate-100">{activePatient.baseInsurance?.companyName || 'تأمین اجتماعی'}</strong></span>
                    </div>
                  </div>

                  {!ePrescriptionSent ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        اقلام نسخه دارویی آماده تایید و ارسال به سامانه نسخه الکترونیک است.
                      </span>
                      <button
                        type="button"
                        onClick={handleSendEPrescription}
                        disabled={isSendingEPrescription}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer disabled:opacity-70 whitespace-nowrap"
                      >
                        {isSendingEPrescription ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>در حال ارسال به سامانه نسخه الکترونیک...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-emerald-200" />
                            <span>ارسال به سامانه نسخه الکترونیک</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>✓ ارسال شد — کد پیگیری: {ePrescriptionTrackingCode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-md text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            زمان ثبت: {ePrescriptionSentTime || 'هم‌اکنون'}
                          </span>
                          <button
                            type="button"
                            onClick={handleSendEPrescription}
                            disabled={isSendingEPrescription}
                            className="text-[10px] text-emerald-800 dark:text-emerald-300 underline font-bold cursor-pointer"
                          >
                            {isSendingEPrescription ? 'در حال ارسال...' : 'ارسال مجدد / ویرایش'}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                        نسخه دارویی در درگاه یکپارچه خدمات الکترونیک سلامت کشور ثبت قطعی شد. بیمار می‌تواند با ارائه کد ملی و کد رهگیری به تمامی داروخانه‌ها مراجعه نماید.
                      </p>
                    </div>
                  )}
                </div>

                {/* Clinical Note & Next Visit Date (Optional) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">یادداشت بالینی و ثبت زمان مراجعه بعدی:</h4>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="یادداشت بالینی دندان‌پزشک..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  ></textarea>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-bold">زمان مراجعه بعدی و پیام به منشی (اختیاری):</span>
                      <span className="text-[11px] text-slate-400">در صورت عدم نیاز، می‌توانید این فیلد را خالی بگذارید</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={nextVisitDate}
                        onChange={(e) => setNextVisitDate(e.target.value)}
                        placeholder="زمان تقریبی مراجعه بعدی (اختیاری - در صورت تمایل وارد کنید)..."
                        className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                      <button
                        onClick={handleSaveNextVisit}
                        className="px-4 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
                      >
                        ثبت زمان و ارسال پیام پیگیری به منشی
                      </button>
                    </div>
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
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#005581]" />
                      <span>خلاصه پرونده درمانی و طرح درمان مصوب:</span>
                    </h4>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#005581]/10 text-[#005581] dark:text-[#72cdf4] font-bold">
                      مرحله ۶: بازبینی نهایی بالینی و مالی
                    </span>
                  </div>

                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    {/* Dictated & Edited Doctor Text with exact required label */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
                      <div className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                        <Mic className="w-3.5 h-3.5 text-[#005581]" />
                        <span>شرح معاینه و دیکته فارسی پزشک:</span>
                      </div>
                      <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60">
                        {dictationText || 'شرح دیکته‌ای ثبت نشده است.'}
                      </p>
                    </div>

                    {/* Odontogram Findings */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                      <div className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                        <Stethoscope className="w-3.5 h-3.5 text-[#005581]" />
                        <span>موارد مشخص شده در اودنتوگرام:</span>
                      </div>
                      {odontogramFindings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {odontogramFindings.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-[#005581]"></span>
                                  دندان شماره FDI {item.toothNumber}:
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                                  {item.conditionText}
                                </span>
                              </div>
                              {item.surfacesText && (
                                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                  سطوح درگیر: <strong className="text-slate-800 dark:text-slate-200">{item.surfacesText}</strong>
                                </div>
                              )}
                              {item.notes && (
                                <div className="text-[11px] text-slate-500 italic">
                                  یادداشت: {item.notes}
                                </div>
                              )}
                              {item.treatments && item.treatments.length > 0 && (
                                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                  اقدامات ثبت‌شده: {item.treatments.join('، ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          مورد خاصی در چارت ثبت نشده و وضعیت دندان‌ها نرمال است.
                        </div>
                      )}
                    </div>

                    {/* Proposed Treatment Plan & Prescription */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#005581]" />
                          <span>طرح درمان نهایی:</span>
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 font-bold leading-relaxed whitespace-pre-line">
                          {proposedTreatmentPlan}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>نسخه دارویی تجویزی:</span>
                        </div>
                        {proposedPrescription.length > 0 ? (
                          <ul className="list-disc list-inside text-slate-900 dark:text-slate-100 font-bold space-y-1">
                            {proposedPrescription.map((rx, idx) => (
                              <li key={idx}>{rx}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic">بدون نیاز به نسخه دارویی</span>
                        )}
                      </div>
                    </div>
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
                          const profile = getClinicalProfileByReason(appointment.reason, activePatient, appointment);
                          setInsuranceNarrative(profile.insuranceNarrative);
                          setIsGeneratingNarrative(false);
                        }, 500);
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

        {/* 3. My Schedule (برنامه زمانی من - تعیین تایم‌های آزاد دندان‌پزشک جهت نوبت‌دهی منشی) */}
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
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#005581] dark:text-[#72cdf4] text-base flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-[#005581]" />
                  <span>مدیریت سفارشات لابراتوار و مراحل ساخت شفاف (متصل به کارتابل لابراتوار)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ثبت سفارشات پروتز و روکش و پیگیری لحظه‌ای پیشرفت ساخت در لابراتوار
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLabPatientId(activePatient.id);
                  setLabPatientName(activePatient.fullName);
                  setLabToothFdi(selectedToothFdi || 16);
                  setIsNewLabModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-[#ffd200] font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4 text-[#ffd200]" />
                <span>ثبت سفارش جدید لابراتوار</span>
              </button>
            </div>

            <div className="space-y-4">
              {currentLabOrders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  هیچ سفارش لابراتواری برای این کلینیک ثبت نشده است. جهت ثبت، از دکمه «ثبت سفارش جدید لابراتوار» استفاده کنید.
                </div>
              ) : (
                currentLabOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-black text-[#005581] dark:text-[#72cdf4]">
                          {ord.orderNumber || ord.id}
                        </span>
                        <strong className="text-slate-900 dark:text-slate-100 text-sm">
                          بیمار: {ord.patientName} (دندان #{ord.toothFdi})
                        </strong>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold text-[11px]">
                          {ord.itemType} {ord.shade ? `(رنگ: ${ord.shade})` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          لابراتوار: <strong className="text-slate-700 dark:text-slate-300">{ord.labName}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-[#ffd200] text-[#005581] font-black text-[10px]">
                          {ord.status === 'delivered' ? 'تحویل نهایی به مطب' : ord.status === 'shipped' ? 'ارسال‌شده به مطب' : ord.status === 'in_furnace' ? 'در کوره سانتر' : ord.status === 'designing' ? 'در حال طراحی CAD' : 'ثبت اولیه سفارش'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <span>مرحله جاری: <strong className="text-[#005581] dark:text-[#72cdf4]">{ord.currentMilestone}</strong></span>
                        <span className="font-mono">تاریخ تحویل مورد انتظار: {ord.expectedDeliveryDate}</span>
                      </div>
                      {ord.doctorNotes && (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                          <strong className="text-slate-900 dark:text-slate-100">یادداشت دندان‌پزشک:</strong> {ord.doctorNotes}
                        </p>
                      )}
                    </div>

                    {ord.stages && ord.stages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                        {ord.stages.map((stg, i) => (
                          <div key={i} className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col justify-between ${
                            stg.done
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-600 dark:text-slate-400'
                          }`}>
                            <div className="flex items-center justify-between gap-1">
                              <span>{i + 1}. {stg.name}</span>
                              {stg.done && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                            {stg.delayReason && <span className="block text-amber-600 text-[10px] mt-1">علت تأخیر: {stg.delayReason}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
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
                  پاسخ‌دهی به پرسش‌های آنلاین بیماران همراه با پیشنهاد هوش مصنوعی و اتصال خودکار به پنل منشی و بیمار
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
                  همه سوالات ({combinedQaList.length})
                </button>
                <button
                  onClick={() => setQaFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    qaFilter === 'pending'
                      ? 'bg-amber-500 text-slate-900 shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  در انتظار پاسخ ({combinedQaList.filter((i) => i.status === 'pending').length})
                </button>
                <button
                  onClick={() => setQaFilter('answered')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    qaFilter === 'answered'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                  }`}
                >
                  پاسخ‌داده‌شده ({combinedQaList.filter((i) => i.status === 'answered').length})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {combinedQaList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  هیچ سوالی از سوی بیماران برای این کلینیک ثبت نشده است.
                </div>
              ) : (
                combinedQaList
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
                  })
              )}
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

      {/* NEW LAB ORDER MODAL (ثبت سفارش کامل لابراتوار) */}
      {isNewLabModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    ثبت و انتقال مستقیم سفارش به کارتابل لابراتوار
                  </h3>
                  <p className="text-xs text-slate-500">
                    انتخاب لابراتوار مقصد، شید رنگ، متریال و ثبت دستور تراش توسط پزشک معالج
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewLabModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewLabOrder} className="space-y-4 text-xs">
              {/* Doctor and Lab Target Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#72cdf4]/10 border border-[#72cdf4]/30">
                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    لابراتوار مقصد: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedLabId}
                    onChange={(e) => {
                      setSelectedLabId(e.target.value);
                      const chosen = registeredLabs.find(l => l.id === e.target.value);
                      if (chosen) setLabName(chosen.name);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#72cdf4] bg-white font-bold text-[#005581]"
                  >
                    {registeredLabs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} (تحویل: {l.averageTurnaroundDays} روز)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    پزشک معالج سفارشدهنده: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={labDentistName}
                    onChange={(e) => setLabDentistName(e.target.value)}
                    placeholder="دکتر سارا فرهمند"
                    className="w-full px-3 py-2 rounded-xl border border-[#72cdf4] bg-white font-bold text-[#005581]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    بیمار: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={labPatientId}
                    onChange={(e) => {
                      setLabPatientId(e.target.value);
                      const p = allPatients.find(item => item.id === e.target.value);
                      if (p) setLabPatientName(p.fullName);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value={activePatient.id}>{activePatient.fullName} (بیمار جاری)</option>
                    {allPatients
                      .filter(p => p.id !== activePatient.id)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} - {p.phone}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره دندان FDI: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={labToothFdi}
                    onChange={(e) => setLabToothFdi(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                  >
                    {[18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28, 48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38].map(fdi => (
                      <option key={fdi} value={fdi}>
                        دندان #{fdi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع پروتز / رستوریشن: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={labItemType}
                    onChange={(e) => setLabItemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="روکش زيرکونيا کامل">روکش زيرکونيا کامل (Full Zirconia)</option>
                    <option value="سرامیک PFM">روکش سرامیک PFM</option>
                    <option value="لمینت Emax">لمینت سرامیکی Emax</option>
                    <option value="اباتمنت ایمپلنت">اباتمنت و روکش ایمپلنت</option>
                    <option value="نایت گارد">نایت‌گارد سخت / نرم</option>
                    <option value="پروتز پارسیل">پروتز متحرک پارسیل (کروم کبالت)</option>
                    <option value="پروتز کامل">دست‌دندان کامل (Full Denture)</option>
                    <option value="اینله / آنله">اینله / آنله سرامیکی</option>
                    <option value="بلیچینگ تری">تری بلیچینگ خانگی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رنگ دندان (Shade Guide): <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={labShade}
                    onChange={(e) => setLabShade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                  >
                    {['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'D2', 'BL1 (Bleach)', 'BL2', 'BL3'].map(sh => (
                      <option key={sh} value={sh}>{sh}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    متریال / آلیاژ مورد استفاده:
                  </label>
                  <input
                    type="text"
                    value={labAlloy}
                    onChange={(e) => setLabAlloy(e.target.value)}
                    placeholder="مثلاً: زیرکونیا چند لایه Multi-layer، تیتانیوم گرید ۵..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ تحویل مورد نیاز در مطب: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={labExpectedDate}
                    onChange={(e) => setLabExpectedDate(e.target.value)}
                    placeholder="۱۴۰۵/۰۵/۲۵"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  دستورالعمل تراش، مارجین و توضیحات فنی برای تکنسین لابراتوار:
                </label>
                <textarea
                  rows={3}
                  value={labDoctorNotes}
                  onChange={(e) => setLabDoctorNotes(e.target.value)}
                  placeholder="مارجین چمفر، رعایت اکلوژن آنتاگونیست، امبراژور طبیعی..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="p-3 bg-[#72cdf4]/15 rounded-xl border border-[#72cdf4] flex items-center gap-2 text-[#005581]">
                <Sparkles className="w-4 h-4 text-[#ffd200] shrink-0" />
                <span>
                  سفارش مستقیماً برای کارتابل «{registeredLabs.find(l => l.id === selectedLabId)?.name || labName}» ارسال شده و به صورت بلادرنگ همگام‌سازی می‌شود.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLabModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-[#ffd200] font-black shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>ثبت سفارش و ارسال به لابراتوار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALLERGIES & MEDICAL HISTORY EDIT MODAL */}
      {allergiesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    ویرایش حساسیت‌های دارویی و سوابق پزشکی بیمار
                  </h3>
                  <p className="text-xs text-slate-500">
                    پرونده بیمار: {activePatient.fullName} ({activePatient.udrCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAllergiesModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Allergies Section */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-rose-700 dark:text-rose-300 block">
                حساسیت‌های دارویی ثبت‌شده:
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
                {activePatient.allergies && activePatient.allergies.length > 0 ? (
                  activePatient.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-xs"
                    >
                      <span>{allergy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        className="hover:text-rose-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-rose-600/70 text-xs italic">حساسیت دارویی ثبت نشده است.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy(newAllergyInput);
                    }
                  }}
                  placeholder="افزودن حساسیت جدید (مثلاً پنی‌سیلین، آسپرین، لیدوکائین)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddAllergy(newAllergyInput)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  افزودن
                </button>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-amber-800 dark:text-amber-300 block">
                سوابق بیماری و پزشکی:
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                {activePatient.medicalHistory && activePatient.medicalHistory.length > 0 ? (
                  activePatient.medicalHistory.map((historyItem, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-xs"
                    >
                      <span>{historyItem}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHistory(historyItem)}
                        className="hover:text-amber-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-amber-700/70 text-xs italic">سوابق پزشکی خاصی ثبت نشده است.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHistoryInput}
                  onChange={(e) => setNewHistoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHistory(newHistoryInput);
                    }
                  }}
                  placeholder="افزودن سابقه پزشکی (مثلاً فشار خون، دیابت، بارداری)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddHistory(newHistoryInput)}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  افزودن
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAllergiesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow cursor-pointer"
              >
                تأیید و بازگشت به میز بالینی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
