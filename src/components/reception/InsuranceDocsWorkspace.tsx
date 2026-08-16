import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

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
  const [activeFinancialSubTab, setActiveFinancialSubTab] = useState<'multi_payer' | 'kanban' | 'deductions' | 'appeal_form'>('kanban');

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
  } | null>(null);

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
        prev.map((c) => (c.id === claimId ? { ...c, status: 'queued' } : c))
      );
    }
    alert('پرونده و مدارک بیمه با موفقیت ارزیابی شد و به کارتابل مالی حسابدار ارجاع گردید.');
  };

  const handleSendClaimDirectToInsurerLocal = (claimId: string) => {
    if (onSendClaimToInsurance) {
      onSendClaimToInsurance(claimId);
    } else if (setClaims) {
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: 'submitted' } : c))
      );
    }
    alert('ادعای بیمه با موفقیت بررسی و مستقیماً به پورتال سازمان بیمه‌گر ارسال شد.');
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
                      سازمان بیمه‌گر: <strong>{selectedClaimForDocReview.insuranceCompany || selectedClaimForDocReview.insuranceProvider}</strong> | دندان شماره (FDI): <strong>{selectedClaimForDocReview.toothFdi || 16}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedClaimForDocReview.greenLaneEligible && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>مسیر سبز هوشمند دنتورا</span>
                    </span>
                  )}

                  {/* ACTION BUTTON BASED ON ACCOUNTANT ROLE */}
                  {hasAccountantRole ? (
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
                          alert('شرح بالینی بیمار با موفقیت به‌روزرسانی شد.');
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

              {/* Evidence Checklist Grid */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>چک‌لیست مدارک، گرافی‌ها و مستندات الزامی پرونده بیمه:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { id: '1', title: 'گرافی RVG قبل و بعد از درمان', type: 'رادیوگرافی دیجیتال', status: 'تایید و پیوست شد', ok: true },
                    { id: '2', title: 'تطابق کد FDI دندان با شرح پزشک', type: 'اعتبارسنجی بالینی', status: 'منطبق با درمان', ok: true },
                    { id: '3', title: 'احراز هویت و استعلام استحقاق درمان', type: 'استعلام آنلاین', status: 'استعلام فعال', ok: true },
                    { id: '4', title: 'گواهی تاییدیه پیش‌پرداخت بیمه‌گر', type: 'مجوز بیمه', status: isInsuranceContracted ? 'صدور آنلاین WORM' : 'گواهی درمان فاکتور', ok: true },
                  ].map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() =>
                        setSelectedDocForDetailModal({
                          title: ev.title,
                          type: ev.type,
                          uploaded: ev.ok,
                          required: true,
                          notes: `مستند پیوست‌شده برای بیمار ${selectedClaimForDocReview.patientName} بررسی شد.`,
                        })
                      }
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#005581] cursor-pointer transition shadow-2xs space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">{ev.type}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{ev.title}</h4>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        <span>{ev.status}</span>
                        <Eye className="w-3.5 h-3.5 text-[#005581] group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  ))}
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
                          {claim.status === 'draft' || claim.status === 'pending_reception' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                              در انتظار بررسی منشی
                            </span>
                          ) : claim.status === 'queued' ? (
                            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px]">
                              ارسال‌شده به حسابداری
                            </span>
                          ) : claim.status === 'submitted' ? (
                            <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 font-bold text-[10px]">
                              ارسال‌شده به بیمه‌گر
                            </span>
                          ) : claim.status === 'settled' || claim.status === 'paid' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                              تسویه‌شده
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px]">
                              دارای کسورات / اعتراض
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

                            {/* ACTION BUTTON BASED ON ACCOUNTANT ROLE */}
                            {hasAccountantRole ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReferClaimToAccountant(claim.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-[#005581] font-bold text-[11px] cursor-pointer transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3 text-[#005581]" />
                                <span>ارسال به حسابدار</span>
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
                تفکیک چندسهمی، بورد کانبان ادعاها، مغایرت کسورات و ثبت اعتراض رسمی
              </p>
            </div>

            {greenLane && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>سطح اعتماد کلینیک: {greenLane.trustLevel || 'L4'}</span>
              </span>
            )}
          </div>

          {/* 4 Sub-Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveFinancialSubTab('multi_payer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFinancialSubTab === 'multi_payer'
                  ? 'bg-[#005581] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ۱. فاکتورهای چندسهمی
            </button>

            <button
              onClick={() => setActiveFinancialSubTab('kanban')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFinancialSubTab === 'kanban'
                  ? 'bg-[#005581] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ۲. کانبان پیگیری ادعاها
            </button>

            <button
              onClick={() => setActiveFinancialSubTab('deductions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFinancialSubTab === 'deductions'
                  ? 'bg-[#005581] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ۳. مغایرت کسورات بیمه
            </button>

            <button
              onClick={() => setActiveFinancialSubTab('appeal_form')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFinancialSubTab === 'appeal_form'
                  ? 'bg-[#005581] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ۴. ثبت اعتراض رسمی (همراه با تصویر و آیین‌نامه)
            </button>
          </div>

          {/* SUB-TAB 1: MULTI-PAYER WATERFALL INVOICE CALCULATOR */}
          {activeFinancialSubTab === 'multi_payer' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                محاسبه‌گر و تفکیک سه ضلعی فاکتور (بیمه پایه ← بیمه تکمیلی ← پرداختی بیمار)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">هزینه کل درمان (تومان):</label>
                    <input
                      type="number"
                      value={waterfallCost}
                      onChange={(e) => setWaterfallCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      پوشش بیمه پایه: {baseCoveragePercent}٪
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={baseCoveragePercent}
                      onChange={(e) => setBaseCoveragePercent(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      پوشش بیمه تکمیلی: {supplCoveragePercent}٪
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={supplCoveragePercent}
                      onChange={(e) => setSupplCoveragePercent(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Result Waterfall Display */}
                <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2.5">
                  <h4 className="font-bold text-cyan-400 border-b border-slate-800 pb-2">
                    تفکیک مالی سه ضلعی:
                  </h4>
                  <div className="flex justify-between border-b border-slate-800 py-1">
                    <span>۱. تعرفه درمانی:</span>
                    <span className="font-bold">{waterfallCost.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1 text-slate-300">
                    <span>۲. سهم بیمه پایه ({baseCoveragePercent}٪):</span>
                    <span className="text-emerald-400 font-bold">- {calculatedBaseShare.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1 text-slate-300">
                    <span>۳. سهم بیمه تکمیلی ({supplCoveragePercent}٪):</span>
                    <span className="text-cyan-400 font-bold">- {calculatedSupplShare.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/40 mt-2">
                    <span className="font-bold text-emerald-300 font-sans">سهم نقدی بیمار:</span>
                    <span className="font-black text-emerald-400 text-base">{calculatedPatientShare.toLocaleString()} تومان</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: CLAIMS KANBAN BOARD */}
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
                    if (col.key === 'submitted') return c.status === 'submitted' || c.status === 'approved_by_insurer' || c.status === 'express_review';
                    if (col.key === 'rejected') return c.status === 'rejected' || c.status === 'rejected_by_insurer' || c.status === 'appealed' || (c.deductionAmount || 0) > 0;
                    if (col.key === 'settled') return c.status === 'settled' || c.status === 'paid' || c.status === 'accepted';
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
                    کد ادعا: {activeKanbanModalClaim.claimNumber || 'CLM-2026-9904'} · سازمان بیمه‌گر: {activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه دانا (طرح نقره‌ای)'}
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
                      <span className="font-bold text-[#005581] dark:text-sky-300">{activeKanbanModalClaim.insuranceCompany || activeKanbanModalClaim.insuranceProvider || 'بیمه دانا (طرح نقره‌ای)'}</span>
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
                  <button
                    type="button"
                    onClick={() => {
                      handleSendClaimDirectToInsurerLocal(activeKanbanModalClaim.id);
                      setActiveKanbanModalType(null);
                      setActiveKanbanModalClaim(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#ffd200]" />
                    <span>تایید مطابقت مالی و ارسال مستقیم به بیمه‌گر</span>
                  </button>
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
                    <option value="بیمه دانا (طرح نقره‌ای)">بیمه دانا (طرح نقره‌ای)</option>
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

      {/* Modal: Document / Evidence Details */}
      {selectedDocForDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#005581]" />
                <span>پیش‌نمایش سند بالینی</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDocForDetailModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  عنوان سند: {selectedDocForDetailModal.title}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  نوع پیوست: {selectedDocForDetailModal.type}
                </span>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl text-center font-mono text-xs">
                [تصویر گرافی دیجیتال RVG پری‌اپیکال با کد رمزنگاری SHA-256 و تاییدیه بالینی WORM]
              </div>

              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> مدرک با موفقیت احراز اصالت شد و در پرونده بیمه بیمار ثبت گردید.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDocForDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-[#005581] text-white font-bold text-xs"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
