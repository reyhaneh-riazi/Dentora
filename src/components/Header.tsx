import React from 'react';
import { UserRole, Branch, ClinicRegistration } from '../types';
import {
  Activity,
  Building2,
  UserCheck,
  ShieldCheck,
  Cpu,
  ChevronDown,
  LogOut,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  FileCheck,
  Users,
  Crown,
  Building,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  branches: Branch[];
  activeBranchId: string;
  onBranchChange: (branchId: string) => void;
  clinics?: ClinicRegistration[];
  currentClinic?: ClinicRegistration;
  onClinicSelect?: (clinic: ClinicRegistration) => void;
  insuranceModuleActive: boolean;
  onToggleInsuranceModule: () => void;
  isInsuranceContracted?: boolean;
  onToggleInsuranceContracted?: () => void;
  hasAccountantRole?: boolean;
  onToggleHasAccountantRole?: () => void;
  connectionStatus?: 'online' | 'offline' | 'syncing';
  onToggleConnectionStatus?: () => void;
  greenLaneActive: boolean;
  isOwner?: boolean;
  currentUserName?: string;
  clinicName?: string;
  onLogout?: () => void;
  onGoToDentoraLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  branches,
  activeBranchId,
  onBranchChange,
  clinics = [],
  currentClinic,
  onClinicSelect,
  insuranceModuleActive,
  onToggleInsuranceModule,
  isInsuranceContracted = true,
  onToggleInsuranceContracted,
  hasAccountantRole = true,
  onToggleHasAccountantRole,
  connectionStatus = 'online',
  onToggleConnectionStatus,
  greenLaneActive,
  isOwner = false,
  currentUserName = 'کاربر دنتورا',
  clinicName = 'کلینیک البرز',
  onLogout,
  onGoToDentoraLanding,
}) => {
  const roleLabels: Record<UserRole, { title: string; color: string; badge: string }> = {
    owner: { title: 'مالک / مدیر کلینیک', color: 'bg-[#ffd200]', badge: 'Owner' },
    manager: { title: 'مدیر ارشد کلینیک', color: 'bg-[#72cdf4]', badge: 'Manager' },
    dentist: { title: 'دندان‌پزشک معالج', color: 'bg-[#ffe552]', badge: 'Dentist' },
    receptionist: { title: 'منشی / میز پذیرش', color: 'bg-[#005581]', badge: 'Reception' },
    accountant: { title: 'مدیر مالی / حسابدار', color: 'bg-[#004266]', badge: 'Accountant' },
    patient: { title: 'کیف سلامت بیمار', color: 'bg-[#72cdf4]', badge: 'Patient Portal' },
    reviewer: { title: 'بازبین ادعا', color: 'bg-[#003350]', badge: 'Claim Reviewer' },
    medical_inspector: { title: 'بازبین پزشکی / پزشک معتمد', color: 'bg-[#004266]', badge: 'Medical Inspector' },
    insurance_manager: { title: 'مدیر بیمه', color: 'bg-[#005581]', badge: 'Insurance Manager' },
    insurer_admin: { title: 'ادمین بیمه', color: 'bg-[#003350]', badge: 'Insurer Admin' },
    lab: { title: 'پورتال لابراتوار', color: 'bg-[#005581]', badge: 'Dental Lab' },
  };

  const currentBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  return (
    <header className="bg-[#005581] text-white border-b border-[#004266] sticky top-0 z-50 shadow-md backdrop-blur-md dir-rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToDentoraLanding}
              className="w-10 h-10 rounded-xl bg-[#ffd200] text-[#005581] flex items-center justify-center shadow-md font-black text-2xl ring-2 ring-white/30 cursor-pointer hover:bg-[#ffe552] transition shrink-0"
              title="بازگشت به لندینگ اصلی دنتورا"
            >
              د
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-[#fffffa]">
                  {currentClinic?.name || clinicName} <span className="text-[#72cdf4] text-sm font-semibold">| Dentora OS</span>
                </h1>
                {isOwner && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] font-extrabold font-mono shadow-xs shrink-0">
                    دسترسی مالک (Owner)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#72cdf4]/90 font-medium flex items-center gap-2">
                <span>{currentUserName} ({roleLabels[currentRole]?.title || currentRole})</span>
                {currentClinic?.ownerName && (
                  <span className="bg-[#003858] text-[#ffe552] px-2 py-0.5 rounded text-[10px] font-bold border border-[#72cdf4]/30">
                    مالک کلینیک: {currentClinic.ownerName} ({currentClinic.ownerRole === 'dentist' ? 'دندان‌پزشک' : 'مدیر کلینیک'})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* System Status Indicators (Online/Offline, Owner Insurance Module, Insurance Contracted Status) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Online / Offline Connection Status Toggle */}
            <button
              type="button"
              onClick={onToggleConnectionStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer shadow-xs ${
                connectionStatus === 'online'
                  ? 'bg-[#004266] text-[#fffffa] border-[#72cdf4]/40 hover:bg-[#003858]'
                  : connectionStatus === 'syncing'
                  ? 'bg-[#ffe552] text-[#005581] border-[#ffd200] animate-pulse'
                  : 'bg-amber-900/60 text-amber-200 border-amber-600/50 hover:bg-amber-900/80'
              }`}
              title="برای تغییر وضعیت اتصال آنلاین / آفلاین کلیک کنید"
            >
              {connectionStatus === 'online' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>سیستم: <strong className="text-emerald-300">آنلاین</strong></span>
                </>
              )}
              {connectionStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#005581] animate-spin" />
                  <span>در حال همگام‌سازی...</span>
                </>
              )}
              {connectionStatus === 'offline' && (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span>سیستم: <strong className="text-amber-300">آفلاین</strong></span>
                </>
              )}
            </button>

            {/* Contracted Insurance Status Toggle (Prototype convenience) */}
            {insuranceModuleActive && onToggleInsuranceContracted && (
              <button
                type="button"
                onClick={onToggleInsuranceContracted}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
                  isInsuranceContracted
                    ? 'bg-[#004266] text-[#fffffa] border-[#72cdf4]/40 hover:bg-[#003858]'
                    : 'bg-[#ffd200] text-[#005581] border-[#ffe552] font-extrabold'
                }`}
                title="تغییر وضعیت طرف قرارداد بیمه دنتورا"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#ffd200]" />
                <span>
                  قرارداد بیمه: <strong>{isInsuranceContracted ? 'طرف قرارداد' : 'غیر طرف قرارداد (آزاد + فاکتور رسمی)'}</strong>
                </span>
              </button>
            )}

            {/* Accountant Role Presence Toggle Button (Workflow algorithm requirement - shown for staff roles only) */}
            {currentRole !== 'patient' && onToggleHasAccountantRole && (
              <button
                type="button"
                onClick={onToggleHasAccountantRole}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
                  hasAccountantRole
                    ? 'bg-[#004266] text-[#fffffa] border-[#72cdf4]/40 hover:bg-[#003858]'
                    : 'bg-amber-400 text-slate-900 border-amber-300 font-extrabold shadow-sm'
                }`}
                title="تغییر الگوریتم گردش‌کار بیمه: تفکیک وظایف منشی/حسابدار یا تمرکز در پنل منشی"
              >
                <Users className="w-3.5 h-3.5 text-[#ffd200]" />
                <span>
                  نقش حسابدار: <strong>{hasAccountantRole ? 'تعریف‌شده (تفکیک وظایف منشی/حسابدار)' : 'فاقد حسابدار (تمرکز کلی در منشی)'}</strong>
                </span>
              </button>
            )}

            {/* Hardware Bridge Indicator (ONLY for Dentist role) */}
            {currentRole === 'dentist' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004266] border border-[#72cdf4]/30 text-[#fffffa] shadow-xs" title="پل سخت‌افزاری دریافت مستقیم تصاویر رادیوگرافی RVG/OPG">
                <span className="w-2 h-2 rounded-full bg-[#ffe552] animate-pulse"></span>
                <Cpu className="w-3.5 h-3.5 text-[#ffe552]" />
                <span>پل RVG/OPG: <strong className="text-[#ffe552] font-semibold">آنلاین</strong></span>
              </div>
            )}
          </div>

          {/* Branch & Controls */}
          <div className="flex items-center gap-2">
            {/* Owner Settings Quick Access Button */}
            {isOwner && (
              <button
                type="button"
                onClick={() => onRoleChange('owner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition border cursor-pointer ${
                  currentRole === 'owner'
                    ? 'bg-[#ffd200] text-[#005581] border-[#ffe552] ring-2 ring-[#ffd200]/50 shadow-md'
                    : 'bg-[#004266] text-[#ffd200] border-[#72cdf4]/40 hover:bg-[#003858]'
                }`}
                title="تنظیمات مالک کلینیک (بیمه‌ها، نقش‌ها و ماژول‌ها)"
              >
                <Crown className="w-3.5 h-3.5 text-[#ffd200]" />
                <span>تنظیمات مالک</span>
              </button>
            )}

            {/* Clinic Dropdown Switcher */}
            {clinics.length > 0 && onClinicSelect && (
              <div className="relative group">
                <div className="flex items-center gap-1.5 bg-[#004266] border border-[#72cdf4]/40 text-[#fffffa] px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:bg-[#003858] transition shadow-xs">
                  <Building className="w-3.5 h-3.5 text-[#ffd200]" />
                  <span className="max-w-[130px] truncate">{currentClinic?.name || 'انتخاب کلینیک'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#72cdf4]" />
                </div>
                <div className="absolute left-0 md:right-0 mt-1.5 w-64 bg-[#004266] border border-[#72cdf4]/40 rounded-2xl shadow-xl py-1.5 hidden group-hover:block z-50">
                  <div className="px-3 py-1 text-[11px] text-[#72cdf4] font-semibold border-b border-[#003350]">انتخاب کلینیک فعال / بررسی مالک</div>
                  {clinics.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onClinicSelect(c)}
                      className={`w-full text-right px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-[#003350] transition border-b border-[#003350]/50 last:border-0 ${
                        c.id === currentClinic?.id ? 'text-[#ffd200] font-bold bg-[#003350]/80' : 'text-[#fffffa]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{c.name}</span>
                        <span className="text-[10px] text-[#72cdf4] font-mono">{c.id}</span>
                      </div>
                      <span className="text-[11px] text-[#ffe552] font-semibold">
                        مالک: {c.ownerName} ({c.ownerRole === 'dentist' ? 'دندان‌پزشک معالج' : 'مدیر ارشد'})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Branch Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 bg-[#004266] border border-[#72cdf4]/40 text-[#fffffa] px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:bg-[#003858] transition shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-[#ffe552]" />
                <span className="max-w-[120px] truncate">{currentBranch.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#72cdf4]" />
              </div>
              <div className="absolute left-0 md:right-0 mt-1.5 w-52 bg-[#004266] border border-[#72cdf4]/40 rounded-2xl shadow-xl py-1.5 hidden group-hover:block z-50">
                <div className="px-3 py-1 text-[11px] text-[#72cdf4] font-semibold border-b border-[#003350]">انتخاب شعبه فعال</div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onBranchChange(b.id)}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-[#003350] transition ${
                      b.id === activeBranchId ? 'text-[#ffd200] font-bold bg-[#003350]/80' : 'text-[#fffffa]'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] text-[#72cdf4] font-mono">{b.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Switcher (RBAC testing menu) */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-[#ffd200] text-[#005581] px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer shadow-md hover:bg-[#ffe552] transition ring-1 ring-white/30">
                <UserCheck className="w-4 h-4" />
                <span>پورتال: {roleLabels[currentRole]?.title || currentRole}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#005581]" />
              </div>
              <div className="absolute left-0 mt-1.5 w-60 bg-[#004266] border border-[#72cdf4]/40 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-50 text-right">
                <div className="px-3.5 py-1.5 text-[11px] text-[#72cdf4] font-semibold border-b border-[#003350] flex justify-between items-center">
                  <span>تغییر پورتال جهت بررسی</span>
                  <span className="text-[10px] text-[#ffd200] font-mono">RBAC</span>
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={`w-full text-right px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#003350] transition ${
                      r === currentRole ? 'text-[#ffd200] font-bold bg-[#003350]' : 'text-[#fffffa]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${roleLabels[r].color}`}></span>
                      {roleLabels[r].title}
                    </span>
                    <span className="text-[10px] text-[#005581] font-mono px-1.5 py-0.5 rounded bg-[#ffe552] font-bold">
                      {roleLabels[r].badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout / Exit button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white transition cursor-pointer"
                title="خروج از حساب کاربر"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

