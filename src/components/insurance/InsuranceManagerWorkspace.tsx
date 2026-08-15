import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Building,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Award,
  Zap,
  Users,
  FileCheck2,
  PieChart as PieChartIcon,
  ArrowUpRight,
  FileText,
  Upload,
  Search,
  Filter,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Lock,
  Scale,
  X,
  ChevronRight,
  ChevronDown,
  UserCheck,
  Stethoscope,
  Cpu,
  XCircle,
  AlertCircle,
  Activity,
  History,
  Calendar,
  LayoutGrid,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockProviderScorecards, mockClaims, mockAuditLogs } from '../../data/mockData';
import { Claim, ProviderScorecard, AuditLogItem } from '../../types';

interface InsuranceManagerWorkspaceProps {
  claims?: Claim[];
  onReviewDecision?: (claimId: string, decision: any, notes: string) => void;
}

// Mock Contract Data
interface ClinicContract {
  id: string;
  clinicId: string;
  clinicName: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  annualCeilingAmount: number; // Toman
  usedBudgetPercentage: number;
  tariffTier: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
  status: 'active' | 'expiring_soon' | 'suspended';
}

const mockContracts: ClinicContract[] = [
  {
    id: 'cnt-101',
    clinicId: 'cln-01',
    clinicName: 'کلینیک دندان‌پزشکی دنتورا - شعبه ونک',
    contractNumber: 'CNT-1404-9021',
    startDate: '1404/01/01',
    endDate: '1405/01/01',
    annualCeilingAmount: 5000000000, // 5 Billion Toman
    usedBudgetPercentage: 68,
    tariffTier: 'L4',
    status: 'active',
  },
  {
    id: 'cnt-102',
    clinicId: 'cln-02',
    clinicName: 'درمانگاه تخصصی آریا',
    contractNumber: 'CNT-1404-7712',
    startDate: '1403/10/01',
    endDate: '1404/10/01',
    annualCeilingAmount: 3000000000, // 3 Billion Toman
    usedBudgetPercentage: 88,
    tariffTier: 'L2',
    status: 'expiring_soon',
  },
  {
    id: 'cnt-103',
    clinicId: 'cln-03',
    clinicName: 'مرکز دندان‌پزشکی سلامت مهر',
    contractNumber: 'CNT-1404-3310',
    startDate: '1404/02/15',
    endDate: '1405/02/15',
    annualCeilingAmount: 4000000000, // 4 Billion Toman
    usedBudgetPercentage: 45,
    tariffTier: 'L3',
    status: 'active',
  },
];

// Mock Reviewer Performance Data
interface ReviewerPerformance {
  id: string;
  name: string;
  role: 'ClaimReviewer' | 'MedicalReviewer';
  handledClaimsCount: number;
  avgHandlingMinutes: number;
  rejectionRate: number;
  overrideRate: number;
  accuracyRating: number; // Out of 5
  status: 'online' | 'busy' | 'offline';
}

const mockReviewers: ReviewerPerformance[] = [
  {
    id: 'rev-01',
    name: 'نیلوفر احمدی',
    role: 'ClaimReviewer',
    handledClaimsCount: 412,
    avgHandlingMinutes: 2.1,
    rejectionRate: 8.4,
    overrideRate: 4.2,
    accuracyRating: 4.9,
    status: 'online',
  },
  {
    id: 'rev-02',
    name: 'دکتر کاوه نوری',
    role: 'MedicalReviewer',
    handledClaimsCount: 188,
    avgHandlingMinutes: 12.5,
    rejectionRate: 14.2,
    overrideRate: 7.8,
    accuracyRating: 4.8,
    status: 'online',
  },
  {
    id: 'rev-03',
    name: 'دکتر حمید سجادی',
    role: 'MedicalReviewer',
    handledClaimsCount: 205,
    avgHandlingMinutes: 11.2,
    rejectionRate: 11.8,
    overrideRate: 6.1,
    accuracyRating: 4.9,
    status: 'busy',
  },
  {
    id: 'rev-04',
    name: 'رضا کریمی',
    role: 'ClaimReviewer',
    handledClaimsCount: 350,
    avgHandlingMinutes: 2.8,
    rejectionRate: 6.9,
    overrideRate: 3.5,
    accuracyRating: 4.7,
    status: 'offline',
  },
];

// Mock Override Log Items
interface OverrideLogItem {
  id: string;
  claimNumber: string;
  clinicName: string;
  reviewerName: string;
  reviewerRole: string;
  aiSuggestion: string;
  humanDecision: string;
  overrideReason: string;
  digitalSignatureHash: string;
  timestamp: string;
}

const mockOverrideLogs: OverrideLogItem[] = [
  {
    id: 'OVR-1405-01',
    claimNumber: 'CLM-140505-001',
    clinicName: 'کلینیک دندان‌پزشکی دنتورا - شعبه ونک',
    reviewerName: 'دکتر حمید سجادی',
    reviewerRole: 'پزشک معتمد بیمه',
    aiSuggestion: 'احتمال ۸۲٪ ضایعه رادیولوسنت کانال مزیوباکال (تأیید کسورات)',
    humanDecision: 'تأیید کامل بدون کسورات (رد نظر AI)',
    overrideReason: 'لامینا دورا کاملاً پیوسته بوده و سایه موجود ناشی از هم‌پوشانی استخوان گونه است.',
    digitalSignatureHash: '0x8f2a9d12e84c91038b71a19082ec1923847',
    timestamp: '۱۴۰۴/۰۵/۲۰ - ۱۱:۴۵:۱۰',
  },
  {
    id: 'OVR-1405-02',
    claimNumber: 'CLM-140505-002',
    clinicName: 'درمانگاه تخصصی آریا',
    reviewerName: 'نیلوفر احمدی',
    reviewerRole: 'کارشناس ادعای بیمه',
    aiSuggestion: 'پیش‌پیشنهاد تأیید کامل مبلغ ۴۵,۰۰۰,۰۰۰ ریال',
    humanDecision: 'تأیید جزئی با کسر ۳۱٪ مازاد تعرفه (۱۰,۰۰۰,۰۰۰ ریال)',
    overrideReason: 'تعدیل مبلغ بر اساس آیین‌نامه سقف تعرفه مصوب ۱۴۰۴ بیمه مرکزی.',
    digitalSignatureHash: '0x7b11a90e3f88c1229a44018283eb9111823',
    timestamp: '۱۴۰۴/۰۵/۲۱ - ۰۹:۳۰:۲۲',
  },
];

// Chart Data Constants
const claimsDistributionData = [
  { name: 'تأییدشده کامل', count: 2150, color: '#10b981' },
  { name: 'تأیید جزئی/کسورات', count: 410, color: '#3b82f6' },
  { name: 'ردشده', count: 280, color: '#ef4444' },
  { name: 'در حال بررسی', count: 210, color: '#f59e0b' },
];

const settlementSlaData = [
  { month: 'فروردین', greenLaneHours: 24, standardHours: 72, goalSla: 24 },
  { month: 'اردیبهشت', greenLaneHours: 22, standardHours: 68, goalSla: 24 },
  { month: 'خرداد', greenLaneHours: 20, standardHours: 66, goalSla: 24 },
  { month: 'تیر', greenLaneHours: 19, standardHours: 65, goalSla: 24 },
  { month: 'مرداد', greenLaneHours: 18, standardHours: 64, goalSla: 24 },
];

const financialBudgetData = [
  { month: 'فروردین', claimed: 1100, paid: 850, deduction: 250 },
  { month: 'اردیبهشت', claimed: 1250, paid: 980, deduction: 270 },
  { month: 'خرداد', claimed: 1300, paid: 1020, deduction: 280 },
  { month: 'تیر', claimed: 1400, paid: 1100, deduction: 300 },
  { month: 'مرداد', claimed: 1550, paid: 1200, deduction: 350 },
];

export interface UnifiedClaimAuditStep {
  stepIndex: number;
  timestamp: string;
  stage: 'reception' | 'ai_engine' | 'claim_reviewer' | 'medical_reviewer' | 'manager';
  stageTitle: string;
  userName: string;
  userRole: string;
  actionTitle: string;
  details: string;
  wormVerifiedHash: string;
  ruleVersion?: string;
  aiModelVersion?: string;
}

export interface UnifiedClaimAuditTrail {
  claimNumber: string;
  clinicName: string;
  clinicTrustLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
  patientName: string;
  patientNationalId: string;
  dentistName: string;
  serviceDate: string;
  serviceSummary: string;
  totalClaimedAmount: number;
  totalApprovedAmount: number;
  status: 'approved' | 'partially_approved' | 'rejected' | 'pending';
  reviewRoute: 'express' | 'standard' | 'deep_review';
  steps: UnifiedClaimAuditStep[];
}

const mockUnifiedClaimAuditTrails: UnifiedClaimAuditTrail[] = [
  {
    claimNumber: 'CLM-140505-001',
    clinicName: 'کلینیک دندان‌پزشکی دنتورا - شعبه ونک',
    clinicTrustLevel: 'L3',
    patientName: 'علی محمدی',
    patientNationalId: '0012345678',
    dentistName: 'دکتر فرهاد رضایی',
    serviceDate: '1405/05/11',
    serviceSummary: 'عصب‌کشی ۳ کاناله دندان ۱۶ + روکش PFM',
    totalClaimedAmount: 30000000,
    totalApprovedAmount: 27000000,
    status: 'approved',
    reviewRoute: 'express',
    steps: [
      {
        stepIndex: 1,
        timestamp: '1405/05/11 - 11:30:00',
        stage: 'reception',
        stageTitle: 'پذیرش کلینیک',
        userName: 'سارا امینی',
        userRole: 'منشی پذیرش',
        actionTitle: 'ثبت ادعا و بارگذاری مدارک اولیه',
        details: 'ثبت ادعای درمان عصب‌کشی ۳ کاناله و روکش PFM دندان ۱۶، بارگذاری گرافی پری‌اپیکال RVG و ثبت شماره بچ مواد (GUTTA-LOT-2026-991A).',
        wormVerifiedHash: '0x8f2a9d12e84c91038b71a19082ec1923847',
      },
      {
        stepIndex: 2,
        timestamp: '1405/05/11 - 11:31:15',
        stage: 'ai_engine',
        stageTitle: 'هوش مصنوعی & موتور قواعد',
        userName: 'Dentura Copilot AI',
        userRole: 'سیستم پایش خودکار',
        actionTitle: 'پایش تصویر، انطباق تعرفه و احراز مسیر سریع',
        details: 'کیفیت تصویر گرافی ۹۶٪ تایید شد. تعرفه پایه مصوب v2.1-2026 انطباق ۱۰۰٪ دارد. احراز کامل ۵ ماژول الزامی مسیر سریع (Express).',
        wormVerifiedHash: '0x8f2a9d12e84c91038b71a19082ec1923848',
        ruleVersion: 'v2.1-2026',
        aiModelVersion: 'Dentura-AI-v3.4',
      },
      {
        stepIndex: 3,
        timestamp: '1405/05/11 - 11:35:02',
        stage: 'claim_reviewer',
        stageTitle: 'بازبین ادعا',
        userName: 'مریم عباسی',
        userRole: 'کارشناس ارشد ارزیابی ادعا',
        actionTitle: 'تأیید مالی و عدم وجود کسر تعرفه',
        details: 'بررسی اسناد مالی، احراز عدم وجود مغایرت تعرفه‌ای و تایید سقف پوشش بیمه تکمیلی ایران به مبلغ ۲۷,۰۰۰,۰۰۰ ریال.',
        wormVerifiedHash: '0x8f2a9d12e84c91038b71a19082ec1923849',
        ruleVersion: 'v2.1-2026',
      },
      {
        stepIndex: 4,
        timestamp: '1405/05/11 - 11:42:10',
        stage: 'medical_reviewer',
        stageTitle: 'پزشک معتمد',
        userName: 'دکتر حمید سجادی',
        userRole: 'پزشک معتمد و آسیب‌شناس فک و دهان (کد ۴۸۹۲۱-ن)',
        actionTitle: 'ارزیابی رادیولوژی و امضای دیجیتال',
        details: 'پرشدگی کامل گوتاپرکا در هر ۳ کانال (MB, DB, P) تا آپکس در تصویر RVG احراز گردید. صدور امضای دیجیتال غیرقابل تغییر جهت تسویه.',
        wormVerifiedHash: '0x8f2a9d12e84c91038b71a19082ec1923850',
        aiModelVersion: 'Dental-Vision-v3.4.2',
      },
    ],
  },
  {
    claimNumber: 'CLM-140505-002',
    clinicName: 'کلینیک دندان‌پزشکی دنتورا - شعبه ونک',
    clinicTrustLevel: 'L2',
    patientName: 'سارا حسینی',
    patientNationalId: '0076543210',
    dentistName: 'دکتر کامران شریفی',
    serviceDate: '1405/05/12',
    serviceSummary: 'کاشت فیکسچر ایمپلنت دندان ۳۶ (مرحله ۱)',
    totalClaimedAmount: 42000000,
    totalApprovedAmount: 32000000,
    status: 'partially_approved',
    reviewRoute: 'standard',
    steps: [
      {
        stepIndex: 1,
        timestamp: '1405/05/12 - 14:15:00',
        stage: 'reception',
        stageTitle: 'پذیرش کلینیک',
        userName: 'زهرا حسینی',
        userRole: 'منشی پذیرش',
        actionTitle: 'ثبت ادعا و آپلود مقطع CBCT',
        details: 'ثبت ادعای کاشت ایمپلنت دندان ۳۶ به مبلغ ۴۲,۰۰۰,۰۰۰ ریال همراه با فایل مقطعی سی‌بی‌سی‌تی فک پایین.',
        wormVerifiedHash: '0x7b11a90e3f88c1229a44018283eb9111821',
      },
      {
        stepIndex: 2,
        timestamp: '1405/05/12 - 14:16:30',
        stage: 'ai_engine',
        stageTitle: 'هوش مصنوعی & موتور قواعد',
        userName: 'Dentura Copilot AI',
        userRole: 'سیستم پایش خودکار',
        actionTitle: 'هشدار مغایرت مالی (تخطی از سقف تعرفه)',
        details: 'مبلغ ادعاشده ۳۱٪ بالاتر از نرخ مصوب پایه است (تخطی از حداکثر تلورانس ۳۰٪). تخصیص ریسک score=62 و ارجاع به صف Standard.',
        wormVerifiedHash: '0x7b11a90e3f88c1229a44018283eb9111822',
        ruleVersion: 'v2.1-2026',
        aiModelVersion: 'Dentura-AI-v3.4',
      },
      {
        stepIndex: 3,
        timestamp: '1405/05/12 - 15:10:44',
        stage: 'claim_reviewer',
        stageTitle: 'بازبین ادعا',
        userName: 'نیلوفر احمدی',
        userRole: 'کارشناس ارشد ارزیابی ادعا',
        actionTitle: 'اعمال کسورات ۳۱٪ مازاد تعرفه',
        details: 'اعمال کسر ۱۰,۰۰۰,۰۰۰ ریال بابت مازاد تعرفه مصوب قرارداد بیمه دانا. تایید مبلغ خالص ۳۲,۰۰۰,۰۰۰ ریال.',
        wormVerifiedHash: '0x7b11a90e3f88c1229a44018283eb9111823',
        ruleVersion: 'v2.1-2026',
      },
      {
        stepIndex: 4,
        timestamp: '1405/05/12 - 15:45:10',
        stage: 'medical_reviewer',
        stageTitle: 'پزشک معتمد',
        userName: 'دکتر کاوه نوری',
        userRole: 'پزشک معتمد جراحی فک و دهان (کد ۳۳۴۱2-ن)',
        actionTitle: 'ارزیابی تراکم استخوان CBCT و امضای دیجیتال',
        details: 'تراکم و ارتفاع استخوان فک پایین در سی‌بی‌سی‌تی برای جای‌گذاری فیکسچر ۴.۵mm احراز گردید. صدور امضای دیجیتال WORM.',
        wormVerifiedHash: '0x7b11a90e3f88c1229a44018283eb9111824',
        aiModelVersion: 'Dental-Vision-v3.4.2',
      },
      {
        stepIndex: 5,
        timestamp: '1405/05/13 - 09:15:00',
        stage: 'manager',
        stageTitle: 'مدیریت بیمه & اعتراضات',
        userName: 'مدیر ارشد بیمه',
        userRole: 'مدیر نظارت و دادرس بیمه',
        actionTitle: 'بررسی اعتراض کلینیک و ابقای رای کسورات',
        details: 'ثبت اعتراض کلینیک به کسر ۱۰ میلیون ریال بابت برند Premium. به علت عدم اخذ مجوز پیش‌درمان خاص، رای کسورات ابقا گردید.',
        wormVerifiedHash: '0x7b11a90e3f88c1229a44018283eb9111825',
      },
    ],
  },
  {
    claimNumber: 'CLM-140505-003',
    clinicName: 'کلینیک دندان‌پزشکی کسری - شعبه نیاوران',
    clinicTrustLevel: 'L1',
    patientName: 'آراد رضایی (کودک)',
    patientNationalId: '0055112233',
    dentistName: 'دکتر رضا شمس',
    serviceDate: '1405/05/13',
    serviceSummary: 'ترمیم کامپوزیت خلفی دندان ۵۵ شیری',
    totalClaimedAmount: 18000000,
    totalApprovedAmount: 0,
    status: 'rejected',
    reviewRoute: 'deep_review',
    steps: [
      {
        stepIndex: 1,
        timestamp: '1405/05/13 - 08:30:00',
        stage: 'reception',
        stageTitle: 'پذیرش کلینیک',
        userName: 'علی احمدی',
        userRole: 'منشی پذیرش',
        actionTitle: 'ثبت پرونده و رضایت‌نامه سرپرست',
        details: 'ثبت ادعای ترمیم کامپوزیت دندان ۵۵ همراه با فرم رضایت‌نامه سرپرست قانونی (رضا رضایی).',
        wormVerifiedHash: '0x3c99a80b1277f981022e331190458821930',
      },
      {
        stepIndex: 2,
        timestamp: '1405/05/13 - 08:32:00',
        stage: 'ai_engine',
        stageTitle: 'هوش مصنوعی & موتور قواعد',
        userName: 'Dentura Copilot AI',
        userRole: 'سیستم پایش خودکار',
        actionTitle: 'هشدار عدم ارائه کلیشه رادیوگرافی',
        details: 'تصویر رادیوگرافی پری‌اپیکال قبل از کار یافت نشد. تخصیص ریسک high (score=78) و ارجاع اجباری به صف بررسی عمیق (Deep Review).',
        wormVerifiedHash: '0x3c99a80b1277f981022e331190458821931',
        ruleVersion: 'v2.1-2026',
        aiModelVersion: 'Dentura-AI-v3.4',
      },
      {
        stepIndex: 3,
        timestamp: '1405/05/13 - 09:50:00',
        stage: 'claim_reviewer',
        stageTitle: 'بازبین ادعا',
        userName: 'سمیه محمدی',
        userRole: 'کارشناس ارشد ارزیابی ادعا',
        actionTitle: 'عدم احراز اسناد و ارجاع به پزشک معتمد',
        details: 'عدم ارائه مدارک تصویری اولیه. ارجاع مستقیم پرونده به هیئت پزشکی جهت اخذ تصمیم نهایی رد یا قبول استثنایی.',
        wormVerifiedHash: '0x3c99a80b1277f981022e331190458821932',
        ruleVersion: 'v2.1-2026',
      },
      {
        stepIndex: 4,
        timestamp: '1405/05/13 - 10:20:12',
        stage: 'medical_reviewer',
        stageTitle: 'پزشک معتمد',
        userName: 'دکتر کاوه نوری',
        userRole: 'پزشک معتمد (کد ۳۳۴۱2-ن)',
        actionTitle: 'رد قطعی ادعا به دلیل فقدان گرافی و امضای WORM',
        details: 'ثبت رای قطعی رد ادعا به دلیل عدم ارائه کلیشه رادیوگرافی قبل از درمان طبق ماده ۴ آیین‌نامه ارزیابی با امضای دیجیتال غیرقابل تغییر.',
        wormVerifiedHash: '0x3c99a80b1277f981022e331190458821933',
        aiModelVersion: 'Dental-Vision-v3.4.2',
      },
    ],
  },
  {
    claimNumber: 'CLM-140505-004',
    clinicName: 'کلینیک دندان‌پزشکی آتیه - شعبه سعادت‌آباد',
    clinicTrustLevel: 'L4',
    patientName: 'مهدی کاظمی',
    patientNationalId: '0041239876',
    dentistName: 'دکتر سارا نوری',
    serviceDate: '1405/05/14',
    serviceSummary: 'جرم‌گیری و بروساژ دو فک + فلورایدتراپی',
    totalClaimedAmount: 12000000,
    totalApprovedAmount: 12000000,
    status: 'approved',
    reviewRoute: 'express',
    steps: [
      {
        stepIndex: 1,
        timestamp: '1405/05/14 - 10:00:00',
        stage: 'reception',
        stageTitle: 'پذیرش کلینیک',
        userName: 'مریم صادقی',
        userRole: 'منشی پذیرش',
        actionTitle: 'ثبت پرونده پیشگیری دندان‌پزشکی',
        details: 'ثبت ادعای جرم‌گیری و فلورایدتراپی دو فک بیمار با فرم دیجیتال و استعلام حق بیمه.',
        wormVerifiedHash: '0x4d88e21a0091823901a1828391012930',
      },
      {
        stepIndex: 2,
        timestamp: '1405/05/14 - 10:00:45',
        stage: 'ai_engine',
        stageTitle: 'هوش مصنوعی & موتور قواعد',
        userName: 'Dentura Copilot AI',
        userRole: 'سیستم پایش خودکار',
        actionTitle: 'احراز کامل تسویه سریع L4 Green Lane',
        details: 'انطباق ۱۰۰٪، عدم وجود سابقه همپوشانی ۶ ماهه و احراز کامل ۵ ماژول الزامی مرکز آتیه.',
        wormVerifiedHash: '0x4d88e21a0091823901a1828391012931',
        ruleVersion: 'v2.1-2026',
        aiModelVersion: 'Dentura-AI-v3.4',
      },
      {
        stepIndex: 3,
        timestamp: '1405/05/14 - 10:01:30',
        stage: 'claim_reviewer',
        stageTitle: 'بازبین ادعا',
        userName: 'سامانه خودکار Green Lane',
        userRole: 'کارشناس ادعا (خودکار)',
        actionTitle: 'تایید خودکار مالی بدون کسورات',
        details: 'تایید فوری مبلغ ۱۲,۰۰۰,۰۰۰ ریال بر اساس اعتبار L4 مرکز.',
        wormVerifiedHash: '0x4d88e21a0091823901a1828391012932',
        ruleVersion: 'v2.1-2026',
      },
      {
        stepIndex: 4,
        timestamp: '1405/05/14 - 10:02:00',
        stage: 'medical_reviewer',
        stageTitle: 'پزشک معتمد',
        userName: 'سامانه خودکار (نظارت دکتر حمید سجادی)',
        userRole: 'پزشک معتمد (خودکار)',
        actionTitle: 'صدور دستور پرداخت واریز مستقیم زیر ۲۴ ساعت',
        details: 'صدور تاییدیه نهایی پزشکی و ارسال دستور تسویه مستقیم بانک بیمه.',
        wormVerifiedHash: '0x4d88e21a0091823901a1828391012933',
        aiModelVersion: 'Dental-Vision-v3.4.2',
      },
    ],
  },
  {
    claimNumber: 'CLM-140505-005',
    clinicName: 'کلینیک دندان‌پزشکی دنتورا - شعبه ونک',
    clinicTrustLevel: 'L3',
    patientName: 'نگین ابراهیمی',
    patientNationalId: '0088223344',
    dentistName: 'دکتر فرزاد شریفی',
    serviceDate: '1405/05/15',
    serviceSummary: 'جراحی دندان عقل نهفته (۳۸) فک پایین',
    totalClaimedAmount: 25000000,
    totalApprovedAmount: 0,
    status: 'pending',
    reviewRoute: 'standard',
    steps: [
      {
        stepIndex: 1,
        timestamp: '1405/05/15 - 09:10:00',
        stage: 'reception',
        stageTitle: 'پذیرش کلینیک',
        userName: 'سارا امینی',
        userRole: 'منشی پذیرش',
        actionTitle: 'ثبت پرونده و ارسال گرافی پانورامیک',
        details: 'ثبت ادعای جراحی دندان عقل نهفته ۳۸ و بارگذاری گرافی کامل OPG.',
        wormVerifiedHash: '0x9e12f00a118823910291029301928301',
      },
      {
        stepIndex: 2,
        timestamp: '1405/05/15 - 09:11:30',
        stage: 'ai_engine',
        stageTitle: 'هوش مصنوعی & موتور قواعد',
        userName: 'Dentura Copilot AI',
        userRole: 'سیستم پایش خودکار',
        actionTitle: 'تشخیص مجاورت عصب فکی و ارجاع به صف Standard',
        details: 'تشخیص مجاورت ریشه دندان ۳۸ با کانال عصب فکی پایین. تخصیص ریسک score=48/100.',
        wormVerifiedHash: '0x9e12f00a118823910291029301928302',
        ruleVersion: 'v2.1-2026',
        aiModelVersion: 'Dentura-AI-v3.4',
      },
      {
        stepIndex: 3,
        timestamp: '1405/05/15 - 10:30:00',
        stage: 'claim_reviewer',
        stageTitle: 'بازبین ادعا',
        userName: 'نیلوفر احمدی',
        userRole: 'کارشناس ارشد ارزیابی ادعا',
        actionTitle: 'تایید اولیه مالی و ارجاع به ارزیابی بالینی',
        details: 'بررسی مدارک مالی اولیه و ارجاع پرونده به پزشک معتمد جهت تایید ضرورت جراحی.',
        wormVerifiedHash: '0x9e12f00a118823910291029301928303',
        ruleVersion: 'v2.1-2026',
      },
      {
        stepIndex: 4,
        timestamp: '1405/05/15 - 11:00:00',
        stage: 'medical_reviewer',
        stageTitle: 'پزشک معتمد',
        userName: 'دکتر حمید سجادی',
        userRole: 'پزشک معتمد (کد ۴۸۹۲۱-ن)',
        actionTitle: 'در حال ارزیابی بالینی رادیولوژی',
        details: 'پرونده در صف بررسی پزشکی و ارزیابی موقعیت ریشه نسبت به کانال مندیبولار قرار دارد.',
        wormVerifiedHash: '0x9e12f00a118823910291029301928304',
        aiModelVersion: 'Dental-Vision-v3.4.2',
      },
    ],
  },
];

export const InsuranceManagerWorkspace: React.FC<InsuranceManagerWorkspaceProps> = ({
  claims: propClaims,
  onReviewDecision,
}) => {
  const [activeTab, setActiveTab] = useState<
    'executive_dashboard' | 'queue_performance' | 'provider_scorecards' | 'audit_ledger'
  >('executive_dashboard');

  // Modals state
  const [showUploadContractModal, setShowUploadContractModal] = useState(false);
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<Claim | null>(null);
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<AuditLogItem | null>(null);

  // Scorecard modal for clinic
  const [selectedScorecardClinic, setSelectedScorecardClinic] = useState<{
    contract: ClinicContract;
    scorecard: ProviderScorecard;
  } | null>(null);

  // Trust level details modal
  const [selectedTrustLevelModal, setSelectedTrustLevelModal] = useState<
    'L0' | 'L1' | 'L2' | 'L3' | 'L4' | null
  >(null);

  // Upload contract state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [parsedContractPreview, setParsedContractPreview] = useState<{
    clinicName: string;
    ceiling: string;
    startDate: string;
    endDate: string;
    tier: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
  } | null>(null);
  const [isParsingContract, setIsParsingContract] = useState(false);
  const [contractUploadSuccess, setContractUploadSuccess] = useState(false);

  // Unified Audit Ledger State
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('all');
  const [auditRouteFilter, setAuditRouteFilter] = useState<string>('all');
  const [expandedClaimIds, setExpandedClaimIds] = useState<{ [key: string]: boolean }>({
    'CLM-140505-001': true,
  });
  const [selectedAuditStepDetail, setSelectedAuditStepDetail] = useState<{
    claimNumber: string;
    stepIndex: number;
    stageTitle: string;
    userName: string;
    userRole: string;
    timestamp: string;
    actionTitle: string;
    details: string;
    wormHash: string;
    ruleVersion?: string;
    aiModelVersion?: string;
  } | null>(null);

  // Handle contract file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setIsParsingContract(true);
      // Simulate AI parsing of contract PDF/DOCX
      setTimeout(() => {
        setParsedContractPreview({
          clinicName: 'کلینیک دندان‌پزشکی کسری - شعبه نیاوران',
          ceiling: '۶,۵۰۰,۰۰۰,۰۰۰ تومان (سالانه)',
          startDate: '۱۴۰۴/۰۶/۰۱',
          endDate: '۱۴۰۵/۰۶/۰۱',
          tier: 'L3',
        });
        setIsParsingContract(false);
      }, 1200);
    }
  };

  const handleSaveContract = () => {
    setContractUploadSuccess(true);
    setTimeout(() => {
      setContractUploadSuccess(false);
      setShowUploadContractModal(false);
      setUploadFile(null);
      setParsedContractPreview(null);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#fffffa] min-h-screen text-[#005581] font-sans" dir="rtl">
      {/* Top Banner / Header */}
      <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#005581] text-white rounded-xl shadow">
            <TrendingUp className="w-6 h-6 text-[#ffd200]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#005581]">میزکار مدیر ارشد بیمه (Insurance Manager Workspace)</h1>
            <p className="text-xs text-[#005581]/80 mt-0.5 font-medium">
              سامانه یک‌پارچه نظارت بر بودجه، پایش عملکرد بازبینان، مدیریت قراردادهای کلینیک‌ها و دفترچه حسابرسی قانونی
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout with Navigation Menu on the Right Side */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* RIGHT NAVIGATION MENU PANEL */}
        <div className="w-full lg:w-72 shrink-0 space-y-3">
          <div className="bg-[#fffffa] p-4 rounded-2xl border-2 border-[#005581] shadow-sm sticky top-6 space-y-2.5">
            <div className="text-xs font-black text-[#005581] pb-2 border-b-2 border-[#72cdf4] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-[#005581]" />
                <span>منوی مدیریت بیمه</span>
              </span>
              <span className="text-[10px] bg-[#005581] text-white px-2 py-0.5 rounded-full font-mono">۴ بخش</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('executive_dashboard')}
              className={`w-full text-right px-3.5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2.5 shadow-sm cursor-pointer ${
                activeTab === 'executive_dashboard'
                  ? 'bg-[#005581] text-white border-2 border-[#ffd200]'
                  : 'bg-white hover:bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4]'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5 text-[#ffd200] shrink-0" />
              <span className="leading-snug">۱. داشبورد کلان & KPIها</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('queue_performance')}
              className={`w-full text-right px-3.5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2.5 shadow-sm cursor-pointer ${
                activeTab === 'queue_performance'
                  ? 'bg-[#005581] text-white border-2 border-[#ffd200]'
                  : 'bg-white hover:bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4]'
              }`}
            >
              <Clock className="w-4.5 h-4.5 text-[#ffd200] shrink-0" />
              <span className="leading-snug">۲. پایش صف‌ها & عملکرد بازبینان</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('provider_scorecards')}
              className={`w-full text-right px-3.5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2.5 shadow-sm cursor-pointer ${
                activeTab === 'provider_scorecards'
                  ? 'bg-[#005581] text-white border-2 border-[#ffd200]'
                  : 'bg-white hover:bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4]'
              }`}
            >
              <Award className="w-4.5 h-4.5 text-[#ffd200] shrink-0" />
              <span className="leading-snug">۳. مدیریت قراردادها & کلینیک‌ها</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit_ledger')}
              className={`w-full text-right px-3.5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2.5 shadow-sm cursor-pointer ${
                activeTab === 'audit_ledger'
                  ? 'bg-[#005581] text-white border-2 border-[#ffd200]'
                  : 'bg-white hover:bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4]'
              }`}
            >
              <History className="w-4.5 h-4.5 text-[#ffd200] shrink-0" />
              <span className="leading-snug">۴. دفترچه حسابرسی کلان</span>
            </button>
          </div>
        </div>

        {/* MAIN TAB CONTENT AREA */}
        <div className="flex-1 min-w-0">

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE DASHBOARD & KPIS */}
      {/* ========================================================================= */}
      {activeTab === 'executive_dashboard' && (
        <div className="space-y-6">
          {/* Executive KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#fffffa] p-5 rounded-2xl border border-[#72cdf4] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#005581]/80">کل ادعاهای پردازش‌شده</span>
                <FileCheck2 className="w-5 h-5 text-[#005581]" />
              </div>
              <div className="text-2xl font-extrabold text-[#005581]">۳,۰۵۰ مورد</div>
              <div className="text-[11px] text-[#005581] font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">+۱۲٪ افزایش نسبت به دوره قبل</span>
              </div>
            </div>

            <div className="bg-[#fffffa] p-5 rounded-2xl border border-[#72cdf4] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#005581]/80">مجموع مبالغ تأییدشده</span>
                <DollarSign className="w-5 h-5 text-[#005581]" />
              </div>
              <div className="text-2xl font-extrabold text-[#005581]">۴.۲ میلیارد تومان</div>
              <div className="text-[11px] text-[#005581]/70 font-medium">سهم پرداختی سازمان بیمه</div>
            </div>

            <div className="bg-[#fffffa] p-5 rounded-2xl border border-[#72cdf4] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#005581]/80">صرفه‌جویی با کشف کسورات</span>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-[#005581]">۶۸۰ میلیون تومان</div>
              <div className="text-[11px] text-[#005581]/70 font-medium">کسورات انحراف تعرفه و مدرک</div>
            </div>

            <div className="bg-[#fffffa] p-5 rounded-2xl border border-[#72cdf4] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#005581]/80">پوشش برنامه تسویه سریع</span>
                <Zap className="w-5 h-5 text-[#ffd200]" />
              </div>
              <div className="text-2xl font-extrabold text-[#005581]">۶۸٪ کلینیک‌ها</div>
              <div className="text-[11px] text-[#005581]/70 font-medium">واجد تسویه سریع L4</div>
            </div>
          </div>

          {/* Recharts Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Claim Volume Breakdown */}
            <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#72cdf4] pb-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#005581]" />
                  <h3 className="text-sm font-black text-[#005581]">نمای کلی جریان و وضعیت ادعاها</h3>
                </div>
                <span className="text-[11px] text-[#005581]/70 font-bold">مجموع: ۳,۰۵۰ پرونده</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={claimsDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {claimsDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} مورد`, 'تعداد']}
                      contentStyle={{ backgroundColor: '#005581', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Settlement SLA Trend */}
            <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#72cdf4] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#005581]" />
                  <h3 className="text-sm font-black text-[#005581]">پایش روند زمان تسویه (ساعت) - تسویه سریع در برابر مسیر عادی</h3>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded">
                  SLA هدف: زیر ۲۴ ساعت
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={settlementSlaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#005581' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#005581' }} unit=" س" />
                    <Tooltip contentStyle={{ backgroundColor: '#005581', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="greenLaneHours" name="مسیر تسویه سریع" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="standardHours" name="تسویه مسیر عادی" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3: Financial & Budget Allocation */}
          <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">مدیریت مالی و بودجه - حجم مبالغ ادعا، پرداختی و کسورات (میلیون تومان)</h3>
              </div>
              <span className="text-[11px] text-[#005581] font-bold bg-[#ffd200]/30 px-2.5 py-1 rounded-lg">
                بودجه مصوب: ۷.۵ میلیارد تومان
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#005581' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#005581' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#005581', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Bar dataKey="claimed" name="مبلغ ادعاشده (کلینیک)" fill="#005581" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" name="مبلغ پرداختی بیمه" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deduction" name="کسورات اعمال‌شده" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUEUE & REVIEWER PERFORMANCE */}
      {/* ========================================================================= */}
      {activeTab === 'queue_performance' && (
        <div className="space-y-6">
          {/* 3 Evaluation Routes Monitoring */}
          <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#005581]" />
                <h2 className="text-sm font-black text-[#005581]">رصد سه مسیر ارزیابی مبتنی بر امتیاز ریسک (Review Queues)</h2>
              </div>
              <span className="text-xs text-[#005581]/80 font-bold">سامانه تخصیص هوشمند ارزیابی ریسک</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Express Queue */}
              <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-2xl space-y-2 text-emerald-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black bg-emerald-200 px-2.5 py-1 rounded-md text-emerald-900">مسیر سریع (Express)</span>
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-900">۴۵٪ کل ادعاها</div>
                <p className="text-[11px] font-medium leading-relaxed">
                  امتیاز ریسک زیر ۱۵٪. پردازش خودکار با قواعد سیستم و تسویه مستقیم سریع.
                </p>
                <div className="pt-2 text-[10px] font-bold border-t border-emerald-200 flex justify-between">
                  <span>میانگین زمان ارزیابی:</span>
                  <span>۴۵ ثانیه</span>
                </div>
              </div>

              {/* Standard Queue */}
              <div className="bg-sky-50 border-2 border-sky-400 p-5 rounded-2xl space-y-2 text-sky-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black bg-sky-200 px-2.5 py-1 rounded-md text-sky-900">مسیر استاندارد (Standard)</span>
                  <FileText className="w-5 h-5 text-sky-600" />
                </div>
                <div className="text-2xl font-black text-sky-900">۴۰٪ کل ادعاها</div>
                <p className="text-[11px] font-medium leading-relaxed">
                  امتیاز ریسک بین ۱۵٪ تا ۶۰٪. ارزیابی مالی و انطباق مدارک توسط کارشناس ادعا.
                </p>
                <div className="pt-2 text-[10px] font-bold border-t border-sky-200 flex justify-between">
                  <span>میانگین زمان ارزیابی:</span>
                  <span>۴.۵ دقیقه</span>
                </div>
              </div>

              {/* Deep Review Queue */}
              <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-2xl space-y-2 text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black bg-amber-200 px-2.5 py-1 rounded-md text-amber-900">بررسی عمیق (Deep Review)</span>
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-900">۱۵٪ کل ادعاها</div>
                <p className="text-[11px] font-medium leading-relaxed">
                  امتیاز ریسک بالای ۶۰٪ یا مغایرت تصویر/سوابق. ارجاع مستقیم به پزشک معتمد بیمه.
                </p>
                <div className="pt-2 text-[10px] font-bold border-t border-amber-200 flex justify-between">
                  <span>میانگین زمان ارزیابی:</span>
                  <span>۱۵ دقیقه</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviewers Performance Table */}
          <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">عملکرد کارشناسان و بازبینان ادعا / پزشکان معتمد</h3>
              </div>
              <span className="text-xs text-[#005581] font-bold bg-[#72cdf4]/20 px-3 py-1 rounded-lg">
                ۴ کارشناس فعال
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#72cdf4]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#005581] text-white font-semibold">
                  <tr>
                    <th className="p-3">نام کارشناس / پزشک</th>
                    <th className="p-3">نقش سیستمی</th>
                    <th className="p-3">تعداد ادعای ارزیابی‌شده</th>
                    <th className="p-3">زمان متوسط هر پرونده</th>
                    <th className="p-3">نرخ اعمال کسورات/رد</th>
                    <th className="p-3">نرخ Override هوش مصنوعی</th>
                    <th className="p-3">امتیاز انطباق فنی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#72cdf4]/40 text-[#005581] bg-white font-bold">
                  {mockReviewers.map((rev) => (
                    <tr key={rev.id} className="hover:bg-[#72cdf4]/10">
                      <td className="p-3 font-extrabold text-[#005581]">{rev.name}</td>
                      <td className="p-3">
                        <span className="bg-[#72cdf4]/20 text-[#005581] px-2.5 py-1 rounded-md text-[11px] font-bold">
                          {rev.role === 'ClaimReviewer' ? 'کارشناس ادعا' : 'پزشک معتمد (Medical Reviewer)'}
                        </span>
                      </td>
                      <td className="p-3">{rev.handledClaimsCount} پرونده</td>
                      <td className="p-3">{rev.avgHandlingMinutes} دقیقه</td>
                      <td className="p-3 text-rose-700">{rev.rejectionRate}٪</td>
                      <td className="p-3 text-amber-700">{rev.overrideRate}٪</td>
                      <td className="p-3 text-emerald-700">⭐ {rev.accuracyRating} / ۵</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Override Monitoring & Logs Table */}
          <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">پایش موارد Override (نقض نظر هوش مصنوعی توسط کارشناسان)</h3>
              </div>
              <span className="text-xs text-[#005581] font-bold bg-[#ffd200]/30 px-3 py-1 rounded-lg">
                ثبت حقوقی با امضای دیجیتال غیرقابل تغییر
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#72cdf4]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#005581] text-white font-semibold">
                  <tr>
                    <th className="p-3">شماره ادعا & کلینیک</th>
                    <th className="p-3">نام بازبین / نقش</th>
                    <th className="p-3">پیشنهاد اولیه AI</th>
                    <th className="p-3">رای نهایی (Override)</th>
                    <th className="p-3">علت و مستندات کارشناسی</th>
                    <th className="p-3">کد امضای غیرقابل تغییر</th>
                    <th className="p-3">زمان ثبت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#72cdf4]/40 text-[#005581] bg-white font-bold">
                  {mockOverrideLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#72cdf4]/10">
                      <td className="p-3">
                        <div className="font-extrabold text-[#005581]">{log.claimNumber}</div>
                        <div className="text-[10px] text-[#005581]/70">{log.clinicName}</div>
                      </td>
                      <td className="p-3">
                        <div>{log.reviewerName}</div>
                        <div className="text-[10px] opacity-75">{log.reviewerRole}</div>
                      </td>
                      <td className="p-3 text-amber-800 bg-amber-50/50 p-2 rounded-lg">{log.aiSuggestion}</td>
                      <td className="p-3 text-emerald-900 bg-emerald-50/50 p-2 rounded-lg">{log.humanDecision}</td>
                      <td className="p-3 max-w-xs text-[11px] leading-relaxed">{log.overrideReason}</td>
                      <td className="p-3 font-mono text-[9px] text-[#005581] bg-slate-100 p-1.5 rounded">{log.digitalSignatureHash}</td>
                      <td className="p-3 text-[10px]">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROVIDER SCORECARDS & L0-L4 RATING */}
      {/* ========================================================================= */}
      {activeTab === 'provider_scorecards' && (
        <div className="space-y-6">
          {/* Section 1: Contract Management & Upload */}
          <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#72cdf4] pb-3">
              <div>
                <h2 className="text-base font-black text-[#005581] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#005581]" />
                  <span>مدیریت و آپلود قراردادهای کلینیک‌های دندان‌پزشکی</span>
                </h2>
                <p className="text-xs text-[#005581]/80 mt-1 font-medium">
                  ثبت قراردادهای مراکز طرف قرارداد جهت به‌روزرسانی هوشمند سقف تعهدات سالانه، تعرفه‌ها و سطح اعتباری تسویه سریع.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUploadContractModal(true)}
                className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 border border-[#ffd200] cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#ffd200]" />
                <span>آپلود قرارداد جدید کلینیک</span>
              </button>
            </div>

            {/* Existing Clinic Contracts Table */}
            <div className="overflow-x-auto rounded-xl border border-[#72cdf4]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#005581] text-white font-semibold">
                  <tr>
                    <th className="p-3">شماره قرارداد</th>
                    <th className="p-3">نام کلینیک / مرکز</th>
                    <th className="p-3">تاریخ شروع - پایان</th>
                    <th className="p-3">سقف تعهدات سالانه (تومان)</th>
                    <th className="p-3">بودجه مصرف‌شده</th>
                    <th className="p-3">سطح تعرفه‌ای (Tier)</th>
                    <th className="p-3">وضعیت قرارداد</th>
                    <th className="p-3 text-center">کارت‌امتیاز / کارنامه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#72cdf4]/40 text-[#005581] bg-white font-bold">
                  {mockContracts.map((cnt) => {
                    const sc = mockProviderScorecards.find((s) => s.clinicName === cnt.clinicName) || {
                      clinicId: cnt.clinicId,
                      clinicName: cnt.clinicName,
                      tier: cnt.tariffTier,
                      cleanClaimRate: 89.5,
                      rejectionRate: 4.2,
                      avgSettlementHours: 18,
                      materialMatchScore: 96,
                      isGreenLaneApproved: cnt.tariffTier === 'L4',
                      totalClaimsCount: 450,
                    };
                    return (
                      <tr key={cnt.id} className="hover:bg-[#72cdf4]/10">
                        <td className="p-3 font-mono font-extrabold text-[#005581]">{cnt.contractNumber}</td>
                        <td className="p-3">{cnt.clinicName}</td>
                        <td className="p-3 text-[11px]">{cnt.startDate} تا {cnt.endDate}</td>
                        <td className="p-3 font-extrabold text-[#005581]">{cnt.annualCeilingAmount.toLocaleString('fa-IR')} تومان</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cnt.usedBudgetPercentage > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${cnt.usedBudgetPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-bold">{cnt.usedBudgetPercentage}٪</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-[#ffe552] text-[#005581] border border-[#ffd200] px-2.5 py-0.5 rounded font-black text-[11px]">
                            سطح {cnt.tariffTier}
                          </span>
                        </td>
                        <td className="p-3">
                          {cnt.status === 'active' ? (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-md text-[11px]">
                              فعال
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md text-[11px]">
                              در شرف انقضا
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedScorecardClinic({ contract: cnt, scorecard: sc })}
                            className="bg-[#005581] hover:bg-[#003d5c] text-white text-[11px] font-black px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 mx-auto border border-[#ffd200] cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5 text-[#ffd200]" />
                            <span>مشاهده کارت‌امتیاز</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Trust Ladder L0 to L4 Visual Explanation */}
          <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-2">
              <h3 className="text-sm font-black text-[#005581] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#005581]" />
                <span>نردبان اعتماد و بلوغ عملیاتی مراکز دندان‌پزشکی (L0 تا L4)</span>
              </h3>
              <span className="text-[11px] text-[#005581]/70 font-bold">جهت مشاهده الزامات، روی هر سطح کلیک کنید</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[#005581]">
              <button
                type="button"
                onClick={() => setSelectedTrustLevelModal('L0')}
                className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl border border-slate-300 space-y-1 text-right transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[#005581] text-xs">سطح L0</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] font-bold text-slate-800">مرکز دستی</div>
                <div className="text-[10px] text-slate-600">بازبینی دستی عادی، بدون پرونده الکترونیک</div>
                <div className="pt-1 text-[9px] text-[#005581] font-bold underline">توضیحات بیشتر ←</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrustLevelModal('L1')}
                className="bg-sky-50 hover:bg-sky-100 p-3 rounded-xl border border-sky-300 space-y-1 text-right transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sky-900 text-xs">سطح L1</span>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] font-bold text-sky-800">پایه</div>
                <div className="text-[10px] text-sky-700">دادهٔ بیمه‌ای ناقص، ارسال حداقل مدارک</div>
                <div className="pt-1 text-[9px] text-sky-900 font-bold underline">توضیحات بیشتر ←</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrustLevelModal('L2')}
                className="bg-blue-50 hover:bg-blue-100 p-3 rounded-xl border border-blue-300 space-y-1 text-right transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-blue-900 text-xs">سطح L2</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] font-bold text-blue-800">متصل</div>
                <div className="text-[10px] text-blue-700">ارسال ادعا با مدارک کامل</div>
                <div className="pt-1 text-[9px] text-blue-900 font-bold underline">توضیحات بیشتر ←</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrustLevelModal('L3')}
                className="bg-indigo-50 hover:bg-indigo-100 p-3 rounded-xl border border-indigo-300 space-y-1 text-right transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-indigo-900 text-xs">سطح L3</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] font-bold text-indigo-800">تاییدشده</div>
                <div className="text-[10px] text-indigo-700">فعال‌بودن ماژول‌ها و عبور از کنترل کیفیت</div>
                <div className="pt-1 text-[9px] text-indigo-900 font-bold underline">توضیحات بیشتر ←</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrustLevelModal('L4')}
                className="bg-[#ffe552]/40 hover:bg-[#ffe552]/70 p-3 rounded-xl border-2 border-[#ffd200] space-y-1 text-right transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[#005581] text-xs">سطح L4</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#005581] group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] font-bold text-[#005581]">دنتورا - تسویه سریع</div>
                <div className="text-[10px] text-[#005581] font-bold">آمادگی بالا و نرخ برگشت پایین ← واجد تسویه سریع</div>
                <div className="pt-1 text-[9px] text-[#005581] font-extrabold underline">توضیحات بیشتر ←</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UNIFIED IMMUTABLE AUDIT LEDGER PER CLAIM */}
      {/* ========================================================================= */}
      {activeTab === 'audit_ledger' && (
        <div className="space-y-6">
          <div className="bg-[#fffffa] rounded-2xl p-6 border-2 border-[#005581] space-y-6 shadow-md">
            {/* Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[#72cdf4] pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#005581] text-white rounded-xl shadow">
                    <History className="w-6 h-6 text-[#ffd200]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#005581]">
                      دفترچه حسابرسی کلان و انطباق قانونی (یک‌پارچه به تفکیک هر ادعا)
                    </h2>
                    <p className="text-xs text-[#005581]/80 mt-1 font-semibold leading-relaxed">
                      تاریخچه کامل و یک‌پارچه زنجیره تصمیم‌گیری هر ادعا شامل تمام گام‌های پذیرش کلینیک، پایش هوش مصنوعی، ارزیابی مالی کارشناس ادعا، نظریه بالینی پزشک معتمد و رای دادرسی مدیریت بیمه به همراه کدهای امضای دیجیتال غیرقابل تغییر.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start lg:self-center">
                <div className="flex items-center gap-2 bg-[#005581] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                  <Lock className="w-4 h-4 text-[#ffd200]" />
                  <span>پرونده‌های حسابرسی‌شده (غیرقابل تغییر)</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-[#72cdf4] space-y-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#005581]/60" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="جستجو بر اساس شماره ادعا، نام بیمار، کد ملی، نام کلینیک..."
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-[#72cdf4] focus:outline-none focus:ring-2 focus:ring-[#005581] bg-[#fffffa] text-[#005581] font-bold"
                  />
                  {auditSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAuditSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 bg-[#fffffa] border border-[#72cdf4] px-2.5 py-1.5 rounded-xl text-xs font-bold">
                    <Filter className="w-3.5 h-3.5 text-[#005581]" />
                    <span className="text-[11px] text-[#005581]/80">وضعیت:</span>
                    <select
                      value={auditStatusFilter}
                      onChange={(e) => setAuditStatusFilter(e.target.value)}
                      className="bg-transparent font-bold text-[#005581] text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="approved">تأیید کامل</option>
                      <option value="partially_approved">تأیید جزئی / کسورات</option>
                      <option value="rejected">ردشده</option>
                      <option value="pending">در حال بررسی</option>
                    </select>
                  </div>

                  {/* Route Filter */}
                  <div className="flex items-center gap-1.5 bg-[#fffffa] border border-[#72cdf4] px-2.5 py-1.5 rounded-xl text-xs font-bold">
                    <span className="text-[11px] text-[#005581]/80">مسیر:</span>
                    <select
                      value={auditRouteFilter}
                      onChange={(e) => setAuditRouteFilter(e.target.value)}
                      className="bg-transparent font-bold text-[#005581] text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="all">همه مسیرها</option>
                      <option value="express">Express (سریع)</option>
                      <option value="standard">Standard (عادی)</option>
                      <option value="deep_review">Deep Review (عمیق)</option>
                    </select>
                  </div>

                  {/* Expand / Collapse All */}
                  <button
                    type="button"
                    onClick={() => {
                      const allExpanded = mockUnifiedClaimAuditTrails.reduce((acc, t) => {
                        acc[t.claimNumber] = true;
                        return acc;
                      }, {} as { [key: string]: boolean });
                      setExpandedClaimIds(allExpanded);
                    }}
                    className="bg-[#005581] hover:bg-[#003d5c] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    باز کردن همه
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedClaimIds({})}
                    className="bg-white hover:bg-gray-100 text-[#005581] border border-[#72cdf4] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    بستن همه
                  </button>
                </div>
              </div>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              {mockUnifiedClaimAuditTrails
                .filter((trail) => {
                  const matchesSearch =
                    auditSearchQuery.trim() === '' ||
                    trail.claimNumber.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                    trail.patientName.includes(auditSearchQuery) ||
                    trail.patientNationalId.includes(auditSearchQuery) ||
                    trail.clinicName.includes(auditSearchQuery) ||
                    trail.dentistName.includes(auditSearchQuery);

                  const matchesStatus = auditStatusFilter === 'all' || trail.status === auditStatusFilter;
                  const matchesRoute = auditRouteFilter === 'all' || trail.reviewRoute === auditRouteFilter;

                  return matchesSearch && matchesStatus && matchesRoute;
                })
                .length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#72cdf4] p-6">
                  <AlertCircle className="w-10 h-10 text-[#005581]/40 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#005581]">پرونده ادعایی با مشخصات جستجویافته در دفترچه حسابرسی یافت نشد.</p>
                </div>
              ) : (
                mockUnifiedClaimAuditTrails
                  .filter((trail) => {
                    const matchesSearch =
                      auditSearchQuery.trim() === '' ||
                      trail.claimNumber.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                      trail.patientName.includes(auditSearchQuery) ||
                      trail.patientNationalId.includes(auditSearchQuery) ||
                      trail.clinicName.includes(auditSearchQuery) ||
                      trail.dentistName.includes(auditSearchQuery);

                    const matchesStatus = auditStatusFilter === 'all' || trail.status === auditStatusFilter;
                    const matchesRoute = auditRouteFilter === 'all' || trail.reviewRoute === auditRouteFilter;

                    return matchesSearch && matchesStatus && matchesRoute;
                  })
                  .map((trail) => {
                    const isExpanded = !!expandedClaimIds[trail.claimNumber];

                    return (
                      <div
                        key={trail.claimNumber}
                        className="bg-white rounded-2xl border-2 border-[#72cdf4] overflow-hidden shadow-sm transition-all hover:border-[#005581]"
                      >
                        {/* Accordion Claim Header */}
                        <div
                          onClick={() =>
                            setExpandedClaimIds((prev) => ({
                              ...prev,
                              [trail.claimNumber]: !prev[trail.claimNumber],
                            }))
                          }
                          className="p-4 bg-[#fffffa] hover:bg-[#72cdf4]/10 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors border-b border-[#72cdf4]/50"
                        >
                          {/* Left Main Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <button
                              type="button"
                              className="p-1.5 rounded-lg bg-[#005581] text-white self-start sm:self-center cursor-pointer"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black bg-[#005581] text-white px-2.5 py-0.5 rounded-lg shadow-sm">
                                  {trail.claimNumber}
                                </span>

                                <span className="bg-[#ffd200] text-[#005581] px-2 py-0.5 rounded-lg text-[10px] font-black">
                                  سطح مرکز: {trail.clinicTrustLevel}
                                </span>

                                <span className="text-sm font-black text-[#005581]">
                                  بیمار: {trail.patientName}
                                </span>
                                <span className="text-xs text-[#005581]/70 font-mono">({trail.patientNationalId})</span>
                              </div>

                              <div className="text-xs font-bold text-[#005581]/90 mt-1 flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Building className="w-3.5 h-3.5 text-[#005581]" />
                                  <span>{trail.clinicName}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Stethoscope className="w-3.5 h-3.5 text-[#005581]" />
                                  <span>معالج: {trail.dentistName}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-[#005581]" />
                                  <span>خدمت: {trail.serviceDate}</span>
                                </span>
                              </div>

                              <div className="text-xs font-bold text-[#005581] mt-1 bg-[#72cdf4]/15 px-2.5 py-1 rounded-lg border border-[#72cdf4]/30 inline-block">
                                شرح درمان: {trail.serviceSummary}
                              </div>
                            </div>
                          </div>

                          {/* Right Info & Status Badges */}
                          <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end shrink-0">
                            {/* Financial Numbers */}
                            <div className="text-left font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-[#72cdf4]">
                              <div className="text-[10px] text-[#005581]/70">مبلغ ادعا / تاییدشده:</div>
                              <div className="text-[#005581] font-mono font-black">
                                {trail.totalClaimedAmount.toLocaleString('fa-IR')} / <span className="text-emerald-700">{trail.totalApprovedAmount.toLocaleString('fa-IR')}</span> ریال
                              </div>
                            </div>

                            {/* Route Badge */}
                            <span
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1 ${
                                trail.reviewRoute === 'express'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : trail.reviewRoute === 'standard'
                                  ? 'bg-slate-50 text-slate-800 border-slate-300'
                                  : 'bg-purple-50 text-purple-800 border-purple-300'
                              }`}
                            >
                              {trail.reviewRoute === 'express' ? (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-sky-600" />
                                  <span>مسیر Express</span>
                                </>
                              ) : trail.reviewRoute === 'standard' ? (
                                <>
                                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                                  <span>مسیر Standard</span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-3.5 h-3.5 text-purple-600" />
                                  <span>مسیر Deep Review</span>
                                </>
                              )}
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm ${
                                trail.status === 'approved'
                                  ? 'bg-emerald-600 text-white'
                                  : trail.status === 'partially_approved'
                                  ? 'bg-[#005581] text-white'
                                  : trail.status === 'rejected'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {trail.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd200]" />}
                              {trail.status === 'partially_approved' && <AlertTriangle className="w-3.5 h-3.5 text-[#ffd200]" />}
                              {trail.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                              {trail.status === 'pending' && <Clock className="w-3.5 h-3.5" />}

                              <span>
                                {trail.status === 'approved'
                                  ? 'تأیید کامل'
                                  : trail.status === 'partially_approved'
                                  ? 'تأیید جزئی / کسورات'
                                  : trail.status === 'rejected'
                                  ? 'ردشده'
                                  : 'در حال بررسی'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Expanded Timeline Content */}
                        {isExpanded && (
                          <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-[#72cdf4]/50 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                              <h4 className="text-xs font-black text-[#005581] flex items-center gap-1.5">
                                <History className="w-4 h-4 text-[#005581]" />
                                <span>زنجیره تصمیم‌گیری و تاریخچه یک‌پارچه حسابرسی پرونده ({trail.steps.length} گام ثبت‌شده)</span>
                              </h4>

                              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                تاییدیه زنجیره غیرقابل تغییر
                              </span>
                            </div>

                            {/* Timeline Vertical List */}
                            <div className="relative border-r-2 border-[#005581]/30 mr-3 pr-5 space-y-6">
                              {trail.steps.map((step) => {
                                const getStageTheme = (stage: string) => {
                                  switch (stage) {
                                    case 'reception':
                                      return {
                                        bg: 'bg-sky-50 border-sky-300 text-sky-900',
                                        badgeBg: 'bg-sky-700 text-white',
                                        icon: <Building className="w-4 h-4 text-sky-700" />,
                                      };
                                    case 'ai_engine':
                                      return {
                                        bg: 'bg-purple-50 border-purple-300 text-purple-900',
                                        badgeBg: 'bg-purple-700 text-white',
                                        icon: <Cpu className="w-4 h-4 text-purple-700" />,
                                      };
                                    case 'claim_reviewer':
                                      return {
                                        bg: 'bg-amber-50 border-amber-300 text-amber-900',
                                        badgeBg: 'bg-amber-700 text-white',
                                        icon: <UserCheck className="w-4 h-4 text-amber-700" />,
                                      };
                                    case 'medical_reviewer':
                                      return {
                                        bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
                                        badgeBg: 'bg-emerald-700 text-white',
                                        icon: <Stethoscope className="w-4 h-4 text-emerald-700" />,
                                      };
                                    case 'manager':
                                      return {
                                        bg: 'bg-blue-50 border-blue-300 text-blue-900',
                                        badgeBg: 'bg-[#005581] text-white',
                                        icon: <Scale className="w-4 h-4 text-[#005581]" />,
                                      };
                                    default:
                                      return {
                                        bg: 'bg-gray-50 border-gray-300 text-gray-900',
                                        badgeBg: 'bg-gray-700 text-white',
                                        icon: <FileText className="w-4 h-4 text-gray-700" />,
                                      };
                                  }
                                };

                                const theme = getStageTheme(step.stage);

                                return (
                                  <div key={step.stepIndex} className="relative">
                                    {/* Dot on Timeline */}
                                    <div className="absolute -right-[27px] top-3.5 w-3.5 h-3.5 rounded-full bg-[#005581] border-2 border-white shadow-sm" />

                                    {/* Card Box */}
                                    <div className={`p-4 rounded-xl border-2 ${theme.bg} shadow-sm space-y-2.5`}>
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${theme.badgeBg}`}>
                                            گام {step.stepIndex} - {step.stageTitle}
                                          </span>

                                          <div className="flex items-center gap-1 text-xs font-black">
                                            {theme.icon}
                                            <span>{step.userName}</span>
                                            <span className="text-[11px] opacity-75 font-normal">({step.userRole})</span>
                                          </div>
                                        </div>

                                        <div className="text-[11px] font-mono font-bold opacity-80 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{step.timestamp}</span>
                                        </div>
                                      </div>

                                      {/* Action Title and Description */}
                                      <div>
                                        <h5 className="text-xs font-black mb-1 flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <span>{step.actionTitle}</span>
                                        </h5>

                                        <p className="text-xs font-medium leading-relaxed bg-white/70 p-2.5 rounded-lg border border-black/5">
                                          {step.details}
                                        </p>
                                      </div>

                                      {/* Footer / Verification & Versions */}
                                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono border-t border-black/5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded border border-slate-300 font-bold">
                                            کد امضا: {step.wormVerifiedHash}
                                          </span>

                                          {step.ruleVersion && (
                                            <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold">
                                              {step.ruleVersion}
                                            </span>
                                          )}

                                          {step.aiModelVersion && (
                                            <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200 font-bold">
                                              {step.aiModelVersion}
                                            </span>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedAuditStepDetail({
                                              claimNumber: trail.claimNumber,
                                              stepIndex: step.stepIndex,
                                              stageTitle: step.stageTitle,
                                              userName: step.userName,
                                              userRole: step.userRole,
                                              timestamp: step.timestamp,
                                              actionTitle: step.actionTitle,
                                              details: step.details,
                                              wormHash: step.wormVerifiedHash,
                                              ruleVersion: step.ruleVersion,
                                              aiModelVersion: step.aiModelVersion,
                                            })
                                          }
                                          className="bg-[#005581] hover:bg-[#003d5c] text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>مشاهده جزئیات امضای دیجیتال</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD CLINIC CONTRACT MODAL */}
      {/* ========================================================================= */}
      {showUploadContractModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-2xl border-2 border-[#005581] shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#005581]" />
                <h3 className="text-base font-black text-[#005581]">آپلود و استخراج هوشمند قرارداد جدید کلینیک</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadContractModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contractUploadSuccess ? (
              <div className="bg-emerald-100 text-emerald-900 p-4 rounded-xl border border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <div className="font-extrabold text-sm">قرارداد با موفقیت آپلود و سقف تعهدات به‌روزرسانی شد!</div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-bold text-[#005581]">
                <p className="text-slate-600 leading-relaxed">
                  فایل قرارداد PDF یا DOCX کلینیک را انتخاب کنید. سامانهٔ هوش مصنوعی دنتورا سقف تعهدات، تاریخ شروع/پایان و سطح تعرفه‌ای را استخراج می‌کند.
                </p>

                {/* File Upload Box */}
                <div className="border-2 border-dashed border-[#72cdf4] bg-[#72cdf4]/10 p-6 rounded-2xl text-center cursor-pointer hover:bg-[#72cdf4]/20 transition-all relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#005581] mx-auto mb-2" />
                  <div className="font-extrabold text-[#005581]">برای انتخاب یا رها کردن فایل کلیک کنید</div>
                  <div className="text-[10px] text-[#005581]/70 mt-1">فرمت‌های مجاز: PDF, DOCX (حداکثر ۲۰ مگابایت)</div>
                  {uploadFile && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-[#005581] text-white text-[11px] px-3 py-1 rounded-md">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{uploadFile.name}</span>
                    </div>
                  )}
                </div>

                {isParsingContract && (
                  <div className="bg-sky-50 p-3 rounded-xl border border-sky-300 flex items-center gap-2 text-sky-900 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                    <span>در حال تحلیل و پردازش متن قرارداد توسط مدل هوش مصنوعی...</span>
                  </div>
                )}

                {parsedContractPreview && (
                  <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl space-y-2 text-emerald-950">
                    <div className="font-extrabold text-[#005581] border-b border-emerald-200 pb-1">
                      اطلاعات استخراج‌شده هوشمند:
                    </div>
                    <div className="flex justify-between">
                      <span>نام کلینیک:</span>
                      <span className="font-extrabold">{parsedContractPreview.clinicName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>سقف تعهدات سالانه:</span>
                      <span className="font-extrabold">{parsedContractPreview.ceiling}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>دوره قرارداد:</span>
                      <span>{parsedContractPreview.startDate} تا {parsedContractPreview.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>سطح اعتباری:</span>
                      <span className="bg-[#ffe552] text-[#005581] px-2 py-0.5 rounded font-black">
                        سطح {parsedContractPreview.tier}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-[#005581]/20">
                  <button
                    type="button"
                    onClick={() => setShowUploadContractModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    disabled={!parsedContractPreview}
                    onClick={handleSaveContract}
                    className="px-6 py-2 rounded-xl bg-[#005581] hover:bg-[#003d5c] text-white font-black disabled:opacity-50 cursor-pointer"
                  >
                    تأیید و ثبت قرارداد در سامانه
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 2: CLAIM DETAIL INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedClaimDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-2xl border-2 border-[#005581] shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">
                  جزئیات کلان پرونده {selectedClaimDetail.claimNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaimDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-[#005581]">
              <div className="grid grid-cols-2 gap-3 bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4]">
                <div>نام بیمار: {selectedClaimDetail.patientName}</div>
                <div>کد ملی: {selectedClaimDetail.patientNationalId || selectedClaimDetail.nationalId}</div>
                <div>نام کلینیک: {selectedClaimDetail.clinicName || 'کلینیک دنتورا'}</div>
                <div>دندان‌پزشک معالج: {selectedClaimDetail.dentistName || 'دکتر کاویانی'}</div>
              </div>

              <div className="border border-[#72cdf4] p-3 rounded-xl space-y-1">
                <div className="font-extrabold text-[#005581]">اقدامات درمانی ادعاشده:</div>
                {(selectedClaimDetail.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span>{item.procedureTitle} (دندان {item.toothNumber})</span>
                    <span className="font-mono">{item.claimedAmount.toLocaleString('fa-IR')} ریال</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-300">
                <span>مبلغ پرداختی سازمان بیمه‌گر:</span>
                <span className="font-mono text-emerald-900 font-extrabold text-sm">
                  {selectedClaimDetail.totalApprovedAmount?.toLocaleString('fa-IR') || selectedClaimDetail.supplApprovedAmount?.toLocaleString('fa-IR') || '-'} ریال
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedClaimDetail(null)}
                className="bg-[#005581] text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AUDIT DETAIL INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedAuditDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-2xl border-2 border-[#005581] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#005581]" />
                <h3 className="text-sm font-black text-[#005581]">جزئیات لاگ امضاشده غیرقابل تغییر</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#005581]">
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">شناسه لاگ:</span>
                <span className="font-mono font-black">{selectedAuditDetail.id}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">موجودیت:</span>
                <span className="font-mono font-black">{selectedAuditDetail.entityId}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">کاربر:</span>
                <span className="font-black">{selectedAuditDetail.userName} ({selectedAuditDetail.userRole})</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">زمان ثبت:</span>
                <span className="font-black">{selectedAuditDetail.timestamp}</span>
              </div>
              <div className="space-y-1">
                <span className="font-bold block">شرح عملیات:</span>
                <p className="bg-slate-100 p-2.5 rounded-xl text-[11px] leading-relaxed">
                  {selectedAuditDetail.details}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold block">کد امضای غیرقابل تغییر:</span>
                <div className="font-mono text-[10px] bg-slate-900 text-emerald-400 p-2.5 rounded-xl break-all">
                  {selectedAuditDetail.wormVerifiedHash}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedAuditDetail(null)}
                className="bg-[#005581] text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CLINIC SCORECARD DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedScorecardClinic && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-2xl border-2 border-[#005581] shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#ffd200]" />
                <div>
                  <h3 className="text-sm font-black text-[#005581]">
                    کارت‌امتیاز جامع عملکرد مرکز
                  </h3>
                  <p className="text-[11px] text-[#005581]/70 font-semibold">
                    {selectedScorecardClinic.contract.clinicName} (قرارداد: {selectedScorecardClinic.contract.contractNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScorecardClinic(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl">
                <div className="text-[10px] text-emerald-800 font-bold">نرخ ادعای تمیز</div>
                <div className="text-lg font-black text-emerald-900">
                  {selectedScorecardClinic.scorecard.cleanClaimRate}٪
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl">
                <div className="text-[10px] text-rose-800 font-bold">نرخ برگشت پرونده</div>
                <div className="text-lg font-black text-rose-900">
                  {selectedScorecardClinic.scorecard.rejectionRate}٪
                </div>
              </div>
              <div className="bg-sky-50 border border-sky-300 p-3 rounded-xl">
                <div className="text-[10px] text-sky-800 font-bold">میانگین زمان تسویه</div>
                <div className="text-lg font-black text-sky-900">
                  {selectedScorecardClinic.scorecard.avgSettlementHours} ساعت
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl">
                <div className="text-[10px] text-amber-800 font-bold">تطبیق مواد مصرفی</div>
                <div className="text-lg font-black text-amber-900">
                  {selectedScorecardClinic.scorecard.materialMatchScore}٪
                </div>
              </div>
            </div>

            {/* Detailed Info List */}
            <div className="bg-white p-4 rounded-xl border border-[#72cdf4] space-y-2.5 text-xs text-[#005581]">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold">سطح اعتبار و بلوغ (Tier):</span>
                <span className="bg-[#ffe552] text-[#005581] border border-[#ffd200] px-3 py-1 rounded-lg font-black text-xs">
                  سطح {selectedScorecardClinic.scorecard.tier}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold">تعداد کل ادعاهای پردازش‌شده:</span>
                <span className="font-black text-sm">{selectedScorecardClinic.scorecard.totalClaimsCount} مورد</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold">مجوز مسیر تسویه سریع:</span>
                {selectedScorecardClinic.scorecard.isGreenLaneApproved ? (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg font-black flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>تاییدشده (تسویه خودکار زیر ۲۴ ساعت)</span>
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold">
                    ارزیابی عادی
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold">سقف تعهدات سالانه قرارداد:</span>
                <span className="font-black text-sm text-[#005581]">
                  {selectedScorecardClinic.contract.annualCeilingAmount.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">میزان بودجه مصرف‌شده:</span>
                <span className="font-black text-sm text-amber-800">
                  {selectedScorecardClinic.contract.usedBudgetPercentage}٪ از سقف کل
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedScorecardClinic(null)}
                className="bg-[#005581] hover:bg-[#003d5c] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                بستن کارت‌امتیاز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: TRUST LADDER (L0-L4) OPERATIONAL DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedTrustLevelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-2xl border-2 border-[#005581] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#005581] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#005581]" />
                <div>
                  <h3 className="text-sm font-black text-[#005581]">
                    توضیحات و الزامات سطح اعتباری {selectedTrustLevelModal}
                  </h3>
                  <p className="text-[11px] text-[#005581]/70 font-semibold">
                    بلوغ عملیاتی و نحوه هدایت پرونده‌های بیمه‌ای
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrustLevelModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTrustLevelModal === 'L0' && (
              <div className="space-y-3 text-xs text-[#005581]">
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 font-bold text-slate-800">
                  عنوان: سطح L0 - مرکز غیرالکترونیک (ارسال دستی)
                </div>
                <div className="space-y-2 leading-relaxed">
                  <p><strong>روش ارزیابی:</strong> ۱۰۰٪ بررسی کارشناسی دستی توسط کارشناس ادعا و پزشک معتمد بیمه.</p>
                  <p><strong>مدارک الزامی:</strong> اصل صورت‌حساب گواهی‌شده، کلیشه عکس رادیوگرافی کاغذی/آنالوگ، نسخه فیزیکی مهرشده.</p>
                  <p><strong>متوسط زمان تسویه:</strong> ۱۴ تا ۲۱ روز کاری.</p>
                  <p><strong>وضعیت فنی:</strong> مرکز فاقد اتصال مستقیم به سامانه دنتورا است.</p>
                </div>
              </div>
            )}

            {selectedTrustLevelModal === 'L1' && (
              <div className="space-y-3 text-xs text-[#005581]">
                <div className="bg-sky-100 p-3 rounded-xl border border-sky-300 font-bold text-sky-900">
                  عنوان: سطح L1 - مرکز پایه (Dentora Basic)
                </div>
                <div className="space-y-2 leading-relaxed">
                  <p><strong>روش ارزیابی:</strong> ثبت الکترونیک اولیه ادعا همراه با استعلام‌های نیمه‌خودکار.</p>
                  <p><strong>مدارک الزامی:</strong> کدملی بیمار، فایل دیجیتال تصویر RVG دندان، مشخصات خدمت.</p>
                  <p><strong>متوسط زمان تسویه:</strong> ۷ تا ۱۰ روز کاری.</p>
                  <p><strong>وضعیت فنی:</strong> غربالگری اولیه با هوش مصنوعی و ارجاع به صف ارزیابی Standard.</p>
                </div>
              </div>
            )}

            {selectedTrustLevelModal === 'L2' && (
              <div className="space-y-3 text-xs text-[#005581]">
                <div className="bg-blue-100 p-3 rounded-xl border border-blue-300 font-bold text-blue-900">
                  عنوان: سطح L2 - مرکز متصل (Dentora Connected)
                </div>
                <div className="space-y-2 leading-relaxed">
                  <p><strong>روش ارزیابی:</strong> ارسال آنلاین کامل ادعا با پوشش بیمه پایه و تکمیلی.</p>
                  <p><strong>مدارک الزامی:</strong> تصویر RVG، توکن استعلام استحقاق درمان، گواهی درمان آنلاین.</p>
                  <p><strong>متوسط زمان تسویه:</strong> ۳ تا ۱۰ روز.</p>
                  <p><strong>وضعیت فنی:</strong> اطلاعات بیمه‌ای نسبتاً کامل، اما عدم فعال‌سازی ۵ ماژول مسیر بررسی سریع.</p>
                </div>
              </div>
            )}

            {selectedTrustLevelModal === 'L3' && (
              <div className="space-y-3 text-xs text-[#005581]">
                <div className="bg-indigo-100 p-3 rounded-xl border border-indigo-300 font-bold text-indigo-900">
                  عنوان: سطح L3 - مرکز تاییدشده (Dentora Verified)
                </div>
                <div className="space-y-2 leading-relaxed">
                  <p><strong>روش ارزیابی:</strong> فعال‌بودن کامل ۵ ماژول الزامی و کنترلی و نرخ برگشت کمتر از ۵٪. ۵ ماژول مربوط به مسیر بررسی سریع هم فعال هستند.</p>
                  <p><strong>مدارک الزامی:</strong> رضایت‌نامه الکترونیک بیمار، شواهد تصویری قبل و بعد درمان، کد رهگیری خدمت.</p>
                  <p><strong>متوسط زمان تسویه:</strong> حداقل ۴۸ ساعت.</p>
                  <p><strong>وضعیت فنی:</strong> ماژول‌های مربوط به بررسی سریع فعال شده است اما هنوز در حال ارزیابی هست.</p>
                </div>
              </div>
            )}

            {selectedTrustLevelModal === 'L4' && (
              <div className="space-y-3 text-xs text-[#005581]">
                <div className="bg-[#ffe552]/40 p-3 rounded-xl border-2 border-[#ffd200] font-bold text-[#005581]">
                  عنوان: سطح L4 - دنتورا تسویه سریع (Green Lane)
                </div>
                <div className="space-y-2 leading-relaxed">
                  <p><strong>روش ارزیابی:</strong> بالاترین درجه اعتماد، نرخ ادعای تمیز بالای ۹۰٪، ارزیابی خودکار بدون مداخله انسانی.</p>
                  <p><strong>مدارک الزامی:</strong> ثبت دقیق و خودکار تمام ۵ ماژول، تطبیق کامل مواد و تجهیزات مصرفی، توکن رضایت بیمار.</p>
                  <p><strong>متوسط زمان تسویه:</strong> حدوداً ۴۸ ساعت.</p>
                  <p><strong>امتیازات اختصاصی:</strong> بالاترین سطح اعتماد و پلن بررسی سریع فعال.</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTrustLevelModal(null)}
                className="bg-[#005581] hover:bg-[#003d5c] text-white px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UNIFIED AUDIT STEP DETAIL WORM LOCK */}
      {selectedAuditStepDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-2xl border-2 border-[#005581] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b-2 border-[#72cdf4] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#ffd200]" />
                <h3 className="text-base font-black text-[#005581]">
                  جزئیات ثبت و امضای دیجیتال غیرقابل تغییر
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditStepDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-[#005581]">
              <div className="flex items-center justify-between bg-[#005581] text-white p-2.5 rounded-xl">
                <span>شماره ادعا: {selectedAuditStepDetail.claimNumber}</span>
                <span>گام {selectedAuditStepDetail.stepIndex} - {selectedAuditStepDetail.stageTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-100 p-3 rounded-xl">
                <div>
                  <span className="opacity-70">مسئول ثبت:</span> {selectedAuditStepDetail.userName}
                </div>
                <div>
                  <span className="opacity-70">زمان دقیق:</span> {selectedAuditStepDetail.timestamp}
                </div>
                <div className="col-span-2">
                  <span className="opacity-70">نقش سازمانی:</span> {selectedAuditStepDetail.userRole}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-[#005581] block mb-1">نوع اقدام و عنوان عملیات:</label>
                <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-sky-950 font-black">
                  {selectedAuditStepDetail.actionTitle}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-[#005581] block mb-1">متن کامل مستندات و استدلال ارزیابی:</label>
                <div className="bg-white p-3 rounded-xl border border-[#72cdf4] text-[#005581] leading-relaxed font-medium">
                  {selectedAuditStepDetail.details}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-[#005581] block mb-1">کد امضای دیجیتال غیرقابل تغییر (Cryptographic Hash):</label>
                <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-2.5 rounded-xl flex items-center justify-between border border-slate-700">
                  <span className="break-all">{selectedAuditStepDetail.wormHash}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                    LOCKED
                  </span>
                </div>
              </div>

              {selectedAuditStepDetail.ruleVersion && (
                <div className="flex items-center justify-between text-[10px] bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <span>نسخه موتور قواعد قانونی:</span>
                  <span className="font-mono font-bold text-blue-900">{selectedAuditStepDetail.ruleVersion}</span>
                </div>
              )}

              {selectedAuditStepDetail.aiModelVersion && (
                <div className="flex items-center justify-between text-[10px] bg-purple-50 p-2 rounded-lg border border-purple-200">
                  <span>نسخه مدل پردازش هوش مصنوعی:</span>
                  <span className="font-mono font-bold text-purple-900">{selectedAuditStepDetail.aiModelVersion}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#72cdf4]">
              <button
                type="button"
                onClick={() => setSelectedAuditStepDetail(null)}
                className="bg-[#005581] hover:bg-[#003d5c] text-white px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
