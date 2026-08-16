import React, { useState, useEffect } from 'react';
import {
  User,
  UserCheck,
  Building2,
  Stethoscope,
  Calendar,
  FileText,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckSquare,
} from 'lucide-react';
import { ClinicRegistration, UserRole, UserProfile, Patient } from '../../types';
import { OnlineBookingModal } from '../booking/OnlineBookingModal';
import { toPersianDigits } from '../../utils/persianDigits';

interface ClinicPortalLandingProps {
  clinic: ClinicRegistration;
  onStaffLogin: (role: UserRole, mobileOrNationalId: string, fullName?: string, password?: string) => void;
  onPatientLogin: (nationalId: string, isGuardian?: boolean, newBookingDetails?: any) => void;
  onInsurerLogin: (providerName: string, role?: UserRole) => void;
  onBackToDentora: () => void;
}

export const ClinicPortalLanding: React.FC<ClinicPortalLandingProps> = ({
  clinic,
  onStaffLogin,
  onPatientLogin,
  onInsurerLogin,
  onBackToDentora,
}) => {
  // Modal states
  const [activeModal, setActiveModal] = useState<'none' | 'staff' | 'patient' | 'insurer'>('none');
  const [showOnlineBooking, setShowOnlineBooking] = useState(false);

  // Staff Modal Tab ('login' | 'signup')
  const [staffTab, setStaffTab] = useState<'login' | 'signup'>('login');
  
  // Staff Form State
  const [staffMobile, setStaffMobile] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('receptionist');

  // Filter available roles according to clinic's active roles
  const ownerRoleType = clinic.ownerRole || 'dentist';
  const ownerRoleLabel = ownerRoleType === 'dentist' ? 'مالک / پزشک معالج' : 'مالک / مدیر کلینیک';

  const roleLabelsMap: Record<string, string> = {
    owner: ownerRoleLabel,
    receptionist: 'پذیرش / منشی',
    dentist: 'پزشک معالج',
    accountant: 'حسابدار / مدیر مالی',
    manager: 'مدیر کلینیک',
  };

  const activeClinicRoles: UserRole[] = clinic.activeRoles || ['receptionist', 'dentist', 'accountant', 'manager', 'owner'];

  // If owner is active, 'مالک / [نقش خودش]' is sufficient and the standalone matching role is not needed
  const availableStaffRoles = (
    ['owner', 'receptionist', 'dentist', 'accountant', 'manager'] as UserRole[]
  )
    .filter((role) => {
      if (!activeClinicRoles.includes(role)) return false;
      if (activeClinicRoles.includes('owner') && role === ownerRoleType) {
        return false;
      }
      return true;
    })
    .map((role) => ({
      value: role,
      label: roleLabelsMap[role] || role,
    }));

  useEffect(() => {
    if (availableStaffRoles.length > 0) {
      if (!availableStaffRoles.some((r) => r.value === staffRole)) {
        setStaffRole(availableStaffRoles[0].value);
      }
    }
  }, [clinic.id, clinic.activeRoles]);

  // Patient Modal Mode ('login' | 'signup')
  const [patientTab, setPatientTab] = useState<'login' | 'signup'>('login');
  
  // Patient Form State
  const [patientFullName, setPatientFullName] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientNationalId, setPatientNationalId] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('۱۳۷۰/۰۱/۰۱');
  const [patientPrimaryInsurance, setPatientPrimaryInsurance] = useState('بیمه تامین اجتماعی');
  const [patientSupplInsurance, setPatientSupplInsurance] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [isLegalGuardian, setIsLegalGuardian] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianNationalId, setGuardianNationalId] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');
  const [childName, setChildName] = useState('');
  const [childNationalId, setChildNationalId] = useState('');

  // Insurer Form State
  const [insurerTab, setInsurerTab] = useState<'login' | 'signup'>('login');
  const [insurerFullName, setInsurerFullName] = useState('');
  const [insurerEmail, setInsurerEmail] = useState('');
  const [insurerPassword, setInsurerPassword] = useState('');
  const [insurerProvider, setInsurerProvider] = useState('بیمه تامین اجتماعی');

  // Handlers
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffMobile.trim()) {
      alert('لطفاً شماره موبایل یا کد ملی خود را وارد نمایید.');
      return;
    }
    const roleToUse = staffRole || (availableStaffRoles[0]?.value || 'receptionist');
    const nameToUse = staffTab === 'signup' ? staffFullName : undefined;
    onStaffLogin(roleToUse, staffMobile, nameToUse, staffPassword);
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientTab === 'login') {
      if (!patientNationalId.trim()) {
        alert('لطفاً ۱۰ رقم کد ملی خود را وارد نمایید.');
        return;
      }
      onPatientLogin(patientNationalId);
    } else {
      if (isLegalGuardian) {
        if (!guardianNationalId.trim() || !childNationalId.trim()) {
          alert('لطفاً کد ملی سرپرست و کودک را وارد نمایید.');
          return;
        }
        onPatientLogin(childNationalId, true, {
          patientName: childName || 'کودک بیمار',
          patientPhone: guardianMobile,
          patientNationalId: childNationalId,
          birthDate: '۱۳۹۵/۰۱/۰۱',
          isLegalGuardian: true,
          guardianName,
          guardianNationalId,
          guardianPhone: guardianMobile,
          primaryInsurance: patientPrimaryInsurance,
          supplInsurance: patientSupplInsurance,
        });
      } else {
        if (!patientNationalId.trim()) {
          alert('لطفاً کد ملی خود را وارد نمایید.');
          return;
        }
        onPatientLogin(patientNationalId, false, {
          patientName: patientFullName || 'بیمار جدید',
          patientPhone: patientMobile || '09120000000',
          patientNationalId,
          birthDate: patientBirthDate,
          primaryInsurance: patientPrimaryInsurance,
          supplInsurance: patientSupplInsurance,
        });
      }
    }
  };

  const handleInsurerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInsurerLogin(insurerProvider);
  };

  return (
    <div className="min-h-screen bg-[#fffffa] text-slate-900 font-sans dir-rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#fffffa]/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Clinic Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black text-2xl shadow-md ring-2 ring-[#005581]/20">
              ب
            </div>
            <div>
              <h1 className="text-xl font-black text-[#005581] tracking-tight">{clinic.name}</h1>
              <p className="text-[11px] text-slate-500 font-medium">قدرت گرفته از سیستم عامل دنتورا</p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setActiveModal('staff');
                setStaffTab('login');
              }}
              className="text-xs font-bold text-slate-600 hover:text-[#005581] px-3 py-2 rounded-xl transition cursor-pointer"
            >
              ورود پرسنل
            </button>

            <button
              onClick={() => setShowOnlineBooking(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#ffd200]" />
              <span>ثبت نوبت آنلاین</span>
            </button>

            <button
              onClick={() => {
                setActiveModal('patient');
                setPatientTab('login');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-extrabold text-xs shadow-xs transition cursor-pointer"
            >
              <User className="w-4 h-4 text-[#005581]" />
              <span>پورتال بیماران</span>
            </button>

            <button
              onClick={() => {
                setActiveModal('staff');
                setStaffTab('signup');
              }}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#ffd200]" />
              <span>ثبت‌نام پرسنل</span>
            </button>

            <button
              onClick={onBackToDentora}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#005581] border-2 border-slate-200 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#005581]" />
              <span>بازگشت به دنتورا</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-[#fffffa] via-[#72cdf4]/15 to-[#fffffa] overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-[#005581]">
            <Stethoscope className="w-4 h-4 text-[#005581]" />
            <span>مرکز تخصصی دندان‌پزشکی</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-[#005581] tracking-tight leading-tight">
            {clinic.name} — تجربه‌ای متفاوت از درمان
          </h2>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            ما در {clinic.name} با بهره‌گیری از هوشمندترین سیستم‌های مدیریت درمان، بالاترین کیفیت خدمات دندان‌پزشکی را در سریع‌ترین زمان ممکن ارائه می‌دهیم.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowOnlineBooking(true)}
              className="px-8 py-3.5 rounded-2xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-black text-sm shadow-md transition cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5 ring-4 ring-[#ffd200]/30"
            >
              <Calendar className="w-5 h-5 text-[#005581]" />
              <span>نوبت‌گیری و ثبت نوبت آنلاین</span>
            </button>

            <button
              onClick={() => {
                setActiveModal('patient');
                setPatientTab('login');
              }}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#005581] border-2 border-slate-200 font-bold text-sm shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <User className="w-5 h-5 text-[#005581]" />
              <span>ورود به پورتال بیماران</span>
            </button>

            <button
              onClick={() => {
                setActiveModal('staff');
                setStaffTab('login');
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white font-black text-sm shadow-md transition cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <UserCheck className="w-5 h-5 text-[#ffd200]" />
              <span>ورود پرسنل</span>
            </button>
          </div>

        </div>
      </section>

      {/* 3 Main Workflow Feature Cards */}
      <section className="py-16 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#005581]/10 text-[#005581] flex items-center justify-center mx-auto">
                <CheckSquare className="w-7 h-7 text-[#005581]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">جریان کاری پس از ویزیت</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                باز کردن پنل بیمار برای پزشک، بررسی و نهایی‌سازی پرونده توسط پذیرش و انتقال خودکار به کارتابل حسابدار برای ارسال به بیمه‌گر.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#005581]/10 text-[#005581] flex items-center justify-center mx-auto">
                <UserCheck className="w-7 h-7 text-[#005581]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">پذیرش هوشمند</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                سیستم نوبت‌دهی آنلاین و مدیریت دقیق لیست انتظار بدون اتلاف وقت. ثبت اولیه مشخصات توسط بیمار یا منشی.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#005581]/10 text-[#005581] flex items-center justify-center mx-auto">
                <Stethoscope className="w-7 h-7 text-[#005581]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">پرونده بالینی پیشرفته</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ثبت دقیق طرح درمان، رادیوگرافی دیجیتال و یادداشت‌های بالینی صوتی روی چارت تعاملی دندان.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ================= MODAL 1: STAFF LOGIN / SIGNUP ================= */}
      {activeModal === 'staff' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative dir-rtl">
            
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                ب
              </div>
              <h3 className="text-xl font-black text-slate-900">پورتال پرسنل {clinic.name}</h3>
              <p className="text-xs text-slate-500">برای ورود به سیستم اطلاعات حساب خود را وارد کنید</p>
            </div>

            {/* Login / Signup Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setStaffTab('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  staffTab === 'login'
                    ? 'bg-white text-[#005581] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ورود
              </button>
              <button
                onClick={() => setStaffTab('signup')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  staffTab === 'signup'
                    ? 'bg-white text-[#005581] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ثبت‌نام
              </button>
            </div>

            {/* Staff Form */}
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              
              {staffTab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="نام کامل خود را وارد کنید"
                    value={staffFullName}
                    onChange={(e) => setStaffFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {staffTab === 'signup' ? 'شماره موبایل' : 'شماره موبایل یا کد ملی'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={staffTab === 'signup' ? '09120000000' : 'مثلاً 09121112233'}
                  value={staffMobile}
                  onChange={(e) => setStaffMobile(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none transition bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رمز عبور
                </label>
                <input
                  type="password"
                  required
                  placeholder={staffTab === 'signup' ? 'حداقل ۴ کاراکتر' : 'رمز عبور خود را وارد کنید'}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نقش شما در {clinic.name}
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-bold text-slate-800 outline-none transition bg-white cursor-pointer"
                >
                  {availableStaffRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  تنها نقش‌های فعال در این کلینیک نمایش داده شده‌اند.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {staffTab === 'signup' ? (
                  <>
                    <UserPlus className="w-5 h-5 text-[#ffd200]" />
                    <span>ایجاد حساب و ورود</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-[#ffd200]" />
                    <span>ورود به پورتال</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {staffTab === 'login' ? (
                  <button
                    type="button"
                    onClick={() => setStaffTab('signup')}
                    className="text-xs font-bold text-[#005581] hover:underline"
                  >
                    حساب کاربری ندارید؟ ثبت‌نام کنید
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStaffTab('login')}
                    className="text-xs font-bold text-[#005581] hover:underline"
                  >
                    قبلاً ثبت‌نام کرده‌اید؟ وارد شوید
                  </button>
                )}
              </div>

            </form>

          </div>
        </div>
      )}


      {/* ================= MODAL 2: PATIENT LOGIN / SIGNUP ================= */}
      {activeModal === 'patient' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto dir-rtl">
            
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                D
              </div>
              <h3 className="text-xl font-black text-slate-900">پورتال بیمار دنتورا</h3>
              <p className="text-xs text-slate-500">برای مشاهده پرونده خود وارد شوید</p>
            </div>

            {/* Patient Form */}
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              
              {patientTab === 'signup' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="legalGuardianCheck"
                    checked={isLegalGuardian}
                    onChange={(e) => setIsLegalGuardian(e.target.checked)}
                    className="w-4 h-4 rounded text-[#005581] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="legalGuardianCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    ورود به عنوان سرپرست قانونی (والدین/سرپرست)
                  </label>
                </div>
              )}

              {/* Patient Login Fields */}
              {patientTab === 'login' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">کد ملی</label>
                    <input
                      type="text"
                      required
                      placeholder="۱۰ رقم کد ملی"
                      value={patientNationalId}
                      onChange={(e) => setPatientNationalId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">رمز عبور</label>
                    <input
                      type="password"
                      required
                      placeholder="رمز عبور"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition"
                    />
                  </div>
                </>
              )}

              {/* Patient Signup Fields */}
              {patientTab === 'signup' && isLegalGuardian && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نام سرپرست</label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی سرپرست</label>
                    <input
                      type="text"
                      required
                      value={guardianNationalId}
                      onChange={(e) => setGuardianNationalId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">موبایل سرپرست</label>
                    <input
                      type="tel"
                      required
                      value={guardianMobile}
                      onChange={(e) => setGuardianMobile(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رمز عبور</label>
                    <input
                      type="password"
                      required
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none"
                    />
                  </div>

                  <div className="border-t border-dashed border-slate-300 pt-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نام کودک (بیمار)</label>
                      <input
                        type="text"
                        required
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none"
                      />
                    </div>

                    <div className="mt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی کودک</label>
                      <input
                        type="text"
                        required
                        value={childNationalId}
                        onChange={(e) => setChildNationalId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {patientTab === 'signup' && !isLegalGuardian && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی بیمار</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سارا احمدی"
                      value={patientFullName}
                      onChange={(e) => setPatientFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی بیمار</label>
                      <input
                        type="text"
                        required
                        placeholder="0012345678"
                        value={patientNationalId}
                        onChange={(e) => setPatientNationalId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">شماره همراه</label>
                      <input
                        type="tel"
                        required
                        placeholder="۰۹۱۲..."
                        value={patientMobile}
                        onChange={(e) => setPatientMobile(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ تولد</label>
                      <input
                        type="text"
                        placeholder="۱۳۷۰/۰۵/۱۵"
                        value={patientBirthDate}
                        onChange={(e) => setPatientBirthDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">بیمه پایه</label>
                      <select
                        value={patientPrimaryInsurance}
                        onChange={(e) => setPatientPrimaryInsurance(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-xs font-bold outline-none"
                      >
                        <option value="بیمه تامین اجتماعی">تامین اجتماعی</option>
                        <option value="بیمه خدمات درمانی (سلامت)">سلامت ایرانیان</option>
                        <option value="بیمه نیروهای مسلح">نیروهای مسلح</option>
                        <option value="فاقد بیمه پایه (آزاد)">فاقد بیمه (آزاد)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">بیمه تکمیلی (اختیاری)</label>
                    <input
                      type="text"
                      placeholder="مثال: بیمه دانا، ایران، سامان یا خالی"
                      value={patientSupplInsurance}
                      onChange={(e) => setPatientSupplInsurance(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رمز عبور</label>
                    <input
                      type="password"
                      required
                      placeholder="حداقل ۶ کاراکتر"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {patientTab === 'login' ? (
                  <span>ورود به پرونده</span>
                ) : (
                  <span>ثبت‌نام و ایجاد پرونده</span>
                )}
              </button>

              <div className="text-center pt-2">
                {patientTab === 'login' ? (
                  <button
                    type="button"
                    onClick={() => setPatientTab('signup')}
                    className="text-xs font-bold text-[#005581] hover:underline"
                  >
                    حساب ندارید؟ ثبت‌نام
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPatientTab('login')}
                    className="text-xs font-bold text-[#005581] hover:underline"
                  >
                    قبلاً ثبت‌نام کرده‌اید؟ بازگشت به ورود
                  </button>
                )}
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Online Appointment Booking Workflow Modal */}
      <OnlineBookingModal
        isOpen={showOnlineBooking}
        onClose={() => setShowOnlineBooking(false)}
        clinicName={clinic.name}
        isLoggedInPatient={false}
        onExistingPatientRedirect={() => {
          setShowOnlineBooking(false);
          setActiveModal('patient');
          setPatientTab('login');
          alert('شما دارای پرونده قبلی در این کلینیک هستید. لطفاً جهت ورود به پرونده و مدیریت نوبت‌ها وارد حساب خود شوید.');
        }}
        onCompleteBooking={(details) => {
          alert(`نوبت شما با موفقیت در ${clinic.name} رزرو شد!\nپزشک: ${details.dentistName}\nزمان: ${toPersianDigits(details.date)} ساعت ${toPersianDigits(details.slot)}\nپیامک تایید به شماره ${toPersianDigits(details.patientPhone)} ارسال گردید.`);
          setShowOnlineBooking(false);
          // Log in patient directly to view their newly booked appointment in PatientPortal
          onPatientLogin(details.patientNationalId, false, details);
        }}
      />

    </div>
  );
};
