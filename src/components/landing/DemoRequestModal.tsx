import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  Building,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Check,
  Stethoscope,
} from 'lucide-react';
import { isValidMobile, toEnglishDigits } from '../../utils/validators';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Step in Demo Flow: 1 = Form, 2 = OTP Verification, 3 = Success & Download
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('فاقد تخصص / بدون تخصص');
  const [clinicNameAndSpecialty, setClinicNameAndSpecialty] = useState('');

  // Captcha State
  const [captchaNum1, setCaptchaNum1] = useState(5);
  const [captchaNum2, setCaptchaNum2] = useState(4);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('83149');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // UI / Error feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSpecialty = specialty !== 'فاقد تخصص / بدون تخصص';

  // Generate random captcha on mount / refresh
  const generateNewCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2; // 2..9
    const n2 = Math.floor(Math.random() * 8) + 1; // 1..8
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    if (isOpen) {
      generateNewCaptcha();
      setErrorMessage(null);
      setStep(1);
      setOtpCode('');
    }
  }, [isOpen]);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  if (!isOpen) return null;

  // Step 1 Submission: Validate form & send OTP to mobile
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanFullName = fullName.trim();
    const cleanMobile = toEnglishDigits(mobile).trim();
    const cleanEmail = email.trim();
    const cleanCaptcha = toEnglishDigits(captchaAnswer).trim();

    if (!cleanFullName || cleanFullName.length < 3) {
      setErrorMessage('لطفاً نام و نام خانوادگی را به طور کامل وارد نمایید.');
      return;
    }

    if (!cleanMobile || !isValidMobile(cleanMobile)) {
      setErrorMessage('شماره تلفن همراه نامعتبر است (الگوی صحیح: 09xxxxxxxxx).');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('آدرس ایمیل واردشده نامعتبر است.');
      return;
    }

    if (!cleanCaptcha || parseInt(cleanCaptcha, 10) !== captchaNum1 + captchaNum2) {
      setErrorMessage('پاسخ کد امنیتی ضد ربات (کپچا) صحیح نمی‌باشد. لطفاً مجدداً وارد فرمایید.');
      generateNewCaptcha();
      return;
    }

    setIsSubmitting(true);

    // Generate random 5-digit OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      setTimerSeconds(60);
      setTimerActive(true);
      setOtpSentMessage(`کد احراز هویت یک‌بار مصرف به شماره همراه ${cleanMobile} پیامک شد.`);
    }, 500);
  };

  // Step 2 Submission: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInputOtp = toEnglishDigits(otpCode).trim();
    if (!cleanInputOtp) {
      setErrorMessage('لطفاً کد تایید را وارد نمایید.');
      return;
    }

    // Allow user-entered generated OTP or demo bypass
    if (cleanInputOtp !== generatedOtp && cleanInputOtp !== '12345') {
      setErrorMessage('کد تایید واردشده نادرست است. لطفاً کد دریافتی را بررسی فرمایید.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
      // Automatically download demo package
      handleDownloadDemoPackage();
    }, 400);
  };

  // Step 3: Trigger demo file download with real visual mockups & detailed screenshots
  const handleDownloadDemoPackage = () => {
    const demoDate = new Date().toLocaleDateString('fa-IR');
    const doctorDisplay = fullName.trim() || 'همکار گرامی';
    const clinicDisplay = hasSpecialty && clinicNameAndSpecialty.trim() ? clinicNameAndSpecialty.trim() : 'مطب / مرکز درمانی';

    const demoHtmlContent = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پکیج دموی نرم‌افزار دنتورا - Dentora Dental OS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Vazirmatn", Tahoma, sans-serif; background: #0b1e2c; color: #f1f5f9; line-height: 1.6; padding: 24px; direction: rtl; }
    .container { max-width: 1040px; margin: 0 auto; background: #ffffff; color: #1e293b; border-radius: 28px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); }
    .header { background: linear-gradient(135deg, #005581 0%, #003450 100%); color: white; padding: 40px 32px; text-align: center; position: relative; }
    .logo-badge { display: inline-flex; align-items: center; gap: 8px; background: #ffd200; color: #005581; font-weight: 900; font-size: 14px; padding: 6px 16px; border-radius: 9999px; margin-bottom: 12px; }
    .header h1 { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
    .header p { color: #bae6fd; font-size: 14px; }
    .user-info-bar { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 16px 24px; border-radius: 16px; margin: 24px 32px 10px 32px; font-size: 13px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
    .content { padding: 24px 32px 40px 32px; }
    .section-title { font-size: 18px; font-weight: 800; color: #005581; margin: 28px 0 16px 0; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .ui-showcase-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 20px; padding: 20px; margin-bottom: 24px; }
    .ui-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .ui-desc { font-size: 12px; color: #64748b; margin-bottom: 16px; }
    .mockup-window { background: #0f172a; border-radius: 14px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); }
    .mockup-topbar { background: #1e293b; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; font-size: 11px; color: #94a3b8; }
    .mockup-dots { display: flex; gap: 6px; }
    .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-red { background: #ef4444; } .dot-yellow { background: #f59e0b; } .dot-green { background: #10b981; }
    .mockup-body { background: #ffffff; color: #0f172a; padding: 20px; font-size: 12px; min-height: 180px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-pill { background: #f1f5f9; padding: 12px; border-radius: 12px; border-right: 4px solid #005581; }
    .stat-val { font-size: 16px; font-weight: 900; color: #005581; margin-top: 4px; }
    .tooth-chart { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .tooth-box { width: 44px; height: 48px; border-radius: 8px; border: 2px solid #005581; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; color: #005581; background: #ffffff; }
    .tooth-filled { background: #e0f2fe; border-color: #0284c7; color: #0369a1; }
    .tooth-decay { background: #fee2e2; border-color: #ef4444; color: #b91c1c; }
    .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
    .table th { background: #005581; color: white; padding: 8px 10px; text-align: right; }
    .table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .table tr:nth-child(even) { background: #f8fafc; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
    .tag-blue { background: #e0f2fe; color: #0369a1; }
    .tag-green { background: #dcfce7; color: #15803d; }
    .tag-amber { background: #fef3c7; color: #b45309; }
    .footer { text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; font-size: 12px; color: #64748b; }
    @media (max-width: 768px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .container { border-radius: 0; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">دنتورا - Dental OS</div>
      <h1>پکیج رسمی دموی سیستم‌عامل دنتورا</h1>
      <p>نمای کامل ماژول‌های بالینی، مالی، بیمه و لابراتوار نرم‌افزار تخصصی دندان‌پزشکی</p>
    </div>

    <div class="user-info-bar">
      <div><strong>گیرنده دمو:</strong> ${doctorDisplay} (${specialty})</div>
      ${hasSpecialty && clinicNameAndSpecialty ? `<div><strong>مرکز درمانی:</strong> ${clinicDisplay}</div>` : ''}
      <div><strong>شماره همراه:</strong> ${mobile}</div>
      <div><strong>تاریخ صدور:</strong> ${demoDate}</div>
    </div>

    <div class="content">
      <div class="section-title">۱. نمای واقعی میز کار بالینی دندان‌پزشک (Clinical Workspace)</div>
      <div class="ui-showcase-card">
        <div class="ui-title">چارت دندانی تعاملی ۶ سطحی (FDI)، دیکته صوتی هوش مصنوعی و نسخه الکترونیک</div>
        <div class="ui-desc">تصویر واقعی از محیط ثبت درمان، شرایط هر دندان، تفکیک سهم بیمه و ثبت شرح بالینی توسط پزشک</div>
        <div class="mockup-window">
          <div class="mockup-topbar">
            <div class="mockup-dots">
              <div class="mockup-dot dot-red"></div>
              <div class="mockup-dot dot-yellow"></div>
              <div class="mockup-dot dot-green"></div>
            </div>
            <span>Dentora Doctor Panel - Odontogram & Treatment</span>
            <span>بیمار: مریم کاظمی (UDR-9021)</span>
          </div>
          <div class="mockup-body">
            <div class="tooth-chart">
              <div class="tooth-box tooth-filled">18<br><span style="font-size:9px">ترمیم</span></div>
              <div class="tooth-box tooth-decay">16<br><span style="font-size:9px">پوسیدگی</span></div>
              <div class="tooth-box">15<br><span style="font-size:9px">سالم</span></div>
              <div class="tooth-box tooth-filled">14<br><span style="font-size:9px">عصب‌کشی</span></div>
              <div class="tooth-box">11<br><span style="font-size:9px">سالم</span></div>
              <div class="tooth-box tooth-filled">21<br><span style="font-size:9px">لمینیت</span></div>
              <div class="tooth-box tooth-decay">26<br><span style="font-size:9px">پوسیده</span></div>
              <div class="tooth-box">28<br><span style="font-size:9px">سالم</span></div>
            </div>
            <div class="grid-2" style="margin-top: 14px;">
              <div style="background: #f1f5f9; padding: 12px; border-radius: 10px;">
                <strong>طرح درمان جاری:</strong> ترمیم کامپوزیت ۳ سطحی دندان ۱۶ + پالپوتومی دندان ۲۶<br>
                <span class="tag tag-blue" style="margin-top: 4px;">نسخه الکترونیک بیمه سلامت صادر شد</span>
              </div>
              <div style="background: #f0fdf4; padding: 12px; border-radius: 10px; border-right: 3px solid #16a34a;">
                <strong>دستورات مراقبتی صوتی:</strong> ثبت خودکار از طریق هوش مصنوعی با تبدیل صوت فارسی دندان‌پزشک به متن پرونده
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-title">۲. نمای واقعی بخش مالی و کارکرد پزشکان (Doctor Financials)</div>
      <div class="ui-showcase-card">
        <div class="ui-title">تفکیک سهم پزشک (درصد مصوب مدیر)، سهم کلینیک و وضعیت تسویه صندوق</div>
        <div class="ui-desc">گزارش دقیق سهم پزشکان با نام بیمار، زمان حضور، علت مراجعه و سهم بیمه</div>
        <div class="mockup-window">
          <div class="mockup-topbar">
            <div class="mockup-dots">
              <div class="mockup-dot dot-red"></div>
              <div class="mockup-dot dot-yellow"></div>
              <div class="mockup-dot dot-green"></div>
            </div>
            <span>Dentora Finance - Doctor Commission Breakdown (45% Manager Rate)</span>
            <span>کلینیک تخصصی دنتورا</span>
          </div>
          <div class="mockup-body">
            <div class="grid-3" style="margin-bottom: 12px;">
              <div class="stat-pill"><div>کارکرد کل ماه:</div><div class="stat-val">۵۴,۸۰۰,۰۰۰ تومان</div></div>
              <div class="stat-pill" style="border-right-color: #10b981;"><div>سهم خالص پزشک (۴۵٪):</div><div class="stat-val" style="color: #10b981;">۲۴,۶۶۰,۰۰۰ تومان</div></div>
              <div class="stat-pill" style="border-right-color: #f59e0b;"><div>سهم مرکز / کلینیک:</div><div class="stat-val" style="color: #d97706;">۳۰,۱۴۰,۰۰۰ تومان</div></div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>نام بیمار</th>
                  <th>زمان حضور</th>
                  <th>علت مراجعه</th>
                  <th>مبلغ کل</th>
                  <th>سهم پزشک</th>
                  <th>سهم کلینیک</th>
                  <th>وضعیت تسویه</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>سارا رادپور</td>
                  <td>۱۰:۳۰ امروز</td>
                  <td>عصب‌کشی و ترمیم تخصصی</td>
                  <td>۴,۲۰۰,۰۰۰ تومان</td>
                  <td><strong>۱,۸۹۰,۰۰۰</strong></td>
                  <td>۲,۳۱۰,۰۰۰</td>
                  <td><span class="tag tag-green">تسویه‌شده پوز</span></td>
                </tr>
                <tr>
                  <td>امیرحسین رضایی</td>
                  <td>۱۱:۴۵ امروز</td>
                  <td>جراحی لثه و فلپ پریودنتال</td>
                  <td>۳,۸۰۰,۰۰۰ تومان</td>
                  <td><strong>۱,۷۱۰,۰۰۰</strong></td>
                  <td>۲,۰۹۰,۰۰۰</td>
                  <td><span class="tag tag-green">تسویه‌شده</span></td>
                </tr>
                <tr>
                  <td>نگار ابراهیمی</td>
                  <td>۱۲:۱۵ امروز</td>
                  <td>ترمیم کامپوزیت زیبایی</td>
                  <td>۲,۵۰۰,۰۰۰ تومان</td>
                  <td><strong>۱,۱۲۵,۰۰۰</strong></td>
                  <td>۱,۳۷۵,۰۰۰</td>
                  <td><span class="tag tag-amber">اقساط BNPL</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="section-title">۳. سامانه پذیرش، نوبت‌دهی و پورتال یکپارچه لابراتوار</div>
      <div class="ui-showcase-card">
        <div class="ui-title">پرونده طولی UDR، استعلام آنلاین بیمه و کارتابل مستقیم لابراتوار دندان‌سازی</div>
        <div class="ui-desc">پذیرش متصل به کارتخوان، ممیزی بیمه‌های تکمیلی، و رهگیری سفارشات زیرکونیا و متال‌سرامیک</div>
        <div class="mockup-window">
          <div class="mockup-topbar">
            <div class="mockup-dots"><div class="mockup-dot dot-red"></div><div class="mockup-dot dot-yellow"></div><div class="mockup-dot dot-green"></div></div>
            <span>Dentora Reception & Dental Lab Management</span>
            <span>اتصال برخط پوز پاسارگاد و سرور بیمه</span>
          </div>
          <div class="mockup-body">
            <div class="grid-2">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 12px;">
                <strong style="color: #005581;">سفارش لابراتوار #LAB-4029:</strong>
                <p style="margin-top: 4px;">ساخت روکش فول زیرکونیا دندان ۱۹ (شید رنگ A2) - لابراتوار نوین</p>
                <span class="tag tag-green" style="margin-top: 6px;">وضعیت: آماده ارسال به مطب</span>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 12px;">
                <strong style="color: #005581;">استعلام برخط بیمه تکمیلی دانا:</strong>
                <p style="margin-top: 4px;">تایید آنی پرونده با پوشش ۷۰٪ سقف تعهدات و صدور حواله سبز</p>
                <span class="tag tag-blue" style="margin-top: 6px;">پوشش بیمه تایید شد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      این بسته دمو توسط سیستم‌عامل جامع دنتورا (Dentora Dental OS) صادر شده است.<br>
      جهت کسب اطلاعات بیشتر یا استقرار کلینیک، به سامانه دنتورا مراجعه نمایید.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([demoHtmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dentora_Dental_OS_Demo_${fullName.replace(/\s+/g, '_') || 'Doctor'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[92vh] overflow-y-auto dir-rtl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black text-2xl mx-auto shadow-md ring-4 ring-[#ffd200]/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            دریافت دموی نرم‌افزار دنتورا
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            مشخصات خود را وارد فرمایید تا کد تایید احراز هویت به شماره همراه شما پیامک شده و پکیج دمو دانلود گردد.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === 1
                  ? 'bg-[#005581] text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span>۱. ثبت مشخصات</span>
              {step > 1 && <Check className="w-3.5 h-3.5" />}
            </div>
            <div className="w-4 h-0.5 bg-slate-200"></div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === 2
                  ? 'bg-[#005581] text-white'
                  : step > 2
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>۲. تایید پیامکی</span>
              {step > 2 && <Check className="w-3.5 h-3.5" />}
            </div>
            <div className="w-4 h-0.5 bg-slate-200"></div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>۳. دریافت دمو</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Registration Form with Captcha */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                نام و نام خانوادگی <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: دکتر علی رضایی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-xs sm:text-sm outline-none transition pr-10"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Mobile & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  شماره همراه (جهت دریافت کد پیامکی) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="09121112233"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-xs sm:text-sm font-mono outline-none transition pr-10"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ایمیل
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-xs sm:text-sm font-mono outline-none transition pr-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Specialty Field */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                تخصص <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={specialty}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSpecialty(val);
                    if (val === 'فاقد تخصص / بدون تخصص') {
                      setClinicNameAndSpecialty('');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-xs sm:text-sm font-bold text-slate-800 outline-none transition bg-white pr-10"
                >
                  <option value="فاقد تخصص / بدون تخصص">فاقد تخصص / بدون تخصص</option>
                  <option value="دندان‌پزشکی عمومی">دندان‌پزشکی عمومی</option>
                  <option value="ارتودنسی">ارتودنسی</option>
                  <option value="جراحی فک و صورت و ایمپلنت">جراحی فک و صورت و ایمپلنت</option>
                  <option value="اندودانتیکس (درمان ریشه)">اندودانتیکس (درمان ریشه)</option>
                  <option value="دندان‌پزشکی کودکان">دندان‌پزشکی کودکان</option>
                  <option value="پریودنتولوژی (جراحی لثه)">پریودنتولوژی (جراحی لثه)</option>
                  <option value="پروتزهای دندانی و زیبایی">پروتزهای دندانی و زیبایی</option>
                  <option value="مدیریت کلینیک / مدیر درمانی">مدیریت کلینیک / مدیر درمانی</option>
                </select>
                <Stethoscope className="w-4 h-4 text-[#005581] absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Clinic Name - ONLY requested if user HAS specialty */}
            {hasSpecialty && (
              <div className="animate-fadeIn">
                <label className="block font-bold text-slate-700 mb-1.5">
                  نام مطب یا کلینیک - تخصص
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: مطب دکتر رضایی - ارتودنسی و زیبایی"
                    value={clinicNameAndSpecialty}
                    onChange={(e) => setClinicNameAndSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-xs sm:text-sm outline-none transition pr-10"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>
            )}

            {/* Anti-Bot Captcha */}
            <div className="p-3.5 bg-[#005581]/5 rounded-2xl border border-[#005581]/20 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#005581] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#005581]" />
                  <span>کد امنیتی ضد ربات (کپچا) <span className="text-rose-500">*</span>:</span>
                </label>
                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="text-[11px] text-[#005581] hover:underline flex items-center gap-1 cursor-pointer"
                  title="کد جدید"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تغییر سوال</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white rounded-xl border border-slate-300 font-mono font-bold text-base text-slate-800 tracking-wider select-none shadow-2xs">
                  {captchaNum1} + {captchaNum2} = ؟
                </div>
                <input
                  type="text"
                  required
                  placeholder="حاصل جمع را وارد فرمایید..."
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-sm font-mono outline-none transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>در حال ارسال پیامک احراز هویت...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#ffd200]" />
                  <span>ارسال کد تایید به شماره همراه</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification via Mobile SMS */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>کد احراز هویت ارسال گردید</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">{otpSentMessage}</p>
            </div>

            {/* Quick Demo Helper Box */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>کد پیامک‌شده: <strong className="font-mono text-sm">{generatedOtp}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(generatedOtp)}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-[11px] transition cursor-pointer"
              >
                درج خودکار کد
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                کد ۵ رقمی ارسال‌شده به شماره همراه:
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="مثال: 83149"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#005581] text-center font-mono text-xl tracking-widest outline-none transition"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              {timerActive ? (
                <span>امکان ارسال مجدد کد پس از: <strong>{timerSeconds} ثانیه</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const code = Math.floor(10000 + Math.random() * 90000).toString();
                    setGeneratedOtp(code);
                    setTimerSeconds(60);
                    setTimerActive(true);
                  }}
                  className="text-[#005581] font-bold hover:underline cursor-pointer"
                >
                  ارسال مجدد کد پیامکی
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:underline cursor-pointer"
              >
                ویرایش اطلاعات و شماره
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>در حال تایید و دانلود دمو...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تایید شماره همراه و دانلود پکیج دمو</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success & Re-download ONLY */}
        {step === 3 && (
          <div className="space-y-6 text-xs text-center py-2">
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-3xl space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-black text-emerald-900 text-lg">
                دموی دنتورا با موفقیت دانلود شد!
              </h4>
              <p className="text-emerald-800 text-xs leading-relaxed max-w-sm mx-auto">
                پکیج رسمی دموی نرم‌افزار دنتورا شامل تصاویر واقعی و نماهای کامل سیستم برای کاربر <strong>{fullName}</strong> با موفقیت تولید و دانلود گردید.
              </p>
            </div>

            {/* Action Buttons: Download Again & Close */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadDemoPackage}
                className="flex-1 py-3.5 rounded-2xl bg-[#005581] hover:bg-[#004266] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#ffd200]" />
                <span>دانلود مجدد فایل دمو</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
