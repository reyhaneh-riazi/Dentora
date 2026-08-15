import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Users,
  UserPlus,
  UserCheck,
  FileCode,
  FileText,
  Zap,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
  Settings2,
  BarChart2,
  Cpu,
  History,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Eye,
  Edit3,
  Send,
  X,
  Award,
  Check,
  Building2,
  FileCheck2,
  CheckSquare,
  Key,
  User,
  Stethoscope,
} from 'lucide-react';
import { mockQuestionSets, mockTariffRules, mockClaims, mockAuditLogs } from '../../data/mockData';
import { MedicalQuestionSet, TariffToleranceRule, AuditLogItem } from '../../types';

// System User Interface for RBAC
interface SystemUser {
  id: string;
  fullName: string;
  role: 'claim_reviewer' | 'medical_doctor' | 'insurance_manager' | 'system_admin';
  roleTitle: string;
  emailPhone: string;
  phoneNumber: string;
  password: string;
  medicalCouncilOrStaffCode: string;
  assignedQueues: string[];
  isDigitalSignatureActive: boolean;
  status: 'active' | 'inactive';
  lastActive: string;
}

// Rule Change Request Interface
interface RuleChangeRequest {
  id: string;
  requestTitle: string;
  category: 'tariff' | 'risk_threshold' | 'clinical_rule' | 'green_lane';
  categoryTitle: string;
  proposedRuleDetails: string;
  priority: 'normal' | 'urgent';
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'in_progress' | 'deployed';
  statusTitle: string;
  targetVersion: string;
}

// Initial System Users Data
const initialUsers: SystemUser[] = [
  {
    id: 'usr-101',
    fullName: 'دکتر کاوه نوری',
    role: 'medical_doctor',
    roleTitle: 'پزشک معتمد ارشد',
    emailPhone: 'k.noori@insurance.ir',
    phoneNumber: '09121112233',
    password: 'Dentora#Pass99281',
    medicalCouncilOrStaffCode: 'نظام پزشکی: ۹۹۲۸۱',
    assignedQueues: ['Deep Review (عمیق)', 'Standard'],
    isDigitalSignatureActive: true,
    status: 'active',
    lastActive: 'هم‌اکنون',
  },
  {
    id: 'usr-102',
    fullName: 'کارشناس نیلوفر احمدی',
    role: 'claim_reviewer',
    roleTitle: 'ارزیاب ارشد ادعا',
    emailPhone: 'n.ahmadi@insurance.ir',
    phoneNumber: '09123334455',
    password: 'Dentora#Pass4402',
    medicalCouncilOrStaffCode: 'کد پرسنلی: INS-4402',
    assignedQueues: ['Express Lane', 'Standard'],
    isDigitalSignatureActive: true,
    status: 'active',
    lastActive: '۱۰ دقیقه قبل',
  },
  {
    id: 'usr-103',
    fullName: 'مهندس رضا رضایی',
    role: 'insurance_manager',
    roleTitle: 'مدیر بیمه و بودجه کلان',
    emailPhone: 'r.rezaei@insurance.ir',
    phoneNumber: '09125556677',
    password: 'Dentora#Pass1001',
    medicalCouncilOrStaffCode: 'کد پرسنلی: MGR-1001',
    assignedQueues: ['گزارشات کلان', 'تأیید مالی'],
    isDigitalSignatureActive: true,
    status: 'active',
    lastActive: '۱ ساعت قبل',
  },
  {
    id: 'usr-104',
    fullName: 'دکتر سارا فرهادی',
    role: 'medical_doctor',
    roleTitle: 'پزشک معتمد دندان‌پزشک',
    emailPhone: 's.farhadi@insurance.ir',
    phoneNumber: '09128889900',
    password: 'Dentora#Pass88412',
    medicalCouncilOrStaffCode: 'نظام پزشکی: ۸۸۴۱۲',
    assignedQueues: ['Deep Review (عمیق)'],
    isDigitalSignatureActive: false,
    status: 'active',
    lastActive: 'دیروز',
  },
];

// Initial Rule Change Requests Data
const initialRuleRequests: RuleChangeRequest[] = [
  {
    id: 'REQ-101',
    requestTitle: 'افزایش سقف تعرفه پوشش درمان ریشه تخصصی (کد END-3C)',
    category: 'tariff',
    categoryTitle: 'تعرفه و تلورانس',
    proposedRuleDetails: 'تعرفه پایه از ۱,۲۰۰,۰۰۰ تومان به ۱,۵۰۰,۰۰۰ تومان و تلورانس به ۳۵٪ افزایش یابد.',
    priority: 'urgent',
    submittedBy: 'راهبر سیستم بیمه (شما)',
    submittedAt: '۱۴۰۵/۰۵/۱۰',
    status: 'in_progress',
    statusTitle: 'در حال پیاده‌سازی تیم دنتورا',
    targetVersion: 'v2.2-beta',
  },
  {
    id: 'REQ-102',
    requestTitle: 'کاهش آستانه ورود خودکار به مسیر Express Lane به زیر ۲۵٪ ریسک',
    category: 'risk_threshold',
    categoryTitle: 'آستانه ریسک',
    proposedRuleDetails: 'جهت تسریع تسویه، ادعاهای با ضریب ریسک زیر ۲۵٪ بدون ارزیابی انسانی وارد تسویه شوند.',
    priority: 'normal',
    submittedBy: 'راهبر سیستم بیمه (شما)',
    submittedAt: '۱۴۰۵/۰۵/۱۲',
    status: 'pending',
    statusTitle: 'در انتظار بررسی تیم فنی دنتورا',
    targetVersion: 'v2.2-beta',
  },
];

export const InsuranceAdminWorkspace: React.FC<{
  claims?: any[];
  onReviewDecision?: any;
}> = () => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'rbac' | 'rules' | 'ai_config' | 'worm_logs'>('rules');

  // RBAC State
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<SystemUser['role']>('claim_reviewer');
  const [newUserRoleTitle, setNewUserRoleTitle] = useState('');
  const [newUserContact, setNewUserContact] = useState('');
  const [newUserCode, setNewUserCode] = useState('');

  // Rules & Versioning State
  const [pinnedRuleVersion] = useState('v2.1-2026');
  const [expressThreshold, setExpressThreshold] = useState(30);
  const [deepReviewThreshold, setDeepReviewThreshold] = useState(70);
  const [tariffRules, setTariffRules] = useState<TariffToleranceRule[]>(mockTariffRules);
  const [ruleRequests, setRuleRequests] = useState<RuleChangeRequest[]>(initialRuleRequests);
  const [showNewRequestModal, setShowNewRequestModal] = useState<boolean>(false);

  // New Rule Request Form State
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState<RuleChangeRequest['category']>('tariff');
  const [reqDetails, setReqDetails] = useState('');
  const [reqPriority, setReqPriority] = useState<RuleChangeRequest['priority']>('normal');

  // Question Sets State
  const [questionSets] = useState<MedicalQuestionSet[]>(mockQuestionSets);
  const [selectedSet, setSelectedSet] = useState<MedicalQuestionSet | null>(mockQuestionSets[0]);

  // AI & Copilot Config State
  const [expressModel, setExpressModel] = useState<'gemini_flash' | 'gemini_pro'>('gemini_flash');
  const [standardModel, setStandardModel] = useState<'gemini_flash' | 'gemini_pro'>('gemini_flash');
  const [deepModel, setDeepModel] = useState<'gemini_flash' | 'gemini_pro' | 'antigravity'>('gemini_pro');
  const [autoExtractMarkers, setAutoExtractMarkers] = useState(true);
  const [autoSuggestNote, setAutoSuggestNote] = useState(true);

  // WORM Audit Logs State
  const [wormSearchQuery, setWormSearchQuery] = useState('');
  const [wormLogs] = useState<AuditLogItem[]>(mockAuditLogs as any);
  const [selectedWormLog, setSelectedWormLog] = useState<AuditLogItem | null>(null);

  // Active User for Viewing/Editing Details Modal
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<SystemUser | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Selected Trust Level for Clinic Trust Level details modal/drawer in Tab 1
  const [selectedTrustLevelCode, setSelectedTrustLevelCode] = useState<string>('L3');

  // Helpers
  const toFa = (val: number | string) => val.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

  // Open User Edit Modal
  const handleOpenUserEdit = (user: SystemUser) => {
    setSelectedUserForEdit(user);
    setEditPhone(user.phoneNumber);
    const existingEmail = user.emailPhone.includes('|')
      ? user.emailPhone.split('|')[1]?.trim() || user.emailPhone
      : user.emailPhone;
    setEditEmail(existingEmail);
    setEditPassword(user.password);
    setShowPassword(false);
    setEditSuccessMsg('');
  };

  // Save User Edit
  const handleSaveUserEdit = () => {
    if (!selectedUserForEdit) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUserForEdit.id
          ? {
              ...u,
              phoneNumber: editPhone,
              password: editPassword,
              emailPhone: `${editPhone} | ${editEmail}`,
            }
          : u
      )
    );
    setEditSuccessMsg('اطلاعات کاربر (شماره تماس، ایمیل و رمز عبور) با موفقیت بروزرسانی شد.');
    setTimeout(() => {
      setSelectedUserForEdit(null);
      setEditSuccessMsg('');
    }, 1500);
  };

  // Handle User Toggle Status
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
    );
  };

  // Add New User
  const handleCreateUser = () => {
    if (!newUserName || !newUserCode) return;
    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      fullName: newUserName,
      role: newUserRole,
      roleTitle: newUserRoleTitle || (newUserRole === 'claim_reviewer' ? 'ارزیاب ادعا' : 'پزشک معتمد'),
      emailPhone: newUserContact || 'user@insurance.ir',
      phoneNumber: newUserContact || '09120000000',
      password: 'Dentora#Pass' + Math.floor(1000 + Math.random() * 9000),
      medicalCouncilOrStaffCode: newUserCode,
      assignedQueues: newUserRole === 'medical_doctor' ? ['Deep Review (عمیق)'] : ['Express Lane', 'Standard'],
      isDigitalSignatureActive: true,
      status: 'active',
      lastActive: 'جدید',
    };
    setUsers((prev) => [newUser, ...prev]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserCode('');
    setNewUserContact('');
  };

  // Submit Rule Request to Dentura
  const handleSubmitRuleRequest = () => {
    if (!reqTitle || !reqDetails) return;
    const catTitles: Record<RuleChangeRequest['category'], string> = {
      tariff: 'تعرفه و تلورانس',
      risk_threshold: 'آستانه ریسک',
      clinical_rule: 'قاعده بالینی',
      green_lane: 'ضوابط تسویه سریع',
    };
    const newReq: RuleChangeRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      requestTitle: reqTitle,
      category: reqCategory,
      categoryTitle: catTitles[reqCategory],
      proposedRuleDetails: reqDetails,
      priority: reqPriority,
      submittedBy: 'راهبر سیستم بیمه (شما)',
      submittedAt: new Date().toLocaleDateString('fa-IR'),
      status: 'pending',
      statusTitle: 'در انتظار بررسی تیم فنی دنتورا',
      targetVersion: 'v2.2-beta',
    };
    setRuleRequests((prev) => [newReq, ...prev]);
    setShowNewRequestModal(false);
    setReqTitle('');
    setReqDetails('');
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchSearch =
      u.fullName.includes(userSearchTerm) ||
      u.medicalCouncilOrStaffCode.includes(userSearchTerm) ||
      u.emailPhone.includes(userSearchTerm);
    return matchRole && matchSearch;
  });

  // Filtered WORM Logs
  const filteredWormLogs = wormLogs.filter(
    (l) =>
      (l.entityId && l.entityId.includes(wormSearchQuery)) ||
      (l.userName && l.userName.includes(wormSearchQuery)) ||
      (l.details && l.details.includes(wormSearchQuery)) ||
      (l.action && l.action.includes(wormSearchQuery))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#fffffa] min-h-screen text-[#005581] font-sans" dir="rtl">
      {/* HEADER BANNER */}
      <div className="bg-[#fffffa] rounded-2xl p-6 border-2 border-[#005581] shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-[#005581]" />
              <h1 className="text-xl font-bold text-[#005581]">
                میزکار ادمین و راهبر سیستم بیمه (Insurance System Admin Workspace)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#72cdf4]/15 border border-[#72cdf4] p-3 rounded-xl text-xs space-y-1">
              <div className="text-[10px] text-[#005581]/70 font-bold">نسخه فعال قاعده:</div>
              <div className="font-mono font-black text-[#005581] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#005581]" />
                <span>{pinnedRuleVersion} (پین‌شده)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN BODY LAYOUT: RIGHT SIDEBAR MENU + LEFT TAB CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* RIGHT SIDEBAR NAVIGATION MENU */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-[#fffffa] rounded-2xl p-4 border-2 border-[#005581] shadow-sm space-y-3 sticky top-4">
            <div className="text-xs font-black text-[#005581] pb-2 border-b border-[#72cdf4] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#005581]" />
              <span>منوی مدیریت و تنظیمات</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-right ${
                  activeTab === 'rules'
                    ? 'bg-[#005581] text-white shadow-md border-2 border-[#005581]'
                    : 'bg-[#fffffa] text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/20'
                }`}
              >
                <Sliders className={`w-4 h-4 shrink-0 ${activeTab === 'rules' ? 'text-[#ffe552]' : 'text-[#005581]'}`} />
                <span className="leading-snug">۱. قوانین و تعرفه‌ها</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rbac')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-right ${
                  activeTab === 'rbac'
                    ? 'bg-[#005581] text-white shadow-md border-2 border-[#005581]'
                    : 'bg-[#fffffa] text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/20'
                }`}
              >
                <Users className={`w-4 h-4 shrink-0 ${activeTab === 'rbac' ? 'text-[#ffe552]' : 'text-[#005581]'}`} />
                <span className="leading-snug">۲. کاربران و سطوح دسترسی</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai_config')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-right ${
                  activeTab === 'ai_config'
                    ? 'bg-[#005581] text-white shadow-md border-2 border-[#005581]'
                    : 'bg-[#fffffa] text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/20'
                }`}
              >
                <Cpu className={`w-4 h-4 shrink-0 ${activeTab === 'ai_config' ? 'text-[#ffe552]' : 'text-[#005581]'}`} />
                <span className="leading-snug">۳. پایش و تنظیم هوش مصنوعی</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('worm_logs')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-right ${
                  activeTab === 'worm_logs'
                    ? 'bg-[#005581] text-white shadow-md border-2 border-[#005581]'
                    : 'bg-[#fffffa] text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/20'
                }`}
              >
                <History className={`w-4 h-4 shrink-0 ${activeTab === 'worm_logs' ? 'text-[#ffe552]' : 'text-[#005581]'}`} />
                <span className="leading-snug">۴. امنیت داده و دفترچه حسابرسی</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN TAB CONTENT AREA */}
        <div className="lg:col-span-3 min-w-0 space-y-6">

      {/* ========================================================================= */}
      {/* TAB 1: RULES, TARIFFS, RISK THRESHOLDS & SLA (RULE STUDIO & VERSIONING) */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Top Row: Active Version Card & Request Rule Change Button */}
          <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#005581] text-[#ffe552] rounded-xl shadow">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#005581]">
                  نسخه فعال موتور قوانین دنتورا ({pinnedRuleVersion})
                </h2>
                <p className="text-xs text-[#005581]/80 font-medium">
                  شامل قواعد غربالگری بالینی، جدول تعرفه‌ها، درصد تلورانس مجاز و شاخص‌های تسویه سریع.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewRequestModal(true)}
              className="bg-[#ffe552] hover:bg-[#ffd200] text-[#005581] font-black text-xs px-4 py-2.5 rounded-xl border border-[#ffd200] shadow transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 text-[#005581]" />
              <span>ثبت درخواست تغییر قوانین به تیم فنی دنتورا</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Routing Risk Score Thresholds */}
            <div className="lg:col-span-1 bg-[#fffffa] rounded-2xl p-5 border-2 border-[#72cdf4] space-y-5 shadow-sm">
              <div className="border-b border-[#72cdf4] pb-2.5">
                <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-[#005581]" />
                  <span>تنظیم آستانه‌های ریسک مسیریابی</span>
                </h3>
                <p className="text-[11px] text-[#005581]/70 mt-1 font-medium leading-relaxed">
                  تعیین درصد ریسک داخلی برای هدایت خودکار ادعاها بین ۳ صف Express، Standard و Deep Review.
                </p>
              </div>

              <div className="space-y-3 bg-[#72cdf4]/10 p-4 rounded-xl border border-[#72cdf4]">
                <div className="flex justify-between items-center text-xs font-bold text-[#005581]">
                  <span>سقف مسیر سریع (Express Lane):</span>
                  <span className="bg-[#ffe552] text-[#005581] font-black px-2.5 py-1 rounded-lg border border-[#ffd200]">
                    زیر ۳۰٪ ریسک (ثابت سیستمی)
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-[#005581] pt-2 border-t border-[#72cdf4]/40">
                  <span>محدوده بررسی معمولی (Standard):</span>
                  <span className="bg-[#72cdf4]/30 text-[#005581] font-black px-2.5 py-1 rounded-lg border border-[#72cdf4]">
                    ۳۰٪ تا ۷۰٪ ریسک
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-[#005581] pt-2 border-t border-[#72cdf4]/40">
                  <span>کف مسیر بررسی عمیق (Deep Review):</span>
                  <span className="bg-[#ffd200] text-[#005581] font-black px-2.5 py-1 rounded-lg border border-[#ffd200]">
                    بالای ۷۰٪ ریسک (ثابت)
                  </span>
                </div>

                <div className="text-[11px] text-[#005581] bg-white p-3 rounded-lg border border-[#72cdf4] font-bold leading-relaxed shadow-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#005581] shrink-0" />
                  <span>آستانه‌های درصد سقف و کف ریسک قفل صلب سیستمی (مطابق آئین‌نامه) بوده و جهت جلوگیری از تغییرات شتاب‌زده، توسط کاربران قابل دستکاری مستقیم نیست.</span>
                </div>
              </div>

              {/* Clinic Trust Levels Section (وضعیت سطح اعتماد کلینیک) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2">
                  <h4 className="text-xs font-black text-[#005581] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#005581]" />
                    <span>وضعیت سطح اعتماد کلینیک</span>
                  </h4>
                  <span className="text-[10px] bg-[#005581] text-white font-bold px-2 py-0.5 rounded-md">
                    ۵ سطح سیستمی
                  </span>
                </div>

                {/* Trust Levels List - Clickable Rows */}
                <div className="space-y-1.5 text-xs">
                  {[
                    { level: 'L0', name: 'مرکز دستی', meaning: 'بازبینی دستی', badgeBg: 'bg-rose-100 text-rose-800 border-rose-300' },
                    { level: 'L1', name: 'پایه', meaning: 'دارای دادهٔ بیمه‌ای ناقص', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300' },
                    { level: 'L2', name: 'متصل', meaning: 'ارسال ادعا با مدارک لازم', badgeBg: 'bg-sky-100 text-sky-800 border-sky-300' },
                    { level: 'L3', name: 'تاییدشده', meaning: 'فعال‌بودن هر پنج ماژول و عبور از کنترل کیفیت ادعا', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                    { level: 'L4', name: 'دنتورا - تسویه سریع', meaning: 'آمادگی بالا و نرخ برگشت پایین ، واجد تسویهٔ سریع', badgeBg: 'bg-emerald-200 text-emerald-900 border-emerald-400 font-black' },
                  ].map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedTrustLevelCode(item.level)}
                      className={`w-full text-right p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedTrustLevelCode === item.level
                          ? 'bg-[#005581] text-white border-[#005581] shadow-sm font-black'
                          : 'bg-[#fffffa] text-[#005581] border-[#72cdf4]/60 hover:bg-[#72cdf4]/15 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-black ${item.badgeBg}`}>
                          {item.level}
                        </span>
                        <span className="text-xs">{item.name}</span>
                      </div>
                      <span className="text-[10px] opacity-80">کلیک جهت مشاهده جزئیات 🔍</span>
                    </button>
                  ))}
                </div>

                {/* Selected Level Explanation Card */}
                {selectedTrustLevelCode && (
                  <div className="bg-[#ffe552]/20 p-3.5 rounded-2xl border-2 border-[#ffd200] space-y-2 text-xs text-[#005581] animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#ffd200] pb-1.5 font-black">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#005581]" />
                        <span>توضیح سطح اعتماد {selectedTrustLevelCode}:</span>
                      </span>
                      <span className="bg-[#005581] text-white text-[10px] px-2 py-0.5 rounded">
                        {selectedTrustLevelCode === 'L0' && 'مرکز دستی'}
                        {selectedTrustLevelCode === 'L1' && 'پایه'}
                        {selectedTrustLevelCode === 'L2' && 'متصل'}
                        {selectedTrustLevelCode === 'L3' && 'تاییدشده'}
                        {selectedTrustLevelCode === 'L4' && 'دنتورا - تسویه سریع'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>نام سطح:</span>
                        <strong className="text-[#005581]">
                          {selectedTrustLevelCode === 'L0' && 'مرکز دستی'}
                          {selectedTrustLevelCode === 'L1' && 'پایه'}
                          {selectedTrustLevelCode === 'L2' && 'متصل'}
                          {selectedTrustLevelCode === 'L3' && 'تاییدشده'}
                          {selectedTrustLevelCode === 'L4' && 'دنتورا - تسویه سریع'}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>معنا و ضوابط:</span>
                        <strong className="text-[#005581] bg-white/80 px-2 py-0.5 rounded border border-[#72cdf4]">
                          {selectedTrustLevelCode === 'L0' && 'بازبینی دستی'}
                          {selectedTrustLevelCode === 'L1' && 'دارای دادهٔ بیمه‌ای ناقص'}
                          {selectedTrustLevelCode === 'L2' && 'ارسال ادعا با مدارک لازم'}
                          {selectedTrustLevelCode === 'L3' && 'فعال‌بودن هر پنج ماژول و عبور از کنترل کیفیت ادعا'}
                          {selectedTrustLevelCode === 'L4' && 'آمادگی بالا و نرخ برگشت پایین ، واجد تسویهٔ سریع'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2 & 3: Tariff Rules Table & Rule Change Requests */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tariff Tolerance Rules Table */}
              <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#72cdf4] space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2.5">
                  <div>
                    <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#005581]" />
                      <span>جدول تعرفه‌ها و تلورانس مجاز خدمات</span>
                    </h3>
                    <p className="text-[11px] text-[#005581]/70 mt-0.5 font-medium">
                      تعیین تعرفه پایه و درصد تلورانس مجاز به تفکیک خدمات دندان‌پزشکی
                    </p>
                  </div>
                  <span className="text-xs bg-[#ffe552] text-[#005581] font-black px-2.5 py-1 rounded-full border border-[#ffd200]">
                    {toFa(tariffRules.length)} قاعده تعرفه ثبت‌شده
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#72cdf4]">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#005581] text-white font-black">
                      <tr>
                        <th className="p-3">کد خدمت</th>
                        <th className="p-3">عنوان درمان</th>
                        <th className="p-3">تعرفه پایه (ریال)</th>
                        <th className="p-3">تلورانس مجاز</th>
                        <th className="p-3">سقف مجاز (ریال)</th>
                        <th className="p-3">نسخه پین‌شده</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#72cdf4]/40 text-[#005581] bg-white">
                      {tariffRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-[#72cdf4]/10 transition-colors">
                          <td className="p-3 font-mono font-black">{rule.procedureCode}</td>
                          <td className="p-3 font-bold">{rule.procedureTitle}</td>
                          <td className="p-3 font-medium">{toFa((rule.baseTariff || 0).toLocaleString('fa-IR'))}</td>
                          <td className="p-3 font-black text-[#005581] bg-[#ffe552]/40">+{toFa(rule.tolerancePercentage)}٪</td>
                          <td className="p-3 font-black text-emerald-900 bg-emerald-50">
                            {toFa((rule.maxAllowedAmount || 0).toLocaleString('fa-IR'))}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#005581]/70">{rule.pinnedVersion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submitted Rule Change Requests List */}
              <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#72cdf4] space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2.5">
                  <div>
                    <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#005581]" />
                      <span>پیگیری درخواست‌های تغییر قوانین ارسالی به تیم دنتورا</span>
                    </h3>
                    <p className="text-[11px] text-[#005581]/70 mt-0.5 font-medium">
                      درخواست‌های ثبت‌شده توسط راهبر سیستم بدون نیاز به کدنویسی
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {ruleRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white p-4 rounded-xl border-2 border-[#72cdf4] space-y-2 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#72cdf4]/40 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-black bg-[#005581] text-[#ffe552] px-2 py-0.5 rounded">
                            {req.id}
                          </span>
                          <span className="text-xs font-black text-[#005581]">{req.requestTitle}</span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                            req.status === 'deployed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : req.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          {req.statusTitle} ({req.targetVersion})
                        </span>
                      </div>

                      <p className="text-xs text-[#005581]/90 font-bold leading-relaxed">{req.proposedRuleDetails}</p>

                      <div className="flex items-center justify-between text-[10px] text-[#005581]/70 font-medium pt-1">
                        <span>دسته: {req.categoryTitle} • ثبت‌کننده: {req.submittedBy}</span>
                        <span>تاریخ ثبت: {req.submittedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RBAC & USER MANAGEMENT (مدیریت کاربران و سطوح دسترسی) */}
      {/* ========================================================================= */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Top Bar: Search, Filters & Create User */}
          <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#005581]/60 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="جستجوی نام، کد نظام یا کد پرسنلی..."
                  className="w-full pr-9 pl-3 py-2 bg-white rounded-xl border border-[#72cdf4] text-xs font-bold text-[#005581] focus:ring-2 focus:ring-[#005581] outline-none"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1 bg-[#72cdf4]/15 p-1 rounded-xl border border-[#72cdf4] text-xs">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                    userRoleFilter === 'all' ? 'bg-[#005581] text-white' : 'text-[#005581]'
                  }`}
                >
                  همه نقش‌ها
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('claim_reviewer')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                    userRoleFilter === 'claim_reviewer' ? 'bg-[#005581] text-white' : 'text-[#005581]'
                  }`}
                >
                  ارزیاب ادعا
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('medical_doctor')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                    userRoleFilter === 'medical_doctor' ? 'bg-[#005581] text-white' : 'text-[#005581]'
                  }`}
                >
                  پزشک معتمد
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('insurance_manager')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                    userRoleFilter === 'insurance_manager' ? 'bg-[#005581] text-white' : 'text-[#005581]'
                  }`}
                >
                  مدیر بیمه
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4 text-[#ffe552]" />
              <span>ایجاد حساب کاربر جدید (RBAC)</span>
            </button>
          </div>

          {/* User List Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((usr) => (
              <div
                key={usr.id}
                className="bg-white rounded-2xl p-5 border-2 border-[#72cdf4] space-y-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-[#72cdf4]/40 pb-2.5">
                    <div>
                      <h3 className="text-sm font-black text-[#005581]">{usr.fullName}</h3>
                      <span className="text-[11px] font-bold text-[#005581]/75 block mt-0.5">
                        {usr.roleTitle}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                        usr.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {usr.status === 'active' ? 'فعال در سیستم' : 'غیرفعال'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#005581]">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-[10px] opacity-75">شناسه/کد:</span>
                      <span className="font-mono bg-[#72cdf4]/20 px-2 py-0.5 rounded text-[11px]">
                        {usr.medicalCouncilOrStaffCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-[11px]">
                      <span className="text-[10px] opacity-75">ایمیل / شناسه:</span>
                      <span>{usr.emailPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] opacity-75">شماره تماس:</span>
                      <span className="font-mono">{usr.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#72cdf4]/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <Lock className={`w-3.5 h-3.5 ${usr.isDigitalSignatureActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>امضا: {usr.isDigitalSignatureActive ? 'فعال' : 'غیرفعال'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(usr.id)}
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border cursor-pointer transition-all ${
                        usr.status === 'active'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                      }`}
                    >
                      {usr.status === 'active' ? 'غیرفعالسازی' : 'فعالسازی'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenUserEdit(usr)}
                    className="w-full bg-[#005581] hover:bg-[#003d5c] text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-[#ffe552]" />
                    <span>تغییر اطلاعات</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI MONITORING & DIGITAL SIGNATURE OVERRIDE LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'ai_config' && (
        <div className="space-y-6">
          {/* AI Model Routing Queues Monitoring & Configuration */}
          <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2">
              <h2 className="text-sm font-black text-[#005581] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#005581]" />
                <span>نظارت بر وضعیت مدل‌های هوش مصنوعیِ همکار در صف‌های مسیریابی (Routing Queues)</span>
              </h2>
              <span className="bg-[#ffe552] text-[#005581] text-xs font-black px-3 py-1 rounded-full border border-[#ffd200]">
                ۳ مدل فعال سیستمی
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Express Queue AI Config */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#72cdf4] space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2">
                  <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#005581]" />
                    <span>صف مسیر سریع (Express Queue)</span>
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-300">
                    ریسک زیر ۳۰٪
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#005581] block">مدل هوش مصنوعی تخصیص‌یافته:</label>
                  <select
                    value={expressModel}
                    onChange={(e) => setExpressModel(e.target.value as any)}
                    className="w-full p-2.5 bg-[#fffffa] rounded-xl border-2 border-[#72cdf4] text-xs font-black text-[#005581] outline-none cursor-pointer"
                  >
                    <option value="gemini_flash">Gemini 2.5 Flash (سرعت بالا - پردازش آنی)</option>
                    <option value="gemini_pro">Gemini 2.5 Pro (دقت بالینی بالا)</option>
                  </select>
                </div>

                <div className="bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4]/50 text-xs space-y-1 text-[#005581]">
                  <div className="flex justify-between font-bold">
                    <span>میانگین زمان پاسخ:</span>
                    <span>۰.۸ ثانیه</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>وضعیت پایش سرویس:</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>آنلاین و پایدار</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Standard Queue AI Config */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#72cdf4] space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2">
                  <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#005581]" />
                    <span>صف ارزیابی معمولی (Standard Queue)</span>
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300">
                    ریسک ۳۰٪ تا ۷۰٪
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#005581] block">مدل هوش مصنوعی تخصیص‌یافته:</label>
                  <select
                    value={standardModel}
                    onChange={(e) => setStandardModel(e.target.value as any)}
                    className="w-full p-2.5 bg-[#fffffa] rounded-xl border-2 border-[#72cdf4] text-xs font-black text-[#005581] outline-none cursor-pointer"
                  >
                    <option value="gemini_flash">Gemini 2.5 Flash (سرعت بالا)</option>
                    <option value="gemini_pro">Gemini 2.5 Pro (متوازن و دقیق)</option>
                  </select>
                </div>

                <div className="bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4]/50 text-xs space-y-1 text-[#005581]">
                  <div className="flex justify-between font-bold">
                    <span>میانگین زمان پاسخ:</span>
                    <span>۱.۴ ثانیه</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>وضعیت پایش سرویس:</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>آنلاین و پایدار</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Deep Review Queue AI Config */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#005581] space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#005581] pb-2">
                  <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#005581]" />
                    <span>صف بررسی عمیق (Deep Review)</span>
                  </h3>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded border border-rose-300">
                    ریسک بالای ۷۰٪
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#005581] block">مدل هوش مصنوعی تخصیص‌یافته:</label>
                  <select
                    value={deepModel}
                    onChange={(e) => setDeepModel(e.target.value as any)}
                    className="w-full p-2.5 bg-[#fffffa] rounded-xl border-2 border-[#005581] text-xs font-black text-[#005581] outline-none cursor-pointer"
                  >
                    <option value="gemini_pro">Gemini 2.5 Pro (عمیق متنی و گرافی)</option>
                    <option value="antigravity">Antigravity Agent (تحلیل کامل RVG + آئین‌نامه)</option>
                  </select>
                </div>

                <div className="bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4]/50 text-xs space-y-1 text-[#005581]">
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>وضعیت پایش سرویس:</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>آنلاین و پایدار</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DIGITAL SIGNATURE LOGS FOR AI OVERRIDES */}
          <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2.5">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#005581]" />
                <div>
                  <h3 className="text-xs font-black text-[#005581]">
                    بازبینی لاگ‌های امضای دیجیتال (Digital Signature Logs) - موارد Override هوش مصنوعی
                  </h3>
                  <p className="text-[10px] text-[#005581]/70 font-bold mt-0.5">
                    ثبت رسمی و حقوقی تمامی مواردی که بازبینان یا پزشکان معتمد پیشنهاد هوش مصنوعی را تغییر داده‌اند.
                  </p>
                </div>
              </div>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-rose-300">
                ۲ مورد Override ثبت‌شده
              </span>
            </div>

            <div className="bg-white rounded-xl border-2 border-[#72cdf4] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead className="bg-[#005581] text-white font-black text-[11px]">
                    <tr>
                      <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap">کد ادعا</th>
                      <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap">بازبین / پزشک اقدام‌کننده</th>
                      <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap">پیشنهاد اولیه AI</th>
                      <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap">اقدام و تصمیم نهایی (Override)</th>
                      <th className="p-3 border-b border-[#72cdf4]/40 min-w-[220px]">دلیل و مستندات Override</th>
                      <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap text-center">امضای دیجیتال غیرقابل تغییر</th>
                      <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap text-center">زمان ثبت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#72cdf4]/40 text-[#005581] font-bold">
                    <tr className="hover:bg-[#72cdf4]/10 transition-colors">
                      <td className="p-3 font-mono font-black bg-[#72cdf4]/10 text-[#005581] whitespace-nowrap">
                        CLM-140505-002
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span>کارشناس نیلوفر احمدی</span>
                        <span className="block text-[10px] opacity-70 font-mono font-normal">کد پرسنلی: INS-4402</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-300 inline-block">
                          تأیید اتوماتیک ۱۰۰٪ (۴۲,۰۰۰,۰۰۰ ریال)
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-black border border-amber-300 inline-block">
                          اعمال کسر ۳۱٪ مازاد تعرفه پایه
                        </span>
                      </td>
                      <td className="p-3 text-[11px] font-medium leading-relaxed">
                        مبلغ ادعاشده فراتر از سقف تعرفه مصوب قرارداد بیمه دانا است (+۳۱٪). کسر مغایرت تعرفه به مبلغ ۱۰,۰۰۰,۰۰۰ ریال اعمال شد.
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="font-mono text-[10px] bg-[#005581] text-white px-2 py-0.5 rounded font-black block">
                          0x7b11a90e3f88c1229a44018283eb9111823
                        </span>
                        <span className="text-[9px] text-emerald-700 font-black mt-0.5 block">✓ امضای معتبر با کلید اختصاصی</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap font-mono text-[11px]">
                        ۱۴۰۵/۰۵/۱۲ ۱۵:۱۰:۴۴
                      </td>
                    </tr>

                    <tr className="hover:bg-[#72cdf4]/10 transition-colors">
                      <td className="p-3 font-mono font-black bg-[#72cdf4]/10 text-[#005581] whitespace-nowrap">
                        CLM-140505-003
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span>دکتر کاوه نوری</span>
                        <span className="block text-[10px] opacity-70 font-mono font-normal">نظام پزشکی: ۹۹۲۸۱</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black border border-amber-300 inline-block">
                          ارجاع به بررسی با ۵۰٪ پرداخت پیش‌فرض
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-black border border-rose-300 inline-block">
                          رد کامل ادعا (۰ ریال)
                        </span>
                      </td>
                      <td className="p-3 text-[11px] font-medium leading-relaxed">
                        تصویر رادیوگرافی RVG قبل از کار برای روکش SSC دندان ۵۵ ارائه نشده است. طبق دستورالعمل بالینی رد کامل گردید.
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="font-mono text-[10px] bg-[#005581] text-white px-2 py-0.5 rounded font-black block">
                          0x3c99a80b1277f981022e331190458821932
                        </span>
                        <span className="text-[9px] text-emerald-700 font-black mt-0.5 block">✓ امضای معتبر با کلید اختصاصی</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap font-mono text-[11px]">
                        ۱۴۰۵/۰۵/۱۳ ۱۰:۲۰:۱۲
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT LOGS & INTEGRATED CLAIM-BY-CLAIM HISTORIES */}
      {/* ========================================================================= */}
      {activeTab === 'worm_logs' && (
        <div className="space-y-6">
          {/* Header Banner & Search Filter */}
          <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#005581]" />
                <h2 className="text-sm font-black text-[#005581]">
                  دفترچه حسابرسی غیرقابل تغییر و تاریخچه یکپارچه ادعاها
                </h2>
              </div>
              <p className="text-xs text-[#005581]/80 mt-1 font-medium">
                نمایش کامل و یکپارچه تمامی اقدامات، نظرات تخصصی و تصمیمات ثبت‌شده توسط کارشناس ادعا و پزشک معتمد به تفکیک هر ادعا.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#005581]/60 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={wormSearchQuery}
                  onChange={(e) => setWormSearchQuery(e.target.value)}
                  placeholder="جستجوی شماره پرونده، نام بیمار، کلینیک یا بازبین..."
                  className="pr-9 pl-3 py-2 bg-white rounded-xl border border-[#72cdf4] text-xs font-bold text-[#005581] focus:ring-2 focus:ring-[#005581] outline-none min-w-[260px]"
                />
              </div>
            </div>
          </div>

          {/* INTEGRATED CLAIM-BY-CLAIM AUDIT CARDS */}
          <div className="space-y-6">
            {[
              {
                claimNumber: 'CLM-140505-001',
                patientName: 'علی محمدی',
                patientNationalId: '0012345678',
                clinicName: 'کلینیک دندان‌پزشکی دنتورا - شعبه ونک',
                clinicTrustLevel: 'L3 (Dentora Verified)',
                serviceDate: '۱۴۰۵/۰۵/۱۱',
                totalClaimedAmount: 30000000,
                totalApprovedAmount: 27000000,
                status: 'approved',
                statusTitle: 'تأیید نهایی شده',
                statusBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                // Claim Reviewer Section
                claimReviewer: {
                  name: 'کارشناس نیلوفر احمدی',
                  code: 'کد پرسنلی: INS-4402',
                  action: 'بررسی مالی و تطبیق با مصوبات و الحاقیه سقف بیمه تکمیلی ایران (GOVAH-1405-9921)',
                  details: 'تأیید مبلغ ۲۷,۰۰۰,۰۰۰ ریال (شامل ۹۰٪ پوشش عصب‌کشی + ۸۰٪ پوشش روکش PFM). فرانشیز و سقف پوشش کنترل شد.',
                  timestamp: '۱۴۰۵/۰۵/۱۱ ۱۱:۳۵:۰۲',
                },
                // Medical Reviewer Section
                medicalReviewer: {
                  name: 'دکتر کاوه نوری',
                  code: 'شماره نظام پزشکی: ۹۹۲۸۱ (پزشک معتمد)',
                  action: 'ارزیابی تخصصی رادیوگرافی RVG پری‌اپیکال دندان ۱۶ و انطباق طرح درمان',
                  details: 'تصویر RVG عالی است (وضوح ۹۶٪). پرکردگی هر ۳ کانال تا آپکس مشخص است. انطباق بالینی تأیید گردید.',
                  signatureHash: '0x8f2a9d12e84c91038b71a19082ec1923847',
                  timestamp: '۱۴۰۵/۰۵/۱۱ ۱۱:۳۶:۱۰',
                },
                // WORM Metadata
                wormId: 'AUD-882190',
                wormHash: '0x8f2a9d12e84c91038b71a19082ec1923847',
                ruleVersion: 'v2.1-2026',
                aiModelVersion: 'Dentura-AI-v3.4',
              },
              {
                claimNumber: 'CLM-140505-002',
                patientName: 'سارا حسینی',
                patientNationalId: '0076543210',
                clinicName: 'کلینیک دندان‌پزشکی دنتورا - شعبه ونک',
                clinicTrustLevel: 'L2 (Dentora Connected)',
                serviceDate: '۱۴۰۵/۰۵/۱۲',
                totalClaimedAmount: 42000000,
                totalApprovedAmount: 32000000,
                status: 'partially_approved',
                statusTitle: 'تأیید با کسر تعرفه مازاد (+۳۱٪)',
                statusBg: 'bg-amber-100 text-amber-900 border-amber-300',
                // Claim Reviewer Section
                claimReviewer: {
                  name: 'کارشناس نیلوفر احمدی',
                  code: 'کد پرسنلی: INS-4402',
                  action: 'شناسایی مغایرت تعرفه و اعمال کسر مازاد بر تلورانس پایه بیمه دانا',
                  details: 'مبلغ ادعاشده ۴۲,۰۰۰,۰۰۰ ریال است. کسر ۱۰,۰۰۰,۰۰۰ ریال به دلیل تجاوز از تلورانس پایه (+۳۱٪) اعمال گردید. مبلغ مصوب ۳۲,۰۰۰,۰۰۰ ریال.',
                  timestamp: '۱۴۰۵/۰۵/۱۲ ۱۵:۱۰:۴۴',
                },
                // Medical Reviewer Section
                medicalReviewer: {
                  name: 'دکتر کاوه نوری',
                  code: 'شماره نظام پزشکی: ۹۹۲۸۱ (پزشک معتمد)',
                  action: 'بررسی سی‌بی‌سی‌تی مقطعی فک پایین ناحیه ۳۶ و گواهی پیش از درمان',
                  details: 'ارتفاع و عرض استخوان فک در CBCT برای کاشت فیکسچر ۴.۵ میلی‌متری کافی است. لزوم درمان بالینی تأیید شد.',
                  signatureHash: '0x7b11a90e3f88c1229a44018283eb9111823',
                  timestamp: '۱۴۰۵/۰۵/۱۲ ۱۵:۱۲:۰۰',
                },
                // WORM Metadata
                wormId: 'AUD-882191',
                wormHash: '0x7b11a90e3f88c1229a44018283eb9111823',
                ruleVersion: 'v2.1-2026',
                aiModelVersion: 'Dentura-AI-v3.4',
              },
              {
                claimNumber: 'CLM-140505-003',
                patientName: 'آراد رضایی (کودک)',
                patientNationalId: '0055112233',
                clinicName: 'مرکز دندان‌پزشکی سلامت مهر',
                clinicTrustLevel: 'L1 (Dentora Basic)',
                serviceDate: '۱۴۰۵/۰۵/۱۳',
                totalClaimedAmount: 9000000,
                totalApprovedAmount: 0,
                status: 'rejected',
                statusTitle: 'رد ادعا (عدم ارائه کلیشه RVG)',
                statusBg: 'bg-rose-100 text-rose-900 border-rose-300',
                // Claim Reviewer Section
                claimReviewer: {
                  name: 'کارشناس نیلوفر احمدی',
                  code: 'کد پرسنلی: INS-4402',
                  action: 'بررسی پرونده کودک و ارجاع به بررسی عمیق (Deep Review)',
                  details: 'عدم وجود تصویر رادیوگرافی قبل از کار برای روکش SSC دندان شیری ۵۵. پرونده ناقص به پزشک ارجاع شد.',
                  timestamp: '۱۴۰۵/۰۵/۱۳ ۱۰:۱۵:۰۰',
                },
                // Medical Reviewer Section
                medicalReviewer: {
                  name: 'دکتر کاوه نوری',
                  code: 'شماره نظام پزشکی: ۹۹۲۸۱ (پزشک معتمد)',
                  action: 'ارزیابی بالینی و صدور رای رد ادعا به علت عدم ارائه رادیوگرافی',
                  details: 'به دلیل عدم ارائه رادیوگرافی پری‌اپیکال قبل از کار، ضرورت درمان روکش SSC احراز نگردید. رد کامل ثبت شد.',
                  signatureHash: '0x3c99a80b1277f981022e331190458821932',
                  timestamp: '۱۴۰۵/۰۵/۱۳ ۱۰:۲۰:۱۲',
                },
                // WORM Metadata
                wormId: 'AUD-882192',
                wormHash: '0x3c99a80b1277f981022e331190458821932',
                ruleVersion: 'v2.1-2026',
                aiModelVersion: 'Dentura-AI-v3.4',
              },
            ]
              .filter(
                (c) =>
                  !wormSearchQuery ||
                  c.claimNumber.toLowerCase().includes(wormSearchQuery.toLowerCase()) ||
                  c.patientName.includes(wormSearchQuery) ||
                  c.clinicName.includes(wormSearchQuery) ||
                  c.claimReviewer.name.includes(wormSearchQuery) ||
                  c.medicalReviewer.name.includes(wormSearchQuery)
              )
              .map((claim) => (
                <div
                  key={claim.claimNumber}
                  className="bg-white rounded-2xl border-2 border-[#005581] shadow-md overflow-hidden space-y-0"
                >
                  {/* Integrated Claim Banner */}
                  <div className="bg-[#005581] text-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-black text-sm text-[#ffe552] bg-[#fffffa]/10 px-3 py-1 rounded-xl border border-[#ffe552]/30">
                        {claim.claimNumber}
                      </span>
                      <div>
                        <span className="font-black text-sm block text-white">{claim.patientName}</span>
                        <span className="text-[10px] text-[#72cdf4] font-mono">
                          کد ملی: {claim.patientNationalId} • تاریخ خدمت: {claim.serviceDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#72cdf4]/20 text-[#fffffa] border border-[#72cdf4]/50 px-2.5 py-1 rounded-lg text-[10px] font-black">
                        {claim.clinicName} ({claim.clinicTrustLevel})
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-black border ${claim.statusBg}`}>
                        {claim.statusTitle}
                      </span>
                    </div>
                  </div>

                  {/* Financial Quick Numbers */}
                  <div className="bg-[#72cdf4]/10 px-5 py-2.5 border-b border-[#72cdf4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#005581]">
                    <div>
                      <span className="text-[10px] opacity-75 block font-bold">مبلغ کل ادعاشده:</span>
                      <span className="font-mono font-black">{toFa(claim.totalClaimedAmount.toLocaleString())} ریال</span>
                    </div>
                    <div>
                      <span className="text-[10px] opacity-75 block font-bold">مبلغ مصوب بیمه:</span>
                      <span className="font-mono font-black text-emerald-800">{toFa(claim.totalApprovedAmount.toLocaleString())} ریال</span>
                    </div>
                    <div>
                      <span className="text-[10px] opacity-75 block font-bold">کسورات / عدم تایید:</span>
                      <span className="font-mono font-black text-rose-800">
                        {toFa((claim.totalClaimedAmount - claim.totalApprovedAmount).toLocaleString())} ریال
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] opacity-75 block font-bold">شناسه لاگ غیرقابل تغییر:</span>
                      <span className="font-mono font-black text-[#005581]">{claim.wormId}</span>
                    </div>
                  </div>

                  {/* Main Dual Audit Histories (Section 1: Claim Reviewer, Section 2: Medical Reviewer) */}
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 bg-[#fffffa]">
                    {/* SECTION 1: CLAIM REVIEWER AUDIT LOG (تاریخچه ارزیاب ادعا) */}
                    <div className="bg-white rounded-xl p-4 border-2 border-[#72cdf4] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#72cdf4]">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-[#005581]" />
                          <h4 className="text-xs font-black text-[#005581]">۱. لاگ و تاریخچه بازبین ادعا (Claim Reviewer)</h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#005581]/70 font-bold">{claim.claimReviewer.timestamp}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-[#005581]">
                        <div className="font-black text-[11px] text-[#005581] flex items-center justify-between">
                          <span>{claim.claimReviewer.name}</span>
                          <span className="text-[10px] font-mono opacity-80 font-normal">{claim.claimReviewer.code}</span>
                        </div>
                        <div className="bg-[#72cdf4]/10 p-2.5 rounded-lg border border-[#72cdf4]/40 font-bold text-[11px]">
                          <span className="text-[10px] text-[#005581]/70 block font-bold mb-0.5">اقدام مالی انجام‌شده:</span>
                          <span>{claim.claimReviewer.action}</span>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed bg-[#fffffa] p-2.5 rounded-lg border border-[#72cdf4]/30">
                          <span className="text-[10px] text-[#005581]/70 block font-bold mb-0.5">شرح و جزئیات ارزیابی:</span>
                          {claim.claimReviewer.details}
                        </p>
                      </div>
                    </div>

                    {/* SECTION 2: MEDICAL REVIEWER AUDIT LOG (تاریخچه پزشک معتمد) */}
                    <div className="bg-white rounded-xl p-4 border-2 border-[#005581] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#005581]/30">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-[#005581]" />
                          <h4 className="text-xs font-black text-[#005581]">۲. لاگ و تاریخچه پزشک معتمد (Medical Reviewer)</h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#005581]/70 font-bold">{claim.medicalReviewer.timestamp}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-[#005581]">
                        <div className="font-black text-[11px] text-[#005581] flex items-center justify-between">
                          <span>{claim.medicalReviewer.name}</span>
                          <span className="text-[10px] font-mono opacity-80 font-normal">{claim.medicalReviewer.code}</span>
                        </div>
                        <div className="bg-[#005581]/5 p-2.5 rounded-lg border border-[#005581]/20 font-bold text-[11px]">
                          <span className="text-[10px] text-[#005581]/70 block font-bold mb-0.5">اقدام بالینی و رادیولوژی:</span>
                          <span>{claim.medicalReviewer.action}</span>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed bg-[#fffffa] p-2.5 rounded-lg border border-[#005581]/15">
                          <span className="text-[10px] text-[#005581]/70 block font-bold mb-0.5">شرح نظریه کارشناسی پزشکی:</span>
                          {claim.medicalReviewer.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Verification Seal */}
                  <div className="bg-[#005581]/10 p-3.5 border-t border-[#72cdf4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#005581]">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>ثبت غیرقابل تغییر</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold">
                        هش امضا: <strong className="text-[#005581]">{claim.wormHash}</strong>
                      </span>
                    </div>

                    <div className="text-[10px] font-bold text-[#005581]/80 flex items-center gap-3">
                      <span>ورژن موتور قاعده: <strong className="font-mono">{claim.ruleVersion}</strong></span>
                      <span>ورژن هوش مصنوعی: <strong className="font-mono">{claim.aiModelVersion}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW USER MODAL (ایجاد کاربر جدید RBAC) */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl p-6 border-2 border-[#005581] max-w-lg w-full shadow-2xl space-y-5" dir="rtl">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">تعریف حساب کاربر جدید در سیستم بیمه (RBAC)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-[#005581] hover:bg-[#72cdf4]/30 p-1.5 rounded-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#005581]">
              <div className="space-y-1">
                <label className="font-black block">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="مثلاً: دکتر مریم حسینی"
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black block">نقش کاربری (Role):</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none"
                >
                  <option value="claim_reviewer">بازبین/ارزیاب ادعا (Claim Reviewer)</option>
                  <option value="medical_doctor">پزشک معتمد (Medical Doctor)</option>
                  <option value="insurance_manager">مدیر کلان بیمه (Insurance Manager)</option>
                  <option value="system_admin">ادمین سیستم (System Admin)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-black block">کد نظام پزشکی یا کد پرسنلی:</label>
                <input
                  type="text"
                  value={newUserCode}
                  onChange={(e) => setNewUserCode(e.target.value)}
                  placeholder="مثلاً: نظام پزشکی ۹۸۷۶۵ یا کد INS-8812"
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black block">شماره تماس / ایمیل سازمانی:</label>
                <input
                  type="text"
                  value={newUserContact}
                  onChange={(e) => setNewUserContact(e.target.value)}
                  placeholder="مثلاً: 09121234567 | m.hoseini@insurance.ir"
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#72cdf4]">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#005581] hover:bg-gray-200 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer"
              >
                ثبت کاربر در سیستم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUBMIT RULE CHANGE REQUEST TO DENTURA */}
      {/* ========================================================================= */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl p-6 border-2 border-[#005581] max-w-lg w-full shadow-2xl space-y-5" dir="rtl">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">ثبت درخواست تغییر قوانین به تیم دنتورا</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRequestModal(false)}
                className="text-[#005581] hover:bg-[#72cdf4]/30 p-1.5 rounded-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#005581]">
              <div className="space-y-1">
                <label className="font-black block">عنوان درخواست:</label>
                <input
                  type="text"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="مثلاً: اصلاح آستانه تلورانس روکش سرامیکی PFM"
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black block">دسته‌بندی درخواست:</label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none"
                >
                  <option value="tariff">تعرفه و تلورانس خدمت</option>
                  <option value="risk_threshold">آستانه ریسک مسیریابی (Express/Deep)</option>
                  <option value="clinical_rule">قاعده غربالگری بالینی و RVG</option>
                  <option value="green_lane">ضوابط SLA و تسویه سریع</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-black block">شرح جزئیات تغییر پیشنهادی:</label>
                <textarea
                  rows={4}
                  value={reqDetails}
                  onChange={(e) => setReqDetails(e.target.value)}
                  placeholder="جزئیات تغییرات مدنظر را وارد کنید..."
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black block">اولویت درخواست:</label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-bold outline-none"
                >
                  <option value="normal">عادی (اجرا در نسخه بعدی)</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#72cdf4]">
              <button
                type="button"
                onClick={() => setShowNewRequestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#005581] hover:bg-gray-200 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSubmitRuleRequest}
                className="bg-[#ffe552] hover:bg-[#ffd200] text-[#005581] font-black text-xs px-5 py-2.5 rounded-xl border border-[#ffd200] shadow cursor-pointer"
              >
                ارسال درخواست به دنتورا
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: WORM LOG DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedWormLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl p-6 border-2 border-[#005581] max-w-lg w-full shadow-2xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">جزئیات لاگ امضاشده غیرقابل تغییر</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWormLog(null)}
                className="text-[#005581] hover:bg-[#72cdf4]/30 p-1.5 rounded-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-[#72cdf4] space-y-3 text-xs text-[#005581]">
              <div className="flex justify-between items-center border-b border-[#72cdf4]/40 pb-2">
                <span className="font-bold">شناسه لاگ:</span>
                <span className="font-mono font-black">{selectedWormLog.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#72cdf4]/40 pb-2">
                <span className="font-bold">شماره پرونده / موجودیت:</span>
                <span className="font-mono font-black">{selectedWormLog.entityId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#72cdf4]/40 pb-2">
                <span className="font-bold">اقدام‌کننده:</span>
                <span className="font-black">{selectedWormLog.userName} ({selectedWormLog.userRole})</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#72cdf4]/40 pb-2">
                <span className="font-bold">زمان دقیق ثبت:</span>
                <span className="font-black">{selectedWormLog.timestamp}</span>
              </div>
              <div className="space-y-1">
                <span className="font-bold block">شرح اقدام:</span>
                <p className="bg-[#fffffa] p-2.5 rounded-xl border border-[#72cdf4] font-medium leading-relaxed">
                  {selectedWormLog.details}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold block">کد امضای اختصاصی غیرقابل تغییر:</span>
                <div className="font-mono text-[10px] bg-slate-900 text-emerald-400 p-2.5 rounded-xl break-all">
                  {selectedWormLog.wormVerifiedHash}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedWormLog(null)}
                className="bg-[#005581] text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: USER DETAILS & PHONE/PASSWORD EDIT MODAL */}
      {/* ========================================================================= */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl p-6 border-2 border-[#005581] max-w-md w-full shadow-2xl space-y-5" dir="rtl">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">اطلاعات کاربر و تنظیمات امنیت (RBAC)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="text-[#005581] hover:bg-[#72cdf4]/30 p-1.5 rounded-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editSuccessMsg && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs font-bold text-center animate-fadeIn">
                ✓ {editSuccessMsg}
              </div>
            )}

            <div className="space-y-3 text-xs text-[#005581]">
              <div className="bg-[#72cdf4]/15 p-3.5 rounded-2xl border border-[#72cdf4] space-y-2">
                <div className="flex justify-between font-black text-sm text-[#005581]">
                  <span>{selectedUserForEdit.fullName}</span>
                  <span className="text-xs bg-[#005581] text-white px-2.5 py-0.5 rounded-full">
                    {selectedUserForEdit.roleTitle}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#005581]/80">
                  شناسه / کد نظام: <span className="font-mono">{selectedUserForEdit.medicalCouncilOrStaffCode}</span>
                </div>
              </div>

              {/* Edit Phone Number */}
              <div className="space-y-1">
                <label className="font-black block text-[#005581]">شماره تماس همراه (قابل تغییر):</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="مثلاً: 09121112233"
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-mono font-bold outline-none text-[#005581] focus:ring-2 focus:ring-[#005581]"
                />
              </div>

              {/* Edit Email Address */}
              <div className="space-y-1">
                <label className="font-black block text-[#005581]">آدرس ایمیل / شناسه (قابل تغییر):</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="مثلاً: user@insurance.ir"
                  className="w-full p-2.5 bg-white rounded-xl border-2 border-[#72cdf4] font-mono font-bold outline-none text-[#005581] focus:ring-2 focus:ring-[#005581]"
                />
              </div>

              {/* Edit Password */}
              <div className="space-y-1">
                <label className="font-black block text-[#005581]">رمز عبور حساب کاربری (مشاهده و تغییر دستی):</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="رمز عبور..."
                    className="w-full p-2.5 pl-10 bg-white rounded-xl border-2 border-[#72cdf4] font-mono font-bold outline-none text-[#005581] focus:ring-2 focus:ring-[#005581]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#005581] hover:text-[#003d5c] text-xs font-bold p-1 cursor-pointer"
                  >
                    {showPassword ? 'مخفی' : 'نمایش'}
                  </button>
                </div>
                <p className="text-[10px] text-[#005581]/70 mt-1 font-medium">
                  می‌توانید اطلاعات شامل شماره تماس، ایمیل و رمز عبور این کاربر را دستی تغییر دهید.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#72cdf4]">
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#005581] hover:bg-gray-200 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveUserEdit}
                className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
              >
                <Key className="w-4 h-4 text-[#ffe552]" />
                <span>ذخیره تغییرات اطلاعات کاربر</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
