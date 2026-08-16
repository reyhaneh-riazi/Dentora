import React, { useState } from 'react';
import {
  UserProfile,
  UserRole,
  Branch,
  GreenLaneStatus,
  ClinicRegistration,
  BaseInsuranceContract,
  SupplementaryInsuranceContract,
} from '../../types';
import { toPersianDigits, formatPricePersian } from '../../utils/persianDigits';
import { OwnerWorkspace } from '../owner/OwnerWorkspace';
import {
  Users,
  ShieldCheck,
  Building2,
  UserPlus,
  Zap,
  Activity,
  Wallet,
  DollarSign,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  Clock,
  Send,
  Layers,
  CheckCircle2,
  X,
  Search,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Check,
  Trash2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  FileText,
  Info,
  Crown,
} from 'lucide-react';

interface ManagerWorkspaceProps {
  users: UserProfile[];
  branches: Branch[];
  insuranceModuleActive: boolean;
  onToggleInsuranceModule: () => void;
  onUpdateDoctorCommission: (userId: string, rate: number) => void;
  onAddEmployee: (user: UserProfile) => void;
  onDeleteEmployee?: (userId: string) => void;
  greenLane?: GreenLaneStatus;
  onToggleGreenLaneModule?: (moduleKey: keyof GreenLaneStatus['modules']) => void;
  onToggleGreenLaneActive?: () => void;

  // Owner Props
  isOwner?: boolean;
  currentClinic?: ClinicRegistration;
  onUpdateClinicInfo?: (updated: Partial<ClinicRegistration>) => void;
  onUpdateUserRole?: (userId: string, newRole: UserRole, isOwner: boolean) => void;
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
  initialTab?: 'cash_board' | 'analytics' | 'staff' | 'insurance_receivables' | 'green_lane' | 'owner_settings';
}

export const ManagerWorkspace: React.FC<ManagerWorkspaceProps> = ({
  users,
  branches,
  insuranceModuleActive,
  onToggleInsuranceModule,
  onUpdateDoctorCommission,
  onAddEmployee,
  onDeleteEmployee,
  greenLane,
  onToggleGreenLaneModule,
  onToggleGreenLaneActive,
  isOwner = true,
  currentClinic,
  onUpdateClinicInfo,
  onUpdateUserRole,
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
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'cash_board' | 'analytics' | 'staff' | 'insurance_receivables' | 'green_lane' | 'owner_settings'
  >(initialTab || 'cash_board');

  // Stat Cards Clickable Detail Modal State (Cash Board)
  const [activeModalCard, setActiveModalCard] = useState<'invoiced' | 'cash' | 'pos' | null>(null);

  // Insurance Receivables Clickable Stat Cards Modal State
  const [activeInsuranceModalCard, setActiveInsuranceModalCard] = useState<
    'total_receivables' | 'returned_claims' | 'settlement_timeline' | 'rejected_claims' | null
  >(null);

  // Search filter for modals
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Expandable toggle state for insurance trust level guidelines
  const [isLevelGuideOpen, setIsLevelGuideOpen] = useState(false);

  // Employee Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<UserProfile | null>(null);

  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<'dentist' | 'receptionist' | 'accountant' | 'manager'>('dentist');
  const [empNationalId, setEmpNationalId] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empCommission, setEmpCommission] = useState(45);

  // Filter clinic staff to only include authorized clinic roles (dentist, receptionist, manager, owner, and accountant if enabled)
  const clinicStaffUsers = users.filter((usr) => {
    const validClinicRoles: UserRole[] = ['dentist', 'receptionist', 'manager', 'owner'];
    if (hasAccountantRole) {
      validClinicRoles.push('accountant');
    }
    return validClinicRoles.includes(usr.role);
  });

  // Single-Doctor / Multi-Doctor Mode derived automatically from clinic dentist count
  const dentistCount = clinicStaffUsers.filter((u) => u.role === 'dentist').length;
  const isMultiDoctorClinic = dentistCount > 1;

  // Sent SMS reminder tracking
  const [sentReminderIds, setSentReminderIds] = useState<string[]>([]);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Mock Overdue Installments
  const [overdueInstallments, setOverdueInstallments] = useState([
    { id: 'inst-1', patientName: 'رضا کریمی', nationalId: '۱۲۷۰۵۹۸۸۳۱', phone: '۰۹۱۲۴۴۴۳۳۲۲', amount: 3500000, dueDate: '۱۴۰۵/۰۵/۱۵', daysOverdue: 5, status: 'pending' },
    { id: 'inst-2', patientName: 'مریم احمدی', nationalId: '۰۰۱۹۸۸۳۷۴۶', phone: '۰۹۳۵۶۶۶۷۷۸۸', amount: 5000000, dueDate: '۱۴۰۵/۰۵/۱۰', daysOverdue: 10, status: 'pending' },
    { id: 'inst-3', patientName: 'کاوه رضایی', nationalId: '۴۹۱۰۲۹۳۸۴۷', phone: '۰۹۱۹۳۳۳۲۲۱۱', amount: 2800000, dueDate: '۱۴۰۵/۰۵/۰۲', daysOverdue: 18, status: 'pending' },
  ]);

  // Mock Cash Blockers
  const [cashBlockers, setCashBlockers] = useState([
    { id: 'blk-1', patientName: 'حسین سلیمانی', code: 'P-104', reason: 'عدم واریز پیش‌پرداخت مرحله دوم عصب‌کشی', amount: 4200000, status: 'blocked' },
    { id: 'blk-2', patientName: 'سارا باقری', code: 'P-209', reason: 'بدهی تسویه‌نشده درمان روکش دندان قبلی', amount: 6800000, status: 'blocked' },
  ]);

  // Mock Invoiced Details Today (for Cash Board Stat Card 1)
  const todayInvoicedList = [
    { id: 'inv-101', patient: 'امیرحسین صادقی', dentist: 'دکتر کاویانی', treatment: 'عصب‌کشی ۳ کانال + پرکردن', totalAmount: 8500000, payType: 'کارتخوان / POS', time: '۰۹:۳۰', status: 'تسویه‌شده' },
    { id: 'inv-102', patient: 'سارا رضایی', dentist: 'دکتر شریفی', treatment: 'ایمپلنت دندان خلفی (مرحله ۱)', totalAmount: 18000000, payType: 'ترکیبی (نقد + اقساط)', time: '۱۰:۱۵', status: 'در حال پرداخت' },
    { id: 'inv-103', patient: 'رضا موسوی', dentist: 'دکتر کاویانی', treatment: 'جرم‌گیری و بلیچینگ دو فک', totalAmount: 4500000, payType: 'کارتخوان / POS', time: '۱۱:۴۵', status: 'تسویه‌شده' },
    { id: 'inv-104', patient: 'زهرا نوری', dentist: 'دکتر شریفی', treatment: 'ترمیم کامپوزیت زیبایی', totalAmount: 6400000, payType: 'وجه نقد صندوق', time: '۱۲:۲۰', status: 'تسویه‌شده' },
    { id: 'inv-105', patient: 'مهدی قاسمی', dentist: 'دکتر کاویانی', treatment: 'روکش سرامیکی زارکونیا', totalAmount: 8400000, payType: 'کارتخوان / POS', time: '۱۳:۱۰', status: 'تسویه‌شده' },
  ];

  // Mock Cash Receipts Today (for Cash Board Stat Card 2)
  const todayCashList = [
    { id: 'csh-201', receiptNo: 'CSH-8801', patient: 'زهرا نوری', receptionist: 'مریم ابراهیمی (پذیرش اول)', amount: 6400000, time: '۱۲:۲۰', notes: 'دریافت وجه نقد جهت ترمیم زیبایی' },
    { id: 'csh-202', receiptNo: 'CSH-8802', patient: 'سارا رضایی', receptionist: 'مریم ابراهیمی (پذیرش اول)', amount: 3000000, time: '۱۰:۱۵', notes: 'پیش‌پرداخت نقد ایمپلنت' },
    { id: 'csh-203', receiptNo: 'CSH-8803', patient: 'محمد اکبری', receptionist: 'علی حسینی (پذیرش عصر)', amount: 3000000, time: '۱۴:۳۰', notes: 'تسویه نقد ویزیت و عکس RVG' },
  ];

  // Mock POS Terminal Transactions Today (for Cash Board Stat Card 3)
  const todayPosList = [
    { id: 'pos-301', terminal: 'پایانه ۱ (ناپ - بانک ملی)', traceNo: '۷۸۴۹۲۰', patient: 'امیرحسین صادقی', cardLast4: '۴۵۲۱', amount: 8500000, time: '۰۹:۳۰' },
    { id: 'pos-302', terminal: 'پایانه ۲ (رویا - بانک سامان)', traceNo: '۳۳۰۹۱۲', patient: 'سارا رضایی', cardLast4: '۸۸۹۰', amount: 5000000, time: '۱۰:۱۸' },
    { id: 'pos-303', terminal: 'پایانه ۱ (ناپ - بانک ملی)', traceNo: '۹۹۲۱۰۴', patient: 'رضا موسوی', cardLast4: '۱۲۴۳', amount: 4500000, time: '۱۱:۴۶' },
    { id: 'pos-304', terminal: 'پایانه ۱ (ناپ - بانک ملی)', traceNo: '۶۶۷۱۸۲', patient: 'مهدی قاسمی', cardLast4: '۷۷۰۱', amount: 7400000, time: '۱۳:۱۲' },
    { id: 'pos-305', terminal: 'پایانه ۲ (رویا - بانک سامان)', traceNo: '۱۱۰۴۸۲', patient: 'فاطمه رستمی', cardLast4: '۳۰۹۹', amount: 8000000, time: '۱۴:۰۵' },
  ];

  // Mock Breakdown for Insurance Total Receivables Modal
  const insuranceBreakdownList = [
    { id: 'ins-1', company: 'بیمه درمان تکمیلی دانا', count: 12, amount: 112000000, avgDays: '۲ روز (۴۸ ساعت)', status: 'مسیر سبز - واریز مستقیم' },
    { id: 'ins-2', company: 'بیمه ایران', count: 8, amount: 86500000, avgDays: '۲.۵ روز (۵۵ ساعت)', status: 'در حال تسویه' },
    { id: 'ins-3', company: 'بیمه البرز', count: 5, amount: 50000000, avgDays: '۱.۵ روز (۳۶ ساعت)', status: 'مسیر سبز - واریز مستقیم' },
  ];

  // Mock Returned Insurance Claims Modal
  const returnedClaimsList = [
    { id: 'ret-101', patient: 'محمد صادقی', dentist: 'دکتر کاویانی', insurer: 'بیمه دانا', amount: 3800000, reason: 'عدم وضوح تصویر RVG قبل از درمان عصب‌کشی', date: '۱۴۰۵/۰۵/۱۰' },
    { id: 'ret-102', patient: 'سمیرا موسوی', dentist: 'دکتر شریفی', insurer: 'بیمه ایران', amount: 6200000, reason: 'نیاز به ارائه گزارش جراحی پاتولوژی روکش', date: '۱۴۰۵/۰۵/۱۱' },
  ];

  // Mock Rejected Insurance Claims Modal
  const rejectedClaimsList = [
    { id: 'rej-201', patient: 'کیوان رحیمی', dentist: 'دکتر کاویانی', insurer: 'بیمه دانا', amount: 8200000, reason: 'اتمام سقف تعهدات سالانه بیمه‌شده', date: '۱۴۰۵/۰۵/۰۲' },
    { id: 'rej-202', patient: 'نرگس نوری', dentist: 'دکتر شریفی', insurer: 'بیمه البرز', amount: 6000000, reason: 'عدم انطباق کد FDI با جدول استثنائات بیمه‌گر', date: '۱۴۰۵/۰۵/۰۵' },
  ];

  // Toast Notification Helper
  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // Excel Export Simulation with actual CSV File Download
  const handleExportExcel = () => {
    const headers = ['ردیف', 'عنوان / نام', 'دسته مالی', 'مبلغ (ریال)', 'تاریخ ثبت', 'وضعیت انطباق'];
    const rows = [
      ['۱', 'درآمد کل روز (فاکتورشده)', 'درآمد کلینیک', '۴۵۸۰۰۰۰۰۰', '۱۴۰۵/۰۵/۱۳', 'منطبق'],
      ['۲', 'ورودی نقد صندوق', 'نقدینگی', '۱۲۴۰۰۰۰۰۰', '۱۴۰۵/۰۵/۱۳', 'منطبق'],
      ['۳', 'پایانه ۱ کارتخوان POS (ناپ)', 'بانک ملی', '۲۰۴۰۰۰۰۰۰', '۱۴۰۵/۰۵/۱۳', 'تسویه‌شده'],
      ['۴', 'پایانه ۲ کارتخوان POS (رویا)', 'بانک سامان', '۱۳۰۰۰۰۰۰۰', '۱۴۰۵/۰۵/۱۳', 'تسویه‌شده'],
      ['۵', 'مطالبات بیمه‌ای کلینیک', 'بیمه‌گر تکمیلی', '۲۴۸۵۰۰۰۰۰۰', '۱۴۰۵/۰۵/۱۳', 'در مسیر سبز ۴۹:۳۰ ساعت'],
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `گزارش_مالی_و_حسابرسی_دنتورا_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('گزارش کامل مالی و حسابرسی اکسل با موفقیت دانلود شد.');
  };

  // Handle Employee Creation
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      name: empName,
      role: empRole,
      nationalId: empNationalId || '۰۰۱۱۲۲۳۳۴۴',
      phone: empPhone || '۰۹۱۲۰۰۰۰۰۰۰',
      branchIds: ['br-1'],
      commissionRate: empRole === 'dentist' ? empCommission : undefined,
    };

    onAddEmployee(newUser);
    setIsEmployeeModalOpen(false);
    setEmpName('');
    setEmpNationalId('');
    setEmpPhone('');
    showToast(`کارمند جدید (${empName}) با موفقیت به لیست پرسنل اضافه گردید.`);
  };

  // Handle Confirm Delete Employee
  const handleConfirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    if (onDeleteEmployee) {
      onDeleteEmployee(employeeToDelete.id);
    }
    showToast(`پرونده پرسنل (${employeeToDelete.name}) با موفقیت حذف گردید.`);
    setEmployeeToDelete(null);
  };

  // Interactive SMS Reminder Handler
  const handleSendReminder = (instId: string, patientName: string, phone: string) => {
    if (!sentReminderIds.includes(instId)) {
      setSentReminderIds((prev) => [...prev, instId]);
    }
    showToast(`پیامک یادآوری قسط معوقه به شماره ${phone} (${patientName}) ارسال گردید.`);
  };

  // Resolve Cash Blocker
  const handleResolveBlocker = (id: string, name: string) => {
    setCashBlockers((prev) => prev.filter((b) => b.id !== id));
    showToast(`پرونده مالی ${name} تعیین تکلیف شد و مسدودی برطرف گردید.`);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification Bar */}
      {notificationToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#005581] text-white px-5 py-3 rounded-2xl shadow-xl border border-sky-400 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs font-bold">{notificationToast}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-[#005581] text-[#fffffa] rounded-2xl p-5 shadow-lg border border-[#72cdf4]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-[#005581] text-[#ffd200] border border-[#72cdf4]/40 text-[11px] font-extrabold">
              پنل مدیر و مالک کلینیک
            </span>
            <span className="px-2 py-0.5 rounded bg-[#72cdf4]/20 text-[#fffffa] text-[11px]">
              {insuranceModuleActive ? 'حالت با حضور بیمه (اتصال و تسویه)' : 'حالت مستقل کلینیک (بدون بیمه)'}
            </span>
          </div>
          <h2 className="text-xl font-black text-[#fffffa] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#ffd200]" />
            <span>میزکار مدیریت کلینیک دندان‌پزشکی</span>
          </h2>
          <p className="text-xs text-[#72cdf4]/90 mt-0.5">
            نظارت بر عملکرد روزانه، منابع انسانی، کارانه پزشکان، درآمد کلینیک و مطالبات تسویه‌ای
          </p>
        </div>

        {/* OWNER SETTING TOGGLE */}
        <div className="p-3 rounded-xl bg-[#005581]/80 border border-[#72cdf4]/30 text-xs space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-3 text-[#fffffa]">
            <span className="font-extrabold">ماژول بیمه کلینیک:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${insuranceModuleActive ? 'bg-[#72cdf4]/30 text-[#fffffa]' : 'bg-[#ffd200]/30 text-[#ffd200]'}`}>
              {insuranceModuleActive ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          <button
            onClick={onToggleInsuranceModule}
            className={`w-full px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
              insuranceModuleActive
                ? 'bg-[#ffd200] hover:bg-[#ffe552] text-[#005581]'
                : 'bg-[#72cdf4] hover:bg-[#72cdf4]/90 text-[#005581]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#005581]" />
            <span>{insuranceModuleActive ? 'غیرفعال‌سازی ماژول بیمه' : 'فعال‌سازی ماژول بیمه کلینیک'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MAIN LAYOUT WITH RIGHT SIDEBAR MENU                       */}
      {/* ========================================================== */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* RIGHT SIDEBAR MENU */}
        <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black text-[#005581] dark:text-sky-400 uppercase tracking-wider mb-1">
              منوی مدیریتی کلینیک
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              دسترسی سریع به بخش‌های اجرایی و مالی
            </p>
          </div>

          {/* MENU SECTION 1: CORE CLINIC MANAGEMENT (NO INSURANCE) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
              مدیریت و مالی (بدون حضور بیمه)
            </span>

            <button
              onClick={() => setActiveTab('cash_board')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'cash_board'
                  ? 'bg-[#005581] text-[#fffffa] shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className={`w-4 h-4 ${activeTab === 'cash_board' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>تابلوی پول امروز</span>
              </div>
              <ChevronLeft className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#005581] text-[#fffffa] shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>داشبورد تحلیلی و گزارش‌ها</span>
              </div>
              <ChevronLeft className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-[#005581] text-[#fffffa] shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'staff' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>مدیریت منابع انسانی و پرسنل</span>
              </div>
              <ChevronLeft className="w-4 h-4 opacity-70" />
            </button>
          </div>

          {/* MENU SECTION 2: INSURANCE & SETTLEMENT (DYNAMICALLY SHOWN ONLY IF INSURANCE IS ACTIVE) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-[#005581] dark:text-[#72cdf4] px-2 block mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#005581]" />
              <span>امور مدیریت (با حضور بیمه)</span>
            </span>

            {insuranceModuleActive ? (
              <>
                <button
                  onClick={() => setActiveTab('insurance_receivables')}
                  className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                    activeTab === 'insurance_receivables'
                      ? 'bg-[#005581] text-[#fffffa] shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${activeTab === 'insurance_receivables' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                    <span>مطالبات بیمه‌ای و کانبان</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-70" />
                </button>

                <button
                  onClick={() => setActiveTab('green_lane')}
                  className={`w-full text-right px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-between cursor-pointer ${
                    activeTab === 'green_lane'
                      ? 'bg-[#005581] text-[#fffffa] shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className={`w-4 h-4 ${activeTab === 'green_lane' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                    <span>پایش تسویه سریع و گزارش تفکیکی</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-70" />
                </button>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-400 text-[11px] space-y-1">
                <div className="font-bold text-slate-500 dark:text-slate-300">منوهای بیمه غیرفعال است</div>
                <p>جهت دسترسی به گزارش‌ها و مطالبات بیمه‌ای، ماژول بیمه را از دکمه بالا فعال کنید.</p>
              </div>
            )}
          </div>

          {/* MENU SECTION 3: OWNER SETTINGS (FOR OWNER ROLE) */}
          {isOwner && (
            <div className="pt-2 border-t border-amber-300/40 dark:border-amber-800/40 space-y-1">
              <span className="text-[10px] font-bold text-[#005581] dark:text-[#ffd200] px-2 block mb-1 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-[#ffd200]" />
                <span>ویژه مالک کلینیک (Owner)</span>
              </span>

              <button
                onClick={() => setActiveTab('owner_settings')}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'owner_settings'
                    ? 'bg-[#ffd200] text-[#005581] shadow-md ring-2 ring-[#ffd200]/50'
                    : 'bg-amber-500/10 text-[#005581] dark:text-[#ffd200] hover:bg-amber-500/20 border border-amber-400/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Crown className={`w-4 h-4 ${activeTab === 'owner_settings' ? 'text-[#005581]' : 'text-[#ffd200]'}`} />
                  <span>تنظیمات و دسترسی‌های مالک</span>
                </div>
                <ChevronLeft className="w-4 h-4 opacity-70" />
              </button>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 w-full space-y-5">
          {/* ========================================================== */}
          {/* TAB 1: TODAY'S CASH & RCM DASHBOARD (WITHOUT INSURANCE)    */}
          {/* ========================================================== */}
          {activeTab === 'cash_board' && (
            <div className="space-y-5">
              {/* 3 Clickable Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CARD 1: INVOICED REVENUE TODAY */}
                <div
                  onClick={() => {
                    setActiveModalCard('invoiced');
                    setModalSearchQuery('');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#005581] dark:hover:border-sky-500 transition cursor-pointer group space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                    <span className="font-bold group-hover:text-[#005581] dark:group-hover:text-sky-400 transition">
                      درآمد کل روز (حجم فاکتورشده)
                    </span>
                    <DollarSign className="w-4 h-4 text-[#005581]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                    {formatPricePersian(45800000)}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>۱۲٪ رشد نسبت به دیروز</span>
                    </span>
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                      <span>مشاهده جزئیات</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* CARD 2: CASH RECEIVED TODAY */}
                <div
                  onClick={() => {
                    setActiveModalCard('cash');
                    setModalSearchQuery('');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#005581] dark:hover:border-[#72cdf4] transition cursor-pointer group space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                    <span className="font-bold group-hover:text-[#005581] dark:group-hover:text-[#72cdf4] transition">
                      وجوه نقد دریافتی امروز
                    </span>
                    <Wallet className="w-4 h-4 text-[#005581]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                    {formatPricePersian(12400000)}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      ورودی نقد صندوق
                    </span>
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                      <span>مشاهده جزئیات</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* CARD 3: POS CARD READER TRANSACTIONS */}
                <div
                  onClick={() => {
                    setActiveModalCard('pos');
                    setModalSearchQuery('');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#005581] dark:hover:border-[#72cdf4] transition cursor-pointer group space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                    <span className="font-bold group-hover:text-[#005581] dark:group-hover:text-[#72cdf4] transition">
                      تراکنش‌های دستگاه کارتخوان (POS)
                    </span>
                    <CreditCard className="w-4 h-4 text-[#005581]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                    {formatPricePersian(33400000)}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-mono truncate max-w-[170px]">
                      پایانه ۱ (ناپ): ۲۰.۴م | پایانه ۲ (رویا): ۱۳م
                    </span>
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100 shrink-0">
                      <span>مشاهده جزئیات</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Overdue Installments Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#005581]" />
                      <span>اقساط سررسیدگذشته و معوقه بیماران</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      رصد مطالبات معوق اقساطی کلینیک جهت پیگیری تلفنی و ارسال پیامک یادآوری
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#ffe552] text-[#005581] font-extrabold text-xs font-mono">
                    {toPersianDigits(overdueInstallments.length)} بیمار در تاخیر
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">نام بیمار</th>
                        <th className="py-2.5 px-3">کد ملی</th>
                        <th className="py-2.5 px-3">شماره تماس</th>
                        <th className="py-2.5 px-3">مبلغ قسط معوقه</th>
                        <th className="py-2.5 px-3">تاریخ سررسید</th>
                        <th className="py-2.5 px-3">روزهای تاخیر</th>
                        <th className="py-2.5 px-3 text-center">اقدام پیگیری</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {overdueInstallments.map((inst) => {
                        const isSent = sentReminderIds.includes(inst.id);
                        return (
                          <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{inst.patientName}</td>
                            <td className="py-3 px-3 font-mono">{inst.nationalId}</td>
                            <td className="py-3 px-3 font-mono">{inst.phone}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                              {formatPricePersian(inst.amount)}
                            </td>
                            <td className="py-3 px-3 font-mono">{inst.dueDate}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-[#ffe552]/40 text-[#005581] font-bold font-mono text-[11px]">
                                {toPersianDigits(inst.daysOverdue)} روز تاخیر
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isSent ? (
                                <span className="px-3 py-1.5 rounded-lg bg-[#72cdf4]/20 text-[#005581] font-bold text-[11px] inline-flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-[#005581]" />
                                  <span>پیامک ارسال شد</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSendReminder(inst.id, inst.patientName, inst.phone)}
                                  className="px-3 py-1.5 rounded-lg bg-[#005581] hover:bg-[#004468] text-[#fffffa] font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Send className="w-3 h-3 text-[#ffd200]" />
                                  <span>ارسال پیامک پیگیری</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cash Blockers / Financial Bottlenecks */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#005581]" />
                      <span>پرونده‌های مسدودکنندهٔ پول و تعویق مالی</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      پرونده‌هایی که به دلیل عدم واریز پیش‌پرداخت یا بدهی تسویه‌نشده، ادامه درمان را متوقف کرده‌اند
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cashBlockers.map((blk) => (
                    <div
                      key={blk.id}
                      className="p-4 rounded-xl border border-[#ffd200] bg-[#ffe552]/20 text-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {blk.patientName} (کد: {blk.code})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#ffd200] text-[#005581] font-bold text-[10px]">
                            نیازمند تسویه
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">
                          علت توقف: <strong>{blk.reason}</strong>
                        </p>
                        <div className="text-slate-600 dark:text-slate-400 font-mono">
                          مبلغ معوق: <strong className="text-[#005581] dark:text-[#72cdf4] font-bold">{formatPricePersian(blk.amount)}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#ffd200]/40 flex items-center justify-end">
                        <button
                          onClick={() => handleResolveBlocker(blk.id, blk.patientName)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#005581] hover:bg-[#004468] text-[#fffffa] font-bold text-[11px] transition cursor-pointer"
                        >
                          بررسی و رفع مسدودی
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: ANALYTICS & REPORTS (WITHOUT INSURANCE)            */}
          {/* ========================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-5">
              {/* Patient Flow & Recall Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 lg:col-span-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#005581]" />
                    <span>آمار مراجعین کلینیک (امروز)</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>بیماران جدید (نخستین مراجعه):</span>
                        <strong className="font-mono text-[#005581] dark:text-sky-400 text-sm">{toPersianDigits(18)} نفر (۳۰٪)</strong>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#005581] h-full w-[30%]"></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>بیماران بازگشتی (پیگیری درمان):</span>
                        <strong className="font-mono text-[#005581] dark:text-[#72cdf4] text-sm">{toPersianDigits(42)} نفر (۷۰٪)</strong>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#005581] h-full w-[70%]"></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#ffe552]/30 border border-[#ffd200] text-[#005581] flex justify-between font-bold">
                      <span>مجموع پذیرش امروز:</span>
                      <span className="font-mono">{toPersianDigits(60)} نوبت بیمار</span>
                    </div>
                  </div>
                </div>

                {/* Staff & Chair Productivity */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 lg:col-span-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#005581]" />
                    <span>بهره‌وری یونیت‌های دندان‌پزشکی و پرسنل</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>یونیت ۱ (دکتر کاویانی):</span>
                        <span className="text-[#005581] dark:text-[#72cdf4] font-mono">۹۲٪ بهره‌وری</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">کارکرد: ۷.۵ ساعت فعال از ۸ ساعت کاری</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>یونیت ۲ (دکتر شریفی):</span>
                        <span className="text-[#005581] dark:text-[#72cdf4] font-mono">۸۸٪ بهره‌وری</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">کارکرد: ۷ ساعت فعال از ۸ ساعت کاری</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>یونیت ۳ (جرم‌گیری و بهداشت):</span>
                        <span className="text-[#005581] dark:text-[#72cdf4] font-mono">۷۸٪ بهره‌وری</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">کارکرد: ۶.۲ ساعت فعال</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>یونیت ۴ (جراحی و ایمپلنت):</span>
                        <span className="text-[#005581] dark:text-[#72cdf4] font-mono">۸۲٪ بهره‌وری</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">کارکرد: ۶.۵ ساعت فعال</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Register & POS Reconciliation */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#005581]" />
                      <span>بستن صندوق روزانه و مغایرت‌گیری دستگاه کارتخوان (POS)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      انطباق سیستم حسابداری کلینیک با تراکنش‌های فیزیکی دستگاه‌های پوز
                    </p>
                  </div>

                  <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004468] text-[#fffffa] font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#ffd200]" />
                    <span>دریافت خروجی Excel حسابرسی</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#72cdf4]/15 border border-[#72cdf4]/40 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#005581] font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#005581]" />
                      <span>نتیجه مغایرت‌گیری خودکار امروز:</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#005581] text-[#fffffa] font-extrabold font-mono text-[11px]">
                      ۰ ریال مغایرت (منطبق کامل)
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    مجموع تراکنش‌های ثبت‌شده در سیستم ({formatPricePersian(33400000)}) دقیقاً با رسیدهای الکترونیک پایانه فروش POS انطباق دارد.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: STAFF MANAGEMENT & DOCTOR COMMISSION (WITHOUT INSURANCE) */}
          {/* ========================================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-5">
              {/* Dynamic Clinic Structure Indicator (Automatically based on dentist count) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      ساختار سازمانی مرکز درمانی (تعیین هوشمند بر اساس پرسنل):
                    </span>
                    {isMultiDoctorClinic ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#72cdf4]/20 text-[#005581] font-extrabold text-[11px] border border-[#72cdf4]/50 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#005581]" />
                        <span>کلینیک چندپزشکه ({toPersianDigits(dentistCount)} دندان‌پزشک فعال)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#fffffa] text-[#005581] font-extrabold text-[11px] border border-[#005581]/30 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#005581]" />
                        <span>مطب تک‌پزشک / تک‌منشی ({toPersianDigits(dentistCount)} دندان‌پزشک)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isMultiDoctorClinic
                      ? 'به دلیل حضور بیش از یک دندان‌پزشک در پرسنل، سیستم به صورت خودکار در حالت کلینیک چندپزشکه قرار دارد و درصد دریافتی (کارانه) فعال است.'
                      : 'به دلیل حضور یک دندان‌پزشک در لیست پرسنل، سیستم در حالت مطب تک‌پزشک قرار دارد. با ثبت پزشک جدید، حالت چندپزشکه خودکار فعال می‌شود.'}
                  </p>
                </div>
              </div>

              {/* Staff Table & Commission Settings */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#005581]" />
                    <span>فهرست پرسنل و تنظیم درصد دریافتی (کارانه) پزشکان</span>
                  </h3>

                  <button
                    onClick={() => setIsEmployeeModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004468] text-[#fffffa] font-bold text-xs shadow transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-[#ffd200]" />
                    <span>ثبت استخدام کارمند / پزشک جدید</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">نام و نام خانوادگی</th>
                        <th className="py-2.5 px-3">نقش سازمانی</th>
                        <th className="py-2.5 px-3">کد ملی</th>
                        <th className="py-2.5 px-3">تلفن همراه</th>
                        <th className="py-2.5 px-3">درصد کارانه پزشک (سهم دریافتی)</th>
                        <th className="py-2.5 px-3">وضعیت همکاری</th>
                        <th className="py-2.5 px-3 text-center">حذف پرسنل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {clinicStaffUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{usr.name}</td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[11px]">
                              {usr.role === 'dentist'
                                ? 'دندان‌پزشک معالج'
                                : usr.role === 'receptionist'
                                ? 'منشی / پذیرش'
                                : usr.role === 'accountant'
                                ? 'حسابدار / مدیر مالی'
                                : usr.role === 'manager' || usr.role === 'owner'
                                ? 'مدیریت کلینیک'
                                : usr.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono">{toPersianDigits(usr.nationalId)}</td>
                          <td className="py-3 px-3 font-mono">{toPersianDigits(usr.phone)}</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                            {usr.role === 'dentist' && isMultiDoctorClinic ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={usr.commissionRate || 45}
                                  onChange={(e) => onUpdateDoctorCommission(usr.id, Number(e.target.value))}
                                  className="w-16 px-2 py-1 rounded-lg border border-[#005581]/30 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-center focus:border-[#005581]"
                                />
                                <span>٪ درصد کارانه</span>
                              </div>
                            ) : (
                              'حقوق ثابت / بدون درصد'
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#72cdf4]/20 text-[#005581] font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#005581]"></span>
                              <span>فعال</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => setEmployeeToDelete(usr)}
                              className="p-1.5 rounded-lg bg-[#ffe552]/30 text-[#005581] hover:bg-[#ffd200]/50 transition cursor-pointer"
                              title="حذف پرسنل"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: INSURANCE RECEIVABLES & KANBAN (WITH INSURANCE)     */}
          {/* ========================================================== */}
          {activeTab === 'insurance_receivables' && insuranceModuleActive && (
            <div className="space-y-5">
              {/* 3 Clickable Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CARD 1: Total Receivables */}
                <div
                  onClick={() => {
                    setActiveInsuranceModalCard('total_receivables');
                    setModalSearchQuery('');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#005581] dark:hover:border-[#72cdf4] transition cursor-pointer group space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold group-hover:text-[#005581] transition">
                    <span>مجموع مطالبات کلینیک از بیمه‌گر:</span>
                    <DollarSign className="w-4 h-4 text-[#005581]" />
                  </div>
                  <div className="text-xl font-black text-[#005581] dark:text-[#72cdf4] font-mono">
                    {formatPricePersian(248500000)}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400 truncate">شامل بیمه دانا، ایران و البرز</span>
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100 shrink-0">
                      <span>مشاهده جزئیات</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* CARD 2: Returned Claims */}
                <div
                  onClick={() => {
                    setActiveInsuranceModalCard('returned_claims');
                    setModalSearchQuery('');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#ffd200] transition cursor-pointer group space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold group-hover:text-[#005581] transition">
                    <span>پرونده‌های بیمه‌ای برگشت‌خورده:</span>
                    <AlertTriangle className="w-4 h-4 text-[#005581]" />
                  </div>
                  <div className="text-xl font-black text-[#005581] dark:text-[#72cdf4] font-mono">
                    {toPersianDigits(2)} پرونده
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#005581] font-bold">نیازمند بررسی پرونده</span>
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100 shrink-0">
                      <span>مشاهده جزئیات</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* CARD 3: Settlement Timeline */}
                <div
                  onClick={() => {
                    setActiveInsuranceModalCard('settlement_timeline');
                    setModalSearchQuery('');
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#005581] transition cursor-pointer group space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold group-hover:text-[#005581] transition">
                    <span>میانگین زمان تسویه بیمه‌ها:</span>
                    <Clock className="w-4 h-4 text-[#005581]" />
                  </div>
                  <div className="text-xl font-black text-[#005581] dark:text-[#72cdf4] font-mono">
                    {toPersianDigits('۴۹:۳۰')} ساعت
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold">تسویه سریع فعال است</span>
                    <span className="text-[#005581] dark:text-[#72cdf4] font-bold underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100 shrink-0">
                      <span>مشاهده جزئیات</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanban Supervision (4 columns) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#005581]" />
                  <span>نظارت بر برد کانبان چرخه تسویه مطالبات بیمه‌ای</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Column 1: Drafts */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between font-bold border-b border-slate-200 dark:border-slate-700 pb-2.5 text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#005581]" />
                        <span>۱. پیش‌نویس ادعا</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold">{toPersianDigits(4)} پرونده</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">پرونده عصب‌کشی - علی حسینی</div>
                      <div className="text-[#005581] dark:text-[#72cdf4] font-mono font-bold text-[11px]">{formatPricePersian(3200000)}</div>
                      <div className="text-[10px] text-slate-400">بیمه دانا - دندان شماره ۳۶ (FDI)</div>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">ترمیم کامپوزیت - زهرا رضایی</div>
                      <div className="text-[#005581] dark:text-[#72cdf4] font-mono font-bold text-[11px]">{formatPricePersian(4500000)}</div>
                      <div className="text-[10px] text-slate-400">بیمه ایران - در انتظار امضای WORM</div>
                    </div>
                  </div>

                  {/* Column 2: Submitted to Insurer */}
                  <div className="p-4 rounded-xl bg-[#72cdf4]/10 border border-[#72cdf4]/40 space-y-3">
                    <div className="flex justify-between font-bold border-b border-[#72cdf4]/30 pb-2.5 text-[#005581] dark:text-[#72cdf4]">
                      <span className="flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-[#005581]" />
                        <span>۲. ارسال‌شده به بیمه‌گر</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#72cdf4]/20 font-mono font-bold">{toPersianDigits(12)} پرونده</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">بسته فاکتورهای بیمه دانا</div>
                      <div className="text-[#005581] font-mono font-bold text-[11px]">{formatPricePersian(112000000)}</div>
                      <div className="text-[10px] text-slate-400">ارسال الکترونیک مستقیم - تسویه سریع</div>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">ادعاهای درمان بیمه البرز</div>
                      <div className="text-[#005581] font-mono font-bold text-[11px]">{formatPricePersian(50000000)}</div>
                      <div className="text-[10px] text-slate-400">ممیزی شده توسط هوش مصنوعی</div>
                    </div>
                  </div>

                  {/* Column 3: Approved & Settled */}
                  <div className="p-4 rounded-xl bg-[#005581]/10 border border-[#005581]/30 space-y-3">
                    <div className="flex justify-between font-bold border-b border-[#005581]/30 pb-2.5 text-[#005581] dark:text-[#72cdf4]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#005581]" />
                        <span>۳. تایید و واریز شده</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#005581] text-[#fffffa] font-mono font-bold">{toPersianDigits(28)} پرونده</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">واریز مستقیم شبای کلینیک</div>
                      <div className="text-[#005581] dark:text-[#72cdf4] font-mono font-bold text-[11px]">{formatPricePersian(86500000)}</div>
                      <div className="text-[10px] text-[#005581] font-bold">تسویه سریع ظرف ۳۶ ساعت انجام شد</div>
                    </div>
                  </div>

                  {/* Column 4: Rejected Claims & Deductions */}
                  <div className="p-4 rounded-xl bg-[#ffe552]/20 border border-[#ffd200]/50 space-y-3">
                    <div className="flex justify-between font-bold border-b border-[#ffd200]/50 pb-2.5 text-[#005581]">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-[#005581]" />
                        <span>۴. پرونده‌های ردشده و کسورات</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[#ffd200] text-[#005581] font-mono font-bold">{toPersianDigits(2)} پرونده</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">پرونده ایمپلنت - کیوان رحیمی</div>
                      <div className="text-[#005581] dark:text-[#72cdf4] font-mono font-bold text-[11px]">{formatPricePersian(8200000)}</div>
                      <div className="text-[10px] text-slate-400">بیمه ایران - عدم پوشش سقف تعهد تکمیلی</div>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">پرونده روکش - نرگس نوری</div>
                      <div className="text-[#005581] dark:text-[#72cdf4] font-mono font-bold text-[11px]">{formatPricePersian(6000000)}</div>
                      <div className="text-[10px] text-slate-400">بیمه دانا - کسر شده به دلیل انقضای گرافی</div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveInsuranceModalCard('rejected_claims');
                        setModalSearchQuery('');
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#005581] hover:bg-[#004468] text-[#fffffa] font-bold text-[11px] transition text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>ریز پرونده‌های کسرشده ({formatPricePersian(14200000)})</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: FAST SETTLEMENT & MULTI-PAYER MERGED                */}
          {/* ========================================================== */}
          {activeTab === 'green_lane' && insuranceModuleActive && (
            <div className="space-y-5">
              {/* MERGED: Multi-Payer Breakdown Panel (3-Sided Invoice) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#005581]" />
                    <span>گزارش‌های مالی تفکیک‌شده (سه ضلع فاکتور درمان)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    تفکیک دقیق سه ضلع فاکتور درمان: سهم بیمه پایه، سهم بیمه تکمیلی و سهم پرداختی فرانشیز بیمار
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#72cdf4]/15 border border-[#72cdf4] space-y-2">
                    <div className="flex justify-between font-bold text-[#005581] dark:text-[#72cdf4]">
                      <span>۱. سهم بیمه پایه:</span>
                      <span className="font-mono text-sm">۱۵٪</span>
                    </div>
                    <div className="text-lg font-black font-mono text-[#005581] dark:text-[#72cdf4]">
                      {formatPricePersian(6870000)}
                    </div>
                    <div className="w-full bg-[#72cdf4]/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#005581] h-full w-[15%]"></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#005581]/10 border border-[#005581] space-y-2">
                    <div className="flex justify-between font-bold text-[#005581] dark:text-[#72cdf4]">
                      <span>۲. سهم بیمه تکمیلی:</span>
                      <span className="font-mono text-sm">۶۵٪</span>
                    </div>
                    <div className="text-lg font-black font-mono text-[#005581] dark:text-[#72cdf4]">
                      {formatPricePersian(29770000)}
                    </div>
                    <div className="w-full bg-[#005581]/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#005581] h-full w-[65%]"></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#ffe552]/30 border border-[#ffd200] space-y-2">
                    <div className="flex justify-between font-bold text-[#005581]">
                      <span>۳. سهم پرداختی فرانشیز بیمار:</span>
                      <span className="font-mono text-sm">۲۰٪</span>
                    </div>
                    <div className="text-lg font-black font-mono text-[#005581]">
                      {formatPricePersian(9160000)}
                    </div>
                    <div className="w-full bg-[#ffd200]/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#005581] h-full w-[20%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAST SETTLEMENT MONITORING & TRUST SCORECARD (DISPLAY ONLY, NO TOGGLE BUTTONS) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#005581]" />
                      <span>پایش برنامهٔ تسویه سریع و نردبان اعتماد کلینیک</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      وضعیت سطح اعتماد کلینیک و معیارهای الزامی تسویه مستقیم و واریز ۴۸ ساعته
                    </p>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-[#005581] border border-[#72cdf4]/40 text-[#ffd200] font-extrabold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                    <span>سطح اعتماد فعلی: L4 (تسویه سریع کامل - ۴۹:۳۰ ساعت)</span>
                  </span>
                </div>

                {/* Status & Criteria Explanation Box */}
                <div className="p-4 rounded-xl bg-[#72cdf4]/15 border border-[#72cdf4]/40 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#005581] dark:text-[#72cdf4] text-sm">
                    <Info className="w-5 h-5 text-[#005581] shrink-0" />
                    <span>علت تخصیص سطح L4 و تسویه سریع ۴۹:۳۰ ساعته برای کلینیک شما:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    کلینیک شما به دلیل رعایت ۱۰۰٪ ضوابط پنج‌گانه شفافیت مالی (احراز هویت آنلاین، ثبت کد FDI دندان، آپلود گرافی RVG قبل/بعد درمان، انطباق کامل POS و امضای دیجیتال WORM پزشک) در بالاترین سطح اعتماد قرار دارد. واریز وجه مستقیم به شماره شبای کلینیک ظرف ۴۹:۳۰ ساعت بدون نیاز به ارسال فیزیکی مدارک انجام می‌شود.
                  </p>
                </div>

                {/* Levels & Guidelines Box (Expandable / Collapsible) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsLevelGuideOpen(!isLevelGuideOpen)}
                    className="w-full flex items-center justify-between font-extrabold text-slate-900 dark:text-slate-100 text-sm cursor-pointer select-none text-right hover:text-[#005581] dark:hover:text-[#72cdf4] transition"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#005581] shrink-0" />
                      <span>راهنمای سطح‌بندی اعتماد بیمه‌ای و اقدامات الزامی در صورت افت سطح:</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#005581] dark:text-[#72cdf4] font-bold shrink-0">
                      <span>{isLevelGuideOpen ? 'بستن راهنما' : 'نمایش کامل راهنما'}</span>
                      {isLevelGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isLevelGuideOpen && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="font-bold text-[#005581] dark:text-[#72cdf4]">سطح L1 (مبتدی / بررسی سنتی):</div>
                          <p className="text-slate-600 dark:text-slate-400">
                            زمان تسویه: ۱۴ الی ۲۱ روز کاری. نیازمند ارسال اسناد فیزیکی و بازبینی دستی ۱۰۰٪ پرونده‌ها توسط کارشناس بیمه‌گر.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="font-bold text-[#005581] dark:text-[#72cdf4]">سطح L2 (ممیزی هوش مصنوعی):</div>
                          <p className="text-slate-600 dark:text-slate-400">
                            زمان تسویه: ۷ روز کاری. حذف اسناد فیزیکی، ممیزی تصویری گرافی‌ها با هوش مصنوعی و تایید کارشناس.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="font-bold text-[#005581] dark:text-[#72cdf4]">سطح L3 (تسویه نیمه‌خودکار):</div>
                          <p className="text-slate-600 dark:text-slate-400">
                            زمان تسویه: ۷۲ ساعت. واریز ۸۰٪ مبلغ بلافاصله و بازبینی نمونه‌ای ۵٪ از کل ادعاها.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="font-bold text-[#005581] dark:text-[#72cdf4]">سطح L4 (تسویه سریع مستقیم - فعال):</div>
                          <p className="text-slate-600 dark:text-slate-400">
                            زمان تسویه: ۴۹:۳۰ ساعت. تسویه خودکار ۱۰۰٪ ادعاها مستقیم به حساب شبای کلینیک.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        <strong>اقدامات الزامی جهت حفظ سطح L4:</strong> در صورت عدم آپلود گرافی RVG یا وجود مغایرت مالی در تراکنش‌های کارتخوان POS، سطح اعتماد کلینیک موقتاً به L2 کاهش یافته و تسویه‌ها وارد صف بررسی دستی ۷ روزه خواهند شد.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 6: OWNER SETTINGS (تنظیمات ویژه مالک کلینیک)          */}
          {/* ========================================================== */}
          {activeTab === 'owner_settings' && (
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
                onAddEmployee={onAddEmployee}
                onDeleteEmployee={onDeleteEmployee || (() => {})}
                onUpdateUserRole={onUpdateUserRole || (() => {})}
                insuranceModuleActive={insuranceModuleActive}
                onToggleInsuranceModule={onToggleInsuranceModule}
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
        </main>
      </div>

      {/* ========================================================== */}
      {/* STAT CARDS DETAILED INTERACTIVE MODAL (CASH BOARD)         */}
      {/* ========================================================== */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 bg-[#005581] text-[#fffffa] flex items-center justify-between border-b border-[#72cdf4]/30">
              <div className="flex items-center gap-3">
                {activeModalCard === 'invoiced' && <DollarSign className="w-6 h-6 text-[#ffd200]" />}
                {activeModalCard === 'cash' && <Wallet className="w-6 h-6 text-[#ffd200]" />}
                {activeModalCard === 'pos' && <CreditCard className="w-6 h-6 text-[#ffd200]" />}
                <div>
                  <h3 className="font-extrabold text-base">
                    {activeModalCard === 'invoiced' && 'ریز فاکتورهای درآمد کل امروز (۴۵,۸۰۰,۰۰۰ تومان)'}
                    {activeModalCard === 'cash' && 'ریز وجوه نقد دریافتی صندوق امروز (۱۲,۴۰۰,۰۰۰ تومان)'}
                    {activeModalCard === 'pos' && 'ریز تراکنش‌های دستگاه‌های کارتخوان POS (۳۳,۴۰۰,۰۰۰ تومان)'}
                  </h3>
                  <p className="text-xs text-[#72cdf4] mt-0.5">
                    جزئیات ثبت‌شده در سیستم مالی کلینیک دنتورا
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalCard(null)}
                className="p-2 rounded-xl bg-[#005581]/80 hover:bg-[#004468] text-[#fffffa] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="جستجو بر اساس نام بیمار، پزشک، کد..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#005581]"
                />
              </div>

              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-xl bg-[#005581] text-[#fffffa] font-bold text-xs hover:bg-[#004468] transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#ffd200]" />
                <span>خروجی Excel</span>
              </button>
            </div>

            {/* Modal Body Table */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* CONTENT FOR INVOICED REVENUE */}
              {activeModalCard === 'invoiced' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">نام بیمار</th>
                        <th className="py-2.5 px-3">دندان‌پزشک معالج</th>
                        <th className="py-2.5 px-3">خدمت درمانی</th>
                        <th className="py-2.5 px-3">مبلغ فاکتور</th>
                        <th className="py-2.5 px-3">نوع پرداخت</th>
                        <th className="py-2.5 px-3">زمان ثبت</th>
                        <th className="py-2.5 px-3">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {todayInvoicedList
                        .filter((inv) =>
                          inv.patient.includes(modalSearchQuery) ||
                          inv.dentist.includes(modalSearchQuery) ||
                          inv.treatment.includes(modalSearchQuery)
                        )
                        .map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{inv.patient}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{inv.dentist}</td>
                            <td className="py-3 px-3">{inv.treatment}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                              {formatPricePersian(inv.totalAmount)}
                            </td>
                            <td className="py-3 px-3">{inv.payType}</td>
                            <td className="py-3 px-3 font-mono text-slate-500">{toPersianDigits(inv.time)}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-[#72cdf4]/20 text-[#005581] font-bold text-[10px]">
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* CONTENT FOR CASH RECEIPTS */}
              {activeModalCard === 'cash' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">شماره رسید</th>
                        <th className="py-2.5 px-3">نام بیمار</th>
                        <th className="py-2.5 px-3">مسئول دریافت (پذیرش)</th>
                        <th className="py-2.5 px-3">مبلغ وجه نقد</th>
                        <th className="py-2.5 px-3">زمان دریافت</th>
                        <th className="py-2.5 px-3">توضیحات صندوق</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {todayCashList
                        .filter((csh) =>
                          csh.patient.includes(modalSearchQuery) ||
                          csh.receiptNo.includes(modalSearchQuery) ||
                          csh.receptionist.includes(modalSearchQuery)
                        )
                        .map((csh) => (
                          <tr key={csh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{csh.receiptNo}</td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{csh.patient}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{csh.receptionist}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                              {formatPricePersian(csh.amount)}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500">{toPersianDigits(csh.time)}</td>
                            <td className="py-3 px-3 text-slate-500">{csh.notes}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* CONTENT FOR POS TRANSACTIONS */}
              {activeModalCard === 'pos' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500 text-[11px]">پایانه شماره ۱ (ناپ - بانک ملی):</div>
                      <div className="font-mono text-base font-black text-[#005581] dark:text-[#72cdf4] mt-1">
                        {formatPricePersian(20400000)} (۳ تراکنش)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500 text-[11px]">پایانه شماره ۲ (رویا - بانک سامان):</div>
                      <div className="font-mono text-base font-black text-[#005581] dark:text-[#72cdf4] mt-1">
                        {formatPricePersian(13000000)} (۲ تراکنش)
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                          <th className="py-2.5 px-3">نام پایانه / بانک</th>
                          <th className="py-2.5 px-3">شماره پیگیری (RRN)</th>
                          <th className="py-2.5 px-3">نام بیمار</th>
                          <th className="py-2.5 px-3">۴ رقم کارت</th>
                          <th className="py-2.5 px-3">مبلغ تراکنش</th>
                          <th className="py-2.5 px-3">زمان</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {todayPosList
                          .filter((p) =>
                            p.patient.includes(modalSearchQuery) ||
                            p.traceNo.includes(modalSearchQuery) ||
                            p.terminal.includes(modalSearchQuery)
                          )
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{p.terminal}</td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400">{toPersianDigits(p.traceNo)}</td>
                              <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{p.patient}</td>
                              <td className="py-3 px-3 font-mono">****-{toPersianDigits(p.cardLast4)}</td>
                              <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                                {formatPricePersian(p.amount)}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-500">{toPersianDigits(p.time)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setActiveModalCard(null)}
                className="px-5 py-2 rounded-xl bg-[#005581] text-[#fffffa] font-bold text-xs hover:bg-[#004468] transition cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* STAT CARDS DETAILED INTERACTIVE MODAL (INSURANCE RECEIVABLES) */}
      {/* ========================================================== */}
      {activeInsuranceModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 bg-[#005581] text-[#fffffa] flex items-center justify-between border-b border-[#72cdf4]/30">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#ffd200]" />
                <div>
                  <h3 className="font-extrabold text-base">
                    {activeInsuranceModalCard === 'total_receivables' && 'جزئیات تفکیکی مطالبات کلینیک از شرکت‌های بیمه'}
                    {activeInsuranceModalCard === 'returned_claims' && 'ریز پرونده‌های بیمه‌ای برگشت‌خورده (نیازمند اصلاح)'}
                    {activeInsuranceModalCard === 'settlement_timeline' && 'چرخه زمان‌بندی و مراحل تسویه ۴۹:۳۰ ساعته بیمه‌ها'}
                    {activeInsuranceModalCard === 'rejected_claims' && 'ریز مبالغ رد شده و پرونده‌های کسرشده توسط بیمه‌گر'}
                  </h3>
                  <p className="text-xs text-[#72cdf4] mt-0.5">
                    سامانه نظارت بر چرخه تسویه مطالبات بیمه‌ای دنتورا
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveInsuranceModalCard(null)}
                className="p-2 rounded-xl bg-[#005581]/80 hover:bg-[#004468] text-[#fffffa] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter / Export Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="جستجو در مطالبات بیمه..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#005581]"
                />
              </div>

              {activeInsuranceModalCard === 'total_receivables' && (
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 rounded-xl bg-[#005581] text-[#fffffa] font-bold text-xs hover:bg-[#004468] transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                  <span>دانلود اکسل مطالبات</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* TOTAL RECEIVABLES BREAKDOWN */}
              {activeInsuranceModalCard === 'total_receivables' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">نام شرکت بیمه‌گر</th>
                        <th className="py-2.5 px-3">تعداد پرونده</th>
                        <th className="py-2.5 px-3">مجموع مطالبات (ریال)</th>
                        <th className="py-2.5 px-3">میانگین زمان تسویه</th>
                        <th className="py-2.5 px-3">وضعیت مسیر تسویه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {insuranceBreakdownList
                        .filter((ins) => ins.company.includes(modalSearchQuery))
                        .map((ins) => (
                          <tr key={ins.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{ins.company}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">{toPersianDigits(ins.count)} پرونده</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                              {formatPricePersian(ins.amount)}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{ins.avgDays}</td>
                            <td className="py-3 px-3">
                              <span className="px-2.5 py-1 rounded-md bg-[#72cdf4]/20 text-[#005581] font-bold text-[11px]">
                                {ins.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* RETURNED CLAIMS */}
              {activeInsuranceModalCard === 'returned_claims' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">نام بیمار</th>
                        <th className="py-2.5 px-3">پزشک معالج</th>
                        <th className="py-2.5 px-3">بیمه‌گر</th>
                        <th className="py-2.5 px-3">مبلغ پرونده</th>
                        <th className="py-2.5 px-3">علت برگشت / کسر ادعا</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {returnedClaimsList
                        .filter((ret) =>
                          ret.patient.includes(modalSearchQuery) ||
                          ret.dentist.includes(modalSearchQuery) ||
                          ret.insurer.includes(modalSearchQuery)
                        )
                        .map((ret) => (
                          <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{ret.patient}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{ret.dentist}</td>
                            <td className="py-3 px-3 font-bold text-[#005581]">{ret.insurer}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#005581]">{formatPricePersian(ret.amount)}</td>
                            <td className="py-3 px-3 text-[#005581] font-bold text-[11px]">{ret.reason}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SETTLEMENT TIMELINE (49:30 Hours) */}
              {activeInsuranceModalCard === 'settlement_timeline' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#72cdf4]/15 border border-[#72cdf4] text-[#005581] space-y-2">
                    <div className="flex items-center justify-between font-extrabold text-sm">
                      <span>چرخه زمان‌بندی تسویه مستقیم (تسویه سریع):</span>
                      <span className="px-3 py-1 rounded-full bg-[#005581] text-[#ffd200] font-mono text-xs">
                        مجموع زمان تسویه: {toPersianDigits('۴۹:۳۰')} ساعت
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">
                      محاسبه زمان تسویه از لحظه ارسال الکترونیک پرونده به بیمه‌گر آغاز شده و واریز وجه ظرف ۴۹ ساعت و ۳۰ دقیقه انجام می‌پذیرد.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center gap-3">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">۱. ثبت و صدور فاکتور الکترونیک تا ارسال به بیمه‌گر:</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">فرآیند و عملیات داخل کلینیک</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] shrink-0">
                        خارج از محاسبه زمان تسویه بیمه‌گر (۰ ساعت)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">۲. پردازش و ممیزی هوشمند شواهد تصویری و کد FDI:</span>
                      <span className="font-mono font-bold text-[#005581] dark:text-[#72cdf4]">۰۲:۰۰ ساعت</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">۳. صدور حواله پایا/شبا و واریز به حساب کلینیک:</span>
                      <span className="font-mono font-bold text-[#005581] dark:text-[#72cdf4]">۴۷:۳۰ ساعت</span>
                    </div>
                  </div>
                </div>
              )}

              {/* REJECTED CLAIMS */}
              {activeInsuranceModalCard === 'rejected_claims' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">نام بیمار</th>
                        <th className="py-2.5 px-3">دندان‌پزشک معالج</th>
                        <th className="py-2.5 px-3">شرکت بیمه‌گر</th>
                        <th className="py-2.5 px-3">مبلغ ردشده</th>
                        <th className="py-2.5 px-3">علت عدم پذیرش / رد ادعا</th>
                        <th className="py-2.5 px-3">تاریخ رد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {rejectedClaimsList
                        .filter((rej) =>
                          rej.patient.includes(modalSearchQuery) ||
                          rej.dentist.includes(modalSearchQuery) ||
                          rej.insurer.includes(modalSearchQuery)
                        )
                        .map((rej) => (
                          <tr key={rej.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{rej.patient}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{rej.dentist}</td>
                            <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">{rej.insurer}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#005581] dark:text-[#72cdf4]">
                              {formatPricePersian(rej.amount)}
                            </td>
                            <td className="py-3 px-3 text-[#005581] dark:text-[#72cdf4] text-[11px] font-bold">{rej.reason}</td>
                            <td className="py-3 px-3 font-mono text-slate-500">{rej.date}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setActiveInsuranceModalCard(null)}
                className="px-5 py-2 rounded-xl bg-[#005581] text-[#fffffa] font-bold text-xs hover:bg-[#004468] transition cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* EMPLOYEE DELETION CONFIRMATION MODAL                      */}
      {/* ========================================================== */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#005581]">
              <ShieldAlert className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  تایید حذف حساب پرسنل کلینیک
                </h3>
                <p className="text-xs text-slate-500">اقدام غیرقابل بازگشت</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#005581]/10 border border-[#005581]/30 text-xs space-y-2">
              <p className="font-bold text-[#005581]">
                آیا از حذف این پرسنل ({employeeToDelete.name}) اطمینان دارید؟
              </p>
              <div className="text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                <div>نقش سازمانی: <strong>{employeeToDelete.role === 'dentist' ? 'دندان‌پزشک معالج' : employeeToDelete.role === 'receptionist' ? 'منشی / پذیرش' : 'حسابدار'}</strong></div>
                <div>کد ملی: <span className="font-mono">{toPersianDigits(employeeToDelete.nationalId)}</span></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#ffe552]/30 border border-[#ffd200] text-[11px] text-[#005581] space-y-1">
              <span className="font-bold block">توصیه مدیریتی در صورت پایین بودن سطح یا عدم تعادل:</span>
              <p>
                در صورت وجود پرونده‌های باز یا عدم تعیین تکلیف کارانه، پرونده‌های ثبتی به حالت معلق منتقل می‌شوند و مسئولیت پذیرش به سایر پرسنل واگذار می‌گردد.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEmployee}
                className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004468] text-[#fffffa] font-bold text-xs transition shadow cursor-pointer"
              >
                بله، حذف پرسنل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* EMPLOYEE CREATION MODAL                                    */}
      {/* ========================================================== */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#005581]" />
                <span>استخدام پرسنل / پزشک جدید</span>
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام و نام خانوادگی:
                </label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="مثلاً: دکتر علیرضا نوری"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#005581]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نقش سازمانی:
                </label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#005581]"
                >
                  <option value="dentist">دندان‌پزشک معالج (Dentist)</option>
                  <option value="receptionist">منشی / پذیرش (Receptionist)</option>
                  {hasAccountantRole && (
                    <option value="accountant">حسابدار / مدیر مالی (Accountant)</option>
                  )}
                  <option value="manager">مدیریت کلینیک (Manager)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  کد ملی:
                </label>
                <input
                  type="text"
                  value={empNationalId}
                  onChange={(e) => setEmpNationalId(e.target.value)}
                  placeholder="۱۲۷۰۰۰۵۵۴۴"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#005581]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تلفن همراه:
                </label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۳۳۴۴۵۵"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#005581]"
                />
              </div>

              {empRole === 'dentist' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    درصد کارانه (سهم دریافتی دندان‌پزشک):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={empCommission}
                      onChange={(e) => setEmpCommission(Number(e.target.value))}
                      className="w-24 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-slate-900 dark:text-slate-100"
                    />
                    <span className="font-bold text-slate-600 dark:text-slate-400">درصد</span>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004468] text-white font-bold transition shadow cursor-pointer"
                >
                  ثبت کارمند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
