import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  Lock,
  FileSpreadsheet,
  CheckSquare,
  Sparkles,
  ChevronLeft,
  Send,
  History,
  MessageSquare,
  Scale,
  Award,
  Stethoscope,
  XCircle,
  AlertCircle,
  Layers,
  User,
  Calendar,
  Building2,
  FileText,
  CreditCard,
  Key,
  Info,
  ArrowRight,
  Check,
  Edit3,
} from 'lucide-react';
import { mockClaims, mockAuditLogs } from '../../data/mockData';
import { Claim, DeductionReasonCode, ReviewRoute, AuditLogItem } from '../../types';

type WorkspaceTab = 'queues' | 'scrutiny' | 'medical_handover' | 'decisions' | 'appeals' | 'audit_log';

// Helper function to convert digits to Persian
const toFa = (val?: string | number | null): string => {
  if (val === undefined || val === null) return '';
  const str = typeof val === 'number' ? val.toLocaleString('fa-IR') : val.toString();
  const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => faDigits[enDigits.indexOf(w)]);
};

interface InsuranceReviewerWorkspaceProps {
  claims?: Claim[];
  setClaims?: React.Dispatch<React.SetStateAction<Claim[]>>;
  onReviewDecision?: (
    claimId: string,
    decision: 'approved' | 'rejected' | 'partially_approved',
    reason?: string
  ) => void;
}

export const InsuranceReviewerWorkspace: React.FC<InsuranceReviewerWorkspaceProps> = ({
  claims: propClaims,
  setClaims: propSetClaims,
  onReviewDecision,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('queues');
  const [claims, setLocalClaims] = useState<Claim[]>(propClaims && propClaims.length > 0 ? propClaims : mockClaims);
  
  // Keep local claims in sync with prop claims
  React.useEffect(() => {
    if (propClaims && propClaims.length > 0) {
      setLocalClaims(propClaims);
    }
  }, [propClaims]);

  const setClaims = (action: React.SetStateAction<Claim[]>) => {
    setLocalClaims(action);
    if (propSetClaims) {
      propSetClaims(action);
    }
  };

  const [selectedQueue, setSelectedQueue] = useState<ReviewRoute>('express');
  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    claims[0]?.id || mockClaims[0].id
  );

  // Appeals state
  const [selectedAppealId, setSelectedAppealId] = useState<string | null>('app-01');
  const [appealRejectionReason, setAppealRejectionReason] = useState<string>('');
  const [appealDecisionSuccessMsg, setAppealDecisionSuccessMsg] = useState<string>('');

  // Digital Certificate State (Enrollment separated from Document Signing)
  const [isCertificateEnrolled] = useState<boolean>(true);
  const [signingPin, setSigningPin] = useState<string>('1234');
  const [signedClaimsMap, setSignedClaimsMap] = useState<{ [claimId: string]: boolean }>({});
  const [showPreAuthModal, setShowPreAuthModal] = useState<boolean>(false);

  // Medical Handover Decision State (Section 3)
  const [medicalHandoverDecision, setMedicalHandoverDecision] = useState<'approved' | 'partially_approved'>('partially_approved');
  const [handoverNote, setHandoverNote] = useState<string>('');
  const [itemSpecificNotes, setItemSpecificNotes] = useState<{ [key: string]: string }>({
    'ci-101': 'کیفیت تصویر RVG پری‌اپیکال بررسی شود. طول پرشدگی کانال‌ها نیازمند صحه‌گذاری پزشک است.',
  });
  const [handoverSuccessMsg, setHandoverSuccessMsg] = useState<string>('');

  // Decision & Deduction state
  const [overallDecision, setOverallDecision] = useState<'approved' | 'partially_approved' | 'rejected'>('partially_approved');
  const [decisionNotes, setDecisionNotes] = useState<string>(
    'پس از انطباق با تعرفه مصوب و سقف تعهدات، اقلام مربوطه بررسی و کسورات کسر گردید.'
  );

  // Deduction state per item
  const [itemDeductionCodes, setItemDeductionCodes] = useState<{ [key: string]: DeductionReasonCode }>({
    'ci-101': 'TARIFF_EXCEEDED',
  });
  const [itemDeductionNotes, setItemDeductionNotes] = useState<{ [key: string]: string }>({
    'ci-101': 'تخطی از سقف تعرفه پایه الحاقیه مصوب به میزان ۵۰,۰۰۰ تومان',
  });

  // Digital Signature Modal state
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [finalDecisionSuccessMsg, setFinalDecisionSuccessMsg] = useState<string>('');

  // WORM Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(mockAuditLogs);

  // Selected claim object helper
  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0] || mockClaims[0];

  // Clinic filter state for Section 5 (Appeals)
  const [selectedClinicFilter, setSelectedClinicFilter] = useState<string>('all');
  const [activeAppealDetailId, setActiveAppealDetailId] = useState<string | null>('app-01');

  // Filtered claims for queue view
  const queueClaims = claims.filter((c) => c.reviewRoute === selectedQueue);

  // Collect all unique clinics for Section 5 filter
  const uniqueClinics = Array.from(
    new Set(claims.map((c) => c.clinicName).filter(Boolean) as string[])
  );

  // Collect all appeals across claims for Section 5
  const allAppeals = claims.flatMap((claim) =>
    (claim.appeals || []).map((appeal) => ({
      ...appeal,
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      clinicName: claim.clinicName || 'کلینیک دنتورا',
      branchName: claim.branchName || 'شعبه اصلی',
      patientName: claim.patientName,
      patientNationalId: claim.patientNationalId || claim.nationalId,
      dentistName: claim.dentistName || 'دکتر فرهاد رضایی',
      serviceDate: claim.serviceDate || claim.dateOfService,
      items: claim.items || [],
      evidences: claim.evidences || [],
      riskScore: claim.riskScore,
    }))
  );

  // Filtered active pending appeals for Section 5 (remove rejected appeals)
  const pendingAppeals = allAppeals.filter((a) => a.status === 'pending');
  const filteredAppeals = selectedClinicFilter === 'all'
    ? pendingAppeals
    : pendingAppeals.filter((a) => a.clinicName === selectedClinicFilter);

  // Helper to calculate risk score breakdown
  const getRiskBreakdown = (claim: Claim) => {
    const factors: { label: string; score: number; detail: string }[] = [];
    let calculatedScore = 15; // Base risk

    const hasTariffOvershoot = (claim.items || []).some((item) => item.claimedAmount > item.tariffAmount);
    if (hasTariffOvershoot) {
      factors.push({
        label: 'مغایرت تعرفه پایه',
        score: 25,
        detail: 'مبلغ ادعاشده در حداقل یک قلم بیش از تعرفه پایه مصوب است.',
      });
      calculatedScore += 25;
    }

    if (!claim.evidences || claim.evidences.length === 0) {
      factors.push({
        label: 'عدم ارائه کلیشه/فاکتور',
        score: 35,
        detail: 'هیچ شواهد تصویری یا فاکتور معتبر ضمیمه نشده است.',
      });
      calculatedScore += 35;
    }

    if (claim.aiFlags && claim.aiFlags.length > 0) {
      const highSeverity = claim.aiFlags.some((f) => f.severity === 'high');
      const addScore = highSeverity ? 30 : 15;
      factors.push({
        label: 'سیگنال هوش مصنوعی',
        score: addScore,
        detail: `${toFa(claim.aiFlags.length)} مورد مغایرت خودکار توسط کوپایلت علامت‌گذاری شده است.`,
      });
      calculatedScore += addScore;
    }

    const finalScore = Math.min(100, Math.max(claim.riskScore, calculatedScore));
    let calculatedQueue: ReviewRoute = 'express';
    if (finalScore >= 70) calculatedQueue = 'deep_review';
    else if (finalScore >= 40) calculatedQueue = 'standard';

    return { finalScore, factors, calculatedQueue };
  };

  // Smooth scroll helper for clicking shortage summary
  const scrollToItem = (itemId: string) => {
    const el = document.getElementById(`item-${itemId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#ffd200]');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#ffd200]'), 2500);
    }
  };

  // Submit Final Decision (Triggers Modal if deep review, or directly executes)
  const handleInitiateFinalDecision = () => {
    if (selectedClaim.reviewRoute === 'deep_review' || selectedClaim.riskScore >= 40) {
      setShowSignatureModal(true);
    } else {
      executeFinalDecision();
    }
  };

  // Execute Final Decision with System-Generated Hash & Mark Read-Only
  const executeFinalDecision = () => {
    const generatedHash = '0x' + Math.random().toString(16).substring(2, 10) + '99a21e84';
    const updatedDecision = {
      decidedAt: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR').slice(0, 5),
      decision: overallDecision,
      deductionTotal: overallDecision === 'approved' ? 0 : 500000,
      notes: decisionNotes,
      digitalSignatureHash: generatedHash,
    };

    setSignedClaimsMap((prev) => ({ ...prev, [selectedClaim.id]: true }));

    setClaims((prev) =>
      prev.map((c) =>
        c.id === selectedClaim.id
          ? {
              ...c,
              status: overallDecision,
              totalApprovedAmount: overallDecision === 'approved' ? c.totalClaimedAmount : c.totalClaimedAmount - 500000,
              reviewDecision: updatedDecision,
            }
          : c
      )
    );

    const newAuditLog: AuditLogItem = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      userName: 'مریم عباسی (بازبین ارشد بیمه)',
      userRole: 'ClaimReviewer',
      action: overallDecision === 'approved' ? 'CLAIM_FULL_APPROVAL' : overallDecision === 'partially_approved' ? 'CLAIM_DEDUCTION_APPLIED' : 'CLAIM_REJECTED',
      entityType: 'Claim',
      entityId: selectedClaim.claimNumber,
      details: `ثبت رای ${overallDecision === 'approved' ? 'تأیید کامل' : overallDecision === 'partially_approved' ? 'تأیید جزئی' : 'رد کامل'}. امضای دیجیتال معتبر و غیرقابل تغییر و رمز یک‌بارمصرف ثبت گردید.`,
      wormVerifiedHash: generatedHash,
      ruleVersion: 'v2.1-2026',
      aiModelVersion: 'Dentura-AI-v3.4',
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    setShowSignatureModal(false);
    setFinalDecisionSuccessMsg(`رای پرونده ${selectedClaim.claimNumber} با امضای دیجیتال معتبر و غیرقابل تغییر ثبت و قفل گردید.`);

    setTimeout(() => {
      setFinalDecisionSuccessMsg('');
      setActiveTab('queues');
    }, 2000);
  };

  // Handle Handover to Medical Reviewer & Automatic Redirect to Section 1
  const handleSendToMedicalReviewer = () => {
    if (!selectedClaim) return;
    setClaims((prev) =>
      prev.map((c) =>
        c.id === selectedClaim.id
          ? {
              ...c,
              medicalReviewerName: 'دکتر حمید سجادی (پزشک معتمد)',
              aiFlags: [
                ...(c.aiFlags || []),
                {
                  code: 'MEDICAL_HANDOVER',
                  description: `پرونده با نظر ${medicalHandoverDecision === 'approved' ? 'تأیید اولیه' : 'تأیید جزئی'} و تایید اسناد به پزشک معتمد ارجاع گردید.`,
                  severity: 'medium',
                },
              ],
            }
          : c
      )
    );

    const newAuditLog: AuditLogItem = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      userName: 'مریم عباسی (بازبین ارشد بیمه)',
      userRole: 'ClaimReviewer',
      action: 'MEDICAL_HANDOVER_INITIATED',
      entityType: 'Claim',
      entityId: selectedClaim.claimNumber,
      details: `ارجاع پرونده به میزکار پزشک معتمد با تصمیم ${medicalHandoverDecision === 'approved' ? 'تأیید اولیه' : 'تأیید جزئی'}. توضیحات: ${handoverNote || 'بدون توضیحات اضافی'}`,
      wormVerifiedHash: '0x' + Math.random().toString(16).substring(2, 10),
      ruleVersion: 'v2.1-2026',
      aiModelVersion: 'Dentura-AI-v3.4',
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    setHandoverSuccessMsg(`پرونده ${selectedClaim.claimNumber} با موفقیت به میزکار پزشک معتمد ارجاع شد. انتقال خودکار به صف ادعاها...`);

    setTimeout(() => {
      setHandoverSuccessMsg('');
      setActiveTab('queues');
    }, 1500);
  };

  // Handle Appeal Acceptance -> Navigate automatically to Section 3 (ارجاع به بازبین پزشکی)
  const handleApproveAppeal = (claimId: string, appealId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const updatedAppeals = (c.appeals || []).map((a) =>
          a.id === appealId
            ? { ...a, status: 'accepted' as const, responseNotes: 'اعتراض کلینیک وارده تشخیص داده شد و پرونده جهت ارزیابی به بازبین پزشکی منتقل شد.' }
            : a
        );
        return {
          ...c,
          appeals: updatedAppeals,
          status: 'in_review',
        };
      })
    );

    const targetClaim = claims.find((c) => c.id === claimId);

    const newAuditLog: AuditLogItem = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      userName: 'مریم عباسی (بازبین ارشد بیمه)',
      userRole: 'ClaimReviewer',
      action: 'APPEAL_APPROVED',
      entityType: 'Appeal',
      entityId: appealId,
      details: `تأیید اعتراض پرونده ${targetClaim?.claimNumber || claimId}. هدایت خودکار به بخش ۳ (ارجاع به بازبین پزشکی) جهت صحه‌گذاری کارشناسی.`,
      wormVerifiedHash: '0x' + Math.random().toString(16).substring(2, 10),
      ruleVersion: 'v2.1-2026',
      aiModelVersion: 'Dentura-AI-v3.4',
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    setSelectedClaimId(claimId);
    setAppealDecisionSuccessMsg('اعتراض با موفقیت پذیرفته شد. انتقال به بخش سه (ارجاع به بازبین پزشکی)...');

    setTimeout(() => {
      setAppealDecisionSuccessMsg('');
      setActiveTab('medical_handover');
    }, 1500);
  };

  // Handle Appeal Rejection
  const handleRejectAppeal = (claimId: string, appealId: string) => {
    if (!appealRejectionReason.trim()) {
      alert('لطفا دلیل رد اعتراض را وارد نمایید.');
      return;
    }

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const updatedAppeals = (c.appeals || []).map((a) =>
          a.id === appealId
            ? { ...a, status: 'rejected' as const, responseNotes: appealRejectionReason }
            : a
        );
        return {
          ...c,
          appeals: updatedAppeals,
        };
      })
    );

    const targetClaim = claims.find((c) => c.id === claimId);

    const newAuditLog: AuditLogItem = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      userName: 'مریم عباسی (بازبین ارشد بیمه)',
      userRole: 'ClaimReviewer',
      action: 'APPEAL_REJECTED',
      entityType: 'Appeal',
      entityId: appealId,
      details: `رد اعتراض پرونده ${targetClaim?.claimNumber || claimId} به علت: ${appealRejectionReason}. ثبت در دفترچه حسابرسی غیرقابل تغییر.`,
      wormVerifiedHash: '0x' + Math.random().toString(16).substring(2, 10),
      ruleVersion: 'v2.1-2026',
      aiModelVersion: 'Dentura-AI-v3.4',
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);
    setAppealDecisionSuccessMsg('رأی رد اعتراض صادر شد. اعتراض با موفقیت پردازش شد و از لیست اعتراض‌های فعال حذف گردید.');
    setTimeout(() => setAppealDecisionSuccessMsg(''), 4500);
    setAppealRejectionReason('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#fffffa] min-h-screen text-[#005581] font-sans relative" dir="rtl">
      {/* CENTERED POPUP NOTIFICATION MODAL (نمایش تمام پیغام‌های تایید/رد/ارجاع در مرکز صفحه بدون نیاز به اسکرول) */}
      {(appealDecisionSuccessMsg || handoverSuccessMsg || finalDecisionSuccessMsg) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fffffa] border-4 border-[#005581] p-6 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-4 transform transition-all scale-100">
            <div className="w-14 h-14 bg-[#ffe552] rounded-full flex items-center justify-center mx-auto border-2 border-[#ffd200] shadow-md">
              <CheckCircle2 className="w-8 h-8 text-[#005581]" />
            </div>
            <h3 className="text-base font-black text-[#005581]">
              عملیات با موفقیت انجام شد
            </h3>
            <p className="text-xs font-black text-[#005581] leading-relaxed bg-[#72cdf4]/20 p-4 rounded-2xl border border-[#72cdf4]">
              {appealDecisionSuccessMsg || handoverSuccessMsg || finalDecisionSuccessMsg}
            </p>
            <button
              type="button"
              onClick={() => {
                setAppealDecisionSuccessMsg('');
                setHandoverSuccessMsg('');
                setFinalDecisionSuccessMsg('');
              }}
              className="bg-[#005581] hover:bg-[#003d5c] text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-105"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
      {/* Header Banner */}
      <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#005581] text-white flex items-center justify-center shadow-md">
            <FileCheck2 className="w-6 h-6 text-[#ffe552]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#005581]">
                میزکار بازبین ادعا (Claim Reviewer Workspace)
              </h1>
              <span className="bg-[#ffe552] text-[#005581] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#ffd200]">
                بخش بیمه‌گر
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#72cdf4]/20 px-3.5 py-2 rounded-xl border border-[#72cdf4] text-center">
            <div className="text-[10px] text-[#005581] font-bold">نمونه‌گیری چرخشی (QC)</div>
            <div className="text-xs font-black text-[#005581]">{toFa('۱ از ۱۰۰')} (فعال)</div>
          </div>
          <div className="bg-[#ffe552]/30 px-3.5 py-2 rounded-xl border border-[#ffd200] text-center">
            <div className="text-[10px] text-[#005581] font-bold">قوانین پین‌شده</div>
            <div className="text-xs font-black text-[#005581]">v2.1-2026</div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout with Sidebar Menu on the RIGHT Side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* RIGHT SIDEBAR NAVIGATION MENU (منوی سمت راست) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-[#fffffa] rounded-2xl p-4 border border-[#72cdf4] shadow-sm space-y-2">
            <div className="text-xs font-black text-[#005581] px-2 py-1 mb-2 border-b border-[#72cdf4] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#005581]" />
              <span>منوی اصلی بازبین</span>
            </div>

            <button
              onClick={() => setActiveTab('queues')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-right ${
                activeTab === 'queues'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'bg-[#72cdf4]/10 text-[#005581] border border-[#72cdf4]/40 hover:bg-[#72cdf4]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${activeTab === 'queues' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>{toFa('۱')}. صف‌ها و مسیریابی ریسک</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'queues' ? 'bg-[#ffe552] text-[#005581]' : 'bg-[#72cdf4]/30 text-[#005581]'}`}>
                {toFa(claims.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scrutiny')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-right ${
                activeTab === 'scrutiny'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'bg-[#72cdf4]/10 text-[#005581] border border-[#72cdf4]/40 hover:bg-[#72cdf4]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className={`w-4 h-4 ${activeTab === 'scrutiny' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>{toFa('۲')}. بررسی مدارک و سقف بیمه</span>
              </div>
              {selectedClaim.riskScore > 40 && (
                <span className="w-2 h-2 rounded-full bg-[#ffd200] animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('medical_handover')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-right ${
                activeTab === 'medical_handover'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'bg-[#72cdf4]/10 text-[#005581] border border-[#72cdf4]/40 hover:bg-[#72cdf4]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Stethoscope className={`w-4 h-4 ${activeTab === 'medical_handover' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>{toFa('۳')}. ارجاع به بازبین پزشکی</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('decisions')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-right ${
                activeTab === 'decisions'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'bg-[#72cdf4]/10 text-[#005581] border border-[#72cdf4]/40 hover:bg-[#72cdf4]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scale className={`w-4 h-4 ${activeTab === 'decisions' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>{toFa('۴')}. ثبت نهایی کسورات</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('appeals')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-right ${
                activeTab === 'appeals'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'bg-[#72cdf4]/10 text-[#005581] border border-[#72cdf4]/40 hover:bg-[#72cdf4]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className={`w-4 h-4 ${activeTab === 'appeals' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>{toFa('۵')}. مدیریت اعتراضات (Re-Review)</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'appeals' ? 'bg-[#ffe552] text-[#005581]' : 'bg-[#ffe552]/80 text-[#005581]'}`}>
                {toFa(claims.reduce((acc, c) => acc + (c.appeals ? c.appeals.length : 0), 0))}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audit_log')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-right ${
                activeTab === 'audit_log'
                  ? 'bg-[#005581] text-white shadow-md'
                  : 'bg-[#72cdf4]/10 text-[#005581] border border-[#72cdf4]/40 hover:bg-[#72cdf4]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className={`w-4 h-4 ${activeTab === 'audit_log' ? 'text-[#ffd200]' : 'text-[#005581]'}`} />
                <span>دفترچه حسابرسی (غیرقابل تغییر)</span>
              </div>
            </button>
          </div>

          {/* Selected Claim Info Mini Card in Sidebar */}
          <div className="bg-[#72cdf4]/10 rounded-2xl p-4 border border-[#72cdf4] space-y-2 text-xs">
            <div className="font-bold text-[#005581] flex items-center justify-between">
              <span>پرونده فعال:</span>
              <span className="font-mono bg-[#005581] text-white px-2 py-0.5 rounded text-[10px]">
                {toFa(selectedClaim.claimNumber)}
              </span>
            </div>
            <div className="text-[#005581] font-medium">بیمار: {selectedClaim.patientName}</div>
            <div className="text-[#005581]/80 text-[11px]">کلینیک: {selectedClaim.clinicName}</div>
            <div className="pt-2 border-t border-[#72cdf4] flex justify-between items-center font-bold">
              <span>مبلغ کل:</span>
              <span>{toFa((selectedClaim.totalClaimedAmount / 10).toLocaleString('fa-IR'))} تومان</span>
            </div>
          </div>
        </div>

        {/* LEFT MAIN CONTENT PANEL */}
        <div className="lg:col-span-3 space-y-6">
          {/* SECTION 1: Risk Routing Queues & Internal Risk Assessment */}
          {activeTab === 'queues' && (
            <div className="space-y-6">
              {/* Queue Sub-Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedQueue('express')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedQueue === 'express'
                      ? 'bg-[#005581] text-white shadow-sm'
                      : 'bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/40'
                  }`}
                >
                  <Zap className="w-4 h-4 text-[#ffd200]" />
                  <span>صف سریع (Express) - ریسک کم</span>
                  <span className="bg-[#ffe552] text-[#005581] text-[10px] px-2 py-0.5 rounded-full font-black">
                    {toFa(claims.filter((c) => c.reviewRoute === 'express').length)}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedQueue('standard')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedQueue === 'standard'
                      ? 'bg-[#005581] text-white shadow-sm'
                      : 'bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/40'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#ffd200]" />
                  <span>صف استاندارد (Standard)</span>
                  <span className="bg-[#72cdf4]/30 text-[#005581] text-[10px] px-2 py-0.5 rounded-full font-black">
                    {toFa(claims.filter((c) => c.reviewRoute === 'standard').length)}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedQueue('deep_review')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedQueue === 'deep_review'
                      ? 'bg-[#005581] text-white shadow-sm'
                      : 'bg-[#72cdf4]/20 text-[#005581] border border-[#72cdf4] hover:bg-[#72cdf4]/40'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-[#ffd200]" />
                  <span>صف بررسی دقیق (Deep Review) - ریسک بالا</span>
                  <span className="bg-[#ffd200] text-[#005581] text-[10px] px-2 py-0.5 rounded-full font-black">
                    {toFa(claims.filter((c) => c.reviewRoute === 'deep_review').length)}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Claims Queue List */}
                <div className="md:col-span-1 bg-[#fffffa] rounded-2xl p-4 border border-[#72cdf4] shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#72cdf4]">
                    <h2 className="text-xs font-bold text-[#005581] flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#005581]" />
                      <span>ادعاها در صف {selectedQueue.toUpperCase()}</span>
                    </h2>
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {queueClaims.map((claim) => (
                      <div
                        key={claim.id}
                        onClick={() => setSelectedClaimId(claim.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedClaimId === claim.id
                            ? 'bg-[#005581] text-white border-[#005581] shadow-sm'
                            : 'bg-[#fffffa] border-[#72cdf4] text-[#005581] hover:bg-[#72cdf4]/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{toFa(claim.claimNumber)}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              selectedClaimId === claim.id ? 'bg-[#ffe552] text-[#005581]' : 'bg-[#72cdf4]/30 text-[#005581]'
                            }`}
                          >
                            امتیاز ریسک: {toFa(claim.riskScore)}٪
                          </span>
                        </div>

                        <div className="text-xs font-bold">{claim.patientName}</div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            selectedClaimId === claim.id ? 'text-white/80' : 'text-[#005581]/70'
                          }`}
                        >
                          {claim.clinicName}
                        </div>

                        <div className="mt-2 pt-2 border-t border-current/20 flex justify-between items-center text-[10px]">
                          <span>تاریخ: {toFa(claim.serviceDate)}</span>
                          <span className="font-extrabold">
                            {toFa((claim.totalClaimedAmount / 10).toLocaleString('fa-IR'))} تومان
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Calculation & Action Card */}
                <div className="md:col-span-2 space-y-6">
                  {selectedClaim && (
                    <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-[#72cdf4]">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#005581]" />
                            <h2 className="text-base font-bold text-[#005581]">
                              ارزیابی ریسک داخلی پرونده {toFa(selectedClaim.claimNumber)}
                            </h2>
                          </div>
                          <p className="text-xs text-[#005581]/80 mt-1 font-medium">
                            محاسبه خودکار میزان ریسک سیستمی بر اساس موارد مالی، اسناد و انطباق تعرفه
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab('scrutiny')}
                          className="bg-[#005581] hover:bg-[#003d5c] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                        >
                          <span>بررسی مدارک (ورود به گام ۲)</span>
                          <ChevronLeft className="w-4 h-4 text-[#ffd200]" />
                        </button>
                      </div>

                      {/* Score display */}
                      {(() => {
                        const { finalScore, factors, calculatedQueue } = getRiskBreakdown(selectedClaim);
                        return (
                          <div className="space-y-4">
                            {/* Score & Clinic Trust Level Display */}
                            <div className="bg-[#72cdf4]/10 p-4 rounded-xl border border-[#72cdf4] space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="text-xs text-[#005581] font-bold">امتیاز ریسک محاسبه‌شده</div>
                                  <div className="text-2xl font-black text-[#005581] mt-0.5">
                                    {toFa(finalScore)} / {toFa('۱۰۰')}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="bg-[#005581] text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-[#ffe552]" />
                                    <span>سطح اعتماد کلینیک: L3 (اعتماد بالا)</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-[#005581]">روش بررسی:</span>
                                    <span className="bg-[#ffe552] text-[#005581] font-black text-xs px-3 py-1 rounded-lg border border-[#ffd200]">
                                      صف {calculatedQueue === 'express' ? 'سریع (Express)' : calculatedQueue === 'standard' ? 'استاندارد' : 'بررسی دقیق'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Automatic Clinic Trust Level Recalculation Status Display */}
                              <div className="pt-2 border-t border-[#72cdf4]/50 flex items-center justify-between gap-2">
                                <span className="text-[11px] text-[#005581]/80 font-bold">
                                  ارزیابی و تعیین خودکار سطح اعتماد سیستمی (بر اساس سوابق و قواعد):
                                </span>
                                <div className="bg-[#72cdf4]/20 border border-[#72cdf4] text-[#005581] text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-[#005581]" />
                                  <span>ارزیابی سطح اعتماد به صورت هوشمند انجام پذیرفته و برای مدیر در پنل ثبت می‌شود</span>
                                </div>
                              </div>
                            </div>

                            {/* Risk Factors Breakdown */}
                            <div className="space-y-2">
                              <h3 className="text-xs font-bold text-[#005581]">عوامل موثر در محاسبه ریسک:</h3>
                              <div className="space-y-2">
                                {factors.length === 0 ? (
                                  <div className="text-xs text-[#005581]/80 p-3 bg-[#fffffa] rounded-lg border border-[#72cdf4]">
                                    هیچ عامل ریسک بالایی برای این پرونده وجود ندارد و مستقیماً قابل بررسی سریع می‌باشد.
                                  </div>
                                ) : (
                                  factors.map((f, i) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-[#fffffa] rounded-xl border border-[#72cdf4] flex items-center justify-between text-xs"
                                    >
                                      <div>
                                        <span className="font-bold text-[#005581]">{f.label}:</span>
                                        <span className="text-[#005581]/80 mr-2 font-medium">{f.detail}</span>
                                      </div>
                                      <span className="bg-[#ffe552] text-[#005581] px-2 py-0.5 rounded font-black">
                                        +{toFa(f.score)}٪
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Claim Scrutiny & Capping - PATIENT STACKED INFO & CLICKABLE SHORTAGES */}
          {activeTab === 'scrutiny' && (
            <div className="space-y-6">
              <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] shadow-sm space-y-6">
                {/* Header Summary */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#72cdf4]">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckSquare className="w-6 h-6 text-[#005581]" />
                      <h2 className="text-base font-extrabold text-[#005581]">
                        بررسی مدارک و سقف بیمه - ادعای شماره {toFa(selectedClaim.claimNumber)}
                      </h2>
                    </div>

                    {/* PATIENT INFO STACKED VERTICALLY (اطلاعات بیمار زیر هم) */}
                    <div className="bg-[#72cdf4]/10 p-3.5 rounded-xl border border-[#72cdf4] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
                      <div className="space-y-0.5">
                        <span className="text-[#005581]/70 text-[10px] block font-bold">نام بیمار:</span>
                        <strong className="text-[#005581] font-bold text-xs">{selectedClaim.patientName}</strong>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[#005581]/70 text-[10px] block font-bold">کد ملی بیمار:</span>
                        <span className="text-[#005581] font-mono font-bold text-xs">{toFa(selectedClaim.patientNationalId || selectedClaim.nationalId)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[#005581]/70 text-[10px] block font-bold">نام کلینیک معالج:</span>
                        <span className="text-[#005581] font-bold text-xs">{selectedClaim.clinicName}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[#005581]/70 text-[10px] block font-bold">تاریخ ارائه خدمت:</span>
                        <span className="text-[#005581] font-bold text-xs">{toFa(selectedClaim.serviceDate || selectedClaim.dateOfService)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('medical_handover')}
                      className="bg-[#ffe552] hover:bg-[#ffd200] text-[#005581] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#ffd200] transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Stethoscope className="w-4 h-4 text-[#005581]" />
                      <span>ارجاع به بازبین پزشکی</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('decisions')}
                      className="bg-[#005581] hover:bg-[#003d5c] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Scale className="w-4 h-4 text-[#ffd200]" />
                      <span>ورود به ثبت نهایی کسورات</span>
                    </button>
                  </div>
                </div>

                {/* SUMMARY BOX OF SHORTAGES (خلاصه کسری‌ها - بدون متن طولانی و با قابلیت کلیک جهت هدایت) */}
                <div className="bg-[#ffd200]/20 border-2 border-[#ffd200] p-4 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-sm font-extrabold text-[#005581]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#005581]" />
                      <span>خلاصه موارد کسری و عدم انطباق پرونده (جهت مشاهده جزئیات روی هر مورد کلیک کنید)</span>
                    </div>
                    <span className="text-xs bg-[#005581] text-white px-2.5 py-0.5 rounded-full font-bold">
                      {toFa('۲')} مورد کسری
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Clickable Shortage Item 1 */}
                    <button
                      onClick={() => scrollToItem('ci-101')}
                      className="bg-[#fffffa] hover:bg-[#ffe552]/20 p-3 rounded-xl border border-[#ffd200] transition-all text-right flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-[#005581]" />
                        <div>
                          <div className="text-xs font-black text-[#005581]">
                            مغایرت سقف تعرفه (دندان {toFa('۱۶')} - عصب‌کشی)
                          </div>
                          <div className="text-[10px] text-[#005581]/80 font-medium">
                            کلیک کنید تا به ریز اقلام این خدمت هدایت شوید
                          </div>
                        </div>
                      </div>
                      <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-2.5 py-1 rounded-lg border border-[#ffd200] group-hover:scale-105 transition-transform">
                        {toFa('۵۰,۰۰۰')} تومان مازاد تعرفه ↵
                      </span>
                    </button>

                    {/* Clickable Shortage Item 2 */}
                    <button
                      onClick={() => scrollToItem('ci-102')}
                      className="bg-[#fffffa] hover:bg-[#ffe552]/20 p-3 rounded-xl border border-[#ffd200] transition-all text-right flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-[#005581]" />
                        <div>
                          <div className="text-xs font-black text-[#005581]">
                            عدم ثبت شماره بچ مواد مصرفی / بارکد
                          </div>
                          <div className="text-[10px] text-[#005581]/80 font-medium">
                            کلیک کنید تا به ریز اقلام این خدمت هدایت شوید
                          </div>
                        </div>
                      </div>
                      <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-2.5 py-1 rounded-lg border border-[#ffd200] group-hover:scale-105 transition-transform">
                        کسری مدرک ↵
                      </span>
                    </button>
                  </div>
                </div>

                {/* Detailed Line Items Table with Clear UX Indicators */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-[#005581] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#005581]" />
                    <span>بررسی ریز اقلام درمانی و مدارک پیوست‌شده همراه با اعلام کامل جزئیات مشکل:</span>
                  </h3>

                  <div className="space-y-4">
                    {(selectedClaim.items || []).map((item) => {
                      const hasOvershoot = item.claimedAmount > item.tariffAmount;
                      const diffAmount = item.claimedAmount - item.tariffAmount;

                      return (
                        <div
                          id={`item-${item.id}`}
                          key={item.id}
                          className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                            hasOvershoot
                              ? 'bg-[#ffe552]/10 border-[#ffd200]'
                              : 'bg-[#72cdf4]/10 border-[#72cdf4]'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-xl bg-[#005581] text-white flex items-center justify-center font-extrabold text-xs">
                                FDI {toFa(item.toothNumber)}
                              </span>
                              <div>
                                <div className="text-xs font-black text-[#005581]">
                                  {item.procedureTitle} ({item.surfaceDetail || 'کامل'})
                                </div>
                                <div className="text-[11px] text-[#005581]/80 font-medium">
                                  کد خدمت: {toFa(item.procedureCode)} | سهم پایه: {toFa(((item.baseShare || Math.round(item.tariffAmount * 0.3)) / 10).toLocaleString('fa-IR'))} تومان
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-bold">
                              <div>
                                <span className="text-[#005581]/70 block text-[10px]">تعرفه مصوب:</span>
                                <span>{toFa((item.tariffAmount / 10).toLocaleString('fa-IR'))} تومان</span>
                              </div>
                              <div>
                                <span className="text-[#005581]/70 block text-[10px]">مبلغ ادعا:</span>
                                <span className="text-[#005581] font-black">
                                  {toFa((item.claimedAmount / 10).toLocaleString('fa-IR'))} تومان
                                </span>
                              </div>

                              {hasOvershoot ? (
                                <span className="bg-[#ffd200] text-[#005581] px-3 py-1 rounded-xl text-xs font-black border border-[#ffd200]">
                                  دارای کسری / مغایرت
                                </span>
                              ) : (
                                <span className="bg-[#ffe552] text-[#005581] px-3 py-1 rounded-xl text-xs font-black">
                                  کامل و منطبق
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Full Detailed Explanation of the Problem */}
                          {hasOvershoot && (
                            <div className="bg-[#fffffa] p-3.5 rounded-xl border border-[#ffd200] text-xs space-y-1.5">
                              <div className="font-extrabold text-[#005581] flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-[#005581]" />
                                <span>توضیحات کامل مشکل و علت کسری:</span>
                              </div>
                              <p className="text-[#005581]/90 leading-relaxed font-medium">
                                کلینیک مبلغ {toFa((item.claimedAmount / 10).toLocaleString('fa-IR'))} تومان ثبت کرده است، اما طبق جدول تعرفه مصوب بیمه مرکزی (نسخه v2.1-2026)، سقف مجاز این خدمت {toFa((item.tariffAmount / 10).toLocaleString('fa-IR'))} تومان می‌باشد.{' '}
                                <strong className="text-[#005581] font-bold">
                                  مبلغ {toFa((diffAmount / 10).toLocaleString('fa-IR'))} تومان به عنوان مازاد تعرفه (+۳۰٪) شناسایی شده
                                </strong>{' '}
                                و در بخش ثبت نهایی کسورات اعمال خواهد شد.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Evidences Attachments Check */}
                <div className="space-y-3 pt-2 border-t border-[#72cdf4]">
                  <h3 className="text-xs font-bold text-[#005581]">وضعیت مدارک و شواهد ارسالی:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedClaim.evidences || []).map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-[#72cdf4]/10 p-3.5 rounded-xl border border-[#72cdf4] flex gap-3 items-center"
                      >
                        {ev.fileUrl || ev.url ? (
                          <img
                            src={ev.fileUrl || ev.url}
                            alt={ev.title}
                            className="w-16 h-16 object-cover rounded-xl border border-[#72cdf4]"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[#005581] text-white flex items-center justify-center rounded-xl text-xs font-bold">
                            فاکتور
                          </div>
                        )}
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-[#005581]">{ev.title}</div>
                          <div className="text-[10px] text-[#005581]/80">زمان بارگذاری: {toFa(ev.uploaded ? '۱۴۰۵/۰۵/۱۰' : 'بارگذاری نشده')}</div>
                          <div className="text-[10px] bg-[#ffe552] text-[#005581] px-2 py-0.5 rounded font-bold inline-block">
                            امتیاز وضوح هوش مصنوعی: {toFa(ev.aiQualityCheck?.clarityScore || 90)}٪
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-Treatment Authorization Certificate Card (تأییدیه پیش از درمان) */}
                <div className="bg-[#fffffa] p-4 rounded-2xl border-2 border-[#005581] space-y-3 shadow-md pt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#72cdf4] pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-[#005581]">
                      <FileCheck2 className="w-5 h-5 text-[#005581]" />
                      <span>تأییدیه پیش از درمان (Pre-Treatment Authorization Certificate)</span>
                    </div>
                    <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-2.5 py-1 rounded-full border border-[#ffd200]">
                      دارای مجوز ثبت‌شده پیش از شروع کار
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#005581]">
                    <div className="bg-[#72cdf4]/10 p-2.5 rounded-xl border border-[#72cdf4]/40">
                      <span className="text-[10px] block opacity-70 font-bold">شماره گواهی / پیگیری:</span>
                      <span className="font-black">{selectedClaim.preTreatmentAuth?.certificateNumber || selectedClaim.preAuthCertificateNumber || 'GOVAH-1405-9921'}</span>
                    </div>
                    <div className="bg-[#72cdf4]/10 p-2.5 rounded-xl border border-[#72cdf4]/40">
                      <span className="text-[10px] block opacity-70 font-bold">مبلغ مصوب بیمه:</span>
                      <span className="font-black text-emerald-800">
                        {toFa((selectedClaim.preTreatmentAuth?.approvedCoverageAmount || selectedClaim.totalApprovedAmount || 27000000).toLocaleString('fa-IR'))} ریال
                      </span>
                    </div>
                    <div className="bg-[#72cdf4]/10 p-2.5 rounded-xl border border-[#72cdf4]/40">
                      <span className="text-[10px] block opacity-70 font-bold">مهلت انجام درمان:</span>
                      <span className="font-black">{selectedClaim.preTreatmentAuth?.expiryDate || '۱۴۰۵/۰۶/۲۵ (۶۰ روز اعتبار)'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#005581]/80 font-medium">
                      خدمات مصوب شامل: {(selectedClaim.items || []).map((i) => `${i.procedureTitle} (دندان ${toFa(i.toothNumber)})`).join(' • ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPreAuthModal(true)}
                      className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <FileText className="w-4 h-4 text-[#ffe552]" />
                      <span>مشاهده کامل شناسنامه و جزئیات تأییدیه پیش از درمان</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Medical Review Handover */}
          {activeTab === 'medical_handover' && (
            <div className="space-y-6">
              <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#72cdf4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-6 h-6 text-[#005581]" />
                      <h2 className="text-base font-bold text-[#005581]">
                        ارجاع پرونده {toFa(selectedClaim.claimNumber)} به پزشک معتمد
                      </h2>
                    </div>
                    <p className="text-xs text-[#005581]/80 mt-1 font-medium">
                      خلاصه مدارک، تایید وجود تمام اسناد و ثبت نکات اختصاصی جهت بررسی کارشناسی بالینی
                    </p>
                  </div>

                  <span className="bg-[#ffe552] text-[#005581] text-xs px-3 py-1 rounded-full font-bold border border-[#ffd200]">
                    پزشک معتمد: دکتر حمید سجادی
                  </span>
                </div>

                {handoverSuccessMsg && (
                  <div className="bg-[#ffe552] text-[#005581] p-3 rounded-xl border border-[#ffd200] text-xs font-extrabold flex items-center gap-2 animate-pulse">
                    <CheckCircle2 className="w-5 h-5 text-[#005581]" />
                    <span>{handoverSuccessMsg}</span>
                  </div>
                )}

                {/* Document Summary & Checklist Confirmation */}
                <div className="bg-[#72cdf4]/10 p-4 rounded-xl border border-[#72cdf4] space-y-3">
                  <h3 className="text-xs font-bold text-[#005581] flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#005581]" />
                    <span>خلاصه مدارک و وضعیت کامل‌بودن پرونده جهت ارجاع پزشکی:</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-[#fffffa] rounded-lg border border-[#72cdf4]">
                      <span className="font-bold">شواهد رادیوگرافی (RVG/OPG):</span>
                      <span className="bg-[#ffe552] text-[#005581] px-2.5 py-0.5 rounded font-black text-[11px]">
                        موجود (وضوح {toFa('۹۵')}٪)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#fffffa] rounded-lg border border-[#72cdf4]">
                      <span className="font-bold">اطلاعات دندان‌ها و کدهای FDI:</span>
                      <span className="bg-[#ffe552] text-[#005581] px-2.5 py-0.5 rounded font-black text-[11px]">
                        تایید و ثبت‌شده
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#fffffa] rounded-lg border border-[#72cdf4]">
                      <span className="font-bold">نسخه پین‌شده قوانین بیمه‌ای:</span>
                      <span className="bg-[#72cdf4]/30 text-[#005581] px-2.5 py-0.5 rounded font-bold text-[11px]">
                        v2.1-2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specific Notes for Each Item/Document */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#005581]">ثبت نکات و ملاحظات لازم برای هر مدرک/خدمت:</h3>
                  <div className="space-y-3">
                    {(selectedClaim.items || []).map((item) => (
                      <div key={item.id} className="p-3.5 bg-[#fffffa] rounded-xl border border-[#72cdf4] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#005581]">
                            دندان {toFa(item.toothNumber)} - {item.procedureTitle} ({toFa(item.procedureCode)})
                          </span>
                          <span className="text-[10px] bg-[#72cdf4]/20 text-[#005581] px-2 py-0.5 rounded font-bold">
                            {toFa((item.claimedAmount / 10).toLocaleString('fa-IR'))} تومان
                          </span>
                        </div>

                        <input
                          type="text"
                          value={itemSpecificNotes[item.id] || ''}
                          onChange={(e) =>
                            setItemSpecificNotes({
                              ...itemSpecificNotes,
                              [item.id]: e.target.value,
                            })
                          }
                          placeholder="نکته اختصاصی برای پزشک معتمد بنویسید (مثلا کیفیت رادیوگرافی، نیاز به عکس مجدد و...)..."
                          className="w-full bg-white text-xs text-[#005581] p-2.5 rounded-lg border border-[#72cdf4] font-medium focus:ring-2 focus:ring-[#72cdf4]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handover Decision Selector (تأیید کامل / تأیید جزئی) */}
                <div className="bg-[#72cdf4]/10 p-4 rounded-2xl border border-[#72cdf4] space-y-3">
                  <h3 className="text-xs font-black text-[#005581]">نوع نظریه اولیه بازبین قبل از ارجاع پزشکی:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMedicalHandoverDecision('approved')}
                      className={`p-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                        medicalHandoverDecision === 'approved'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                          : 'bg-[#fffffa] text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                      <span>تأیید کامل (جهت ارزیابی اولیه پزشکی)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMedicalHandoverDecision('partially_approved')}
                      className={`p-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                        medicalHandoverDecision === 'partially_approved'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                          : 'bg-[#fffffa] text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/20'
                      }`}
                    >
                      <Scale className="w-4 h-4 text-[#ffd200]" />
                      <span>تأیید جزئی (همراه با مشخص نمودن موارد مشکوک)</span>
                    </button>
                  </div>
                </div>

                {/* Handover Note Text Area */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#005581]">
                    توضیحات کلی و ابهامات بالینی بازبین جهت ارسال به پزشک معتمد:
                  </label>
                  <textarea
                    value={handoverNote}
                    onChange={(e) => setHandoverNote(e.target.value)}
                    placeholder="توضیحات عمومی خود درباره پرونده جهت بررسی بالینی را یادداشت نمایید..."
                    className="w-full bg-white text-xs text-[#005581] p-3 rounded-xl border border-[#72cdf4] font-medium h-20 focus:ring-2 focus:ring-[#72cdf4]"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSendToMedicalReviewer}
                    className="bg-[#005581] hover:bg-[#003d5c] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 text-[#ffd200]" />
                    <span>ارسال رسمی پرونده به پزشک معتمد</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ثبت نهایی کسورات (Final Deductions Registration) */}
          {activeTab === 'decisions' && (
            <div className="space-y-6">
              <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#72cdf4]">
                  <div>
                    <h2 className="text-base font-black text-[#005581]">
                      ثبت نهایی کسورات - ادعای شماره {toFa(selectedClaim.claimNumber)}
                    </h2>
                    <p className="text-xs text-[#005581]/80 mt-1 font-medium">
                      مشاهده ریز کسری‌ها بر اساس گام قبلی، ویرایش کد کسورات، انتخاب رای نهایی و امضای دیجیتال
                    </p>
                  </div>

                  {/* Active/Verified Certificate Badge */}
                  <div className="bg-[#ffe552]/30 px-3 py-1.5 rounded-xl border border-[#ffd200] flex items-center gap-2 text-xs font-bold text-[#005581]">
                    <Award className="w-4 h-4 text-[#005581]" />
                    <span>گواهی دیجیتال: <strong className="text-emerald-700">فعال / Active & Verified</strong></span>
                  </div>
                </div>

                {/* Read-Only Status Banner if already signed */}
                {signedClaimsMap[selectedClaim.id] && (
                  <div className="bg-[#005581] text-white p-4 rounded-2xl border-2 border-[#ffd200] text-xs font-black flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#ffd200]" />
                      <span>این ادعا با امضای دیجیتال معتبر و غیرقابل تغییر ثبت نهایی و قفل (Read-Only) گردید.</span>
                    </div>
                    <span className="font-mono bg-[#003d5c] px-3 py-1 rounded text-[#ffd200] text-[11px] border border-[#72cdf4]">
                      {selectedClaim.reviewDecision?.digitalSignatureHash || '0x8f2a9d12e84c9103'}
                    </span>
                  </div>
                )}

                {finalDecisionSuccessMsg && (
                  <div className="bg-[#ffe552] text-[#005581] p-4 rounded-2xl border border-[#ffd200] text-xs font-black flex items-center gap-2 shadow-sm animate-pulse">
                    <CheckCircle2 className="w-5 h-5 text-[#005581]" />
                    <span>{finalDecisionSuccessMsg}</span>
                  </div>
                )}

                {/* DETAILED DEDUCTION ITEMS LIST (لیست مرتب و شفاف کسورات و تعرفه) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#005581]" />
                    <span>جدول انطباق تعرفه مصوب و تنظیم کسورات توسط بازبین:</span>
                  </h3>

                  <div className="space-y-4">
                    {(selectedClaim.items || []).map((item) => {
                      const hasOvershoot = item.claimedAmount > item.tariffAmount;
                      const diff = item.claimedAmount - item.tariffAmount;

                      return (
                        <div
                          key={item.id}
                          className="bg-[#fffffa] p-4 rounded-2xl border-2 border-[#72cdf4] space-y-3.5 shadow-sm"
                        >
                          {/* Item Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#72cdf4]">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#005581] text-white font-black text-xs px-2.5 py-1 rounded-lg">
                                دندان {toFa(item.toothNumber)}
                              </span>
                              <span className="text-xs font-black text-[#005581]">{item.procedureTitle}</span>
                              <span className="text-[11px] bg-[#72cdf4]/30 text-[#005581] font-mono px-2 py-0.5 rounded font-bold">
                                کد: {toFa(item.procedureCode)}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-[#005581]">
                              سهم بیمه پایه: {toFa(((item.baseShare || Math.round(item.tariffAmount * 0.7)) / 10).toLocaleString('fa-IR'))} تومان
                            </span>
                          </div>

                          {/* Clean Tariff Metrics Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#72cdf4]/10 rounded-xl border border-[#72cdf4] text-xs font-bold text-[#005581]">
                            <div className="bg-white p-2.5 rounded-lg border border-[#72cdf4]/60 space-y-0.5">
                              <span className="text-[10px] text-[#005581]/70 block font-bold">مبلغ ادعاشده (ریال/تومان):</span>
                              <span className="text-[#005581] font-black text-sm">
                                {toFa((item.claimedAmount / 10).toLocaleString('fa-IR'))} تومان
                              </span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-[#72cdf4]/60 space-y-0.5">
                              <span className="text-[10px] text-[#005581]/70 block font-bold">تعرفه مصوب بیمه:</span>
                              <span className="text-emerald-700 font-black text-sm">
                                {toFa((item.tariffAmount / 10).toLocaleString('fa-IR'))} تومان
                              </span>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-[#72cdf4]/60 space-y-0.5">
                              <span className="text-[10px] text-[#005581]/70 block font-bold">میزان مازاد / کسری تعرفه:</span>
                              <span className={`font-black text-sm ${hasOvershoot ? 'text-rose-600' : 'text-[#005581]'}`}>
                                {hasOvershoot ? `${toFa((diff / 10).toLocaleString('fa-IR'))} تومان` : 'بدون کسری'}
                              </span>
                            </div>
                          </div>

                          {/* Deduction Code & Notes Inputs with spacious spacing */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2 border-t border-[#72cdf4]/40">
                            <div className="space-y-2.5">
                              <label className="font-black text-[#005581] block">کد و علت رسمی کسورات بیمه:</label>
                              <select
                                disabled={signedClaimsMap[selectedClaim.id]}
                                value={itemDeductionCodes[item.id] || (hasOvershoot ? 'TARIFF_EXCEEDED' : 'DOCUMENTATION_MISSING')}
                                onChange={(e) =>
                                  setItemDeductionCodes({
                                    ...itemDeductionCodes,
                                    [item.id]: e.target.value as DeductionReasonCode,
                                  })
                                }
                                className="w-full bg-white text-xs text-[#005581] p-3 rounded-xl border border-[#72cdf4] font-bold shadow-sm disabled:bg-gray-100 focus:ring-2 focus:ring-[#005581]"
                              >
                                <option value="TARIFF_EXCEEDED">کد ۱۰۱: کسر مغایرت با سقف تعرفه مصوب</option>
                                <option value="DOCUMENTATION_MISSING">کد ۱۰۲: کسر نقص مدارک و عدم ارائه کلیشه RVG</option>
                                <option value="MEDICAL_UNNECESSARY">کد ۱۰۳: عدم تایید ضرورت بالینی توسط بازبین</option>
                                <option value="DUP_CLAIM">کد ۱۰۴: ادعای تکراری در سامانه</option>
                              </select>
                            </div>

                            <div className="space-y-2.5">
                              <label className="font-black text-[#005581] block">توضیحات کسری جهت درج در گزارش کلینیک:</label>
                              <input
                                type="text"
                                disabled={signedClaimsMap[selectedClaim.id]}
                                value={itemDeductionNotes[item.id] || (hasOvershoot ? `مازاد تعرفه به میزان ${toFa((diff/10).toLocaleString('fa-IR'))} تومان` : 'مطابق ضوابط')}
                                onChange={(e) =>
                                  setItemDeductionNotes({
                                    ...itemDeductionNotes,
                                    [item.id]: e.target.value,
                                  })
                                }
                                className="w-full bg-white text-xs text-[#005581] p-3 rounded-xl border border-[#72cdf4] font-medium shadow-sm disabled:bg-gray-100 focus:ring-2 focus:ring-[#005581]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OVERALL DECISION SELECTION (تعیین رای نهایی: رد جزئی / رد کامل) */}
                <div className="bg-[#72cdf4]/10 p-5 rounded-2xl border border-[#72cdf4] space-y-4">
                  <h3 className="text-xs font-black text-[#005581]">تعیین رای و نظر نهایی بازبین برای کل پرونده:</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      disabled={signedClaimsMap[selectedClaim.id]}
                      onClick={() => setOverallDecision('partially_approved')}
                      className={`p-3.5 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                        overallDecision === 'partially_approved'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                          : 'bg-[#fffffa] text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/20'
                      }`}
                    >
                      <Scale className="w-4 h-4 text-[#ffd200]" />
                      <span>رد جزئی (تأیید با اعمال کسورات)</span>
                    </button>

                    <button
                      type="button"
                      disabled={signedClaimsMap[selectedClaim.id]}
                      onClick={() => setOverallDecision('rejected')}
                      className={`p-3.5 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                        overallDecision === 'rejected'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                          : 'bg-[#fffffa] text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/20'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-[#ffd200]" />
                      <span>رد کامل</span>
                    </button>
                  </div>

                  {/* General Decision Note */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#005581]">جمع‌بندی و توضیحات پایانی رای بازبین:</label>
                    <textarea
                      disabled={signedClaimsMap[selectedClaim.id]}
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      className="w-full bg-white text-xs text-[#005581] p-3 rounded-xl border border-[#72cdf4] font-medium h-20 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                {!signedClaimsMap[selectedClaim.id] && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleInitiateFinalDecision}
                      className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-[#ffd200]" />
                      <span>ثبت نهایی و امضای دیجیتال غیرقابل تغییر</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: Appeals Re-Review (پنل جامع مدیریت اعتراضات کلینیک‌ها) */}
          {activeTab === 'appeals' && (
            <div className="space-y-6">
              <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] shadow-sm space-y-6">
                {/* Header & Clinic Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#72cdf4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-[#005581]" />
                      <h2 className="text-base font-black text-[#005581]">
                        مدیریت و تجدیدنظر اعتراضات کلینیک‌ها (Re-Review Panel)
                      </h2>
                    </div>
                    <p className="text-xs text-[#005581]/80 mt-1 font-medium">
                      بررسی لایحه‌های اعتراض، تصاویر جدید، مدارک بیمار و اتخاذ رای مجدد با کمک هوش مصنوعی
                    </p>
                  </div>

                  {/* CLINIC SEGMENTATION / FILTER (تفکیک کلینیک‌ها) */}
                  <div className="flex items-center gap-2 bg-[#72cdf4]/10 p-2 rounded-xl border border-[#72cdf4]">
                    <Building2 className="w-4 h-4 text-[#005581]" />
                    <span className="text-xs font-bold text-[#005581]">کلینیک:</span>
                    <select
                      value={selectedClinicFilter}
                      onChange={(e) => setSelectedClinicFilter(e.target.value)}
                      className="bg-white text-xs text-[#005581] font-bold py-1.5 px-3 rounded-lg border border-[#72cdf4] focus:ring-2 focus:ring-[#72cdf4]"
                    >
                      <option value="all">همه کلینیک‌ها ({toFa(allAppeals.length)} اعتراض)</option>
                      {uniqueClinics.map((clinic, idx) => (
                        <option key={idx} value={clinic}>
                          {clinic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {appealDecisionSuccessMsg && (
                  <div className="bg-[#ffe552] text-[#005581] p-4 rounded-2xl border border-[#ffd200] text-xs font-black flex items-center gap-2 animate-pulse shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#005581]" />
                    <span>{appealDecisionSuccessMsg}</span>
                  </div>
                )}

                {/* Appeals List */}
                {filteredAppeals.length === 0 ? (
                  <div className="p-8 text-center bg-[#72cdf4]/10 rounded-2xl border border-[#72cdf4] text-xs font-bold text-[#005581]">
                    هیچ اعتراضی برای کلینیک انتخاب‌شده ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAppeals.map((appeal) => {
                      const isDetailActive = activeAppealDetailId === appeal.id;

                      return (
                        <div
                          key={appeal.id}
                          className={`rounded-2xl border-2 transition-all p-5 space-y-5 ${
                            appeal.status === 'accepted'
                              ? 'bg-emerald-50/50 border-emerald-300'
                              : appeal.status === 'rejected'
                              ? 'bg-rose-50/50 border-rose-300'
                              : 'bg-[#fffffa] border-[#72cdf4] shadow-sm'
                          }`}
                        >
                          {/* Top Bar: Clinic Info & Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#72cdf4]/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#005581] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                <Building2 className="w-5 h-5 text-[#ffe552]" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-[#005581] flex items-center gap-2">
                                  <span>{appeal.clinicName}</span>
                                  <span className="text-[10px] bg-[#72cdf4]/30 px-2 py-0.5 rounded text-[#005581] font-bold">
                                    {appeal.branchName}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#005581]/70 font-medium mt-0.5">
                                  کد اعتراض: <strong className="font-mono text-[#005581]">{toFa(appeal.id)}</strong> | تاریخ ارسال: {toFa(appeal.createdAt)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {appeal.status === 'pending' && (
                                <span className="bg-[#ffe552] text-[#005581] text-xs px-3 py-1 rounded-full font-black border border-[#ffd200] flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-[#005581]" />
                                  <span>در حال بررسی تجدیدنظر</span>
                                </span>
                              )}
                              {appeal.status === 'accepted' && (
                                <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-black flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  <span>تأییدشده و تعدیل رای</span>
                                </span>
                              )}
                              {appeal.status === 'rejected' && (
                                <span className="bg-rose-600 text-white text-xs px-3 py-1 rounded-full font-black flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5 text-white" />
                                  <span>رد اعتراض</span>
                                </span>
                              )}

                              <button
                                onClick={() => setActiveAppealDetailId(isDetailActive ? null : appeal.id)}
                                className="bg-[#005581] text-white hover:bg-[#003d5c] text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isDetailActive ? 'بستن جزئیات' : 'مشاهده پرونده کامل'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Patient & Claim Metadata Strip with Clinic Trust Level */}
                          <div className="bg-[#72cdf4]/10 p-3.5 rounded-xl border border-[#72cdf4] grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                            <div>
                              <span className="text-[#005581]/70 block text-[10px] font-bold">نام بیمار:</span>
                              <strong className="text-[#005581] font-bold">{appeal.patientName}</strong>
                            </div>
                            <div>
                              <span className="text-[#005581]/70 block text-[10px] font-bold">کد ملی بیمار:</span>
                              <span className="font-mono text-[#005581] font-bold">{toFa(appeal.patientNationalId)}</span>
                            </div>
                            <div>
                              <span className="text-[#005581]/70 block text-[10px] font-bold">سطح اعتماد کلینیک:</span>
                              <span className="bg-[#005581] text-white text-[10px] font-black px-2 py-0.5 rounded inline-block mt-0.5">
                                L3 (اعتماد بالا)
                              </span>
                            </div>
                            <div>
                              <span className="text-[#005581]/70 block text-[10px] font-bold">شماره پرونده ادعا:</span>
                              <span className="font-mono text-[#005581] font-bold">{toFa(appeal.claimNumber)}</span>
                            </div>
                            <div>
                              <span className="text-[#005581]/70 block text-[10px] font-bold">پزشک معالج:</span>
                              <span className="text-[#005581] font-bold">{appeal.dentistName}</span>
                            </div>
                          </div>

                          {/* Summary Rationale snippet when collapsed */}
                          {!isDetailActive && (
                            <div className="p-3 bg-[#fffffa] rounded-xl border border-[#72cdf4] text-xs text-[#005581] font-medium line-clamp-2 shadow-inner">
                              <strong className="font-bold text-[#005581]">خلاصه لایحه اعتراض: </strong>
                              «{appeal.reason}»
                            </div>
                          )}

                          {/* EXPANDED CLAIM DETAILS DRAWER WHEN isDetailActive IS TRUE */}
                          {isDetailActive && (
                            <div className="bg-[#fffffa] p-4 rounded-xl border-2 border-[#005581] space-y-4 animate-fadeIn">
                              <div className="flex items-center justify-between pb-2 border-b border-[#72cdf4]">
                                <h4 className="text-xs font-black text-[#005581] flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#005581]" />
                                  <span>ریز خدمات و اقلام ادعاشده در این پرونده (اطلاعات کامل):</span>
                                </h4>
                                <span className="text-[10px] bg-[#005581] text-white px-2 py-0.5 rounded font-bold">
                                  تاریخ خدمت: {toFa(appeal.serviceDate)}
                                </span>
                              </div>

                              {/* Items Table */}
                              <div className="space-y-2">
                                {(appeal.items || []).map((item) => (
                                  <div
                                    key={item.id}
                                    className="p-3 bg-[#72cdf4]/10 rounded-lg border border-[#72cdf4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2 font-bold text-[#005581]">
                                      <span className="bg-[#005581] text-white text-[10px] px-2 py-0.5 rounded">
                                        دندان {toFa(item.toothNumber)}
                                      </span>
                                      <span>{item.procedureTitle}</span>
                                      <span className="text-[10px] text-[#005581]/70 font-mono">({toFa(item.procedureCode)})</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold text-[#005581]">
                                      <span>مبلغ ادعا: {toFa((item.claimedAmount / 10).toLocaleString('fa-IR'))} تومان</span>
                                      <span>تعرفه: {toFa((item.tariffAmount / 10).toLocaleString('fa-IR'))} تومان</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Evidences */}
                              {appeal.evidences && appeal.evidences.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-[#72cdf4]">
                                  <span className="text-xs font-bold text-[#005581] block">شواهد و عکس‌های رادیوگرافی اولیه:</span>
                                  <div className="grid grid-cols-2 gap-2">
                                    {appeal.evidences.map((ev) => (
                                      <div key={ev.id} className="p-2 bg-[#72cdf4]/20 rounded-lg flex items-center gap-2 text-xs">
                                        {(ev.fileUrl || ev.url) && (
                                          <img src={ev.fileUrl || ev.url} alt={ev.title} className="w-12 h-12 object-cover rounded border border-[#72cdf4]" />
                                        )}
                                        <div>
                                          <div className="font-bold text-[#005581]">{ev.title}</div>
                                          <div className="text-[10px] text-[#005581]/80">وضوح AI: {toFa(ev.aiQualityCheck?.clarityScore || 90)}٪</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Rationale & Evidence Section */}
                              <div className="space-y-3 pt-2 border-t border-[#72cdf4]">
                                <div className="space-y-1.5">
                                  <span className="text-xs font-black text-[#005581] flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-[#005581]" />
                                    <span>متن کامل لایحه اعتراض کلینیک:</span>
                                  </span>
                                  <div className="p-3.5 bg-[#fffffa] rounded-xl border border-[#72cdf4] text-xs text-[#005581] font-medium leading-relaxed shadow-inner">
                                    «{appeal.reason}»
                                  </div>
                                </div>

                                {/* Attached Evidence Images */}
                                {appeal.additionalEvidenceUrls && appeal.additionalEvidenceUrls.length > 0 && (
                                  <div className="space-y-2 pt-1">
                                    <span className="text-xs font-black text-[#005581] flex items-center gap-1.5">
                                      <Sparkles className="w-4 h-4 text-[#005581]" />
                                      <span>مدارک و تصاویر رادیوگرافی جدید بارگذاری‌شده برای اعتراض:</span>
                                    </span>

                                    <div className="flex flex-wrap gap-3">
                                      {appeal.additionalEvidenceUrls.map((url, imgIdx) => (
                                        <div
                                          key={imgIdx}
                                          className="group relative bg-[#fffffa] rounded-xl p-2 border border-[#72cdf4] space-y-1 shadow-sm hover:border-[#005581] transition-all"
                                        >
                                          <img
                                            src={url}
                                            alt={`Evidence ${imgIdx + 1}`}
                                            className="w-32 h-24 object-cover rounded-lg border border-[#72cdf4] group-hover:scale-105 transition-transform"
                                          />
                                          <div className="text-[10px] font-bold text-[#005581] text-center">
                                            کلیشه ضمیمه {toFa(imgIdx + 1)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* AI Copilot Assistance in Section 5 */}
                              <div className="bg-[#ffe552]/20 border-2 border-[#ffd200] p-4 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#005581]" />
                                    <span className="text-xs font-black text-[#005581]">
                                      تحلیل هوشمند AI Copilot برای این اعتراض:
                                    </span>
                                  </div>
                                  <span className="bg-[#005581] text-[#ffe552] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    انطباق با v2.1-2026
                                  </span>
                                </div>

                                <p className="text-xs text-[#005581]/90 leading-relaxed font-medium">
                                  بر اساس بررسی خودکار رادیوگرافی RVG جدید و شناسه بچ ماده مصرفی، ادعای کلینیک با بخشنامه الحاقیه ماده ۵ منطبق است. پیشنهاد می‌شود اعتراض را پذیرفته و پرونده را به بخش ۳ (ارجاع به بازبین پزشکی) هدایت نمایید.
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setAppealRejectionReason(
                                      'طبق آئین‌نامه v2.1-2026 و بررسی تصاویر RVG ضمیمه‌شده، مدارک تکمیلی کافی نمی‌باشد.'
                                    )
                                  }
                                  className="text-[11px] font-bold text-[#005581] underline hover:text-[#003d5c] pt-1 block cursor-pointer"
                                >
                                  + درج خودکار متن پاسخ پیشنهادی رد اعتراض توسط هوش مصنوعی
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Action Controls */}
                          {appeal.status === 'pending' && (
                            <div className="pt-3 border-t border-[#72cdf4]/60 space-y-3">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                {/* Approve Appeal -> Transfers to Section 3 */}
                                <button
                                  onClick={() => handleApproveAppeal(appeal.claimId, appeal.id)}
                                  className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                                  <span>تأیید اعتراض و انتقال به بخش سه (ارجاع به بازبین پزشکی)</span>
                                </button>
                              </div>

                              {/* Reject Appeal with Reason Input */}
                              <div className="space-y-1.5 bg-[#fffffa] p-3 rounded-xl border border-[#72cdf4]">
                                <label className="text-xs font-black text-[#005581] block">
                                  دلیل رد اعتراض (الزامی در صورت عدم پذیرش):
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={appealRejectionReason}
                                    onChange={(e) => setAppealRejectionReason(e.target.value)}
                                    placeholder="علت رد اعتراض کلینیک را با استناد به قوانین بنویسید..."
                                    className="flex-1 bg-white text-xs text-[#005581] p-2.5 rounded-xl border border-[#72cdf4] font-medium focus:ring-2 focus:ring-[#72cdf4]"
                                  />
                                  <button
                                    onClick={() => handleRejectAppeal(appeal.claimId, appeal.id)}
                                    className="bg-[#ffe552] hover:bg-[#ffd200] text-[#005581] font-black text-xs px-5 py-2.5 rounded-xl border border-[#ffd200] transition-all whitespace-nowrap shadow-sm cursor-pointer"
                                  >
                                    رد رسمی اعتراض
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 6: Audit Logs (دفترچه حسابرسی دست‌نخورده همراه با تمام جزئیات) */}
          {activeTab === 'audit_log' && (
            <div className="space-y-6">
              <div className="bg-[#fffffa] rounded-2xl p-6 border border-[#72cdf4] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#72cdf4]">
                  <div>
                    <h2 className="text-base font-black text-[#005581]">
                      دفترچه حسابرسی دست‌نخورده و غیرقابل تغییر
                    </h2>
                    <p className="text-xs text-[#005581]/80 mt-1 font-medium">
                      ثبت تمام تصمیمات، ارجاعات و کسورات به صورت هش‌شده غیرقابل تغییر همراه با نسخه قاعده، نسخه مدل AI و نام بازبین
                    </p>
                  </div>
                  <Lock className="w-6 h-6 text-[#005581]" />
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-[#72cdf4]/10 rounded-2xl border border-[#72cdf4] space-y-2 text-xs">
                      {/* Top Row: Action & Timestamp */}
                      <div className="flex items-center justify-between font-black text-[#005581]">
                        <span className="flex items-center gap-2">
                          <History className="w-4 h-4 text-[#005581]" />
                          <span>نوع اقدام: {toFa(log.action)}</span>
                          <span className="bg-[#005581] text-white text-[10px] font-mono px-2 py-0.5 rounded">
                            {toFa(log.entityId)}
                          </span>
                        </span>
                        <span className="text-[11px] text-[#005581]/80 font-bold">{toFa(log.timestamp)}</span>
                      </div>

                      {/* Details Text */}
                      <div className="text-[#005581] font-medium bg-[#fffffa] p-3 rounded-xl border border-[#72cdf4]/60 leading-relaxed">
                        {log.details}
                      </div>

                      {/* Full Metadata Grid (ورژن قاعده، ورژن مدل، نام بازبین، هش WORM) */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-[#72cdf4]/50 text-[10px] font-bold">
                        <div className="bg-[#fffffa] p-2 rounded-lg border border-[#72cdf4]/50">
                          <span className="text-[#005581]/70 block">بازبین ثبت‌کننده:</span>
                          <span className="text-[#005581] font-black">{log.userName || (log as any).actorName || 'مریم عباسی'}</span>
                        </div>

                        <div className="bg-[#fffffa] p-2 rounded-lg border border-[#72cdf4]/50">
                          <span className="text-[#005581]/70 block">نسخه قاعده پین‌شده:</span>
                          <span className="text-[#005581] font-bold">{log.ruleVersion || 'v2.1-2026'}</span>
                        </div>

                        <div className="bg-[#fffffa] p-2 rounded-lg border border-[#72cdf4]/50">
                          <span className="text-[#005581]/70 block">مدل هوش مصنوعی:</span>
                          <span className="text-[#005581] font-bold">{log.aiModelVersion || 'Dentura-AI-v3.4'}</span>
                        </div>

                        <div className="bg-[#fffffa] p-2 rounded-lg border border-[#72cdf4]/50 flex flex-col justify-center">
                          <span className="text-[#005581]/70 block">هش امضای غیرقابل تغییر:</span>
                          <span className="font-mono text-[#005581] text-[9px] truncate">
                            {log.wormVerifiedHash || (log as any).hashWORM || '0x8f2a9d12e84c9103'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRE-TREATMENT AUTHORIZATION FULL CERTIFICATE MODAL */}
      {showPreAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fffffa] rounded-3xl p-6 sm:p-8 border-2 border-[#005581] max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#005581] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#005581] text-[#ffe552] rounded-2xl shadow-md">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#005581]">
                    گواهی و شناسنامه رسمی تأییدیه پیش از درمان (Pre-Treatment Authorization)
                  </h3>
                  <p className="text-xs text-[#005581]/80 font-medium">
                    مستند رسمی مصوب سازمان بیمه‌گر صادرشده قبل از شروع فرآیند درمان
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreAuthModal(false)}
                className="bg-[#72cdf4]/20 hover:bg-[#72cdf4]/40 text-[#005581] p-2 rounded-xl transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Official Badge & Header Bar */}
            <div className="bg-[#005581] text-white p-4 rounded-2xl shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#72cdf4] font-bold block">سازمان بیمه‌گر صادرکننده:</span>
                <span className="text-sm font-black text-[#ffe552]">
                  {selectedClaim.preTreatmentAuth?.insurerName || ((selectedClaim.primaryInsurerName || 'بیمه سامان') + ' / ' + (selectedClaim.supplementaryInsurerName || 'تکمیلی'))}
                </span>
              </div>
              <div className="text-left sm:text-left">
                <span className="text-[10px] text-[#72cdf4] font-bold block">کد مرجع / شماره پیگیری بیمه‌گر:</span>
                <span className="text-xs font-mono font-black text-white">
                  {selectedClaim.preTreatmentAuth?.trackingCode || 'REF-IR-8821940-AUTH'}
                </span>
              </div>
            </div>

            {/* SECTION 1: شناسنامه و هویتی بیمار */}
            <div className="bg-white p-4.5 rounded-2xl border-2 border-[#72cdf4] space-y-3">
              <h4 className="text-xs font-black text-[#005581] flex items-center gap-2 border-b border-[#72cdf4]/50 pb-2">
                <User className="w-4 h-4 text-[#005581]" />
                <span>۱. شناسنامه و هویتی بیمار</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-[#005581]">
                <div>
                  <span className="text-[10px] opacity-75 block font-bold">نام و نام خانوادگی بیمار:</span>
                  <span className="font-black text-sm">{selectedClaim.patientName}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-75 block font-bold">کد ملی بیمار:</span>
                  <span className="font-mono font-black">{selectedClaim.patientNationalId || selectedClaim.nationalId}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-75 block font-bold">شماره بیمه‌نامه (پایه/تکمیلی):</span>
                  <span className="font-mono font-black">{selectedClaim.preTreatmentAuth?.policyNumber || 'POL-99281-2026'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: جزئیات خدمات تأییدشده پیش از آغاز کار */}
            <div className="bg-white p-4.5 rounded-2xl border-2 border-[#72cdf4] space-y-3">
              <h4 className="text-xs font-black text-[#005581] flex items-center gap-2 border-b border-[#72cdf4]/50 pb-2">
                <Stethoscope className="w-4 h-4 text-[#005581]" />
                <span>۲. جزئیات خدمات تأییدشده (پیش از آغاز کار)</span>
              </h4>
              <div className="space-y-2">
                {(selectedClaim.preTreatmentAuth?.approvedServices || [
                  {
                    serviceCode: 'END-3C',
                    serviceTitle: 'درمان ریشه (عصب‌کشی ۳ کاناله)',
                    toothNumber: 16,
                    approvedAmount: 12000000,
                    coveragePercentage: 90,
                  },
                  {
                    serviceCode: 'CRN-PFM',
                    serviceTitle: 'روکش سرامیکی PFM تاج دندان',
                    toothNumber: 16,
                    approvedAmount: 15000000,
                    coveragePercentage: 80,
                  },
                ]).map((srv: any, idx: number) => (
                  <div key={idx} className="bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-black text-[#005581]">
                        کد خدمت: {srv.serviceCode} • {srv.serviceTitle}
                      </div>
                      <div className="text-[10px] text-[#005581]/80 mt-0.5">
                        شماره دندان (استاندارد FDI): <span className="font-black bg-[#ffe552] text-[#005581] px-1.5 py-0.5 rounded border border-[#ffd200]">دندان {toFa(srv.toothNumber || 16)}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] opacity-75 block font-bold">مبلغ مصوب:</span>
                      <span className="font-black text-emerald-800">{toFa(srv.approvedAmount.toLocaleString('fa-IR'))} ریال ({toFa(srv.coveragePercentage)}٪ پوشش)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: سقف تعهدات و مبلغ مصوب بیمه */}
            <div className="bg-white p-4.5 rounded-2xl border-2 border-[#72cdf4] space-y-3">
              <h4 className="text-xs font-black text-[#005581] flex items-center gap-2 border-b border-[#72cdf4]/50 pb-2">
                <CreditCard className="w-4 h-4 text-[#005581]" />
                <span>۳. سقف تعهدات و مبلغ مصوب بیمه</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#005581]">
                <div className="bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4]/50">
                  <span className="text-[10px] opacity-75 block font-bold">سقف کل تعهدات مصوب:</span>
                  <span className="font-black text-sm text-[#005581]">
                    {toFa((selectedClaim.preTreatmentAuth?.maxCoverageLimit || 35000000).toLocaleString('fa-IR'))} ریال
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300">
                  <span className="text-[10px] text-emerald-900 block font-bold">مبلغ متقبل‌شده توسط بیمه:</span>
                  <span className="font-black text-sm text-emerald-800">
                    {toFa((selectedClaim.preTreatmentAuth?.approvedCoverageAmount || selectedClaim.totalApprovedAmount || 27000000).toLocaleString('fa-IR'))} ریال
                  </span>
                </div>
                <div className="bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4]/50">
                  <span className="text-[10px] opacity-75 block font-bold">درصد پوشش میانگین:</span>
                  <span className="font-black text-sm text-[#005581]">٪۸۵ کل هزینه مصوب</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: تاریخ اعتبار گواهینامه */}
            <div className="bg-white p-4.5 rounded-2xl border-2 border-[#72cdf4] space-y-3">
              <h4 className="text-xs font-black text-[#005581] flex items-center gap-2 border-b border-[#72cdf4]/50 pb-2">
                <Calendar className="w-4 h-4 text-[#005581]" />
                <span>۴. تاریخ اعتبار گواهینامه و مهلت ارسال ادعا</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#005581]">
                <div>
                  <span className="text-[10px] opacity-75 block font-bold">تاریخ صدور گواهی:</span>
                  <span className="font-black">{selectedClaim.preTreatmentAuth?.issuanceDate || '۱۴۰۵/۰۴/۲۵'}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-75 block font-bold">تاریخ انقضا و بازه زمانی مجاز:</span>
                  <span className="font-black text-amber-800">{selectedClaim.preTreatmentAuth?.expiryDate || '۱۴۰۵/۰۶/۲۵ (۶۰ روز اعتبار انجام درمان)'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 5: مهر و مستندات سیستمی/کاغذی بیمه‌گر */}
            <div className="bg-[#fffffa] p-4.5 rounded-2xl border-2 border-[#005581] space-y-3">
              <h4 className="text-xs font-black text-[#005581] flex items-center gap-2 border-b border-[#72cdf4] pb-2">
                <Building2 className="w-4 h-4 text-[#005581]" />
                <span>۵. مهر و مستندات سیستمی / کاغذی بیمه‌گر</span>
              </h4>
              <div className="space-y-2 text-xs text-[#005581]">
                <div className="flex justify-between items-center py-1 border-b border-[#72cdf4]/40">
                  <span className="font-bold">مرجع صادرکننده:</span>
                  <span className="font-black">{selectedClaim.preTreatmentAuth?.issuingBranch || 'شعبه مرکزی بیمه ایران - مدیریت درمان'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#72cdf4]/40">
                  <span className="font-bold">شماره پیگیری سیستمی بیمه‌گر:</span>
                  <span className="font-mono font-black">{selectedClaim.preTreatmentAuth?.certificateNumber || 'GOVAH-1405-9921'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#72cdf4]/40">
                  <span className="font-bold">وضعیت اعتبارسنجی مهر:</span>
                  <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {selectedClaim.preTreatmentAuth?.stampAndSignatureStatus || 'تأییدشده با امضای دیجیتال و مهر سیستمی بیمه‌گر'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#72cdf4]">
              <span className="text-[10px] text-[#005581]/70 font-bold">
                کد رهگیری امنیتی پرونده: {selectedClaim.claimNumber}
              </span>
              <button
                type="button"
                onClick={() => setShowPreAuthModal(false)}
                className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-6 py-2.5 rounded-xl shadow cursor-pointer transition-all"
              >
                تأیید و بستن شناسنامه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL SIGNATURE AUTHORIZATION MODAL (Enrolled Certificate + PIN Step) */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fffffa] rounded-3xl p-6 border-2 border-[#005581] max-w-lg w-full shadow-2xl space-y-5" dir="rtl">
            <div className="flex items-center justify-between border-b border-[#72cdf4] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-[#005581]" />
                <h3 className="text-base font-black text-[#005581]">
                  صدور امضای دیجیتال سند (مرحله احراز توکن / PIN)
                </h3>
              </div>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-[#005581] hover:bg-[#72cdf4]/20 p-1.5 rounded-lg transition-colors font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Verified Enrollment Status */}
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="font-black text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>گواهی دیجیتال فعال و تاییدشده (Active / Verified):</span>
              </div>
              <p className="text-emerald-800 font-medium">
                هویت‌سنجی و ثبت‌نام گواهی دیجیتال مریم عباسی قبلاً با موفقیت انجام شده است. نیازی به ورود مجدد اطلاعات گواهی نیست.
              </p>
            </div>

            {/* System Specs & Signer Info */}
            <div className="bg-[#72cdf4]/10 p-4 rounded-2xl border border-[#72cdf4] space-y-2 text-xs font-medium">
              <div className="flex justify-between py-1 border-b border-[#72cdf4]/50">
                <span className="text-[#005581]/80 font-bold">نام و سمت بازبین:</span>
                <span className="font-extrabold text-[#005581]">مریم عباسی (بازبین ارشد بیمه)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#72cdf4]/50">
                <span className="text-[#005581]/80 font-bold">سریال گواهی دیجیتال:</span>
                <span className="font-mono text-[#005581] font-bold">CERT-984021-IR</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#72cdf4]/50">
                <span className="text-[#005581]/80 font-bold">نسخه قاعده پین‌شده:</span>
                <span className="font-bold text-[#005581]">v2.1-2026 (آیین‌نامه بیمه مرکزی)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#72cdf4]/50">
                <span className="text-[#005581]/80 font-bold">هش فنی سند (تولید خودکار سیستم):</span>
                <span className="font-mono text-[11px] text-[#005581] bg-white px-2 py-0.5 rounded border border-[#72cdf4]">
                  0x8f2a9d12e84c9103
                </span>
              </div>
            </div>

            {/* PIN / OTP Authorization Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#005581]">
                رمز توکن / پین امنیتی امضا (PIN / OTP):
              </label>
              <input
                type="password"
                value={signingPin}
                onChange={(e) => setSigningPin(e.target.value)}
                placeholder="پین ۴ رقمی..."
                className="w-full bg-white text-xs font-mono font-bold text-[#005581] p-3 rounded-xl border border-[#72cdf4] focus:ring-2 focus:ring-[#72cdf4] text-center tracking-widest text-base"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={executeFinalDecision}
                className="flex-1 bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#ffd200]" />
                <span>امضا و ثبت نهایی (احراز یک‌مرحله‌ای و غیرقابل تغییر)</span>
              </button>

              <button
                onClick={() => setShowSignatureModal(false)}
                className="bg-[#72cdf4]/20 hover:bg-[#72cdf4]/40 text-[#005581] font-bold text-xs px-4 py-3.5 rounded-xl border border-[#72cdf4] transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
