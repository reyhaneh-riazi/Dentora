import React, { useState } from 'react';
import {
  Crown,
  Building2,
  ShieldCheck,
  Users,
  FileCheck,
  CreditCard,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Settings,
  ToggleLeft,
  ToggleRight,
  Info,
  AlertCircle,
  UserPlus,
  Search,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  ClinicRegistration,
  BaseInsuranceContract,
  SupplementaryInsuranceContract,
} from '../../types';
import { toPersianDigits, formatPricePersian } from '../../utils/persianDigits';

interface OwnerWorkspaceProps {
  currentClinic: ClinicRegistration;
  onUpdateClinicInfo?: (updated: Partial<ClinicRegistration>) => void;
  
  // Users & Roles
  users: UserProfile[];
  onAddEmployee: (employee: UserProfile) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole, isOwner: boolean) => void;
  
  // Module & Financial Policies
  insuranceModuleActive: boolean;
  onToggleInsuranceModule: () => void;
  isInsuranceContracted: boolean;
  onToggleInsuranceContracted: () => void;
  bnplActive: boolean;
  onToggleBnplActive: () => void;
  hasAccountantRole: boolean;
  onToggleHasAccountantRole: () => void;

  // Base & Supplementary Insurances
  baseInsurances: BaseInsuranceContract[];
  onToggleBaseInsuranceContracted: (id: string) => void;
  onUpdateBaseInsuranceFranchise: (id: string, franchisePercent: number) => void;

  supplementaryInsurances: SupplementaryInsuranceContract[];
  onToggleSupplementaryInsuranceContracted: (id: string) => void;
  onToggleSupplementaryFastSettlement: (id: string) => void;
  onUpdateSupplementaryMaxCoverage: (id: string, maxCoverage: number) => void;
}

export const OwnerWorkspace: React.FC<OwnerWorkspaceProps> = ({
  currentClinic,
  onUpdateClinicInfo,
  users,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateUserRole,
  insuranceModuleActive,
  onToggleInsuranceModule,
  isInsuranceContracted,
  onToggleInsuranceContracted,
  bnplActive,
  onToggleBnplActive,
  hasAccountantRole,
  onToggleHasAccountantRole,
  baseInsurances,
  onToggleBaseInsuranceContracted,
  onUpdateBaseInsuranceFranchise,
  supplementaryInsurances,
  onToggleSupplementaryInsuranceContracted,
  onToggleSupplementaryFastSettlement,
  onUpdateSupplementaryMaxCoverage,
}) => {
  const [activeTab, setActiveTab] = useState<'insurances' | 'policies' | 'roles' | 'clinic_info'>('insurances');
  const [showDistinctionDetails, setShowDistinctionDetails] = useState(false);

  // Search in user management
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Add User Modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserNationalId, setNewUserNationalId] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('dentist');
  const [newUserSpecialty, setNewUserSpecialty] = useState('');
  const [newUserIsOwner, setNewUserIsOwner] = useState(false);

  // Edit User Modal State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('dentist');
  const [editIsOwner, setEditIsOwner] = useState(false);

  // Clinic info edit state
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [clinicNameInput, setClinicNameInput] = useState(currentClinic.name);
  const [ownerNameInput, setOwnerNameInput] = useState(currentClinic.ownerName);
  const [ownerMobileInput, setOwnerMobileInput] = useState(currentClinic.ownerMobile);

  const filteredUsers = users.filter((u) => {
    // Only clinic roles (not insurance roles or external roles)
    const validClinicRoles: UserRole[] = ['dentist', 'receptionist', 'manager', 'owner'];
    if (hasAccountantRole) {
      validClinicRoles.push('accountant');
    }
    if (!validClinicRoles.includes(u.role)) {
      return false;
    }

    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.nationalId.includes(q) ||
      u.phone.includes(q) ||
      (u.specialty && u.specialty.toLowerCase().includes(q))
    );
  });

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) {
      alert('لطفاً نام و شماره همراه پرسنل را وارد نمایید.');
      return;
    }

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      nationalId: newUserNationalId.trim() || '0011223344',
      phone: newUserPhone.trim(),
      role: newUserRole,
      specialty: newUserSpecialty.trim() || undefined,
      branchIds: ['br-1'],
      isOwner: newUserIsOwner,
    };

    onAddEmployee(newUser);
    setIsAddUserModalOpen(false);
    // Reset form
    setNewUserName('');
    setNewUserNationalId('');
    setNewUserPhone('');
    setNewUserRole('dentist');
    setNewUserSpecialty('');
    setNewUserIsOwner(false);
  };

  const handleStartEditUser = (u: UserProfile) => {
    setEditingUserId(u.id);
    setEditRole(u.role);
    setEditIsOwner(!!u.isOwner || u.role === 'owner');
  };

  const handleSaveEditUser = () => {
    if (editingUserId) {
      onUpdateUserRole(editingUserId, editRole, editIsOwner);
      setEditingUserId(null);
    }
  };

  const handleSaveClinicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateClinicInfo) {
      onUpdateClinicInfo({
        name: clinicNameInput.trim(),
        ownerName: ownerNameInput.trim(),
        ownerMobile: ownerMobileInput.trim(),
      });
    }
    setIsEditingClinic(false);
  };

  const roleLabels: Record<UserRole, { title: string; badgeColor: string }> = {
    owner: { title: 'مالک سازمان / کلینیک', badgeColor: 'bg-[#ffd200] text-[#005581]' },
    manager: { title: 'مدیر کلینیک', badgeColor: 'bg-[#72cdf4] text-[#005581]' },
    dentist: { title: 'پزشک معالج / دندان‌پزشک', badgeColor: 'bg-[#ffe552] text-[#005581]' },
    receptionist: { title: 'مسئول پذیرش / منشی', badgeColor: 'bg-[#005581] text-[#fffffa]' },
    accountant: { title: 'حسابدار / مدیر مالی', badgeColor: 'bg-[#004266] text-[#fffffa]' },
    patient: { title: 'بیمار', badgeColor: 'bg-slate-200 text-slate-800' },
    reviewer: { title: 'بازبین ادعا', badgeColor: 'bg-[#003350] text-[#fffffa]' },
    medical_inspector: { title: 'بازبین پزشکی', badgeColor: 'bg-[#003350] text-[#fffffa]' },
    insurance_manager: { title: 'مدیر بیمه', badgeColor: 'bg-[#005581] text-[#fffffa]' },
    insurer_admin: { title: 'ادمین بیمه', badgeColor: 'bg-[#003350] text-[#fffffa]' },
    lab: { title: 'پورتال لابراتوار', badgeColor: 'bg-[#005581] text-[#fffffa]' },
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Distinction Explanatory Banner (Owner vs Manager) - Collapsible Accordion */}
      <div className="rounded-2xl bg-[#ffd200]/15 border border-[#ffd200]/50 text-[#005581] dark:text-[#fffffa] dark:bg-slate-900/90 dark:border-[#ffd200]/30 text-xs shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowDistinctionDetails(!showDistinctionDetails)}
          className="w-full p-4 flex items-center justify-between gap-3 text-right cursor-pointer hover:bg-[#ffd200]/25 transition"
        >
          <div className="flex items-center gap-2 font-black text-sm">
            <Sparkles className="w-5 h-5 text-[#005581] dark:text-[#ffd200] shrink-0" />
            <span>تفاوت کلیدی نقش «Owner (مالک)» و «مدیر کلینیک (Manager)» در ساختار دنتورا</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#005581] dark:text-[#ffd200] shrink-0 bg-[#ffd200]/30 dark:bg-[#ffd200]/20 px-2.5 py-1 rounded-lg">
            <span>{showDistinctionDetails ? 'بستن' : 'اطلاعات بیشتر'}</span>
            {showDistinctionDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showDistinctionDetails && (
          <div className="px-4 pb-4 pt-1 border-t border-[#ffd200]/30 space-y-2.5 leading-relaxed text-slate-700 dark:text-slate-300 text-xs animate-fadeIn">
            <p>
              نقش <strong>Owner (مالک کلینیک)</strong> در بالاترین سطح اختیارات حقوقی و مالی سازمان قرار دارد. 
              مالک مشخص می‌کند کلینیک با چه بیمه‌های پایه (تأمین اجتماعی، سلامت، نیروهای مسلح) و تکمیلی (ایران، دانا، آسیا، البرز، پارسیان و ...) طرف قرارداد باشد، سقف تعهدات و فرانشیز بیمه‌ها چقدر باشد، و چه پرسنلی در چه نقش‌هایی (دندان‌پزشک، مدیر کلینیک، حسابدار، منشی) فعالیت نمایند.
            </p>
            <p>
              همچنین فعال یا غیرفعال‌سازی ماژول‌های اساسی کلینیک (شامل ماژول استعلام و نسخه‌نویسی بیمه، و سامانه پرداخت اعتباری BNPL) مستقیماً توسط مالک صورت می‌پذیرد.
            </p>

            <div className="p-3 rounded-xl bg-[#ffd200]/30 dark:bg-[#ffd200]/20 font-bold text-[#005581] dark:text-[#ffd200] flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-[#005581] dark:text-[#ffd200]" />
              <span>مالک کلینیک می‌تواند هم‌زمان خودش دندان‌پزشک معالج، مدیر کلینیک، یا حسابدار نیز باشد و تمامی دسترسی‌های تخصصی هر دو نقش در یک محیط یکپارچه در اختیار او قرار می‌گیرد.</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('insurances')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'insurances'
              ? 'bg-[#005581] text-[#fffffa] shadow-md ring-2 ring-[#72cdf4]/40'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#ffd200]" />
          <span>۱. بیمه‌های طرف قرارداد کلینیک (پایه و تکمیلی)</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-[#005581] text-[#fffffa] shadow-md ring-2 ring-[#72cdf4]/40'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4 text-[#ffd200]" />
          <span>۲. تنظیمات ماژول‌ها و سیاست مالی (بیمه و BNPL)</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-[#005581] text-[#fffffa] shadow-md ring-2 ring-[#72cdf4]/40'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-[#ffd200]" />
          <span>۳. تعیین نقش‌ها و دسترسی پرسنل</span>
        </button>

        <button
          onClick={() => setActiveTab('clinic_info')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeTab === 'clinic_info'
              ? 'bg-[#005581] text-[#fffffa] shadow-md ring-2 ring-[#72cdf4]/40'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#ffd200]" />
          <span>۴. اطلاعات و شناسنامه سازمان</span>
        </button>
      </div>

      {/* TAB 1: CONTRACTED INSURANCES (BASE & SUPPLEMENTARY) */}
      {activeTab === 'insurances' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Global Contracted Status Header Switch */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#005581] dark:text-[#72cdf4] font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-[#005581] dark:text-[#ffd200]" />
                <span>حالت کلی کلینیک از نظر پذیرش بیمه:</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                در صورت فعال بودن، کلینیک خدمات بیمه‌ای مستقیم ارائه می‌دهد. در غیر این صورت، خدمات به صورت کامل آزاد محاسبه شده و فاکتور رسمی به بیمار تحویل می‌گردد.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleInsuranceContracted}
              className={`px-5 py-3 rounded-2xl border font-black text-xs transition flex items-center gap-3 shadow-md cursor-pointer shrink-0 ${
                isInsuranceContracted
                  ? 'bg-[#005581] text-[#fffffa] border-[#004266]'
                  : 'bg-[#ffd200] text-[#005581] border-[#ffe552]'
              }`}
            >
              {isInsuranceContracted ? (
                <>
                  <ToggleRight className="w-6 h-6 text-[#ffd200]" />
                  <span>طرف قرارداد مستقیم با بیمه‌ها (فعال)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-[#005581]" />
                  <span>غیر طرف قرارداد (آزاد + فاکتور رسمی)</span>
                </>
              )}
            </button>
          </div>

          {/* Section 1.1: Base Insurances */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#005581]"></span>
                  <span>تعیین بیمه‌های پایه طرف قرارداد (Social & Base Insurances)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  تعیین فعال بودن قرارداد با بیمه‌های اصلی کشور و درصد فرانشیز سهم بیمار
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-[#005581]/10 text-[#005581] dark:text-[#72cdf4] font-bold text-xs font-mono">
                {toPersianDigits(baseInsurances.filter((b) => b.contracted).length)} از {toPersianDigits(baseInsurances.length)} بیمه فعال
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baseInsurances.map((base) => (
                <div
                  key={base.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    base.contracted
                      ? 'bg-white dark:bg-slate-800/80 border-[#005581]/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        base.contracted ? 'bg-[#005581] text-[#fffffa]' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {base.code.substring(0, 3)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{base.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">کد شناسه: {base.code}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleBaseInsuranceContracted(base.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        base.contracted
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {base.contracted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>طرف قرارداد</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>غیر طرف قرارداد</span>
                        </>
                      )}
                    </button>
                  </div>

                  {base.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg">
                      {base.description}
                    </p>
                  )}

                  {base.contracted && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">درصد فرانشیز سهم بیمار:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={base.franchisePercent}
                          onChange={(e) => onUpdateBaseInsuranceFranchise(base.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-center font-mono font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#005581]"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">درصد</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 1.2: Supplementary Insurances */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#72cdf4]"></span>
                  <span>تعیین بیمه‌های تکمیلی طرف قرارداد (Supplementary Commercial Insurances)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  مدیریت شرکت‌های بیمه تکمیلی، فعال‌سازی تسویه سریع L4 و تعیین سقف تعهد ریالی
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-[#72cdf4]/20 text-[#005581] dark:text-[#72cdf4] font-bold text-xs font-mono">
                {toPersianDigits(supplementaryInsurances.filter((s) => s.contracted).length)} از {toPersianDigits(supplementaryInsurances.length)} شرکت فعال
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplementaryInsurances.map((suppl) => (
                <div
                  key={suppl.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    suppl.contracted
                      ? 'bg-white dark:bg-slate-800/80 border-[#72cdf4]/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{suppl.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{suppl.code}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleSupplementaryInsuranceContracted(suppl.id)}
                      className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                        suppl.contracted
                          ? 'bg-[#005581] text-[#fffffa]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {suppl.contracted ? 'طرف قرارداد' : 'غیر فعال'}
                    </button>
                  </div>

                  {suppl.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg leading-relaxed">
                      {suppl.description}
                    </p>
                  )}

                  {suppl.contracted && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                      {/* Fast Settlement Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-[#005581]" />
                          <span>تسویه سریع ۴۹ ساعته L4:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleSupplementaryFastSettlement(suppl.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                            suppl.fastSettlementL4
                              ? 'bg-[#ffd200] text-[#005581]'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {suppl.fastSettlementL4 ? 'فعال (L4)' : 'عادی'}
                        </button>
                      </div>

                      {/* Max Coverage Input */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-500">سقف تعهد سالانه (تومان):</span>
                        <input
                          type="number"
                          step="1000000"
                          value={suppl.maxCoveragePerPatient}
                          onChange={(e) => onUpdateSupplementaryMaxCoverage(suppl.id, Number(e.target.value))}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono text-xs font-bold text-[#005581] dark:text-[#72cdf4] text-left dir-ltr"
                        />
                        <span className="text-[10px] text-slate-400 font-mono block text-right">
                          {formatPricePersian(suppl.maxCoveragePerPatient)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODULES & FINANCIAL POLICIES (INSURANCE & BNPL) */}
      {activeTab === 'policies' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Policy Card 1: Insurance Module Toggle */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#005581]/10 text-[#005581] dark:text-[#72cdf4] flex items-center justify-center font-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={onToggleInsuranceModule}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                    insuranceModuleActive
                      ? 'bg-[#005581] text-[#fffffa]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {insuranceModuleActive ? <ToggleRight className="w-5 h-5 text-[#ffd200]" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{insuranceModuleActive ? 'فعال' : 'غیر فعال'}</span>
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  ماژول بیمه و محاسبات پوشش درمان
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  تعیین فعال یا غیرفعال بودن محاسبات بیمه‌ای در پورتال دندان‌پزشکان، پذیرش و حسابداری. در صورت فعال بودن، استعلام آنی سقف تعهد بیمه و پیش‌نویس ادعاهای مالی فعال می‌شود.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">وضعیت جاری:</span>
                <p className="text-[#005581] dark:text-[#72cdf4] font-semibold">
                  {insuranceModuleActive
                    ? 'ماژول بیمه فعال است (دندان‌پزشک و منشی سهم بیمه پایه و تکمیلی را مشاهده می‌کنند).'
                    : 'ماژول بیمه غیرفعال است (تمامی فاکتورها به صورت ۱۰۰٪ آزاد محاسبه می‌شوند).'}
                </p>
              </div>
            </div>

            {/* Policy Card 2: BNPL Credit System Toggle */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#ffd200]/20 text-[#005581] flex items-center justify-center font-black">
                  <CreditCard className="w-6 h-6 text-[#005581]" />
                </div>
                <button
                  type="button"
                  onClick={onToggleBnplActive}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                    bnplActive
                      ? 'bg-[#ffd200] text-[#005581] font-extrabold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {bnplActive ? <ToggleRight className="w-5 h-5 text-[#005581]" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{bnplActive ? 'فعال (BNPL)' : 'غیر فعال'}</span>
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  سیستم اقساط اعتباری BNPL (خرید الان، پرداخت بعداً)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  امکان پرداخت اعتباری و اقساطی آنلاین برای درمان‌های سنگین (ایمپلنت، ارتودنسی، لمینت) از طریق ارائه‌دهندگان BNPL (اسنپ‌پی، تارا، دیجی‌پی).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">وضعیت درگاه اعتباری:</span>
                <p className="text-[#005581] dark:text-[#72cdf4] font-semibold">
                  {bnplActive
                    ? 'پذیرش اقساط اعتباری BNPL در صندوق کلینیک و کیف سلامت بیمار فعال می‌باشد.'
                    : 'درگاه پرداخت اعتباری BNPL غیرفعال است.'}
                </p>
              </div>
            </div>

            {/* Policy Card 3: Clinic Contracted Insurance Status */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#72cdf4]/20 text-[#005581] flex items-center justify-center font-black">
                  <FileCheck className="w-6 h-6 text-[#005581]" />
                </div>
                <button
                  type="button"
                  onClick={onToggleInsuranceContracted}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                    isInsuranceContracted
                      ? 'bg-[#005581] text-[#fffffa]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isInsuranceContracted ? <ToggleRight className="w-5 h-5 text-[#ffd200]" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{isInsuranceContracted ? 'طرف قرارداد' : 'آزاد / غیر طرف قرارداد'}</span>
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  وضعیت کلی قرارداد بیمه‌ای کلینیک
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  تعیین این‌که آیا کلینیک مستقیماً با شرکت‌های بیمه کسر از سهم می‌کند یا فقط فاکتور رسمی جهت دریافت خسارت بیمار صادر می‌نماید.
                </p>
              </div>
            </div>

            {/* Policy Card 4: Accountant Role Presence Requirement */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#005581]/10 text-[#005581] flex items-center justify-center font-black">
                  <Users className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={onToggleHasAccountantRole}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                    hasAccountantRole
                      ? 'bg-[#005581] text-[#fffffa]'
                      : 'bg-amber-400 text-slate-900 font-extrabold'
                  }`}
                >
                  {hasAccountantRole ? <ToggleRight className="w-5 h-5 text-[#ffd200]" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{hasAccountantRole ? 'نقش حسابدار فعال' : 'تمرکز در پذیرش'}</span>
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  الگوریتم تفکیک وظایف مالی (منشی / حسابدار)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  در کلینیک‌های کوچک بدون حسابدار مجزا، تمامی فرآیندهای ثبت مالی و تسویه بیمار در میز پذیرش انجام می‌شود.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: STAFF & ROLE ASSIGNMENTS (WHO HOLDS WHICH ROLE) */}
      {activeTab === 'roles' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#005581] dark:text-[#ffd200]" />
                  <span>تعیین نقش‌ها و دسترسی‌های پرسنل کلینیک (Staff & Roles Definition)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  مالک کلینیک تعیین می‌کند چه کسانی چه نقش‌هایی (دندان‌پزشک، حسابدار، منشی، مدیر) دارند و دسترسی Owner را مدیریت می‌کند.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#005581] text-[#fffffa] hover:bg-[#004266] font-extrabold text-xs transition flex items-center gap-2 shadow-md cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4 text-[#ffd200]" />
                <span>تعریف پرسنل / پزشک جدید</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="جستجوی نام، کد ملی، شماره موبایل یا تخصص پرسنل..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#005581] text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-3 rounded-r-xl">نام و نام خانوادگی</th>
                    <th className="py-3 px-3">نقش اصلی</th>
                    <th className="py-3 px-3">وضعیت مالک (Owner)</th>
                    <th className="py-3 px-3">تخصص / اطلاعات تکمیلی</th>
                    <th className="py-3 px-3">کد ملی</th>
                    <th className="py-3 px-3">شماره همراه</th>
                    <th className="py-3 px-3 rounded-l-xl text-center">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.map((u) => {
                    const isUserOwner = u.isOwner || u.role === 'owner';
                    const isEditing = editingUserId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isUserOwner && (
                              <span className="p-1 rounded-full bg-[#ffd200] text-[#005581]" title="دارای دسترسی مالکیتی (Owner)">
                                <Crown className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as UserRole)}
                              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
                            >
                              <option value="owner">مالک سازمان (Owner)</option>
                              <option value="manager">مدیر کلینیک (Manager)</option>
                              <option value="dentist">دندان‌پزشک معالج (Dentist)</option>
                              <option value="receptionist">مسئول پذیرش (Receptionist)</option>
                              {hasAccountantRole && (
                                <option value="accountant">حسابدار / مدیر مالی (Accountant)</option>
                              )}
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-block ${roleLabels[u.role]?.badgeColor || 'bg-slate-200'}`}>
                              {roleLabels[u.role]?.title || u.role}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {isEditing ? (
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editIsOwner}
                                onChange={(e) => setEditIsOwner(e.target.checked)}
                                className="w-4 h-4 text-[#005581] rounded focus:ring-[#005581]"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">دسترسی Owner</span>
                            </label>
                          ) : isUserOwner ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#ffd200]/30 text-[#005581] dark:text-[#ffd200] font-extrabold text-[10px] inline-flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-500" /> مالک کلینیک
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">پرسنل عادی</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                          {u.specialty || (u.commissionRate ? `درصد کارانه: ${toPersianDigits(u.commissionRate)}٪` : '-')}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {toPersianDigits(u.nationalId)}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {toPersianDigits(u.phone)}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleSaveEditUser}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                                title="ذخیره تغییرات نقش"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingUserId(null)}
                                className="p-1.5 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-400 transition"
                                title="انصراف"
                              >
                                لغو
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditUser(u)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#005581] dark:text-[#72cdf4] hover:bg-[#005581]/10 font-bold text-[11px] transition"
                              >
                                تغییر نقش / دسترسی
                              </button>
                              {u.id !== 'u-owner' && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteEmployee(u.id)}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition"
                                  title="حذف پرسنل"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: CLINIC INFORMATION */}
      {activeTab === 'clinic_info' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#005581] dark:text-[#ffd200]" />
                <span>شناسنامه و مشخصات ثبت‌شده سازمان (Clinic Profile)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                اطلاعات رسمی مرکز تخصصی ثبت‌شده در سامانه دنتورا
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingClinic(!isEditingClinic)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#005581] dark:text-[#72cdf4] hover:bg-[#005581]/10 font-extrabold text-xs transition cursor-pointer"
            >
              {isEditingClinic ? 'بستن ویرایش' : 'ویرایش اطلاعات سازمان'}
            </button>
          </div>

          {!isEditingClinic ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-500">نام کامل مرکز / کلینیک:</span>
                <strong className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                  {currentClinic.name}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-500">کد ملی / شناسه ملی حقوقی سازمان:</span>
                <strong className="text-sm font-mono font-extrabold text-[#005581] dark:text-[#72cdf4] block">
                  {toPersianDigits(currentClinic.nationalCode)}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-500">نام و نام خانوادگی مالک کلینیک (Owner):</span>
                <strong className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                  {currentClinic.ownerName}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-500">شماره همراه مالک:</span>
                <strong className="text-sm font-mono font-extrabold text-slate-900 dark:text-slate-100 block">
                  {toPersianDigits(currentClinic.ownerMobile)}
                </strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveClinicInfo} className="space-y-4 max-w-xl text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">نام کامل مرکز / کلینیک:</label>
                <input
                  type="text"
                  value={clinicNameInput}
                  onChange={(e) => setClinicNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">نام و نام خانوادگی مالک کلینیک:</label>
                <input
                  type="text"
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">شماره همراه مالک:</label>
                <input
                  type="text"
                  value={ownerMobileInput}
                  onChange={(e) => setOwnerMobileInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#005581] text-[#fffffa] font-extrabold text-xs hover:bg-[#004266] transition shadow-md cursor-pointer"
              >
                ذخیره تغییرات شناسنامه کلینیک
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal for Adding New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#005581]" />
                <span>تعریف پرسنل یا پزشک جدید در سازمان</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دکتر سمیرا کاظمی"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">کد ملی:</label>
                  <input
                    type="text"
                    required
                    placeholder="0011223344"
                    value={newUserNationalId}
                    onChange={(e) => setNewUserNationalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">شماره همراه:</label>
                  <input
                    type="text"
                    required
                    placeholder="09121112233"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">تعیین نقش پرسنل:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="dentist">دندان‌پزشک معالج (Dentist)</option>
                  <option value="receptionist">مسئول پذیرش / منشی (Receptionist)</option>
                  {hasAccountantRole && (
                    <option value="accountant">حسابدار / مدیر مالی (Accountant)</option>
                  )}
                  <option value="manager">مدیر کلینیک (Manager)</option>
                  <option value="owner">مالک کلینیک (Owner)</option>
                </select>
              </div>

              {newUserRole === 'dentist' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200">تخصص دندان‌پزشکی:</label>
                  <input
                    type="text"
                    placeholder="مثال: متخصص ترمیمی و زیبایی"
                    value={newUserSpecialty}
                    onChange={(e) => setNewUserSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#ffd200]/20 border border-[#ffd200]/50 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ownerCheck"
                  checked={newUserIsOwner || newUserRole === 'owner'}
                  onChange={(e) => setNewUserIsOwner(e.target.checked)}
                  className="w-4 h-4 text-[#005581] rounded focus:ring-[#005581]"
                />
                <label htmlFor="ownerCheck" className="font-extrabold text-xs text-[#005581] cursor-pointer">
                  اعطای دسترسی مالکیتی سازمان (Owner Privilege)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] text-[#fffffa] font-extrabold text-xs hover:bg-[#004266] transition shadow-md"
                >
                  افزودن پرسنل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
