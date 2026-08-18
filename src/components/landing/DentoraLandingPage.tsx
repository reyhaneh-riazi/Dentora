import React, { useState } from 'react';
import { ToothIcon } from '../common/ToothIcon';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Check,
  ArrowLeft,
  X,
  Stethoscope,
  Users,
  DollarSign,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Lock,
  Phone,
  CreditCard,
  AlertCircle,
  Flame,
  Truck,
  Layers,
} from 'lucide-react';
import { ClinicRegistration, UserRole } from '../../types';
import { isValidMobile, isValidNationalId, isValidPassword, toEnglishDigits } from '../../utils/validators';

interface DentoraLandingPageProps {
  registeredClinics: ClinicRegistration[];
  onRegisterClinic: (clinic: ClinicRegistration, ownerPassword?: string, ownerNationalId?: string) => void;
  onSelectClinic: (clinic: ClinicRegistration) => void;
  onGoToInsurerPortal: () => void;
  onGoToLabPortal: () => void;
}

export const DentoraLandingPage: React.FC<DentoraLandingPageProps> = ({
  registeredClinics,
  onRegisterClinic,
  onSelectClinic,
  onGoToInsurerPortal,
  onGoToLabPortal,
}) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form state for Clinic Signup
  const [clinicName, setClinicName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerNationalId, setOwnerNationalId] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerRole, setOwnerRole] = useState<'dentist' | 'manager'>('dentist');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Active roles selection: Receptionist, Dentist, and Lab are default/built-in. Accountant and Manager are optional.
  const [activeAccountant, setActiveAccountant] = useState(true);
  const [activeManager, setActiveManager] = useState(true);

  const handleSubmitNewClinic = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanClinicName = clinicName.trim();
    const cleanOwnerName = ownerName.trim();
    const cleanMobile = toEnglishDigits(ownerMobile).trim();
    const cleanOwnerNationalId = toEnglishDigits(ownerNationalId).trim();
    const cleanPass = ownerPassword.trim();
    const cleanLegalCode = toEnglishDigits(nationalCode).trim();

    if (!cleanClinicName || cleanClinicName.length < 3) {
      setErrorMessage('نام کلینیک باید حداقل ۳ کاراکتر باشد.');
      return;
    }
    if (cleanLegalCode && cleanLegalCode.length < 10) {
      setErrorMessage('شناسه ملی / کد اقتصادی باید حداقل ۱۰ رقم باشد.');
      return;
    }
    if (!cleanOwnerName || cleanOwnerName.length < 3) {
      setErrorMessage('نام و نام خانوادگی مالک کلینیک را به طور کامل وارد فرمایید.');
      return;
    }
    if (!cleanOwnerNationalId || !isValidNationalId(cleanOwnerNationalId)) {
      setErrorMessage('کد ملی مالک کلینیک نامعتبر است (باید ۱۰ رقم معتبر باشد).');
      return;
    }
    if (!isValidMobile(cleanMobile)) {
      setErrorMessage('شماره همراه مالک نامعتبر است (الگوی صحیح: 09xxxxxxxxx).');
      return;
    }
    const passCheck = isValidPassword(cleanPass);
    if (!passCheck.valid) {
      setErrorMessage(passCheck.message || 'رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    const activeRoles: UserRole[] = ['receptionist', 'dentist', 'lab', 'owner'];
    if (activeAccountant) activeRoles.push('accountant');
    if (activeManager) activeRoles.push('manager');

    const newClinic: ClinicRegistration = {
      id: `clinic-${Date.now()}`,
      name: cleanClinicName,
      nationalCode: cleanLegalCode || '۱۴۰۰۹۸۷۶۵۴۳',
      ownerName: cleanOwnerName,
      ownerMobile: cleanMobile,
      ownerRole,
      activeRoles,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    onRegisterClinic(newClinic, cleanPass, cleanOwnerNationalId);
    setIsRegisterModalOpen(false);
    
    // Reset form
    setClinicName('');
    setNationalCode('');
    setOwnerName('');
    setOwnerNationalId('');
    setOwnerMobile('');
    setOwnerPassword('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#fffffa] text-slate-900 font-sans dir-rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#fffffa]/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#005581] to-[#0073a8] text-[#fffffa] flex items-center justify-center shadow-md ring-2 ring-[#ffd200]/50">
              <ToothIcon className="w-7 h-7 text-[#ffd200]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#005581]">دنتورا</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] font-bold font-mono">
                  Dental OS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">سیستم عامل یکپارچه کلینیک‌های دندان‌پزشکی</p>
            </div>
          </div>

          {/* Nav Actions - Unified Specialist Portals Group & Registration */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Unified Specialized Portals Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              {/* Lab Portal Button */}
              <button
                type="button"
                onClick={onGoToLabPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-[#005581] dark:text-cyan-400 font-bold text-xs transition cursor-pointer shadow-2xs hover:shadow-xs"
                title="ورود به پورتال جامع لابراتوارهای دندان‌سازی (مدیریت سفارشات تمام کلینیک‌ها)"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">پورتال</span>
                <span>لابراتوار</span>
              </button>

              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 my-auto mx-0.5"></div>

              {/* Insurer Portal Button */}
              <button
                type="button"
                onClick={onGoToInsurerPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-[#005581] dark:text-cyan-400 font-bold text-xs transition cursor-pointer shadow-2xs hover:shadow-xs"
                title="ورود به پورتال ممیزی و تسویه بیمه‌گران"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="hidden md:inline">پورتال</span>
                <span>بیمه‌گران</span>
              </button>
            </div>

            {/* Main Registration Button */}
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-extrabold text-xs shadow-md transition cursor-pointer transform hover:-translate-y-0.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#005581]" />
              <span className="hidden sm:inline">ثبت کلینیک جدید</span>
              <span className="sm:hidden">ثبت کلینیک</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-[#fffffa] via-[#72cdf4]/10 to-[#fffffa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005581]/10 text-[#005581] text-xs font-bold border border-[#005581]/20">
            <Sparkles className="w-4 h-4 text-[#ffd200]" />
            <span>پلتفرم تخصصی دندان‌پزشکی، پرونده طولی UDR و تسویه بیمه‌ای</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            مدیریت کامل کلینیک <span className="text-[#005581]">دندان‌پزشکی</span> با سیستم‌عامل <span className="relative inline-block text-[#005581]">دنتورا<span className="absolute bottom-1 right-0 left-0 h-3 bg-[#ffd200]/40 -z-10 rounded"></span></span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            مدیریت هوشمند پرونده الکترونیک، نوبت‌دهی آنلاین، حسابداری، اقساط و ارتباط مستقیم با بیمه‌گر. کلینیک خود را ثبت کنید و به شبکه دنتورا بپیوندید.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-[#fffffa] font-extrabold text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-[#ffd200]" />
              <span>ثبت کلینیک در دنتورا</span>
            </button>

            <a
              href="#registered-clinics"
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#005581] font-bold text-sm border-2 border-[#005581]/20 shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <span>مشاهده کلینیک‌های فعال</span>
              <ChevronLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Clinics Grid */}
      <section id="registered-clinics" className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-[#005581] tracking-wider uppercase">کلینیک‌های عضو دنتورا</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                انتخاب کلینیک جهت ورود به پورتال
              </h2>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>کلینیک جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredClinics.map((clinic) => (
              <div
                key={clinic.id}
                className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#005581] p-6 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#005581]/10 text-[#005581] flex items-center justify-center font-black text-xl">
                      <Building2 className="w-6 h-6 text-[#005581]" />
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      فعال در دنتورا
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{clinic.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">شناسه ثبتی: {clinic.nationalCode}</p>
                  </div>

                  <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-400">مالک کلینیک:</span>
                      <strong className="text-slate-800">{clinic.ownerName} ({clinic.ownerRole === 'dentist' ? 'پزشک' : 'مدیر'})</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-400">شماره تماس:</span>
                      <span className="font-mono">{clinic.ownerMobile}</span>
                    </div>
                  </div>

                  {/* Active Roles Badges */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2">نقش‌های فعال در این کلینیک:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {clinic.activeRoles.map((role) => {
                        const labels: Record<string, string> = {
                          receptionist: 'منشی',
                          dentist: 'پزشک',
                          accountant: 'حسابدار',
                          manager: 'مدیر',
                          owner: 'مالک',
                        };
                        const isMandatory = role === 'receptionist' || role === 'dentist';
                        return (
                          <span
                            key={role}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              isMandatory
                                ? 'bg-[#005581] text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {labels[role] || role} {isMandatory && '(اجباری)'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectClinic(clinic)}
                  className="w-full py-3 rounded-2xl bg-[#005581] hover:bg-[#004266] text-[#fffffa] font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ورود به صفحه کلینیک</span>
                  <ArrowLeft className="w-4 h-4 text-[#ffd200]" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* REGISTER CLINIC MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto dir-rtl">
            
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                د
              </div>
              <h3 className="text-xl font-black text-slate-900">ثبت نام کلینیک جدید در دنتورا</h3>
              <p className="text-xs text-slate-500">مشخصات کلینیک و مالک را وارد کرده و نقش‌های فعال را مشخص نمایید.</p>
            </div>

            <form onSubmit={handleSubmitNewClinic} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Clinic Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام کلینیک دندان‌پزشکی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کلینیک تخصصی البرز"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition"
                />
              </div>

              {/* National Code / Reg ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شناسه ملی / کد ثبتی یا پروانه کلینیک
                </label>
                <input
                  type="text"
                  placeholder="مثال: ۱۴۰۰۹۸۷۶۵۴۳"
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none transition"
                />
              </div>

              {/* Owner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نام و نام خانوادگی مالک <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: دکتر علی محمدی"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    کد ملی مالک <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="۱۰ رقم کد ملی مالک"
                    value={ownerNationalId}
                    onChange={(e) => setOwnerNationalId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    موبایل مالک <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="09121112233"
                    value={ownerMobile}
                    onChange={(e) => setOwnerMobile(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رمز عبور امن مالک <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="حداقل ۶ کاراکتر"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition"
                  />
                </div>
              </div>

              {/* Owner Role Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نقش سازمانی مالک در کلینیک <span className="text-rose-500">*</span>
                </label>
                <select
                  value={ownerRole}
                  onChange={(e) => setOwnerRole(e.target.value as 'dentist' | 'manager')}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-bold text-slate-800 outline-none transition bg-white"
                >
                  <option value="dentist">پزشک معالج و مالک کلینیک</option>
                  <option value="manager">مدیر ارشد و مالک کلینیک</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  مالک کلینیک (Owner) حق دسترسی ویژه تنظیمات، تایید کاربران و فعال‌سازی ماژول بیمه را بر عهده دارد.
                </p>
              </div>

              {/* Active Roles Selection */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-800">
                    پیکربندی نقش‌های سازمانی کلینیک:
                  </label>
                  <span className="text-[10px] text-slate-500">پذیرش، پزشک و لابراتوار به صورت پیش‌فرض فعال هستند</span>
                </div>
                
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                  {/* Receptionist - Default */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 cursor-not-allowed opacity-90">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#005581]" />
                      <span>۱. منشی / پذیرش بیمار</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#005581] text-white font-bold">
                      پیش‌فرض
                    </span>
                  </label>

                  {/* Dentist - Default */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 cursor-not-allowed opacity-90">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#005581]" />
                      <span>۲. پزشک معالج</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#005581] text-white font-bold">
                      پیش‌فرض
                    </span>
                  </label>

                  {/* Accountant - Optional */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeAccountant}
                        onChange={(e) => setActiveAccountant(e.target.checked)}
                        className="w-4 h-4 rounded text-[#005581] focus:ring-0 cursor-pointer"
                      />
                      <span>۳. حسابدار / مدیر مالی</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                      اختیاری
                    </span>
                  </label>

                  {/* Manager - Optional */}
                  <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeManager}
                        onChange={(e) => setActiveManager(e.target.checked)}
                        className="w-4 h-4 rounded text-[#005581] focus:ring-0 cursor-pointer"
                      />
                      <span>۴. مدیر ارشد کلینیک</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                      اختیاری
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-[#fffffa] font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5 text-[#ffd200]" />
                <span>ثبت نهایی و ورود به پورتال کلینیک (Zero-Data)</span>
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
