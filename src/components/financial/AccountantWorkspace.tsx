import React, { useState } from 'react';
import {
  TodayMoneyBoard,
  Invoice,
  InstallmentPlan,
  Claim,
  GreenLaneStatus,
  AuditLog,
} from '../../types';
import { mockClaims } from '../../data/mockData';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  Lock,
  Download,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Send,
  AlertCircle,
  PieChart,
  ArrowRightLeft,
  X,
  Printer,
  Check,
  Activity,
  Layers,
  ChevronDown,
  ShieldAlert,
  UserCheck,
  Building,
  Eye,
  FileImage,
  Upload,
  Paperclip,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  History,
  Zap,
  Edit3,
  AlertTriangle,
} from 'lucide-react';

interface AccountantWorkspaceProps {
  moneyBoard: TodayMoneyBoard;
  invoices: Invoice[];
  installments: InstallmentPlan[];
  claims?: Claim[];
  setClaims?: React.Dispatch<React.SetStateAction<Claim[]>>;
  greenLane?: GreenLaneStatus;
  auditLogs?: AuditLog[];
  insuranceModuleActive?: boolean;
  onToggleInsuranceModule?: () => void;
  isInsuranceContracted?: boolean;
  onToggleInsuranceContracted?: () => void;
  hasAccountantRole?: boolean;
  onToggleHasAccountantRole?: () => void;
  connectionStatus?: 'online' | 'offline' | 'syncing';
  onToggleConnectionStatus?: () => void;
  isBNPLEnabledForClinic?: boolean;
  onPayInstallment: (planId: string, installmentNo: number) => void;
  onSubmitAppeal?: (claimId: string, appealReason: string) => void;
  initialActiveTab?: AccountantNavTab;
  hideSidebar?: boolean;
}

type AccountantNavTab =
  | 'cash_flow'
  | 'installments'
  | 'invoices'
  | 'daily_reports'
  | 'insurance_tier2';

type InsuranceSubTab =
  | 'multi_payer'
  | 'kanban'
  | 'deductions'
  | 'appeal_form';

export const AccountantWorkspace: React.FC<AccountantWorkspaceProps> = ({
  moneyBoard,
  invoices,
  installments,
  claims = [],
  setClaims,
  greenLane,
  auditLogs = [],
  insuranceModuleActive = true,
  onToggleInsuranceModule,
  isInsuranceContracted = true,
  onToggleInsuranceContracted,
  hasAccountantRole = true,
  onToggleHasAccountantRole,
  connectionStatus = 'online',
  onToggleConnectionStatus,
  isBNPLEnabledForClinic = true,
  onPayInstallment,
  onSubmitAppeal,
  initialActiveTab = 'cash_flow',
  hideSidebar = false,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AccountantNavTab>(initialActiveTab);
  const [activeInsuranceSubTab, setActiveInsuranceSubTab] = useState<InsuranceSubTab>('multi_payer');

  // Local state for Installments & New Plan Modal
  const [localInstallments, setLocalInstallments] = useState<InstallmentPlan[]>(installments);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [newPlanPatientName, setNewPlanPatientName] = useState('');
  const [newPlanPhone, setNewPlanPhone] = useState('');
  const [newPlanTreatmentTitle, setNewPlanTreatmentTitle] = useState('');
  const [newPlanTotalAmount, setNewPlanTotalAmount] = useState<number>(12000000);
  const [newPlanPrePayment, setNewPlanPrePayment] = useState<number>(3000000);
  const [newPlanCount, setNewPlanCount] = useState<number>(3);
  const [newPlanFirstDueDate, setNewPlanFirstDueDate] = useState('1405/06/15');
  const [newPlanIsBNPL, setNewPlanIsBNPL] = useState<boolean>(false);
  const [bnplAutoSettleNotice, setBnplAutoSettleNotice] = useState<string | null>(null);

  // Local state for interactive features
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'this_month' | 'this_year'>('today');
  const [selectedDentist, setSelectedDentist] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('all');
  
  // Dentora Insurance Connection & Gateway-less Baseline State
  const [isDentoraActive, setIsDentoraActive] = useState<boolean>(insuranceModuleActive ?? true);
  const [isGatewayLessBaseline, setIsGatewayLessBaseline] = useState<boolean>(true);
  const [enableBNPL, setEnableBNPL] = useState<boolean>(true);
  
  // Refund / Corrective Invoice Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedInvoiceForRefund, setSelectedInvoiceForRefund] = useState<Invoice | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState('');

  // Daily POS Closing / Reconciliation State
  const [posSystemTotal, setPosSystemTotal] = useState<number>(moneyBoard.receivedTodayCashPos);
  const [posPhysicalTerminalInput, setPosPhysicalTerminalInput] = useState<number>(moneyBoard.receivedTodayCashPos);
  const [reconciliationStatus, setReconciliationStatus] = useState<'idle' | 'matched' | 'mismatch'>('idle');

  // Appeal Submission Modal State
  const [selectedClaimForAppeal, setSelectedClaimForAppeal] = useState<Claim | null>(null);
  const [appealText, setAppealText] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [appealReasonCategory, setAppealReasonCategory] = useState<string>('کسورات غیرمجاز تعرفه‌ای');
  const [appealInsuranceRegulation, setAppealInsuranceRegulation] = useState<string>('بند ۱۲ آیین‌نامه تعرفه درمان شورای عالی بیمه');
  const [appealAttachedImages, setAppealAttachedImages] = useState<
    Array<{ id: string; name: string; type: string; url?: string }>
  >([
    {
      id: 'att-default-1',
      name: 'عکس گرافی RVG پاری‌اپیکال قبل/بعد درمان',
      type: 'xray',
      url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop&q=60',
    },
  ]);

  // Full Appeal Detail Modal State
  const [isAppealDetailModalOpen, setIsAppealDetailModalOpen] = useState(false);
  const [selectedClaimForDetailModal, setSelectedClaimForDetailModal] = useState<Claim | null>(null);

  // Active Cash Flow Metric Detail Modal State
  const [activeMetricModal, setActiveMetricModal] = useState<
    'received' | 'insurance' | 'due_today' | 'overdue' | 'invoices' | 'blocked' | null
  >(null);
  const [metricActionMsg, setMetricActionMsg] = useState<string | null>(null);

  // Digital Receipt Modal State
  const [receiptData, setReceiptData] = useState<{
    patientName: string;
    amount: number;
    installmentNo: number;
    date: string;
    refCode: string;
  } | null>(null);

  // Kanban Claims State (local copy for drag/move/status updates)
  const [localClaims, setLocalClaims] = useState<Claim[]>(claims && claims.length > 0 ? claims : mockClaims);

  React.useEffect(() => {
    if (claims && claims.length > 0) {
      setLocalClaims(claims);
    }
  }, [claims]);

  React.useEffect(() => {
    if (installments && installments.length > 0) {
      setLocalInstallments(installments);
    }
  }, [installments]);

  // Deficiency Fix State for Accountant
  const [fixDocImage, setFixDocImage] = useState<string | null>(null);
  const [fixDocNote, setFixDocNote] = useState<string>('');
  const [fixDocSuccessMsg, setFixDocSuccessMsg] = useState<string | null>(null);

  // Manual Financial Edit State in Draft Mode
  const [isEditingDraftFinancials, setIsEditingDraftFinancials] = useState<boolean>(false);
  const [editClaimedAmount, setEditClaimedAmount] = useState<number>(0);
  const [editBaseApprovedAmount, setEditBaseApprovedAmount] = useState<number>(0);
  const [editSupplApprovedAmount, setEditSupplApprovedAmount] = useState<number>(0);

  // Multi-Payer Waterfall Playground State
  const [waterfallCost, setWaterfallCost] = useState<number>(5200000);
  const [baseCoveragePercent, setBaseCoveragePercent] = useState<number>(20);
  const [supplCoveragePercent, setSupplCoveragePercent] = useState<number>(60);

  // Waterfall Calculation
  const calculatedBaseShare = Math.round((waterfallCost * baseCoveragePercent) / 100);
  const remainingAfterBase = waterfallCost - calculatedBaseShare;
  const calculatedSupplShare = Math.round((remainingAfterBase * supplCoveragePercent) / 100);
  const calculatedPatientShare = waterfallCost - calculatedBaseShare - calculatedSupplShare;

  // Create New Installment Plan Handler
  const handleCreateNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanPatientName.trim() || !newPlanPhone.trim()) {
      alert('لطفاً نام بیمار و شماره تماس را وارد فرمایید.');
      return;
    }
    // If BNPL, the BNPL service pays 100% upfront to clinic, remaining clinic balance is 0.
    const remaining = newPlanIsBNPL ? 0 : Math.max(0, newPlanTotalAmount - newPlanPrePayment);
    const monthly = Math.round(newPlanTotalAmount / (newPlanCount || 1));

    const schedule = Array.from({ length: newPlanCount }, (_, index) => {
      return {
        installmentNo: index + 1,
        dueDate: `1405/0${Math.min(9, 6 + index)}/15`,
        amount: monthly,
        status: newPlanIsBNPL ? ('paid' as const) : ('scheduled' as const),
        paidAt: newPlanIsBNPL ? new Date().toLocaleDateString('fa-IR') : undefined,
        autoSettledBNPL: newPlanIsBNPL,
      };
    });

    const newPlanObj: InstallmentPlan = {
      id: `INST-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: `PAT-${Math.floor(100 + Math.random() * 900)}`,
      patientName: newPlanPatientName,
      phone: newPlanPhone,
      totalAmount: newPlanTotalAmount,
      prePaymentAmount: newPlanIsBNPL ? newPlanTotalAmount : newPlanPrePayment,
      remainingAmount: remaining,
      installmentsCount: newPlanCount,
      monthlyAmount: monthly,
      isBNPL: newPlanIsBNPL,
      schedule,
    };

    setLocalInstallments([newPlanObj, ...localInstallments]);
    setIsNewPlanModalOpen(false);
    setNewPlanPatientName('');
    setNewPlanPhone('');
    setNewPlanTreatmentTitle('');
    setNewPlanIsBNPL(false);
    alert(
      newPlanIsBNPL
        ? `طرح تقسیط اعتباری BNPL با تسویه ۱۰۰٪ یکجا توسط پلتفرم با کلینیک برای ${newPlanPatientName} ثبت گردید.`
        : `پلان اقساط عادی جدید با موفقیت برای ${newPlanPatientName} ثبت گردید.`
    );
  };

  // Handle Automatic BNPL Settlement
  const handleAutoSettleBNPL = (planId: string, installmentNo: number, patientName: string, amount: number) => {
    onPayInstallment(planId, installmentNo);
    setLocalInstallments((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id === planId) {
          const updatedSchedule = plan.schedule.map((item) =>
            item.installmentNo === installmentNo
              ? {
                  ...item,
                  status: 'paid' as const,
                  paidAt: new Date().toLocaleDateString('fa-IR'),
                  autoSettledBNPL: true,
                }
              : item
          );
          const newRemaining = Math.max(0, plan.remainingAmount - amount);
          return { ...plan, remainingAmount: newRemaining, schedule: updatedSchedule };
        }
        return plan;
      })
    );
    setBnplAutoSettleNotice(
      `واریزی قسط شماره ${installmentNo} بیمار ${patientName} به مبلغ ${amount.toLocaleString()} تومان به‌صورت خودکار و مستقیم از درگاه اعتباری BNPL ثبت و تیک خورد (بدون نیاز به تأیید دستی حسابدار).`
    );
  };

  // Handle Receipt Generation & Local State Update
  const handleCollectInstallment = (planId: string, installmentNo: number, patientName: string, amount: number) => {
    onPayInstallment(planId, installmentNo);
    setLocalInstallments((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id === planId) {
          const updatedSchedule = plan.schedule.map((item) =>
            item.installmentNo === installmentNo
              ? { ...item, status: 'paid' as const, paidAt: new Date().toLocaleDateString('fa-IR') }
              : item
          );
          const newRemaining = Math.max(0, plan.remainingAmount - amount);
          return { ...plan, remainingAmount: newRemaining, schedule: updatedSchedule };
        }
        return plan;
      })
    );
    const refCode = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
    setReceiptData({
      patientName,
      amount,
      installmentNo,
      date: new Date().toLocaleDateString('fa-IR'),
      refCode,
    });
  };

  // Handle POS Reconciliation Check
  const handleRunReconciliation = () => {
    if (posPhysicalTerminalInput === posSystemTotal) {
      setReconciliationStatus('matched');
    } else {
      setReconciliationStatus('mismatch');
    }
  };

  // Immutable Refund & Correction Logs State
  const [refundAuditLogs, setRefundAuditLogs] = useState<
    Array<{
      id: string;
      hash: string;
      invoiceId: string;
      patientName: string;
      refundAmount: number;
      reason: string;
      timestamp: string;
      operator: string;
    }>
  >([
    {
      id: 'RFD-1403-901',
      hash: '0x7f8a92b1c4e03f5',
      invoiceId: 'INV-102',
      patientName: 'مریم ابراهیمی',
      refundAmount: 350000,
      reason: 'استرداد به علت لغو جلسه دوم درمان ریشه دندان',
      timestamp: '۱۴۰۳/۰۵/۱۸ - ۱۱:۳۰:۴۵',
      operator: 'حسابدار ارشد (غیرقابل تغییر)',
    },
    {
      id: 'RFD-1403-884',
      hash: '0xe23c91d80a112f4',
      invoiceId: 'INV-098',
      patientName: 'کامران حسینی',
      refundAmount: 500000,
      reason: 'اصلاحیه سهم بیمه تکمیلی پس از صدور حواله',
      timestamp: '۱۴۰۳/۰۵/۱۵ - ۰۹:۱۵:۱۲',
      operator: 'حسابدار ارشد (غیرقابل تغییر)',
    },
  ]);

  // Handle Refund Process
  const handleConfirmRefund = () => {
    if (!refundReason.trim()) {
      alert('لطفاً علت استرداد وجه را وارد فرمایید.');
      return;
    }

    const newRefundEntry = {
      id: `RFD-1403-${Math.floor(100 + Math.random() * 900)}`,
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 8)}`,
      invoiceId: selectedInvoiceForRefund?.id || 'INV-000',
      patientName: selectedInvoiceForRefund?.patientName || 'بیمار',
      refundAmount: refundAmount,
      reason: refundReason,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR'),
      operator: 'حسابدار ارشد (غیرقابل تغییر)',
    };

    setRefundAuditLogs((prev) => [newRefundEntry, ...prev]);

    setRefundSuccessMsg(`مبلغ ${refundAmount.toLocaleString()} تومان با موفقیت برای فاکتور ${selectedInvoiceForRefund?.id} استرداد شد و سابقه غیرقابل تغییر در لاگ حسابداری ثبت گردید.`);
    setTimeout(() => {
      setIsRefundModalOpen(false);
      setSelectedInvoiceForRefund(null);
      setRefundReason('');
      setRefundSuccessMsg('');
    }, 2000);
  };

  // Handle Appeal Submit
  const handleSendAppeal = (claimId: string) => {
    if (!appealText.trim()) return;
    if (onSubmitAppeal) {
      onSubmitAppeal(claimId, appealText);
    }
    setAppealSubmitted(true);
    setTimeout(() => {
      setAppealSubmitted(false);
      setSelectedClaimForAppeal(null);
      setAppealText('');
    }, 1500);
  };

  // Move Kanban Column
  const handleMoveClaimStatus = (claimId: string, newStatus: Claim['status']) => {
    setLocalClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
    );
  };

  // Sidebar Menu Items
  // Dynamic Sidebar Menu Items based on Insurance Module & Contract status
  const menuItems: {
    id: string;
    label: string;
    icon: any;
    badge: string;
    isInsuranceFeature?: boolean;
  }[] = [
    {
      id: 'cash_flow',
      label: 'تابلوی پول امروز و نقدینگی',
      icon: TrendingUp,
      badge: `${moneyBoard.receivedTodayCashPos.toLocaleString()} ت`,
    },
    {
      id: 'installments',
      label: 'مدیریت اقساط و بدهی',
      icon: CreditCard,
      badge: `${installments.length} پرونده`,
    },
    {
      id: 'invoices',
      label: 'فاکتورها و سهم بیمار',
      icon: FileText,
      badge: `${invoices.length}`,
    },
    {
      id: 'daily_reports',
      label: 'بستن صندوق و گزارش‌ها',
      icon: FileSpreadsheet,
      badge: 'انطباق پوز',
    },
  ];

  if (insuranceModuleActive) {
    menuItems.push({
      id: 'insurance_tier2',
      label: isInsuranceContracted ? 'امور مالی و کسورات بیمه آنلاین' : 'امور مالی و فاکتور رسمی بیمه',
      icon: ShieldCheck,
      badge: isInsuranceContracted ? 'طرف قرارداد' : 'پرداخت ۱۰۰٪ بیمار',
      isInsuranceFeature: true,
    });
  } else if (isInsuranceContracted) {
    menuItems.push({
      id: 'insurance_tier2',
      label: 'گزارش مالی بیمه (ثبت دستی)',
      icon: ShieldCheck,
      badge: 'طرف قرارداد (ثبت دستی)',
      isInsuranceFeature: true,
    });
  }

  return (
    <div className={hideSidebar ? "w-full text-right dir-rtl" : "grid grid-cols-1 lg:grid-cols-4 gap-6 text-right dir-rtl"}>
      {/* RIGHT SIDEBAR NAVIGATION */}
      {!hideSidebar && (
        <div className="lg:col-span-1 space-y-4 order-first">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sticky top-[80px]">
            {/* Header Badge */}
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#005581] dark:text-[#72cdf4] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#005581]" />
                  <span>میز کار حسابداری کلینیک</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">مدیریت مالی، صندوق و بیمه دنتورا</p>
              </div>
            </div>

            {/* Owner Insurance Control Card in Accountant Sidebar Menu */}
            <div className="p-3 rounded-2xl bg-[#005581] text-white border border-[#003350] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-xs text-[#fffffa]">
                  <ShieldCheck className="w-4 h-4 text-[#ffd200]" />
                  <span>ماژول بیمه دنتورا</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581]">
                  ویژه Owner
                </span>
              </div>

              <div className="text-[11px] text-[#72cdf4] font-medium leading-tight">
                {insuranceModuleActive
                  ? isInsuranceContracted
                    ? 'فعال - طرف قرارداد مستقیم (پرداخت فرانشیز بیمار)'
                    : 'فعال - غیر طرف قرارداد (پرداخت ۱۰۰٪ بیمار + فاکتور رسمی بیمه)'
                  : isInsuranceContracted
                  ? 'غیرفعال - طرف قرارداد سنتی (ثبت بیمه دستی)'
                  : 'غیرفعال - درمان ۱۰۰٪ آزاد (بدون بیمه)'}
              </div>

              {/* Owner Control Action Buttons */}
              <div className="pt-2 border-t border-[#004266] flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={onToggleInsuranceModule}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                    insuranceModuleActive
                      ? 'bg-[#ffe552] text-[#005581] hover:bg-[#ffd200]'
                      : 'bg-[#003350] text-[#72cdf4] hover:bg-[#002840] border border-[#72cdf4]/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#005581]" />
                  <span>
                    {insuranceModuleActive ? 'ماژول بیمه: غیرفعال‌سازی (ویژه Owner)' : 'ماژول بیمه: فعال‌سازی (ویژه Owner)'}
                  </span>
                </button>

                {onToggleInsuranceContracted && (
                  <button
                    type="button"
                    onClick={onToggleInsuranceContracted}
                    className="w-full py-1 px-2.5 rounded-lg text-[11px] font-bold bg-[#004266] text-[#72cdf4] hover:bg-[#003858] transition cursor-pointer text-center border border-[#72cdf4]/20"
                  >
                    وضعیت قرارداد: {isInsuranceContracted ? 'طرف قرارداد' : 'غیر طرف قرارداد'} (تغییر)
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-1 pt-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AccountantNavTab)}
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
                          : item.isInsuranceFeature && !insuranceModuleActive
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Excel Export Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => alert('گزارش استاندارد حسابداری و مالیاتی در قالب فایل اکسل صادر گردید.')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#ffd200]" />
                <span>خروجی اکسل دفتر مالیات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className={hideSidebar ? "w-full space-y-6" : "lg:col-span-3 space-y-6"}>
        {/* ================= TAB 1: CASH FLOW & TODAY'S MONEY BOARD ================= */}
        {activeTab === 'cash_flow' && (
          <div className="space-y-5">
            {/* Dentora Insurance Mode, Contracted Status & Network Connection Banner */}
            <div className="p-4 rounded-2xl bg-[#005581] text-[#fffffa] space-y-3 shadow-md border border-[#004266]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#ffd200]" />
                  <div>
                    <h3 className="text-xs font-black text-[#fffffa] flex flex-wrap items-center gap-2">
                      <span>وضعیت یکپارچگی بیمه و شبکه کلینیک</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                        insuranceModuleActive ? 'bg-[#ffd200] text-[#005581]' : 'bg-[#003350] text-[#72cdf4] border border-[#72cdf4]/30'
                      }`}>
                        {insuranceModuleActive ? 'ماژول بیمه دنتورا: فعال (دستور Owner)' : 'ماژول بیمه دنتورا: غیرفعال (دستور Owner)'}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                        isInsuranceContracted ? 'bg-[#72cdf4] text-[#005581]' : 'bg-[#ffe552] text-[#005581]'
                      }`}>
                        {isInsuranceContracted ? 'طرف قرارداد مستقیم' : 'غیر طرف قرارداد (آزاد + فاکتور رسمی بیمه)'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#003350] text-[#72cdf4] font-bold border border-[#72cdf4]/20">
                        {connectionStatus === 'online' ? 'اتصال: آنلاین' : connectionStatus === 'syncing' ? 'همگام‌سازی...' : 'اتصال: آفلاین'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#72cdf4]/90 mt-1">
                      {!insuranceModuleActive && !isInsuranceContracted && 'ماژول بیمه غیرفعال و کلینیک غیر طرف قرارداد است؛ کلیه پذیرش‌ها ۱۰۰٪ آزاد ثبت می‌شوند و هیچ آیتم بیمه‌ای نداریم.'}
                      {!insuranceModuleActive && isInsuranceContracted && 'ماژول آنلاین دنتورا غیرفعال است اما کلینیک طرف قرارداد سنتی است؛ گزارشات مالی با احتساب ثبت بیمه دستی محاسبه می‌گردند.'}
                      {insuranceModuleActive && isInsuranceContracted && 'کلینیک طرف قرارداد مستقیم دنتورا است؛ فرانشیز از بیمار اخذ شده و سهم بیمه تکمیلی به صورت آنلاین با بیمه‌گر تسویه می‌گردد.'}
                      {insuranceModuleActive && !isInsuranceContracted && 'کلینیک غیر طرف قرارداد است؛ بیمار ۱۰۰٪ هزینه درمان را در کلینیک پرداخت کرده و فاکتور رسمی بیمه تکمیلی دنتورا جهت واریز مستقیم به حساب بیمار به وی تحویل داده می‌شود.'}
                    </p>
                  </div>
                </div>

                {/* Control Toggles for Prototype Convenience */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onToggleInsuranceModule}
                    className="px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] shadow-xs"
                    title="تغییر وضعیت فعال/غیرفعال بودن ماژول بیمه (ویژه Owner)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#005581]" />
                    <span>ماژول بیمه: {insuranceModuleActive ? 'غیرفعال‌سازی (ویژه Owner)' : 'فعال‌سازی (ویژه Owner)'}</span>
                  </button>

                  {onToggleInsuranceContracted && (
                    <button
                      type="button"
                      onClick={onToggleInsuranceContracted}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-[#004266] hover:bg-[#003858] text-[#72cdf4] border border-[#72cdf4]/30 shadow-xs"
                      title="تغییر وضعیت طرف قرارداد بودن کلینیک"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#72cdf4]" />
                      <span>قرارداد: {isInsuranceContracted ? 'تغییر به غیر طرف قرارداد' : 'تغییر به طرف قرارداد'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Top Stat Cards (Today's Money Board - تابلوی پول امروز) */}
            <div className="bg-[#fffffa] dark:bg-slate-900 rounded-2xl border border-[#005581]/20 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#005581]/10 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#005581] dark:text-[#72cdf4] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#005581]" />
                    <span>تابلوی پول امروز و نقدینگی ورودی کلینیک (Today's Money Board)</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    پایش ۶ شاخص اصلی جریان نقدی: دریافت‌شدهٔ امروز، وابسته به بیمه، اقساطی، سررسیدگذشته، پرونده‌های مانع نقدینگی و فاکتورشده
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#005581] text-[#ffd200] font-mono text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd200]" />
                    <span>صندوق مطب: آنلاین و منطبق با POS</span>
                  </span>
                </div>
              </div>

              {/* Grid Metrics using Baltc Blue, Baby Blue, Gold, Mustard Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 dir-rtl">
                {/* 1. Received Today */}
                <div
                  onClick={() => setActiveMetricModal('received')}
                  className="p-4 rounded-2xl bg-[#005581] text-white hover:bg-[#004266] border border-[#003350] space-y-2 shadow-sm hover:shadow-md hover:scale-[1.015] transition-all transform cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#72cdf4]">
                    <span>دریافت آنلاین امروز (نقد / پوز)</span>
                    <CheckCircle2 className="w-4 h-4 text-[#ffd200] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#ffd200] font-mono">
                    {moneyBoard.receivedTodayCashPos.toLocaleString()} <span className="text-xs font-normal text-[#fffffa]">تومان</span>
                  </div>
                  <p className="text-[11px] text-[#fffffa]/80">تراکنش‌های تأییدشده دستگاه کارتخوان مطب</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#72cdf4]/20 text-[10px] font-extrabold text-[#72cdf4] group-hover:text-[#ffd200]">
                    <span>مشاهده جزئیات ریز تراکنش‌ها</span>
                    <Search className="w-3.5 h-3.5 text-[#ffd200]" />
                  </div>
                </div>

                {/* 2. Insurance Pending Total */}
                <div
                  onClick={() => setActiveMetricModal('insurance')}
                  className="p-4 rounded-2xl bg-[#fffffa] hover:bg-slate-50 border-2 border-[#005581] space-y-2 shadow-xs hover:shadow-md hover:scale-[1.015] transition-all transform cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#005581]">
                    <span>
                      {isInsuranceContracted
                        ? insuranceModuleActive
                          ? 'مطالبات در صف بیمه‌گر (تسویه آنلاین)'
                          : 'مطالبات بیمه‌ای (ثبت دستی سنتی)'
                        : insuranceModuleActive
                        ? 'خدمات بیمه‌ای (غیر طرف قرارداد + فاکتور)'
                        : 'خدمات بیمه‌ای (غیر طرف قرارداد - ۱۰۰٪ آزاد)'}
                    </span>
                    <Clock className="w-4 h-4 text-[#005581] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#005581] font-mono">
                    {!isInsuranceContracted && !insuranceModuleActive
                      ? '۰ تومان (خدمات آزاد)'
                      : !isInsuranceContracted
                      ? '۰ تومان (غیر طرف قرارداد)'
                      : `${moneyBoard.insurancePendingTotal.toLocaleString()} تومان`}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isInsuranceContracted
                      ? insuranceModuleActive
                        ? 'اسناد بیمه‌ای ارسال‌شده و در انتظار تسویه مستقیم دنتورا'
                        : 'اسناد بیمه‌ای ثبت‌شده به صورت دستی و در انتظار تسویه سنتی با بیمه‌گر'
                      : insuranceModuleActive
                      ? 'کلینیک غیر طرف قرارداد است؛ دریافت ۱۰۰٪ از بیمار + صدور فاکتور رسمی بیمه'
                      : 'کلینیک غیر طرف قرارداد است؛ کلیه دریافت‌ها ۱۰۰٪ آزاد محاسبه می‌گردند'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#005581]/15 text-[10px] font-extrabold text-[#005581]">
                    <span>مشاهده جزئیات اسناد بیمه‌ای</span>
                    <Search className="w-3.5 h-3.5 text-[#005581]" />
                  </div>
                </div>

                {/* 3. Installments Due Today */}
                <div
                  onClick={() => setActiveMetricModal('due_today')}
                  className="p-4 rounded-2xl bg-[#ffe552]/30 hover:bg-[#ffe552]/50 border-2 border-[#ffd200] space-y-2 shadow-xs hover:shadow-md hover:scale-[1.015] transition-all transform cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#005581]">
                    <span>اقساط سررسید امروز</span>
                    <Calendar className="w-4 h-4 text-[#005581] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#005581] font-mono">
                    {moneyBoard.installmentsDueToday.toLocaleString()} <span className="text-xs font-normal text-slate-700">تومان</span>
                  </div>
                  <p className="text-[11px] text-slate-700">پیامک یادآوری خودکار برای مراجعین ارسال گردید</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#ffd200]/80 text-[10px] font-extrabold text-[#005581]">
                    <span>مشاهده لیست اقساط امروز</span>
                    <Search className="w-3.5 h-3.5 text-[#005581]" />
                  </div>
                </div>

                {/* 4. Overdue Installments */}
                <div
                  onClick={() => setActiveMetricModal('overdue')}
                  className="p-4 rounded-2xl bg-[#003350] text-[#fffffa] hover:bg-[#002840] border border-[#004266] space-y-2 shadow-xs hover:shadow-md hover:scale-[1.015] transition-all transform cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#ffe552]">
                    <span>اقساط معوقه سررسیدگذشته</span>
                    <AlertOctagon className="w-4 h-4 text-[#ffe552] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#ffd200] font-mono">
                    {moneyBoard.installmentsOverdueTotal.toLocaleString()} <span className="text-xs font-normal text-slate-300">تومان</span>
                  </div>
                  <p className="text-[11px] text-[#72cdf4]">نیازمند پیگیری تلفنی و وصول وجه توسط حسابدار</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#004266] text-[10px] font-extrabold text-[#ffe552]">
                    <span>مشاهده پرونده‌های معوقه</span>
                    <Search className="w-3.5 h-3.5 text-[#ffe552]" />
                  </div>
                </div>

                {/* 5. Total Invoiced Today */}
                <div
                  onClick={() => setActiveMetricModal('invoices')}
                  className="p-4 rounded-2xl bg-[#72cdf4]/20 hover:bg-[#72cdf4]/30 border-2 border-[#72cdf4] space-y-2 shadow-xs hover:shadow-md hover:scale-[1.015] transition-all transform cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#005581]">
                    <span>کل فاکتورهای صادره امروز</span>
                    <TrendingUp className="w-4 h-4 text-[#005581] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#005581] font-mono">
                    {moneyBoard.totalInvoicedToday.toLocaleString()} <span className="text-xs font-normal text-slate-700">تومان</span>
                  </div>
                  <p className="text-[11px] text-slate-700">مجموع ارزش خدمات درمانی ثبت‌شده</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#72cdf4]/60 text-[10px] font-extrabold text-[#005581]">
                    <span>مشاهده لیست ۶ فاکتور امروز</span>
                    <Search className="w-3.5 h-3.5 text-[#005581]" />
                  </div>
                </div>

                {/* 6. Bottleneck Claims Count */}
                <div
                  onClick={() => setActiveMetricModal('blocked')}
                  className="p-4 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white border border-[#003350] space-y-2 shadow-xs hover:shadow-md hover:scale-[1.015] transition-all transform cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#ffe552]">
                    <span>پرونده‌های مانع جریان نقدی</span>
                    <AlertOctagon className="w-4 h-4 text-[#ffe552] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#ffd200] font-mono">
                    {moneyBoard.blockedClaimsCount} <span className="text-xs font-normal text-slate-200">پرونده</span>
                  </div>
                  <p className="text-[11px] text-[#72cdf4]">علت: نقص مالی یا نیازمند استعلام و اصلاحیه</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#004266] text-[10px] font-extrabold text-[#ffe552] group-hover:text-[#ffd200]">
                    <span>بررسی ۲ پرونده مانع مالی</span>
                    <Search className="w-3.5 h-3.5 text-[#ffd200]" />
                  </div>
                </div>
              </div>

              {/* Operational & Financial Analytics KPI Grid */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#005581]" />
                  <span>آمارهای کلیدی عملکردی کلینیک (KPI Dashboard)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500">بیماران جدید / بازگشتی</div>
                    <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
                      <span className="text-emerald-600">۸ جدید</span> <span className="text-slate-400">|</span> <span className="text-[#005581]">۱۴ بازگشتی</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500">مطالبات بیمار / بیمه</div>
                    <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
                      <span className="text-amber-600 font-mono">۱۴.۵ م</span> <span className="text-slate-400">|</span> <span className="text-cyan-600 font-mono">۲۸.۲ م</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500">طرح‌ها و مراجعات ناتمام</div>
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      ۵ پرونده در انتظار جلسه بعدی
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500">بهره‌وری کارکنان و دندان‌پزشکان</div>
                    <div className="text-sm font-black text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                      <span>۸۸٪</span>
                      <span className="text-[10px] text-slate-500 font-normal">(عالی)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices Table Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                ریز صورت‌حساب‌های صادره امروز
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-2.5 px-3">کد فاکتور</th>
                      <th className="py-2.5 px-3">نام بیمار</th>
                      <th className="py-2.5 px-3">پزشک معالج</th>
                      <th className="py-2.5 px-3">مبلغ کل</th>
                      {!isInsuranceContracted && !insuranceModuleActive ? (
                        <th className="py-2.5 px-3 text-emerald-700">پرداختی بیمار (۱۰۰٪ آزاد)</th>
                      ) : !isInsuranceContracted ? (
                        <>
                          <th className="py-2.5 px-3 text-slate-400">سهم بیمه (۰ - غیر طرف قرارداد)</th>
                          <th className="py-2.5 px-3 text-emerald-700">پرداختی مستقیم بیمار (۱۰۰٪)</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2.5 px-3 text-[#005581]">
                            سهم بیمه پایه {!insuranceModuleActive && <span className="text-[10px] text-amber-700 font-normal">(ثبت دستی)</span>}
                          </th>
                          <th className="py-2.5 px-3 text-[#005581]">
                            سهم بیمه تکمیلی {!insuranceModuleActive && <span className="text-[10px] text-amber-700 font-normal">(ثبت دستی)</span>}
                          </th>
                          <th className="py-2.5 px-3 text-emerald-700">پرداختی بیمار</th>
                        </>
                      )}
                      <th className="py-2.5 px-3">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono font-bold text-[#005581]">{inv.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{inv.patientName}</td>
                        <td className="py-3 px-3 text-slate-600">{inv.dentistName}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{inv.totalAmount.toLocaleString()} تومان</td>
                        {!isInsuranceContracted && !insuranceModuleActive ? (
                          <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{inv.totalAmount.toLocaleString()} تومان</td>
                        ) : !isInsuranceContracted ? (
                          <>
                            <td className="py-3 px-3 font-mono text-slate-400">۰ تومان</td>
                            <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{inv.totalAmount.toLocaleString()} تومان</td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-3 font-mono text-slate-700 font-semibold">{inv.baseInsuranceCovered.toLocaleString()} تومان</td>
                            <td className="py-3 px-3 font-mono text-cyan-700 font-semibold">{inv.supplInsuranceCovered.toLocaleString()} تومان</td>
                            <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{inv.patientSharePaid.toLocaleString()} تومان</td>
                          </>
                        )}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status === 'paid' ? 'تسویه کامل' : 'اقساط / در انتظار'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INSTALLMENTS & PATIENT DEBT ================= */}
        {activeTab === 'installments' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>مدیریت اقساط، وصول بدهی و صدور رسید دیجیتال</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  پایش سررسید اقساط فعال، تعریف پلان اقساطی جدید برای بیمار و ثبت واریزی‌ها
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewPlanModalOpen(true)}
                  className="px-3.5 py-2 bg-[#005581] hover:bg-[#004266] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#ffd200]" />
                  <span>ثبت پلان اقساطی جدید</span>
                </button>

                {receiptData && (
                  <button
                    onClick={() => setReceiptData(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    بستن رسید چاپ‌شده
                  </button>
                )}
              </div>
            </div>

            {/* Offline Gateway-less Baseline & BNPL Clinic Status Banner */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#005581] text-white font-bold text-[10px]">
                    الزام سیستم: حالت بدون درگاه (خط پایه)
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    تسویه حضوری، نقدی، کارتخوان مطب و چک اقساطی
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  زمان‌بندی سررسید اقساط، دریافت پیش‌پرداخت و تاریخچه مالی به ازای هر درمان در سیستم ثبت و پیگیری می‌شود.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#004266] text-white border border-[#72cdf4]/30 flex items-center gap-2 shadow-2xs">
                  <CreditCard className="w-4 h-4 text-[#ffd200]" />
                  <span>سرویس اعتباری BNPL کلینیک: <strong className={isBNPLEnabledForClinic ? "text-emerald-400 font-extrabold" : "text-amber-400 font-extrabold"}>{isBNPLEnabledForClinic ? "فعال (تعیین مدیریت کلینیک)" : "غیرفعال (توسط مدیریت)"}</strong></span>
                </div>
              </div>
            </div>

            {/* Auto-settled BNPL Notification Banner */}
            {bnplAutoSettleNotice && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-600 space-y-2 shadow-sm animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>تیک خودکار واریزی اعتباری BNPL (بدون تایید دستی حسابدار)</span>
                  </div>
                  <button
                    onClick={() => setBnplAutoSettleNotice(null)}
                    className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-bold text-[10px] bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg cursor-pointer"
                  >
                    بستن پیام
                  </button>
                </div>
                <p className="text-emerald-800 dark:text-emerald-300 font-bold leading-relaxed">
                  {bnplAutoSettleNotice}
                </p>
              </div>
            )}

            {receiptData && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>رسید دیجیتال واریزی قسط صادر گردید (دریافت دستی مطب)</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    کد پیگیری: {receiptData.refCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700 font-bold bg-white p-3 rounded-xl border border-emerald-100">
                  <div>نام بیمار: <span className="text-slate-900">{receiptData.patientName}</span></div>
                  <div>شماره قسط: <span className="text-[#005581]">{receiptData.installmentNo}</span></div>
                  <div>مبلغ واریزی: <span className="text-emerald-700 font-mono">{receiptData.amount.toLocaleString()} تومان</span></div>
                  <div>تاریخ ثبت: <span className="text-slate-500">{receiptData.date}</span></div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => alert(`رسید قسط برای ${receiptData.patientName} چاپ شد.`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005581] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#ffd200]" />
                    <span>چاپ رسید</span>
                  </button>
                </div>
              </div>
            )}

            {/* Installment Plans List */}
            <div className="space-y-4">
              {localInstallments.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    plan.isBNPL
                      ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          بیمار: {plan.patientName} ({plan.phone})
                        </span>
                        {plan.isBNPL ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white border border-emerald-500 flex items-center gap-1 shadow-2xs">
                            <Zap className="w-3 h-3 text-[#ffd200]" />
                            <span>تسویه‌شده ۱۰۰٪ با کلینیک توسط سرویس‌دهنده BNPL</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            اقساط عادی کلینیک (تسویه دستی در مطب)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                        مبلغ کل درمان: <strong>{plan.totalAmount.toLocaleString()} تومان</strong>
                        {plan.isBNPL ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold mr-2">
                            | ۱۰۰٪ توسط سرویس BNPL به کلینیک واریز شد
                          </span>
                        ) : (
                          <span className="mr-2">
                            | پیش‌پرداخت: <strong>{plan.prePaymentAmount.toLocaleString()} تومان</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      {plan.isBNPL ? (
                        <span className="text-emerald-800 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/60 px-2.5 py-1 rounded-lg text-xs">
                          مانده طلب کلینیک: ۰ تومان (تسویه کامل)
                        </span>
                      ) : (
                        <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/50 border border-amber-300/40 px-2.5 py-1 rounded-lg">
                          باقی‌مانده اقساط: {plan.remainingAmount.toLocaleString()} تومان ({plan.installmentsCount} قسط)
                        </span>
                      )}
                    </div>
                  </div>

                  {plan.isBNPL ? (
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>تسهیلات خرید اقساطی BNPL (اسنپ‌پی / تپسی‌پی / لندو / کیپا)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        کل مبلغ درمان به صورت یکجا توسط سرویس‌دهنده BNPL به حساب کلینیک واریز و تسویه شده است. بیمار اقساط خود ({plan.installmentsCount} قسط ماهانه هر کدام {plan.monthlyAmount.toLocaleString()} تومان) را مستقیماً به شرکت BNPL پرداخت می‌نماید؛ لذا نیازی به ورود اطلاعات، دریافت چک یا پیگیری اقساط در کلینیک وجود ندارد.
                      </p>
                    </div>
                  ) : (
                    /* Schedule Cards for Normal Clinic Installments */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {plan.schedule.map((item) => (
                        <div
                          key={item.installmentNo}
                          className={`p-3 rounded-xl border text-xs space-y-2 transition ${
                            item.status === 'paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xs'
                          }`}
                        >
                          <div className="flex justify-between font-bold">
                            <span>قسط شماره {item.installmentNo}</span>
                            <span className="font-mono text-slate-500">{item.dueDate}</span>
                          </div>
                          <div className="font-mono font-black text-sm text-slate-800 dark:text-slate-100">
                            {item.amount.toLocaleString()} تومان
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            {item.status === 'paid' ? (
                              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>تسویه‌شده در مطب (تایید دستی)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">
                                در انتظار سررسید
                              </span>
                            )}

                            {item.status !== 'paid' && (
                              <button
                                onClick={() =>
                                  handleCollectInstallment(
                                    plan.id,
                                    item.installmentNo,
                                    plan.patientName,
                                    item.amount
                                  )
                                }
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                              >
                                ثبت دریافت دستی
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: INVOICES & PATIENT SHARE & REFUNDS ================= */}
        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#005581]" />
                  <span>مدیریت فاکتورها، سهم بیمار و اصلاحیه / استرداد وجه</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  صدور فاکتور مراجعین آزاد، ثبت ابطال طرح درمان و مدیریت اصلاحیه مالی
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="جستجوی بیمار یا شماره فاکتور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#005581] w-48"
                />
              </div>
            </div>

            {/* Refund / Correction Banner if active */}
            {refundSuccessMsg && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{refundSuccessMsg}</span>
              </div>
            )}

            {/* Invoices List */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">شماره فاکتور</th>
                    <th className="py-2.5 px-3">نام بیمار</th>
                    <th className="py-2.5 px-3">پزشک</th>
                    <th className="py-2.5 px-3">خدمات ثبت‌شده</th>
                    <th className="py-2.5 px-3">مبلغ کل</th>
                    <th className="py-2.5 px-3">پرداختی بیمار</th>
                    <th className="py-2.5 px-3">روش پرداخت</th>
                    <th className="py-2.5 px-3">عملیات مالی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices
                    .filter(
                      (inv) =>
                        inv.patientName.includes(searchTerm) ||
                        inv.id.includes(searchTerm)
                    )
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-[#005581]">{inv.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{inv.patientName}</td>
                        <td className="py-3 px-3 text-slate-600">{inv.dentistName}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {inv.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]"
                              >
                                {item.procedureName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">{inv.totalAmount.toLocaleString()} تومان</td>
                        <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{inv.patientSharePaid.toLocaleString()} تومان</td>
                        <td className="py-3 px-3 text-slate-600">
                          {inv.paymentMethod === 'pos'
                            ? 'دستگاه پوز'
                            : inv.paymentMethod === 'cash'
                            ? 'نقدی'
                            : 'انتقال بانکی'}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setSelectedInvoiceForRefund(inv);
                              setRefundAmount(inv.patientSharePaid);
                              setIsRefundModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>استرداد / اصلاحیه</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Refund Modal */}
            {isRefundModalOpen && selectedInvoiceForRefund && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-5 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-rose-600" />
                      <span>ثبت تراکنش اصلاحی یا استرداد وجه</span>
                    </h3>
                    <button
                      onClick={() => setIsRefundModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs space-y-3">
                    <p className="text-slate-600">
                      فاکتور: <strong>{selectedInvoiceForRefund.id}</strong> متعلق به <strong>{selectedInvoiceForRefund.patientName}</strong>
                    </p>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">مبلغ قابل استرداد (تومان):</label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">علت دقیق اصلاحیه / ابطال طرح درمان:</label>
                      <textarea
                        rows={3}
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="مثال: انصراف بیمار از ادامه جراحی یا تغییر طرح درمان توسط پزشک"
                        className="w-full px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      onClick={() => setIsRefundModalOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleConfirmRefund}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      تأیید و صدور سند استرداد
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Immutable Audit Log Table for Refunds & Financial Corrections */}
            <div className="space-y-3 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-rose-600" />
                  <span>تاریخچه کامل و غیرقابل تغییر استردادها و اصلاحات مالی (Immutable Refund Ledger)</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>WORM Log - ثبتیات غیرقابل ویرایش و غیرقابل حذف</span>
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800">
                      <th className="py-2.5 px-3">کد پیگیری استرداد</th>
                      <th className="py-2.5 px-3">شماره فاکتور</th>
                      <th className="py-2.5 px-3">نام بیمار</th>
                      <th className="py-2.5 px-3">مبلغ استردادشده</th>
                      <th className="py-2.5 px-3">علت دقیق اصلاحیه</th>
                      <th className="py-2.5 px-3">تاریخ و زمان ثبت</th>
                      <th className="py-2.5 px-3">هش امنیتی غیرقابل تغییر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {refundAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-700 dark:text-rose-400">{log.id}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#005581]">{log.invoiceId}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{log.patientName}</td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-rose-600">
                          {log.refundAmount.toLocaleString()} تومان
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{log.reason}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 rounded select-all">
                          {log.hash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: REPORTS, POS RECONCILIATION & PROFIT/LOSS ================= */}
        {activeTab === 'daily_reports' && (
          <div className="space-y-5">
            {/* POS Daily Reconciliation Tool */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span>ابزار بستن صندوق روزانه و مغایرت‌گیری کارتخوان (POS Reconciliation)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    انطباق مجموع تراکنش‌های ثبت‌شده در نرم‌افزار با پرینت پایان‌روز دستگاه پوز
                  </p>
                </div>

                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl font-mono text-xs font-bold">
                  تراکنش‌های امروز: ۱۲ فقره
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    جمع درآمدهای ثبت‌شده در نرم‌افزار (تومان):
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={posSystemTotal}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-100 font-mono text-sm font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">بر اساس فاکتورهای صادرشده توسط منشی/حسابدار</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    مبلغ پرینت تجمیعی دستگاه پوز مطب (تومان):
                  </label>
                  <input
                    type="number"
                    value={posPhysicalTerminalInput}
                    onChange={(e) => setPosPhysicalTerminalInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-[#005581]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">مبلغ واقعی چاپ‌شده توسط دستگاه کارتخوان</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleRunReconciliation}
                  className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-4 h-4 text-[#ffd200]" />
                  <span>انطباق و بستن رسمی صندوق</span>
                </button>

                {reconciliationStatus === 'matched' && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>مبالغ بأسفار کاملاً منطبق است. صندوق روزانه بسته شد.</span>
                  </div>
                )}

                {reconciliationStatus === 'mismatch' && (
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>مغایرت مالی وجود دارد! اختلاف: {(posPhysicalTerminalInput - posSystemTotal).toLocaleString()} تومان</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Reports Filter & Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    گزارش‌های تفکیکی درآمد، سود/زیان، سهم پزشک/مرکز و بیمه
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isDentoraActive
                      ? 'تفکیک سه گانهٔ سهم بیمه پایه، بیمه تکمیلی و سهم بیمار بر اساس یکپارچگی آنلاین دنتورا'
                      : 'گزارش مالی با احتساب ثبت بیمه دستی (کلینیک طرف قرارداد)'}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <option value="today">امروز</option>
                    <option value="this_month">ماه جاری</option>
                    <option value="this_year">سال جاری</option>
                  </select>

                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <option value="all">همه شعبه‌ها</option>
                    <option value="main">شعبه مرکزی</option>
                    <option value="specialized">شعبه تخصصی</option>
                  </select>

                  <select
                    value={selectedDentist}
                    onChange={(e) => setSelectedDentist(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <option value="all">همه پزشکان</option>
                    <option value="doc1">دکتر کاویانی (عصب‌کشی)</option>
                    <option value="doc2">دکتر شریفی (ایمپلنت)</option>
                  </select>

                  <select
                    value={selectedServiceCategory}
                    onChange={(e) => setSelectedServiceCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <option value="all">همه خدمات</option>
                    <option value="implant">ایمپلنت</option>
                    <option value="endo">عصب‌کشی</option>
                    <option value="ortho">ارتودنسی</option>
                    <option value="cosmetic">ترمیم و زیبایی</option>
                  </select>

                  <button
                    onClick={() => alert('ریز گزارش کامل صندوق روزانه و تفکیک مالی در قالب فایل Excel خروجی گرفته شد.')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#ffd200]" />
                    <span>خروجی Excel صندوق</span>
                  </button>
                </div>
              </div>

              {/* Doctors Revenue & Insurance Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-2.5 px-3">نام دندان‌پزشک</th>
                      <th className="py-2.5 px-3">تخصص / خدمت</th>
                      <th className="py-2.5 px-3">درصد کارانه</th>
                      <th className="py-2.5 px-3">کل کارکرد (تومان)</th>
                      {!isInsuranceContracted && !insuranceModuleActive ? (
                        <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">پرداختی بیمار (۱۰۰٪ آزاد)</th>
                      ) : !isInsuranceContracted ? (
                        <>
                          <th className="py-2.5 px-3 text-slate-400">سهم بیمه (۰ - غیر طرف قرارداد)</th>
                          <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">پرداختی مستقیم بیمار (۱۰۰٪)</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2.5 px-3 text-[#005581] dark:text-[#72cdf4]">
                            سهم بیمه پایه {!insuranceModuleActive && <span className="text-[10px] text-amber-600 font-normal">(ثبت دستی)</span>}
                          </th>
                          <th className="py-2.5 px-3 text-[#005581] dark:text-[#72cdf4]">
                            سهم بیمه تکمیلی {!insuranceModuleActive && <span className="text-[10px] text-amber-600 font-normal">(ثبت دستی)</span>}
                          </th>
                          <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">سهم پرداختی بیمار</th>
                        </>
                      )}
                      <th className="py-2.5 px-3">سهم خالص پزشک</th>
                      <th className="py-2.5 px-3">سهم سود کلینیک</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">دکتر کاویانی</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">عصب‌کشی (انودونتیکس)</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#005581]">45٪</td>
                      <td className="py-3 px-3 font-mono font-bold">6,200,000 تومان</td>
                      {!isInsuranceContracted && !insuranceModuleActive ? (
                        <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">6,200,000 تومان</td>
                      ) : !isInsuranceContracted ? (
                        <>
                          <td className="py-3 px-3 font-mono text-slate-400">۰ تومان</td>
                          <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">6,200,000 تومان</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">1,240,000 تومان</td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">2,480,000 تومان</td>
                          <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">2,480,000 تومان</td>
                        </>
                      )}
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">2,790,000 تومان</td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">3,410,000 تومان</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">دکتر شریفی</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">جراحی ایمپلنت</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#005581]">50٪</td>
                      <td className="py-3 px-3 font-mono font-bold">22,500,000 تومان</td>
                      {!isInsuranceContracted && !insuranceModuleActive ? (
                        <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">22,500,000 تومان</td>
                      ) : !isInsuranceContracted ? (
                        <>
                          <td className="py-3 px-3 font-mono text-slate-400">۰ تومان</td>
                          <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">22,500,000 تومان</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">4,500,000 تومان</td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">9,000,000 تومان</td>
                          <td className="py-3 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">9,000,000 تومان</td>
                        </>
                      )}
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">11,250,000 تومان</td>
                      <td className="py-3 px-3 font-mono text-slate-500">11,250,000 تومان</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: INSURANCE FINANCIAL LAYER (TIER 2 & TIER 3) ================= */}
        {activeTab === 'insurance_tier2' && (
          <div className="space-y-5">
            {!insuranceModuleActive ? (
              <div className="bg-amber-50 border border-amber-300 p-6 rounded-2xl text-center space-y-3">
                <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="font-extrabold text-base text-amber-900">ماژول بیمه در این کلینیک غیرفعال است</h3>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  بخش‌های چندسهمی، بورد کانبان ادعاها و مدیریت کسورات بیمه‌ای صرفاً در صورت فعال بودن ماژول بیمه کلینیک نمایش داده می‌شوند.
                </p>
                <div className="pt-2">
                  <span className="px-3.5 py-2 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl inline-block">
                    تغییر وضعیت فعال‌سازی ماژول بیمه فقط در پنل مدیریت ارشد / مالک کلینیک (Owner) امکان‌پذیر است.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
                {/* Insurance Sub-navigation Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
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
                      <span>سطح اعتماد کلینیک: {greenLane.trustLevel}</span>
                    </span>
                  )}
                </div>

                {/* Sub-tab Switcher (Note: L4 Fast Settlement panel belongs to Owner workspace) */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                  <button
                    onClick={() => setActiveInsuranceSubTab('multi_payer')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeInsuranceSubTab === 'multi_payer'
                        ? 'bg-[#005581] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ۱. فاکتورهای چندسهمی
                  </button>

                  <button
                    onClick={() => setActiveInsuranceSubTab('kanban')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeInsuranceSubTab === 'kanban'
                        ? 'bg-[#005581] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ۲. کانبان پیگیری ادعاها
                  </button>

                  <button
                    onClick={() => setActiveInsuranceSubTab('deductions')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeInsuranceSubTab === 'deductions'
                        ? 'bg-[#005581] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ۳. مغایرت کسورات بیمه
                  </button>

                  <button
                    onClick={() => setActiveInsuranceSubTab('appeal_form')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeInsuranceSubTab === 'appeal_form'
                        ? 'bg-[#005581] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ۴. ثبت اعتراض رسمی (همراه با تصویر و آیین‌نامه)
                  </button>
                </div>

                {/* Sub-tab 1: Multi-payer Invoices */}
                {activeInsuranceSubTab === 'multi_payer' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-900">
                      محاسبه‌گر و تفکیک سه ضلعی فاکتور (بیمه پایه ← بیمه تکمیلی ← پرداختی بیمار)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border text-xs">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">هزینه کل درمان (تومان):</label>
                          <input
                            type="number"
                            value={waterfallCost}
                            onChange={(e) => setWaterfallCost(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
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
                          <label className="block font-bold text-slate-800 mb-1">
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

                {/* Sub-tab 2: Claims Kanban Board (Clicking card opens full details/checklist/fix modal) */}
                {activeInsuranceSubTab === 'kanban' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#005581]" />
                        <span>بورد بصری کانبان مدیریت چرخه ادعاهای بیمه‌ای کلینیک</span>
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        جهت مشاهده <strong>چک‌لیست مطابقت مالی، آپلود مدارک کسری یا ثبت اعتراض</strong> روی کارت‌ها کلیک فرمایید.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {[
                        { key: 'draft', title: '۱. ثبت‌شده (منشی)', color: 'border-slate-300 bg-slate-50/90', badgeBg: 'bg-[#005581] text-white', labelBtn: 'بررسی مطابقت مالی' },
                        { key: 'submitted', title: '۲. ارسال‌شده به بیمه', color: 'border-blue-300 bg-blue-50/90', badgeBg: 'bg-blue-700 text-white', labelBtn: 'مشاهده جزئیات' },
                        { key: 'rejected', title: '۳. برگشت‌خورده / کسورات', color: 'border-rose-300 bg-rose-50/90', badgeBg: 'bg-rose-700 text-white', labelBtn: 'ثبت اعتراض رسمی' },
                        { key: 'settled', title: '۴. تسویه‌شده', color: 'border-emerald-300 bg-emerald-50/90', badgeBg: 'bg-emerald-700 text-white', labelBtn: 'مشاهده فیش واریز' },
                      ].map((col) => {
                        const colClaims = localClaims.filter((c) => {
                          if (col.key === 'draft') return c.status === 'draft' || c.status === 'queued';
                          if (col.key === 'submitted') return c.status === 'submitted' || c.status === 'approved_by_insurer' || c.status === 'express_review' || c.status === 'standard_review' || c.status === 'needs_fix' || c.status === 'needs_evidence' || c.status === 'deep_review';
                          if (col.key === 'rejected') return c.status === 'rejected' || c.status === 'rejected_by_insurer' || c.status === 'appealed';
                          if (col.key === 'settled') return c.status === 'settled' || c.status === 'paid';
                          return false;
                        });

                        return (
                          <div key={col.key} className={`p-3 rounded-2xl border-2 ${col.color} space-y-2.5 min-h-[260px] flex flex-col justify-between shadow-2xs`}>
                            <div className="space-y-2">
                              <div className="font-extrabold text-slate-800 flex items-center justify-between border-b border-slate-200/80 pb-1.5 text-[11px]">
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
                                      onClick={() => {
                                        setSelectedClaimForDetailModal(c);
                                        setIsAppealDetailModalOpen(true);
                                        setFixDocSuccessMsg(null);
                                        setIsEditingDraftFinancials(false);
                                        setEditClaimedAmount(c.claimedAmount);
                                        setEditBaseApprovedAmount(c.baseApprovedAmount);
                                        setEditSupplApprovedAmount(c.supplApprovedAmount);
                                      }}
                                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#005581] hover:shadow-md cursor-pointer transition-all space-y-1.5 group relative overflow-hidden"
                                    >
                                      {/* Line 1: Patient Name */}
                                      <div className="flex items-center justify-between text-slate-900 font-extrabold text-[11px]">
                                        <span className="text-slate-500 font-normal">نام بیمار:</span>
                                        <span className="truncate max-w-[120px]">{c.patientName}</span>
                                      </div>

                                      {/* Line 2: Claim ID */}
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-normal">شناسه ادعا:</span>
                                        <span className="font-mono text-[#005581] bg-cyan-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-cyan-100">{c.claimNumber}</span>
                                      </div>

                                      {/* Line 3: Insurance Provider */}
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-normal">سازمان بیمه‌گر:</span>
                                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{c.insuranceProvider}</span>
                                      </div>

                                      {/* Action Button */}
                                      <button
                                        type="button"
                                        className="w-full mt-1.5 py-1.5 px-2 rounded-lg bg-slate-100 group-hover:bg-[#005581] group-hover:text-white text-slate-800 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-[#005581] group-hover:text-[#ffd200]" />
                                        <span>{col.labelBtn}</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="text-[9px] text-slate-400 text-center font-mono border-t border-slate-200/60 pt-1">
                              کانبان هوشمند دنتورا
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-tab 3: Deductions Discrepancy */}
                {activeInsuranceSubTab === 'deductions' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-900">
                      جدول مغایرت‌گیری و بررسی کسورات بیمه‌گر
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-600 font-bold">
                            <th className="py-2.5 px-3">کد ادعا</th>
                            <th className="py-2.5 px-3">بیمار</th>
                            <th className="py-2.5 px-3">سازمان بیمه</th>
                            <th className="py-2.5 px-3">مبلغ ادعا شده</th>
                            <th className="py-2.5 px-3">مبلغ تاییدشده</th>
                            <th className="py-2.5 px-3">مبلغ کسورات</th>
                            <th className="py-2.5 px-3">علت رسمی کسورات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {claims.map((c) => (
                            <tr
                              key={c.id}
                              onClick={() => {
                                setSelectedClaimForDetailModal(c);
                                setIsAppealDetailModalOpen(true);
                              }}
                              className="hover:bg-slate-50 cursor-pointer"
                            >
                              <td className="py-2.5 px-3 font-mono font-bold text-[#005581]">{c.claimNumber}</td>
                              <td className="py-2.5 px-3 font-bold">{c.patientName}</td>
                              <td className="py-2.5 px-3">{c.insuranceProvider}</td>
                              <td className="py-2.5 px-3 font-mono">{c.claimedAmount.toLocaleString()} تومان</td>
                              <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">
                                {(c.baseApprovedAmount + c.supplApprovedAmount).toLocaleString()} تومان
                              </td>
                              <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">
                                {c.deductionAmount.toLocaleString()} تومان
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{c.deductionReason || 'سقف تعرفه'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-tab 4: Official Appeal Form (Enhanced with Images, Regulation Clause, Tooth FDI, Attachments) */}
                {activeInsuranceSubTab === 'appeal_form' && (
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#005581]" />
                        <span>فرم جامع ثبت اعتراض به کسورات بیمه (همراه با تصویر و شرح آئین‌نامه)</span>
                      </h3>
                      <span className="text-[11px] text-slate-500">پیوست تصویر گرافی RVG الزامی است</span>
                    </div>

                    {appealSubmitted && (
                      <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>اعتراض شما همراه با پیوست‌های تصویری و شرح بیمه با موفقیت ثبت و ارسال شد.</span>
                      </div>
                    )}

                    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border text-xs">
                      {/* Claim Selection */}
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">انتخاب پرونده و ادعای دارای کسورات:</label>
                        <select
                          value={selectedClaimForAppeal?.id || ''}
                          onChange={(e) => {
                            const found = claims.find((c) => c.id === e.target.value);
                            setSelectedClaimForAppeal(found || null);
                          }}
                          className="w-full px-3 py-2 border rounded-xl font-bold bg-white"
                        >
                          <option value="">انتخاب پرونده ادعا...</option>
                          {claims.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.claimNumber} - {c.patientName} (دندان {c.toothFdi} · کسورات: {c.deductionAmount.toLocaleString()} تومان)
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedClaimForAppeal && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1.5 font-mono">
                          <div className="flex justify-between font-sans font-bold text-slate-900">
                            <span>بیمار: {selectedClaimForAppeal.patientName} (کد ملی: {selectedClaimForAppeal.nationalId})</span>
                            <span className="text-[#005581]">کد دندان (FDI): {selectedClaimForAppeal.toothFdi}</span>
                          </div>
                          <div className="font-sans text-slate-600">
                            عنوان درمان: <strong>{selectedClaimForAppeal.treatmentName}</strong> · بیمه‌گر: <strong>{selectedClaimForAppeal.insuranceProvider}</strong>
                          </div>
                          <div className="font-sans text-rose-700 bg-rose-50 p-2 rounded-lg font-bold border border-rose-200">
                            علت اولیه کسورات سازمان بیمه: {selectedClaimForAppeal.deductionReason || 'عدم انطباق با تعرفه'}
                          </div>
                        </div>
                      )}

                      {/* Regulation Clause & Reason Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">دسته‌بندی علت اعتراض:</label>
                          <select
                            value={appealReasonCategory}
                            onChange={(e) => setAppealReasonCategory(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
                          >
                            <option value="کسورات غیرمجاز تعرفه‌ای">کسورات غیرمجاز تعرفه‌ای</option>
                            <option value="اشتباه محاسباتی در پوشش عصب‌کشی">اشتباه محاسباتی در پوشش عصب‌کشی</option>
                            <option value="تایید درمان مجدد طبق گرافی RVG">تایید درمان مجدد طبق گرافی RVG</option>
                            <option value="نقص مدرک بالینی و ارسال مدارک ثانویه">نقص مدرک بالینی و ارسال مدارک ثانویه</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">استناد به آیین‌نامه / بند قانونی بیمه:</label>
                          <input
                            type="text"
                            value={appealInsuranceRegulation}
                            onChange={(e) => setAppealInsuranceRegulation(e.target.value)}
                            placeholder="مثال: بند ۱۲ آیین‌نامه تعرفه درمان شورای عالی بیمه"
                            className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Mandatory Image & Document Attachment Section */}
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-800 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-[#005581]" />
                            <span>تصاویر و مدارک پیوستی پرونده اعتراض (پیوست تصویر الزامی است):</span>
                          </label>
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">
                            حداقل ۱ تصویر گرافی/بالینی
                          </span>
                        </div>

                        {/* Sample Attachment Selector Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newAtt = {
                                id: `att-${Date.now()}`,
                                name: 'عکس گرافی RVG پری‌آپیکال قبل/بعد از درمان',
                                type: 'xray',
                                url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop&q=60',
                              };
                              setAppealAttachedImages((prev) => [...prev, newAtt]);
                            }}
                            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-[#005581] text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>+ افزودن عکس گرافی RVG دندان</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const newAtt = {
                                id: `att-${Date.now()}`,
                                name: 'برگه شرح بالینی و تاییدیه پزشک معتمد',
                                type: 'clinical_note',
                              };
                              setAppealAttachedImages((prev) => [...prev, newAtt]);
                            }}
                            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-[#005581] text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>+ افزودن شرح بالینی دندان‌پزشک</span>
                          </button>
                        </div>

                        {/* List of Attached Files */}
                        <div className="space-y-2 pt-2">
                          {appealAttachedImages.length === 0 ? (
                            <div className="p-3 border-2 border-dashed border-rose-300 bg-rose-50 rounded-xl text-center text-rose-700 font-bold text-[11px]">
                              هیچ تصویری پیوست نشده است! جهت ثبت اعتراض، لطفاً عکس گرافی RVG یا مدارک بالینی را اضافه فرمایید.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {appealAttachedImages.map((img) => (
                                <div
                                  key={img.id}
                                  className="p-2.5 bg-white border rounded-xl flex items-center justify-between text-[11px]"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    {img.url ? (
                                      <img
                                        src={img.url}
                                        alt="RVG preview"
                                        className="w-9 h-9 rounded object-cover border shrink-0"
                                      />
                                    ) : (
                                      <FileText className="w-8 h-8 text-[#005581] shrink-0" />
                                    )}
                                    <div className="truncate">
                                      <div className="font-bold text-slate-800 truncate">{img.name}</div>
                                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                        <span>پیوست تایید شد</span>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAppealAttachedImages((prev) => prev.filter((i) => i.id !== img.id))
                                    }
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="حذف پیوست"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Appeal Narrative Text */}
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          متن کامل لایحه دفاعیه و توجیه بالینی حسابدار:
                        </label>
                        <textarea
                          rows={4}
                          value={appealText}
                          onChange={(e) => setAppealText(e.target.value)}
                          placeholder="مثال: با استناد به تصویر گرافی RVG پیوست‌شده و بند ۱۲ آیین‌نامه بیمه، درمان کانال ریشه طبق پروتکل استاندارد انجام شده و کسورات فوق غیرمجاز می‌باشد..."
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (!selectedClaimForAppeal) {
                            alert('لطفاً ابتدا ادعای مورد نظر را انتخاب فرمایید.');
                            return;
                          }
                          if (appealAttachedImages.length === 0) {
                            alert('برای ثبت اعتراض، آپلود/پیوست حداقل یک تصویر گرافی RVG یا شرح بیمه‌ای الزامی است.');
                            return;
                          }
                          handleSendAppeal(selectedClaimForAppeal.id);
                        }}
                        className="w-full py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                      >
                        <Send className="w-4 h-4 text-[#ffd200]" />
                        <span>ارسال اعتراض رسمی با تمامی پیوست‌های تصویری به سازمان بیمه‌گر</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL: CASH FLOW METRICS DETAILED BREAKDOWN ================= */}
      {activeMetricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs dir-rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0 animate-scaleUp max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className={`p-4 flex items-center justify-between text-white ${
              activeMetricModal === 'received' ? 'bg-emerald-700' :
              activeMetricModal === 'insurance' ? 'bg-cyan-700' :
              activeMetricModal === 'due_today' ? 'bg-amber-600' :
              activeMetricModal === 'overdue' ? 'bg-rose-700' :
              activeMetricModal === 'invoices' ? 'bg-indigo-700' :
              'bg-slate-900'
            }`}>
              <div className="flex items-center gap-2">
                {activeMetricModal === 'received' && <CheckCircle2 className="w-5 h-5 text-[#ffd200]" />}
                {activeMetricModal === 'insurance' && <Clock className="w-5 h-5 text-[#ffd200]" />}
                {activeMetricModal === 'due_today' && <Calendar className="w-5 h-5 text-[#ffd200]" />}
                {activeMetricModal === 'overdue' && <AlertOctagon className="w-5 h-5 text-[#ffd200]" />}
                {activeMetricModal === 'invoices' && <TrendingUp className="w-5 h-5 text-[#ffd200]" />}
                {activeMetricModal === 'blocked' && <ShieldAlert className="w-5 h-5 text-rose-400" />}

                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {activeMetricModal === 'received' && 'جزئیات آنلاین دریافتی‌های امروز (نقد و کارتخوان)'}
                    {activeMetricModal === 'insurance' && 'ریز مطالبات اسناد ارسال‌شده به بیمه‌گر'}
                    {activeMetricModal === 'due_today' && 'لیست اقساط با سررسید امروز'}
                    {activeMetricModal === 'overdue' && 'لیست اقساط معوقه و سررسیدگذشته'}
                    {activeMetricModal === 'invoices' && 'ریز فاکتورهای صادره امروز'}
                    {activeMetricModal === 'blocked' && 'پرونده‌های مانع جریان نقدی (Bottlenecks)'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {activeMetricModal === 'received' && 'ارزش کل: 8,450,000 تومان (4 تراکنش موفق)'}
                    {activeMetricModal === 'insurance' && 'ارزش کل: 14,800,000 تومان (10 پرونده در 3 ارگان)'}
                    {activeMetricModal === 'due_today' && 'ارزش کل: 6,000,000 تومان (2 قسط امروز)'}
                    {activeMetricModal === 'overdue' && 'ارزش کل: 3,200,000 تومان (2 قسط معوقه)'}
                    {activeMetricModal === 'invoices' && 'ارزش کل: 23,250,000 تومان (6 فاکتور صادره)'}
                    {activeMetricModal === 'blocked' && 'مجموع کل معطل: 4,250,000 تومان (2 پرونده دارای نقص)'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveMetricModal(null);
                  setMetricActionMsg(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Feedback Banner */}
            {metricActionMsg && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                <span>{metricActionMsg}</span>
                <button onClick={() => setMetricActionMsg(null)} className="text-emerald-700 font-normal">بستن</button>
              </div>
            )}

            {/* Modal Body - Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* 1. RECEIVED TODAY METRIC */}
              {activeMetricModal === 'received' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-900 text-center font-bold">
                    <div>جمع کارتخوان پوز: <span className="font-mono text-emerald-700">5,450,000 تومان</span></div>
                    <div>جمع واریز نقدی: <span className="font-mono text-emerald-700">3,000,000 تومان</span></div>
                    <div>تعداد تراکنش: <span className="font-mono text-emerald-700">4 فقره</span></div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                    {/* Item 1 */}
                    <div className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>مریم رضایی (کد بیمار: PAT-801)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">تراکنش کارتخوان</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">خدمات: ترمیم کامپوزیت 2 دندان | دستگاه #1 پاسارگاد</div>
                        <div className="text-slate-400 font-mono text-[10px]">کد پیگیری: 894512 | زمان: 09:30</div>
                      </div>
                      <div className="text-left">
                        <div className="font-mono font-black text-sm text-emerald-700">3,500,000 تومان</div>
                        <span className="text-[10px] text-emerald-600 font-bold">موفق / ثبت‌شده</span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>علی احمدی (کد بیمار: PAT-804)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">تراکنش کارتخوان</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">خدمات: جرم‌گیری و بروفیلاکس | دستگاه #2 سامان</div>
                        <div className="text-slate-400 font-mono text-[10px]">کد پیگیری: 894530 | زمان: 10:15</div>
                      </div>
                      <div className="text-left">
                        <div className="font-mono font-black text-sm text-emerald-700">1,200,000 تومان</div>
                        <span className="text-[10px] text-emerald-600 font-bold">موفق / ثبت‌شده</span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>سارا کریمی (کد بیمار: PAT-809)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">نقدی صندوق</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">خدمات: پیش‌پرداخت طرح درمان ارتودنسی</div>
                        <div className="text-slate-400 font-mono text-[10px]">شماره رسید: CASH-402 | زمان: 11:00</div>
                      </div>
                      <div className="text-left">
                        <div className="font-mono font-black text-sm text-emerald-700">3,000,000 تومان</div>
                        <span className="text-[10px] text-blue-600 font-bold">تحویل صندوق</span>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>رضا محمدی (کد بیمار: PAT-812)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">تراکنش کارتخوان</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">خدمات: کشیدن دندان عقل نهفته | دستگاه #1 پاسارگاد</div>
                        <div className="text-slate-400 font-mono text-[10px]">کد پیگیری: 894588 | زمان: 12:20</div>
                      </div>
                      <div className="text-left">
                        <div className="font-mono font-black text-sm text-emerald-700">750,000 تومان</div>
                        <span className="text-[10px] text-emerald-600 font-bold">موفق / ثبت‌شده</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. INSURANCE PENDING METRIC */}
              {activeMetricModal === 'insurance' && (
                <div className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-300 font-bold">
                    جدول اسناد بیمه‌ای ارسال‌شده به بیمه‌های طرف قرارداد که در انتظار ارزیابی و تسویه مالی هستند:
                  </p>

                  <div className="space-y-2.5">
                    {/* Insurance Org 1 */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-cyan-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Building className="w-4 h-4 text-cyan-700" />
                          <span>بیمه آتیه‌سازان حافظ</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-100 text-cyan-800 font-mono font-bold">5 پرونده فعال</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">خدمات: روکش سرامیکی و عصب‌کشی | کد رهگیری ارسال: ATN-9041</div>
                        <div className="text-slate-500 text-[10px]">تاریخ ارسال: 1405/05/18 | وضعیت: در انتظار بررسی ارزیاب بیمه</div>
                      </div>
                      <div className="sm:text-left">
                        <div className="font-mono font-black text-base text-cyan-900 dark:text-cyan-400">6,500,000 تومان</div>
                        <button
                          onClick={() => setMetricActionMsg('استعلام آنلاین وضعیت اسناد بیمه آتیه‌سازان حافظ ارسال گردید.')}
                          className="mt-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                        >
                          استعلام آنلاین وضعیت
                        </button>
                      </div>
                    </div>

                    {/* Insurance Org 2 */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-cyan-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Building className="w-4 h-4 text-cyan-700" />
                          <span>بیمه دانا (تکمیلی)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-100 text-cyan-800 font-mono font-bold">3 پرونده فعال</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">خدمات: جراحی دندان و ایمپلنت | کد رهگیری ارسال: DAN-4412</div>
                        <div className="text-slate-500 text-[10px]">تاریخ ارسال: 1405/05/19 | وضعیت: تأیید اولیه ارزیاب (در صف واریز)</div>
                      </div>
                      <div className="sm:text-left">
                        <div className="font-mono font-black text-base text-cyan-900 dark:text-cyan-400">4,800,000 تومان</div>
                        <button
                          onClick={() => setMetricActionMsg('درخواست پیگیری تسویه مالی بیمه دانا ثبت گردید.')}
                          className="mt-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                        >
                          پیگیری واریز
                        </button>
                      </div>
                    </div>

                    {/* Insurance Org 3 */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-cyan-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Building className="w-4 h-4 text-cyan-700" />
                          <span>بیمه ایران</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-100 text-cyan-800 font-mono font-bold">2 پرونده فعال</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">خدمات: ترمیم آمالگام و RCT | کد رهگیری ارسال: IRN-8801</div>
                        <div className="text-slate-500 text-[10px]">تاریخ ارسال: 1405/05/15 | وضعیت: در صف تخصیص اعتبار بانک</div>
                      </div>
                      <div className="sm:text-left">
                        <div className="font-mono font-black text-base text-cyan-900 dark:text-cyan-400">3,500,000 تومان</div>
                        <button
                          onClick={() => setMetricActionMsg('یادداشت پیگیری بیمه ایران در دفتر روزنامه ثبت شد.')}
                          className="mt-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                        >
                          مشاهده جزئیات
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. DUE TODAY INSTALLMENTS METRIC */}
              {activeMetricModal === 'due_today' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-900 flex items-center justify-between font-bold">
                    <span>جمع اقساط دارای سررسید امروز: 6,000,000 تومان</span>
                    <span className="text-xs text-amber-700">پیامک خودکار یادآوری در ساعت 08:00 ارسال شد</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Item 1 */}
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>مهدی علیزاده</span>
                          <span className="font-mono text-slate-500 text-xs">(09121112233)</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">طرح درمان: ارتودنسی ثابت (قسط شماره ۲ از ۶)</div>
                        <div className="text-emerald-700 font-bold text-[10px]">وضعیت: پیامک یادآوری دریافت شد (در انتظار حضور بیمار)</div>
                      </div>
                      <div className="sm:text-left flex flex-col items-end gap-1.5">
                        <div className="font-mono font-black text-base text-amber-900 dark:text-amber-400">2,500,000 تومان</div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleCollectInstallment('INST-101', 2, 'مهدی علیزاده', 2500000);
                              setMetricActionMsg('وجه قسط 2,500,000 تومانی مهدی علیزاده ثبت و رسید دیجیتال صادر شد.');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ثبت دریافت کارتخوان
                          </button>
                          <button
                            onClick={() => setMetricActionMsg('پیامک یادآوری مجدد برای مهدی علیزاده ارسال گردید.')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ارسال پیامک مجدد
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>نیلوفر کاظمی</span>
                          <span className="font-mono text-slate-500 text-xs">(09124445566)</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">طرح درمان: جراحی ایمپلنت (قسط شماره ۱ از ۳)</div>
                        <div className="text-emerald-700 font-bold text-[10px]">وضعیت: پیامک یادآوری دریافت شد (زمان نوبت: 16:30)</div>
                      </div>
                      <div className="sm:text-left flex flex-col items-end gap-1.5">
                        <div className="font-mono font-black text-base text-amber-900 dark:text-amber-400">3,500,000 تومان</div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleCollectInstallment('INST-102', 1, 'نیلوفر کاظمی', 3500000);
                              setMetricActionMsg('وجه قسط 3,500,000 تومانی نیلوفر کاظمی ثبت و رسید دیجیتال صادر شد.');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ثبت دریافت کارتخوان
                          </button>
                          <button
                            onClick={() => setMetricActionMsg('پیامک یادآوری مجدد برای نیلوفر کاظمی ارسال گردید.')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ارسال پیامک مجدد
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. OVERDUE INSTALLMENTS METRIC */}
              {activeMetricModal === 'overdue' && (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-900 flex items-center justify-between font-bold">
                    <span>مجموع مطالبات معوقه سررسیدگذشته: 3,200,000 تومان</span>
                    <span className="text-xs text-rose-700">نیازمند پیگیری تلفنی مستقیم حسابدار</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Item 1 */}
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>حسین نوری</span>
                          <span className="font-mono text-slate-500 text-xs">(09127778899)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">۵ روز تاخیر</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">طرح درمان: جراحی ایمپلنت (قسط شماره ۳ از ۴)</div>
                        <div className="text-amber-800 font-bold text-[10px]">آخرین پیگیری: تماس تلفنی برقرار شد (تعهد پرداخت تا پایان وقت امروز)</div>
                      </div>
                      <div className="sm:text-left flex flex-col items-end gap-1.5">
                        <div className="font-mono font-black text-base text-rose-900 dark:text-rose-400">1,800,000 تومان</div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleCollectInstallment('INST-103', 3, 'حسین نوری', 1800000);
                              setMetricActionMsg('وجه معوقه 1,800,000 تومانی حسین نوری وصول و تسویه گردید.');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ثبت وصول وجه
                          </button>
                          <button
                            onClick={() => setMetricActionMsg('یادداشت پیگیری تلفنی جدید برای حسین نوری ثبت شد.')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ثبت پیگیری تلفنی
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>زهرا موسوی</span>
                          <span className="font-mono text-slate-500 text-xs">(09123332211)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">۱۲ روز تاخیر</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">طرح درمان: روکش سرامیکی (قسط شماره ۲ از ۳)</div>
                        <div className="text-rose-700 font-bold text-[10px]">آخرین پیگیری: عدم پاسخ تلفنی (اخطار دوم تسویه ارسال شد)</div>
                      </div>
                      <div className="sm:text-left flex flex-col items-end gap-1.5">
                        <div className="font-mono font-black text-base text-rose-900 dark:text-rose-400">1,400,000 تومان</div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleCollectInstallment('INST-104', 2, 'زهرا موسوی', 1400000);
                              setMetricActionMsg('وجه معوقه 1,400,000 تومانی زهرا موسوی وصول و تسویه گردید.');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ثبت وصول وجه
                          </button>
                          <button
                            onClick={() => setMetricActionMsg('اخطار دوم اخطاریه اقساطی به شماره زهرا موسوی پیامک گردید.')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            ارسال اخطاریه SMS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. INVOICES ISSUED TODAY METRIC */}
              {activeMetricModal === 'invoices' && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-900 flex items-center justify-between font-bold">
                    <span>مجموع ارزش کل ۶ فاکتور صادره امروز: 23,250,000 تومان</span>
                    <span className="text-xs text-indigo-700">شامل ۶ فاکتور درمانی در بخش حسابداری</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                    {[
                      { id: 'INV-1001', patient: 'مریم رضایی', doctor: 'دکتر امینی', service: 'ترمیم دندان 36 و عصب‌کشی', total: 5500000, patientShare: 3500000, insuranceShare: 2000000, time: '09:15' },
                      { id: 'INV-1002', patient: 'علی احمدی', doctor: 'دکتر صادقی', service: 'جرم‌گیری و بروفیلاکس', total: 1200000, patientShare: 1200000, insuranceShare: 0, time: '10:00' },
                      { id: 'INV-1003', patient: 'سارا کریمی', doctor: 'دکتر امینی', service: 'طرح درمان کامل ارتودنسی', total: 12000000, patientShare: 3000000, insuranceShare: 0, time: '10:45' },
                      { id: 'INV-1004', patient: 'رضا محمدی', doctor: 'دکتر رضوی', service: 'جراحی دندان عقل نهفته', total: 1500000, patientShare: 750000, insuranceShare: 750000, time: '11:30' },
                      { id: 'INV-1005', patient: 'نرگس حسینی', doctor: 'دکتر صادقی', service: 'معاینه تخصصی و PA گرافی', total: 300000, patientShare: 300000, insuranceShare: 0, time: '12:10' },
                      { id: 'INV-1006', patient: 'کامران شریفی', doctor: 'دکتر امینی', service: 'ترمیم آمالگام ۲ سطحی', total: 2750000, patientShare: 1750000, insuranceShare: 1000000, time: '12:40' },
                    ].map((inv) => (
                      <div key={inv.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="font-mono text-indigo-700">{inv.id}</span>
                            <span>{inv.patient}</span>
                            <span className="text-slate-400 font-normal">({inv.doctor})</span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 text-[11px]">{inv.service}</div>
                          <div className="text-slate-400 text-[10px]">
                            سهم بیمار: <strong className="text-slate-700 font-mono">{inv.patientShare.toLocaleString()}</strong> | سهم بیمه: <strong className="text-slate-700 font-mono">{inv.insuranceShare.toLocaleString()}</strong>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-mono font-black text-sm text-indigo-900 dark:text-indigo-300">{inv.total.toLocaleString()} تومان</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. BOTTLENECK CLAIMS METRIC */}
              {activeMetricModal === 'blocked' && (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-900 border border-rose-200 font-bold flex items-center justify-between">
                    <span>مجموع پرونده‌های معطل جریان نقدی: ۲ پرونده (۴,۲۵۰,۰۰۰ تومان)</span>
                    <span className="text-xs text-rose-700">نیازمند اقدام فوری جهت رفع نقص آنلاین</span>
                  </div>

                  <div className="space-y-3">
                    {/* Bottleneck 1 */}
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>پرونده CLM-802 | بیمار: کیوان عباسی</span>
                        </div>
                        <div className="font-mono font-black text-rose-900 dark:text-rose-400 text-sm">
                          1,850,000 تومان معطل
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-1 text-[11px]">
                        <div><strong className="text-rose-700">علت مانع مالی:</strong> عدم تطابق کد ملی ثبت‌شده در پرونده کلینیک با سامانه استعلام آنلاین بیمه پایه (نقص مدارک شناسایی).</div>
                        <div><strong className="text-emerald-700">اقدام اصلاحی پیشنهادشده:</strong> استعلام مجدد کد ملی بیمار، ویرایش در پرونده و بازارسال آنلاین سند بیمه به سازمان.</div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setMetricActionMsg('کد ملی بیمار کیوان عباسی اصلاح و سند بیمه‌ای CLM-802 بازارسال آنلاین گردید.')}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[#ffd200]" />
                          <span>رفع نقص و بازارسال آنلاین سند</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottleneck 2 */}
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>پرونده CLM-805 | بیمار: فاطمه ابراهیمی</span>
                        </div>
                        <div className="font-mono font-black text-rose-900 dark:text-rose-400 text-sm">
                          2,400,000 تومان معطل
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-1 text-[11px]">
                        <div><strong className="text-rose-700">علت مانع مالی:</strong> مغایرت تعرفه گرافی پانورامیک با سقف ریالی بیمه آتیه‌سازان حافظ.</div>
                        <div><strong className="text-emerald-700">اقدام اصلاحی پیشنهادشده:</strong> ثبت فرم اعتراض کسورات (Appeal) و اصلاح شرح خدمت بر اساس تعرفه مصوب بیمه‌گر.</div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setMetricActionMsg('فرم اعتراض کسورات (Appeal) برای پرونده فاطمه ابراهیمی ثبت و ارسال شد.')}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[#ffd200]" />
                          <span>ثبت فرم اعتراض (Appeal) و ارسال</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">سامانه حسابداری هوشمند کلینیک دنتورا</span>
              <button
                onClick={() => {
                  setActiveMetricModal(null);
                  setMetricActionMsg(null);
                }}
                className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW INSTALLMENT PLAN ================= */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs dir-rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-4 animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-[#005581] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#ffd200]" />
                <h3 className="font-extrabold text-sm text-white">
                  تعریف و ثبت پلان اقساطی جدید برای بیمار
                </h3>
              </div>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewPlan} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام و نام خانوادگی بیمار <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: مریم حسینی"
                    value={newPlanPatientName}
                    onChange={(e) => setNewPlanPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#005581]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره همراه بیمار <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912xxxxxxx"
                    value={newPlanPhone}
                    onChange={(e) => setNewPlanPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#005581] font-mono"
                  />
                </div>

                {/* Treatment Title */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان درمان / طرح درمان مربوطه
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: درمان کامپوزیت و ارتودنسی"
                    value={newPlanTreatmentTitle}
                    onChange={(e) => setNewPlanTreatmentTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#005581]"
                  />
                </div>

                {/* Date of First Due */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ سررسید اولین قسط
                  </label>
                  <input
                    type="text"
                    value={newPlanFirstDueDate}
                    onChange={(e) => setNewPlanFirstDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#005581] font-mono"
                  />
                </div>

                {/* Total Cost */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مبلغ کل هزینه درمان (تومان) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500000}
                    value={newPlanTotalAmount}
                    onChange={(e) => setNewPlanTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#005581] font-mono font-bold"
                  />
                </div>

                {/* Pre-payment */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مبلغ پیش‌پرداخت نقدی (تومان)
                  </label>
                  {newPlanIsBNPL ? (
                    <div className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>۱۰۰٪ تسویه یکجا توسط BNPL با کلینیک (بدون نیاز به پیش‌پرداخت بیمار)</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      step={500000}
                      value={newPlanPrePayment}
                      onChange={(e) => setNewPlanPrePayment(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#005581] font-mono font-bold text-emerald-600"
                    />
                  )}
                </div>

                {/* Number of Installments */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تعداد اقساط ماهانه بیمار
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 6, 12].map((cnt) => (
                      <button
                        type="button"
                        key={cnt}
                        onClick={() => setNewPlanCount(cnt)}
                        className={`py-2 rounded-xl font-extrabold border transition ${
                          newPlanCount === cnt
                            ? 'bg-[#005581] text-white border-[#005581] shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {cnt} قسط
                      </button>
                    ))}
                  </div>
                </div>

                {/* BNPL Method Selector */}
                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                    نوع و روش تسویه اقساط:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPlanIsBNPL(false)}
                      className={`p-2.5 rounded-xl border text-right font-bold transition cursor-pointer ${
                        !newPlanIsBNPL
                          ? 'bg-white dark:bg-slate-900 border-[#005581] text-[#005581] dark:text-[#72cdf4] shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-extrabold">
                        <span className="w-2 h-2 rounded-full bg-[#005581]"></span>
                        <span>اقساط عادی کلینیک (تسویه دستی)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                        دریافت نقدی یا کارتخوان در مطب - نیازمند تأیید و ثبت دستی توسط حسابدار
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={!isBNPLEnabledForClinic}
                      onClick={() => isBNPLEnabledForClinic && setNewPlanIsBNPL(true)}
                      className={`p-2.5 rounded-xl border text-right font-bold transition ${
                        newPlanIsBNPL
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs cursor-pointer'
                          : !isBNPLEnabledForClinic
                          ? 'bg-slate-100 opacity-60 cursor-not-allowed border-slate-200 text-slate-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-extrabold">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>اعتباری BNPL (تسویه ۱۰۰٪ یکجا با کلینیک)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                        {isBNPLEnabledForClinic
                          ? 'پرداخت ۱۰۰٪ مبلغ درمان توسط شرکت BNPL - اقساط توسط بیمار با BNPL تسویه می‌شود'
                          : 'توسط مدیریت کلینیک غیرفعال شده است'}
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Automatic Installment Summary Calculation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
                  <span>وضعیت مالی درمان:</span>
                  <span className="text-[11px] text-[#005581] font-mono font-bold">
                    {newPlanIsBNPL ? (
                      <span className="text-emerald-700 dark:text-emerald-400">مانده طلب کلینیک: ۰ تومان (تسویه ۱۰۰٪ با BNPL)</span>
                    ) : (
                      <span>باقی‌مانده بدهی به کلینیک: {(Math.max(0, newPlanTotalAmount - newPlanPrePayment)).toLocaleString()} تومان</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div>مبلغ هر قسط بیمار: <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{Math.round(newPlanTotalAmount / (newPlanCount || 1)).toLocaleString()} تومان</strong></div>
                  <div>روش اقساط: <strong className="text-slate-900 dark:text-slate-100 font-bold">{newPlanIsBNPL ? 'مستقیم بیمار با پلتفرم BNPL' : `ماهانه کلینیک (${newPlanCount} قسط)`}</strong></div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005581] hover:bg-[#004266] text-white font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4 text-[#ffd200]" />
                  <span>تأیید و ایجاد پلان اقساطی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULL CLAIM / CHECKLIST / FIX / APPEAL INFORMATION PAGE ================= */}
      {isAppealDetailModalOpen && selectedClaimForDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs dir-rtl overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-scaleUp text-xs space-y-0">
            {/* Modal Header */}
            <div className="bg-[#005581] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ffd200]" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {selectedClaimForDetailModal.status === 'draft' || selectedClaimForDetailModal.status === 'queued'
                      ? 'بررسی ادعای ثبت‌شده منشی و تطبیق خودکار مالی'
                      : selectedClaimForDetailModal.status === 'needs_fix' || selectedClaimForDetailModal.status === 'needs_evidence' || selectedClaimForDetailModal.status === 'deep_review'
                      ? 'رفع کسری مدارک و تکمیل پرونده ادعای بیمه'
                      : selectedClaimForDetailModal.status === 'rejected' || selectedClaimForDetailModal.status === 'rejected_by_insurer' || selectedClaimForDetailModal.status === 'appealed'
                      ? 'جزئیات کسورات بیمه و ثبت اعتراض رسمی'
                      : selectedClaimForDetailModal.status === 'settled' || selectedClaimForDetailModal.status === 'paid'
                      ? 'گزارش ادعای تسویه‌شده و واریزی به حساب کلینیک'
                      : 'اطلاعات کامل ادعای ارسال‌شده به بیمه‌گر'}
                  </h3>
                  <p className="text-[11px] text-cyan-200 font-mono mt-0.5">
                    کد ادعا: {selectedClaimForDetailModal.claimNumber} · سازمان بیمه‌گر: {selectedClaimForDetailModal.insuranceProvider}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAppealDetailModalOpen(false);
                  setFixDocImage(null);
                  setFixDocNote('');
                  setFixDocSuccessMsg(null);
                }}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Success Notification message */}
              {fixDocSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fixDocSuccessMsg}</span>
                </div>
              )}

              {/* Status Badge Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">مرحله فعلی در کانبان بیمه:</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black border ${
                    selectedClaimForDetailModal.status === 'draft' || selectedClaimForDetailModal.status === 'queued'
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : selectedClaimForDetailModal.status === 'submitted' || selectedClaimForDetailModal.status === 'approved_by_insurer' || selectedClaimForDetailModal.status === 'express_review' || selectedClaimForDetailModal.status === 'standard_review'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : selectedClaimForDetailModal.status === 'needs_fix' || selectedClaimForDetailModal.status === 'needs_evidence' || selectedClaimForDetailModal.status === 'deep_review'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : selectedClaimForDetailModal.status === 'rejected' || selectedClaimForDetailModal.status === 'rejected_by_insurer' || selectedClaimForDetailModal.status === 'appealed'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {selectedClaimForDetailModal.status === 'draft' || selectedClaimForDetailModal.status === 'queued'
                      ? '۱. ثبت‌شده (ورودی منشی)'
                      : selectedClaimForDetailModal.status === 'submitted' || selectedClaimForDetailModal.status === 'approved_by_insurer' || selectedClaimForDetailModal.status === 'express_review' || selectedClaimForDetailModal.status === 'standard_review'
                      ? '۲. ارسال‌شده به بیمه (در حال ارزیابی)'
                      : selectedClaimForDetailModal.status === 'needs_fix' || selectedClaimForDetailModal.status === 'needs_evidence' || selectedClaimForDetailModal.status === 'deep_review'
                      ? '۳. نیازمند اصلاح (کسری مدارک)'
                      : selectedClaimForDetailModal.status === 'rejected' || selectedClaimForDetailModal.status === 'rejected_by_insurer' || selectedClaimForDetailModal.status === 'appealed'
                      ? '۴. برگشت‌خورده / کسورات'
                      : '۵. تسویه‌شده و واریز بانک'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  تاریخ ارائه خدمت: {selectedClaimForDetailModal.dateOfService}
                </div>
              </div>

              {/* Patient & Dental Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Profile */}
                <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs border-b pb-1.5 flex items-center justify-between">
                    <span>مشخصات بیمار و پرونده منشی:</span>
                    <span className="text-[#005581] font-mono text-[11px]">{selectedClaimForDetailModal.patientId}</span>
                  </h4>
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <div>نام بیمار: <strong className="text-slate-900 dark:text-slate-100">{selectedClaimForDetailModal.patientName}</strong></div>
                    <div>کد ملی: <strong className="font-mono">{selectedClaimForDetailModal.nationalId}</strong></div>
                    <div>سازمان بیمه‌گر: <strong>{selectedClaimForDetailModal.insuranceProvider}</strong></div>
                    <div>احراز هویت پذیرش: <strong className="text-emerald-700">تایید زنده شاهکار/منشی</strong></div>
                  </div>
                </div>

                {/* Service & Tooth Info */}
                <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs border-b pb-1.5 flex items-center justify-between">
                    <span>مشخصات درمان و دندان:</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      FDI: {selectedClaimForDetailModal.toothFdi}
                    </span>
                  </h4>
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <div>عنوان درمان: <strong className="text-slate-900 dark:text-slate-100">{selectedClaimForDetailModal.treatmentName}</strong></div>
                    <div>شماره دندان: <strong>دندان شماره {selectedClaimForDetailModal.toothFdi}</strong></div>
                    <div>مبلغ ادعاشده: <strong className="font-mono text-emerald-700 font-bold">{selectedClaimForDetailModal.claimedAmount.toLocaleString()} تومان</strong></div>
                    <div>پزشک معالج: <strong>دکتر رضا حسینی (کد نظام: 10482)</strong></div>
                  </div>
                </div>
              </div>

              {/* 1. DRAFT SPECIFIC: AUTOMATED FINANCIAL COMPLIANCE CHECKLIST & MANUAL EDIT */}
              {(selectedClaimForDetailModal.status === 'draft' || selectedClaimForDetailModal.status === 'queued') && (
                <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-200 pb-2">
                    <h4 className="font-extrabold text-cyan-900 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#005581]" />
                      <span>چک‌لیست مطابقت مالی و فنی (ورودی منشی):</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingDraftFinancials(!isEditingDraftFinancials)}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                      <span>{isEditingDraftFinancials ? 'بستن ویرایش دستی' : 'عدم مطابقت مالی / ویرایش دستی مقادیر'}</span>
                    </button>
                  </div>

                  {/* Manual Financial Edit Panel */}
                  {isEditingDraftFinancials ? (
                    <div className="p-3.5 bg-white rounded-xl border-2 border-amber-300 space-y-3">
                      <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>اصلاح دستی مقادیر مالی (در صورت وجود عدم مطابقت در ثبت اولیه‌ی منشی):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">مبلغ کل ادعاشده (تومان):</label>
                          <input
                            type="number"
                            value={editClaimedAmount}
                            onChange={(e) => setEditClaimedAmount(Number(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-900 font-bold bg-amber-50/30"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">سهم بیمه پایه (تومان):</label>
                          <input
                            type="number"
                            value={editBaseApprovedAmount}
                            onChange={(e) => setEditBaseApprovedAmount(Number(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-900 font-bold bg-amber-50/30"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">سهم بیمه تکمیلی (تومان):</label>
                          <input
                            type="number"
                            value={editSupplApprovedAmount}
                            onChange={(e) => setEditSupplApprovedAmount(Number(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-900 font-bold bg-amber-50/30"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLocalClaims((prev) =>
                              prev.map((item) =>
                                item.id === selectedClaimForDetailModal.id
                                  ? {
                                      ...item,
                                      claimedAmount: editClaimedAmount,
                                      baseApprovedAmount: editBaseApprovedAmount,
                                      supplApprovedAmount: editSupplApprovedAmount,
                                    }
                                  : item
                              )
                            );
                            setSelectedClaimForDetailModal((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    claimedAmount: editClaimedAmount,
                                    baseApprovedAmount: editBaseApprovedAmount,
                                    supplApprovedAmount: editSupplApprovedAmount,
                                  }
                                : null
                            );
                            setIsEditingDraftFinancials(false);
                            setFixDocSuccessMsg('مقادیر مالی ادعا با موفقیت به صورت دستی اصلاح و بروزرسانی گردید.');
                          }}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ثبت و اعمال تغییرات دستی مالی</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-white rounded-xl border border-cyan-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="block text-slate-900">۱. استعلام هویت و شاهکار:</strong>
                          <span className="text-slate-600">کد ملی {selectedClaimForDetailModal.nationalId} تایید گردید.</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-cyan-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="block text-slate-900">۲. تطبیق کد تعرفه و K ارزش نسبی:</strong>
                          <span className="text-slate-600">کد تعرفه {selectedClaimForDetailModal.treatmentName} منطبق است.</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-cyan-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="block text-slate-900">۳. تصویر رادیوگرافی RVG:</strong>
                          <span className="text-slate-600">گرافی دندان {selectedClaimForDetailModal.toothFdi} در پرونده ثبت است.</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-cyan-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="block text-slate-900">۴. استعلام اعتبار سقف انفرادی:</strong>
                          <span className="text-slate-600">بیمه {selectedClaimForDetailModal.insuranceProvider} اعتبار دارد.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalClaims((prev) =>
                          prev.map((item) =>
                            item.id === selectedClaimForDetailModal.id
                              ? { ...item, status: 'submitted' as const }
                              : item
                          )
                        );
                        setSelectedClaimForDetailModal((prev) => prev ? { ...prev, status: 'submitted' as const } : null);
                        setFixDocSuccessMsg('تطبیق و صحت مالی تایید گردید و ادعا با موفقیت جهت تسویه به بیمه‌گر ارسال شد.');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md text-xs"
                    >
                      <Check className="w-4 h-4 text-[#ffd200]" />
                      <span>تایید مطابقت مالی و ارسال مستقیم به بیمه‌گر</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. NEEDS FIX SPECIFIC: UPLOAD MISSING DOCUMENTS & DETAILED EXPLANATION */}
              {(selectedClaimForDetailModal.status === 'needs_fix' || selectedClaimForDetailModal.status === 'needs_evidence' || selectedClaimForDetailModal.status === 'deep_review') && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                  <div className="font-extrabold text-amber-900 text-xs flex items-center justify-between border-b border-amber-200 pb-2">
                    <span>اعلام کسری مدارک توسط بیمه / حسابدار:</span>
                    <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">نیازمند اقدام فوری</span>
                  </div>

                  <p className="text-[11px] text-amber-900 font-medium">
                    <strong>علت اعلام کسری:</strong> {selectedClaimForDetailModal.deductionReason || 'عدم پیوست گرافی RVG نهایی و مهر و امضای برجسته پزشک'}
                  </p>

                  {/* Upload Image Section */}
                  <div className="space-y-2 pt-2 border-t border-amber-200/60">
                    <label className="block font-bold text-slate-800 text-[11px]">
                      آپلود تصویر مدرک کسری (گرافی RVG / فرم رضایت / مهر پزشک):
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2 bg-white border-2 border-dashed border-[#005581] hover:bg-cyan-50 rounded-xl text-[#005581] font-bold text-[11px] cursor-pointer flex items-center gap-2 transition">
                        <Upload className="w-4 h-4" />
                        <span>انتخاب و آپلود تصویر...</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const fakeUrl = URL.createObjectURL(file);
                              setFixDocImage(fakeUrl);
                            } else {
                              setFixDocImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop&q=60');
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setFixDocImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop&q=60')}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-[10px]"
                      >
                        نمونه تصویر RVG پیش‌فرض
                      </button>
                    </div>

                    {fixDocImage && (
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-300 flex items-center gap-3 w-max mt-2">
                        <img src={fixDocImage} alt="Uploaded Fix Attachment" className="w-14 h-14 object-cover rounded-lg border shadow-2xs" />
                        <div>
                          <div className="font-bold text-emerald-800 text-[11px]">تصویر مدرک کسری آماده بارگذاری است</div>
                          <div className="text-[10px] text-slate-500">فرمت: PNG/JPG · حجم: 1.2MB</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed Explanation Textarea */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800 text-[11px]">
                      توضیحات تکمیلی و لایحه رفع کسری مدارک:
                    </label>
                    <textarea
                      value={fixDocNote}
                      onChange={(e) => setFixDocNote(e.target.value)}
                      placeholder="توضیحات تکمیلی حسابدار جهت ارسال به کارشناس بیمه‌گر (مثلاً: تصویر گرافی RVG بعد از عصب‌کشی همراه با گواهی پزشک پیوست گردید)..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-sans text-[11px] bg-white leading-relaxed focus:ring-2 focus:ring-[#005581]"
                      rows={3}
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalClaims((prev) =>
                          prev.map((item) =>
                            item.id === selectedClaimForDetailModal.id
                              ? {
                                  ...item,
                                  status: 'submitted' as const,
                                  narrativeText: fixDocNote ? `${item.narrativeText} | رفع کسری: ${fixDocNote}` : item.narrativeText,
                                }
                              : item
                          )
                        );
                        setSelectedClaimForDetailModal((prev) => prev ? { ...prev, status: 'submitted' as const } : null);
                        setFixDocSuccessMsg('تصویر مدرک و توضیحات تکمیلی با موفقیت ثبت و پرونده به بیمه‌گر بازارسال گردید.');
                      }}
                      className="px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-4 h-4 text-[#ffd200]" />
                      <span>تکمیل مدارک و بازارسال به بیمه</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. REJECTED SPECIFIC: OFFICIAL APPEAL REDIRECT */}
              {(selectedClaimForDetailModal.status === 'rejected' || selectedClaimForDetailModal.status === 'rejected_by_insurer' || selectedClaimForDetailModal.status === 'appealed') && (
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3">
                  <div className="font-extrabold text-rose-900 text-xs flex items-center justify-between border-b border-rose-200 pb-2">
                    <span>جزئیات کسورات و رد توسط بیمه‌گر:</span>
                    <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-bold font-mono">
                      کسورات: {selectedClaimForDetailModal.deductionAmount.toLocaleString()} تومان
                    </span>
                  </div>

                  <p className="text-[11px] text-rose-900 font-medium">
                    <strong>علت اعلام کسورات:</strong> {selectedClaimForDetailModal.deductionReason || 'عدم انطباق گرافی با تعرفه انفرادی'}
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                    <div className="font-bold text-slate-800 text-[11px]">راهنمای ثبت اعتراض رسمی:</div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      طبق ماده ۴ آیین‌نامه شورای عالی بیمه، کلینیک تا ۲۰ روز کاری مهلت اعتراض رسمی و ارائه شواهد بالینی تکمیلی دارد.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClaimForAppeal(selectedClaimForDetailModal);
                        setActiveInsuranceSubTab('appeal_form');
                        setIsAppealDetailModalOpen(false);
                      }}
                      className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <FileText className="w-4 h-4 text-[#ffd200]" />
                      <span>هدایت به بخش ثبت اعتراض رسمی</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. SETTLED SPECIFIC: FULL PAYMENT & BANK RECEIPT DETAILS */}
              {(selectedClaimForDetailModal.status === 'settled' || selectedClaimForDetailModal.status === 'paid') && (
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-3 font-mono">
                  <div className="font-extrabold text-emerald-900 text-xs font-sans flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>گزارش کامل تسویه‌حساب و فیش واریز بیمه‌گر:</span>
                    </span>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">تسویه کامل ۱۰۰٪</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-right">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                      <div className="text-slate-500 text-[10px] font-sans">مبلغ کل ادعاشده:</div>
                      <div className="font-bold text-slate-900 mt-0.5">{selectedClaimForDetailModal.claimedAmount.toLocaleString()} ت</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                      <div className="text-slate-500 text-[10px] font-sans">سهم بیمه پایه:</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{selectedClaimForDetailModal.baseApprovedAmount.toLocaleString()} ت</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                      <div className="text-slate-500 text-[10px] font-sans">سهم بیمه تکمیلی:</div>
                      <div className="font-bold text-cyan-700 mt-0.5">{selectedClaimForDetailModal.supplApprovedAmount.toLocaleString()} ت</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                      <div className="text-slate-500 text-[10px] font-sans">خالص دریافتی کلینیک:</div>
                      <div className="font-extrabold text-emerald-800 mt-0.5">{(selectedClaimForDetailModal.baseApprovedAmount + selectedClaimForDetailModal.supplApprovedAmount).toLocaleString()} ت</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1 font-sans text-[11px]">
                    <div><strong>کد پیگیری شبا / فیش واریز بانک:</strong> <span className="font-mono text-[#005581] font-bold">BNK-9982410023</span></div>
                    <div><strong>شماره حساب واریزی:</strong> <span className="font-mono">IR980120000000012345678001</span> (بانک رفاه کارگران)</div>
                    <div><strong>تاریخ تسویه حسابداری:</strong> ۱۴۰۵/۰۵/۰۸</div>
                  </div>
                </div>
              )}

              {/* Progress Timeline for Overview */}
              <div className="space-y-2 border-t pt-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  مراحل چرخه ادعا و پرونده بیمه‌ای:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10px] text-center font-bold">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 flex items-center justify-center gap-1">
                    <span>۱. ثبت اولیه منشی</span>
                    <Check className="w-3 h-3 text-emerald-700" />
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    selectedClaimForDetailModal.status !== 'draft' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    ۲. ارسال به بیمه
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    selectedClaimForDetailModal.status === 'needs_fix' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    ۳. رفع کسری مدارک
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    selectedClaimForDetailModal.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    ۴. بررسی اعتراض
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    selectedClaimForDetailModal.status === 'settled' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    ۵. تسویه نهایی بانک
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#005581]" />
                <span>چاپ پرونده و فاکتور بیمه</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAppealDetailModalOpen(false);
                  setFixDocImage(null);
                  setFixDocNote('');
                  setFixDocSuccessMsg(null);
                }}
                className="px-5 py-2 bg-[#005581] hover:bg-[#004266] text-white font-extrabold rounded-xl transition cursor-pointer"
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
