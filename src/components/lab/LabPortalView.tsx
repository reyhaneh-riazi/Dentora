import React, { useState, useEffect } from 'react';
import { ToothIcon } from '../common/ToothIcon';
import { ClinicRegistration, LabOrder, DentalLab, LabStaffAccount } from '../../types';
import {
  getStoredLabs,
  registerLabWithAccount,
  addStaffToLab,
  authenticateLabStaff,
  getActiveLabSession,
  setActiveLabSession,
  clearActiveLabSession,
  getActiveLabStaffSession,
  setActiveLabStaffSession,
} from '../../services/clinicDataStore';
import {
  Truck,
  Flame,
  PenTool,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  X,
  ChevronLeft,
  Eye,
  Layers,
  Sparkles,
  Building2,
  Home,
  Check,
  UserCheck,
  Phone,
  LogIn,
  UserPlus,
  LogOut,
  Stethoscope,
  Calendar,
  ShieldCheck,
  Users,
  KeyRound,
  Lock,
  ArrowRight,
  Shield,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

interface LabPortalViewProps {
  labOrders: LabOrder[];
  clinics?: ClinicRegistration[];
  onUpdateOrderStatus: (orderId: string, status: LabOrder['status'], milestone: string, targetClinicId?: string) => void;
  onAddLabOrder?: (newOrder: LabOrder, targetClinicId?: string) => void;
  onBackToLanding?: () => void;
}

type LabFilterTab = 'all' | 'ordered' | 'designing' | 'in_furnace' | 'shipped' | 'delivered';

export const LabPortalView: React.FC<LabPortalViewProps> = ({
  labOrders,
  clinics = [],
  onUpdateOrderStatus,
  onAddLabOrder,
  onBackToLanding,
}) => {
  // Stored Labs list
  const [labs, setLabs] = useState<DentalLab[]>(() => getStoredLabs());

  // Active Lab & Staff Sessions
  const [activeLab, setActiveLab] = useState<DentalLab | null>(() => getActiveLabSession());
  const [activeStaff, setActiveStaff] = useState<LabStaffAccount | null>(() => getActiveLabStaffSession());

  // Gateway View State (when not logged in)
  const [gatewayMode, setGatewayMode] = useState<'landing' | 'login' | 'register'>(() => {
    return activeLab ? 'landing' : 'landing';
  });

  // Modal States
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<LabFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Lab Registration Form State
  const [regLabName, setRegLabName] = useState('');
  const [regManagerName, setRegManagerName] = useState('');
  const [regLicenseNumber, setRegLicenseNumber] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regDays, setRegDays] = useState(4);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Add Staff Modal Form State (Creator Only)
  const [newStaffFullName, setNewStaffFullName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'technician' | 'staff'>('technician');
  const [newStaffMobile, setNewStaffMobile] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');

  // New Order Form State
  const [newOrderNumber, setNewOrderNumber] = useState(`LAB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newPatientName, setNewPatientName] = useState('');
  const [newDentistName, setNewDentistName] = useState(
    clinics[0]?.ownerRole === 'dentist' ? clinics[0].ownerName : 'دکتر سارا فرهمند'
  );
  const [newDentistSpecialty, setNewDentistSpecialty] = useState('متخصص پروتزهای دندانی و زیبایی');
  const [newClinicTargetId, setNewClinicTargetId] = useState(clinics[0]?.id || 'clinic-alborz');
  const [newItemType, setNewItemType] = useState<string>('روکش زيرکونيا کامل');
  const [newToothFdi, setNewToothFdi] = useState<number>(36);
  const [newShade, setNewShade] = useState('A2');
  const [newAlloy, setNewAlloy] = useState('زیرکونیا چند لایه (Multi-layer)');
  const [newStatus, setNewStatus] = useState<LabOrder['status']>('designing');
  const [newExpectedDate, setNewExpectedDate] = useState('۱۴۰۵/۰۵/۲۵');
  const [newDoctorNotes, setNewDoctorNotes] = useState('مارجین چمفر، شیدینگ طبیعی، رعایت اکلوژن دندان مجاور');

  // Milestone modification in detail modal
  const [customMilestone, setCustomMilestone] = useState('');

  // Sync state if session updates
  useEffect(() => {
    setLabs(getStoredLabs());
  }, []);

  // Handle Lab Staff Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim()) {
      setLoginError('لطفاً نام کاربری یا شماره موبایل را وارد نمایید.');
      return;
    }

    const authResult = authenticateLabStaff(loginUsername, loginPassword);
    if (!authResult) {
      setLoginError('اطلاعات ورود نامعتبر است. نام کاربری یا کلمه عبور اشتباه است.');
      return;
    }

    setActiveLab(authResult.lab);
    setActiveStaff(authResult.staff);
    setGatewayMode('landing');
    setLoginUsername('');
    setLoginPassword('');
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (username: string, pass: string) => {
    const authResult = authenticateLabStaff(username, pass);
    if (authResult) {
      setActiveLab(authResult.lab);
      setActiveStaff(authResult.staff);
      setGatewayMode('landing');
    }
  };

  // Handle New Lab Registration
  const handleRegisterLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regLabName.trim() || !regManagerName.trim() || !regPhone.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError('لطفاً تمامی فیلدهای الزامی ستاره‌دار را تکمیل نمایید.');
      return;
    }

    try {
      const { lab, staff } = registerLabWithAccount(
        {
          name: regLabName.trim(),
          managerName: regManagerName.trim(),
          licenseNumber: regLicenseNumber.trim() || `PL-${Math.floor(1000 + Math.random() * 9000)}`,
          phone: regPhone.trim(),
          mobile: regMobile.trim() || regPhone.trim(),
          address: regAddress.trim() || 'تهران، مرکز تخصصی ساخت پروتز دندانی',
          specialties: ['روکش زیرکونیا چند لایه CAD/CAM', 'لمینت سرامیکی Emax', 'اباتمنت ایمپلنت'],
          averageTurnaroundDays: Number(regDays) || 4,
        },
        {
          fullName: regManagerName.trim(),
          username: regUsername.trim(),
          password: regPassword.trim(),
          mobile: regMobile.trim() || regPhone.trim(),
        }
      );

      setLabs(getStoredLabs());
      setActiveLab(lab);
      setActiveStaff(staff);
      setGatewayMode('landing');

      // Reset Form
      setRegLabName('');
      setRegManagerName('');
      setRegLicenseNumber('');
      setRegPhone('');
      setRegMobile('');
      setRegAddress('');
      setRegUsername('');
      setRegPassword('');

      alert(`لابراتوار «${lab.name}» با موفقیت ثبت شد و حساب کاربری مدیر ارشد برای ${staff.fullName} فعال گردید.`);
    } catch (err) {
      setRegError('خطا در ثبت‌نام لابراتوار. لطفاً مجدداً تلاش نمایید.');
    }
  };

  // Handle Add New Staff / Technician (Creator/Owner Only)
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLab) return;
    if (!newStaffFullName.trim() || !newStaffUsername.trim() || !newStaffPassword.trim()) {
      alert('لطفاً نام، نام کاربری و کلمه عبور همکار جدید را وارد نمایید.');
      return;
    }

    const createdStaff = addStaffToLab(activeLab.id, {
      fullName: newStaffFullName.trim(),
      username: newStaffUsername.trim(),
      password: newStaffPassword.trim(),
      role: newStaffRole,
      mobile: newStaffMobile.trim() || activeLab.phone,
    });

    if (createdStaff) {
      const refreshedLabs = getStoredLabs();
      setLabs(refreshedLabs);
      const updatedLab = refreshedLabs.find((l) => l.id === activeLab.id) || activeLab;
      setActiveLab(updatedLab);
      setIsAddStaffModalOpen(false);
      setNewStaffFullName('');
      setNewStaffUsername('');
      setNewStaffPassword('');
      setNewStaffMobile('');
      alert(`همکار جدید «${createdStaff.fullName}» با نام کاربری ${createdStaff.username} به لابراتوار اضافه شد.`);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    clearActiveLabSession();
    setActiveLab(null);
    setActiveStaff(null);
    setGatewayMode('landing');
  };

  // Handle Create Lab Order Direct
  const handleAddOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLab || !newPatientName.trim()) {
      alert('لطفاً نام و نام خانوادگی بیمار را وارد کنید.');
      return;
    }

    const clinicObj = clinics.find((c) => c.id === newClinicTargetId) || clinics[0];
    const newOrder: LabOrder = {
      id: newOrderNumber,
      orderNumber: newOrderNumber,
      patientId: `p-${Date.now()}`,
      patientName: newPatientName.trim(),
      dentistName: newDentistName.trim() || 'دکتر معالج',
      dentistSpecialty: newDentistSpecialty,
      toothFdi: newToothFdi,
      itemType: newItemType,
      shade: newShade,
      alloyOrMaterial: newAlloy,
      labId: activeLab.id,
      labName: activeLab.name,
      clinicId: newClinicTargetId,
      clinicName: clinicObj?.name || 'کلینیک تخصصی البرز',
      status: newStatus,
      orderedDate: new Date().toLocaleDateString('fa-IR'),
      expectedDeliveryDate: newExpectedDate,
      currentMilestone: getMilestoneForStatus(newStatus),
      doctorNotes: newDoctorNotes,
      stages: [
        { name: 'ثبت سفارش و دریافت قالب/اسکن دیجیتال', done: true },
        { name: 'طراحی 3D CAD/CAM و کست دیجیتال', done: newStatus !== 'ordered' },
        { name: `پخت کوره سانتر و شیدینگ رنگ ${newShade}`, done: newStatus === 'in_furnace' || newStatus === 'shipped' || newStatus === 'delivered' },
        { name: 'کنترل نهایی کیفیت و ارسال به مطب', done: newStatus === 'shipped' || newStatus === 'delivered' },
      ],
    };

    if (onAddLabOrder) {
      onAddLabOrder(newOrder, newClinicTargetId);
    }

    setIsAddOrderModalOpen(false);
    setNewPatientName('');
    setNewOrderNumber(`LAB-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const getMilestoneForStatus = (status: LabOrder['status']): string => {
    switch (status) {
      case 'designing':
        return 'طراحی 3D CAD/CAM و کست دیجیتال';
      case 'in_furnace':
        return 'مرحله پخت پودر زيرکونيا در کوره سانتر';
      case 'shipped':
        return 'تحویل به پیک جهت ارسال به کلینیک';
      case 'delivered':
        return 'تحویل به مطب و آماده نصب روی دندان بیمار';
      case 'ordered':
      default:
        return 'ثبت اولیه سفارش و دریافت اسکن/قالب';
    }
  };

  // Status Badge Component matching screenshot
  const renderStatusBadge = (status: LabOrder['status']) => {
    switch (status) {
      case 'in_furnace':
        return (
          <span className="px-3 py-1 rounded-full bg-[#ffd200]/25 text-[#005581] font-bold text-xs flex items-center gap-1.5 border border-[#ffe552]">
            <Flame className="w-3.5 h-3.5 text-[#005581]" />
            <span>کوره سانتر</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="px-3 py-1 rounded-full bg-[#72cdf4]/25 text-[#005581] font-bold text-xs flex items-center gap-1.5 border border-[#72cdf4]">
            <Truck className="w-3.5 h-3.5 text-[#005581]" />
            <span>ارسال‌شده به مطب</span>
          </span>
        );
      case 'designing':
        return (
          <span className="px-3 py-1 rounded-full bg-[#005581] text-[#fffffa] font-bold text-xs flex items-center gap-1.5 shadow-xs">
            <PenTool className="w-3.5 h-3.5 text-[#ffd200]" />
            <span>طراحی CAD</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>تحویل نهایی مطب</span>
          </span>
        );
      case 'ordered':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>ثبت اولیه</span>
          </span>
        );
    }
  };

  // =========================================================================
  // GATEWAY: NOT LOGGED IN / AUTH CHOICE SCREEN
  // =========================================================================
  if (!activeLab || !activeStaff) {
    return (
      <div className="min-h-screen bg-[#fffffa] text-[#0b2535] p-4 sm:p-6 lg:p-10 font-sans antialiased dir-rtl flex flex-col justify-between select-none">
        <div className="max-w-4xl mx-auto w-full space-y-8 my-auto">
          
          {/* Top Bar for Gateway */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black text-xl shadow-md border-2 border-[#72cdf4]">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#005581]">
                  درگاه پورتال لابراتوار دندان‌پزشکی دنتورا
                </h1>
                <p className="text-xs text-[#005581]/70 font-bold">
                  اتصال مستقیم کلینیک‌ها به لابراتوارهای تخصصی ساخت پروتز و روکش دیجیتال
                </p>
              </div>
            </div>

            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-4 py-2 rounded-xl bg-[#fffffa] hover:bg-[#72cdf4]/15 text-[#005581] border border-[#72cdf4] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#005581]" />
                <span>بازگشت به صفحه اصلی</span>
              </button>
            )}
          </div>

          {/* GATEWAY LANDING: 2 MAIN BUTTONS */}
          {gatewayMode === 'landing' && (
            <div className="space-y-6">
              <div className="bg-[#005581] text-[#fffffa] rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#72cdf4] text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffd200] text-[#005581] text-xs font-black">
                  <Sparkles className="w-4 h-4" />
                  <span>سامانه یکپارچه Dentora Lab Network</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#ffd200]">
                  ورود یا ثبت‌نام در پورتال تخصصی لابراتوار
                </h2>
                <p className="text-xs sm:text-sm text-[#fffffa]/80 max-w-xl mx-auto leading-relaxed font-medium">
                  جهت مدیریت سفارشات پروتز، تغییر وضعیت مراحل طراحی، کوره سانتر، کنترل کیفیت و ارسال پیک، لطفاً وارد حساب خود شوید یا لابراتوار جدیدی ثبت نمایید.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                  {/* Button 1: Register New Lab */}
                  <button
                    onClick={() => setGatewayMode('register')}
                    className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-2 border-[#ffe552]"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>ثبت لابراتوار جدید</span>
                  </button>

                  {/* Button 2: Login Lab Staff */}
                  <button
                    onClick={() => setGatewayMode('login')}
                    className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-[#fffffa] hover:bg-[#72cdf4]/20 text-[#005581] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-2 border-[#72cdf4]"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>ورود مسئول لابراتوار</span>
                  </button>
                </div>
              </div>

              {/* QUICK DEMO ACCOUNTS FOR INSTANT TESTING */}
              <div className="bg-[#fffffa] border border-[#72cdf4] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#72cdf4]/30 pb-2">
                  <span className="text-xs font-black text-[#005581] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#005581]" />
                    حساب‌های آزمایشی آماده جهت ورود سریع:
                  </span>
                  <span className="text-[11px] text-[#005581]/70">رمز عبور تمام اکانت‌ها: 123</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => handleQuickDemoLogin('farhad.lab', '123')}
                    className="p-3 rounded-xl border border-[#72cdf4] bg-[#72cdf4]/10 hover:bg-[#72cdf4]/25 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#005581]">پارس دنتال (CAD/CAM)</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#005581] text-[#ffd200] text-[10px] font-black">مؤسس</span>
                    </div>
                    <p className="text-[11px] text-[#005581]/80">مهندس فرهاد رضوی</p>
                    <p className="text-[10px] text-[#005581]/60 font-mono">کاربری: farhad.lab</p>
                  </div>

                  <div
                    onClick={() => handleQuickDemoLogin('reza.cad', '123')}
                    className="p-3 rounded-xl border border-[#72cdf4] bg-[#72cdf4]/10 hover:bg-[#72cdf4]/25 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#005581]">پارس دنتال (CAD/CAM)</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#72cdf4] text-[#005581] text-[10px] font-black">تکنسین</span>
                    </div>
                    <p className="text-[11px] text-[#005581]/80">مهندس رضا کریمی</p>
                    <p className="text-[10px] text-[#005581]/60 font-mono">کاربری: reza.cad</p>
                  </div>

                  <div
                    onClick={() => handleQuickDemoLogin('keyvan.art', '123')}
                    className="p-3 rounded-xl border border-[#72cdf4] bg-[#72cdf4]/10 hover:bg-[#72cdf4]/25 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#005581]">آرت دنتال (Art Dental)</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#005581] text-[#ffd200] text-[10px] font-black">مؤسس</span>
                    </div>
                    <p className="text-[11px] text-[#005581]/80">استاد کیوان امینی</p>
                    <p className="text-[10px] text-[#005581]/60 font-mono">کاربری: keyvan.art</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GATEWAY LOGIN FORM */}
          {gatewayMode === 'login' && (
            <div className="bg-[#fffffa] border-2 border-[#005581] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#72cdf4]/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-[#005581]">ورود مسئول یا همکاران لابراتوار</h2>
                    <p className="text-xs text-[#005581]/70">نام کاربری و رمز عبور تخصیص داده شده را وارد نمایید</p>
                  </div>
                </div>
                <button
                  onClick={() => setGatewayMode('landing')}
                  className="px-3 py-1.5 rounded-xl border border-[#72cdf4] text-xs font-bold text-[#005581] hover:bg-[#72cdf4]/15"
                >
                  بازگشت
                </button>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-black text-[#005581] mb-1">
                    نام کاربری یا شماره موبایل:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً farhad.lab یا 09123456789"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#005581] mb-1">
                    کلمه عبور:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="رمز عبور خود را وارد کنید"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setGatewayMode('register')}
                    className="text-xs font-bold text-[#005581] hover:underline"
                  >
                    لابراتوار شما ثبت نشده؟ <strong>ثبت‌نام لابراتوار جدید</strong>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-[#ffd200] font-black text-xs shadow-md flex items-center gap-2 cursor-pointer border border-[#72cdf4]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>ورود به کارتابل لابراتوار</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GATEWAY REGISTRATION FORM */}
          {gatewayMode === 'register' && (
            <div className="bg-[#fffffa] border-2 border-[#005581] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#72cdf4]/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black border border-[#ffe552]">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-[#005581]">ثبت و احراز هویت لابراتوار همکار جدید</h2>
                    <p className="text-xs text-[#005581]/70">
                      ایجاد شناسه رسمی لابراتوار، اضافه شدن به لیست کلینیک‌ها و ساخت اکانت مدیر ارشد
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGatewayMode('landing')}
                  className="px-3 py-1.5 rounded-xl border border-[#72cdf4] text-xs font-bold text-[#005581] hover:bg-[#72cdf4]/15"
                >
                  بازگشت
                </button>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegisterLabSubmit} className="space-y-4 text-xs">
                {/* Section 1: Lab Info */}
                <div className="p-4 rounded-2xl bg-[#72cdf4]/10 border border-[#72cdf4]/40 space-y-3">
                  <span className="font-black text-xs text-[#005581] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#005581]" />
                    ۱. مشخصات رسمی لابراتوار دندان‌پزشکی
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        نام کامل لابراتوار: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثلاً: لابراتوار دیجیتال صبا دنتال"
                        value={regLabName}
                        onChange={(e) => setRegLabName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        شماره پروانه ساخت / مجوز بهداشت:
                      </label>
                      <input
                        type="text"
                        placeholder="PL-6623"
                        value={regLicenseNumber}
                        onChange={(e) => setRegLicenseNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-mono font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        تلفن ثابت لابراتوار: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="021-88112233"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-mono font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        شماره همراه هماهنگی پیک:
                      </label>
                      <input
                        type="text"
                        placeholder="09121112233"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-mono font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        میانگین زمان تحویل (روز کاری):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={regDays}
                        onChange={(e) => setRegDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-mono font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#005581] mb-1">
                      آدرس دقیق فیزیکی لابراتوار:
                    </label>
                    <input
                      type="text"
                      placeholder="تهران، خیابان ولیعصر، نرسیده به توانیر، پلاک ۴۲"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section 2: Creator / Founder Account */}
                <div className="p-4 rounded-2xl bg-[#ffd200]/15 border border-[#ffe552] space-y-3">
                  <span className="font-black text-xs text-[#005581] flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#005581]" />
                    ۲. حساب کاربری مؤسس و مدیر ارشد (شخص ایجادکننده)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        نام و نام خانوادگی مدیر: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مهندس مسعود صادقی"
                        value={regManagerName}
                        onChange={(e) => setRegManagerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        نام کاربری جهت ورود: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="masoud.lab"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-mono font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#005581] mb-1">
                        کلمه عبور اختصاصی: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="حداقل ۴ کاراکتر"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setGatewayMode('login')}
                    className="text-xs font-bold text-[#005581] hover:underline"
                  >
                    قبلاً ثبت‌نام کرده‌اید؟ <strong>ورود به حساب</strong>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-[#ffd200] font-black text-xs shadow-md flex items-center gap-2 cursor-pointer border border-[#72cdf4]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                    <span>تکمیل ثبت‌نام و ورود به پنل</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // LOGGED-IN DASHBOARD VIEW (MATCHING EXACT IMAGE.PNG LAYOUT)
  // =========================================================================

  // Filter orders strictly for the current active lab
  const myLabOrders = labOrders.filter((o) => {
    const matchId = o.labId === activeLab.id;
    const matchName =
      o.labName &&
      (o.labName.toLowerCase().includes(activeLab.name.toLowerCase()) ||
        activeLab.name.toLowerCase().includes(o.labName.toLowerCase()));
    return matchId || matchName;
  });

  // Calculate counters
  const countAll = myLabOrders.length;
  const countDesigning = myLabOrders.filter((o) => o.status === 'designing').length;
  const countFurnace = myLabOrders.filter((o) => o.status === 'in_furnace').length;
  const countShipped = myLabOrders.filter((o) => o.status === 'shipped').length;
  const countDelivered = myLabOrders.filter((o) => o.status === 'delivered').length;

  // Filter based on active tab and search query
  const displayedOrders = myLabOrders.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchPatient = order.patientName?.toLowerCase().includes(q);
      const matchDentist = order.dentistName?.toLowerCase().includes(q);
      const matchNum = order.orderNumber?.toLowerCase().includes(q);
      const matchTooth = order.toothFdi?.toString().includes(q);
      const matchItem = order.itemType?.toLowerCase().includes(q);
      return matchPatient || matchDentist || matchNum || matchTooth || matchItem;
    }
    return true;
  });

  const isCreator = activeStaff.isCreator || activeStaff.role === 'owner';

  return (
    <div className="min-h-screen bg-[#fffffa] text-[#0b2535] p-3 sm:p-6 lg:p-8 font-sans antialiased dir-rtl select-none">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* TOP STATUS BAR (MATCHING HEADER OF IMAGE) */}
        <header className="flex flex-wrap items-center justify-between gap-3 bg-[#005581] text-[#fffffa] p-3 sm:p-4 rounded-2xl shadow-md border-2 border-[#72cdf4]/40">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Dentora OS Brand Logo Box */}
            <div className="w-10 h-10 rounded-xl bg-[#ffd200] text-[#005581] flex items-center justify-center border border-[#ffe552] shadow-xs">
              <ToothIcon className="w-6 h-6 text-[#005581]" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-[#fffffa]">
                  {activeLab.name}
                </span>
                <span className="text-[11px] text-[#ffd200] font-bold">| Dentora Lab OS</span>
              </div>
              <p className="text-[11px] text-[#72cdf4] flex items-center gap-2">
                <span>کاربر: <strong>{activeStaff.fullName}</strong></span>
                <span className="px-2 py-0.2 rounded-full bg-[#fffffa]/20 text-[#fffffa] text-[10px] font-mono">
                  {activeStaff.role === 'owner' ? 'مؤسس / مدیر ارشد' : 'تکنسین پروتز'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fffffa]/10 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>سیستم آنلاین و متصل به کلینیک‌ها</span>
            </div>

            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3 py-1.5 rounded-xl bg-[#fffffa]/15 hover:bg-[#fffffa]/25 text-[#fffffa] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>صفحه اصلی</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از حساب</span>
            </button>
          </div>
        </header>

        {/* HERO BANNER (EXACTLY MATCHING IMAGE.PNG) */}
        <section className="bg-[#005581] text-[#fffffa] rounded-3xl p-4 sm:p-6 shadow-xl border border-[#72cdf4]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#004266] text-[#72cdf4] flex items-center justify-center font-black shadow-inner border border-[#72cdf4]/40 shrink-0">
              <Truck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-[#fffffa]">
                  پورتال مدیریت و ردیابی سفارشات لابراتوار
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-[#72cdf4]/30 text-[#fffffa] text-xs font-black border border-[#72cdf4]">
                  {countAll} سفارش
                </span>
              </div>
              <p className="text-xs text-[#72cdf4] font-medium">
                شفافیت کامل مراحل ساخت پروتز، روکش و اباتمنت (طراحی ⬅️ کوره ⬅️ ارسال ⬅️ تحویل)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
            {/* ADD NEW STAFF BUTTON: ONLY VISIBLE FOR LAB CREATOR/OWNER */}
            {isCreator && (
              <button
                onClick={() => setIsAddStaffModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#fffffa] hover:bg-[#72cdf4]/20 text-[#005581] font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer border border-[#72cdf4]"
              >
                <Users className="w-4 h-4 text-[#005581]" />
                <span>+ افزودن همکار جدید</span>
              </button>
            )}

            {/* ADD NEW ORDER BUTTON (YELLOW BUTTON AS IN IMAGE) */}
            <button
              onClick={() => setIsAddOrderModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#ffd200] hover:bg-[#ffe552] text-[#005581] font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer border border-[#ffe552]"
            >
              <Plus className="w-4 h-4 text-[#005581]" />
              <span>ثبت سفارش جدید لابراتوار</span>
            </button>
          </div>
        </section>

        {/* SEARCH AND FILTER TABS ROW (EXACTLY MATCHING IMAGE.PNG) */}
        <section className="bg-[#fffffa] border border-[#72cdf4]/50 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#005581]/50 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام بیمار، کد سفارش..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-[#fffffa] border border-[#72cdf4] text-xs font-bold text-[#005581] placeholder-[#005581]/40 focus:outline-none focus:ring-2 focus:ring-[#005581]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-[#005581]/50 hover:text-[#005581]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills with Exact Counters (Matching Image.png) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {/* 1. All Orders */}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#005581] text-[#fffffa] shadow-sm'
                  : 'bg-[#fffffa] text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/15'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>همه سفارشات</span>
              <span className="w-5 h-5 rounded-full bg-[#fffffa] text-[#005581] font-mono text-[11px] flex items-center justify-center font-black mr-1">
                {countAll}
              </span>
            </button>

            {/* 2. Designing */}
            <button
              onClick={() => setActiveTab('designing')}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'designing'
                  ? 'bg-[#005581] text-[#ffd200] shadow-sm'
                  : 'bg-[#72cdf4]/15 text-[#005581] border border-[#72cdf4]/40 hover:bg-[#72cdf4]/30'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-[#005581]" />
              <span>طراحی</span>
              <span className="w-5 h-5 rounded-full bg-[#fffffa] text-[#005581] font-mono text-[11px] flex items-center justify-center font-bold mr-1">
                {countDesigning}
              </span>
            </button>

            {/* 3. In Furnace */}
            <button
              onClick={() => setActiveTab('in_furnace')}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'in_furnace'
                  ? 'bg-[#ffd200] text-[#005581] shadow-sm font-black border border-[#ffe552]'
                  : 'bg-[#ffd200]/20 text-[#005581] border border-[#ffe552] hover:bg-[#ffd200]/35'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#005581]" />
              <span>کوره</span>
              <span className="w-5 h-5 rounded-full bg-[#fffffa] text-[#005581] font-mono text-[11px] flex items-center justify-center font-black mr-1">
                {countFurnace}
              </span>
            </button>

            {/* 4. Shipped */}
            <button
              onClick={() => setActiveTab('shipped')}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shipped'
                  ? 'bg-[#72cdf4] text-[#005581] shadow-sm font-black'
                  : 'bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/35'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#005581]" />
              <span>ارسال</span>
              <span className="w-5 h-5 rounded-full bg-[#fffffa] text-[#005581] font-mono text-[11px] flex items-center justify-center font-bold mr-1">
                {countShipped}
              </span>
            </button>

            {/* 5. Delivered */}
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'delivered'
                  ? 'bg-emerald-600 text-[#fffffa] shadow-sm font-black'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>تحویل</span>
              <span className="w-5 h-5 rounded-full bg-[#fffffa] text-emerald-800 font-mono text-[11px] flex items-center justify-center font-bold mr-1">
                {countDelivered}
              </span>
            </button>
          </div>
        </section>

        {/* ORDER CARDS GRID (EXACTLY MATCHING IMAGE.PNG STRUCTURE) */}
        {displayedOrders.length === 0 ? (
          <div className="bg-[#fffffa] border border-[#72cdf4]/50 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#72cdf4]/20 text-[#005581] flex items-center justify-center mx-auto">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-[#005581]">هیچ سفارشی در این وضعیت موجود نیست</h3>
            <p className="text-xs text-[#005581]/70 max-w-md mx-auto">
              سفارشات ارجاعی از مطب دندان‌پزشکان پس از ثبت توسط پزشک بلافاصله در این کارتابل نمایش داده می‌شوند.
            </p>
            <button
              onClick={() => setIsAddOrderModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#005581] text-[#ffd200] font-black text-xs shadow-md cursor-pointer"
            >
              + ثبت سفارش جدید
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#fffffa] border-2 border-[#72cdf4]/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                {/* Card Top Header: Order ID + Item + Status Badge */}
                <div className="flex items-start justify-between gap-3 border-b border-[#72cdf4]/30 pb-3">
                  <div className="space-y-1">
                    <span className="font-mono font-black text-xs text-[#005581] px-2 py-0.5 rounded-lg bg-[#72cdf4]/15 border border-[#72cdf4]/40 inline-block">
                      {order.orderNumber}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-[#005581]">
                      {order.itemType} (دندان {order.toothFdi})
                    </h3>
                  </div>

                  <div>{renderStatusBadge(order.status)}</div>
                </div>

                {/* Patient / Dentist / Lab Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="space-y-1.5">
                    <p className="text-[#005581]/70">
                      بیمار: <strong className="text-[#005581] text-xs sm:text-sm">{order.patientName}</strong>
                    </p>
                    <p className="text-[#005581]/70">
                      پزشک معالج: <strong className="text-[#005581]">{order.dentistName}</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[#005581]/70">
                      لابراتوار: <strong className="text-[#005581]">{order.labName}</strong>
                    </p>
                    {order.shade && (
                      <p className="text-[#005581]/70">
                        شید رنگ: <strong className="text-[#005581] font-mono">{order.shade}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Milestone Gray/Blue Box */}
                <div className="p-3 rounded-2xl bg-[#72cdf4]/10 border border-[#72cdf4]/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#005581] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#005581]" />
                      گام فعلی ساخت:
                    </span>
                    <span className="text-[11px] font-mono text-[#005581]/70">
                      تحویل: {order.expectedDeliveryDate}
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#005581] pr-4">
                    {order.currentMilestone}
                  </p>
                </div>

                {/* Card Footer: Detail & Status Change Button */}
                <div className="pt-1 flex items-center justify-between border-t border-[#72cdf4]/20">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setCustomMilestone(order.currentMilestone);
                    }}
                    className="text-xs font-black text-[#005581] hover:text-[#004266] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#005581]" />
                    <Eye className="w-3.5 h-3.5" />
                    <span>جزئیات و تغییر وضعیت</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {order.status === 'ordered' && (
                      <button
                        onClick={() =>
                          onUpdateOrderStatus(
                            order.id,
                            'designing',
                            'طراحی 3D CAD/CAM و کست دیجیتال',
                            order.clinicId
                          )
                        }
                        className="px-2.5 py-1 rounded-xl bg-[#005581] text-[#fffffa] font-bold text-[11px]"
                      >
                        شروع طراحی CAD
                      </button>
                    )}
                    {order.status === 'designing' && (
                      <button
                        onClick={() =>
                          onUpdateOrderStatus(
                            order.id,
                            'in_furnace',
                            'مرحله پخت پودر زيرکونيا در کوره سانتر',
                            order.clinicId
                          )
                        }
                        className="px-2.5 py-1 rounded-xl bg-[#ffd200] text-[#005581] font-black text-[11px] border border-[#ffe552]"
                      >
                        ورود به کوره
                      </button>
                    )}
                    {order.status === 'in_furnace' && (
                      <button
                        onClick={() =>
                          onUpdateOrderStatus(
                            order.id,
                            'shipped',
                            'تحویل به پیک جهت ارسال به کلینیک',
                            order.clinicId
                          )
                        }
                        className="px-2.5 py-1 rounded-xl bg-[#72cdf4] text-[#005581] font-black text-[11px]"
                      >
                        ارسال با پیک
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() =>
                          onUpdateOrderStatus(
                            order.id,
                            'delivered',
                            'تحویل به مطب و آماده نصب روی دندان بیمار',
                            order.clinicId
                          )
                        }
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 text-[#fffffa] font-black text-[11px]"
                      >
                        تایید تحویل
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW COLLEAGUE / STAFF (CREATOR ONLY) */}
      {/* ========================================================================= */}
      {isAddStaffModalOpen && isCreator && (
        <div className="fixed inset-0 bg-[#005581]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl max-w-lg w-full border-2 border-[#005581] shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#72cdf4]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black border border-[#ffe552]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#005581]">
                    افزودن همکار جدید به «{activeLab.name}»
                  </h3>
                  <p className="text-xs text-[#005581]/70">
                    ساخت اکانت برای تکنسین‌های CAD/CAM و کوره سانتر جهت دسترسی به پنل
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="p-1 text-[#005581]/60 hover:text-[#005581] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#005581] mb-1">
                  نام و نام خانوادگی همکار: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مهندس رضا کریمی"
                  value={newStaffFullName}
                  onChange={(e) => setNewStaffFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    نقش سازمانی در لابراتوار:
                  </label>
                  <div className="w-full px-3 py-2.5 rounded-xl bg-[#72cdf4]/20 border border-[#72cdf4] text-[#005581] font-black flex items-center justify-between">
                    <span>مسئول لابراتوار</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#005581] text-[#ffd200] text-[10px] font-bold">پیش‌فرض</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    شماره موبایل همکار:
                  </label>
                  <input
                    type="text"
                    placeholder="09129998877"
                    value={newStaffMobile}
                    onChange={(e) => setNewStaffMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-mono font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    نام کاربری ورود: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="reza.cad"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-mono font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    کلمه عبور اختصاصی: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="حداقل ۴ کاراکتر"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold focus:ring-2 focus:ring-[#005581] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#72cdf4]/15 border border-[#72cdf4] text-[#005581] space-y-1">
                <p className="font-black text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#005581]" />
                  دسترسی همکار:
                </p>
                <p className="text-[11px] text-[#005581]/80">
                  این همکار می‌تواند از صفحه اصلی لاگین کرده و سفارشات را تغییر وضعیت دهد، اما دکمه افزودن همکار جدید فقط برای شما (مؤسس لابراتوار) فعال خواهد بود.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#72cdf4]/40">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] text-[#ffd200] font-black text-xs shadow-md border border-[#72cdf4]"
                >
                  ثبت و صدور دسترسی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW ORDER DIRECTLY (LAB SIDE) */}
      {/* ========================================================================= */}
      {isAddOrderModalOpen && (
        <div className="fixed inset-0 bg-[#005581]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl max-w-xl w-full border-2 border-[#005581] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#72cdf4]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black border border-[#ffe552]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#005581]">
                    ثبت سفارش مستقیم در کارتابل «{activeLab.name}»
                  </h3>
                  <p className="text-xs text-[#005581]/70">
                    ورود دستی مشخصات قالب فیزیکی یا اسکن دیجیتال ارسالی از کلینیک
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOrderModalOpen(false)}
                className="p-1 text-[#005581]/60 hover:text-[#005581] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOrderSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    شماره رهگیری سفارش:
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrderNumber}
                    onChange={(e) => setNewOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-mono font-bold text-[#005581]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    نام و نام خانوادگی بیمار: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="زهرا حسینی"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-bold text-[#005581]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    پزشک معالج سفارشدهنده:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="دکتر سارا فرهمند"
                    value={newDentistName}
                    onChange={(e) => setNewDentistName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-bold text-[#005581]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    کلینیک مقصد:
                  </label>
                  <select
                    value={newClinicTargetId}
                    onChange={(e) => setNewClinicTargetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-bold text-[#005581]"
                  >
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.cityName || 'مرکزی'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    نوع پروتز / روکش:
                  </label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-bold text-[#005581]"
                  >
                    <option value="روکش زيرکونيا کامل">روکش زيرکونيا کامل</option>
                    <option value="لمینت Emax">لمینت Emax</option>
                    <option value="اباتمنت ایمپلنت">اباتمنت ایمپلنت</option>
                    <option value="سرامیک PFM">سرامیک PFM</option>
                    <option value="پروتز پارسیل">پروتز پارسیل</option>
                    <option value="نایت گارد">نایت گارد</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    شماره دندان (FDI):
                  </label>
                  <input
                    type="number"
                    min={11}
                    max={48}
                    value={newToothFdi}
                    onChange={(e) => setNewToothFdi(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-mono font-bold text-[#005581]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    شید رنگ انتخابی:
                  </label>
                  <select
                    value={newShade}
                    onChange={(e) => setNewShade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-mono font-bold text-[#005581]"
                  >
                    {['A1', 'A2', 'A3', 'A3.5', 'B1', 'B2', 'BL1', 'BL2', 'BL3'].map((s) => (
                      <option key={s} value={s}>
                        شید {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    وضعیت اولیه سفارش:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as LabOrder['status'])}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-bold text-[#005581]"
                  >
                    <option value="designing">طراحی CAD/CAM</option>
                    <option value="in_furnace">کوره سانتر</option>
                    <option value="shipped">ارسال با پیک</option>
                    <option value="ordered">ثبت اولیه</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#005581] mb-1">
                    تاریخ تخمینی تحویل:
                  </label>
                  <input
                    type="text"
                    value={newExpectedDate}
                    onChange={(e) => setNewExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-mono font-bold text-[#005581]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#005581] mb-1">
                  دستور تراش و یادداشت پزشک معالج:
                </label>
                <textarea
                  rows={2}
                  value={newDoctorNotes}
                  onChange={(e) => setNewDoctorNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] font-bold text-[#005581]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#72cdf4]/40">
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] text-[#ffd200] font-black text-xs shadow-md border border-[#72cdf4]"
                >
                  ثبت و انتقال به کارتابل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ORDER DETAIL AND STATUS UPDATE */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[#005581]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl max-w-xl w-full border-2 border-[#005581] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#72cdf4]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#005581]">
                    پرونده فنی ساخت پروتز {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-[#005581]/70">
                    بیمار: {selectedOrder.patientName} | دندان #{selectedOrder.toothFdi}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#005581]/60 hover:text-[#005581] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#72cdf4]/10 border border-[#72cdf4]/40">
                <div>
                  <p className="text-[#005581]/70">پزشک معالج:</p>
                  <p className="font-black text-[#005581] mt-0.5">{selectedOrder.dentistName}</p>
                </div>
                <div>
                  <p className="text-[#005581]/70">نوع پروتز / متریال:</p>
                  <p className="font-black text-[#005581] mt-0.5">{selectedOrder.itemType} - {selectedOrder.shade}</p>
                </div>
                <div>
                  <p className="text-[#005581]/70">تاریخ ثبت سفارش:</p>
                  <p className="font-mono font-bold text-[#005581] mt-0.5">{selectedOrder.orderedDate}</p>
                </div>
                <div>
                  <p className="text-[#005581]/70">موعد تحویل:</p>
                  <p className="font-mono font-bold text-[#005581] mt-0.5">{selectedOrder.expectedDeliveryDate}</p>
                </div>
              </div>

              {selectedOrder.doctorNotes && (
                <div className="p-3 rounded-2xl bg-[#fffffa] border border-[#72cdf4] space-y-1">
                  <p className="font-bold text-[#005581]">دستور تراش و نکات پزشک معالج:</p>
                  <p className="text-[#005581]/90">{selectedOrder.doctorNotes}</p>
                </div>
              )}

              {/* Status Selector */}
              <div className="space-y-2 pt-2 border-t border-[#72cdf4]/40">
                <label className="block font-black text-[#005581]">
                  تغییر گام ساخت و ارسال پیام به پزشک معالج:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'ordered', label: 'ثبت اولیه' },
                    { key: 'designing', label: 'طراحی CAD' },
                    { key: 'in_furnace', label: 'کوره سانتر' },
                    { key: 'shipped', label: 'ارسال با پیک' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        const newM = getMilestoneForStatus(s.key as LabOrder['status']);
                        setCustomMilestone(newM);
                        onUpdateOrderStatus(selectedOrder.id, s.key as LabOrder['status'], newM, selectedOrder.clinicId);
                        setSelectedOrder({ ...selectedOrder, status: s.key as LabOrder['status'], currentMilestone: newM });
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedOrder.status === s.key
                          ? 'bg-[#005581] text-[#ffd200] border-[#005581] shadow-xs'
                          : 'bg-[#fffffa] text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/20'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#005581] mb-1">
                  توضیح وضعیت جاری (گام فعلی ساخت):
                </label>
                <input
                  type="text"
                  value={customMilestone}
                  onChange={(e) => setCustomMilestone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fffffa] border border-[#72cdf4] text-[#005581] font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#72cdf4]/40">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(
                      selectedOrder.id,
                      selectedOrder.status,
                      customMilestone || selectedOrder.currentMilestone,
                      selectedOrder.clinicId
                    );
                    setSelectedOrder(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#005581] text-[#ffd200] font-black text-xs shadow-md border border-[#72cdf4]"
                >
                  ذخیره تغییرات و همگام‌سازی با مطب پزشک
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
