import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Claim, Patient, DoctorSubmission, GreenLaneStatus } from '../../types';
import {
  FileCheck,
  Plus,
  Edit3,
  Check,
  Eye,
  SendHorizontal,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  CheckSquare,
  Upload,
  CheckCircle2,
  X,
  FileText,
  Printer,
  Sparkles,
  Users,
  LayoutGrid,
  TrendingUp,
  Clock,
  Calendar,
  Search,
  RefreshCw,
  Activity,
  Trash2,
  Image as ImageIcon,
  Download,
  Paperclip,
  ZoomIn,
  ExternalLink,
} from 'lucide-react';

export const cleanInsuranceName = (provider?: string) => {
  if (!provider) return 'بیمه دانا (طرح استاندارد)';
  return provider
    .replace(/طرح\s*نقره‌ای/g, 'طرح استاندارد')
    .replace(/طرح\s*نقره\b/g, 'طرح استاندارد')
    .replace(/نقره‌ای/g, 'استاندارد')
    .replace(/نقره/g, 'استاندارد')
    .trim();
};

interface InsuranceDocsWorkspaceProps {
  claims: Claim[];
  setClaims?: React.Dispatch<React.SetStateAction<Claim[]>>;
  patients: Patient[];
  hasAccountantRole?: boolean;
  onToggleHasAccountantRole?: () => void;
  insuranceModuleActive?: boolean;
  onToggleInsuranceModule?: () => void;
  isInsuranceContracted?: boolean;
  onToggleInsuranceContracted?: () => void;
  onSubmitAppeal?: (claimId: string, appealText: string) => void;
  onSendClaimToInsurance?: (claimId: string) => void;
  greenLane?: GreenLaneStatus;
  targetClaimId?: string | null;
}

export const InsuranceDocsWorkspace: React.FC<InsuranceDocsWorkspaceProps> = ({
  claims = [],
  setClaims,
  patients,
  hasAccountantRole = true,
  onToggleHasAccountantRole,
  insuranceModuleActive = true,
  onToggleInsuranceModule,
  isInsuranceContracted = true,
  onToggleInsuranceContracted,
  onSubmitAppeal,
  onSendClaimToInsurance,
  greenLane,
  targetClaimId,
}) => {
  // Sub tab selection
  const [receptionInsuranceSubTab, setReceptionInsuranceSubTab] = useState<'scrubber' | 'financial_board'>('scrubber');
  const [activeFinancialSubTab, setActiveFinancialSubTab] = useState<'kanban' | 'deductions' | 'appeal_form'>('kanban');

  const [selectedClaimForDocReview, setSelectedClaimForDocReview] = useState<Claim | null>(claims[0] || null);
  const [editingNarrativeClaimId, setEditingNarrativeClaimId] = useState<string | null>(null);
  const [narrativeEditText, setNarrativeEditText] = useState<string>('');

  // Modals state
  const [showNewClaimModal, setShowNewClaimModal] = useState<boolean>(false);
  const [selectedDocForDetailModal, setSelectedDocForDetailModal] = useState<{
    title: string;
    type: string;
    uploaded: boolean;
    required?: boolean;
    notes?: string;
    modalKind?: 'xray' | 'fdi_narrative' | 'eligibility' | 'pre_auth_cert';
  } | null>(null);

  // Uploaded pre-auth certificates state (per claimId)
  const [uploadedCertificates, setUploadedCertificates] = useState<Record<string, {
    fileName: string;
    fileUrl: string;
    fileSize: string;
    uploadTime: string;
    preAuthCode: string;
  }>>({
    'clm-804': {
      fileName: 'تاییدیه_بیمه_دانا_CLM2026.pdf',
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      fileSize: '۲۴۰ کیلوبایت',
      uploadTime: 'امروز ۱۰:۱۵',
      preAuthCode: 'AUTH-DAN-99120-804',
    },
  });

  // Uploaded extra radiographs state (per claimId)
  const [uploadedExtraRadiographs, setUploadedExtraRadiographs] = useState<Record<string, Array<{
    id: string;
    title: string;
    type: 'rvg' | 'opg' | 'cbct' | 'intraoral';
    imageUrl: string;
    date: string;
    doctorNotes?: string;
    source: string;
  }>>>({});

  // Selected Xray preview index in modal
  const [selectedXrayIndex, setSelectedXrayIndex] = useState<number>(0);

  // Hidden File Input Refs
  const certFileInputRef = useRef<HTMLInputElement>(null);
  const xrayFileInputRef = useRef<HTMLInputElement>(null);

  // Kanban Detail / Action Modal state
  const [activeKanbanModalType, setActiveKanbanModalType] = useState<'draft_compliance' | 'submitted_detail' | 'settled_receipt' | null>(null);
  const [activeKanbanModalClaim, setActiveKanbanModalClaim] = useState<Claim | null>(null);

  // New claim form state
  const [newClaimPatientId, setNewClaimPatientId] = useState<string>(patients[0]?.id || '');
  const [newClaimTreatment, setNewClaimTreatment] = useState<string>('عصب‌کشی و ترمیم کامپوزیت');
  const [newClaimToothFdi, setNewClaimToothFdi] = useState<number>(16);
  const [newClaimAmount, setNewClaimAmount] = useState<number>(4500000);
  const [newClaimProvider, setNewClaimProvider] = useState<string>('بیمه سامان (طرح طلایی)');

  // Financial Waterfall Calculator state
  const [waterfallCost, setWaterfallCost] = useState<number>(5200000);
  const [baseCoveragePercent, setBaseCoveragePercent] = useState<number>(30);
  const [supplCoveragePercent, setSupplCoveragePercent] = useState<number>(40);

  // Formal Appeal Form State (Matching Screenshot 3 / Appeal tab)
  const [appealSelectedClaimId, setAppealSelectedClaimId] = useState<string>(claims.find((c) => (c.deductionAmount || 0) > 0)?.id || claims[0]?.id || '');
  const [appealCategory, setAppealCategory] = useState<string>('کسورات غیرمجاز تعرفه‌ای');
  const [appealRuleCitation, setAppealRuleCitation] = useState<string>('بند ۱۲ آیین‌نامه تعرفه درمان شورای عالی بیمه');
  const [appealDefenseText, setAppealDefenseText] = useState<string>('با استناد به تصویر گرافی RVG پیوست‌شده و بند ۱۲ آیین‌نامه بیمه، درمان کانال ریشه طبق پروتکل استاندارد انجام شده و کسورات فوق غیرمجاز می‌باشد...');
  const [hasAttachedRvg, setHasAttachedRvg] = useState<boolean>(true);
  const [hasAttachedNotes, setHasAttachedNotes] = useState<boolean>(true);

  // Action feedback toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // If a targetClaimId is passed from doctor submissions, automatically select it and switch to scrubber
  useEffect(() => {
    if (targetClaimId) {
      const found = claims.find((c) => c.id === targetClaimId);
      if (found) {
        setSelectedClaimForDocReview(found);
        setReceptionInsuranceSubTab('scrubber');
      }
    }
  }, [targetClaimId, claims]);

  // Keep selectedClaimForDocReview synced
  useEffect(() => {
    if (claims.length > 0 && !selectedClaimForDocReview) {
      setSelectedClaimForDocReview(claims[0]);
    }
  }, [claims, selectedClaimForDocReview]);

  // Calculations for Waterfall
  const calculatedBaseShare = Math.round((waterfallCost * baseCoveragePercent) / 100);
  const calculatedSupplShare = Math.round((waterfallCost * supplCoveragePercent) / 100);
  const calculatedPatientShare = Math.max(0, waterfallCost - calculatedBaseShare - calculatedSupplShare);

  // Active patient matched to selectedClaimForDocReview
  const activePatient = useMemo(() => {
    if (!selectedClaimForDocReview) return null;
    return (
      patients.find(
        (p) =>
          p.id === selectedClaimForDocReview.patientId ||
          p.nationalId === selectedClaimForDocReview.nationalId ||
          p.nationalId === selectedClaimForDocReview.patientNationalId ||
          p.fullName === selectedClaimForDocReview.patientName
      ) || null
    );
  }, [patients, selectedClaimForDocReview]);

  // Radiographs attached to active patient / treatment desk
  const activeRadiographs = useMemo(() => {
    if (!selectedClaimForDocReview) return [];
    const claimId = selectedClaimForDocReview.id;
    const extraUploaded = uploadedExtraRadiographs[claimId] || [];

    // From patient records (doctor's desk)
    const patientImgs = (activePatient?.patientImages || []).map((img) => ({
      id: img.id,
      title: img.title,
      type: img.type,
      imageUrl: img.imageUrl,
      date: img.date,
      doctorName: img.doctorName || selectedClaimForDocReview.dentistName || 'دکتر معالج',
      doctorNotes: img.doctorNotes || img.summaryText || 'تایید معاینه بالینی و سلامت نسوج پری‌آپیکال',
      annotations: img.annotations || [],
      toothFdi: img.toothFdi || selectedClaimForDocReview.toothFdi || 16,
      source: 'ثبت‌شده در میز درمان دندان‌پزشک',
    }));

    const combined = [
      ...patientImgs,
      ...extraUploaded.map((x) => ({
        ...x,
        annotations: [],
        toothFdi: selectedClaimForDocReview.toothFdi || 16,
        source: 'آپلود منشی / پذیرش کلینیک',
      })),
    ];

    if (combined.length === 0) {
      return [
        {
          id: 'rvg-default',
          title: `گرافی دیجیتال RVG دندان ${selectedClaimForDocReview.toothFdi || 16}`,
          type: 'rvg' as const,
          imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=85',
          date: selectedClaimForDocReview.dateOfService || '۱۴۰۵/۰۵/۲۰',
          doctorName: selectedClaimForDocReview.dentistName || 'دکتر معالج',
          doctorNotes: `تایید سلامت پالپ و نسوج دندان ${selectedClaimForDocReview.toothFdi || 16} جهت درمان ${selectedClaimForDocReview.treatmentName || 'ترمیم/عصب‌کشی'}`,
          annotations: [
            {
              id: 'ann-1',
              text: 'کانتور لثه و استخوان مارجینال نرمال',
              toothFdi: selectedClaimForDocReview.toothFdi || 16,
              x: 48,
              y: 38,
              width: 14,
              height: 16,
              type: 'box' as const,
              author: 'doctor' as const,
              severity: 'normal' as const,
            },
          ],
          toothFdi: selectedClaimForDocReview.toothFdi || 16,
          source: 'ثبت‌شده در میز درمان دندان‌پزشک',
        },
      ];
    }

    return combined;
  }, [selectedClaimForDocReview, activePatient, uploadedExtraRadiographs]);

  // Upload handler for Insurance Certificate
  const handleUploadCertificate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClaimForDocReview) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const claimId = selectedClaimForDocReview.id;
      const nowFa = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      const sizeKb = Math.round(file.size / 1024) + ' کیلوبایت';
      const preAuthCode = 'AUTH-' + Math.floor(100000 + Math.random() * 900000);

      setUploadedCertificates((prev) => ({
        ...prev,
        [claimId]: {
          fileName: file.name,
          fileUrl: dataUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
          fileSize: sizeKb,
          uploadTime: `${nowFa} امروز`,
          preAuthCode,
        },
      }));

      showToast(`گواهی تاییدیه بیمه (${file.name}) با موفقیت به پرونده پیوست شد.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload handler for extra X-rays / RVGs
  const handleUploadRadiograph = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClaimForDocReview) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const claimId = selectedClaimForDocReview.id;
      const todayFa = new Date().toLocaleDateString('fa-IR');

      const newXray = {
        id: `xray-up-${Date.now()}`,
        title: `گرافی ارسالی پذیرش: ${file.name}`,
        type: 'rvg' as const,
        imageUrl: dataUrl || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=85',
        date: todayFa,
        doctorNotes: 'گرافی ارسالی از بخش پذیرش / مرکز تصویربرداری ضمیمه پرونده شد.',
        source: 'آپلود منشی / پذیرش کلینیک',
      };

      setUploadedExtraRadiographs((prev) => ({
        ...prev,
        [claimId]: [...(prev[claimId] || []), newXray],
      }));

      showToast(`تصویر رادیوگرافی (${file.name}) با موفقیت به پرونده بالینی پیوست گردید.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // If insurance module is inactive
  if (!insuranceModuleActive) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
          ماژول بیمه در تنظیمات کلینیک غیرفعال است
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          در حال حاضر سیستم پذیرش در حالت خدمات آزاد تنظیم شده است. در صورت نیاز به ثبت ادعای بیمه پایه و تکمیلی، ماژول بیمه را فعال نمایید.
        </p>
        {onToggleInsuranceModule && (
          <button
            onClick={onToggleInsuranceModule}
            className="px-5 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white text-xs font-bold shadow transition cursor-pointer"
          >
            فعال‌سازی ماژول بیمه کلینیک
          </button>
        )}
      </div>
    );
  }

  // Handlers
  const handleReferClaimToAccountant = (claimId: string) => {
    if (setClaims) {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId
            ? {
                ...c,
                status: 'queued' as const,
                referredToAccountant: true,
                receptionApproved: true,
                dateOfService: c.dateOfService || '۱۴۰۵/۰۵/۱۴',
              }
            : c
        )
      );
    }
    if (selectedClaimForDocReview && selectedClaimForDocReview.id === claimId) {
      setSelectedClaimForDocReview((prev) => (prev ? { ...prev, status: 'queued', referredToAccountant: true, receptionApproved: true } : null));
    }
    if (activeKanbanModalClaim && activeKanbanModalClaim.id === claimId) {
      setActiveKanbanModalClaim(null);
      setActiveKanbanModalType(null);
    }
    showToast('✅ مدارک پرونده با موفقیت تایید و به کارتابل حسابدار کلینیک ارسال گردید.');
  };

  const handleSendClaimDirectToInsurerLocal = (claimId: string) => {
    if (onSendClaimToInsurance) {
      onSendClaimToInsurance(claimId);
    }
    if (setClaims) {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId
            ? {
                ...c,
                status: 'submitted' as const,
                receptionApproved: true,
                accountantApproved: true,
                reviewRoute: c.riskScore && c.riskScore > 60 ? 'deep_review' : 'express',
                dateOfService: c.dateOfService || '۱۴۰۵/۰۵/۱۴',
              }
            : c
        )
      );
    }
    if (selectedClaimForDocReview && selectedClaimForDocReview.id === claimId) {
      setSelectedClaimForDocReview((prev) => (prev ? { ...prev, status: 'submitted', receptionApproved: true, accountantApproved: true } : null));
    }
    if (activeKanbanModalClaim && activeKanbanModalClaim.id === claimId) {
      setActiveKanbanModalClaim(null);
      setActiveKanbanModalType(null);
    }
    showToast('✅ ادعای بیمه با موفقیت تایید و مستقیماً به سازمان بیمه‌گر ارسال شد.');
  };

  // Kanban card click router:
  // Col 1 (draft): Opens Modal 1 (بررسی ادعای ثبت‌شده منشی و تطبیق خودکار مالی)
  // Col 2 (submitted): Opens Modal 2 (اطلاعات کامل ادعای ارسال‌شده به بیمه‌گر)
  // Col 3 (rejected/appeal): Switches to Subtab 4 (ثبت اعتراض رسمی) and auto-fills default info
  // Col 4 (settled): Opens Modal 3 (گزارش ادعای تسویه‌شده و واریزی به حساب کلینیک)
  const handleKanbanCardAction = (c: Claim, colKey: string) => {
    if (colKey === 'draft') {
      setActiveKanbanModalClaim(c);
      setActiveKanbanModalType('draft_compliance');
    } else if (colKey === 'submitted') {
      setActiveKanbanModalClaim(c);
      setActiveKanbanModalType('submitted_detail');
    } else if (colKey === 'rejected') {
      // Direct jump to "ثبت اعتراض رسمی" sub-tab with auto-filled default claim & legal info
      setAppealSelectedClaimId(c.id);
      setAppealCategory('کسورات غیرمجاز تعرفه‌ای');
      setAppealRuleCitation('بند ۱۲ آیین‌نامه تعرفه درمان شورای عالی بیمه');
      setAppealDefenseText(
        `با استناد به تصویر گرافی RVG پیوست‌شده و بند ۱۲ آیین‌نامه بیمه، درمان دندان ${c.toothFdi || 16} (${c.treatmentName || 'عصب‌کشی و ترمیم'}) برای بیمار ${c.patientName} (کد ملی ${c.nationalId || '0012345678'}) طبق پروتکل استاندارد انجام شده و کسورات فوق غیرمجاز می‌باشد.`
      );
      setHasAttachedRvg(true);
      setHasAttachedNotes(true);
      setActiveFinancialSubTab('appeal_form');
    } else if (colKey === 'settled') {
      setActiveKanbanModalClaim(c);
      setActiveKanbanModalType('settled_receipt');
    }
  };

  const handleSubmitFormalAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealSelectedClaimId) {
      alert('لطفاً پرونده ادعای دارای کسورات را انتخاب فرمایید.');
      return;
    }
    if (!appealDefenseText.trim()) {
      alert('لطفاً متن لایحه دفاعیه را وارد کنید.');
      return;
    }

    if (onSubmitAppeal) {
      onSubmitAppeal(appealSelectedClaimId, appealDefenseText);
    } else if (setClaims) {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === appealSelectedClaimId
            ? { ...c, status: 'appealed', appealReason: appealDefenseText }
            : c
        )
      );
    }

    alert(`اعتراض رسمی برای پرونده ${appealSelectedClaimId} به سازمان بیمه‌گر ارسال گردید و در پورتال ثبت شد.`);
    setActiveFinancialSubTab('kanban');
  };

  const handleCreateNewClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPat = patients.find((p) => p.id === newClaimPatientId) || patients[0];
    const newClaimObj: Claim = {
      id: `CLM-${Date.now()}`,
      claimNumber: `CLM-1405-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: selectedPat?.id || 'pat-1',
      patientName: selectedPat?.fullName || 'بیمار جدید',
      nationalId: selectedPat?.nationalId || '0012345678',
      patientPhone: selectedPat?.phone || '09120000000',
      treatmentName: newClaimTreatment,
      toothFdi: Number(newClaimToothFdi),
      dateOfService: '۱۴۰۴/۱۱/۲۰',
      insuranceCompany: newClaimProvider,
      insuranceProvider: newClaimProvider,
      totalAmount: Number(newClaimAmount),
      claimedAmount: Number(newClaimAmount),
      coveredAmount: Math.round(Number(newClaimAmount) * 0.7),
      baseApprovedAmount: Math.round(Number(newClaimAmount) * 0.3),
      supplApprovedAmount: Math.round(Number(newClaimAmount) * 0.4),
      deductionAmount: 0,
      status: 'draft',
      riskScore: 10,
      submittedDate: 'امروز',
      autoApprovalConfidence: 92,
      greenLaneEligible: true,
      evidences: [
        { id: 'ev-1', title: 'گرافی RVG دیجیتال قبل و بعد', type: 'xray', uploaded: true, required: true },
        { id: 'ev-2', title: 'احراز هویت و استعلام آنلاین استحقاق', type: 'pre_auth_certificate', uploaded: true, required: true },
      ],
      narrativeText: `شرح درمان دندان ${newClaimToothFdi}: انجام ${newClaimTreatment} به دلیل ضایعه فعال بر اساس استانداردهای بالینی.`,
    };

    if (setClaims) {
      setClaims((prev) => [newClaimObj, ...prev]);
    }
    setSelectedClaimForDocReview(newClaimObj);
    setShowNewClaimModal(false);
    alert('ادعای بیمه‌ای جدید با موفقیت ثبت گردید.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Top Header & Clinic Mode Badges */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-bold shadow-md">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                مدیریت مدارک، پرونده‌ها و اسناد بیمه دنتورا
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffd200] text-[#005581] text-xs font-black">
                {claims.length} پرونده
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {hasAccountantRole
                ? 'بررسی چک‌لیست مدارک بالینی، تصاویر RVG و ویرایش شرح پزشک جهت تایید و ارجاع به کارتابل حسابدار کلینیک'
                : 'مدیریت کامل اسناد بیمه، فاکتورهای چندسهمی، بورد کانبان تسویه و ارسال مستقیم به بیمه‌گر (کلینیک بدون حسابدار)'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs px-3 py-1.5 rounded-xl font-bold border ${
              isInsuranceContracted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800'
            }`}
          >
            {isInsuranceContracted ? 'کلینیک طرف قرارداد آنلاین' : 'کلینیک غیر طرف قرارداد (آزاد + صدور فاکتور)'}
          </span>

          <span
            className={`text-xs px-3 py-1.5 rounded-xl font-bold border ${
              hasAccountantRole
                ? 'bg-blue-50 border-blue-200 text-[#005581] dark:bg-blue-950/40 dark:border-blue-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800'
            }`}
          >
            {hasAccountantRole ? 'کلینیک دارای حسابدار مستقل' : 'کلینیک بدون حسابدار (مدیریت مستقیم منشی)'}
          </span>

          <button
            type="button"
            onClick={() => setShowNewClaimModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#ffd200]" />
            <span>ثبت ادعای جدید</span>
          </button>
        </div>
      </div>

      {/* Main Top Tab Switcher:
          - If hasAccountantRole === true: Only Scrubber is shown
          - If hasAccountantRole === false: Shows '۱. پاک‌ساز ادعا و مدارک (Scrubber)' and '۲. امور مالی و کسورات بیمه'
      */}
      {!hasAccountantRole && (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setReceptionInsuranceSubTab('scrubber')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              receptionInsuranceSubTab === 'scrubber'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#ffd200]" />
            <span>۱. پاک‌ساز ادعا، شرح بالینی و چک‌لیست مدارک (Scrubber)</span>
          </button>

          <button
            type="button"
            onClick={() => setReceptionInsuranceSubTab('financial_board')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              receptionInsuranceSubTab === 'financial_board'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>۲. امور مالی، کانبان تسویه و کسورات بیمه</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: SCRUBBER, CLINICAL NARRATIVE & EVIDENCE CHECKLIST */}
      {/* ========================================================================= */}
      {(hasAccountantRole || receptionInsuranceSubTab === 'scrubber') && (
        <div className="space-y-5">
          {/* Active Claim Scrubber Card */}
          {selectedClaimForDocReview && (
            <div className="bg-sky-50/60 dark:bg-sky-950/20 border-2 border-sky-300 dark:border-sky-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-sky-200 dark:border-sky-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#005581] text-white flex items-center justify-center font-bold text-xs">
                    {selectedClaimForDocReview.patientName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {selectedClaimForDocReview.patientName}
                      </span>
                      <span className="font-mono text-xs text-[#005581] bg-sky-100 px-2 py-0.5 rounded-lg font-bold">
                        {selectedClaimForDocReview.claimNumber || selectedClaimForDocReview.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      سازمان بیمه‌گر: <strong>{cleanInsuranceName(selectedClaimForDocReview.insuranceCompany || selectedClaimForDocReview.insuranceProvider)}</strong> | دندان شماره (FDI): <strong>{selectedClaimForDocReview.toothFdi || 16}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* ACTION BUTTON BASED ON ACCOUNTANT ROLE & STATUS */}
                  {selectedClaimForDocReview.status === 'queued' || selectedClaimForDocReview.referredToAccountant ? (
                    <span className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#005581] dark:text-[#72cdf4] font-black text-xs flex items-center gap-1.5 border border-blue-300">
                      <CheckCircle2 className="w-4 h-4 text-[#005581]" />
                      <span>ارسال به حسابدار ✓</span>
                    </span>
                  ) : selectedClaimForDocReview.status === 'submitted' ? (
                    <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs flex items-center gap-1.5 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ارسال‌شده به سازمان بیمه‌گر ✓</span>
                    </span>
                  ) : hasAccountantRole ? (
                    <button
                      type="button"
                      onClick={() => handleReferClaimToAccountant(selectedClaimForDocReview.id)}
                      className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <SendHorizontal className="w-4 h-4 text-[#ffd200]" />
                      <span>تایید مدارک و ارسال به کارتابل حسابدار</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendClaimDirectToInsurerLocal(selectedClaimForDocReview.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <SendHorizontal className="w-4 h-4 text-white" />
                      <span>تایید و ارسال مستقیم به سازمان بیمه‌گر</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hidden File Inputs for real file attachments */}
              <input
                type="file"
                ref={certFileInputRef}
                onChange={handleUploadCertificate}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="hidden"
              />
              <input
                type="file"
                ref={xrayFileInputRef}
                onChange={handleUploadRadiograph}
                accept="image/*"
                className="hidden"
              />

              {/* Clinical Narrative Editor */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-sky-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#005581]" />
                    <span>شرح بالینی و توجیه درمانی پزشک معالج (Clinical Narrative):</span>
                  </span>
                  {editingNarrativeClaimId !== selectedClaimForDocReview.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNarrativeClaimId(selectedClaimForDocReview.id);
                        setNarrativeEditText(
                          selectedClaimForDocReview.narrativeText ||
                          `بیمار ${selectedClaimForDocReview.patientName} با کد ملی ${selectedClaimForDocReview.nationalId || '0012345678'} با شکایت از درد و ناراحتی دندان ${selectedClaimForDocReview.toothFdi || 16} مراجعه نمود. بر اساس معاینات بالینی و رادیوگرافی RVG، درمان ${selectedClaimForDocReview.treatmentName || 'عصب‌کشی و پرکردن دندان'} انجام شد. کلیه استانداردهای تعرفه‌ای بیمه رعایت شده است.`
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#005581] font-bold text-[11px] hover:bg-sky-100 transition flex items-center gap-1 cursor-pointer border border-sky-200"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>ویرایش شرح بالینی</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (setClaims) {
                            setClaims((prev) =>
                              prev.map((c) =>
                                c.id === selectedClaimForDocReview.id
                                  ? { ...c, narrativeText: narrativeEditText }
                                  : c
                              )
                            );
                          }
                          setSelectedClaimForDocReview((prev) =>
                            prev ? { ...prev, narrativeText: narrativeEditText } : prev
                          );
                          setEditingNarrativeClaimId(null);
                          showToast('شرح بالینی بیمار با موفقیت به‌روزرسانی شد.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>ذخیره شرح</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNarrativeClaimId(null)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-300 transition cursor-pointer"
                      >
                        انصراف
                      </button>
                    </div>
                  )}
                </div>

                {editingNarrativeClaimId === selectedClaimForDocReview.id ? (
                  <textarea
                    value={narrativeEditText}
                    onChange={(e) => setNarrativeEditText(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-[#005581] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none bg-sky-50/30"
                  />
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    {selectedClaimForDocReview.narrativeText ||
                      `بیمار ${selectedClaimForDocReview.patientName} با کد ملی ${selectedClaimForDocReview.nationalId || '0012345678'} با شکایت از درد و ناراحتی دندان ${selectedClaimForDocReview.toothFdi || 16} مراجعه نمود. بر اساس معاینات بالینی و رادیوگرافی RVG، درمان ${selectedClaimForDocReview.treatmentName || 'عصب‌کشی و پرکردن دندان'} انجام شد. کلیه استانداردهای تعرفه‌ای بیمه رعایت شده است.`}
                  </p>
                )}
              </div>

              {/* Evidence Checklist Grid - Connected to Treatment Desk & Real Uploads */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>چک‌لیست مدارک، گرافی‌ها و مستندات الزامی پرونده بیمه:</span>
                  </span>
                  <span className="text-[11px] text-[#005581] dark:text-[#72cdf4] font-bold">
                    متصل به سامانه پرونده بالینی و میز درمان
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {/* CARD 1: RVG Radiographs from Dentist Workspace */}
                  <div
                    onClick={() => {
                      setSelectedXrayIndex(0);
                      setSelectedDocForDetailModal({
                        title: 'گرافی‌های RVG و تصاویر رادیولوژی میز درمان',
                        type: 'رادیوگرافی دیجیتال میز بالینی',
                        uploaded: true,
                        required: true,
                        modalKind: 'xray',
                        notes: `تصاویر و گرافی‌های ثبت‌شده در میز کار دندان‌پزشک برای دندان ${selectedClaimForDocReview.toothFdi || 16} بیمار ${selectedClaimForDocReview.patientName}`,
                      });
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#005581] cursor-pointer transition shadow-2xs space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-[#005581]" />
                        رادیوگرافی دیجیتال
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-900 flex items-center justify-center">
                        {activeRadiographs[0]?.imageUrl ? (
                          <img
                            src={activeRadiographs[0].imageUrl}
                            alt="RVG"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                          گرافی RVG قبل و بعد از درمان
                        </h4>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {activeRadiographs.length} گرافی ثبت‌شده بالینی
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>تایید و پیوست شد</span>
                      <Eye className="w-3.5 h-3.5 text-[#005581] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 2: Clinical Narrative & FDI Match */}
                  <div
                    onClick={() => {
                      setSelectedDocForDetailModal({
                        title: 'تطابق کد FDI دندان با شرح و تشخیص پزشک',
                        type: 'اعتبارسنجی بالینی و تعرفه‌ای',
                        uploaded: true,
                        required: true,
                        modalKind: 'fdi_narrative',
                        notes: `بررسی تطابق شرح پزشک معالج (${selectedClaimForDocReview.dentistName || 'دندان‌پزشک'}) با شماره دندان ${selectedClaimForDocReview.toothFdi || 16}`,
                      });
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#005581] cursor-pointer transition shadow-2xs space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                        اعتبارسنجی بالینی
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        تطابق کد FDI با شرح پزشک
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        دندان {selectedClaimForDocReview.toothFdi || 16} | {selectedClaimForDocReview.treatmentName || 'درمان دندان‌پزشکی'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>منطبق با شرح درمان</span>
                      <Eye className="w-3.5 h-3.5 text-[#005581] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 3: Online Identity & Eligibility Verification */}
                  <div
                    onClick={() => {
                      setSelectedDocForDetailModal({
                        title: 'احراز هویت برخط و استعلام استحقاق درمان',
                        type: 'استعلام آنلاین شاهکار و بیمه‌گر',
                        uploaded: true,
                        required: true,
                        modalKind: 'eligibility',
                        notes: `استعلام آنلاین وضعیت بیمه تکمیلی برای کد ملی ${selectedClaimForDocReview.nationalId || '0034567890'} با موفقیت تایید شد.`,
                      });
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#005581] cursor-pointer transition shadow-2xs space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        استعلام آنلاین
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        احراز هویت و استحقاق درمان
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        کد ملی: {selectedClaimForDocReview.nationalId || '0034567890'} (شاهکار فعال)
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>استعلام فعال و معتبر</span>
                      <Eye className="w-3.5 h-3.5 text-[#005581] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 4: Insurance Approval Certificate (Real Upload / View) */}
                  <div
                    onClick={() => {
                      const hasUploaded = !!uploadedCertificates[selectedClaimForDocReview.id];
                      setSelectedDocForDetailModal({
                        title: 'گواهی تاییدیه پیش‌پرداخت بیمه‌گر',
                        type: 'مجوز و تاییدیه بیمه',
                        uploaded: hasUploaded,
                        required: true,
                        modalKind: 'pre_auth_cert',
                        notes: hasUploaded
                          ? `فایل تاییدیه ${uploadedCertificates[selectedClaimForDocReview.id].fileName} ضمیمه پرونده است.`
                          : 'امکان بارگذاری و آپلود مستقیم فایل گواهی تاییدیه بیمه',
                      });
                    }}
                    className={`p-3 rounded-xl border transition shadow-2xs space-y-2 group cursor-pointer ${
                      uploadedCertificates[selectedClaimForDocReview.id]
                        ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#005581]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                        مجوز بیمه
                      </span>
                      {uploadedCertificates[selectedClaimForDocReview.id] ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                          نیازمند آپلود
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        گواهی تاییدیه پیش‌پرداخت
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {uploadedCertificates[selectedClaimForDocReview.id]
                          ? uploadedCertificates[selectedClaimForDocReview.id].fileName
                          : isInsuranceContracted
                          ? 'صدور آنلاین تاییدیه / آپلود فایل'
                          : 'گواهی درمان فاکتور'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold">
                      {uploadedCertificates[selectedClaimForDocReview.id] ? (
                        <span className="text-emerald-700 dark:text-emerald-400">تاییدیه پیوست شد ✓</span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            certFileInputRef.current?.click();
                          }}
                          className="text-[#005581] hover:underline flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>آپلود تاییدیه</span>
                        </button>
                      )}
                      <Eye className="w-3.5 h-3.5 text-[#005581] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Claims Table for Document Review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#005581]" />
                <span>فهرست ادعاهای ثبت‌شده کلینیک جهت بررسی مستندات</span>
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                {claims.length} پرونده
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#005581] text-white font-bold">
                  <tr>
                    <th className="p-3">کد ادعا و بیمار</th>
                    <th className="p-3">سازمان بیمه‌گر / درمان</th>
                    <th className="p-3">مبلغ کل / سهم بیمه</th>
                    <th className="p-3">وضعیت مدارک</th>
                    <th className="p-3">وضعیت پرونده</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        هیچ پرونده بیمه‌ای ثبت نشده است.
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => (
                      <tr
                        key={claim.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                          selectedClaimForDocReview?.id === claim.id
                            ? 'bg-sky-50/60 dark:bg-sky-950/30'
                            : ''
                        }`}
                        onClick={() => setSelectedClaimForDocReview(claim)}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{claim.patientName}</div>
                          <div className="text-[11px] font-mono text-[#005581] mt-0.5">
                            {claim.claimNumber || claim.id} | {claim.nationalId || '0012345678'}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {claim.insuranceCompany || claim.insuranceProvider}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {claim.treatmentName || 'خدمات درمانی دندانپزشکی'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {(claim.totalAmount || claim.claimedAmount || 0).toLocaleString('fa-IR')} تومان
                          </div>
                          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                            سهم بیمه: {(claim.coveredAmount || (claim.totalAmount || 0) * 0.7).toLocaleString('fa-IR')} تومان
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> گرافی و شرح پیوست شد
                          </span>
                        </td>
                        <td className="p-3">
                          {claim.status === 'queued' || claim.referredToAccountant ? (
                            <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#005581] dark:text-[#72cdf4] font-bold text-[10px] inline-flex items-center gap-1 border border-blue-300 dark:border-blue-700">
                              <CheckCircle2 className="w-3 h-3 text-[#005581]" />
                              ارسال‌شده به حسابدار
                            </span>
                          ) : claim.status === 'submitted' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ارسال‌شده به سازمان بیمه‌گر
                            </span>
                          ) : claim.status === 'settled' || claim.status === 'paid' || claim.status === 'approved' || claim.status === 'partially_approved' || claim.status === 'approved_by_insurer' || claim.status === 'accepted' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {claim.status === 'partially_approved' ? 'تایید جزئی (تسویه‌شده)' : 'تسویه‌شده'}
                            </span>
                          ) : claim.status === 'rejected' || claim.status === 'rejected_by_insurer' || claim.status === 'partially_rejected' || claim.status === 'appealed' ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold text-[10px] inline-flex items-center gap-1 border border-rose-300">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              {claim.status === 'partially_rejected' ? 'رد جزئی (کسورات)' : claim.status === 'appealed' ? 'اعتراض ثبت‌شده' : 'برگشت‌خورده / رد'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-[10px] inline-flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              در حال بررسی
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClaimForDocReview(claim);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] cursor-pointer transition flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 text-[#ffd200]" />
                              <span>انتخاب پرونده</span>
                            </button>

                            {/* ACTION BUTTON BASED ON ACCOUNTANT ROLE & STATUS */}
                            {claim.status === 'queued' || claim.referredToAccountant ? (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#005581] dark:text-[#72cdf4] font-bold text-[11px] inline-flex items-center gap-1 border border-blue-300 dark:border-blue-700 shadow-2xs">
                                <Check className="w-3.5 h-3.5 text-[#005581]" />
                                <span>ارسال به حسابدار</span>
                              </span>
                            ) : claim.status === 'submitted' ? (
                              <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>ارسال‌شده به بیمه</span>
                              </span>
                            ) : hasAccountantRole ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClaimForDocReview(claim);
                                  handleReferClaimToAccountant(claim.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-bold text-[11px] cursor-pointer transition flex items-center gap-1 border border-amber-300 dark:border-amber-700 shadow-2xs"
                                title="کلیک جهت بررسی و ارسال به کارتابل حسابدار"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>در حال بررسی</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendClaimDirectToInsurerLocal(claim.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer transition flex items-center gap-1"
                              >
                                <SendHorizontal className="w-3 h-3 text-white" />
                                <span>ارسال به بیمه</span>
                              </button>
                            )}
                          </div>
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

      {/* ========================================================================= */}
      {/* SECTION 2: FINANCIAL, KANBAN & DEDUCTIONS (ONLY WHEN NO ACCOUNTANT ROLE) */}
      {/* ========================================================================= */}
      {!hasAccountantRole && receptionInsuranceSubTab === 'financial_board' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>امور مالی و کسورات بیمه</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                بورد کانبان ادعاها، مغایرت کسورات و ثبت اعتراض رسمی
              </p>
            </div>

            {greenLane && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>سطح اعتماد کلینیک: {greenLane.trustLevel || 'L4'}</span>
              </span>
            )}
          </div>

          {/* Sub-Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveFinancialSubTab('kanban')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFinancialSubTab === 'kanban'
                  ? 'bg-[#005581] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ۱. کانبان پیگیری ادعاها
            </button>

            <button
              onClick={() => setActiveFinancialSubTab('deductions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFinancialSubTab === 'deductions'
                  ? 'bg-[#005581] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ۲. مغایرت کسورات بیمه
            </button>

            <button
              onClick={() => setActiveFinancialSubTab('appeal_form')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFinancialSubTab === 'appeal_form'
                  ? 'bg-[#005581] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ۳. ثبت اعتراض رسمی (همراه با تصویر و آیین‌نامه)
            </button>
          </div>

          {/* SUB-TAB 1: CLAIMS KANBAN BOARD */}
          {activeFinancialSubTab === 'kanban' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#005581]" />
                  <span>بورد بصری کانبان مدیریت چرخه ادعاهای بیمه‌ای کلینیک</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  جهت مشاهده <strong>چک‌لیست مطابقت مالی، آپلود مدارک کسری یا ثبت اعتراض</strong> روی کارت‌ها کلیک فرمایید.
                </span>
              </div>

              {/* 4 Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { key: 'draft', title: '۱. ثبت‌شده (منشی)', color: 'border-slate-300 bg-slate-50/90 dark:bg-slate-800/40', badgeBg: 'bg-[#005581] text-white', labelBtn: 'بررسی مطابقت مالی' },
                  { key: 'submitted', title: '۲. ارسال‌شده به بیمه', color: 'border-blue-300 bg-blue-50/90 dark:bg-blue-950/30', badgeBg: 'bg-blue-700 text-white', labelBtn: 'مشاهده جزئیات' },
                  { key: 'rejected', title: '۳. برگشت‌خورده / کسورات', color: 'border-rose-300 bg-rose-50/90 dark:bg-rose-950/30', badgeBg: 'bg-rose-700 text-white', labelBtn: 'ثبت اعتراض رسمی' },
                  { key: 'settled', title: '۴. تسویه‌شده', color: 'border-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/30', badgeBg: 'bg-emerald-700 text-white', labelBtn: 'مشاهده فیش واریز' },
                ].map((col) => {
                  const colClaims = claims.filter((c) => {
                    if (col.key === 'draft') return c.status === 'draft' || c.status === 'queued' || c.status === 'pending_reception';
                    if (col.key === 'submitted') return c.status === 'submitted' || c.status === 'express_review' || c.status === 'standard_review' || c.status === 'deep_review' || c.status === 'needs_fix' || c.status === 'needs_evidence';
                    if (col.key === 'rejected') return c.status === 'rejected' || c.status === 'rejected_by_insurer' || c.status === 'partially_rejected' || c.status === 'appealed';
                    if (col.key === 'settled') return c.status === 'settled' || c.status === 'paid' || c.status === 'accepted' || c.status === 'approved' || c.status === 'partially_approved' || c.status === 'approved_by_insurer';
                    return false;
                  });

                  return (
                    <div key={col.key} className={`p-3 rounded-2xl border-2 ${col.color} space-y-2.5 min-h-[260px] flex flex-col justify-between shadow-2xs`}>
                      <div className="space-y-2">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700 pb-1.5 text-[11px]">
                          <span>{col.title}</span>
                          <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeBg}`}>
                            {colClaims.length}
                          </span>
                        </div>

                        {colClaims.length === 0 ? (
                          <div className="text-[10px] text-slate-400 text-center py-10 font-bold">
                            هیچ ادعایی در این مرحله وجود ندارد
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {colClaims.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => handleKanbanCardAction(c, col.key)}
                                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#005581] hover:shadow-md cursor-pointer transition-all space-y-1.5 group relative overflow-hidden"
                              >
                                {/* Line 1: Patient Name */}
                                <div className="flex items-center justify-between text-slate-900 dark:text-slate-100 font-extrabold text-[11px]">
                                  <span className="text-slate-500 font-normal">نام بیمار:</span>
                                  <span className="truncate max-w-[120px]">{c.patientName}</span>
                                </div>

                                {/* Line 2: Claim ID */}
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500 font-normal">شناسه ادعا:</span>
                                  <span className="font-mono text-[#005581] dark:text-sky-300 bg-cyan-50 dark:bg-cyan-950/50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-cyan-100 dark:border-cyan-800">
                                    {c.claimNumber || c.id}
                                  </span>
                                </div>

                                {/* Line 3: Insurance Provider */}
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500 font-normal">سازمان بیمه‌گر:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                    {c.insuranceCompany || c.insuranceProvider}
                                  </span>
                                </div>

                                {/* Action Button with explicit click handler */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleKanbanCardAction(c, col.key);
                                  }}
                                  className="w-full mt-1.5 py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-[#005581] group-hover:text-white text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#005581] group-hover:text-[#ffd200]" />
                                  <span>{col.labelBtn}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-[9px] text-slate-400 text-center font-mono border-t border-slate-200/60 dark:border-slate-700/60 pt-1">
                        کانبان هوشمند دنتورا
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: DEDUCTIONS RECONCILIATION TABLE */}
          {activeFinancialSubTab === 'deductions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#005581]" />
                  <span>جدول مغایرت‌گیری و بررسی کسورات بیمه‌گر</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {claims.length} ادعا
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#005581] text-white font-bold">
                    <tr>
                      <th className="p-3">کد ادعا</th>
                      <th className="p-3">بیمار</th>
                      <th className="p-3">سازمان بیمه</th>
                      <th className="p-3">مبلغ ادعا شده</th>
                      <th className="p-3">مبلغ تاییدشده</th>
                      <th className="p-3">مبلغ کسورات</th>
                      <th className="p-3">علت رسمی کسورات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {claims.map((claim) => {
                      const deduction = claim.deductionAmount || (claim.status === 'appealed' ? 500000 : 0);
                      const claimed = claim.claimedAmount || claim.totalAmount || 3500000;
                      const approved = claim.baseApprovedAmount || (claimed - deduction);

                      return (
                        <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3 font-mono font-bold text-[#005581] dark:text-sky-300">
                            {claim.claimNumber || claim.id}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                            {claim.patientName}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">
                            {claim.insuranceCompany || claim.insuranceProvider}
                          </td>
                          <td className="p-3 font-mono text-slate-800 dark:text-slate-200">
                            {claimed.toLocaleString()} تومان
                          </td>
                          <td className="p-3 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                            {approved.toLocaleString()} تومان
                          </td>
                          <td className="p-3 font-mono font-black">
                            {deduction > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">
                                {deduction.toLocaleString()} تومان
                              </span>
                            ) : (
                              <span className="text-rose-600/70 dark:text-rose-400/70">
                                ۰ تومان
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {deduction > 0
                              ? claim.appealReason || 'سقف تعرفه مصوب بیمه برای عصب‌کشی'
                              : 'سقف تعرفه'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: FORMAL APPEAL REGISTRATION */}
          {activeFinancialSubTab === 'appeal_form' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#005581]" />
                  <span>فرم جامع ثبت اعتراض به کسورات بیمه (همراه با تصویر و شرح آیین‌نامه)</span>
                </h3>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800">
                  پیوست تصویر گرافی RVG الزامی است
                </span>
              </div>

              <form
                onSubmit={handleSubmitFormalAppeal}
                className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs"
              >
                {/* Row 1: Select Claim */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    انتخاب پرونده و ادعای دارای کسورات:
                  </label>
                  <select
                    value={appealSelectedClaimId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setAppealSelectedClaimId(newId);
                      const targetC = claims.find((c) => c.id === newId);
                      if (targetC) {
                        setAppealDefenseText(
                          `با استناد به تصویر گرافی RVG پیوست‌شده و بند ۱۲ آیین‌نامه بیمه، درمان دندان ${targetC.toothFdi || 16} (${targetC.treatmentName || 'عصب‌کشی و ترمیم'}) برای بیمار ${targetC.patientName} (کد ملی ${targetC.nationalId || '0012345678'}) طبق پروتکل استاندارد انجام شده و کسورات فوق غیرمجاز می‌باشد.`
                        );
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold cursor-pointer"
                  >
                    <option value="">انتخاب پرونده ادعا...</option>
                    {claims.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.claimNumber || c.id} - {c.patientName} ({c.insuranceCompany || c.insuranceProvider}) - کسورات: {(c.deductionAmount || 500000).toLocaleString()} تومان
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 2: Category & Legal citation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      دسته‌بندی علت اعتراض:
                    </label>
                    <select
                      value={appealCategory}
                      onChange={(e) => setAppealCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold cursor-pointer"
                    >
                      <option value="کسورات غیرمجاز تعرفه‌ای">کسورات غیرمجاز تعرفه‌ای</option>
                      <option value="اشتباه در محاسبه فرانشیز پایه/تکمیلی">اشتباه در محاسبه فرانشیز پایه/تکمیلی</option>
                      <option value="عدم انطباق کد FDI دندان با تعرفه">عدم انطباق کد FDI دندان با تعرفه</option>
                      <option value="تاییدیه فنی رادیوگرافی RVG پری‌اپیکال">تاییدیه فنی رادیوگرافی RVG پری‌اپیکال</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      استناد به آیین‌نامه / بند قانونی بیمه:
                    </label>
                    <input
                      type="text"
                      value={appealRuleCitation}
                      onChange={(e) => setAppealRuleCitation(e.target.value)}
                      placeholder="مثال: بند ۱۲ آیین‌نامه تعرفه درمان شورای عالی بیمه"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                </div>

                {/* Row 3: Attached Evidence & Images */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#005581]" />
                      <span>تصاویر و مدارک پیوستی پرونده اعتراض (پیوست تصویر الزامی است):</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                      حداقل ۱ تصویر گرافی/بالینی
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHasAttachedRvg(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ افزودن عکس گرافی RVG دندان</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasAttachedNotes(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ افزودن شرح بالینی دندان‌پزشک</span>
                    </button>
                  </div>

                  {hasAttachedRvg && (
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                            عکس گرافی RVG پری‌اپیکال قبل/بعد درمان
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> پیوست تایید شد
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setHasAttachedRvg(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Row 4: Narrative Textarea */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    متن کامل لایحه دفاعیه و توجیه بالینی:
                  </label>
                  <textarea
                    rows={4}
                    value={appealDefenseText}
                    onChange={(e) => setAppealDefenseText(e.target.value)}
                    placeholder="مثال: با استناد به تصویر گرافی RVG پیوست‌شده و بند ۱۲ آیین‌نامه بیمه، درمان کانال ریشه طبق پروتکل استاندارد انجام شده و کسورات فوق غیرمجاز می‌باشد..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <SendHorizontal className="w-4 h-4 text-[#ffd200]" />
                    <span>ثبت و ارسال رسمی اعتراض به سازمان بیمه‌گر</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EXACT MATCH SCREENSHOT 1 (بررسی ادعای ثبت‌شده منشی و تطبیق خودکار مالی) */}
      {/* ========================================================================= */}
      {activeKanbanModalType === 'draft_compliance' && activeKanbanModalClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl space-y-0 text-xs">
            {/* Header */}
            <div className="bg-[#005581] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#ffd200]" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    بررسی ادعای ثبت‌شده منشی و تطبیق خودکار مالی
                  </h3>
                  <p className="text-xs text-sky-200 mt-0.5 font-mono">
                    کد ادعا: {activeKanbanModalClaim.claimNumber || 'CLM-2026-9904'} · سازمان بیمه‌گر: {activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه دانا (طرح استاندارد)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveKanbanModalType(null);
                  setActiveKanbanModalClaim(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Right Card: Patient Info */}
                <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">مشخصات بیمار و پرونده منشی:</span>
                    <span className="font-mono font-bold text-[#005581] dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                      {activeKanbanModalClaim.patientId || 'p-104'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">نام بیمار:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{activeKanbanModalClaim.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">کد ملی:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeKanbanModalClaim.nationalId || '0034567890'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">سازمان بیمه‌گر:</span>
                      <span className="font-bold text-[#005581] dark:text-sky-300">{activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه دانا (طرح استاندارد)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">احراز هویت پذیرش:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">تایید زنده شاهکار/منشی</span>
                    </div>
                  </div>
                </div>

                {/* Left Card: Treatment & Tooth Info */}
                <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">مشخصات درمان و دندان:</span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      FDI: {activeKanbanModalClaim.toothFdi || 11}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">عنوان درمان:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{activeKanbanModalClaim.treatmentName || 'جرم‌گیری و بروفلاکسی دو فک'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">شماره دندان:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">دندان شماره {activeKanbanModalClaim.toothFdi || 11}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">مبلغ ادعاشده:</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {(activeKanbanModalClaim.claimedAmount || activeKanbanModalClaim.totalAmount || 1800000).toLocaleString()} تومان
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">پزشک معالج:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">دکتر رضا حسینی (کد نظام: 10482)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist Card */}
              <div className="p-5 rounded-2xl border-2 border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>چک‌لیست مطابقت مالی و فنی (ورودی منشی):</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('فرم ویرایش دستی مقادیر باز شد.')}
                    className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-200 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>عدم مطابقت مالی / ویرایش دستی مقادیر</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">۱. استعلام هویت و شاهکار:</span>
                      <span className="text-slate-500 text-[11px]">کد ملی {activeKanbanModalClaim.nationalId || '0034567890'} تایید گردید.</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">۲. تطبیق کد تعرفه و K ارزش نسبی:</span>
                      <span className="text-slate-500 text-[11px]">کد تعرفه {activeKanbanModalClaim.treatmentName || 'جرم‌گیری و بروفلاکسی دو فک'} منطبق است.</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">۳. تصویر رادیوگرافی RVG:</span>
                      <span className="text-slate-500 text-[11px]">گرافی دندان {activeKanbanModalClaim.toothFdi || 11} در پرونده ثبت است.</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">۴. استعلام اعتبار سقف انفرادی:</span>
                      <span className="text-slate-500 text-[11px]">بیمه {activeKanbanModalClaim.insuranceCompany || 'بیمه دانا'} اعتبار دارد.</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                </div>

                <div className="pt-2">
                  {hasAccountantRole ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleReferClaimToAccountant(activeKanbanModalClaim.id);
                        setActiveKanbanModalType(null);
                        setActiveKanbanModalClaim(null);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <SendHorizontal className="w-4 h-4 text-[#ffd200]" />
                      <span>تایید مدارک و ارسال به کارتابل حسابدار</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleSendClaimDirectToInsurerLocal(activeKanbanModalClaim.id);
                        setActiveKanbanModalType(null);
                        setActiveKanbanModalClaim(null);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>تایید و ارسال مستقیم به سازمان بیمه‌گر</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lifecycle Stepper matching screenshot */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                  مراحل چرخه ادعا و پرونده بیمه‌ای:
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold">
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>۱. ثبت اولیه منشی</span>
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ۲. ارسال به بیمه
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ۳. رفع کسری مدارک
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ۴. بررسی اعتراض
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ۵. تسویه نهایی بانک
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveKanbanModalType(null);
                  setActiveKanbanModalClaim(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                بستن پنجره
              </button>

              <button
                type="button"
                onClick={() => alert(`پرونده و فاکتور بیمه ${activeKanbanModalClaim.patientName} برای چاپ آماده شد.`)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#005581]" />
                <span>چاپ پرونده و فاکتور بیمه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EXACT MATCH SCREENSHOT 2 (اطلاعات کامل ادعای ارسال‌شده به بیمه‌گر) */}
      {/* ========================================================================= */}
      {activeKanbanModalType === 'submitted_detail' && activeKanbanModalClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl space-y-0 text-xs">
            {/* Header */}
            <div className="bg-[#005581] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#ffd200]" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    اطلاعات کامل ادعای ارسال‌شده به بیمه‌گر
                  </h3>
                  <p className="text-xs text-sky-200 mt-0.5 font-mono">
                    کد ادعا: {activeKanbanModalClaim.claimNumber || 'CLM-2026-9901'} · سازمان بیمه‌گر: {activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه سامان (طرح طلایی)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveKanbanModalType(null);
                  setActiveKanbanModalClaim(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <span>مرحله فعلی در کانبان بیمه:</span>
                  <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 font-extrabold border border-blue-300">
                    ۲. ارسال‌شده به بیمه (در حال ارزیابی)
                  </span>
                </div>
                <span className="text-slate-500 font-mono text-xs">
                  تاریخ ارائه خدمت: ۱۴۰۵/۰۵/۱۰
                </span>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Right Card: Patient Info */}
                <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">مشخصات بیمار و پرونده منشی:</span>
                    <span className="font-mono font-bold text-[#005581] dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                      {activeKanbanModalClaim.patientId || 'p-101'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">نام بیمار:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{activeKanbanModalClaim.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">کد ملی:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeKanbanModalClaim.nationalId || '0012345678'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">سازمان بیمه‌گر:</span>
                      <span className="font-bold text-[#005581] dark:text-sky-300">{activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه سامان (طرح طلایی)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">احراز هویت پذیرش:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">تایید زنده شاهکار/منشی</span>
                    </div>
                  </div>
                </div>

                {/* Left Card: Treatment & Tooth Info */}
                <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">مشخصات درمان و دندان:</span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      FDI: {activeKanbanModalClaim.toothFdi || 16}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">عنوان درمان:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{activeKanbanModalClaim.treatmentName || 'عصب‌کشی ۲ کانال دندان ۱۶'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">شماره دندان:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">دندان شماره {activeKanbanModalClaim.toothFdi || 16}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">مبلغ ادعاشده:</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {(activeKanbanModalClaim.claimedAmount || activeKanbanModalClaim.totalAmount || 5200000).toLocaleString()} تومان
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">پزشک معالج:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">دکتر رضا حسینی (کد نظام: 10482)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifecycle Stepper matching screenshot */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                  مراحل چرخه ادعا و پرونده بیمه‌ای:
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold">
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>۱. ثبت اولیه منشی</span>
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center">
                    ۲. ارسال به بیمه
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ۳. رفع کسری مدارک
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ۴. بررسی اعتراض
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ۵. تسویه نهایی بانک
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveKanbanModalType(null);
                  setActiveKanbanModalClaim(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                بستن پنجره
              </button>

              <button
                type="button"
                onClick={() => alert(`پرونده و فاکتور بیمه ${activeKanbanModalClaim.patientName} برای چاپ آماده شد.`)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#005581]" />
                <span>چاپ پرونده و فاکتور بیمه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXACT MATCH SCREENSHOT 3 (گزارش ادعای تسویه‌شده و واریزی به حساب کلینیک) */}
      {/* ========================================================================= */}
      {activeKanbanModalType === 'settled_receipt' && activeKanbanModalClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl space-y-0 text-xs">
            {/* Header */}
            <div className="bg-[#005581] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#ffd200]" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    گزارش ادعای تسویه‌شده و واریزی به حساب کلینیک
                  </h3>
                  <p className="text-xs text-sky-200 mt-0.5 font-mono">
                    کد ادعا: {activeKanbanModalClaim.claimNumber || 'CLM-2026-9911'} · سازمان بیمه‌گر: {activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه ایران (قرارداد مستقیم)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveKanbanModalType(null);
                  setActiveKanbanModalClaim(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <span>مرحله فعلی در کانبان بیمه:</span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300">
                    ۵. تسویه‌شده و واریز بانک
                  </span>
                </div>
                <span className="text-slate-500 font-mono text-xs">
                  تاریخ ارائه خدمت: ۱۴۰۵/۰۴/۲۸
                </span>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Right Card: Patient Info */}
                <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">مشخصات بیمار و پرونده منشی:</span>
                    <span className="font-mono font-bold text-[#005581] dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                      {activeKanbanModalClaim.patientId || 'p-111'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">نام بیمار:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{activeKanbanModalClaim.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">کد ملی:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeKanbanModalClaim.nationalId || '0011223344'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">سازمان بیمه‌گر:</span>
                      <span className="font-bold text-[#005581] dark:text-sky-300">{activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه ایران (قرارداد مستقیم)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">احراز هویت پذیرش:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">تایید زنده شاهکار/منشی</span>
                    </div>
                  </div>
                </div>

                {/* Left Card: Treatment & Tooth Info */}
                <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">مشخصات درمان و دندان:</span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      FDI: {activeKanbanModalClaim.toothFdi || 45}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">عنوان درمان:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{activeKanbanModalClaim.treatmentName || 'پروتز متحرک پارسیل دندان‌های ۴۵ تا ۴۷'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">شماره دندان:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">دندان شماره {activeKanbanModalClaim.toothFdi || 45}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">مبلغ ادعاشده:</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {(activeKanbanModalClaim.claimedAmount || activeKanbanModalClaim.totalAmount || 9600000).toLocaleString()} تومان
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">پزشک معالج:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">دکتر رضا حسینی (کد نظام: 10482)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement and Bank Receipt Box matching screenshot 3 */}
              <div className="p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>گزارش کامل تسویه‌حساب و فیش واریز بیمه‌گر:</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]">
                    تسویه کامل ۱۰۰٪
                  </span>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-slate-500 text-[11px] block">مبلغ کل ادعاشده:</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200 text-xs">
                      {(activeKanbanModalClaim.claimedAmount || 9600000).toLocaleString()} ت
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-slate-500 text-[11px] block">سهم بیمه پایه:</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200 text-xs">
                      {(activeKanbanModalClaim.baseApprovedAmount || 2600000).toLocaleString()} ت
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-slate-500 text-[11px] block">سهم بیمه تکمیلی:</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200 text-xs">
                      {(activeKanbanModalClaim.supplApprovedAmount || 7000000).toLocaleString()} ت
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-slate-500 text-[11px] block">خالص دریافتی کلینیک:</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                      {(activeKanbanModalClaim.claimedAmount || 9600000).toLocaleString()} ت
                    </span>
                  </div>
                </div>

                {/* Bank tracking details */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">کد پیگیری شبا / فیش واریز بانک:</span>
                    <span className="font-mono font-bold text-[#005581] dark:text-sky-300">BNK-9982410023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">شماره حساب واریزی:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">IR980120000000012345678001 (بانک رفاه کارگران)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">تاریخ تسویه حسابداری:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">۱۴۰۵/۰۵/۰۸</span>
                  </div>
                </div>
              </div>

              {/* Lifecycle Stepper matching screenshot */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                  مراحل چرخه ادعا و پرونده بیمه‌ای:
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold">
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>۱. ثبت اولیه منشی</span>
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center">
                    ۲. ارسال به بیمه
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center">
                    ۳. رفع کسری مدارک
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center">
                    ۴. بررسی اعتراض
                  </div>
                  <div className="py-2 px-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center">
                    ۵. تسویه نهایی بانک
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveKanbanModalType(null);
                  setActiveKanbanModalClaim(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                بستن پنجره
              </button>

              <button
                type="button"
                onClick={() => alert(`پرونده و فاکتور بیمه ${activeKanbanModalClaim.patientName} برای چاپ آماده شد.`)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#005581]" />
                <span>چاپ پرونده و فاکتور بیمه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Claim Registration */}
      {showNewClaimModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#005581]" />
                <span>ثبت ادعا و پرونده بیمه دنتورا</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewClaimModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClaimSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">انتخاب بیمار:</label>
                <select
                  value={newClaimPatientId}
                  onChange={(e) => setNewClaimPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} - {p.nationalId} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">شرح درمان:</label>
                  <input
                    type="text"
                    value={newClaimTreatment}
                    onChange={(e) => setNewClaimTreatment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">شماره دندان (کد FDI):</label>
                  <input
                    type="number"
                    value={newClaimToothFdi}
                    onChange={(e) => setNewClaimToothFdi(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">سازمان بیمه‌گر:</label>
                  <select
                    value={newClaimProvider}
                    onChange={(e) => setNewClaimProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="بیمه سامان (طرح طلایی)">بیمه سامان (طرح طلایی)</option>
                    <option value="بیمه تامین اجتماعی">بیمه تامین اجتماعی</option>
                    <option value="بیمه ایران">بیمه ایران</option>
                    <option value="بیمه دانا (طرح استاندارد)">بیمه دانا (طرح استاندارد)</option>
                    <option value="بیمه نیروهای مسلح">بیمه نیروهای مسلح</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تعرفه کل (تومان):</label>
                  <input
                    type="number"
                    value={newClaimAmount}
                    onChange={(e) => setNewClaimAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 text-[11px] text-[#005581] dark:text-sky-300 font-medium">
                سیستم پاک‌ساز دنتورا مدارک اولیه RVG و احراز هویت را به طور خودکار به این پرونده الصاق خواهد نمود.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold shadow-md"
                >
                  ثبت نهایی ادعا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Document / Evidence Details & Real X-Ray / Pre-Auth Viewer */}
      {selectedDocForDetailModal && selectedClaimForDocReview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-[#005581] flex items-center justify-center font-bold">
                  {selectedDocForDetailModal.modalKind === 'xray' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : selectedDocForDetailModal.modalKind === 'pre_auth_cert' ? (
                    <Paperclip className="w-4 h-4" />
                  ) : selectedDocForDetailModal.modalKind === 'fdi_narrative' ? (
                    <FileCheck className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedDocForDetailModal.title}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    پرونده: {selectedClaimForDocReview.patientName} | کد ادعا: {selectedClaimForDocReview.claimNumber || selectedClaimForDocReview.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocForDetailModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Based on modalKind */}
            {selectedDocForDetailModal.modalKind === 'xray' ? (
              /* REAL RADIOGRAPH VIEWER FROM TREATMENT DESK */
              <div className="space-y-4">
                <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#005581] dark:text-sky-300 block">
                      منبع تصویر: {activeRadiographs[selectedXrayIndex]?.source || 'ثبت‌شده در میز درمان دندان‌پزشک'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      پزشک معالج: {activeRadiographs[selectedXrayIndex]?.doctorName || selectedClaimForDocReview.dentistName || 'دکتر معالج'} | تاریخ ثبت: {activeRadiographs[selectedXrayIndex]?.date || selectedClaimForDocReview.dateOfService || '۱۴۰۵/۰۵/۲۰'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => xrayFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#005581] hover:bg-[#004266] text-white font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#ffd200]" />
                    <span>آپلود گرافی جدید</span>
                  </button>
                </div>

                {/* Main High-Res Image Display */}
                <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-4/3 flex items-center justify-center group">
                  <img
                    src={activeRadiographs[selectedXrayIndex]?.imageUrl || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=85'}
                    alt="Radiograph Preview"
                    className="w-full h-full object-contain max-h-[380px]"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-mono border border-white/20">
                    FDI دندان: {activeRadiographs[selectedXrayIndex]?.toothFdi || selectedClaimForDocReview.toothFdi || 16} | نوع: {activeRadiographs[selectedXrayIndex]?.type?.toUpperCase() || 'RVG'}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-xs text-white p-2.5 rounded-xl text-xs border border-white/10 space-y-1">
                    <p className="font-bold text-slate-200">
                      {activeRadiographs[selectedXrayIndex]?.title || 'گرافی پری‌آپیکال دیجیتال'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      یادداشت پزشک: {activeRadiographs[selectedXrayIndex]?.doctorNotes || 'تایید وضعیت انطباق کانال ریشه و سلامت استخوان آلوئول'}
                    </p>
                  </div>
                </div>

                {/* Multiple Image Thumbnails if available */}
                {activeRadiographs.length > 1 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      سایر گرافی‌های متصل به پرونده این بیمار:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {activeRadiographs.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          onClick={() => setSelectedXrayIndex(idx)}
                          className={`w-20 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition shrink-0 bg-black ${
                            selectedXrayIndex === idx
                              ? 'border-[#005581] shadow-md ring-2 ring-sky-300'
                              : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تصویر رادیوگرافی با استانداردهای DICOM/RVG و مهر الکترونیک دندان‌پزشک تایید شده است.</span>
                </div>
              </div>
            ) : selectedDocForDetailModal.modalKind === 'pre_auth_cert' ? (
              /* REAL PRE-AUTH CERTIFICATE VIEWER / UPLOADER */
              <div className="space-y-4">
                {uploadedCertificates[selectedClaimForDocReview.id] ? (
                  /* Uploaded Certificate Details */
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="font-black text-xs text-emerald-900 dark:text-emerald-200">
                            گواهی تاییدیه بیمه‌گر ضمیمه شده است
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-mono text-[11px] font-bold">
                          {uploadedCertificates[selectedClaimForDocReview.id].preAuthCode}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 block">نام فایل پیوست:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {uploadedCertificates[selectedClaimForDocReview.id].fileName}
                          </span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 block">حجم و زمان آپلود:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {uploadedCertificates[selectedClaimForDocReview.id].fileSize} ({uploadedCertificates[selectedClaimForDocReview.id].uploadTime})
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-slate-700 bg-slate-950 p-2 flex items-center justify-center max-h-56">
                        <img
                          src={uploadedCertificates[selectedClaimForDocReview.id].fileUrl}
                          alt="Certificate preview"
                          className="max-h-52 object-contain rounded-lg shadow"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => certFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>تغییر فایل تاییدیه</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedCertificates((prev) => {
                              const copy = { ...prev };
                              delete copy[selectedClaimForDocReview.id];
                              return copy;
                            });
                            showToast('پیوست گواهی تاییدیه بیمه حذف گردید.');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف پیوست</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Dropzone Area */
                  <div className="space-y-3">
                    <div
                      onClick={() => certFileInputRef.current?.click()}
                      className="p-8 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 hover:border-[#005581] bg-sky-50/40 dark:bg-sky-950/20 text-center space-y-3 cursor-pointer transition group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#005581] text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-[#ffd200]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                          برای آپلود گواهی تاییدیه پیش‌پرداخت کلیک کنید
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          پشتیبانی از فرمت‌های تصویری و PDF (PNG, JPG, PDF حداکثر ۱۰ مگابایت)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-[#005581] text-white font-bold text-xs shadow-xs"
                      >
                        انتخاب فایل از رایانه
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                      در قراردادهای فعال با بیمه‌گر، در صورت صدور معرفی‌نامه یا مجوز درمان، بارگذاری فایل تاییدیه موجب تسریع رسیدگی و کاهش کسورات احتمالی می‌گردد.
                    </div>
                  </div>
                )}
              </div>
            ) : selectedDocForDetailModal.modalKind === 'fdi_narrative' ? (
              /* FDI & CLINICAL VALIDATION */
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      دندان هدف: شماره FDI {selectedClaimForDocReview.toothFdi || 16}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      تطابق ۱۰۰٪
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {selectedClaimForDocReview.narrativeText ||
                      `شرح بالینی ثبت‌شده توسط ${selectedClaimForDocReview.dentistName || 'دندان‌پزشک معالج'}: معاینه و انجام درمان ${selectedClaimForDocReview.treatmentName || 'عصب‌کشی و پرکردن'} با رعایت تعرفه استاندارد.`}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>کد خدمات درمانی، شماره دندان و شرح بالینی با قوانین سامانه‌های بیمه‌گر منطبق است.</span>
                </div>
              </div>
            ) : (
              /* ELIGIBILITY & SHAHKAR */
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">نام بیمار و کد ملی:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {selectedClaimForDocReview.patientName} ({selectedClaimForDocReview.nationalId || '0034567890'})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">سازمان بیمه‌گر:</span>
                      <span className="font-bold text-[#005581] block">
                        {cleanInsuranceName(selectedClaimForDocReview.insuranceCompany || selectedClaimForDocReview.insuranceProvider)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>استعلام برخط استحقاق درمان و تطابق شماره همراه با کد ملی (شاهکار) معتبر است.</span>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDocForDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs transition cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-5 py-3 rounded-2xl bg-emerald-700 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 border border-emerald-500">
            <CheckCircle2 className="w-5 h-5 text-[#ffd200] shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
