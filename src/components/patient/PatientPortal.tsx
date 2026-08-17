import React, { useState, useEffect } from 'react';
import { Patient, Appointment, Invoice, InstallmentPlan, ToothDetail, Claim, UserProfile, PatientQuestion, PatientInsuranceDispute, SavedBankCard, ClinicRegistration } from '../../types';
import { OnlineBookingModal } from '../booking/OnlineBookingModal';
import { SimulatedPaymentGatewayModal } from '../booking/SimulatedPaymentGatewayModal';
import { OdontogramChart } from './OdontogramChart';
import { ImageXrayViewer } from '../dentist/ImageXrayViewer';
import { PersianBirthDatePicker } from '../common/PersianBirthDatePicker';
import { toPersianDigits, formatPricePersian } from '../../utils/persianDigits';
import {
  Heart,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  Layers,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Plus,
  Sparkles,
  MessageSquare,
  HelpCircle,
  UserCheck,
  User,
  Edit3,
  FileText,
  DollarSign,
  ChevronLeft,
  X,
  Send,
  Check,
  Baby,
  Eye,
  Box,
  ShieldAlert,
  ArrowRight,
  Receipt,
  Phone,
  MapPin,
  RefreshCw,
  Zap,
  Activity,
  FileCheck,
  Cpu,
  ImageIcon,
} from 'lucide-react';

interface PatientPortalProps {
  patient: Patient;
  appointments: Appointment[];
  invoices: Invoice[];
  installments: InstallmentPlan[];
  claims?: Claim[];
  insuranceModuleActive?: boolean;
  isInsuranceContracted?: boolean;
  users?: UserProfile[];
  currentClinic?: ClinicRegistration;
  questions?: PatientQuestion[];
  onAskQuestion?: (data: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientNationalId: string;
    category: string;
    question: string;
    dentistId?: string;
    dentistName?: string;
  }) => void;
  insuranceDisputes?: PatientInsuranceDispute[];
  onSubmitDispute?: (data: {
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
  }) => void;
  savedCards?: SavedBankCard[];
  onSaveNewCard?: (card: SavedBankCard) => void;
  onBookOnline: (
    dentistId: string,
    timeSlot: string,
    date: string,
    reason: string,
    isFirstVisit?: boolean,
    checkInFormCompleted?: boolean
  ) => void;
  onGrantConsent: (purpose: string, expiryDays: number) => void;
  onRevokeConsent: (tokenId: string) => void;
  onPayInvoice?: (invoiceId: string) => void;
  onPayInstallment?: (planId: string, installmentNo: number) => void;
  onUpdatePatientInfo?: (updatedPatient: Partial<Patient>) => void;
}

interface QAItem {
  id: string;
  category: 'نوبت' | 'درد' | 'پرداخت' | 'اقساط' | 'بیمه' | 'مراقبت‌های پس از درمان' | 'پزشکی';
  question: string;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
  status: 'answered' | 'pending' | 'referred_to_doctor';
  isClinicalUrgent?: boolean;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  appointments,
  invoices,
  installments,
  claims = [],
  insuranceModuleActive = true,
  isInsuranceContracted = true,
  users = [],
  currentClinic,
  questions = [],
  onAskQuestion,
  insuranceDisputes = [],
  onSubmitDispute,
  savedCards = [],
  onSaveNewCard,
  onBookOnline,
  onGrantConsent,
  onRevokeConsent,
  onPayInvoice,
  onPayInstallment,
  onUpdatePatientInfo,
}) => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'tooth_map' | 'radiography' | 'financial' | 'qa_portal' | 'insurance_claims' | 'consent_tokens' | 'profile'
  >('dashboard');

  // Chart view preferences
  const [chartMode, setChartMode] = useState<'2d' | '3d'>('2d');
  const [teethAgeGroup, setTeethAgeGroup] = useState<'adult' | 'pediatric'>('adult');
  const [selectedToothFdi, setSelectedToothFdi] = useState<number | null>(11);

  // Doctors in Clinic (Dynamically derived from clinic owner and users)
  const availableDentists = React.useMemo(() => {
    const list: { id: string; name: string; specialty?: string }[] = [];
    if (currentClinic?.ownerName && (currentClinic.ownerRole === 'dentist' || currentClinic.ownerRole === 'owner')) {
      const formattedOwner = currentClinic.ownerName.startsWith('دکتر') ? currentClinic.ownerName : `دکتر ${currentClinic.ownerName}`;
      list.push({
        id: `u-owner-${currentClinic.id || 'dentist'}`,
        name: formattedOwner,
        specialty: 'مؤسس کلینیک و دندان‌پزشک معالج',
      });
    }
    (users || []).forEach((u) => {
      if (u.role === 'dentist') {
        const already = list.some((x) => x.id === u.id || x.name.trim() === u.name.trim());
        if (!already) {
          list.push({
            id: u.id,
            name: u.name.startsWith('دکتر') ? u.name : `دکتر ${u.name}`,
            specialty: u.specialty || 'دندان‌پزشک معالج کلینیک',
          });
        }
      }
    });
    if (list.length === 0) {
      list.push(
        { id: 'u-dentist1', name: 'دکتر کاویانی', specialty: 'جراح و دندان‌پزشک معالج' },
        { id: 'u-dentist2', name: 'دکتر شریفی', specialty: 'متخصص ترمیم و زیبایی' }
      );
    }
    return list;
  }, [users, currentClinic]);

  // Online Booking Modal / Flow State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'doctor_reason' | 'calendar_select' | 'visit_fee' | 'checkin_form' | 'confirmed'>('doctor_reason');
  const [bookingDentist, setBookingDentist] = useState(availableDentists[0]?.id || 'u-dentist1');
  const [bookingSlot, setBookingSlot] = useState('۱۰:۳۰');
  const [bookingDate, setBookingDate] = useState('۲۰ مرداد');
  const [bookingReason, setBookingReason] = useState('معاینه دوره‌ای، عصب‌کشی و جرم‌گیری');
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Calendar Selection Sub-State (matching photo UI)
  const [selectionType, setSelectionType] = useState<'fastest' | 'custom'>('custom');
  const [selectedDay, setSelectedDay] = useState('امروز ۲۰ مرداد');
  const [selectedShift, setSelectedShift] = useState<'morning' | 'evening'>('morning');

  // 15-Minute Lock Timer (900 seconds)
  const [lockTimer, setLockTimer] = useState(900);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Comprehensive Check-in Form State (Default empty for patient to fill)
  const [checkInConditions, setCheckInConditions] = useState<string[]>([]);
  const [checkInAllergies, setCheckInAllergies] = useState<string[]>([]);
  const [checkInMedications, setCheckInMedications] = useState('');
  const [checkInIsPregnant, setCheckInIsPregnant] = useState(false);
  const [checkInEmergencyContact, setCheckInEmergencyContact] = useState('');
  const [checkInEmergencyPhone, setCheckInEmergencyPhone] = useState('');
  const [checkInSupplInsurance, setCheckInSupplInsurance] = useState('');

  // Online Payment Modal & Loading Delay State
  const [isConnectingPayment, setIsConnectingPayment] = useState(false);
  const [isVisitFeeGatewayOpen, setIsVisitFeeGatewayOpen] = useState(false);
  const [payingTarget, setPayingTarget] = useState<{
    type: 'invoice' | 'installment' | 'qa_package';
    id: string;
    title: string;
    amount: number;
    installmentNo?: number;
    qaCount?: number;
  } | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Q&A Quota & Package Purchase State
  const FREE_QA_LIMIT = 2;
  const [purchasedQaQuota, setPurchasedQaQuota] = useState(0);
  const totalAvailableQa = FREE_QA_LIMIT + purchasedQaQuota;
  const [showQaPackageModal, setShowQaPackageModal] = useState(false);

  // Derive patient's questions from props or local fallback
  const patientQuestionsList = (questions && questions.length > 0)
    ? questions.filter(
        (q) =>
          q.patientId === patient.id ||
          q.patientNationalId === patient.nationalId ||
          (q.patientName && q.patientName === patient.fullName)
      )
    : [];

  const [localQaList, setLocalQaList] = useState<QAItem[]>([]);
  const activeQaItems = patientQuestionsList.length > 0 ? patientQuestionsList : localQaList;
  const remainingQaQuota = Math.max(0, totalAvailableQa - activeQaItems.length);

  const [newQaCategory, setNewQaCategory] = useState<string>('مراقبت‌های پس از درمان');
  const [newQaQuestion, setNewQaQuestion] = useState('');

  // Consent Token Form State (According to 6-part specification)
  const [consentScopeRadiology, setConsentScopeRadiology] = useState(true);
  const [consentScopeDentalChart, setConsentScopeDentalChart] = useState(true);
  const [consentScopeFinancial, setConsentScopeFinancial] = useState(true);
  const [consentValidityDuration, setConsentValidityDuration] = useState<'3_months' | '6_months' | '1_year'>('3_months');
  const [consentInsuranceName, setConsentInsuranceName] = useState('بیمه تکمیلی دانا');
  const [consentSubTab, setConsentSubTab] = useState<'insurance' | 'ai_assistant'>('insurance');
  const [aiConsentGranted, setAiConsentGranted] = useState(true);

  // Derive Insurance Claims from props (filtered for this patient)
  const patientClaimsList = (claims || []).filter(
    (c) =>
      c.patientId === patient.id ||
      c.nationalId === patient.nationalId ||
      c.patientNationalId === patient.nationalId ||
      (c.patientName && c.patientName === patient.fullName)
  );

  // Derive Insurance Disputes from props (filtered for this patient)
  const patientDisputesList = (insuranceDisputes || []).filter(
    (d) =>
      d.patientId === patient.id ||
      d.nationalId === patient.nationalId ||
      (d.patientName && d.patientName === patient.fullName)
  );

  // Insurance Objections State
  const [showStandaloneDisputeModal, setShowStandaloneDisputeModal] = useState(false);
  const [selectedClaimForObjection, setSelectedClaimForObjection] = useState<string | null>(null);
  const [objectionTopic, setObjectionTopic] = useState('اعتراض به رد شدن هزینه توسط بیمه / عدم قرارداد کلینیک');
  const [objectionMessage, setObjectionMessage] = useState('');
  const [objectionClaimedAmount, setObjectionClaimedAmount] = useState<number>(0);
  const [objectionDeductionAmount, setObjectionDeductionAmount] = useState<number>(0);
  const [objectionImageName, setObjectionImageName] = useState<string | null>(null);
  const [objectionImageDesc, setObjectionImageDesc] = useState('');
  const [localObjectionsList, setLocalObjectionsList] = useState<Array<{
    id: string;
    trackingCode: string;
    topic: string;
    message: string;
    imageName?: string;
    imageDesc?: string;
    createdAt: string;
    status: 'under_review' | 'approved_pay' | 'need_docs' | 'rejected';
    responseMessage?: string;
  }>>([]);

  // Profile Form & Details State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(patient.fullName);
  const [editPhone, setEditPhone] = useState(patient.phone);
  const [editNationalId, setEditNationalId] = useState(patient.nationalId);
  const [editBirthDate, setEditBirthDate] = useState(patient.birthDate || '۱۳۶۵/۰۵/۱۰');
  const [editAddress, setEditAddress] = useState(patient.address || '');
  const [insuranceBaseName, setInsuranceBaseName] = useState(patient.primaryInsurance?.provider || 'بیمه تامین اجتماعی');
  const [insuranceBaseExpiry, setInsuranceBaseExpiry] = useState('تا پایان سال ۱۴۰۵');
  const [insuranceSuppName, setInsuranceSuppName] = useState(patient.supplementaryInsurance?.provider || (patient.supplementaryInsurance?.active ? 'بیمه تکمیلی سامان' : 'فاقد پوشش تکمیلی'));
  const [insuranceSuppExpiry, setInsuranceSuppExpiry] = useState(patient.supplementaryInsurance?.active ? 'تا ۲۰ اردیبهشت ۱۴۰۵' : 'غیرفعال');

  // Keep Profile state synced with patient prop changes
  useEffect(() => {
    setEditFullName(patient.fullName);
    setEditPhone(patient.phone);
    setEditNationalId(patient.nationalId);
    if (patient.birthDate) {
      setEditBirthDate(patient.birthDate);
    }
    if (patient.address !== undefined) {
      setEditAddress(patient.address);
    }
    if (patient.primaryInsurance?.provider) {
      setInsuranceBaseName(patient.primaryInsurance.provider);
    }
    if (patient.supplementaryInsurance?.provider) {
      setInsuranceSuppName(patient.supplementaryInsurance.provider);
    } else if (!patient.supplementaryInsurance?.active) {
      setInsuranceSuppName('فاقد پوشش تکمیلی');
    }
  }, [
    patient.id,
    patient.fullName,
    patient.phone,
    patient.nationalId,
    patient.birthDate,
    patient.address,
    patient.primaryInsurance?.provider,
    patient.supplementaryInsurance?.provider,
    patient.supplementaryInsurance?.active,
  ]);

  // Submit Objection Handler
  const handleAddObjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectionMessage.trim()) return;

    const newObj = {
      id: `obj-${Date.now()}`,
      trackingCode: selectedClaimForObjection || `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      topic: objectionTopic,
      message: objectionMessage,
      imageName: objectionImageName || undefined,
      imageDesc: objectionImageDesc || undefined,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      status: 'under_review' as const,
      responseMessage: 'پیام اعتراض شما ثبت گردید و به کارشناسان بیمه کلینیک ارجاع داده شد.',
    };

    if (onSubmitDispute) {
      onSubmitDispute({
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        nationalId: patient.nationalId,
        claimNumber: selectedClaimForObjection || `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
        insuranceProvider: patient.supplementaryInsurance?.provider || patient.primaryInsurance?.provider || 'بیمه تکمیلی',
        topic: objectionTopic,
        message: objectionMessage,
        imageName: objectionImageName || undefined,
        imageDesc: objectionImageDesc || undefined,
        claimedAmount: objectionClaimedAmount || 0,
        deductionAmount: objectionDeductionAmount || 0,
      });
    }

    setLocalObjectionsList([newObj, ...localObjectionsList]);
    setObjectionMessage('');
    setObjectionImageName(null);
    setObjectionImageDesc('');
    setSelectedClaimForObjection(null);
    alert('اعتراض بیمه‌ای شما با موفقیت ثبت گردید و به واحد بیمه کلینیک ارسال شد. کد پیگیری: ' + newObj.trackingCode);
  };

  // Submit Consent Token Handler
  const handleIssueConsentTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scopes: string[] = [];
    if (consentScopeRadiology) scopes.push('تصاویر رادیولوژی و مدارک (OPG، پریاپیکال)');
    if (consentScopeDentalChart) scopes.push('چارت دندان و درمان‌ها (FDI)');
    if (consentScopeFinancial) scopes.push('فاکتورها و جزئیات مالی');

    if (scopes.length === 0) {
      alert('لطفاً حداقل یک قلمرو دسترسی برای بیمه تعیین نمایید.');
      return;
    }

    const durationDays = consentValidityDuration === '3_months' ? 90 : consentValidityDuration === '6_months' ? 180 : 365;
    const purposeText = `دسترسی به ${scopes.join('، ')} - ${consentInsuranceName}`;
    onGrantConsent(purposeText, durationDays);

    alert(`توکن رضایت الکترونیک برای ${consentInsuranceName} با موفقیت صادر گردید.`);
  };

  // Handle 15-Minute Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockTimer === 0) {
      setIsTimerActive(false);
      alert('زمان ۱۵ دقیقه‌ای قفل نوبت شما به پایان رسید و اسلات به لیست زمان‌های آزاد بازگشت.');
      setBookingStep('calendar_select');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, lockTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initiate Payment Gateway with Realistic Connection Delay
  const handleInitiatePayment = (target: {
    type: 'invoice' | 'installment' | 'qa_package';
    id: string;
    title: string;
    amount: number;
    installmentNo?: number;
    qaCount?: number;
  }) => {
    setIsConnectingPayment(true);
    setTimeout(() => {
      setIsConnectingPayment(false);
      setPayingTarget(target);
    }, 1500);
  };

  // Start Booking Flow
  const handleStartBookingProcess = () => {
    setShowBookingModal(true);
    setBookingStep('doctor_reason');
    setLockTimer(900);
    setIsTimerActive(false);
  };

  const handleSelectSlotAndLock = () => {
    setIsTimerActive(true);
    if (isFirstVisit) {
      setBookingStep('visit_fee');
    } else {
      // Patients who already have existing files/records bypass check-in form
      handleFinalizeBooking(true);
    }
  };

  const handleConfirmVisitPayment = () => {
    setIsVisitFeeGatewayOpen(true);
  };

  const handleVisitFeePaymentSuccess = () => {
    setIsVisitFeeGatewayOpen(false);
    setBookingStep('checkin_form');
  };

  const handleFinalizeBooking = (skipCheckIn = false) => {
    alert(`نوبت شما با موفقیت ثبت شد!\nتاریخ: ${toPersianDigits(selectedDay)} - ساعت: ${toPersianDigits(bookingSlot)}\nکد رهگیری و مشخصات به شماره همراه شما پیامک گردید.`);
    const fullDate = selectedDay.includes('مرداد') ? `۱۴۰۵/۰۵/${selectedDay.match(/\d+/)?.[0] || '۲۰'}` : '۱۴۰۵/۰۵/۲۰';
    onBookOnline(
      bookingDentist,
      bookingSlot,
      fullDate,
      bookingReason,
      isFirstVisit,
      !skipCheckIn
    );
    setIsTimerActive(false);
    setBookingStep('confirmed');
  };

  // Q&A Submit with Quota Limit & Pending Answer Flow
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQaQuestion.trim()) return;

    // Check Question Quota
    if (activeQaItems.length >= totalAvailableQa) {
      setShowQaPackageModal(true);
      return;
    }

    const isClinical = newQaCategory === 'درد' || newQaCategory === 'پزشکی' || newQaCategory === 'مراقبت‌های پس از درمان';

    const newQA: QAItem = {
      id: `qa-${Date.now()}`,
      category: newQaCategory as any,
      question: newQaQuestion,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      status: 'referred_to_doctor',
      isClinicalUrgent: isClinical,
      answer: undefined, // Answer is NOT immediate; requires doctor response
      answeredAt: undefined,
    };

    if (onAskQuestion) {
      onAskQuestion({
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        patientNationalId: patient.nationalId,
        category: newQaCategory,
        question: newQaQuestion,
        isClinicalUrgent: isClinical,
      });
    }

    setLocalQaList([newQA, ...localQaList]);
    setNewQaQuestion('');
  };

  // Handle Online Payment Execution
  const handleExecuteOnlinePayment = () => {
    if (!payingTarget) return;

    if (payingTarget.type === 'invoice' && onPayInvoice) {
      onPayInvoice(payingTarget.id);
      setPaymentSuccessMessage(`پرداخت آنلاین فاکتور ${payingTarget.title} با موفقیت انجام شد.`);
    } else if (payingTarget.type === 'installment' && onPayInstallment && payingTarget.installmentNo) {
      onPayInstallment(payingTarget.id, payingTarget.installmentNo);
      setPaymentSuccessMessage(`قسط شماره ${payingTarget.installmentNo} به مبلغ ${payingTarget.amount.toLocaleString()} تومان پرداخت گردید.`);
    } else if (payingTarget.type === 'qa_package' && payingTarget.qaCount) {
      setPurchasedQaQuota((prev) => prev + payingTarget.qaCount!);
      setPaymentSuccessMessage(`خرید ${payingTarget.title} با موفقیت انجام شد. ${payingTarget.qaCount} سوال به سهمیه مشاوره شما اضافه گردید.`);
    }

    setPayingTarget(null);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePatientInfo) {
      onUpdatePatientInfo({
        fullName: editFullName,
        phone: editPhone,
        nationalId: editNationalId,
        birthDate: editBirthDate,
        address: editAddress,
      });
    }
    setIsEditingProfile(false);
    alert('اطلاعات شخصی و پرونده با موفقیت ذخیره گردید.');
  };

  // FDI Tooth Lists
  const adultUpperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const adultLowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  const pediatricUpperTeeth = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
  const pediatricLowerTeeth = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

  const currentSelectedDetail: ToothDetail | undefined = selectedToothFdi
    ? patient.teethMap[selectedToothFdi]
    : undefined;

  // Filtered Financial items for current patient
  const patientInvoices = invoices.filter(
    (inv) =>
      inv.patientId === patient.id ||
      inv.patientNationalId === patient.nationalId ||
      (inv.patientName && inv.patientName === patient.fullName)
  );

  const patientInstallments = installments.filter(
    (inst) =>
      inst.patientId === patient.id ||
      inst.patientNationalId === patient.nationalId ||
      (inst.patientName && inst.patientName === patient.fullName)
  );

  // Q&A list to render
  const combinedQaList = activeQaItems;

  // Combined disputes list
  const combinedDisputesList = [
    ...patientDisputesList.map((d) => ({
      id: d.id,
      trackingCode: d.claimNumber || d.id,
      topic: d.topic,
      message: d.message,
      imageName: d.imageName,
      imageDesc: d.imageDesc,
      claimedAmount: d.claimedAmount,
      deductionAmount: d.deductionAmount,
      createdAt: d.createdAt,
      status: d.status,
      responseMessage: d.responseMessage,
    })),
    ...localObjectionsList,
  ];

  const fallbackClaims = [
    {
      id: 'clm-9021',
      code: 'CLM-9021',
      claimNumber: 'CLM-9021',
      treatmentName: 'عصب‌کشی ۳ کانال و پرکردن دندان ۴۶',
      insurerName: patient.supplementaryInsurance?.provider || 'بیمه تکمیلی دانا',
      insuranceProvider: patient.supplementaryInsurance?.provider || 'بیمه تکمیلی دانا',
      date: '۱۴۰۵/۰۵/۰۵',
      status: 'rejected' as const,
      statusLabel: 'رد شده توسط ارزیاب بیمه',
      reason: 'عدم ارائه/عدم انطباق مدرک رادیوگرافی OPG اولیه',
      amount: 350000,
      deductedAmount: 350000,
    },
    {
      id: 'clm-8842',
      code: 'CLM-8842',
      claimNumber: 'CLM-8842',
      treatmentName: 'ترمیم کامپوزیت خلفی دندان ۳۶',
      insurerName: patient.supplementaryInsurance?.provider || 'بیمه تکمیلی آرمان',
      insuranceProvider: patient.supplementaryInsurance?.provider || 'بیمه تکمیلی آرمان',
      date: '۱۴۰۵/۰۴/۲۸',
      status: 'deducted' as const,
      statusLabel: 'کسورات غیرمجاز فرانشیز',
      reason: 'کسر سقف تعهد ریالی ارزیاب بیمه تکمیلی',
      amount: 450000,
      deductedAmount: 120000,
    },
    {
      id: 'clm-7105',
      code: 'CLM-7105',
      claimNumber: 'CLM-7105',
      treatmentName: 'جرم‌گیری و بروساژ کامل دو فک',
      insurerName: patient.primaryInsurance?.provider || 'بیمه سلامت ایرانیان',
      insuranceProvider: patient.primaryInsurance?.provider || 'بیمه سلامت ایرانیان',
      date: '۱۴۰۵/۰۴/۱۰',
      status: 'approved' as const,
      statusLabel: 'تأییدشده و تسویه کامل',
      reason: 'سهم بیمه مستقیماً به حساب کلینیک واریز شد',
      amount: 200000,
      deductedAmount: 0,
    },
  ];

  const displayClaims = patientClaimsList.length > 0
    ? patientClaimsList.map((c) => ({
        id: c.id,
        code: c.claimNumber || c.id,
        claimNumber: c.claimNumber || c.id,
        treatmentName: c.treatmentName || 'درمان دندان‌پزشکی',
        insurerName: c.insuranceProvider || c.supplementaryInsurerName || c.primaryInsurerName || 'بیمه طرف قرارداد',
        date: c.dateOfService || c.serviceDate || '۱۴۰۵/۰۵/۰۱',
        status: (c.status === 'rejected' ? 'rejected' : c.status === 'approved' ? 'approved' : 'deducted') as 'rejected' | 'deducted' | 'approved',
        statusLabel: c.status === 'rejected' ? 'رد شده توسط ارزیاب بیمه' : c.status === 'approved' ? 'تأییدشده و تسویه کامل' : 'کسورات غیرمجاز فرانشیز',
        reason: c.deductionReason || c.narrativeText || 'بررسی شده در سامانه رسیدگی اسناد الکترونیک',
        amount: c.claimedAmount || c.totalClaimedAmount || 0,
        deductedAmount: c.deductionAmount || 0,
      }))
    : fallbackClaims;

  // Requirement: Insurance Claims & Disputes tab is only active/visible when clinic is NOT contracted with insurance, but Dentora Insurance module is active.
  const isInsuranceClaimsTabVisible = insuranceModuleActive && !isInsuranceContracted;

  // Auto-switch away from insurance_claims if condition is no longer met
  useEffect(() => {
    if (activeTab === 'insurance_claims' && !isInsuranceClaimsTabVisible) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isInsuranceClaimsTabVisible]);

  // Dynamic slot calculation: Show empty/available timeslots determined by doctor & receptionist schedule
  const defaultMorningMasterSlots = ['۰۹:۰۰', '۰۹:۳۰', '۱۰:۰۰', '۱۰:۳۰', '۱۱:۰۰', '۱۱:۳۰', '۱۲:۰۰'];
  const defaultEveningMasterSlots = ['۱۶:۰۰', '۱۶:۳۰', '۱۷:۰۰', '۱۷:۳۰', '۱۸:۰۰', '۱۸:۳۰', '۱۹:۰۰', '۱۹:۳۰'];

  const selectedDentistObj = availableDentists.find((d) => d.id === bookingDentist) || availableDentists[0];
  const selectedDentistName = selectedDentistObj?.name || '';

  // Filter out slots that are already booked for this doctor on this day
  const bookedSlotsOnDay = (appointments || [])
    .filter((apt) => {
      if (apt.status === 'cancelled') return false;
      const isDocMatch =
        apt.dentistId === bookingDentist ||
        (selectedDentistName && apt.dentistName && selectedDentistName.includes(apt.dentistName)) ||
        (apt.dentistName && selectedDentistName && apt.dentistName.includes(selectedDentistName));
      return isDocMatch;
    })
    .map((apt) => apt.time);

  const availableMorningSlots = defaultMorningMasterSlots.filter((slot) => !bookedSlotsOnDay.includes(slot));
  const availableEveningSlots = defaultEveningMasterSlots.filter((slot) => !bookedSlotsOnDay.includes(slot));

  const morningSlots = availableMorningSlots.length > 0 ? availableMorningSlots : ['۰۹:۳۰', '۱۰:۳۰', '۱۱:۳۰'];
  const eveningSlots = availableEveningSlots.length > 0 ? availableEveningSlots : ['۱۶:۳۰', '۱۷:۳۰', '۱۸:۳۰'];

  const fastestAvailableSlot = morningSlots[0] || eveningSlots[0] || '۱۰:۳۰';

  const daysList = [
    { title: 'امروز', dateStr: '۲۰ مرداد' },
    { title: 'فردا', dateStr: '۲۱ مرداد' },
    { title: 'پنج‌شنبه', dateStr: '۲۲ مرداد' },
    { title: 'جمعه', dateStr: '۲۳ مرداد' },
    { title: 'شنبه', dateStr: '۲۴ مرداد' },
  ];

  return (
    <div className="space-y-6 dir-rtl font-sans">
      {/* 1. Header Banner (Brand Colors #005581) */}
      <div className="bg-gradient-to-r from-[#004266] via-[#005581] to-[#00334e] text-white rounded-3xl p-6 shadow-lg border border-[#72cdf4]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#ffd200] font-bold shadow-inner shrink-0">
            <Heart className="w-8 h-8 fill-[#ffd200]/20" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-mono font-bold">
                UDR: {patient.udrCode}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#ffd200] text-slate-900 font-extrabold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>پورتال سلامت دندان بیمار</span>
              </span>
              {patient.isLegalGuardian && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/30 text-amber-100 border border-amber-300/30 font-bold flex items-center gap-1">
                  <Baby className="w-3.5 h-3.5 text-amber-200" />
                  <span>سرپرست قانونی فرزند: {patient.childName || 'پوشش اطفال'}</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>خوش‌آمدید، {patient.fullName}</span>
            </h2>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              مدیریت نوبت‌ها، پرونده الکترونیک سلامت دندان، صورت‌حساب‌ها، پرسش‌وپاسخ و دسترسی‌های بیمه
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 w-full md:w-auto justify-end">
          <button
            onClick={handleStartBookingProcess}
            className="w-full sm:w-auto px-5 py-3 bg-[#ffd200] hover:bg-amber-400 text-slate-900 font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-yellow-300"
          >
            <Calendar className="w-4 h-4" />
            <span>ثبت نوبت آنلاین</span>
          </button>
        </div>
      </div>

      {/* Payment Success Notification Toast */}
      {paymentSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{paymentSuccessMessage}</span>
          </div>
          <button
            onClick={() => setPaymentSuccessMessage(null)}
            className="p-1 hover:bg-emerald-200/50 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Main Sidebar & Content Container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Right Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-1">
          <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 mb-1">
            منوی اصلی پورتال
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>داشبورد و نوبت‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('tooth_map')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tooth_map'
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>کیف سلامت و پرونده دندان</span>
          </button>

          <button
            onClick={() => setActiveTab('radiography')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'radiography'
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4" />
              <span>تصاویر و رادیوگرافی (PACS)</span>
            </div>
            {(patient.patientImages || []).length > 0 && (
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'radiography' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-[#005581] dark:text-[#72cdf4]'
              }`}>
                {(patient.patientImages || []).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>فاکتورها، بدهی‌ها و اقساط</span>
          </button>

          <button
            onClick={() => setActiveTab('qa_portal')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'qa_portal'
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>پورتال پرسش و پاسخ تخصصی</span>
          </button>

          {isInsuranceClaimsTabVisible && (
            <button
              onClick={() => setActiveTab('insurance_claims')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'insurance_claims'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>ادعاها و اعتراضات بیمه‌ای</span>
            </button>
          )}

          {insuranceModuleActive && (
            <button
              onClick={() => setActiveTab('consent_tokens')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'consent_tokens'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>توکن‌های رضایت (Consent)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>پروفایل و اطلاعات من</span>
          </button>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ========================================================== */}
          {/* TAB 1: DASHBOARD & APPOINTMENTS                            */}
          {/* ========================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Upcoming Scheduled Appointments ONLY */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#005581]" />
                    <span>نوبت‌های فعال و پیش‌رو</span>
                  </h3>
                  <button
                    onClick={handleStartBookingProcess}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[#005581] dark:text-[#72cdf4] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>رزرو نوبت جدید</span>
                  </button>
                </div>

                {(() => {
                  const myAppointments = appointments.filter(
                    (a) => a.patientId === patient.id || a.nationalId === patient.nationalId || a.patientName === patient.fullName
                  );
                  const scheduledApts = myAppointments.filter((a) => a.status === 'scheduled');
                  if (scheduledApts.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                        <p className="text-xs">در حال حاضر نوبت رزروشده پیش‌رویی ندارید.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {scheduledApts.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-4 rounded-2xl border border-[#005581]/30 bg-blue-50/20 dark:bg-slate-800/60 text-xs space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="space-y-1">
                              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">
                                علت مراجعه: {apt.reason}
                              </span>
                              <div className="text-slate-500 text-xs flex items-center gap-2">
                                <span>پزشک معالج: <strong>{apt.dentistName}</strong></span>
                                <span>|</span>
                                <span>کد نوبت: <strong className="font-mono">{apt.id}</strong></span>
                              </div>
                            </div>

                            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#005581] text-white">
                              رزرو قطعی
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                            <div>
                              تاریخ مراجعه: <strong className="font-mono text-slate-800 dark:text-slate-200">{apt.date}</strong>
                            </div>
                            <div>
                              ساعت دقیق: <strong className="font-mono text-[#005581] font-bold">{apt.timeSlot}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Past / In-Clinic Appointment History */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#005581]" />
                  <span>تاریخچه مراجعات و خدمات انجام‌شده</span>
                </h3>

                {(() => {
                  const myAppointments = appointments.filter(
                    (a) => a.patientId === patient.id || a.nationalId === patient.nationalId || a.patientName === patient.fullName
                  );
                  const historyApts = myAppointments.filter((a) => a.status !== 'scheduled');
                  if (historyApts.length === 0) {
                    return (
                      <div className="text-xs text-slate-400 py-3">
                        سابقه مراجعه قبلی ثبت نگردیده است.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {historyApts.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                            <span>خدمت / علت: {apt.reason}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                apt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'in_unit'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : apt.status === 'checked_in'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {apt.status === 'completed'
                                ? 'تکمیل‌شده'
                                : apt.status === 'in_unit'
                                ? 'در حال درمان روی یونیت'
                                : apt.status === 'checked_in'
                                ? 'پذیرش‌شده در کلینیک'
                                : 'لغوشده'}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] flex justify-between items-center">
                            <span>پزشک: {apt.dentistName}</span>
                            <span className="font-mono">{apt.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Emergency Contact Box */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white space-y-2 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-[#ffd200]">
                    <Phone className="w-4 h-4 text-[#ffd200]" />
                    <span>پشتیبانی و نوبت‌دهی تلفنی ضروری</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    در صورت نیاز به مشاوره‌های فوری پس از درمان یا بروز درد شدید با کلینیک تماس بگیرید:
                  </p>
                </div>
                <div className="font-mono text-sm font-black text-[#ffd200] bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 shrink-0">
                  ۰۲۱-۸۸۸۸۴۴۴۴ (داخلی ۱)
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: DENTAL WALLET & ODONTOGRAM CHART                    */}
          {/* ========================================================== */}
          {activeTab === 'tooth_map' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#005581]" />
                  <span>کیف پول سلامت و نقشه اودونتوگرام دندان‌ها</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مشاهده سوابق بالینی طولی درمان‌ها و وضعیت سلامتی دندان‌های دائمی و شیری (غیرقابل تغییر توسط بیمار)
                </p>
              </div>

              {/* Static Odontogram Chart Component */}
              <OdontogramChart
                teethMap={patient.teethMap || {}}
                selectedToothFdi={selectedToothFdi}
                onSelectTooth={(fdi) => setSelectedToothFdi(fdi)}
                readOnly={true}
              />

              {/* Selected Tooth Detail Panel */}
              {selectedToothFdi && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#005581] text-white font-mono font-black text-sm flex items-center justify-center">
                        {selectedToothFdi}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        جزئیات سوابق بالینی دندان شماره {selectedToothFdi}
                      </span>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-[#005581]">
                      وضعیت: {currentSelectedDetail?.condition || 'سالم'}
                    </span>
                  </div>

                  {currentSelectedDetail?.treatmentHistory && currentSelectedDetail.treatmentHistory.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">تاریخچه درمان‌های این دندان:</span>
                      <div className="space-y-2">
                        {currentSelectedDetail.treatmentHistory.map((th) => (
                          <div
                            key={th.id}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center"
                          >
                            <div>
                              <strong className="text-slate-900 dark:text-slate-100 block">{th.procedureName}</strong>
                              <span className="text-slate-500 text-[11px]">پزشک: {th.dentistName} | تاریخ: {th.date}</span>
                            </div>
                            <span className="font-mono font-bold text-[#005581] text-xs">
                              {th.cost.toLocaleString()} تومان
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic py-2">
                      هیچ درمان ثبت‌شده‌ای برای این دندان وجود ندارد.
                    </div>
                  )}
                </div>
              )}

              {/* Comprehensive Records & History (Synced across Dentist, Receptionist & Patient) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#005581]" />
                  <span>پرونده جامع بالینی، یادداشت‌های پزشک و نسخه‌ها</span>
                </h4>

                {/* Doctor Clinical Notes */}
                {patient.clinicalNotes && patient.clinicalNotes.length > 0 && (
                  <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                    <h5 className="text-xs font-bold text-[#005581] dark:text-[#72cdf4] flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>یادداشت‌ها و شرح تشخیصی دندان‌پزشک معالج:</span>
                    </h5>
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {patient.clinicalNotes.map((note, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescriptions */}
                {patient.prescriptions && patient.prescriptions.length > 0 && (
                  <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      <span>نسخه‌های دارویی صادرشده:</span>
                    </h5>
                    <div className="space-y-2 text-xs">
                      {patient.prescriptions.map((rx) => (
                        <div key={rx.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                            <span>پزشک معالج: {rx.dentistName}</span>
                            <span className="font-mono text-slate-500 text-[11px]">{rx.date}</span>
                          </div>
                          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                            {rx.items.map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ul>
                          {rx.instructions && (
                            <p className="text-[11px] text-slate-500 mt-2 italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                              دستور مصرف: {rx.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Treatments Log across all teeth */}
                {(() => {
                  const allLogs = Object.values(patient.teethMap || {}).flatMap((t: ToothDetail) =>
                    (t.treatmentHistory || []).map((th) => ({ ...th, toothFdi: t.fdiNumber }))
                  );

                  return (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">سوابق تمام اقدامات درمانی انجام‌شده:</h5>
                      {allLogs.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          هنوز اقدام درمانی تکمیل‌شده‌ای ثبت نشده است.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {allLogs.map((log) => (
                            <div
                              key={log.id}
                              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex justify-between items-center"
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
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Medical History & Allergies */}
                {(patient.medicalHistory?.length > 0 || patient.allergies?.length > 0) && (
                  <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-2">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">سوابق پزشکی و حساسیت‌ها:</span>
                    {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                      <div className="space-y-1 text-slate-700 dark:text-slate-300">
                        {patient.medicalHistory.map((mh, idx) => (
                          <div key={idx}>• {mh}</div>
                        ))}
                      </div>
                    )}
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="text-rose-700 dark:text-rose-400 font-bold text-[11px]">
                        حساسیت‌های دارویی و غذایی: {patient.allergies.join('، ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2.5: RADIOGRAPHY & PACS GALLERY VIEWER                 */}
          {/* ========================================================== */}
          {activeTab === 'radiography' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#005581]" />
                    <span>گالری تصاویر رادیوگرافی و علائم بالینی (Web-PACS)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    مشاهده عکس‌های RVG، OPG، مقاطع سه‌بعدی CBCT و نشانه‌گذاری‌های تشخیصی پزشک معالج و هوش مصنوعی
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#005581] dark:text-[#72cdf4] border border-blue-200 dark:border-blue-800">
                  {patient.patientImages?.length || 0} تصویر متصل به پرونده
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <ImageXrayViewer
                  patientName={patient.fullName}
                  patientId={patient.id}
                  doctorName="دکتر معالج"
                  toothFdi={selectedToothFdi || 16}
                  patientImages={patient.patientImages || []}
                  readOnly={true}
                />
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: INVOICES, DEBTS & INSTALLMENTS                       */}
          {/* ========================================================== */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Invoices Breakdown Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Receipt className="w-5 h-5 text-[#005581]" />
                  <span>صورت‌حساب‌ها و فاکتورهای درمان (تفکیک چندسهمی)</span>
                </h3>

                {patientInvoices.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      هیچ بدهی یا صورت‌حساب درمانی ثبت‌نشده است.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                      پس از حضور در کلینیک، انجام اقدامات درمانی توسط دندان‌پزشک و ارسال گزارش به پذیرش، صورت‌حساب مربوط به سهم شما در این بخش صادر و امکان پرداخت آنلاین فعال خواهد شد.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientInvoices.map((inv) => {
                      const patientNet = inv.totalAmount - inv.baseInsuranceCovered - inv.supplInsuranceCovered;
                      const isPaid = inv.status === 'paid';

                      return (
                        <div
                          key={inv.id}
                          className={`p-4 rounded-2xl border text-xs space-y-3 transition ${
                            isPaid
                              ? 'border-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <div>
                              <strong className="text-slate-900 dark:text-slate-100 text-sm block">
                                فاکتور شماره {inv.id}
                              </strong>
                              <span className="text-slate-500 text-[11px]">
                                پزشک: {inv.dentistName} | تاریخ صادرشده: {inv.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-black ${
                                  isPaid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                }`}
                              >
                                {isPaid ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> تسویه‌شده آنلاین
                                  </span>
                                ) : (
                                  'پرداخت‌نشده (بدهکار)'
                                )}
                              </span>

                              {!isPaid && (
                                <button
                                  onClick={() =>
                                    handleInitiatePayment({
                                      type: 'invoice',
                                      id: inv.id,
                                      title: `فاکتور ${inv.id}`,
                                      amount: patientNet,
                                    })
                                  }
                                  className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span>پرداخت آنلاین ({patientNet.toLocaleString()} تومان)</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Multi-Share Financial Breakdown */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
                            <div>
                              مبلغ کل فاکتور: <strong className="font-mono text-slate-800 dark:text-slate-200">{inv.totalAmount.toLocaleString()} تومان</strong>
                            </div>
                            <div>
                              سهم بیمه پایه: <strong className="font-mono text-cyan-600">{inv.baseInsuranceCovered.toLocaleString()} تومان</strong>
                            </div>
                            <div>
                              سهم بیمه تکمیلی: <strong className="font-mono text-[#005581]">{inv.supplInsuranceCovered.toLocaleString()} تومان</strong>
                            </div>
                            <div>
                              خالص سهم بیمار: <strong className="font-mono text-rose-600 font-extrabold">{patientNet.toLocaleString()} تومان</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Installments & BNPL Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <CreditCard className="w-5 h-5 text-[#005581]" />
                  <span>پلان اقساط و تسهیلات BNPL (پرداخت به ترتیب الزامی است)</span>
                </h3>

                {patientInstallments.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                    هیچ طرح اقساط فعال یا بدهی تقسیط‌شده‌ای برای پرونده شما ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientInstallments.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        plan.isBNPL
                          ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 text-xs">
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 text-sm block">
                            طرح اقساط {plan.isBNPL ? 'اعتباری BNPL' : 'عادی کلینیک'}
                          </strong>
                          <span className="text-slate-500">مبلغ درمان: {plan.totalAmount.toLocaleString()} تومان</span>
                        </div>

                        {plan.isBNPL ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-yellow-300" />
                            <span>تسویه‌شده ۱۰۰٪ با کلینیک توسط BNPL</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#005581]">
                            مانده اقساط کلینیک: {plan.remainingAmount.toLocaleString()} تومان
                          </span>
                        )}
                      </div>

                      {plan.isBNPL ? (
                        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>پرداخت ۱۰۰٪ یکجای هزینه به کلینیک توسط پلتفرم BNPL</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                            کل هزینه درمان توسط شرکت BNPL به کلینیک واریز گردیده است. اقساط ماهانه ({plan.installmentsCount} قسط هر کدام {plan.monthlyAmount.toLocaleString()} تومان) مستقیماً توسط شما با سرویس BNPL تسویه می‌شود.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {plan.schedule.map((item) => {
                            // Enforce sequential payment order
                            const hasUnpaidPrior = plan.schedule.some(
                              (prev) => prev.installmentNo < item.installmentNo && prev.status !== 'paid'
                            );

                            return (
                              <div
                                key={item.installmentNo}
                                className={`p-3 rounded-xl border text-xs space-y-2 transition ${
                                  item.status === 'paid'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                                    : hasUnpaidPrior
                                    ? 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <div className="flex justify-between font-bold">
                                  <span>قسط شماره {item.installmentNo}</span>
                                  <span className="font-mono text-slate-500">{item.dueDate}</span>
                                </div>
                                <div className="font-mono text-sm font-extrabold text-[#005581]">
                                  {item.amount.toLocaleString()} تومان
                                </div>
                                {item.status === 'paid' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                                    <Check className="w-3.5 h-3.5" /> تسویه‌شده
                                  </span>
                                ) : hasUnpaidPrior ? (
                                  <button
                                    onClick={() =>
                                      alert(
                                        `پرداخت اقساط باید به ترتیب انجام شود. لطفاً ابتدا قسط شماره ${
                                          item.installmentNo - 1
                                        } را تسویه نمایید.`
                                      )
                                    }
                                    className="w-full py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-700"
                                  >
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    <span>نیازمند تسویه قسط قبلی</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleInitiatePayment({
                                        type: 'installment',
                                        id: plan.id,
                                        title: `قسط شماره ${item.installmentNo}`,
                                        amount: item.amount,
                                        installmentNo: item.installmentNo,
                                      })
                                    }
                                    className="w-full py-1.5 bg-[#005581] hover:bg-[#004266] text-white rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>پرداخت آنلاین قسط</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

          {/* ========================================================== */}
          {/* TAB 4: CATEGORIZED Q&A PORTAL                               */}
          {/* ========================================================== */}
          {activeTab === 'qa_portal' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#005581]" />
                  <span>پورتال پرسش و پاسخ تخصصی دندان‌پزشکی</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  طرح سوالات مراقبتی، بالینی، اداری و بیمه‌ای. پاسخ‌ها پس از بررسی تخصصی دندان‌پزشک معالج در کارتابل شما ثبت می‌گردد.
                </p>
              </div>

              {/* Consultation Quota Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#005581] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 block">
                      سهمیه مشاوره تخصصی آنلاین شما
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {activeQaItems.length < totalAvailableQa
                        ? `${totalAvailableQa - activeQaItems.length} سوال از کل سهمیه ${totalAvailableQa} عددی شما باقی مانده است.`
                        : 'سهمیه سوالات رایگان شما به پایان رسیده است.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQaPackageModal(true)}
                  className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>خرید بسته مشاوره</span>
                </button>
              </div>

              {/* Submit Question Form */}
              <form onSubmit={handleAddQuestion} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      دسته‌بندی موضوع:
                    </label>
                    <select
                      value={newQaCategory}
                      onChange={(e) => setNewQaCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                    >
                      <option value="مراقبت‌های پس از درمان">مراقبت‌های پس از درمان</option>
                      <option value="درد">درد و موارد اضطراری</option>
                      <option value="نوبت">نوبت‌دهی و زمان‌بندی</option>
                      <option value="پرداخت">پرداخت و فاکتور</option>
                      <option value="اقساط">اقساط و BNPL</option>
                      <option value="بیمه">بیمه پایه و تکمیلی</option>
                      <option value="پزشکی">مشاوره عمومی پزشکی</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    متن پرسش شما:
                  </label>
                  <textarea
                    rows={3}
                    value={newQaQuestion}
                    onChange={(e) => setNewQaQuestion(e.target.value)}
                    placeholder="سوال خود را با جزئیات بنویسید..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>ثبت پرسش جهت ارجاع به پزشک</span>
                </button>
              </form>

              {/* QA History List */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">پرسش‌های قبلی شما:</span>
                {activeQaItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#005581] font-bold text-[11px]">
                        دسته: {item.category}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{item.createdAt}</span>
                    </div>

                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      سوال: {item.question}
                    </div>

                    {item.answer ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-1.5">
                          <span className="font-extrabold text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>پاسخ رسمی دندان‌پزشک معالج ({item.repliedBy || 'دکتر معالج'}):</span>
                          </span>
                          {item.answeredAt && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                              {item.answeredAt}
                            </span>
                          )}
                        </div>
                        <p className="leading-relaxed font-medium text-slate-800 dark:text-slate-100 pt-0.5">{item.answer}</p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
                        <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                        <div>
                          <span className="font-extrabold block text-amber-900 dark:text-amber-100">
                            در انتظار بررسی و پاسخ دندان‌پزشک معالج
                          </span>
                          <span className="text-[11px] text-amber-700 dark:text-amber-300">
                            پرسش شما در کارتابل بالینی پزشک ثبت شده و پس از بررسی تخصصی پاسخ داده خواهد شد.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: INSURANCE CLAIMS & DISPUTES                          */}
          {/* ========================================================== */}
          {isInsuranceClaimsTabVisible && activeTab === 'insurance_claims' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#005581]" />
                  <span>پیگیری ادعاها، کسورات و اعتراضات بیمه‌ای</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  مشاهده وضعیت ادعاهای بیمه‌ای پرونده درمان و ثبت اعتراض جهت پیگیری توسط تیم بیمه کلینیک.
                </p>
              </div>

              {/* Direct Support Hotline Box (Clinic Reception & Insurance Team) */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#005581] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 block">
                      شماره تماس مستقیم پشتیبانی و پیگیری اعتراضات کلینیک دنتورا
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] font-mono dir-ltr block mt-0.5">
                      ۰۲۱-۸۸۹۹۰۰۰۰ (داخلی ۱۰۴ و ۱۰۵ - واحد بیمه و پیگیری کلینیک)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      * اعتراضات ثبت‌شده مستقیماً در پنل کلینیک دریافت شده تا از طریق نمایندگی بیمه طرف قرارداد پیگیری شود.
                    </p>
                  </div>
                </div>
                <a
                  href="tel:02188990000"
                  className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>تماس با واحد بیمه کلینیک</span>
                </a>
              </div>

              {/* Insurance Claims Status Table/Cards */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#005581]" />
                  <span>وضعیت ادعاهای بیمه‌ای خدمات درمانی شما</span>
                </h4>

                <div className="space-y-4">
                  {displayClaims.map((claim) => {
                    const isFormOpen = selectedClaimForObjection === claim.code;
                    return (
                      <div
                        key={claim.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-slate-800 text-[#005581] font-mono font-bold text-[11px]">
                              کد پرونده: #{toPersianDigits(claim.code)}
                            </span>
                            <strong className="text-slate-900 dark:text-slate-100 font-extrabold">
                              {toPersianDigits(claim.treatmentName)}
                            </strong>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{toPersianDigits(claim.date)}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400">نام بیمه: </span>
                            <strong className="text-slate-800 dark:text-slate-200">{claim.insurerName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">هزینه کل: </span>
                            <strong className="font-mono text-slate-800 dark:text-slate-200">{formatPricePersian(claim.amount)}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">وضعیت ادعا: </span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                                claim.status === 'rejected'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                                  : claim.status === 'deducted'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                              }`}
                            >
                              {claim.statusLabel}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2">
                          <span className="text-slate-600 dark:text-slate-300">
                            علت: <strong>{toPersianDigits(claim.reason)}</strong>
                          </span>

                          {(claim.status === 'rejected' || claim.status === 'deducted') && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isFormOpen) {
                                  setSelectedClaimForObjection(null);
                                } else {
                                  setSelectedClaimForObjection(claim.code);
                                  setObjectionTopic(`اعتراض به ${claim.statusLabel} (${toPersianDigits(claim.code)})`);
                                }
                              }}
                              className="px-3 py-1.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isFormOpen ? 'بستن فرم اعتراض' : 'ثبت و پیگیری اعتراض به کلینیک'}</span>
                            </button>
                          )}
                        </div>

                        {/* Inline Objection Form Right Underneath the Claim */}
                        {isFormOpen && (
                          <div className="p-4 rounded-2xl border border-blue-200 dark:border-slate-700 bg-blue-50/70 dark:bg-slate-800/90 space-y-3 text-xs animate-fadeIn mt-2">
                            <div className="flex items-center justify-between border-b border-blue-200 dark:border-slate-700 pb-2">
                              <h5 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Send className="w-4 h-4 text-[#005581]" />
                                <span>ثبت اعتراض به کلینیک برای ادعای #{toPersianDigits(claim.code)}</span>
                              </h5>
                              <button
                                type="button"
                                onClick={() => setSelectedClaimForObjection(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <form onSubmit={handleAddObjection} className="space-y-3">
                              <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  موضوع اعتراض بیمه‌ای:
                                </label>
                                <input
                                  type="text"
                                  value={objectionTopic}
                                  onChange={(e) => setObjectionTopic(e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  متن پیام اعتراض:
                                </label>
                                <textarea
                                  rows={3}
                                  value={objectionMessage}
                                  onChange={(e) => setObjectionMessage(e.target.value)}
                                  placeholder="شرح دقیق اعتراض خود و مدارک تکمیلی را وارد نمایید..."
                                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                <div>
                                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-[#005581]" />
                                    <span>بارگذاری تصویر یا مدرک اعتراض:</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setObjectionImageName(file.name);
                                      }
                                    }}
                                    className="w-full text-xs text-slate-500 file:mr-0 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#005581] file:text-white cursor-pointer"
                                  />
                                  {objectionImageName && (
                                    <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1 mt-1">
                                      <Check className="w-3.5 h-3.5" /> فایل پیوست شد: {objectionImageName}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    توضیحات مربوط به تصویر/مدرک:
                                  </label>
                                  <input
                                    type="text"
                                    value={objectionImageDesc}
                                    onChange={(e) => setObjectionImageDesc(e.target.value)}
                                    placeholder="مثلاً: تصویر واضح گرافی پریاپیکال دندان ۴۶"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="submit"
                                  className="px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>ثبت و ارسال پیام اعتراض به کلینیک</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedClaimForObjection(null)}
                                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                                >
                                  انصراف
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Objections Tracking History */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#005581]" />
                  <span>بخش پیگیری و تاریخچه اعتراضات ثبت‌شده</span>
                </h4>

                {combinedDisputesList.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    هیچ پیام اعتراضی ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {combinedDisputesList.map((obj) => (
                      <div
                        key={obj.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-slate-800 text-[#005581] font-mono font-bold text-[11px]">
                              کد پیگیری: #{obj.trackingCode}
                            </span>
                            <strong className="text-slate-900 dark:text-slate-100 font-bold">
                              {obj.topic}
                            </strong>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{obj.createdAt}</span>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {obj.message}
                        </p>

                        {obj.imageName && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <FileText className="w-4 h-4 text-[#005581] shrink-0" />
                            <span>مدرک پیوست: <strong>{obj.imageName}</strong></span>
                            {obj.imageDesc && <span className="text-slate-400">({obj.imageDesc})</span>}
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-100">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              <span>وضعیت بررسی: در حال رسیدگی در واحد بیمه کلینیک</span>
                            </span>
                          </div>
                          {obj.responseMessage && (
                            <p className="text-amber-800 dark:text-amber-200 leading-relaxed pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                              پاسخ بخش بیمه: {obj.responseMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 6: CONSENT TOKENS (UDR GOVERNANCE) - SEPARATE FORMS     */}
          {/* ========================================================== */}
          {activeTab === 'consent_tokens' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              {/* Sub-Tabs Switcher for Forms */}
              <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2 pb-3">
                <button
                  type="button"
                  onClick={() => setConsentSubTab('insurance')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    consentSubTab === 'insurance'
                      ? 'bg-[#005581] text-white shadow-xs ring-2 ring-[#005581]/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>فرم ۱: مدیریت دسترسی و رضایت‌نامه بیمه</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsentSubTab('ai_assistant')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    consentSubTab === 'ai_assistant'
                      ? 'bg-[#005581] text-white shadow-xs ring-2 ring-[#005581]/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>فرم ۲: رضایت‌نامه پردازش هوش مصنوعی (AI)</span>
                </button>
              </div>

              {/* FORM 1: INSURANCE ACCESS CONSENT TOKEN FORM */}
              {consentSubTab === 'insurance' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* ۱. بخش هدر و اطلاعات بیمار */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#005581]" />
                      <span>مدیریت دسترسی و رضایت‌نامه الکترونیک بیمه</span>
                    </h3>

                    {/* مشخصات هویتی کادر کوچک و خوانا */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-slate-400 text-[11px] block">نام و نام خانوادگی بیمار:</span>
                          <strong className="text-slate-900 dark:text-slate-100 font-bold">{patient.fullName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">شماره ملی:</span>
                          <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold">{toPersianDigits(patient.nationalId)}</strong>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-slate-700 text-[#005581] font-mono font-extrabold text-xs">
                        کد پرونده UDR: {toPersianDigits(patient.udrCode)}
                      </div>
                    </div>
                  </div>

                  {/* ۲. متن حقوقی فرم (ساده و شفاف) */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                    <strong className="block text-amber-900 dark:text-amber-100 font-extrabold text-xs">
                      نکات حقوقی و شرایط اعطای دسترسی رضایت‌نامه بیمه:
                    </strong>
                    <ul className="space-y-1.5 text-amber-900 dark:text-amber-200 list-disc list-inside leading-relaxed text-[11px]">
                      <li>اطلاعات پزشکی شما (مانند تصاویر رادیولوژی و درمان‌ها) فقط به صورت آنی و امن برای ارزیاب بیمه ارسال می‌شود.</li>
                      <li>این دسترسی صرفاً برای استعلام آنلاین، تأیید هزینه‌ها و تسویه مستقیم بیمه است.</li>
                      <li>صدور این رضایت اختیاری است و هر زمان که بخواهید می‌توانید آن را لغو (ابطال) کنید.</li>
                    </ul>
                  </div>

                  {/* ۳. تعیین محدوده دسترسی (قلمرو توکن) & ۴. تعیین مدت زمان اعتبار */}
                  <form onSubmit={handleIssueConsentTokenSubmit} className="space-y-5 text-xs">
                    {/* محدوده دسترسی */}
                    <div className="space-y-3">
                      <label className="block font-black text-slate-900 dark:text-slate-100 text-xs">
                        ۳. تعیین محدوده دسترسی (قلمرو توکن):
                      </label>
                      <div className="space-y-2">
                        <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            دسترسی به تصاویر رادیولوژی و مدارک (OPG، پریاپیکال و...)
                          </span>
                          <input
                            type="checkbox"
                            checked={consentScopeRadiology}
                            onChange={(e) => setConsentScopeRadiology(e.target.checked)}
                            className="w-5 h-5 accent-[#005581] cursor-pointer"
                          />
                        </label>

                        <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            دسترسی به چارت دندان و درمان‌های انجام‌شده (کد FDI دندان‌ها)
                          </span>
                          <input
                            type="checkbox"
                            checked={consentScopeDentalChart}
                            onChange={(e) => setConsentScopeDentalChart(e.target.checked)}
                            className="w-5 h-5 accent-[#005581] cursor-pointer"
                          />
                        </label>

                        <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            دسترسی به فاکتورها و جزئیات مالی
                          </span>
                          <input
                            type="checkbox"
                            checked={consentScopeFinancial}
                            onChange={(e) => setConsentScopeFinancial(e.target.checked)}
                            className="w-5 h-5 accent-[#005581] cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    {/* ۴. تعیین مدت زمان اعتبار رضایت */}
                    <div className="space-y-2">
                      <label className="block font-black text-slate-900 dark:text-slate-100 text-xs">
                        ۴. تعیین مدت زمان اعتبار رضایت:
                      </label>
                      <select
                        value={consentValidityDuration}
                        onChange={(e: any) => setConsentValidityDuration(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                      >
                        <option value="3_months">دسترسی به مدت ۳ ماه</option>
                        <option value="6_months">دسترسی به مدت ۶ ماه</option>
                        <option value="1_year">دسترسی به مدت ۱ سال</option>
                      </select>
                    </div>

                    {/* ۵. بخش دکمه‌های عملیاتی (اکشن‌ها) */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأیید و صدور توکن رضایت بیمه</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('dashboard')}
                        className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        انصراف
                      </button>
                    </div>
                  </form>

                  {/* ۶. بخش مدیریت توکن‌های فعال بیمه */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#005581]" />
                      <span>۶. مدیریت توکن‌های فعال دسترسی بیمه</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-3 font-extrabold">نام بیمه‌گر</th>
                            <th className="p-3 font-extrabold">هدف / قلمرو دسترسی</th>
                            <th className="p-3 font-extrabold">تاریخ اعتبار (شمسی)</th>
                            <th className="p-3 font-extrabold">وضعیت</th>
                            <th className="p-3 font-extrabold text-center">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {patient.consentTokens.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-400">
                                هیچ توکن رضایت فعالی ثبت نشده است.
                              </td>
                            </tr>
                          ) : (
                            patient.consentTokens.map((token) => (
                              <tr key={token.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                                  بیمه تکمیلی دانا
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                  {toPersianDigits(token.purpose)}
                                </td>
                                <td className="p-3 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                                  تا {toPersianDigits(token.expiresAt)}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">
                                    فعال و معتبر
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => onRevokeConsent(token.id)}
                                    className="px-3 py-1 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-800 dark:text-rose-200 rounded-lg font-bold text-[10px] transition cursor-pointer"
                                  >
                                    لغو دسترسی
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM 2: AI CONSENT FORM (SEPARATE FORM) */}
              {consentSubTab === 'ai_assistant' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#005581]" />
                      <span>رضایت‌نامه پردازش داده‌های بالینی در سامانه‌های هوش مصنوعی (AI Diagnostic Assistant)</span>
                    </h3>
                    <p className="text-slate-500 text-xs">
                      این فرم کاملاً مستقل از فرم دسترسی بیمه بوده و مربوط به دستیار تشخیص هوشمند بالینی کلینیک است.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-blue-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/80 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 dark:border-slate-700 pb-3">
                      <div>
                        <span className="block font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                          وضعیت فعلی رضایت هوش مصنوعی:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {aiConsentGranted ? 'شما اجازه پردازش بی‌نام داده‌ها را صادر نموده‌اید.' : 'رضایت شما غیرفعال می‌باشد.'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiConsentGranted(!aiConsentGranted)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs ${
                          aiConsentGranted
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                      >
                        {aiConsentGranted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>رضایت فعال است (جهت لغو کلیک کنید)</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            <span>رضایت غیرفعال است (جهت فعال‌سازی کلیک کنید)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed space-y-3">
                      <strong className="block font-bold text-slate-900 dark:text-slate-100">
                        مفاد و مفاهیم رضایت‌نامه هوش مصنوعی:
                      </strong>
                      <ul className="space-y-2 list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300">
                        <li>
                          کلیه داده‌ها و تصاویر بالینی/رادیوگرافی شما به صورت <strong>کاملاً گمنام‌شده (Anonymized)</strong> و <strong>بدون نام یا مشخصات هویتی</strong>، صرفاً جهت تحلیل هوشمند توسط سیستم‌های تشخیص‌یار هوش مصنوعی کلینیک پردازش می‌گردد.
                        </li>
                        <li>
                          این تحلیل هوشمند به دندانپزشک معالج شما در شناسایی دقیق‌تر پوسیدگی‌ها، آنالیز چارت دندان و کانال‌های ریشه کمک می‌کند.
                        </li>
                        <li>
                          اعطا یا لغو این رضایت کاملاً اختیاری است و هیچ‌گونه تاثیری بر روال درمان یا خدمات بیمه‌ای شما ندارد.
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>شناسه بیمار: <strong className="font-mono text-slate-800 dark:text-slate-200">{patient.fullName} ({toPersianDigits(patient.nationalId)})</strong></span>
                      <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> فرم مجزا و مستقل ثبت شد
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 7: PROFILE & INSURANCE DETAILS (MATCHING USER PHOTO)   */}
          {/* ========================================================== */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              {/* Header Title */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  اطلاعات هویتی و بیمه
                </h3>
              </div>

              {/* Card 1: اطلاعات هویتی */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4 relative">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    اطلاعات هویتی
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#005581] dark:text-[#72cdf4] rounded-xl font-bold text-xs hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingProfile ? 'انصراف از ویرایش' : 'ویرایش'}</span>
                  </button>
                </div>

                {!isEditingProfile ? (
                  <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60 text-xs space-y-2.5 pt-1">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-500 font-bold">نام:</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{editFullName}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-500 font-bold">کد ملی:</span>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-900 dark:text-slate-100 font-mono font-extrabold">{editNationalId}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-500 font-bold">تماس:</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-mono font-extrabold">{editPhone}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-500 font-bold">تاریخ تولد:</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-mono font-extrabold">{editBirthDate}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-500 font-bold">آدرس منزل:</span>
                      {editAddress ? (
                        <span className="text-slate-900 dark:text-slate-100 font-bold text-left">{editAddress}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-left">ثبت نشده (جهت ثبت دکمه ویرایش را بزنید)</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-3 text-xs pt-1">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نام:</label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                        <span>کد ملی:</span>
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>کد ملی قابل تغییر نمی‌باشد</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={editNationalId}
                        disabled
                        readOnly
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تماس:</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none focus:border-[#005581]"
                      />
                    </div>

                    <PersianBirthDatePicker
                      value={editBirthDate}
                      onChange={(val) => setEditBirthDate(val)}
                      label="تاریخ تولد:"
                    />

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">آدرس منزل:</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
                    >
                      ذخیره اطلاعات
                    </button>
                  </form>
                )}
              </div>

              {/* Card 2: پوشش بیمه‌ای (Matching photo containers) */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
                  پوشش بیمه‌ای
                </h4>

                <div className="space-y-3">
                  {/* بیمه پایه Box */}
                  <div className="p-4 rounded-2xl bg-[#e8f5fb] dark:bg-slate-800/90 border border-[#bce3f5] dark:border-slate-700 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-[#005581] dark:text-[#72cdf4] text-xs block">
                        بیمه پایه: {insuranceBaseName}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                        • فعال - {insuranceBaseExpiry}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-[#005581] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      ب
                    </div>
                  </div>

                  {/* بیمه تکمیلی Box */}
                  <div className="p-4 rounded-2xl bg-[#fffde6] dark:bg-amber-950/40 border border-[#fef08a] dark:border-amber-800/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-amber-950 dark:text-amber-200 text-xs block">
                        بیمه تکمیلی: {insuranceSuppName}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                        • فعال - {insuranceSuppExpiry}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      ت
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* ONLINE BOOKING MODAL (15-MIN LOCK & EXACT CALENDAR PHOTO UI) */}
      {/* ========================================================== */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#005581]" />
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  فرآیند ثبت نوبت آنلاین و چکاین
                </h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sticky 15-Minute Lock Timer Top Bar (When Lock is active) */}
            {isTimerActive && (
              <div className="bg-amber-500 text-slate-950 px-4 py-2.5 font-bold text-xs flex items-center justify-between shrink-0 shadow-inner">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>اسلات زمان انتخاب‌شده ({selectedDay} - ساعت {bookingSlot}) به مدت ۱۵ دقیقه برای شما قفل شد.</span>
                </div>
                <span className="font-mono text-sm bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-lg border border-amber-400/40 font-black">
                  {formatTimer(lockTimer)}
                </span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* STEP 1: DOCTOR & REASON */}
              {bookingStep === 'doctor_reason' && (
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm border-b pb-2 border-slate-200 dark:border-slate-800">
                    مرحله ۱ از ۳: انتخاب دندانپزشک و دلیل مراجعه
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        انتخاب دندانپزشک:
                      </label>
                      <select
                        value={bookingDentist}
                        onChange={(e) => {
                          setBookingDentist(e.target.value);
                          const doc = availableDentists.find((d) => d.id === e.target.value);
                          if (doc) setBookingReason(`ویزیت و درمان توسط ${doc.name}`);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-[#005581]"
                      >
                        {availableDentists.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} {('specialty' in d && d.specialty) ? `(${d.specialty})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        دلیل اصلی مراجعه:
                      </label>
                      <input
                        type="text"
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        placeholder="مثلاً: معاینه دوره‌ای، عصب‌کشی، پرکردن دندان..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-[#005581]"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100 font-bold">آیا اولین بار است به این کلینیک مراجعه می‌کنید؟</strong>
                        <span className="text-[11px] text-slate-500">مراجعات اول شامل پرداخت آنلاین هزینه ویزیت (۵۰,۰۰۰ تومان) می‌باشد.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isFirstVisit}
                        onChange={(e) => setIsFirstVisit(e.target.checked)}
                        className="w-5 h-5 accent-[#005581] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => setBookingStep('calendar_select')}
                      className="px-6 py-2.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2"
                    >
                      <span>مشاهده زمان‌های خالی</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: EXACT CALENDAR UI (MATCHING USER SCREENSHOT) */}
              {bookingStep === 'calendar_select' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm text-center">
                    انتخاب زمان نوبت
                  </h4>

                  {/* Radio Box 1: Fastest Available Slot */}
                  <div
                    onClick={() => {
                      setSelectionType('fastest');
                      setBookingSlot(fastestAvailableSlot);
                      setSelectedDay('امروز ۲۰ مرداد');
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectionType === 'fastest'
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-slate-800/80 ring-2 ring-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-slate-500 text-[11px] block">زودترین زمان نوبت خالی:</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-bold text-xs">
                        امروز (سه‌شنبه) - ساعت {fastestAvailableSlot}
                      </strong>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectionType === 'fastest' ? 'border-[#005581] bg-[#005581]' : 'border-slate-300'
                    }`}>
                      {selectionType === 'fastest' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Radio Box 2: Custom Selection */}
                  <div
                    onClick={() => setSelectionType('custom')}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectionType === 'custom'
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-slate-800/80 ring-2 ring-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      انتخاب زمان دیگر
                    </span>
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Calendar Widget Grid (matching exact user screenshot) */}
                  {selectionType === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-white dark:bg-slate-900">
                      {/* Left: Shifts and Time Slots */}
                      <div className="md:col-span-3 space-y-3">
                        {/* Morning / Evening Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <button
                            onClick={() => setSelectedShift('morning')}
                            className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                              selectedShift === 'morning'
                                ? 'border-[#005581] text-[#005581] font-black'
                                : 'border-transparent text-slate-500'
                            }`}
                          >
                            صبح
                          </button>
                          <button
                            onClick={() => setSelectedShift('evening')}
                            className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                              selectedShift === 'evening'
                                ? 'border-[#005581] text-[#005581] font-black'
                                : 'border-transparent text-slate-500'
                            }`}
                          >
                            عصر
                          </button>
                        </div>

                        {/* Slots Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {(selectedShift === 'morning' ? morningSlots : eveningSlots).map((slot) => {
                            const isSelected = bookingSlot === slot;
                            return (
                              <button
                                key={slot}
                                onClick={() => setBookingSlot(slot)}
                                className={`py-2 rounded-xl border font-mono font-bold text-xs transition cursor-pointer text-center ${
                                  isSelected
                                    ? 'border-[#005581] bg-[#005581] text-white shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Days Column */}
                      <div className="space-y-1.5 border-r border-slate-200 dark:border-slate-700 pr-2">
                        {daysList.map((d) => {
                          const isSelected = selectedDay.includes(d.dateStr);
                          return (
                            <button
                              key={d.dateStr}
                              onClick={() => setSelectedDay(`${d.title} ${d.dateStr}`)}
                              className={`w-full p-2.5 rounded-xl text-right transition cursor-pointer border text-xs ${
                                isSelected
                                  ? 'border-blue-400 bg-blue-50 dark:bg-slate-800 text-[#005581] font-black'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              <div className="font-bold">{d.title}</div>
                              <div className="text-[10px] opacity-80">{d.dateStr}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Primary Continue Button */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => setBookingStep('doctor_reason')}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      بازگشت
                    </button>
                    <button
                      onClick={handleSelectSlotAndLock}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      ادامه
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: VISIT FEE PAYMENT (ONLY FIRST VISIT) */}
              {bookingStep === 'visit_fee' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                    <strong className="block text-sm font-extrabold">مخصوص مراجعات بار اول:</strong>
                    <p className="leading-relaxed">
                      با توجه به ثبت مراجعه بار اول، هزینه ثبت پرونده اولیه و ویزیت عمومی (۵۰,۰۰۰ تومان) به‌صورت آنلاین در درگاه تسویه می‌گردد. (مراجعات بعدی معاف از این مبلغ خواهند بود).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>حق ویزیت و ثبت پرونده:</span>
                      <span className="font-mono text-emerald-600 text-sm font-black">۵۰,۰۰۰ تومان</span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between">
                    <button
                      onClick={() => setBookingStep('calendar_select')}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 cursor-pointer"
                    >
                      بازگشت
                    </button>
                    <button
                      onClick={handleConfirmVisitPayment}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold transition cursor-pointer flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>پرداخت ۵۰,۰۰۰ تومان و ورود به فرم چک‌این</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: COMPREHENSIVE ONLINE CHECK-IN FORM */}
              {bookingStep === 'checkin_form' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[#005581]" />
                      <span>فرم آنلاین چک‌این و پرونده سلامت پزشکی (پزشکی آنلاین)</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      جهت تسریع در فرآیند پذیرش حضوری، می‌توانید سوابق پزشکی خود را به صورت آنلاین تکمیل فرمایید.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Section 1: Pre-existing Conditions */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        ۱. سوابق بیماری‌های زمینه‌ای و خاص:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'دیابت / قند خون',
                          'فشار خون بالا',
                          'بیماری‌های قلبی-عروقی',
                          'آسم و بیماری ریوی',
                          'اختلالات کلیوی',
                          'صرع / تشنج',
                          'هپاتیت / ایدز',
                          'سابقه سکته مغزی/قلبی',
                        ].map((cond) => {
                          const isChecked = checkInConditions.includes(cond);
                          return (
                            <label
                              key={cond}
                              className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition ${
                                isChecked
                                  ? 'border-[#005581] bg-blue-50 dark:bg-slate-800 text-[#005581] font-bold'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setCheckInConditions([...checkInConditions, cond]);
                                  else setCheckInConditions(checkInConditions.filter((c) => c !== cond));
                                }}
                                className="accent-[#005581]"
                              />
                              <span>{cond}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Allergies */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        ۲. حساسیت‌های دارویی و بی‌حسی:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['پنی‌سیلین و آنتی‌بیوتیک', 'بی‌حسی موضعی / لیدوکائین', 'آسپیرین و مسکن‌ها', 'لاتکس'].map((alg) => {
                          const isChecked = checkInAllergies.includes(alg);
                          return (
                            <label
                              key={alg}
                              className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition ${
                                isChecked
                                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 font-bold'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setCheckInAllergies([...checkInAllergies, alg]);
                                  else setCheckInAllergies(checkInAllergies.filter((a) => a !== alg));
                                }}
                                className="accent-rose-600"
                              />
                              <span>{alg}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 3: Medications */}
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                        ۳. داروهای مصرفی فعلی (مانند وارفارین، آسپیرین، کورتون، بیس‌فسفونات):
                      </label>
                      <input
                        type="text"
                        value={checkInMedications}
                        onChange={(e) => setCheckInMedications(e.target.value)}
                        placeholder="در صورت عدم مصرف دارو خالی بگذارید..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                      />
                    </div>

                    {/* Section 4: Emergency Contacts & Insurance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                          شماره تماس اضطراری:
                        </label>
                        <input
                          type="text"
                          value={checkInEmergencyPhone}
                          onChange={(e) => setCheckInEmergencyPhone(e.target.value)}
                          placeholder="۰۹۱۲..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                          نام بیمه تکمیلی جهت استعلام:
                        </label>
                        <input
                          type="text"
                          value={checkInSupplInsurance}
                          onChange={(e) => setCheckInSupplInsurance(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handleFinalizeBooking(true)}
                      className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
                    >
                      رد کردن و تکمیل چکاین به صورت حضوری
                    </button>

                    <button
                      onClick={() => handleFinalizeBooking(false)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ثبت نهایی فرم و تایید نوبت</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: CONFIRMED */}
              {bookingStep === 'confirmed' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                      نوبت شما با موفقیت در سامانه ثبت گردید!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      جزئیات نوبت و کد پیگیری به شماره همراه شما پیامک شد.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-xs space-y-2 text-right">
                    <div>تاریخ حضور: <strong className="font-mono">{toPersianDigits(selectedDay)}</strong></div>
                    <div>ساعت مراجعه: <strong className="font-mono text-[#005581] font-bold">{toPersianDigits(bookingSlot)}</strong></div>
                    <div>دندانپزشک: <strong>{bookingDentist === 'u-dentist1' ? 'دکتر کاویانی' : 'دکتر شریفی'}</strong></div>
                  </div>

                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="px-8 py-2.5 bg-[#005581] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                  >
                    بستن و بازگشت به داشبورد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ONLINE PAYMENT MODAL FOR INVOICES & INSTALLMENTS           */}
      {/* ========================================================== */}
      {payingTarget && (
        <SimulatedPaymentGatewayModal
          isOpen={!!payingTarget}
          onClose={() => setPayingTarget(null)}
          onSuccess={() => {
            handleExecuteOnlinePayment();
          }}
          amount={payingTarget.amount}
          description={`تسویه آنلاین ${payingTarget.title}`}
        />
      )}

      {/* ========================================================== */}
      {/* ONLINE PAYMENT MODAL FOR FIRST VISIT FEE (ONLINE BOOKING)   */}
      {/* ========================================================== */}
      <SimulatedPaymentGatewayModal
        isOpen={isVisitFeeGatewayOpen}
        onClose={() => setIsVisitFeeGatewayOpen(false)}
        onSuccess={handleVisitFeePaymentSuccess}
        amount={50000}
        description={`پرداخت ویزیت اولیه آنلاین - ${currentClinic?.name || 'کلینیک دنتورا'}`}
      />

      {/* ========================================================== */}
      {/* PAYMENT CONNECTION LOADING DELAY MODAL                     */}
      {/* ========================================================== */}
      {isConnectingPayment && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 text-[#005581] flex items-center justify-center relative">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <CreditCard className="w-4 h-4 absolute inset-0 m-auto" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">
                در حال اتصال امن به درگاه شاپرک...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                لطفاً شکیبا باشید، در حال آماده‌سازی فاکتور و انتقال به پروتکل رمزنگاری بانک هستیم.
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#005581] h-full animate-pulse w-3/4 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* QUESTION CONSULTATION PACKAGE PURCHASE MODAL              */}
      {/* ========================================================== */}
      {showQaPackageModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#005581] text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  خرید بسته مشاوره و پرسش از دندان‌پزشک
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQaPackageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                سهمیه سوالات رایگان شما ({FREE_QA_LIMIT} سوال) تکمیل شده است.
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                جهت ثبت پرسش جدید و دریافت پاسخ تخصصی از دندان‌پزشک، یکی از بسته‌های مشاوره زیر را انتخاب و آنلاین بپردازید:
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'pkg-10', name: 'بسته ۱۰ سوال مشاوره', count: 10, price: 80000, desc: 'مناسب برای پیگیری‌های کوتاه‌مدت' },
                { id: 'pkg-30', name: 'بسته ۳۰ سوال مشاوره تخصصی', count: 30, price: 200000, desc: 'پیشنهاد ویژه کلینیک (محبوب‌ترین)', isPopular: true },
                { id: 'pkg-60', name: 'بسته ۶۰ سوال مشاوره سالانه', count: 60, price: 350000, desc: 'مراقب‌های کامل دندان‌پزشکی خانواده' },
              ].map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    pkg.isPopular
                      ? 'border-[#005581] bg-blue-50/50 dark:bg-slate-800/80 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
                      <span>{pkg.name}</span>
                      {pkg.isPopular && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px]">
                          تخفیف ویژه
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{pkg.desc}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowQaPackageModal(false);
                      handleInitiatePayment({
                        type: 'qa_package',
                        id: pkg.id,
                        title: pkg.name,
                        amount: pkg.price,
                        qaCount: pkg.count,
                      });
                    }}
                    className="px-3.5 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs transition shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>{pkg.price.toLocaleString()} تومان</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowQaPackageModal(false)}
              className="w-full py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
