import React, { useState, useEffect } from 'react';
import { toPersianDigits } from '../../utils/persianDigits';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  X,
  CreditCard,
  FileCheck,
  AlertCircle,
  Phone,
  Shield,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  Lock,
} from 'lucide-react';
import { SimulatedPaymentGatewayModal } from './SimulatedPaymentGatewayModal';

interface OnlineBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  isLoggedInPatient?: boolean;
  loggedInPatientName?: string;
  onExistingPatientRedirect?: () => void;
  onCompleteBooking: (bookingDetails: {
    dentistId: string;
    dentistName: string;
    slot: string;
    date: string;
    reason: string;
    patientName: string;
    patientPhone: string;
    patientNationalId: string;
    isFirstVisit: boolean;
    checkInCompleted: boolean;
    primaryInsurance: string;
    supplInsurance?: string;
    allergies?: string[];
    medicalHistory?: string[];
    notes?: string;
    medications?: string;
    emergencyPhone?: string;
  }) => void;
}

export const OnlineBookingModal: React.FC<OnlineBookingModalProps> = ({
  isOpen,
  onClose,
  clinicName,
  isLoggedInPatient = false,
  loggedInPatientName = 'بیمار محترم',
  onExistingPatientRedirect,
  onCompleteBooking,
}) => {
  // Step State
  // 'doctor_reason' | 'calendar_select' | 'auth_account' | 'visit_fee' | 'checkin_form' | 'confirmed'
  const [step, setStep] = useState<'doctor_reason' | 'calendar_select' | 'auth_account' | 'visit_fee' | 'checkin_form' | 'confirmed'>('doctor_reason');

  // Booking Parameters
  const [dentistId, setDentistId] = useState('u-dentist1');
  const [dentistName, setDentistName] = useState('دکتر کاویانی (جراح دندانپزشک)');
  const [visitReason, setVisitReason] = useState('معاینه دوره‌ای، عصب‌کشی و جرم‌گیری');

  // Photo Calendar Selection State
  const [selectionType, setSelectionType] = useState<'fastest' | 'custom'>('custom');
  const [selectedDay, setSelectedDay] = useState('امروز ۲۰ مرداد');
  const [selectedShift, setSelectedShift] = useState<'morning' | 'evening'>('morning');
  const [selectedSlot, setSelectedSlot] = useState('۱۰:۳۰');

  // 15-Minute Slot Lock Timer
  const [lockTimer, setLockTimer] = useState(900); // 15 mins = 900s
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Authentication State for First-Time Patient
  const [isFirstVisit, setIsFirstVisit] = useState(!isLoggedInPatient);
  const [patientFullName, setPatientFullName] = useState(isLoggedInPatient ? loggedInPatientName : '');
  const [patientNationalId, setPatientNationalId] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [resendNotification, setResendNotification] = useState<string | null>(null);
  const [isAuthConfirmed, setIsAuthConfirmed] = useState(isLoggedInPatient);

  // Check-In Form State
  const [checkInConditions, setCheckInConditions] = useState<string[]>([
    'فشار خون بالا'
  ]);
  const [checkInAllergies, setCheckInAllergies] = useState<string[]>([
    'پنی‌سیلین و آنتی‌بیوتیک'
  ]);
  const [checkInOtherNotes, setCheckInOtherNotes] = useState('حساسیت شدید به آموکسی‌سیلین و پنی‌سیلین (سابقه شوک خفیف). لطفاً داروی جایگزین تجویز شود.');
  const [checkInMedications, setCheckInMedications] = useState('لوزارتان ۲۵ میلی‌گرم');
  const [checkInEmergencyPhone, setCheckInEmergencyPhone] = useState('09121112233');
  const [primaryInsurance, setPrimaryInsurance] = useState('بیمه تامین اجتماعی');
  const [supplInsurance, setSupplInsurance] = useState('بیمه دانا (اختیاری)');

  // Simulated Payment Gateway Dialog State
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [visitFeePaid, setVisitFeePaid] = useState(false);

  // 15-Minute Lock Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockTimer === 0) {
      setIsTimerActive(false);
      alert('زمان ۱۵ دقیقه‌ای قفل موقت اسلات شما به پایان رسید و این اسلات به لیست زمان‌های آزاد بازگشت.');
      setStep('calendar_select');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, lockTimer]);

  // OTP Countdown Effect
  useEffect(() => {
    let timer: any = null;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1 -> Step 2
  const handleProceedToCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('calendar_select');
  };

  // Step 2 -> Lock Slot & Go to Auth / Visit Fee / Finalize
  const handleLockSlotAndProceed = () => {
    setIsTimerActive(true);
    setLockTimer(900);

    if (isFirstVisit) {
      if (isLoggedInPatient) {
        setStep('visit_fee');
      } else {
        setStep('auth_account');
      }
    } else {
      // Existing patient -> Skip check-in form & visit fee, finalize directly
      handleFinalizeBooking(true);
    }
  };

  // Auth Handler
  const handleSendOtp = () => {
    if (!patientPhone || patientPhone.length < 11) {
      alert('لطفاً شماره همراه معتبر ۱۱ رقمی وارد نمایید.');
      return;
    }
    setOtpSent(true);
    setOtpCountdown(60);
    setResendNotification('کد تایید ۵ رقمی پیامک شد (کد تستی سامانه: 54321)');
    setOtpCode('54321');
  };

  const handleResendOtp = () => {
    if (!patientPhone || patientPhone.length < 11) {
      alert('لطفاً شماره همراه معتبر وارد نمایید.');
      return;
    }
    setOtpSent(true);
    setOtpCountdown(60);
    setOtpCode('54321');
    setResendNotification('کد تایید جدید مجدداً برای شماره شما پیامک گردید (کد آزمایشی: 54321)');
  };

  const handleVerifyAuthAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFullName.trim() || !patientNationalId.trim()) {
      alert('لطفاً نام کامل و کد ملی خود را وارد نمایید.');
      return;
    }
    if (!otpCode) {
      alert('لطفاً کد تایید پیامک شده را وارد کنید.');
      return;
    }

    setIsAuthConfirmed(true);

    if (isFirstVisit) {
      // First visit -> Charge visit fee (50,000 Toman)
      setStep('visit_fee');
    } else {
      // Returning patient -> Skip visit fee, go to check-in
      setStep('checkin_form');
    }
  };

  // Payment Success Handler from Simulated Gateway
  const handlePaymentSuccess = () => {
    setIsPaymentGatewayOpen(false);
    setVisitFeePaid(true);
    setStep('checkin_form');
  };

  // Finalize Booking
  const handleFinalizeBooking = (skipCheckIn = false) => {
    alert(`نوبت شما با موفقیت ثبت شد!\nکد رهگیری و مشخصات نوبت به شماره همراه شما پیامک گردید.`);
    onCompleteBooking({
      dentistId,
      dentistName: dentistId === 'u-dentist1' ? 'دکتر کاویانی' : 'دکتر شریفی',
      slot: selectedSlot,
      date: selectedDay,
      reason: visitReason,
      patientName: patientFullName || 'بیمار محترم',
      patientPhone: patientPhone || '09121112233',
      patientNationalId: patientNationalId || '1270001122',
      isFirstVisit,
      checkInCompleted: !skipCheckIn,
      primaryInsurance,
      supplInsurance: supplInsurance !== 'بدون بیمه تکمیلی' ? supplInsurance : undefined,
      allergies: checkInAllergies,
      medicalHistory: checkInConditions,
      notes: checkInOtherNotes,
      medications: checkInMedications,
      emergencyPhone: checkInEmergencyPhone,
    });

    setIsTimerActive(false);
    setStep('confirmed');
  };

  // Available slots
  const morningSlots = ['۱۰:۳۰', '۱۰:۴۵', '۱۱:۰۰', '۱۱:۱۵', '۱۱:۳۰', '۱۱:۴۵'];
  const eveningSlots = ['۱۶:۰۰', '۱۶:۳۰', '۱۷:۰۰', '۱۷:۳۰', '۱۸:۰۰', '۱۸:۳۰'];

  const daysList = [
    { title: 'امروز', dateStr: '۲۰ مرداد' },
    { title: 'فردا', dateStr: '۲۱ مرداد' },
    { title: 'پنج‌شنبه', dateStr: '۲۲ مرداد' },
    { title: 'جمعه', dateStr: '۲۳ مرداد' },
    { title: 'شنبه', dateStr: '۲۴ مرداد' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs dir-rtl font-sans animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden relative dir-rtl">
          
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-[#004266] via-[#005581] to-[#00334e] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffd200] text-[#005581] flex items-center justify-center font-black text-xl shadow-md shrink-0">
                <Calendar className="w-6 h-6 text-[#005581]" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">سامانه نوبت‌دهی آنلاین {clinicName}</h3>
                <p className="text-xs text-slate-200 mt-0.5">ثبت رزرو، قفل موقت اسلات و تشکیل پرونده الکترونیک</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 15-MINUTE LOCK TIMER BANNER (Shown above dialog body when active) */}
          {isTimerActive && step !== 'confirmed' && (
            <div className="bg-amber-50 border-b border-amber-300 p-3 px-5 flex items-center justify-between text-xs text-amber-900 font-bold">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>زمان قفل موقت نوبت:</span>
                <span className="font-mono text-sm text-rose-700 font-black tracking-widest bg-amber-200 px-2 py-0.5 rounded-md">
                  {formatTimer(lockTimer)}
                </span>
              </div>
              <span className="text-[11px] text-amber-800 font-medium hidden sm:inline">
                این زمان برای سایرین قفل می‌باشد و پس از پایان، آزاد می‌گردد.
              </span>
            </div>
          )}

          {/* Modal Content Body */}
          <div className="p-6 space-y-6">

            {/* ========================================================== */}
            {/* STEP 1: DOCTOR & REASON SELECT                             */}
            {/* ========================================================== */}
            {step === 'doctor_reason' && (
              <form onSubmit={handleProceedToCalendar} className="space-y-5 text-xs">
                <div>
                  <h4 className="font-black text-slate-900 text-sm mb-1">گام اول: انتخاب پزشک و علت مراجعه</h4>
                  <p className="text-slate-500 text-xs">لطفاً پزشک معالج و علت اصلی مراجعه جهت هماهنگی تجهیزات یونیت را مشخص کنید.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">انتخاب پزشک معالج:</label>
                    <select
                      value={dentistId}
                      onChange={(e) => {
                        setDentistId(e.target.value);
                        setDentistName(e.target.value === 'u-dentist1' ? 'دکتر کاویانی (جراح دندانپزشک)' : 'دکتر شریفی (متخصص ترمیم و زیبایی)');
                      }}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#005581] font-bold text-sm outline-none bg-slate-50 focus:bg-white cursor-pointer"
                    >
                      <option value="u-dentist1">دکتر کاویانی (جراح و دندان‌پزشک معالج)</option>
                      <option value="u-dentist2">دکتر شریفی (متخصص ترمیم، زیبایی و عصب‌کشی)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">علت اصلی مراجعه:</label>
                    <input
                      type="text"
                      required
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      placeholder="مثلاً معاینه دوره‌ای، عصب‌کشی دندان ۶، جرم‌گیری یا روکش"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#005581] text-xs font-bold outline-none bg-slate-50 focus:bg-white transition"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-blue-900 space-y-1">
                    <span className="font-bold block text-xs">مراجعه اول در این کلینیک هستید؟</span>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="firstVisit"
                          checked={isFirstVisit}
                          onChange={() => setIsFirstVisit(true)}
                          className="accent-[#005581]"
                        />
                        <span>بله (نوبت اول و تشکیل پرونده)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="firstVisit"
                          checked={!isFirstVisit}
                          onChange={() => setIsFirstVisit(false)}
                          className="accent-[#005581]"
                        />
                        <span>خیر (پرونده دارم - عدم نیاز به فرم چک‌این)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <span>مشاهده زمان‌های خالی تقویم</span>
                    <ArrowRight className="w-4 h-4 text-[#ffd200]" />
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================== */}
            {/* STEP 2: TIME SELECTION CALENDAR (MATCHING PHOTO LAYOUT)   */}
            {/* ========================================================== */}
            {step === 'calendar_select' && (
              <div className="space-y-4 text-xs dir-rtl">
                <div className="text-center font-black text-slate-800 text-sm">
                  انتخاب زمان نوبت
                </div>

                {/* Top Option 1: Fastest Available Slot */}
                <div
                  onClick={() => {
                    setSelectionType('fastest');
                    setSelectedDay('امروز ۲۰ مرداد');
                    setSelectedSlot('۱۰:۳۰');
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                    selectionType === 'fastest'
                      ? 'border-[#005581] bg-blue-50/50 ring-2 ring-[#005581]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-slate-500 font-bold block">زودترین زمان نوبت خالی:</span>
                    <strong className="text-slate-900 font-black text-sm">امروز (سه شنبه) - ساعت ۱۰:۳۰</strong>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectionType === 'fastest' ? 'border-[#005581] bg-[#005581] text-white' : 'border-slate-300'
                    }`}
                  >
                    {selectionType === 'fastest' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                {/* Top Option 2: Choose Custom Time */}
                <div
                  onClick={() => setSelectionType('custom')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                    selectionType === 'custom'
                      ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-black text-slate-800 text-sm">انتخاب زمان دیگر</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectionType === 'custom' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {selectionType === 'custom' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                {/* Main Calendar Picker Box (Matching User Image Structure) */}
                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[260px]">
                  
                  {/* Left Main Area: Morning/Evening Tabs & Time Slots */}
                  <div className="flex-1 p-4 space-y-4 bg-white">
                    {/* Shift Tabs (Morning / Evening) */}
                    <div className="flex border-b border-slate-200 text-center font-bold">
                      <button
                        onClick={() => setSelectedShift('morning')}
                        className={`flex-1 pb-2 border-b-2 transition cursor-pointer ${
                          selectedShift === 'morning'
                            ? 'border-blue-600 text-blue-600 font-black'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        صبح
                      </button>
                      <button
                        onClick={() => setSelectedShift('evening')}
                        className={`flex-1 pb-2 border-b-2 transition cursor-pointer ${
                          selectedShift === 'evening'
                            ? 'border-blue-600 text-blue-600 font-black'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        عصر
                      </button>
                    </div>

                    {/* Time Slots Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 pt-2">
                      {(selectedShift === 'morning' ? morningSlots : eveningSlots).map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setSelectionType('custom');
                            }}
                            className={`py-3 rounded-xl border font-mono font-black text-sm transition cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                                : 'border-slate-200 hover:border-slate-400 text-slate-800 bg-slate-50/50'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Side Column: Days List (Matching Photo) */}
                  <div className="w-full md:w-44 border-t md:border-t-0 md:border-r border-slate-200 bg-slate-50/60 p-2 space-y-1.5 shrink-0">
                    {daysList.map((d) => {
                      const dayStr = `${d.title} ${d.dateStr}`;
                      const isSelected = selectedDay === dayStr;
                      return (
                        <button
                          key={d.dateStr}
                          type="button"
                          onClick={() => {
                            setSelectedDay(dayStr);
                            setSelectionType('custom');
                          }}
                          className={`w-full p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-white text-blue-700 font-extrabold shadow-sm'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block text-xs font-bold">{d.title}</span>
                          <span className="block text-[11px] font-mono text-slate-500">{d.dateStr}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* Continue Action Button */}
                <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => setStep('doctor_reason')}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold text-xs"
                  >
                    بازگشت به انتخاب پزشک
                  </button>

                  <button
                    onClick={handleLockSlotAndProceed}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <span>قفل اسلات و ادامه</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 3: ACCOUNT CREATION & AUTHENTICATION (FOR 1st VISIT)  */}
            {/* ========================================================== */}
            {step === 'auth_account' && (
              <form onSubmit={handleVerifyAuthAndProceed} className="space-y-4 text-xs">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#005581]" />
                    <span>ایجاد حساب کاربری و احراز هویت بیمار</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    جهت ثبت رسمی پرونده و ارسال پیامک‌های پیگیری نوبت، اطلاعات هویت معتبر خود را وارد نمایید.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نام و نام خانوادگی:</label>
                    <input
                      type="text"
                      required
                      value={patientFullName}
                      onChange={(e) => setPatientFullName(e.target.value)}
                      placeholder="مثلاً علی علوی"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-bold text-xs outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">کد ملی ۱۰ رقمی:</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={patientNationalId}
                      onChange={(e) => setPatientNationalId(e.target.value)}
                      placeholder="0012345678"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-mono text-center text-xs font-bold outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">شماره همراه جهت دریافت کد تایید (OTP):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="09120000000"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-mono text-center text-xs font-bold outline-none bg-slate-50 focus:bg-white"
                    />
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-4 py-2.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap transition"
                      >
                        ارسال کد تایید
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-[#005581] rounded-xl font-bold text-xs cursor-pointer border border-blue-300 whitespace-nowrap transition flex items-center gap-1.5"
                      >
                        <span>ارسال مجدد کد</span>
                        {otpCountdown > 0 && (
                          <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded-md text-[#005581] font-bold">
                            ({otpCountdown}s)
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2 p-3 bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs text-[#005581] font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>کد تایید ۵ رقمی پیامک شد</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode('54321')}
                        className="text-[11px] text-[#005581] underline hover:text-[#004266] font-extrabold cursor-pointer"
                      >
                        درج خودکار کد تستی (54321)
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="54321"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#005581] font-mono text-center text-base font-bold tracking-widest outline-none bg-white text-slate-900 shadow-inner"
                    />

                    {resendNotification && (
                      <p className="text-[11px] text-emerald-700 font-medium text-center">
                        {resendNotification}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <span>تایید احراز هویت و مرحله بعدی</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================== */}
            {/* STEP 4: ONLINE VISIT FEE PAYMENT (ONLY 1ST VISIT)          */}
            {/* ========================================================== */}
            {step === 'visit_fee' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm text-amber-950">
                    <CreditCard className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>پرداخت آنلاین هزینه ویزیت اولیه (۵۰,۰۰۰ تومان)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    با توجه به اینکه این مراجعه، <strong>اولین حضور شما در این کلینیک</strong> می‌باشد، هزینه ویزیت اولیه به صورت آنلاین دریافت می‌شود. در مراجعات بعدی نیاز به پرداخت این مبلغ نخواهد بود.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">پزشک معالج:</span>
                    <strong className="text-slate-900">{dentistName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">زمان نوبت رزروشده:</span>
                    <strong className="text-slate-900">{selectedDay} ساعت {selectedSlot}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-[#005581]">
                    <span>مبلغ قابل پرداخت:</span>
                    <span className="font-mono text-emerald-600">۵۰,۰۰۰ تومان</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setStep('calendar_select')}
                    className="px-4 py-2 text-slate-500 font-bold cursor-pointer"
                  >
                    تغییر زمان نوبت
                  </button>

                  <button
                    onClick={() => setIsPaymentGatewayOpen(true)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>ورود به درگاه پرداخت شتاب (۵۰,۰۰۰ تومان)</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 5: COMPREHENSIVE ONLINE CHECK-IN FORM                 */}
            {/* ========================================================== */}
            {step === 'checkin_form' && (
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#005581]" />
                    <span>فرم چک‌این و تشکیل پرونده آنلاین</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    جهت تسریع در فرآیند پذیرش و حفظ سلامت بالینی، سوابق پزشکی خود را تکمیل فرمایید.
                  </p>
                </div>

                <div className="space-y-4 max-h-[340px] overflow-y-auto pl-1">
                  {/* Pre-existing conditions */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block">۱. سوابق بیماری‌های زمینه‌ای:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'دیابت / قند خون',
                        'فشار خون بالا',
                        'بیماری‌های قلبی-عروقی',
                        'آسم و بیماری ریوی',
                        'صرع / تشنج',
                        'هپاتیت / ایدز',
                        'بارداری / شیردهی',
                      ].map((cond) => {
                        const isChecked = checkInConditions.includes(cond);
                        return (
                          <label
                            key={cond}
                            className={`p-2 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition ${
                              isChecked
                                ? 'border-[#005581] bg-blue-50 text-[#005581] font-bold'
                                : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setCheckInConditions([...checkInConditions, cond]);
                                else setCheckInConditions(checkInConditions.filter((c) => c !== cond));
                              }}
                              className="accent-[#005581]"
                            />
                            <span>{cond}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block">۲. حساسیت‌های دارویی و بی‌حسی:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['پنی‌سیلین و آنتی‌بیوتیک', 'بی‌حسی موضعی (لیدوکائین)', 'آسپیرین و مسکن‌ها', 'لاتکس'].map((alg) => {
                        const isChecked = checkInAllergies.includes(alg);
                        return (
                          <label
                            key={alg}
                            className={`p-2 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition ${
                              isChecked
                                ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                                : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setCheckInAllergies([...checkInAllergies, alg]);
                                else setCheckInAllergies(checkInAllergies.filter((a) => a !== alg));
                              }}
                              className="accent-rose-600"
                            />
                            <span>{alg}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dedicated Textarea for Other Medical Notes / Allergies */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      سایر موارد (توضیحات تکمیلی سوابق پزشکی، جراحی یا حساسیت‌ها):
                    </label>
                    <textarea
                      rows={2}
                      value={checkInOtherNotes}
                      onChange={(e) => setCheckInOtherNotes(e.target.value)}
                      placeholder="در صورت داشتن سابقه بیماری خاص، پیوند عضو، مصرف داروی اعصاب یا سایر توضیحات در این کادر یادداشت کنید..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none bg-slate-50 focus:bg-white transition"
                    />
                  </div>

                  {/* Insurance Fields (Primary & Supplementary) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        بیمه پایه دندان‌پزشکی (اجباری):
                      </label>
                      <select
                        value={primaryInsurance}
                        onChange={(e) => setPrimaryInsurance(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs outline-none cursor-pointer"
                      >
                        <option value="بیمه تامین اجتماعی">بیمه تامین اجتماعی</option>
                        <option value="بیمه سلامت ایران">بیمه سلامت ایران</option>
                        <option value="بیمه نیروهای مسلح">بیمه نیروهای مسلح</option>
                        <option value="فاقد بیمه پایه">فاقد بیمه پایه (آزاد)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        بیمه تکمیلی درمان (اختیاری):
                      </label>
                      <select
                        value={supplInsurance}
                        onChange={(e) => setSupplInsurance(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs outline-none cursor-pointer"
                      >
                        <option value="بیمه دانا (اختیاری)">بیمه دانا</option>
                        <option value="بیمه ایران">بیمه ایران</option>
                        <option value="بیمه البرز">بیمه البرز</option>
                        <option value="بیمه آتیه‌سازان حافظ">بیمه آتیه‌سازان حافظ</option>
                        <option value="بیمه آسیا">بیمه آسیا</option>
                        <option value="بدون بیمه تکمیلی">بدون بیمه تکمیلی</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Checkin Action Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleFinalizeBooking(true)}
                    className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
                  >
                    انصراف و تکمیل چکاین به صورت حضوری در کلینیک
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalizeBooking(false)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                    <span>ثبت نهایی فرم و تایید نوبت</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 6: BOOKING CONFIRMED                                  */}
            {/* ========================================================== */}
            {step === 'confirmed' && (
              <div className="text-center py-6 space-y-4 text-xs">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    نوبت شما با موفقیت در {clinicName} ثبت گردید!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    کد رهگیری و مشخصات نوبت به شماره همراه شما پیامک گردید.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-xs space-y-2 text-right">
                  <div>پزشک معالج: <strong>{dentistName}</strong></div>
                  <div>تاریخ مراجعه: <strong className="font-mono text-slate-900">{toPersianDigits(selectedDay)}</strong></div>
                  <div>ساعت نوبت: <strong className="font-mono text-[#005581] font-bold">{toPersianDigits(selectedSlot)}</strong></div>
                  <div>کد رهگیری سامانه: <strong className="font-mono text-emerald-600 font-extrabold">DEN-{toPersianDigits(Math.floor(100000 + Math.random() * 900000))}</strong></div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-[#005581] text-white rounded-2xl font-black text-xs shadow-md cursor-pointer"
                >
                  بستن و بازگشت
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Simulated Payment Gateway Integration */}
      <SimulatedPaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={50000}
        description={`پرداخت ویزیت اولیه آنلاین - ${clinicName}`}
      />
    </>
  );
};
