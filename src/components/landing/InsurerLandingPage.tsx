import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Lock,
  FileCheck2,
  ChevronLeft,
} from 'lucide-react';
import { UserRole } from '../../types';

interface InsurerLandingPageProps {
  onInsurerLogin: (providerName: string, role: UserRole, userName?: string, email?: string) => void;
  onBackToDentora: () => void;
}

export const InsurerLandingPage: React.FC<InsurerLandingPageProps> = ({
  onInsurerLogin,
  onBackToDentora,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'presets'>('presets');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [providerName, setProviderName] = useState('بیمه ایران');
  const [insurerRole, setInsurerRole] = useState<UserRole>('reviewer');

  const presetAccounts = [
    {
      name: 'زهرا صادقی',
      roleTitle: 'بازبین ادعاها و اسناد',
      role: 'reviewer' as UserRole,
      provider: 'بیمه ایران',
      email: 'sadeghi@iraninsurance.ir',
      badge: 'Claim Reviewer',
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-900',
    },
    {
      name: 'دکتر احسان رستمی',
      roleTitle: 'پزشک معتمد و بازبین بالینی/رادیولوژی',
      role: 'medical_inspector' as UserRole,
      provider: 'بیمه ایران',
      email: 'rostami@iraninsurance.ir',
      badge: 'Medical Reviewer',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900',
    },
    {
      name: 'مریم عباسی',
      roleTitle: 'بازبین ادعاها و اسناد',
      role: 'reviewer' as UserRole,
      provider: 'بیمه تامین اجتماعی',
      email: 'abbasi@tamin.ir',
      badge: 'Claim Reviewer',
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-900',
    },
    {
      name: 'دکتر حمید سجادی',
      roleTitle: 'پزشک معتمد و بازبین پزشکی',
      role: 'medical_inspector' as UserRole,
      provider: 'بیمه تامین اجتماعی',
      email: 'sajjadi@tamin.ir',
      badge: 'Medical Reviewer',
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-900',
    },
    {
      name: 'مهندس رضا بهرامی',
      roleTitle: 'مدیر ارشد سازمان بیمه‌گر',
      role: 'insurance_manager' as UserRole,
      provider: 'بیمه تامین اجتماعی',
      email: 'bahrami@tamin.ir',
      badge: 'Insurance Manager',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-900',
    },
  ];

  const insuranceProviders = [
    'بیمه ایران',
    'بیمه تامین اجتماعی',
    'بیمه خدمات درمانی / سلامت',
    'بیمه سامان',
    'بیمه دانا',
    'بیمه البرز',
    'بیمه آتیه‌سازان حافظ',
    'بیمه پارسیان',
    'بیمه پاسارگاد',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signup' && !email.trim()) {
      alert('لطفاً ایمیل سازمانی خود را وارد نمایید.');
      return;
    }
    const resolvedName = fullName.trim() || (insurerRole === 'reviewer' ? 'زهرا صادقی' : insurerRole === 'medical_inspector' ? 'دکتر احسان رستمی' : 'کارشناس بیمه');
    onInsurerLogin(providerName, insurerRole, resolvedName, email);
  };

  return (
    <div className="min-h-screen bg-[#fffffa] text-slate-900 font-sans dir-rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#fffffa]/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDentora}
              className="w-10 h-10 rounded-xl bg-[#005581] text-[#fffffa] flex items-center justify-center font-black text-2xl shadow-md ring-2 ring-[#ffd200]/50 hover:bg-[#004266] transition cursor-pointer"
              title="بازگشت به صفحه اصلی دنتورا"
            >
              د
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#005581]">دنتورا</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#005581] text-[#fffffa] font-bold">
                  پورتال سازمان بیمه‌گر
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#005581] transition">امکانات</a>
            <a href="#how-it-works" className="hover:text-[#005581] transition">نحوه کار</a>
            <a href="#security" className="hover:text-[#005581] transition">امنیت و حریم خصوصی</a>
          </nav>

          {/* Login / Signup CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setActiveTab('login');
              }}
              className="text-xs font-bold text-slate-600 hover:text-[#005581] px-3 py-2 rounded-xl transition cursor-pointer"
            >
              ورود / ثبت‌نام
            </button>

            <button
              onClick={onBackToDentora}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#ffd200]" />
              <span>بازگشت به دنتورا</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 bg-gradient-to-b from-[#fffffa] via-[#72cdf4]/10 to-[#fffffa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Right Side: Hero Content */}
            <div className="space-y-6 text-right">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005581]/10 text-[#005581] text-xs font-bold border border-[#005581]/20">
                <ShieldCheck className="w-4 h-4 text-[#005581]" />
                <span>سامانه هوشمند رسیدگی به ادعاهای دندان‌پزشکی</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-[#005581] tracking-tight leading-tight">
                پورتال هوشمند سازمان بیمه‌گر برای تسویه یکپارچه دندان‌پزشکی
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                دنتورا با بهره‌گیری از هوشمندترین الگوریتم‌های رسیدگی و مسیر بررسی سریع درمان، فرآیند رسیدگی به مطالبات دندان‌پزشکی را برای سازمان‌های بیمه‌گر شفاف، سریع و امن می‌کند.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setActiveTab('signup');
                  }}
                  className="px-8 py-4 rounded-2xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-black text-sm shadow-lg transition cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <ShieldCheck className="w-5 h-5 text-[#005581]" />
                  <span>ورود کارشناسان بیمه</span>
                  <ChevronLeft className="w-4 h-4 text-[#005581]" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#005581]">۶۵٪</div>
                  <div className="text-xs text-slate-500 font-bold mt-1">کاهش زمان رسیدگی</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#005581]">۹۸٪</div>
                  <div className="text-xs text-slate-500 font-bold mt-1">دقت کشف تقلب</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#005581]">۲۴/۷</div>
                  <div className="text-xs text-slate-500 font-bold mt-1">پشتیبانی پرونده‌ها</div>
                </div>
              </div>
            </div>

            {/* Left Side: Mockup Analytics Preview Card */}
            <div className="relative">
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 space-y-6 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#005581]" />
                    <span className="font-extrabold text-sm text-slate-900">داشبورد تحلیلی</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#005581] text-[#ffd200] font-bold">
                    آنلاین
                  </span>
                </div>

                {/* Claim Chart Preview */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-bold">
                    <span>پیش‌بینی حجم مطالبات</span>
                    <span>۳۰ روز آینده</span>
                  </div>
                  <div className="h-28 bg-gradient-to-t from-[#005581]/10 to-transparent rounded-2xl flex items-end justify-between p-3 gap-2">
                    <div className="w-full bg-[#72cdf4] rounded-t-lg h-[60%]"></div>
                    <div className="w-full bg-[#005581] rounded-t-lg h-[80%]"></div>
                    <div className="w-full bg-[#72cdf4] rounded-t-lg h-[50%]"></div>
                    <div className="w-full bg-[#005581] rounded-t-lg h-[90%]"></div>
                    <div className="w-full bg-[#ffd200] rounded-t-lg h-[75%]"></div>
                    <div className="w-full bg-[#005581] rounded-t-lg h-[65%]"></div>
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[11px] text-emerald-700 font-bold block mb-1">بررسی سریع</span>
                    <strong className="text-lg font-black text-emerald-900">۳۴۰ پرونده</strong>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                    <span className="text-[11px] text-rose-700 font-bold block mb-1">نرخ تقلب</span>
                    <strong className="text-lg font-black text-rose-900">۲.۱٪</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= INSURER LOGIN / SIGNUP MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto dir-rtl">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tooth Logo + Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#005581] text-[#fffffa] flex items-center justify-center font-black text-3xl mx-auto shadow-lg ring-4 ring-[#005581]/10">
                د
              </div>
              <h3 className="text-xl font-black text-slate-900">دنتورا</h3>
              <p className="text-xs text-slate-500 font-medium">پورتال سازمان بیمه‌گر</p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-[#005581] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                حساب‌های کارشناسی
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#005581] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ورود مستقیم
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-[#005581] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ثبت‌نام جدید
              </button>
            </div>

            {/* Tab: Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  جهت ورود سریع با هویت کارشناسی مورد نظر خود، روی کارت مربوطه کلیک فرمایید:
                </p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {presetAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        onInsurerLogin(acc.provider, acc.role, acc.name, acc.email);
                      }}
                      className="w-full text-right p-3 rounded-2xl border border-slate-200 hover:border-[#005581] bg-white hover:bg-slate-50 transition cursor-pointer flex items-center justify-between shadow-2xs group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-[#005581]">
                            {acc.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#005581]/10 text-[#005581] font-bold">
                            {acc.provider}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{acc.roleTitle}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{acc.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#ffd200]/20 text-[#005581] border border-[#ffd200]">
                          {acc.badge}
                        </span>
                        <span className="text-xs text-[#005581] font-bold flex items-center gap-1 group-hover:translate-x-[-2px] transition">
                          <span>ورود</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            {activeTab !== 'presets' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: زهرا صادقی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ایمیل سازمانی
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@insurance.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm outline-none transition bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام سازمان بیمه‌گر
                </label>
                <select
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-bold text-slate-800 outline-none transition bg-white cursor-pointer"
                >
                  {insuranceProviders.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نقش شما در سازمان بیمه‌گر <span className="text-rose-500">*</span>
                </label>
                <select
                  value={insurerRole}
                  onChange={(e) => setInsurerRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-bold text-slate-800 outline-none transition bg-white cursor-pointer"
                >
                  <option value="reviewer">بازبین ادعاها و اسناد (Insurance Reviewer)</option>
                  <option value="medical_inspector">پزشک معتمد و بازبین پزشکی (Medical Reviewer)</option>
                  <option value="insurance_manager">مدیریت ارشد پورتال بیمه (Insurance Manager)</option>
                  <option value="insurer_admin">راهبر ارشد پورتال بیمه‌گر (Insurance Admin)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-5 h-5 text-[#ffd200]" />
                <span>{activeTab === 'signup' ? 'ثبت‌نام و ورود' : 'ورود به پورتال بیمه‌گر'}</span>
              </button>

            </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
