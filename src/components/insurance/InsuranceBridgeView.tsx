import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileCheck2,
  Search,
  Plus,
  RefreshCw,
  FileText,
  Eye,
  FileSpreadsheet,
  Layers,
  ArrowRightLeft,
  KeyRound,
} from 'lucide-react';
import { mockClaims, mockPatients, mockPreAuthCertificates, mockConsentTokens } from '../../data/mockData';
import { Claim, PreAuthCertificate, ConsentToken } from '../../types';

export const InsuranceBridgeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'eligibility' | 'preauth' | 'packager' | 'kanban' | 'appeals' | 'consent'
  >('packager');

  // B1 Eligibility State
  const [nationalIdInput, setNationalIdInput] = useState('0012345678');
  const [eligibilityResult, setEligibilityResult] = useState<{
    patientName: string;
    primaryInsurance: string;
    primaryCapRemaining: number;
    supplementaryInsurance: string;
    supplementaryCapRemaining: number;
    franchisePercent: number;
    serviceDateLocked: string;
  } | null>(null);

  // Claims List
  const [claimsList, setClaimsList] = useState<Claim[]>(mockClaims);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(mockClaims[0] || null);
  const [appealReasonInput, setAppealReasonInput] = useState('');

  // PreAuth List
  const [preAuths, setPreAuths] = useState<PreAuthCertificate[]>(mockPreAuthCertificates);

  // Consent Tokens List
  const [consentTokens, setConsentTokens] = useState<ConsentToken[]>(mockConsentTokens);

  // Handle B1 Query
  const handleQueryEligibility = () => {
    const p = mockPatients.find((patient) => patient.nationalId === nationalIdInput);
    if (p) {
      setEligibilityResult({
        patientName: p.fullName,
        primaryInsurance: 'بیمه تامین اجتماعی (فعال)',
        primaryCapRemaining: 45000000,
        supplementaryInsurance: 'بیمه ایران (تکمیلی طلایی)',
        supplementaryCapRemaining: 120000000,
        franchisePercent: 10,
        serviceDateLocked: '1405/05/11',
      });
    } else {
      setEligibilityResult({
        patientName: 'علی محمدی (استعلام مستقیم)',
        primaryInsurance: 'بیمه سلامت ایرانیان',
        primaryCapRemaining: 30000000,
        supplementaryInsurance: 'بیمه دانا (تکمیلی)',
        supplementaryCapRemaining: 80000000,
        franchisePercent: 15,
        serviceDateLocked: '1405/05/11',
      });
    }
  };

  // Submit new Claim (Packager simulation)
  const handleSendClaim = (claimId: string) => {
    setClaimsList((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'submitted',
              reviewRoute: 'express' as const,
              auditTrailId: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
            }
          : c
      )
    );
    if (selectedClaim?.id === claimId) {
      setSelectedClaim((prev) => (prev ? { ...prev, status: 'submitted', reviewRoute: 'express' } : null));
    }
  };

  // Handle Appeal submit
  const handleAddAppeal = (claimId: string) => {
    if (!appealReasonInput.trim()) return;
    const newAppeal = {
      id: `app-${Date.now()}`,
      createdAt: '1405/05/13 10:15',
      submittedBy: 'کلینیک دنتورا',
      reason: appealReasonInput,
      additionalEvidenceUrls: [],
      status: 'pending' as const,
    };
    setClaimsList((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'appealed',
              appeals: [...(c.appeals || []), newAppeal],
            }
          : c
      )
    );
    if (selectedClaim?.id === claimId) {
      setSelectedClaim((prev) =>
        prev
          ? {
              ...prev,
              status: 'appealed',
              appeals: [...(prev.appeals || []), newAppeal],
            }
          : null
      );
    }
    setAppealReasonInput('');
  };

  // Revoke consent
  const handleRevokeConsent = (tokenId: string) => {
    setConsentTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, status: 'revoked' } : t))
    );
  };

  // Safe items fallback for selected claim
  const claimItems = selectedClaim?.items && selectedClaim.items.length > 0
    ? selectedClaim.items
    : selectedClaim
    ? [
        {
          id: 'item-1',
          toothNumber: selectedClaim.toothFdi || 16,
          procedureTitle: selectedClaim.treatmentName || 'درمان دندانپزشکی',
          procedureCode: 'DEN-TRT-01',
          tariffAmount: selectedClaim.claimedAmount || 5000000,
          claimedAmount: selectedClaim.claimedAmount || 5000000,
          baseShare: selectedClaim.baseApprovedAmount || Math.round((selectedClaim.claimedAmount || 5000000) * 0.2),
          supplementaryShare: selectedClaim.supplApprovedAmount || Math.round((selectedClaim.claimedAmount || 5000000) * 0.6),
          patientShare: Math.round((selectedClaim.claimedAmount || 5000000) * 0.2),
        },
      ]
    : [];

  const greenChecklist = selectedClaim?.greenLaneChecklist || {
    m1_identityConsent: true,
    m2_dentalChartStructured: true,
    m3_visualEvidenceAttached: true,
    m4_financialSanitised: true,
    m5_consentRecordAccess: true,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#fffffa] min-h-screen text-[#005581] font-sans dir-rtl">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl p-6 border-2 border-[#005581]/30 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-[#005581]" />
              <h1 className="text-xl font-bold text-[#005581]">پل ارتباط بیمه دنتورا (Insurance Bridge - Tier 2)</h1>
              <span className="bg-[#ffd200]/20 text-[#005581] text-xs px-3 py-0.5 rounded-full font-bold border border-[#ffd200]">
                ماژول بیمه فعال است
              </span>
            </div>
            <p className="text-xs text-[#005581]/80 leading-relaxed max-w-2xl font-medium">
              مدیریت پاک‌سازی ادعاها، استعلام هوشمند پوشش دوگانه (پایه + تکمیلی)، آماده‌سازی ۵ ماژول الزامی برای تسویه سریع (~۴۸ ساعت) و پیگیری شفاف مطالبات بیمه‌ای کلینیک.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#72cdf4]/15 p-3 rounded-xl border border-[#72cdf4]/40 text-center min-w-[130px]">
              <div className="text-xs text-[#005581] font-bold">نرخ آمادگی تسویه سریع</div>
              <div className="text-lg font-extrabold text-[#005581]">۹۴٪ (سطح L4)</div>
            </div>
            <div className="bg-[#ffd200]/15 p-3 rounded-xl border border-[#ffd200]/50 text-center min-w-[130px]">
              <div className="text-xs text-[#005581] font-bold">مطالبات در صف</div>
              <div className="text-lg font-extrabold text-[#005581]">۷۲,۰۰۰,۰۰۰ ریال</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-[#005581]/15 pt-4">
          <button
            onClick={() => setActiveTab('packager')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'packager'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-[#ffd200]" />
            <span>سازنده و پاک‌ساز ادعا (B3)</span>
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'eligibility'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Search className="w-4 h-4 text-[#ffd200]" />
            <span>استعلام پوشش آبشاری (B1)</span>
          </button>

          <button
            onClick={() => setActiveTab('preauth')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'preauth'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#ffd200]" />
            <span>تأییدیه‌های پیش از درمان (B2)</span>
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-[#ffd200]" />
            <span>برد کانبان و وضعیت ادعاها (B4)</span>
          </button>

          <button
            onClick={() => setActiveTab('appeals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appeals'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-[#ffd200]" />
            <span>پیگیری اعتراضات (B5)</span>
          </button>

          <button
            onClick={() => setActiveTab('consent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'consent'
                ? 'bg-[#005581] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#ffd200]" />
            <span>توکن‌های رضایت بیمار (B6)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: B3 CLAIM PACKAGER & SANITIZER */}
      {activeTab === 'packager' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Claims List */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#005581]" />
                <span>ادعاهای آماده ارسال و بررسی</span>
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                {claimsList.length} مورد
              </span>
            </div>

            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {claimsList.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedClaim?.id === claim.id
                      ? 'bg-sky-50/80 border-[#005581] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{claim.claimNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        claim.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : claim.status === 'partially_approved'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : claim.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {claim.status === 'approved'
                        ? 'تایید شده'
                        : claim.status === 'partially_approved'
                        ? 'تایید جزئی'
                        : claim.status === 'rejected'
                        ? 'رد شده'
                        : claim.status === 'appealed'
                        ? 'در اعتراض'
                        : claim.status === 'submitted'
                        ? 'ارسال شده'
                        : 'پیش‌نویس'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900">{claim.patientName}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{claim.primaryInsurerName || claim.insuranceProvider}</span>
                    <span className="font-bold text-slate-700">
                      {((claim.totalClaimedAmount || claim.claimedAmount || 0) / 10).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>

                  {/* Green Lane status pill */}
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-500">مسیر ارزیابی:</span>
                    <span className="text-[#005581] font-bold">
                      {claim.reviewRoute === 'express' || claim.greenLaneEligible ? '⚡ رسیدگی سریع Express' : '🔍 بررسی استاندارد'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Detail & Green Lane 5 Modules Checker */}
          {selectedClaim && (
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-800">{selectedClaim.claimNumber}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                      تاریخ خدمت: {selectedClaim.serviceDate || selectedClaim.dateOfService}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    بیمار: <strong className="text-slate-800">{selectedClaim.patientName}</strong> (کد ملی: {selectedClaim.patientNationalId || selectedClaim.nationalId}) | دندان‌پزشک: {selectedClaim.dentistName || 'دکتر کاویانی'}
                  </p>
                </div>

                {(selectedClaim.status === 'draft' || !selectedClaim.status) && (
                  <button
                    onClick={() => handleSendClaim(selectedClaim.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#ffd200]" />
                    <span>پاک‌سازی و ارسال یک‌کلیکی به بیمه</span>
                  </button>
                )}
              </div>

              {/* Green Lane 5 Modules Checklist Card */}
              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#005581] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#005581]" />
                    <span>بررسی ۵ ماژول الزامی تسویه سریع (Green Lane L4)</span>
                  </h3>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                      selectedClaim.greenLaneEligible
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {selectedClaim.greenLaneEligible ? 'واجد تسویه ۴۸ ساعته (L4)' : 'نیازمند تکمیل مدارک'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-700 font-medium">GL-M1: هویت، پوشش و رضایت</span>
                    {greenChecklist.m1_identityConsent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-700 font-medium">GL-M2: چارت دندان دیداری FDI</span>
                    {greenChecklist.m2_dentalChartStructured ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-700 font-medium">GL-M3: شواهد تصویری رادیوگرافی</span>
                    {greenChecklist.m3_visualEvidenceAttached ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-700 font-medium">GL-M4: صورت‌حساب پاک‌سازی شده</span>
                    {greenChecklist.m4_financialSanitised ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 md:col-span-2">
                    <span className="text-slate-700 font-medium">GL-M5: توکن دسترسی بیمار و حسابرسی غیرقابل تغییر (WORM)</span>
                    {greenChecklist.m5_consentRecordAccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800">اقلام ادعاشده و سهم‌بندی Waterfall</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">دندان (FDI)</th>
                        <th className="p-3">کد و شرح درمان</th>
                        <th className="p-3">تعرفه مصوب</th>
                        <th className="p-3">مبلغ ادعا</th>
                        <th className="p-3">سهم پایه</th>
                        <th className="p-3">سهم تکمیلی</th>
                        <th className="p-3">سهم بیمار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white font-medium">
                      {claimItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#005581]">دندان {item.toothNumber}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{item.procedureTitle}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{item.procedureCode}</span>
                          </td>
                          <td className="p-3 text-slate-500">{((item.tariffAmount || 0) / 10).toLocaleString('fa-IR')}</td>
                          <td className="p-3 font-bold text-slate-900">{((item.claimedAmount || 0) / 10).toLocaleString('fa-IR')}</td>
                          <td className="p-3 text-emerald-600 font-bold">{((item.baseShare || 0) / 10).toLocaleString('fa-IR')}</td>
                          <td className="p-3 text-[#005581] font-bold">{((item.supplementaryShare || 0) / 10).toLocaleString('fa-IR')}</td>
                          <td className="p-3 text-amber-600 font-bold">{((item.patientShare || 0) / 10).toLocaleString('fa-IR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual Evidences Preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800">شواهد و رادیوگرافی‌های متصل</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedClaim.evidences || []).map((ev) => (
                    <div key={ev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex gap-3 items-center">
                      {ev.fileUrl || ev.url ? (
                        <img
                          src={ev.fileUrl || ev.url}
                          alt={ev.title}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                          تصویر گرافی
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="text-xs font-bold text-slate-800">{ev.title}</div>
                        <p className="text-[10px] text-slate-500">{ev.aiQualityCheck?.notes || 'ارزیابی کیفیت رادیوگرافی تایید گردید.'}</p>
                        <span className="inline-block text-[10px] bg-sky-50 text-[#005581] px-2 py-0.5 rounded border border-sky-200 font-bold">
                          ارزیابی هوش مصنوعی: {ev.aiQualityCheck?.clarityScore || 96}٪ وضوح
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: B1 ELIGIBILITY WATERFALL */}
      {activeTab === 'eligibility' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#005581]" />
              <span>استعلام آنلاین پوشش دوگانه (پایه + تکمیلی) - B1</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              استعلام لحظه‌ای سقف باقیمانده، فرانشیز و محاسبه آبشاری سهم پایه، تکمیلی و سهم بیمار بر اساس کد ملی.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={nationalIdInput}
              onChange={(e) => setNationalIdInput(e.target.value)}
              placeholder="کد ملی بیمار را وارد کنید (مثلا: 0012345678)"
              className="flex-1 bg-white text-slate-800 text-xs rounded-xl px-4 py-3 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005581]/20 focus:border-[#005581] font-mono font-bold"
            />
            <button
              onClick={handleQueryEligibility}
              className="bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#ffd200]" />
              <span>استعلام از سامانه بیمه</span>
            </button>
          </div>

          {eligibilityResult && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="text-sm font-bold text-slate-900">{eligibilityResult.patientName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    قفل تاریخ خدمت: <strong className="text-[#005581]">{eligibilityResult.serviceDateLocked}</strong> (طبق ضوابط تاریخ خدمت)
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold">
                  استحقاق درمان تایید شد
                </span>
              </div>

              {/* Waterfall Calculation Demo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">بیمه پایه (تامین اجتماعی)</div>
                  <div className="text-sm font-extrabold text-emerald-600">
                    {(eligibilityResult.primaryCapRemaining / 10).toLocaleString('fa-IR')} تومان
                  </div>
                  <div className="text-[10px] text-slate-400">سقف باقیمانده سالانه</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">بیمه تکمیلی (ایران طلایی)</div>
                  <div className="text-sm font-extrabold text-[#005581]">
                    {(eligibilityResult.supplementaryCapRemaining / 10).toLocaleString('fa-IR')} تومان
                  </div>
                  <div className="text-[10px] text-slate-400">سقف باقیمانده پوشش</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">فرانشیز سهم بیمار</div>
                  <div className="text-sm font-extrabold text-amber-600">
                    {eligibilityResult.franchisePercent}٪
                  </div>
                  <div className="text-[10px] text-slate-400">طبق قرارداد بیمه‌گر</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: B2 PRE-AUTH CERTIFICATES */}
      {activeTab === 'preauth' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#005581]" />
                <span>تأییدیه‌ها و گواهی‌های پیش از درمان (B2)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ثبت و الصاق گواهی‌های تاییدیه حضوری دریافت‌شده توسط بیمار از سازمان بیمه‌گر جهت الصاق به ادعا.
              </p>
            </div>
            <button className="bg-[#005581] hover:bg-[#004266] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer">
              <Plus className="w-4 h-4 text-[#ffd200]" />
              <span>ثبت گواهی تاییدیه جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preAuths.map((auth) => (
              <div key={auth.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#005581] font-mono">{auth.certificateNumber}</span>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    معتبر تا {auth.expiryDate}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-900">{auth.patientName}</div>
                  <div className="text-xs text-slate-500">کد ملی: {auth.patientNationalId} | سازمان: {auth.insurerName}</div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 text-[11px] font-medium">خدمات مورد تایید:</div>
                  <ul className="list-disc list-inside text-slate-800 font-medium">
                    {auth.coveredProcedures.map((proc, i) => (
                      <li key={i}>{proc}</li>
                    ))}
                  </ul>
                  <div className="text-amber-600 font-bold pt-1">
                    مبلغ تاییدشده: {(auth.approvedAmount / 10).toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: B4 KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#005581]" />
              <span>تابلوی کانبان چرخه عمر ادعاها (B4)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ردیابی وضعیت ادعاها از پیش‌نویس تا بررسی، تایید، تسویه مالی و بایگانی.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-2">
            {/* Column 1: Draft / In Review */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-[#005581]">در انتظار بررسی</span>
                <span className="text-[11px] bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">۱ مورد</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-800">CLM-140505-001</div>
                <div className="text-xs text-slate-600">علی محمدی</div>
                <div className="text-[10px] text-[#005581] font-bold">بیمه تامین اجتماعی + ایران</div>
              </div>
            </div>

            {/* Column 2: Approved */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-emerald-700">تایید شده (تسویه ۴۸ ساعته)</span>
                <span className="text-[11px] bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">۱ مورد</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-800">CLM-140505-001</div>
                <div className="text-xs text-slate-600">علی محمدی</div>
                <div className="text-[10px] text-emerald-600 font-bold">۲۷,۰۰۰,۰۰۰ ریال تایید گردید</div>
              </div>
            </div>

            {/* Column 3: Partially Approved / Deduction */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-amber-700">تایید جزئی (دارای کسورات)</span>
                <span className="text-[11px] bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">۱ مورد</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-800">CLM-140505-002</div>
                <div className="text-xs text-slate-600">سارا حسینی</div>
                <div className="text-[10px] text-amber-600 font-bold">کسر مغایرت تعرفه: ۱۰,۰۰۰,۰۰۰ ریال</div>
              </div>
            </div>

            {/* Column 4: Rejected / Appeal */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-rose-700">رد شده / در اعتراض</span>
                <span className="text-[11px] bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">۱ مورد</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-rose-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-800">CLM-140505-003</div>
                <div className="text-xs text-slate-600">آراد رضایی</div>
                <div className="text-[10px] text-rose-600 font-bold">علت: عدم ارسال کلیشه پری‌اپیکال</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: B5 APPEALS & DISPUTE WORKFLOW */}
      {activeTab === 'appeals' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#005581]" />
              <span>مدیریت اعتراضات و دفاعیات بالینی (B5)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ثبت اعتراض رسمی با دلایل فنی و بالینی، بارگذاری مستندات تکمیلی بدون محدودیت تعداد اعتراض (طبق آئین‌نامه ثبت اعتراض).
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold text-slate-800">ثبت اعتراض برای ادعای CLM-140505-002 (ایمپلنت دندان ۳۶)</div>
            <textarea
              rows={3}
              value={appealReasonInput}
              onChange={(e) => setAppealReasonInput(e.target.value)}
              placeholder="توضیحات و دفاعیه بالینی دندان‌پزشک معالج را وارد کنید..."
              className="w-full bg-white text-slate-800 text-xs rounded-xl p-3 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005581]/20 focus:border-[#005581]"
            />
            <button
              onClick={() => handleAddAppeal('clm-804')}
              className="bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#ffd200]" />
              <span>ارسال رسمی اعتراض به کمیسیون بازبینی بیمه</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: B6 CONSENT TOKENS */}
      {activeTab === 'consent' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#005581]" />
              <span>توکن‌های رضایت بیمار و حاکمیت داده</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              توکن‌های زمان‌دار و قابل ابطال جهت اعطای دسترسی به بیمه‌گر. دسترسی بدون توکن معتبر ممنوع است.
            </p>
          </div>

          <div className="space-y-3">
            {consentTokens.map((token) => (
              <div key={token.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{token.patientName}</span>
                    <span className="text-[10px] text-[#005581] bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
                      سازمان: {token.insurerName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">{token.scope}</div>
                  <div className="text-[10px] text-slate-400">
                    تاریخ صدور: {token.issuedAt} | انقضا: {token.expiresAt}
                  </div>
                </div>

                <div>
                  {token.status === 'active' ? (
                    <button
                      onClick={() => handleRevokeConsent(token.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      ابطال توکن رضایت
                    </button>
                  ) : (
                    <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-lg font-bold">
                      باطل شده
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
