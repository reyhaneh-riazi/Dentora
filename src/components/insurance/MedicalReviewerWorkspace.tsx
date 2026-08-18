import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Eye,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Scale,
  History,
  User,
  ClipboardList,
  Check,
  ShieldAlert,
  ArrowRight,
  Info,
  Key,
  Zap,
  CheckCircle,
  Trash2,
  Edit3,
  Search,
  X,
  ExternalLink,
  Cpu,
  BookOpen,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Maximize2,
  Sun,
  Ruler,
  Crosshair,
  Grid,
  Image as ImageIcon,
  Send,
  Clock,
  MessageSquare,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { mockClaims } from '../../data/mockData';
import { Claim } from '../../types';

// Converts English digits to Persian
const toFa = (num?: number | string | null): string => {
  if (num === undefined || num === null) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
};

// High-Fidelity Clinical Dental Radiography SVG Renderers
const DentalRVGPeriapicalSVG: React.FC<{ contrast: number; brightness: number; inverted: boolean }> = ({
  contrast,
  brightness,
  inverted,
}) => (
  <svg
    viewBox="0 0 900 600"
    className="w-full h-[420px] object-cover transition-all duration-150 select-none"
    style={{
      filter: `contrast(${contrast}%) brightness(${brightness}%) ${inverted ? 'invert(100%)' : 'grayscale(100%)'}`,
    }}
  >
    <defs>
      <radialGradient id="rvgGlow" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#090d16" stopOpacity="1" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1" />
      </radialGradient>
      <linearGradient id="gpLinear" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id="pulpDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#020617" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>

    {/* Background Radiographic Film */}
    <rect width="900" height="600" fill="url(#rvgGlow)" />

    {/* Maxillary Sinus Floor (Curved Radiopaque Line) */}
    <path d="M 100 180 Q 450 135 800 190" stroke="#64748b" strokeWidth="2.5" strokeDasharray="6,4" fill="none" opacity="0.5" />
    <text x="730" y="175" fill="#64748b" fontFamily="monospace" fontSize="11" opacity="0.75">MAXILLARY SINUS FLOOR</text>

    {/* Bone Trabeculae Micro-Texture */}
    <g opacity="0.35">
      <circle cx="280" cy="320" r="1.5" fill="#cbd5e1" />
      <circle cx="340" cy="290" r="2" fill="#94a3b8" />
      <circle cx="410" cy="350" r="1.5" fill="#e2e8f0" />
      <circle cx="560" cy="310" r="2" fill="#cbd5e1" />
      <circle cx="620" cy="340" r="1.5" fill="#94a3b8" />
      <circle cx="470" cy="260" r="2" fill="#e2e8f0" />
      <circle cx="300" cy="450" r="1.5" fill="#64748b" />
      <circle cx="600" cy="460" r="2" fill="#64748b" />
    </g>

    {/* Lamina Dura & PDL Space (Periapical Radiolucent Halo) */}
    <path
      d="M 325 350 Q 295 480 345 528 Q 365 538 385 520 L 415 370 Q 435 490 460 532 Q 480 542 495 520 L 525 365 Q 560 485 588 518 Q 608 528 618 505 L 610 350"
      stroke="#334155"
      strokeWidth="8"
      fill="none"
      opacity="0.65"
    />

    {/* Tooth #16 Outer Contour (Dentin & Cementum Matrix) */}
    <path
      d="M 320 340 C 310 420 330 480 350 520 C 360 528 375 522 380 500 L 410 360 C 420 420 440 485 465 522 C 475 532 490 524 492 505 L 515 360 C 530 420 560 475 585 508 C 598 518 610 508 605 485 L 595 340 C 625 320 645 280 640 230 C 635 170 595 140 540 145 C 500 148 460 142 450 142 C 440 142 400 148 360 145 C 305 140 265 170 260 230 C 255 280 275 320 320 340 Z"
      fill="#64748b"
      opacity="0.88"
    />

    {/* Dense Radiopaque Enamel Cap */}
    <path
      d="M 260 230 C 265 170 305 140 360 145 C 400 148 440 142 450 142 C 460 142 500 148 540 145 C 595 140 635 170 640 230 C 620 250 580 255 540 250 C 490 245 410 245 360 250 C 320 255 280 250 260 230 Z"
      fill="#cbd5e1"
      opacity="0.95"
    />

    {/* Pulp Chamber (Radiolucent) */}
    <path d="M 380 260 Q 450 245 520 260 L 510 320 Q 450 310 390 320 Z" fill="url(#pulpDark)" opacity="0.95" />

    {/* 3 Root Canals Filled with Dense Gutta-Percha (High Radiopacity) */}
    {/* MB Canal */}
    <path d="M 400 310 Q 370 410 355 510" stroke="url(#gpLinear)" strokeWidth="7" strokeLinecap="round" fill="none" />
    {/* Palatal (P) Canal */}
    <path d="M 450 315 Q 460 410 475 512" stroke="url(#gpLinear)" strokeWidth="9" strokeLinecap="round" fill="none" />
    {/* DB Canal */}
    <path d="M 500 310 Q 540 400 590 495" stroke="url(#gpLinear)" strokeWidth="6.5" strokeLinecap="round" fill="none" />

    {/* Cavity Access Seal */}
    <polygon points="410,245 490,245 480,285 420,285" fill="#f1f5f9" opacity="0.95" />

    {/* Scale Ruler Overlay */}
    <g transform="translate(40, 470)">
      <line x1="0" y1="0" x2="0" y2="80" stroke="#38bdf8" strokeWidth="2" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke="#38bdf8" strokeWidth="2" />
      <line x1="-5" y1="20" x2="5" y2="20" stroke="#38bdf8" strokeWidth="1" />
      <line x1="-5" y1="40" x2="5" y2="40" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="-5" y1="60" x2="5" y2="60" stroke="#38bdf8" strokeWidth="1" />
      <line x1="-5" y1="80" x2="5" y2="80" stroke="#38bdf8" strokeWidth="2" />
      <text x="12" y="45" fill="#38bdf8" fontFamily="monospace" fontSize="11" fontWeight="bold">20 mm</text>
    </g>

    {/* Apical Seal Confirmation Circles */}
    <circle cx="355" cy="510" r="14" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
    <circle cx="475" cy="512" r="14" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
    <circle cx="590" cy="495" r="14" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
  </svg>
);

const DentalBitewingCrownSVG: React.FC<{ contrast: number; brightness: number; inverted: boolean }> = ({
  contrast,
  brightness,
  inverted,
}) => (
  <svg
    viewBox="0 0 900 600"
    className="w-full h-[420px] object-cover transition-all duration-150 select-none"
    style={{
      filter: `contrast(${contrast}%) brightness(${brightness}%) ${inverted ? 'invert(100%)' : 'grayscale(100%)'}`,
    }}
  >
    <defs>
      <radialGradient id="bwGlow" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#090d16" stopOpacity="1" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1" />
      </radialGradient>
    </defs>

    {/* Background */}
    <rect width="900" height="600" fill="url(#bwGlow)" />

    {/* Alveolar Bone Crest Level */}
    <path d="M 150 420 Q 300 400 450 415 Q 600 395 750 420 L 750 580 L 150 580 Z" fill="#1e293b" opacity="0.75" />
    <line x1="200" y1="410" x2="700" y2="410" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.8" />
    <text x="610" y="405" fill="#fb7185" fontFamily="monospace" fontSize="10">BONE CREST LEVEL</text>

    {/* Adjacent Tooth #17 */}
    <path d="M 620 440 L 630 310 C 630 250 670 210 730 220 C 780 230 800 270 790 440 Z" fill="#475569" opacity="0.65" />
    <path d="M 640 260 C 660 220 730 220 760 260 Z" fill="#94a3b8" opacity="0.8" />

    {/* Tooth #16 Molar Body with Severe Coronal Loss */}
    <path
      d="M 330 460 L 340 330 C 340 280 370 240 400 250 L 405 310 C 430 330 480 330 510 300 L 515 250 C 550 240 580 270 580 330 L 590 460 Z"
      fill="#64748b"
      opacity="0.88"
    />

    {/* Severe Radiolucent Defect Cavity (>55% Loss) */}
    <path d="M 405 240 Q 460 330 515 240 Q 480 200 440 210 Z" fill="#020617" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4,2" />

    {/* AI Highlighting Banner for Structural Loss */}
    <rect x="350" y="160" width="200" height="38" rx="8" fill="#881337" fillOpacity="0.9" stroke="#f43f5e" />
    <text x="450" y="184" fill="#ffe4e6" fontFamily="sans-serif" fontWeight="bold" fontSize="11" textAnchor="middle">
      تخریب دیواره تاج: ۵۸٪ (MOD Caries)
    </text>

    {/* Preparation Finish Line */}
    <path d="M 335 340 Q 460 355 585 340" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />
    <text x="460" y="375" fill="#38bdf8" fontFamily="monospace" fontSize="10" textAnchor="middle">
      PREPARATION MARGIN LINE (CLEAR)
    </text>

    {/* Adjacent Premolar #15 */}
    <path d="M 200 450 L 210 320 C 215 260 260 240 290 260 L 300 450 Z" fill="#475569" opacity="0.65" />
  </svg>
);

const DentalOPGPanoramicSVG: React.FC<{ contrast: number; brightness: number; inverted: boolean }> = ({
  contrast,
  brightness,
  inverted,
}) => (
  <svg
    viewBox="0 0 900 600"
    className="w-full h-[420px] object-cover transition-all duration-150 select-none"
    style={{
      filter: `contrast(${contrast}%) brightness(${brightness}%) ${inverted ? 'invert(100%)' : 'grayscale(100%)'}`,
    }}
  >
    <defs>
      <radialGradient id="opgGlow2" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
        <stop offset="80%" stopColor="#090d16" stopOpacity="1" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1" />
      </radialGradient>
    </defs>

    <rect width="900" height="600" fill="url(#opgGlow2)" />

    {/* Mandibular Arch & Condyles Curvature */}
    <path d="M 80 180 Q 120 320 220 440 Q 450 510 680 440 Q 780 320 820 180" stroke="#334155" strokeWidth="26" fill="none" opacity="0.6" strokeLinecap="round" />
    <path d="M 120 220 Q 450 170 780 220" stroke="#334155" strokeWidth="18" fill="none" opacity="0.5" />

    {/* Teeth silhouettes */}
    <g fill="#64748b" opacity="0.75">
      <rect x="220" y="240" width="22" height="40" rx="4" />
      <rect x="250" y="235" width="24" height="42" rx="4" />
      <rect x="280" y="230" width="26" height="44" rx="4" fill="#38bdf8" />
      <rect x="315" y="225" width="25" height="48" rx="4" />
      <rect x="345" y="220" width="28" height="50" rx="4" />
      <rect x="380" y="215" width="30" height="52" rx="4" />
      <rect x="420" y="212" width="26" height="50" rx="4" />
      <rect x="455" y="212" width="26" height="50" rx="4" />
      <rect x="490" y="215" width="30" height="52" rx="4" />
      <rect x="525" y="220" width="28" height="50" rx="4" />
      <rect x="560" y="225" width="25" height="48" rx="4" />
      <rect x="595" y="230" width="26" height="44" rx="4" />
      <rect x="625" y="235" width="24" height="42" rx="4" />
      <rect x="655" y="240" width="22" height="40" rx="4" />

      <rect x="230" y="360" width="20" height="40" rx="4" />
      <rect x="260" y="365" width="22" height="42" rx="4" />
      <rect x="290" y="370" width="24" height="44" rx="4" />
      <rect x="320" y="375" width="24" height="46" rx="4" />
      <rect x="350" y="380" width="26" height="48" rx="4" />
      <rect x="385" y="385" width="28" height="50" rx="4" />
      <rect x="420" y="388" width="25" height="50" rx="4" />
      <rect x="455" y="388" width="25" height="50" rx="4" />
      <rect x="490" y="385" width="28" height="50" rx="4" />
      <rect x="525" y="380" width="26" height="48" rx="4" />
      <rect x="555" y="375" width="24" height="46" rx="4" />
      <rect x="585" y="370" width="24" height="44" rx="4" />
      <rect x="615" y="365" width="22" height="42" rx="4" />
      <rect x="645" y="360" width="20" height="40" rx="4" />
    </g>

    {/* Inset Zoom Box for Tooth #14 */}
    <rect x="270" y="222" width="46" height="58" rx="8" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,2" />

    <g transform="translate(600, 350)">
      <rect x="0" y="0" width="270" height="210" rx="12" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
      <text x="15" y="28" fill="#38bdf8" fontFamily="monospace" fontSize="11" fontWeight="bold">INSET ZOOM: TOOTH #14</text>
      
      {/* Zoomed Tooth 14 */}
      <path d="M 60 140 L 70 80 C 75 55 105 45 140 50 C 175 45 195 65 190 140 Z" fill="#64748b" opacity="0.85" />
      <path d="M 85 55 Q 135 68 175 55 L 170 95 Q 135 85 90 95 Z" fill="#cbd5e1" />
      {/* Liner Base */}
      <path d="M 95 96 Q 135 88 165 96" stroke="#fbbf24" strokeWidth="3.5" fill="none" />
      <text x="15" y="170" fill="#94a3b8" fontFamily="sans-serif" fontSize="10">Composite 3-Surface Restoration</text>
      <text x="15" y="190" fill="#22c55e" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Pulp Protection: Liner Verified ✅</text>
    </g>
  </svg>
);

const DEFAULT_RVG_XRAY = 'rvg_endo';
const DEFAULT_CROWN_XRAY = 'bitewing_crown';
const DEFAULT_OPG_XRAY = 'panoramic_opg';

export interface AIMarker {
  id: string;
  x: number;
  y: number;
  title: string;
  category: 'confidence' | 'warning' | 'anomaly';
  aiConfidence: number;
  detectionText: string;
  flagReason: string;
  linkedQuestionId: string;
  isOverridden?: boolean;
  overrideReason?: string;
  overriddenAt?: string;
  overriddenAction?: 'deleted' | 'modified';
}

export interface LineItemQuestion {
  id: string;
  questionText: string;
  markerId?: string;
  options: { id: string; label: string; isAiRecommended?: boolean }[];
  selectedAnswer: string;
}

export interface ClaimLineItem {
  id: string;
  toothNumber: string;
  fdiCode: string;
  serviceName: string;
  serviceCode: string;
  claimedAmount: number;
  approvedAmount: number;
  status: 'pending_doctor' | 'approved' | 'rejected' | 'partial';
  initialReviewerNote: string;
  radiographyUrl: string;
  radiographyTitle: string;
  aiMarkers: AIMarker[];
  questions: LineItemQuestion[];
}

export interface AIOverrideRecord {
  id: string;
  claimNumber: string;
  lineItemId: string;
  toothNumber: string;
  markerTitle: string;
  originalAiFinding: string;
  overrideActionText: string;
  doctorReason: string;
  doctorName: string;
  timestamp: string;
  wormKey: string;
  aiModelVersion: string;
  rulesEngineVersion: string;
  claimReviewerName: string;
  doctorSignatureStatus: string;
}

export interface AuditTrailRecord {
  id: string;
  claimNumber: string;
  patientName: string;
  patientNationalId?: string;
  clinicName: string;
  claimedAmount?: number;
  serviceDate?: string;
  primaryInsurerName?: string;
  timestamp: string;
  reviewMethod: 'fast' | 'standard' | 'deep';
  finalVerdict: 'approved' | 'partial' | 'partial_rejection' | 'rejected';
  aiModelVersion: string;
  rulesEngineVersion: string;
  claimReviewerName: string;
  claimReviewerNote: string;
  medicalDoctorName: string;
  medicalDoctorCode: string;
  medicalDoctorVerdictText: string;
  doctorSummaryNote?: string;
  isDigitallySigned: boolean;
  wormKey?: string;
  doctorPin?: string;
  reproducibilityHash: string;
  lineItemsSummary: {
    toothNumber: string;
    serviceName: string;
    questionsCount: number;
    answersList: { questionText: string; answerLabel: string }[];
  }[];
  aiOverridesList: AIOverrideRecord[];
}

interface MedicalReviewerWorkspaceProps {
  claims?: Claim[];
  setClaims?: React.Dispatch<React.SetStateAction<Claim[]>>;
  onReviewDecision?: (
    claimId: string,
    status: 'approved' | 'partially_approved' | 'rejected',
    deduction: number,
    reason: string
  ) => void;
  currentUserName?: string;
}

export const MedicalReviewerWorkspace: React.FC<MedicalReviewerWorkspaceProps> = ({
  claims: initialClaims,
  setClaims: setClaimsProp,
  onReviewDecision,
  currentUserName,
}) => {
  const activeDoctorName = currentUserName?.trim() || 'دکتر احسان رستمی (پزشک معتمد)';
  const [activeStep, setActiveStep] = useState<number>(1);
  const [reviewMethod, setReviewMethod] = useState<'fast' | 'standard' | 'deep'>('deep');
  const [claimsLocal, setClaimsLocal] = useState<Claim[]>(
    initialClaims && initialClaims.length > 0 ? initialClaims : mockClaims
  );
  const claims = initialClaims && initialClaims.length > 0 ? initialClaims : claimsLocal;
  const setClaims = setClaimsProp || setClaimsLocal;

  useEffect(() => {
    if (initialClaims && initialClaims.length > 0) {
      setClaimsLocal(initialClaims);
    }
  }, [initialClaims]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    initialClaims && initialClaims[0] ? initialClaims[0].id : mockClaims[0].id
  );
  const [queueSearchQuery, setQueueSearchQuery] = useState<string>('');

  const trustedDoctor = {
    name: activeDoctorName,
    medicalCode: '۴۸۹۲۱-ن',
    specialty: 'پزشک معتمد و کارشناس عالی رادیولوژی فک و دهان',
    wormKey: '0x8f2a-WORM-2026-ACTIVE',
  };

  const systemVersions = {
    aiModel: 'Dental-Vision-AI v3.4.2-Pro',
    rulesEngine: 'Rules-Engine v2.1-2026-Dental-Standard',
  };

  const [claimLineItemsMap, setClaimLineItemsMap] = useState<{ [claimId: string]: ClaimLineItem[] }>({
    'clm-001': [
      {
        id: 'line-101',
        toothNumber: 'دندان ۱۶ (فک بالا راست)',
        fdiCode: '16',
        serviceName: 'درمان ریشه (عصب‌کشی ۳ کاناله)',
        serviceCode: 'END-3C',
        claimedAmount: 1350000,
        approvedAmount: 1350000,
        status: 'pending_doctor',
        initialReviewerNote: 'بررسی کیفیت پمپاژ مواد گوتاپرکا و پرکردن کامل کانال‌ها تا آپکس در تصویر RVG',
        radiographyUrl: DEFAULT_RVG_XRAY,
        radiographyTitle: 'گرافی RVG پری‌اپیکال رادیولوژی دندان ۱۶ (کانال‌های MB, DB, P)',
        aiMarkers: [
          {
            id: 'mark-101',
            x: 38,
            y: 42,
            title: 'تراکم گوتاپرکا در کانال مزیوباکال (MB)',
            category: 'confidence',
            aiConfidence: 97,
            detectionText: 'پرکنندگی کامل ریشه تا ۱ میلی‌متری آپکس رادیوگرافیک مشهود است.',
            flagReason: 'تراکم مطلوب و عدم وجود فضای خالی (Void)',
            linkedQuestionId: 'q-line-101-1',
            isOverridden: false,
          },
          {
            id: 'mark-102',
            x: 62,
            y: 50,
            title: 'بررسی آپکس کانال دیستوباکال (DB)',
            category: 'confidence',
            aiConfidence: 94,
            detectionText: 'ماده سیلر و گوتاپرکا کاملاً مخروطی و بدون اورفیلینگ پمپاژ شده است.',
            flagReason: 'انطباق با استاندارد ملی اندودنتیکس v2.1',
            linkedQuestionId: 'q-line-101-2',
            isOverridden: false,
          },
          {
            id: 'mark-103',
            x: 50,
            y: 75,
            title: 'وضعیت لامینا دورا و پری‌اپیکال',
            category: 'warning',
            aiConfidence: 82,
            detectionText: 'پریودنتال لیگامان (PDL) نرمال است؛ ضایعه پری‌اپیکال فعال دیده نمی‌شود.',
            flagReason: 'تأیید سلامت بافت اطراف ریشه در گرافی رادیولوژی',
            linkedQuestionId: 'q-line-101-3',
            isOverridden: false,
          },
        ],
        questions: [
          {
            id: 'q-line-101-1',
            questionText: 'آیا کیفیت عصب‌کشی و اپیکال سیل (Apical Seal) کانال‌های دندان ۱۶ مورد تأیید است؟',
            markerId: 'mark-101',
            options: [
              { id: 'yes_quality', label: 'بلی - اپیکال سیل کامل و استاندارد است ✅', isAiRecommended: true },
              { id: 'no_quality', label: 'خیر - پرکنندگی ناقص (Underfilling) مشاهده می‌شود' },
            ],
            selectedAnswer: 'yes_quality',
          },
          {
            id: 'q-line-101-2',
            questionText: 'آیا علائم Overfilling (خروج ماده از آپکس) در کانال‌ها مشاهده می‌شود؟',
            markerId: 'mark-102',
            options: [
              { id: 'no_overfill', label: 'خیر - ماده کاملاً داخل کانال است ✅', isAiRecommended: true },
              { id: 'yes_overfill', label: 'بلی - خروج گوتاپرکا به بافت پری‌اپیکال' },
            ],
            selectedAnswer: 'no_overfill',
          },
          {
            id: 'q-line-101-3',
            questionText: 'آیا ضایعه پری‌اپیکال فعال یا لزوم جراحی اپسکتومی رویت می‌گردد؟',
            markerId: 'mark-103',
            options: [
              { id: 'no_lesion', label: 'خیر - لامینا دورا پیوسته و سالم است ✅', isAiRecommended: true },
              { id: 'yes_lesion', label: 'بلی - وجود ضایعه شفاف رادیولوسنت' },
            ],
            selectedAnswer: 'no_lesion',
          },
        ],
      },
      {
        id: 'line-102',
        toothNumber: 'دندان ۱۶ (فک بالا راست)',
        fdiCode: '16',
        serviceName: 'روکش سرامیکی PFM',
        serviceCode: 'CRN-PFM',
        claimedAmount: 1650000,
        approvedAmount: 1650000,
        status: 'pending_doctor',
        initialReviewerNote: 'بررسی میزان تخریب دیواره‌های تاج و ضرورت بالینی ساخت روکش نسبت به کامپوزیت',
        radiographyUrl: DEFAULT_CROWN_XRAY,
        radiographyTitle: 'گرافی رادیولوژی بایت‌وینگ و کرونال تاج دندان ۱۶ جهت ارزیابی ضرورت روکش',
        aiMarkers: [
          {
            id: 'mark-201',
            x: 45,
            y: 30,
            title: 'میزان تخریب تاج و دیواره مزیال/دیستال',
            category: 'anomaly',
            aiConfidence: 89,
            detectionText: 'دیواره‌های باکال و دیستال دچار شکستگی وسیع بالای ۵۵٪ است.',
            flagReason: 'احراز ضرورت بالینی روکش PFM طبق آئین‌نامه v2.1',
            linkedQuestionId: 'q-line-102-1',
            isOverridden: false,
          },
          {
            id: 'mark-202',
            x: 55,
            y: 60,
            title: 'ارزیابی مارجین لثه‌ای و فیتینگ روکش',
            category: 'warning',
            aiConfidence: 86,
            detectionText: 'حاشیه تراش خط خاتمه (Finish line) شفاف و بدون اورهنگ رویت می‌شود.',
            flagReason: 'تطابق با ضوابط بیمه‌ای روکش ثابت',
            linkedQuestionId: 'q-line-102-2',
            isOverridden: false,
          },
        ],
        questions: [
          {
            id: 'q-line-102-1',
            questionText: 'آیا تخریب دیواره‌های تاج دندان ۱۶ بیش از ۵۰٪ بوده و لزوم روکش PFM را تأیید می‌کند؟',
            markerId: 'mark-201',
            options: [
              { id: 'yes_coronal_loss', label: 'بلی - تخریب وسیع و ضرورت روکش ✅', isAiRecommended: true },
              { id: 'no_composite_enough', label: 'خیر - ترمیم کامپوزیت خلفی کفایت می‌کرد' },
            ],
            selectedAnswer: 'yes_coronal_loss',
          },
          {
            id: 'q-line-102-2',
            questionText: 'آیا مارجین روکش و انطباق آن روی خط خاتمه تراش استاندارد است؟',
            markerId: 'mark-202',
            options: [
              { id: 'yes_margin_ok', label: 'بلی - انطباق کامل و بدون درز ✅', isAiRecommended: true },
              { id: 'no_margin_gap', label: 'خیر - وجود گپ مارجینال یا عدم انطباق' },
            ],
            selectedAnswer: 'yes_margin_ok',
          },
        ],
      },
      {
        id: 'line-103',
        toothNumber: 'دندان ۱۴ (پرمولر اول بالا)',
        fdiCode: '14',
        serviceName: 'ترمیم کامپوزیت ۳ سطحی خلفی',
        serviceCode: 'CMP-3S',
        claimedAmount: 950000,
        approvedAmount: 950000,
        status: 'pending_doctor',
        initialReviewerNote: 'کنترل مارجین‌های پسیو ترمیم و عدم درگیری پالپ',
        radiographyUrl: DEFAULT_OPG_XRAY,
        radiographyTitle: 'تصویر رادیوگرافی پانورامیک OPG دندان‌های فک جهت ارزیابی ترمیم',
        aiMarkers: [
          {
            id: 'mark-301',
            x: 48,
            y: 40,
            title: 'عمق ترمیم نسبت به شاخک پالپ',
            category: 'confidence',
            aiConfidence: 95,
            detectionText: 'ترمیم با لایه بیس محافظتی (Liner) انجام شده و فاصله ایمن از پالپ حفظ گردیده است.',
            flagReason: 'تأیید سلامت پالپ دندان ۱۴',
            linkedQuestionId: 'q-line-103-1',
            isOverridden: false,
          },
        ],
        questions: [
          {
            id: 'q-line-103-1',
            questionText: 'آیا ترمیم کامپوزیت ۳ سطحی دندان ۱۴ از نظر عمق و عایق‌بندی پالپ مورد تأیید است؟',
            markerId: 'mark-301',
            options: [
              { id: 'yes_restore_ok', label: 'بلی - ترمیم استاندارد و عایق‌بندی شده ✅', isAiRecommended: true },
              { id: 'no_pulp_exposure', label: 'خیر - نزدیکی غیرمجاز به پالپ بدون کف‌بندی' },
            ],
            selectedAnswer: 'yes_restore_ok',
          },
        ],
      },
    ],
  });

  const selectedClaim = React.useMemo(() => {
    return claims.find((c) => c.id === selectedClaimId) || claims[0] || mockClaims[0];
  }, [claims, selectedClaimId]);

  const claimReviewerInfo = React.useMemo(() => {
    const reviewerName =
      selectedClaim?.claimReviewerName ||
      selectedClaim?.medicalHandover?.reviewerName ||
      (selectedClaim?.appeals && selectedClaim.appeals[0]?.claimReviewerName) ||
      (selectedClaim?.appeals && selectedClaim.appeals[0]?.reviewedBy) ||
      'زهرا صادقی (بازبین ارشد ادعا)';

    const reviewerNote =
      selectedClaim?.claimReviewerHandoverNote ||
      selectedClaim?.medicalHandover?.note ||
      (selectedClaim?.appeals && selectedClaim.appeals[0]?.responseNotes) ||
      (selectedClaim?.appeals && selectedClaim.appeals[0]?.claimReviewerNote) ||
      selectedClaim?.reviewerDiagnosis ||
      selectedClaim?.reviewerNotes ||
      selectedClaim?.doctorReviewerDiagnosis ||
      'پرونده از نظر سقف تعهدات و مدارک مالی اولیه احراز اولیه گردیده و جهت ارزیابی رادیولوژی و بالینی ارجاع شد.';

    return {
      name: reviewerName,
      title: 'کارشناس ارشد ارزیابی ادعای درمان',
      note: reviewerNote,
    };
  }, [selectedClaim]);

  const activeLineItems = React.useMemo(() => {
    if (!selectedClaim) return [];

    const reviewerNotes =
      selectedClaim.claimReviewerHandoverNote ||
      selectedClaim.medicalHandover?.note ||
      (selectedClaim.appeals && selectedClaim.appeals[0]?.responseNotes) ||
      (selectedClaim.appeals && selectedClaim.appeals[0]?.claimReviewerNote) ||
      selectedClaim.reviewerDiagnosis ||
      selectedClaim.reviewerNotes ||
      selectedClaim.doctorReviewerDiagnosis ||
      claimReviewerInfo.note;

    if (claimLineItemsMap[selectedClaim.id] && claimLineItemsMap[selectedClaim.id].length > 0) {
      return claimLineItemsMap[selectedClaim.id].map((item) => ({
        ...item,
        initialReviewerNote: reviewerNotes || item.initialReviewerNote,
      }));
    }

    // Dynamically derive from selectedClaim's actual patient and clinical data
    const rawAmt = (selectedClaim as any).claimedAmount || (selectedClaim as any).totalAmount || (selectedClaim as any).totalClaimedAmount || 5200000;
    const claimAmountInRials = rawAmt < 50000000 ? rawAmt * 10 : rawAmt;
    const toothNum = selectedClaim.toothFdi || (selectedClaim.items && selectedClaim.items[0]?.toothNumber) || 16;
    const treatName = selectedClaim.treatmentName || (selectedClaim.items && selectedClaim.items[0]?.procedureTitle) || 'درمان ریشه (عصب‌کشی تخصصی)';

    if (selectedClaim.items && selectedClaim.items.length > 0) {
      return selectedClaim.items.map((item, idx) => ({
        id: `line-${selectedClaim.id}-${idx + 1}`,
        toothNumber: `دندان ${toFa(item.toothNumber || toothNum)} (فک ${item.toothNumber && Number(item.toothNumber) > 20 ? 'پایین' : 'بالا'})`,
        fdiCode: String(item.toothNumber || toothNum),
        serviceName: item.procedureTitle || treatName,
        serviceCode: item.procedureCode || (idx === 0 ? 'END-3C' : 'CRN-PFM'),
        claimedAmount: item.claimedAmount ? (item.claimedAmount < 50000000 ? item.claimedAmount * 10 : item.claimedAmount) : Math.round(claimAmountInRials / selectedClaim.items.length),
        approvedAmount: item.claimedAmount ? (item.claimedAmount < 50000000 ? item.claimedAmount * 10 : item.claimedAmount) : Math.round(claimAmountInRials / selectedClaim.items.length),
        status: 'pending_doctor' as const,
        initialReviewerNote: reviewerNotes,
        radiographyUrl: DEFAULT_RVG_XRAY,
        radiographyTitle: `کلیشه رادیوگرافی RVG دندان ${toFa(item.toothNumber || toothNum)}`,
        aiMarkers: [
          {
            id: `mark-${selectedClaim.id}-${idx + 1}-1`,
            x: 48,
            y: 72,
            title: 'ارزیابی طول کانال و اپیکال سیل ریشه',
            category: 'alert' as const,
            aiConfidence: 89,
            detectionText: `مواد پرکردگی تا فاصله ۰.۸ میلی‌متری آپکس رادیوگرافیک گسترش یافته است.`,
            flagReason: 'بررسی عدم وجود آندر/اورفیلینگ',
            linkedQuestionId: `q-${selectedClaim.id}-${idx + 1}-1`,
            isOverridden: false,
          },
        ],
        questions: [
          {
            id: `q-${selectedClaim.id}-${idx + 1}-1`,
            questionText: `آیا عصب‌کشی و سیل اپیکال دندان ${toFa(item.toothNumber || toothNum)} از نظر طول و تراکم گوتاپرکا در رادیوگرافی مورد تأیید است؟`,
            markerId: `mark-${selectedClaim.id}-${idx + 1}-1`,
            options: [
              { id: 'yes_complete', label: 'بلی - پرکردگی کامل و با تراکم استاندارد (Dense Obturation) ✅', isAiRecommended: true },
              { id: 'no_underfilled', label: 'خیر - پرکردگی ناقص (Underfilled بیش از ۲ میلی‌متر)' },
            ],
            selectedAnswer: 'yes_complete',
          },
        ],
      }));
    }

    return [
      {
        id: `line-${selectedClaim.id}-1`,
        toothNumber: `دندان ${toFa(toothNum)} (موقعیت خلفی)`,
        fdiCode: String(toothNum),
        serviceName: treatName,
        serviceCode: 'SRV-101',
        claimedAmount: claimAmountInRials,
        approvedAmount: claimAmountInRials,
        status: 'pending_doctor' as const,
        initialReviewerNote: reviewerNotes,
        radiographyUrl: DEFAULT_RVG_XRAY,
        radiographyTitle: `کلیشه رادیوگرافی دیجیتال RVG دندان ${toFa(toothNum)}`,
        aiMarkers: [
          {
            id: `mark-${selectedClaim.id}-1-1`,
            x: 48,
            y: 72,
            title: 'بررسی کیفیت رادیوگرافی و سیل انتهای ریشه',
            category: 'alert' as const,
            aiConfidence: 91,
            detectionText: 'سیل اپیکال و تراکم رادیواپسیته در حد استاندارد بالینی است.',
            flagReason: 'بررسی بالینی و تطبیق تصویر',
            linkedQuestionId: `q-${selectedClaim.id}-1-1`,
            isOverridden: false,
          },
        ],
        questions: [
          {
            id: `q-${selectedClaim.id}-1-1`,
            questionText: `آیا انجام خدمت «${treatName}» روی دندان ${toFa(toothNum)} از نظر شواهد رادیولوژی تایید می‌گردد؟`,
            markerId: `mark-${selectedClaim.id}-1-1`,
            options: [
              { id: 'yes_ok', label: 'بلی - شواهد رادیوگرافی و بالینی کاملاً منطبق و تایید است ✅', isAiRecommended: true },
              { id: 'no_defect', label: 'خیر - عدم انطباق با گرافی یا نقص در تکنیک' },
            ],
            selectedAnswer: 'yes_ok',
          },
        ],
      },
    ];
  }, [selectedClaim, claimLineItemsMap]);
  const [activeLineItemIndex, setActiveLineItemIndex] = useState<number>(0);
  const activeLineItem = activeLineItems[activeLineItemIndex] || activeLineItems[0] || null;

  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const activeMarker = activeLineItem ? (activeLineItem.aiMarkers?.find((m) => m.id === selectedMarkerId) || null) : null;

  // Professional PACS Radiology Viewer Controls State
  const [pacsZoom, setPacsZoom] = useState<number>(1);
  const [pacsContrast, setPacsContrast] = useState<number>(125);
  const [pacsBrightness, setPacsBrightness] = useState<number>(95);
  const [pacsInverted, setPacsInverted] = useState<boolean>(false);
  const [pacsShowGrid, setPacsShowGrid] = useState<boolean>(false);
  const [pacsShowAiLayer, setPacsShowAiLayer] = useState<boolean>(true);
  const [pacsShowCaliper, setPacsShowCaliper] = useState<boolean>(false);
  const [pacsMeasurementPoints, setPacsMeasurementPoints] = useState<{ x: number; y: number }[]>([
    { x: 45, y: 32 },
    { x: 47, y: 78 },
  ]);
  const [pacsIsDraggingPoint, setPacsIsDraggingPoint] = useState<number | null>(null);

  const [expandedQuestionIds, setExpandedQuestionIds] = useState<{ [qId: string]: boolean }>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideActionType, setOverrideActionType] = useState<'delete' | 'modify'>('modify');
  const [overridePin, setOverridePin] = useState<string>('4321');

  const [showDeepReviewSignatureModal, setShowDeepReviewSignatureModal] = useState<boolean>(false);

  // Appeal & Attached Evidence Handling
  const [selectedPacsImageOverrideUrl, setSelectedPacsImageOverrideUrl] = useState<string | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Derive whether the current claim has an appeal
  const isClaimAppealed = React.useMemo(() => {
    if (!selectedClaim) return false;
    return (
      selectedClaim.status === 'appealed' ||
      (selectedClaim.appeals && selectedClaim.appeals.length > 0) ||
      Boolean(selectedClaim.appealReason || selectedClaim.appealText) ||
      Boolean(selectedClaim.reviewerDiagnosis?.includes('اعتراض')) ||
      Boolean(selectedClaim.reviewerNotes?.includes('اعتراض'))
    );
  }, [selectedClaim]);

  const activeAppeal = React.useMemo(() => {
    if (!selectedClaim || !isClaimAppealed) return null;
    const firstAppeal = selectedClaim.appeals?.[0];
    const realEvidenceUrls = firstAppeal?.additionalEvidenceUrls || selectedClaim.additionalEvidenceUrls || [];
    const reviewerNoteText =
      selectedClaim.claimReviewerHandoverNote ||
      selectedClaim.medicalHandover?.note ||
      firstAppeal?.responseNotes ||
      (firstAppeal as any)?.claimReviewerNote ||
      selectedClaim.reviewerDiagnosis ||
      selectedClaim.reviewerNotes ||
      'اعتراض کلینیک مورد تأیید اولیه بازبین ادعا قرار گرفت و جهت تأیید کارشناسی نهایی رادیولوژی به پزشک معتمد ارجاع شد.';

    return {
      id: firstAppeal?.id || `app-${selectedClaim.id}`,
      createdAt: firstAppeal?.createdAt || '۱۴۰۵/۰۵/۲۰',
      reason: firstAppeal?.reason || selectedClaim.appealReason || selectedClaim.appealText || 'با استناد به تصویر گرافی RVG پیوست‌شده و بند ۱۲ آیین‌نامه بیمه، درمان کانال ریشه طبق پروتکل استاندارد انجام شده و کسورات فوق غیرمجاز می‌باشد.',
      submittedBy: firstAppeal?.submittedBy || 'حسابداری و پذیرش کلینیک دنتورا',
      dentistName: firstAppeal?.dentistName || selectedClaim.dentistName || 'دکتر کاویانی',
      category: (firstAppeal as any)?.category || 'کسورات غیرمجاز تعرفه‌ای و تقاضای بازبینی رادیولوژی RVG',
      ruleCitation: (firstAppeal as any)?.ruleCitation || 'بند ۱۲ آیین‌نامه تعرفه درمان شورای عالی بیمه',
      additionalEvidenceUrls: realEvidenceUrls,
      responseNotes: reviewerNoteText,
    };
  }, [selectedClaim, isClaimAppealed]);

  // Unique appeal images attached by accountant / clinic
  const appealAttachedImages = React.useMemo(() => {
    if (!selectedClaim) return [];
    const list: { id: string; title: string; url: string; uploader: string; date: string }[] = [];
    
    // 1. Images attached directly to the appeal by the accountant
    if (activeAppeal?.additionalEvidenceUrls && activeAppeal.additionalEvidenceUrls.length > 0) {
      activeAppeal.additionalEvidenceUrls.forEach((url, i) => {
        if (url && typeof url === 'string' && url.trim()) {
          list.push({
            id: `app-img-${i + 1}`,
            title: `کلیشه رادیوگرافی RVG دندان ${toFa(selectedClaim.toothFdi || 16)} (پیوست لایحه اعتراض ثبت‌شده توسط حسابدار)`,
            url,
            uploader: activeAppeal.submittedBy || 'حسابدار کلینیک',
            date: activeAppeal.createdAt || '۱۴۰۵/۰۵/۲۰',
          });
        }
      });
    }

    // 2. Images in selectedClaim.additionalEvidenceUrls
    if (selectedClaim.additionalEvidenceUrls && selectedClaim.additionalEvidenceUrls.length > 0) {
      selectedClaim.additionalEvidenceUrls.forEach((url, i) => {
        if (url && typeof url === 'string' && url.trim() && !list.some((img) => img.url === url)) {
          list.push({
            id: `claim-att-${i + 1}`,
            title: `تصویر رادیولوژی/مدرک ثبت‌شده توسط حسابدار دندان ${toFa(selectedClaim.toothFdi || 16)}`,
            url,
            uploader: 'حسابدار کلینیک',
            date: activeAppeal?.createdAt || '۱۴۰۵/۰۵/۲۰',
          });
        }
      });
    }

    // 3. Images in selectedClaim.evidences
    if (selectedClaim.evidences && selectedClaim.evidences.length > 0) {
      selectedClaim.evidences.forEach((ev, i) => {
        if (ev.fileUrl && !list.some((img) => img.url === ev.fileUrl)) {
          list.push({
            id: `ev-img-${i + 1}`,
            title: ev.title || `مدرک تصویری پرونده ${toFa(i + 1)}`,
            url: ev.fileUrl,
            uploader: 'پذیرش / حسابدار',
            date: '۱۴۰۵/۰۵/۲۰',
          });
        }
      });
    }

    return list;
  }, [selectedClaim, isClaimAppealed, activeAppeal]);

  const [aiOverridesLog, setAiOverridesLog] = useState<AIOverrideRecord[]>([
    {
      id: 'ovr-901',
      claimNumber: 'CLM-1403-8821',
      lineItemId: 'line-101',
      toothNumber: 'دندان ۱۶',
      markerTitle: 'تشخیص اولیه هوش مصنوعی در خصوص ضایعه اپیکال',
      originalAiFinding: 'احتمال ۸۲٪ ضایعه رادیولوسنت کوچک در انتهای کانال مزیوباکال',
      overrideActionText: 'اصلاح نظر هوش مصنوعی (رد وجود ضایعه با امضای غیرقابل تغییر)',
      doctorReason: 'با بررسی دقت ۹۵٪ در تصویر رادیولوژی RVG، لامینا دورا کاملاً پیوسته بوده و سایه موجود ناشی از هم‌پوشانی استخوان گونه است.',
      doctorName: 'دکتر حمید سجادی',
      timestamp: '۱۴۰۴/۰۵/۲۰ - ۱۱:۴۵:۱۰',
      wormKey: '0x8f2a-WORM-OVR-01',
      aiModelVersion: systemVersions.aiModel,
      rulesEngineVersion: systemVersions.rulesEngine,
      claimReviewerName: claimReviewerInfo.name,
      doctorSignatureStatus: 'امضا شده با PIN و کلید غیرقابل تغییر',
    },
  ]);

  const [auditTrailLogs, setAuditTrailLogs] = useState<AuditTrailRecord[]>([
    {
      id: 'aud-1001',
      claimNumber: 'CLM-1403-8821',
      patientName: 'مریم علوی',
      patientNationalId: '0019882143',
      clinicName: 'کلینیک دندانپزشکی پارس',
      claimedAmount: 3000000,
      serviceDate: '۱۴۰۴/۰۵/۱۵',
      primaryInsurerName: 'بیمه خدمات درمانی / تأمین اجتماعی',
      timestamp: '۱۴۰۴/۰۵/۲۰ - ۱۲:۳۰:۰۰',
      reviewMethod: 'deep',
      finalVerdict: 'partial',
      aiModelVersion: systemVersions.aiModel,
      rulesEngineVersion: systemVersions.rulesEngine,
      claimReviewerName: claimReviewerInfo.name,
      claimReviewerNote: claimReviewerInfo.note,
      medicalDoctorName: trustedDoctor.name,
      medicalDoctorCode: trustedDoctor.medicalCode,
      medicalDoctorVerdictText:
        'پس از ارزیابی کامل گرافی RVG دندان ۱۶، عصب‌کشی ۳ کاناله مورد تأیید است. روکش PFM به دلیل تخریب بالای ۵۰٪ تاج تأیید گردید.',
      doctorSummaryNote:
        'بر اساس ارزیابی هوش مصنوعی (Dental-Vision-AI v3.4.2-Pro) و تحلیل گرافی RVG:\n• پرونده CLM-1403-8821 مربوط به بیمار مریم علوی در کلینیک پارس بررسی گردید.\n• ۱ مورد هشدار هوش مصنوعی با نظر تخصصی پزشک معتمد رد و اصلاح گردید.\n• ۵ سوال کارشناسی بالینی در بخش دوم پاسخ داده شد.\n• نظر اولیه بازبین ادعا (سمیه محمدی): "پرونده از نظر سقف تعهدات و مدارک مالی اولیه احراز اولیه گردیده و جهت ارزیابی رادیولوژی و بالینی ارجاع شد."\n• جمع‌بندی پزشک معتمد: خدمات درمان ریشه و روکش PFM دندان ۱۶ کاملاً منطبق بر آیین‌نامه v2.1-2026 تأیید گردید.',
      isDigitallySigned: true,
      wormKey: trustedDoctor.wormKey,
      doctorPin: '۴۳۲۱',
      reproducibilityHash: 'sha256-0x98f21a0048e7192bcfa1',
      lineItemsSummary: [
        {
          toothNumber: 'دندان ۱۶ (فک بالا)',
          serviceName: 'درمان ریشه ۳ کاناله (END-3C)',
          questionsCount: 3,
          answersList: [
            {
              questionText: 'آیا کیفیت عصب‌کشی و اپیکال سیل کانال‌ها مورد تأیید است؟',
              answerLabel: 'بلی - اپیکال سیل کامل و استاندارد است ✅',
            },
            {
              questionText: 'آیا علائم Overfilling در کانال‌ها مشاهده می‌شود؟',
              answerLabel: 'خیر - ماده کاملاً داخل کانال است ✅',
            },
            {
              questionText: 'آیا ضایعه پری‌اپیکال فعال رویت می‌گردد؟',
              answerLabel: 'خیر - لامینا دورا پیوسته و سالم است ✅',
            },
          ],
        },
        {
          toothNumber: 'دندان ۱۶ (فک بالا)',
          serviceName: 'روکش سرامیکی PFM',
          questionsCount: 2,
          answersList: [
            {
              questionText: 'آیا تخریب دیواره‌های تاج دندان ۱۶ بیش از ۵۰٪ است؟',
              answerLabel: 'بلی - تخریب وسیع و ضرورت روکش ✅',
            },
            {
              questionText: 'آیا مارجین روکش روی خط خاتمه تراش استاندارد است؟',
              answerLabel: 'بلی - انطباق کامل و بدون درز ✅',
            },
          ],
        },
      ],
      aiOverridesList: [
        {
          id: 'ovr-901',
          claimNumber: 'CLM-1403-8821',
          lineItemId: 'line-101',
          toothNumber: 'دندان ۱۶',
          markerTitle: 'تشخیص اولیه هوش مصنوعی در خصوص ضایعه اپیکال',
          originalAiFinding: 'احتمال ۸۲٪ ضایعه رادیولوسنت کوچک در انتهای کانال مزیوباکال',
          overrideActionText: 'اصلاح نظر هوش مصنوعی (رد وجود ضایعه با امضای غیرقابل تغییر)',
          doctorReason: 'با بررسی دقت ۹۵٪ در تصویر رادیولوژی RVG، لامینا دورا کاملاً پیوسته بوده و سایه موجود ناشی از هم‌پوشانی استخوان گونه است.',
          doctorName: 'دکتر حمید سجادی',
          timestamp: '۱۴۰۴/۰۵/۲۰ - ۱۱:۴۵:۱۰',
          wormKey: '0x8f2a-WORM-OVR-01',
          aiModelVersion: systemVersions.aiModel,
          rulesEngineVersion: systemVersions.rulesEngine,
          claimReviewerName: claimReviewerInfo.name,
          doctorSignatureStatus: 'امضا شده با PIN و کلید غیرقابل تغییر',
        },
      ],
    },
  ]);

  const [selectedAuditDetailModal, setSelectedAuditDetailModal] = useState<AuditTrailRecord | null>(null);
  const [finalVerdict, setFinalVerdict] = useState<'approved' | 'partial' | 'partial_rejection' | 'rejected'>('partial');
  const [reviewerSummaryText, setReviewerSummaryText] = useState<string>('');
  const [doctorPin, setDoctorPin] = useState<string>('4321');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');

  // Step 5: Electronic Prescription & Secretary Follow-up State
  const [isSendingPrescription, setIsSendingPrescription] = useState<boolean>(false);
  const [prescriptionSent, setPrescriptionSent] = useState<boolean>(false);
  const [prescriptionTrackingCode, setPrescriptionTrackingCode] = useState<string>('IR-170075');
  const [copiedTrackingCode, setCopiedTrackingCode] = useState<boolean>(false);
  const [optionalVisitTime, setOptionalVisitTime] = useState<string>('');
  const [optionalSecretaryMsg, setOptionalSecretaryMsg] = useState<string>('');
  const [secretaryMsgSent, setSecretaryMsgSent] = useState<boolean>(false);

  useEffect(() => {
    if (selectedClaim) {
      const aiMarkersCount = activeLineItems.reduce((acc, item) => acc + (item.aiMarkers?.length || 0), 0);
      const overridesCount = activeLineItems.reduce(
        (acc, item) => acc + (item.aiMarkers?.filter((m) => m.isOverridden)?.length || 0),
        0
      );
      const answeredCount = activeLineItems.flatMap((i) => i.questions || []).filter((q) => q.selectedAnswer).length;

      if (isClaimAppealed && activeAppeal) {
        let summary = `بر اساس بررسی لایحه دفاعیه اعتراض کلینیک و مدارک ضمیمه رادیولوژی RVG در ویوور PACS:\n`;
        summary += `• پرونده اعتراضی ${selectedClaim.claimNumber} مربوط به بیمار ${selectedClaim.patientName} در کلینیک ${selectedClaim.clinicName} مورد کارشناسی مجدد قرار گرفت.\n`;
        summary += `• لایحه دفاعیه حسابدار مبنی بر «${activeAppeal.reason}» و استناد به «${activeAppeal.ruleCitation}» تطبیق داده شد.\n`;
        summary += `• مدارک رادیولوژی RVG ضمیمه‌شده در ویوور PACS ارزیابی شد؛ اپیکال سیل کامل و تراکم گوتاپرکا تا آپکس رادیوگرافیک مورد تأیید بالینی است.\n`;
        summary += `• تعداد ${toFa(answeredCount)} سوال کارشناسی بالینی پاسخ داده شد و انطباق با ضوابط قانونی احراز گردید.\n`;
        summary += `• نظر اولیه بازبین ادعا (${selectedClaim.claimReviewerName || claimReviewerInfo.name}): "${activeAppeal.responseNotes || claimReviewerInfo.note}"\n`;
        summary += `• جمع‌بندی پزشک معتمد (${trustedDoctor.name}): با توجه به احراز شرایط درمانی و صحت گرافی، لایحه اعتراض کلینیک پذیرفته شده و کسورات اولیه ملغی می‌گردد.`;

        setReviewerSummaryText(summary);
        setFinalVerdict('approved');
      } else {
        let summary = `بر اساس ارزیابی هوش مصنوعی (${systemVersions.aiModel}) و تحلیل گرافی RVG:\n`;
        summary += `• پرونده ${selectedClaim.claimNumber} مربوط به بیمار ${selectedClaim.patientName} در ${selectedClaim.clinicName} بررسی گردید.\n`;
        summary += `• تعداد ${toFa(aiMarkersCount)} نقطه آنالیز هوش مصنوعی ارزیابی گردید که ${
          overridesCount > 0
            ? `${toFa(overridesCount)} مورد آن با نظر تخصصی پزشک معتمد تغییر/اصلاح یافت`
            : 'تماماً مورد تأیید قرار گرفت'
        }.\n`;
        summary += `• تعداد ${toFa(answeredCount)} سوال کارشناسی بالینی در بخش دوم پاسخ داده شد.\n`;
        summary += `• نظر اولیه بازبین ادعا (${claimReviewerInfo.name}): "${claimReviewerInfo.note}"\n`;
        summary += `• جمع‌بندی پزشک معتمد: پس از تطبیق با آئین‌نامه ${systemVersions.rulesEngine}، اسناد و گرافی‌های درمانی فاقد مغایرت قانونی شناخته شد.`;

        setReviewerSummaryText(summary);
      }
    }
  }, [selectedClaimId, activeStep, isClaimAppealed, activeAppeal]);

  const toggleQuestionExpansion = (qId: string) => {
    setExpandedQuestionIds((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    const updatedLineItems = activeLineItems.map((item, idx) => {
      if (idx !== activeLineItemIndex) return item;

      const updatedQuestions = item.questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, selectedAnswer: answerId };
        }
        return q;
      });

      return { ...item, questions: updatedQuestions };
    });

    setClaimLineItemsMap({
      ...claimLineItemsMap,
      [selectedClaim.id]: updatedLineItems,
    });
  };

  const handleNextQuestion = () => {
    if (activeLineItem && activeQuestionIndex < activeLineItem.questions.length - 1) {
      const nextIdx = activeQuestionIndex + 1;
      setActiveQuestionIndex(nextIdx);
      const nextQ = activeLineItem.questions[nextIdx];
      if (nextQ) {
        setExpandedQuestionIds((prev) => ({ ...prev, [nextQ.id]: true }));
        if (nextQ.markerId) {
          setSelectedMarkerId(nextQ.markerId);
        }
      }
    } else if (activeLineItemIndex < activeLineItems.length - 1) {
      const nextLineIdx = activeLineItemIndex + 1;
      setActiveLineItemIndex(nextLineIdx);
      setActiveQuestionIndex(0);
      setSelectedMarkerId(null);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0 && activeLineItem) {
      const prevIdx = activeQuestionIndex - 1;
      setActiveQuestionIndex(prevIdx);
      const prevQ = activeLineItem.questions[prevIdx];
      if (prevQ) {
        setExpandedQuestionIds((prev) => ({ ...prev, [prevQ.id]: true }));
        if (prevQ.markerId) {
          setSelectedMarkerId(prevQ.markerId);
        }
      }
    } else if (activeLineItemIndex > 0) {
      const prevLineIdx = activeLineItemIndex - 1;
      setActiveLineItemIndex(prevLineIdx);
      const prevItems = claimLineItemsMap[selectedClaim.id] || [];
      const lineItem = prevItems[prevLineIdx];
      setActiveQuestionIndex(lineItem ? Math.max(0, lineItem.questions.length - 1) : 0);
      setSelectedMarkerId(null);
    }
  };

  const handleExecuteAIOverride = () => {
    if (!activeMarker || !overrideReason.trim()) return;
    if (!overridePin || overridePin !== '4321') {
      alert('لطفاً کد PIN اختصاصی امضای دیجیتال (۴۳۲۱) را جهت ثبت اورراید صحیح وارد کنید.');
      return;
    }

    const updatedLineItems = activeLineItems.map((item, idx) => {
      if (idx !== activeLineItemIndex) return item;

      const updatedMarkers = item.aiMarkers.map((mk) => {
        if (mk.id === activeMarker.id) {
          return {
            ...mk,
            isOverridden: true,
            overrideReason: overrideReason,
            overriddenAt: new Date().toLocaleTimeString('fa-IR'),
            overriddenAction: overrideActionType,
          };
        }
        return mk;
      });

      return { ...item, aiMarkers: updatedMarkers };
    });

    setClaimLineItemsMap({
      ...claimLineItemsMap,
      [selectedClaim.id]: updatedLineItems,
    });

    const newOverrideRecord: AIOverrideRecord = {
      id: `ovr-${Date.now()}`,
      claimNumber: selectedClaim.claimNumber,
      lineItemId: activeLineItem.id,
      toothNumber: activeLineItem.toothNumber,
      markerTitle: activeMarker.title,
      originalAiFinding: `${activeMarker.detectionText} (اطمینان AI: ${toFa(activeMarker.aiConfidence)}٪)`,
      overrideActionText:
        overrideActionType === 'delete'
          ? 'حذف کامل هشدار هوش مصنوعی با امضای دیجیتال'
          : 'اصلاح نظر هوش مصنوعی با امضای دیجیتال',
      doctorReason: overrideReason,
      doctorName: trustedDoctor.name,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR'),
      wormKey: `${trustedDoctor.wormKey}-SIGNED-PIN-${overridePin}`,
      aiModelVersion: systemVersions.aiModel,
      rulesEngineVersion: systemVersions.rulesEngine,
      claimReviewerName: claimReviewerInfo.name,
      doctorSignatureStatus: 'امضا شده با PIN و کلید غیرقابل تغییر',
    };

    setAiOverridesLog([newOverrideRecord, ...aiOverridesLog]);
    setShowOverrideModal(false);
    setOverrideReason('');
    setSelectedMarkerId(null);

    setModalMessage(
      `هشدار هوش مصنوعی برای «${activeMarker.title}» با امضای دیجیتال و کد PIN پزشک معتمد (${trustedDoctor.name}) ویرایش شد و در دفترچه حسابرسی قفل گردید.`
    );
    setShowSuccessModal(true);
  };

  const handleSubmitSection3FinalVerdict = () => {
    executeSaveAuditRecord(true);
  };

  const executeSaveAuditRecord = (isSigned: boolean) => {
    const lineItemsSummary = activeLineItems.map((item) => {
      const answersList = item.questions.map((q) => {
        const foundOpt = q.options.find((o) => o.id === q.selectedAnswer);
        return {
          questionText: q.questionText,
          answerLabel: foundOpt ? foundOpt.label : 'پاسخ داده نشده',
        };
      });

      return {
        toothNumber: item.toothNumber,
        serviceName: item.serviceName,
        questionsCount: item.questions.length,
        answersList,
      };
    });

    const activeOverridesForClaim = aiOverridesLog.filter((l) => l.claimNumber === selectedClaim.claimNumber);

    const verdictLabelsMap = {
      approved: 'تأیید کامل بالینی خدمت',
      partial: 'تأیید جزئی همراه با اعمال کسورات قانونی',
      partial_rejection: 'رد جزئی خدمت ارائه‌شده',
      rejected: 'رد کامل ادعای درمانی',
    };

    const newAuditRecord: AuditTrailRecord = {
      id: `aud-${Date.now()}`,
      claimNumber: selectedClaim.claimNumber,
      patientName: selectedClaim.patientName,
      patientNationalId: selectedClaim.patientNationalId,
      clinicName: selectedClaim.clinicName,
      claimedAmount: selectedClaim.claimedAmount || selectedClaim.totalClaimedAmount,
      serviceDate: selectedClaim.serviceDate,
      primaryInsurerName: selectedClaim.primaryInsurerName,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR'),
      reviewMethod: reviewMethod,
      finalVerdict: finalVerdict,
      aiModelVersion: systemVersions.aiModel,
      rulesEngineVersion: systemVersions.rulesEngine,
      claimReviewerName: claimReviewerInfo.name,
      claimReviewerNote: claimReviewerInfo.note,
      medicalDoctorName: trustedDoctor.name,
      medicalDoctorCode: trustedDoctor.medicalCode,
      medicalDoctorVerdictText: verdictLabelsMap[finalVerdict],
      doctorSummaryNote: reviewerSummaryText,
      isDigitallySigned: isSigned,
      wormKey: isSigned ? trustedDoctor.wormKey : undefined,
      doctorPin: isSigned ? doctorPin : undefined,
      reproducibilityHash: `sha256-0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      lineItemsSummary,
      aiOverridesList: activeOverridesForClaim,
    };

    setAuditTrailLogs([newAuditRecord, ...auditTrailLogs]);
    setShowDeepReviewSignatureModal(false);

    const mappedStatus: 'approved' | 'partially_approved' | 'rejected' =
      finalVerdict === 'approved'
        ? 'approved'
        : finalVerdict === 'rejected'
        ? 'rejected'
        : 'partially_approved';

    const claimAmount = selectedClaim.claimedAmount || selectedClaim.totalClaimedAmount || 5200000;
    const isApprovedOrPartial = mappedStatus === 'approved' || mappedStatus === 'partially_approved';
    const deduction = mappedStatus === 'approved' ? 0 : (mappedStatus === 'partially_approved' ? Math.round(claimAmount * 0.2) : claimAmount);
    const approvedTotal = Math.max(0, claimAmount - deduction);

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== selectedClaim.id) return c;
        const updatedAppeals = (c.appeals || []).map((a) => ({
          ...a,
          status: isApprovedOrPartial ? ('accepted' as const) : ('rejected' as const),
          responseNotes: `نظر نهایی بازبین پزشکی (${trustedDoctor.name}): ${reviewerSummaryText}`,
        }));
        return {
          ...c,
          appeals: updatedAppeals,
          status: isApprovedOrPartial ? ('settled' as const) : ('rejected' as const),
          deductionAmount: deduction,
          totalApprovedAmount: isApprovedOrPartial ? approvedTotal : 0,
          baseApprovedAmount: isApprovedOrPartial ? (c.baseApprovedAmount || Math.round(approvedTotal * 0.3)) : 0,
          supplApprovedAmount: isApprovedOrPartial ? (c.supplApprovedAmount || Math.round(approvedTotal * 0.7)) : 0,
          deductionReason: mappedStatus === 'approved' ? undefined : reviewerSummaryText,
          rejectionReason: mappedStatus === 'approved' ? undefined : reviewerSummaryText,
          doctorReviewerDiagnosis: reviewerSummaryText,
        };
      })
    );

    if (onReviewDecision) {
      onReviewDecision(selectedClaim.id, mappedStatus, deduction, reviewerSummaryText);
    }

    if (isSigned) {
      setModalMessage(
        `پرونده ${selectedClaim.claimNumber} به دلیل بررسی در «روش دقیق (> ۵۵٪)» با امضای دیجیتال و کد PIN پزشک معتمد (${trustedDoctor.name}) قفل گردید.`
      );
    } else {
      setModalMessage(
        `پرونده ${selectedClaim.claimNumber} با موفقیت بدون نیاز به امضای دیجیتال ثبت گردید.`
      );
    }

    setShowSuccessModal(true);
  };

  const handleSendToElectronicPrescription = () => {
    setIsSendingPrescription(true);
    setPrescriptionSent(false);
    setTimeout(() => {
      setIsSendingPrescription(false);
      setPrescriptionSent(true);
      setPrescriptionTrackingCode('IR-170075');
    }, 1300);
  };

  const handleSendSecretaryMessage = () => {
    if (!optionalSecretaryMsg.trim() && !optionalVisitTime.trim()) return;
    setSecretaryMsgSent(true);
    setTimeout(() => setSecretaryMsgSent(false), 4000);
  };

  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      c.claimNumber.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      (c.clinicName || '').toLowerCase().includes(queueSearchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (reviewMethod === 'fast') return c.riskScore <= 20;
    if (reviewMethod === 'standard') return c.riskScore > 20 && c.riskScore <= 55;
    return c.riskScore > 55;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#fffffa] min-h-screen text-[#005581] font-sans relative" dir="rtl">
      {/* POPUP MODAL: AI OVERRIDE / DELETE WITH DIGITAL SIGNATURE */}
      {showOverrideModal && activeMarker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fffffa] border-4 border-[#005581] p-6 rounded-3xl shadow-2xl max-w-lg w-full space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#72cdf4]">
              <div className="flex items-center gap-2 text-[#005581]">
                <ShieldAlert className="w-6 h-6 text-[#005581]" />
                <h3 className="text-sm font-black">امضای دیجیتال جهت تغییر یا حذف هشدار هوش مصنوعی</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="p-1 hover:bg-[#72cdf4]/20 rounded-lg text-[#005581]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#ffe552]/20 border border-[#ffd200] p-3.5 rounded-2xl space-y-1.5 text-xs">
              <div className="font-black text-[#005581]">علامت انتخاب‌شده: {activeMarker.title}</div>
              <div className="text-[11px] font-bold text-[#005581]/80">
                تشخیص اولیه هوش مصنوعی: {activeMarker.detectionText}
              </div>
              <div className="text-[10px] text-[#005581] font-bold">
                درجه اطمینان هوش مصنوعی: {toFa(activeMarker.aiConfidence)}٪
              </div>
            </div>

            {/* Override Action Type */}
            <div className="space-y-2 text-xs">
              <label className="font-black text-[#005581] block">نوع اقدام روی هشدار AI:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOverrideActionType('modify')}
                  className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center gap-2 justify-center ${
                    overrideActionType === 'modify'
                      ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                      : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                  }`}
                >
                  <Edit3 className="w-4 h-4 text-[#ffd200]" />
                  <span>اصلاح نظر هوش مصنوعی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideActionType('delete')}
                  className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center gap-2 justify-center ${
                    overrideActionType === 'delete'
                      ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                      : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-[#ffd200]" />
                  <span>حذف کامل هشدار</span>
                </button>
              </div>
            </div>

            {/* Doctor Reason */}
            <div className="space-y-2 text-xs">
              <label className="font-black text-[#005581] block">
                علت علمی و بالینی اورراید (جهت ثبت در تاریخچه حسابرسی): <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="دلایل تخصصی بالینی را وارد کنید (مثلاً: سایه رادیولوژی هم‌پوشانی استخوانی بوده و ضایعه اپیکال نیست...)"
                className="w-full p-3 rounded-xl border-2 border-[#005581] bg-white text-xs text-[#005581] font-bold focus:outline-none focus:ring-2 focus:ring-[#72cdf4]"
              />
            </div>

            {/* PIN Entry */}
            <div className="bg-[#72cdf4]/15 p-3.5 rounded-2xl border border-[#72cdf4] space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#005581]">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#005581]" />
                  <span>امضای دیجیتال پزشک معتمد:</span>
                </span>
                <span className="font-mono text-[10px] bg-[#005581] text-white px-2 py-0.5 rounded">
                  {trustedDoctor.wormKey}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="password"
                  value={overridePin}
                  onChange={(e) => setOverridePin(e.target.value)}
                  placeholder="کد PIN اختصاصی (۴۳۲۱)"
                  className="w-36 p-2 rounded-xl border-2 border-[#005581] text-center font-mono text-xs font-black bg-white text-[#005581]"
                />
                <span className="text-[11px] text-[#005581] font-bold">
                  پزشک: {trustedDoctor.name} ({trustedDoctor.medicalCode})
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#72cdf4] text-[#005581] font-black text-xs hover:bg-[#72cdf4]/10"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleExecuteAIOverride}
                disabled={!overrideReason.trim()}
                className="bg-[#005581] hover:bg-[#003d5c] disabled:opacity-50 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#ffd200]" />
                <span>تأیید و امضای دیجیتال اورراید</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: DIGITAL SIGNATURE FOR DEEP REVIEW SUBMISSION */}
      {showDeepReviewSignatureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fffffa] border-4 border-[#005581] p-6 rounded-3xl shadow-2xl max-w-lg w-full space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#72cdf4]">
              <div className="flex items-center gap-2 text-[#005581]">
                <ShieldCheck className="w-6 h-6 text-[#005581]" />
                <h3 className="text-sm font-black">امضای دیجیتال اجباری جهت ثبت رای نهایی در «روش دقیق»</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeepReviewSignatureModal(false)}
                className="p-1 hover:bg-[#72cdf4]/20 rounded-lg text-[#005581]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#ffe552]/20 border border-[#ffd200] p-4 rounded-2xl space-y-2 text-xs text-[#005581]">
              <div className="font-black">پرونده: {selectedClaim.claimNumber} | بیمار: {selectedClaim.patientName}</div>
              <div className="font-bold">
                روش بررسی فعال:{' '}
                <span className="bg-[#005581] text-[#ffd200] px-2.5 py-0.5 rounded text-[11px] font-black">
                  روش دقیق (Deep Review)
                </span>
              </div>
              <div className="text-[11px] leading-relaxed">
                بر اساس دستورالعمل بیمه‌ای، ثبت رای نهایی در روش دقیق مستلزم تأیید هویت دیجیتال و قفل سخت‌افزاری غیرقابل تغییر پزشک معتمد است.
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-[#72cdf4] space-y-1">
                <div className="font-black text-[#005581]">نام پزشک معتمد صادرکننده: {trustedDoctor.name}</div>
                <div className="text-[11px] font-bold text-[#005581]/80">
                  کد نظام پزشکی: {trustedDoctor.medicalCode} | {trustedDoctor.specialty}
                </div>
                <div className="text-[10px] font-mono text-[#005581]">کلید قفل سخت‌افزاری: {trustedDoctor.wormKey}</div>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-[#005581] block">کد PIN امضای دیجیتال پزشک معتمد: <span className="text-red-600">*</span></label>
                <input
                  type="password"
                  value={doctorPin}
                  onChange={(e) => setDoctorPin(e.target.value)}
                  placeholder="کد PIN اختصاصی (۴۳۲۱)"
                  className="w-full p-3 rounded-xl border-2 border-[#005581] text-center font-mono text-sm font-black bg-white text-[#005581] focus:outline-none focus:ring-2 focus:ring-[#72cdf4]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#72cdf4]">
              <button
                type="button"
                onClick={() => setShowDeepReviewSignatureModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#72cdf4] text-[#005581] font-black text-xs hover:bg-[#72cdf4]/10"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!doctorPin || doctorPin !== '4321') {
                    alert('کد PIN وارد شده اشتباه است. لطفاً ۴۳۲۱ را وارد نمایید.');
                    return;
                  }
                  executeSaveAuditRecord(true);
                }}
                className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#ffd200]" />
                <span>امضای دیجیتال و قفل قانونی رای</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: DETAILED AUDIT TRAIL RECORD */}
      {selectedAuditDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fffffa] border-4 border-[#005581] p-6 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-6 text-right">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#72cdf4] sticky top-0 bg-[#fffffa] z-10 pt-1">
              <div className="flex items-center gap-2 text-[#005581]">
                <BookOpen className="w-6 h-6 text-[#005581]" />
                <h3 className="text-sm font-black">
                  شناسنامه و دفترچه کامل حسابرسی حقوقی پرونده {selectedAuditDetailModal.claimNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditDetailModal(null)}
                className="p-1 hover:bg-[#72cdf4]/20 rounded-lg text-[#005581]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#72cdf4]/15 p-3 rounded-xl border border-[#72cdf4]">
                <span className="text-[10px] text-[#005581]/70 block font-bold">بیمار / کلینیک:</span>
                <span className="font-black text-[#005581]">{selectedAuditDetailModal.patientName}</span>
                <span className="text-[10px] block opacity-80">{selectedAuditDetailModal.clinicName}</span>
              </div>

              <div className="bg-[#72cdf4]/15 p-3 rounded-xl border border-[#72cdf4]">
                <span className="text-[10px] text-[#005581]/70 block font-bold">مبلغ ادعا / کد ملی:</span>
                <span className="font-black text-[#005581]">
                  {toFa((selectedAuditDetailModal.claimedAmount || 3000000).toLocaleString('fa-IR'))} ریال
                </span>
                <span className="text-[10px] block opacity-80 font-mono">
                  کد ملی: {selectedAuditDetailModal.patientNationalId || '0019882143'}
                </span>
              </div>

              <div className="bg-[#72cdf4]/15 p-3 rounded-xl border border-[#72cdf4]">
                <span className="text-[10px] text-[#005581]/70 block font-bold">روش ارزیابی:</span>
                <span className="font-black text-[#005581]">
                  {selectedAuditDetailModal.reviewMethod === 'deep'
                    ? 'روش دقیق (Deep Review)'
                    : selectedAuditDetailModal.reviewMethod === 'standard'
                    ? 'روش استاندارد'
                    : 'روش سریع AI'}
                </span>
              </div>

              <div className="bg-[#72cdf4]/15 p-3 rounded-xl border border-[#72cdf4]">
                <span className="text-[10px] text-[#005581]/70 block font-bold">وضعیت امضای دیجیتال:</span>
                <span
                  className={`font-black text-[11px] px-2 py-0.5 rounded inline-block mt-0.5 ${
                    selectedAuditDetailModal.isDigitallySigned
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {selectedAuditDetailModal.isDigitallySigned
                    ? 'امضا شده با کلید غیرقابل تغییر'
                    : 'ثبت مستقیم (بدون امضا)'}
                </span>
              </div>
            </div>

            {selectedAuditDetailModal.doctorSummaryNote && (
              <div className="bg-[#ffe552]/20 p-4 rounded-2xl border-2 border-[#ffd200] space-y-2 text-xs text-[#005581]">
                <h4 className="font-black border-b border-[#ffd200] pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#005581]" />
                  <span>متن بخش نوشتاری (خلاصه نظریه کارشناسی برگرفته از هوش مصنوعی و بازبین):</span>
                </h4>
                <div className="text-xs font-bold leading-relaxed whitespace-pre-line pt-1">
                  {selectedAuditDetailModal.doctorSummaryNote}
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border-2 border-[#005581] space-y-3 text-xs text-[#005581]">
              <h4 className="font-black border-b border-[#72cdf4] pb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#005581]" />
                <span>اطلاعات مدل هوش مصنوعی، آیین‌نامه و کارشناسان پرونده:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="font-black">نسخه مدل هوش مصنوعی: </span>
                  <span className="font-mono bg-[#72cdf4]/20 px-2 py-0.5 rounded text-[11px]">
                    {selectedAuditDetailModal.aiModelVersion}
                  </span>
                </div>

                <div>
                  <span className="font-black">نسخه قواعد و آیین‌نامه پین‌شده: </span>
                  <span className="font-mono bg-[#ffe552]/40 px-2 py-0.5 rounded text-[11px]">
                    {selectedAuditDetailModal.rulesEngineVersion}
                  </span>
                </div>

                <div className="bg-[#72cdf4]/10 p-2.5 rounded-xl border border-[#72cdf4]/40">
                  <span className="font-black block">بازبین اولیه ادعا: </span>
                  <span className="font-bold">{selectedAuditDetailModal.claimReviewerName}</span>
                  <div className="text-[11px] opacity-90 mt-1 font-bold">
                    ملاحظات: {selectedAuditDetailModal.claimReviewerNote}
                  </div>
                </div>

                <div className="bg-[#72cdf4]/10 p-2.5 rounded-xl border border-[#72cdf4]/40">
                  <span className="font-black block">پزشک معتمد صادرکننده رای: </span>
                  <span className="font-bold">
                    {selectedAuditDetailModal.medicalDoctorName} ({selectedAuditDetailModal.medicalDoctorCode})
                  </span>
                  {selectedAuditDetailModal.isDigitallySigned && (
                    <div className="text-[10px] text-emerald-800 font-mono mt-1 font-bold">
                      کلید غیرقابل تغییر: {selectedAuditDetailModal.wormKey}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#005581]">
              <h4 className="font-black border-b border-[#72cdf4] pb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#005581]" />
                <span>خلاصه کامل پاسخ‌های کارشناسی بخش دوم:</span>
              </h4>

              <div className="space-y-3">
                {selectedAuditDetailModal.lineItemsSummary.map((item, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#72cdf4] space-y-2">
                    <div className="font-black text-[#005581] flex items-center justify-between">
                      <span>
                        {item.toothNumber} - {item.serviceName}
                      </span>
                      <span className="bg-[#72cdf4]/20 text-[10px] px-2 py-0.5 rounded">
                        {toFa(item.answersList.length)} سؤال پاسخ‌داده‌شده
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {item.answersList.map((ans, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-[#fffffa] p-2 rounded-lg border border-[#72cdf4]/50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1"
                        >
                          <span className="font-bold opacity-90">{ans.questionText}</span>
                          <span className="font-black text-[#005581] bg-[#ffe552]/30 px-2 py-0.5 rounded shrink-0">
                            {ans.answerLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#72cdf4]/10 p-3 rounded-xl border border-[#72cdf4] text-[10px] font-mono text-[#005581] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>هش فنگرپرینت بازتولیدپذیری: {selectedAuditDetailModal.reproducibilityHash}</span>
              <span>زمان ثبت: {selectedAuditDetailModal.timestamp}</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#72cdf4]">
              <button
                type="button"
                onClick={() => setSelectedAuditDetailModal(null)}
                className="bg-[#005581] text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-[#003d5c]"
              >
                بستن شناسنامه حسابرسی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fffffa] border-4 border-[#005581] p-6 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-4 transform transition-all scale-100">
            <div className="w-16 h-16 bg-[#ffe552] rounded-full flex items-center justify-center mx-auto border-2 border-[#ffd200] shadow-md">
              <CheckCircle2 className="w-10 h-10 text-[#005581]" />
            </div>
            <h3 className="text-base font-black text-[#005581]">عملیات با موفقیت انجام شد</h3>
            <p className="text-xs font-black text-[#005581] leading-relaxed bg-[#72cdf4]/20 p-4 rounded-2xl border border-[#72cdf4]">
              {modalMessage}
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="bg-[#005581] hover:bg-[#003d5c] text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-105"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER BANNER */}
      <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#005581] flex items-center justify-center text-white shadow-md border border-[#72cdf4]/40 shrink-0">
            <Stethoscope className="w-7 h-7 text-[#ffd200]" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#005581]">
              میزکار پزشک معتمد / بازبین پزشکی (Medical Reviewer Workspace)
            </h1>
            <div className="text-xs font-bold text-[#005581]/80 mt-0.5">
              سامانه ارزیابی بالینی، بررسی گرافی رادیولوژی و کارشناسی پرونده‌های بیمه‌ای
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-[#005581] text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-[#72cdf4]/40 flex items-center gap-3 shadow-sm">
            <User className="w-5 h-5 text-[#ffd200] shrink-0" />
            <div>
              <div className="font-black text-white text-xs">{trustedDoctor.name}</div>
              <div className="text-[10px] text-[#72cdf4] font-bold">
                {trustedDoctor.specialty} ({trustedDoctor.medicalCode})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RIGHT NAVIGATION MENU */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#fffffa] rounded-2xl p-4 border-2 border-[#005581] space-y-2 shadow-sm sticky top-20">
            <h2 className="text-xs font-black text-[#005581] px-2 py-1 border-b border-[#72cdf4] flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-[#005581]" />
              <span>فرآیند ارزیابی بالینی بیمه</span>
            </h2>

            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`w-full text-right p-3.5 rounded-xl text-xs transition-all flex items-start gap-3 border ${
                activeStep === 1
                  ? 'bg-[#005581] text-white border-[#005581] shadow-md font-black'
                  : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10 font-bold'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                  activeStep === 1 ? 'bg-[#ffd200] text-[#005581]' : 'bg-[#72cdf4]/30 text-[#005581]'
                }`}
              >
                ۱
              </div>
              <div>
                <div className="font-black">۱. ورودی ادعا</div>
                <div className={`text-[10px] mt-0.5 ${activeStep === 1 ? 'text-[#72cdf4]' : 'text-[#005581]/70'}`}>
                  اطلاعات ارسالی توسط بازبین ادعا
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`w-full text-right p-3.5 rounded-xl text-xs transition-all flex items-start gap-3 border ${
                activeStep === 2
                  ? 'bg-[#005581] text-white border-[#005581] shadow-md font-black'
                  : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10 font-bold'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                  activeStep === 2 ? 'bg-[#ffd200] text-[#005581]' : 'bg-[#72cdf4]/30 text-[#005581]'
                }`}
              >
                ۲
              </div>
              <div>
                <div className="font-black">۲. بررسی ادعا</div>
                <div className={`text-[10px] mt-0.5 ${activeStep === 2 ? 'text-[#72cdf4]' : 'text-[#005581]/70'}`}>
                  سؤالات گام‌به‌گام & رادیولوژی
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`w-full text-right p-3.5 rounded-xl text-xs transition-all flex items-start gap-3 border ${
                activeStep === 3
                  ? 'bg-[#005581] text-white border-[#005581] shadow-md font-black'
                  : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10 font-bold'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                  activeStep === 3 ? 'bg-[#ffd200] text-[#005581]' : 'bg-[#72cdf4]/30 text-[#005581]'
                }`}
              >
                ۳
              </div>
              <div>
                <div className="font-black">۳. ثبت رای نهایی</div>
                <div className={`text-[10px] mt-0.5 ${activeStep === 3 ? 'text-[#72cdf4]' : 'text-[#005581]/70'}`}>
                  خلاصه اطلاعات & امضا در روش دقیق
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className={`w-full text-right p-3.5 rounded-xl text-xs transition-all flex items-start gap-3 border ${
                activeStep === 4
                  ? 'bg-[#005581] text-white border-[#005581] shadow-md font-black'
                  : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10 font-bold'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                  activeStep === 4 ? 'bg-[#ffd200] text-[#005581]' : 'bg-[#72cdf4]/30 text-[#005581]'
                }`}
              >
                ۴
              </div>
              <div>
                <div className="font-black">۴. تاریخچه حسابرسی</div>
                <div className={`text-[10px] mt-0.5 ${activeStep === 4 ? 'text-[#72cdf4]' : 'text-[#005581]/70'}`}>
                  ثبت وقایع حقوقی و آیین‌نامه
                </div>
              </div>
            </button>

            <div className="bg-[#72cdf4]/10 p-3.5 rounded-xl border border-[#72cdf4] space-y-2 pt-3 mt-4 text-xs">
              <div className="flex items-center justify-between text-[#005581] font-black">
                <span>پرونده فعال:</span>
                <span className="bg-[#005581] text-white px-2 py-0.5 rounded text-[10px]">
                  {selectedClaim.claimNumber}
                </span>
              </div>
              <div className="text-[11px] text-[#005581] font-bold">بیمار: {selectedClaim.patientName}</div>
              <div className="text-[11px] text-[#005581] font-bold">کلینیک: {selectedClaim.clinicName}</div>
              <div className="text-[11px] text-[#005581] font-bold flex items-center justify-between">
                <span>سطح اعتماد کلینیک:</span>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-black">
                  L3 (Dentora Verified)
                </span>
              </div>
              <div className="text-[10px] text-[#005581]/80 font-bold">
                تعداد ردیف ادعا: <span className="text-[#005581] font-black">{toFa(activeLineItems.length)} خدمت</span>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="lg:col-span-9 space-y-6">
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#72cdf4] gap-2">
                  <h2 className="text-xs font-black text-[#005581] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#005581]" />
                    <span>انتخاب روش بررسی و صف پرونده‌های ارجاعی (Queue & Method Selection)</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-3 py-1 rounded-full border border-[#ffd200]">
                      ورودی ادعا
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewMethod('fast')}
                    className={`p-4 rounded-2xl border text-xs font-black text-right transition-all space-y-2 relative overflow-hidden ${
                      reviewMethod === 'fast'
                        ? 'bg-[#005581] text-white border-[#005581] shadow-lg ring-2 ring-[#ffd200] scale-[1.01]'
                        : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-black text-xs">
                        <Zap className="w-4 h-4 text-[#ffd200]" />
                        <span>۱. بررسی سریع (۰ تا ۲۰٪)</span>
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          reviewMethod === 'fast'
                            ? 'bg-[#ffe552] text-[#005581]'
                            : 'bg-[#72cdf4]/30 text-[#005581]'
                        }`}
                      >
                        {toFa(claims.filter((c) => c.riskScore <= 20).length)} پرونده
                      </span>
                    </div>
                    <div className="text-[10px] opacity-80 font-medium leading-relaxed">
                      پرونده‌های با ریسک ۰ تا ۲۰٪؛ بدون نیاز به امضا مگر در صورت تغییر نظر AI
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewMethod('standard')}
                    className={`p-4 rounded-2xl border text-xs font-black text-right transition-all space-y-2 relative overflow-hidden ${
                      reviewMethod === 'standard'
                        ? 'bg-[#005581] text-white border-[#005581] shadow-lg ring-2 ring-[#ffd200] scale-[1.01]'
                        : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-black text-xs">
                        <CheckCircle className="w-4 h-4 text-[#ffd200]" />
                        <span>۲. بررسی استاندارد (۲۰ تا ۵۵٪)</span>
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          reviewMethod === 'standard'
                            ? 'bg-[#ffe552] text-[#005581]'
                            : 'bg-[#72cdf4]/30 text-[#005581]'
                        }`}
                      >
                        {toFa(claims.filter((c) => c.riskScore > 20 && c.riskScore <= 55).length)} پرونده
                      </span>
                    </div>
                    <div className="text-[10px] opacity-80 font-medium leading-relaxed">
                      پرونده‌های حد واسط با ریسک ۲۰ تا ۵۵٪؛ بررسی رادیولوژی استاندارد بدون هم‌پوشانی
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewMethod('deep')}
                    className={`p-4 rounded-2xl border text-xs font-black text-right transition-all space-y-2 relative overflow-hidden ${
                      reviewMethod === 'deep'
                        ? 'bg-[#005581] text-white border-[#005581] shadow-lg ring-2 ring-[#ffd200] scale-[1.01]'
                        : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-black text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#ffd200]" />
                        <span>{'۳. بررسی دقیق (> ۵۵٪)'}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          reviewMethod === 'deep'
                            ? 'bg-[#ffe552] text-[#005581]'
                            : 'bg-[#72cdf4]/30 text-[#005581]'
                        }`}
                      >
                        {toFa(claims.filter((c) => c.riskScore > 55).length)} پرونده (الزام امضا)
                      </span>
                    </div>
                    <div className="text-[10px] opacity-80 font-medium leading-relaxed">
                      پرونده‌های با ریسک بالای ۵۵٪؛ **الزام قطعی امضای دیجیتال** و PIN برای تشخیص و رای
                    </div>
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute right-3 top-3 text-[#005581]/60" />
                      <input
                        type="text"
                        value={queueSearchQuery}
                        onChange={(e) => setQueueSearchQuery(e.target.value)}
                        placeholder="جستجوی پرونده، بیمار یا کلینیک..."
                        className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#72cdf4] bg-white text-xs text-[#005581] font-bold focus:outline-none focus:ring-1 focus:ring-[#005581]"
                      />
                    </div>
                    <span className="text-xs text-[#005581] font-bold">
                      نمایش {toFa(filteredClaims.length)} پرونده در صف فعال
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#72cdf4]">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead className="bg-[#005581] text-white font-black text-[11px]">
                        <tr>
                          <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap min-w-[110px]">شماره پرونده</th>
                          <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap min-w-[120px]">نام بیمار</th>
                          <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap min-w-[140px]">کلینیک / مرکز درمانی</th>
                          <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap min-w-[140px] text-center">سطح اعتماد کلینیک</th>
                          <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap min-w-[120px]">مبلغ ادعاشده</th>
                          <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap min-w-[120px] text-center">نمره ریسک AI</th>
                          <th className="p-3 border-b border-[#72cdf4]/40 whitespace-nowrap min-w-[110px] text-center">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#72cdf4] bg-white font-bold">
                        {filteredClaims.map((claim) => {
                          const isAppealedRow =
                            claim.status === 'appealed' ||
                            (claim.appeals && claim.appeals.length > 0) ||
                            Boolean(claim.appealReason || claim.appealText);
                          return (
                            <tr
                              key={claim.id}
                              className={`hover:bg-[#72cdf4]/10 transition-colors ${
                                selectedClaimId === claim.id ? 'bg-[#ffe552]/20 font-black' : ''
                              }`}
                            >
                              <td className="p-3 text-[#005581] font-mono whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span>{claim.claimNumber}</span>
                                  {isAppealedRow && (
                                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 animate-pulse">
                                      <span>⚡ اعتراض کلینیک</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-[#005581] whitespace-nowrap">{claim.patientName}</td>
                              <td className="p-3 text-[#005581] whitespace-nowrap">{claim.clinicName}</td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-black inline-block">
                                  L3 (Dentora Verified)
                                </span>
                              </td>
                              <td className="p-3 text-[#005581] whitespace-nowrap">{toFa(((claim as any).claimedAmount ?? claim.totalClaimedAmount ?? 0).toLocaleString())} ریال</td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block ${
                                    claim.riskScore >= 70
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  }`}
                                >
                                  ریسک {toFa(claim.riskScore)}٪
                                </span>
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClaimId(claim.id);
                                    setSelectedPacsImageOverrideUrl(null);
                                    // Smooth scroll down to Table 2 (Section 2)
                                    setTimeout(() => {
                                      const table2El = document.getElementById('medical-claim-details-table');
                                      if (table2El) {
                                        table2El.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        table2El.classList.add('ring-4', 'ring-[#ffd200]');
                                        setTimeout(() => table2El.classList.remove('ring-4', 'ring-[#ffd200]'), 2000);
                                      }
                                    }, 50);
                                  }}
                                  className="bg-[#005581] text-white px-3 py-1.5 rounded-lg text-[11px] font-black hover:bg-[#003d5c] transition-all inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>انتخاب پرونده</span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Table 2: Selected Claim Details & Reviewer Findings */}
              <div
                id="medical-claim-details-table"
                className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] space-y-4 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#72cdf4]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#005581] text-[#ffe552] rounded-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-[#005581]">
                        جدول ۲. جزئیات خدمات درمانی و نظریه بازبین ادعا جهت کارشناسی پزشک معتمد
                      </h3>
                      <span className="text-[11px] text-[#005581]/80 font-bold">
                        بیمار انتخابی: <span className="text-[#005581] font-black">{selectedClaim.patientName}</span> (کد ملی: {toFa(selectedClaim.patientNationalId || selectedClaim.nationalId || '۰۰۲۱۹۴۰۸۲۱')}) • کلینیک: {selectedClaim.clinicName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-[#005581] text-white px-2.5 py-1 rounded-lg">
                      پرونده: {selectedClaim.claimNumber}
                    </span>
                    <span className="text-[10px] bg-[#ffe552] text-[#005581] px-2.5 py-1 rounded-lg font-black border border-[#ffd200]">
                      بیمه: {selectedClaim.insuranceCompany || selectedClaim.insuranceProvider || (selectedClaim.primaryInsurerName || 'بیمه ایران')}
                    </span>
                  </div>
                </div>

                {/* Reviewer Diagnosis & Narrative Box */}
                <div className="bg-[#72cdf4]/15 border border-[#72cdf4] p-3.5 rounded-xl space-y-1 text-xs text-[#005581]">
                  <div className="font-black flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>ارسال‌شده توسط بازبین ادعا: {selectedClaim.claimReviewerName || claimReviewerInfo.name}</span>
                      <span className="text-[10px] font-bold opacity-80">({selectedClaim.claimReviewerTitle || claimReviewerInfo.title})</span>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#72cdf4] font-bold">
                      تشخیص ثبت‌شده بازبین ادعا
                    </span>
                  </div>
                  <p className="text-[11px] font-bold leading-relaxed text-[#005581]">
                    {selectedClaim.reviewerDiagnosis || selectedClaim.reviewerNotes || selectedClaim.narrativeText || claimReviewerInfo.note}
                  </p>
                </div>

                {/* Appeal Dossier & Attached Evidence by Clinic/Accountant */}
                {isClaimAppealed && activeAppeal && (
                  <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50/70 space-y-3.5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                            <span>لایحه دفاعیه و مدارک ضمیمه‌شده در بخش اعتراض توسط حسابدار / کلینیک</span>
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                              ارجاع کارشناسی رادیولوژی به پزشک معتمد
                            </span>
                          </h4>
                          <span className="text-[10px] text-amber-800 font-medium">
                            ثبت اعتراض: {activeAppeal.submittedBy || 'حسابداری و پذیرش کلینیک'} • پزشک معالج: {activeAppeal.dentistName || selectedClaim.dentistName || 'دکتر کاویانی'} • تاریخ ثبت: {toFa(activeAppeal.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-amber-500/20 text-amber-900 border border-amber-400 px-2.5 py-1 rounded-lg font-black">
                          موضوع: {activeAppeal.category || 'کسورات غیرمجاز تعرفه‌ای'}
                        </span>
                      </div>
                    </div>

                    {/* Appeal statement text */}
                    <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-1.5 shadow-xs">
                      <div className="text-[10px] text-amber-900 font-extrabold flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-600" />
                        <span>متن لایحه اعتراض ثبت‌شده توسط حسابدار / دندانپزشک معالج:</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed text-slate-800">
                        «{activeAppeal.reason}»
                      </p>
                      {activeAppeal.ruleCitation && (
                        <div className="text-[10px] text-slate-600 pt-1 font-medium border-t border-amber-100">
                          مستندات قانونی / آیین‌نامه: <span className="font-bold text-amber-850">{activeAppeal.ruleCitation}</span>
                        </div>
                      )}
                    </div>

                    {/* Claim reviewer handover note */}
                    <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#005581] mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-black text-[#005581] block mb-0.5">
                          دستور ارجاع و تایید اولیه بازبین ادعا ({selectedClaim.claimReviewerName || claimReviewerInfo.name}):
                        </span>
                        <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                          {activeAppeal.responseNotes || selectedClaim.reviewerDiagnosis || 'اعتراض کلینیک از حیث سقف تعهدات و مدارک اولیه مورد تأیید اولیه قرار گرفت و جهت انطباق تصویر گرافی و تصمیم‌گیری نهایی بالینی به پزشک معتمد ارجاع گردید.'}
                        </p>
                      </div>
                    </div>

                    {/* Attached Images / Evidence by Accountant */}
                    {appealAttachedImages.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-amber-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-amber-600" />
                            <span>مدارک و تصاویر رادیولوژی ضمیمه‌شده در بخش اعتراض ({toFa(appealAttachedImages.length)} مدرک):</span>
                          </span>
                          <span className="text-[10px] text-amber-800 font-bold">
                            جهت بررسی در ویوور PACS روی دکمه زیر هر تصویر کلیک کنید
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {appealAttachedImages.map((img) => (
                            <div
                              key={img.id}
                              className="bg-white rounded-xl border border-amber-300 p-2.5 space-y-2 shadow-xs hover:border-amber-500 transition group"
                            >
                              <div
                                className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video cursor-pointer"
                                onClick={() => setLightboxImageUrl(img.url)}
                              >
                                <img
                                  src={img.url}
                                  alt={img.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <span className="p-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" /> بزرگنمایی مدرک
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] space-y-1">
                                <div className="font-bold text-slate-800 line-clamp-1">
                                  {img.title}
                                </div>
                                <div className="text-slate-500 flex items-center justify-between text-[9px]">
                                  <span>بارگذاری: {img.uploader}</span>
                                  <span>{toFa(img.date)}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPacsImageOverrideUrl(img.url);
                                  setActiveStep(2);
                                }}
                                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>ارزیابی در ویوور PACS رادیولوژی</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-[#72cdf4]">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead className="bg-[#005581] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-3 border-b border-[#72cdf4]/40 w-12 text-center whitespace-nowrap">ردیف</th>
                        <th className="p-3 border-b border-[#72cdf4]/40 min-w-[150px] whitespace-nowrap">کد & موقعیت دندان</th>
                        <th className="p-3 border-b border-[#72cdf4]/40 min-w-[180px] whitespace-nowrap">عنوان خدمت درمانی</th>
                        <th className="p-3 border-b border-[#72cdf4]/40 min-w-[120px] whitespace-nowrap">مبلغ ادعا (ریال)</th>
                        <th className="p-3 border-b border-[#72cdf4]/40 min-w-[260px]">یادداشت تخصصی اولیه بازبین ادعا</th>
                        <th className="p-3 border-b border-[#72cdf4]/40 min-w-[140px] text-center whitespace-nowrap">وضعیت رادیولوژی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#72cdf4] bg-white font-bold text-[#005581]">
                      {activeLineItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-[#72cdf4]/10 transition-colors">
                          <td className="p-3 text-center font-black whitespace-nowrap">{toFa(idx + 1)}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-[#005581] text-white px-2 py-0.5 rounded font-mono text-[10px] ml-1.5">
                              FDI: {item.fdiCode}
                            </span>
                            <span>{item.toothNumber}</span>
                          </td>
                          <td className="p-3 font-black text-[#005581] whitespace-nowrap">
                            {item.serviceName}
                            <span className="block text-[10px] font-mono text-[#005581]/70 font-normal">
                              کد خدمت: {item.serviceCode}
                            </span>
                          </td>
                          <td className="p-3 font-mono whitespace-nowrap">{toFa((item?.claimedAmount ?? 0).toLocaleString())}</td>
                          <td className="p-3 text-[11px] font-medium leading-relaxed">{item.initialReviewerNote}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className="bg-[#ffe552] text-[#005581] px-2.5 py-1 rounded-full text-[10px] font-black border border-[#ffd200] inline-block">
                              گرافی RVG آماده
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-105 cursor-pointer"
                  >
                    <span>ورود به مرحله ۲: بررسی ادعا و ارزیابی رادیولوژی گام‌به‌گام</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#fffffa] rounded-2xl p-4 border-2 border-[#005581] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-[#005581]">
                  <Eye className="w-4 h-4 text-[#005581]" />
                  <span>انتخاب ردیف خدمت جهت کارشناسی رادیولوژی:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {activeLineItems.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveLineItemIndex(idx);
                        setActiveQuestionIndex(0);
                        setSelectedMarkerId(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-2 ${
                        activeLineItemIndex === idx
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md scale-105'
                          : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                      }`}
                    >
                      <span className="bg-[#ffd200] text-[#005581] w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                        {toFa(idx + 1)}
                      </span>
                      <span>
                        {item.toothNumber} ({item.serviceName})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* PACS VIEWER */}
                <div className="xl:col-span-7 space-y-4">
                  <div className="bg-[#fffffa] rounded-2xl p-4 border-2 border-[#005581] space-y-3 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-[#72cdf4] gap-2">
                      <div className="flex items-center gap-2 text-xs font-black text-[#005581]">
                        <Eye className="w-4 h-4 text-[#005581]" />
                        <span>{activeLineItem?.radiographyTitle || 'تصویر رادیولوژی دندانپزشکی'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#005581] text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-[#72cdf4]">
                          DICOM PACS 2.1
                        </span>
                        <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#ffd200]">
                          دندان {activeLineItem?.toothNumber || '۱۶'}
                        </span>
                      </div>
                    </div>

                    {/* Evidence Radiography Switcher for Appealed Claims */}
                    {appealAttachedImages.length > 0 && (
                      <div className="bg-slate-900/90 border border-amber-400/60 p-2 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-white">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-300">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>انتخاب مدرک نمایشی در PACS:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPacsImageOverrideUrl(null)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 border ${
                              selectedPacsImageOverrideUrl === null
                                ? 'bg-[#ffe552] text-[#005581] border-[#ffd200] shadow-xs'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <span>🦷 گرافی پایه دندان {activeLineItem?.toothNumber || '۱۶'}</span>
                          </button>

                          {appealAttachedImages.map((img, i) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setSelectedPacsImageOverrideUrl(img.url)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 border ${
                                selectedPacsImageOverrideUrl === img.url
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                                  : 'bg-slate-800 text-amber-200 border-amber-600/50 hover:bg-slate-700'
                              }`}
                            >
                              <span>⚡ مدرک اعتراضی {toFa(i + 1)} ({img.uploader})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Professional PACS Toolbar */}
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 border border-slate-700 text-xs shadow-inner">
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                        <button
                          type="button"
                          onClick={() => setPacsZoom((prev) => Math.min(prev + 0.25, 2.5))}
                          className="p-1 hover:bg-slate-700 rounded text-sky-400 hover:text-white transition cursor-pointer"
                          title="بزرگ‌نمایی (Zoom In)"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-[11px] px-1 font-bold text-sky-300 min-w-[42px] text-center">
                          {Math.round(pacsZoom * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setPacsZoom((prev) => Math.max(prev - 0.25, 0.75))}
                          className="p-1 hover:bg-slate-700 rounded text-sky-400 hover:text-white transition cursor-pointer"
                          title="کوچک‌نمایی (Zoom Out)"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPacsZoom(1)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition text-[10px] font-bold cursor-pointer"
                          title="بازنشانی زوم"
                        >
                          1:1
                        </button>
                      </div>

                      {/* Invert Negative Film Toggle */}
                      <button
                        type="button"
                        onClick={() => setPacsInverted(!pacsInverted)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer border ${
                          pacsInverted
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="معکوس‌سازی نگاتیو / پوزیتیو فیلم رادیولوژی"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{pacsInverted ? 'نگاتیو فعال' : 'نگاتیو فیلم (Invert)'}</span>
                      </button>

                      {/* Grid Overlay Toggle */}
                      <button
                        type="button"
                        onClick={() => setPacsShowGrid(!pacsShowGrid)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer border ${
                          pacsShowGrid
                            ? 'bg-sky-500 text-slate-950 border-sky-300'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="نمایش شبکه میلی‌متری مختصات پری‌اپیکال"
                      >
                        <Grid className="w-3.5 h-3.5" />
                        <span>شبکه گریدی</span>
                      </button>

                      {/* Caliper Measurement Ruler */}
                      <button
                        type="button"
                        onClick={() => setPacsShowCaliper(!pacsShowCaliper)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer border ${
                          pacsShowCaliper
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="خط‌کش کولیس دیجیتال جهت اندازه‌گیری طول کارکرد کانال"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>کولیس دیجیتال</span>
                      </button>

                      {/* AI Layer Toggle */}
                      <button
                        type="button"
                        onClick={() => setPacsShowAiLayer(!pacsShowAiLayer)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer border ${
                          pacsShowAiLayer
                            ? 'bg-[#ffd200] text-[#005581] border-[#ffe552]'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="نمایش لایه‌های هوش مصنوعی و علائم رادیولوژی"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>لایه‌های AI ({toFa(activeLineItem?.aiMarkers?.length || 0)})</span>
                      </button>

                      {/* Reset All Filters */}
                      <button
                        type="button"
                        onClick={() => {
                          setPacsZoom(1);
                          setPacsContrast(125);
                          setPacsBrightness(95);
                          setPacsInverted(false);
                          setPacsShowGrid(false);
                          setPacsShowCaliper(false);
                          setPacsShowAiLayer(true);
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="بازنشانی تمام فیلترها"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Fine-Tuning Sliders Row */}
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 shrink-0">کنتراست رادیولوژی:</span>
                        <input
                          type="range"
                          min="60"
                          max="200"
                          value={pacsContrast}
                          onChange={(e) => setPacsContrast(Number(e.target.value))}
                          className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                        />
                        <span className="font-mono text-sky-300 w-10 text-left">{pacsContrast}%</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 shrink-0">روشنایی اکسپوژر:</span>
                        <input
                          type="range"
                          min="50"
                          max="160"
                          value={pacsBrightness}
                          onChange={(e) => setPacsBrightness(Number(e.target.value))}
                          className="w-full accent-[#ffd200] cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                        />
                        <span className="font-mono text-[#ffd200] w-10 text-left">{pacsBrightness}%</span>
                      </div>
                    </div>

                    {/* Main PACS Radiograph Viewport */}
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#005581] bg-slate-950 shadow-2xl min-h-[420px] flex items-center justify-center group select-none">
                      {selectedPacsImageOverrideUrl && (
                        <div className="absolute top-3 right-3 z-30 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 border border-amber-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>در حال ارزیابی: تصویر ضمیمه لایحه اعتراض حسابدار</span>
                        </div>
                      )}

                      <div
                        className="w-full h-full flex items-center justify-center transition-transform duration-200"
                        style={{
                          transform: `scale(${pacsZoom})`,
                        }}
                      >
                        {selectedPacsImageOverrideUrl ? (
                          <img
                            src={selectedPacsImageOverrideUrl}
                            alt="Appeal Evidence X-Ray"
                            className="w-full h-[420px] object-cover transition-all duration-150"
                            style={{
                              filter: `contrast(${pacsContrast}%) brightness(${pacsBrightness}%) ${
                                pacsInverted ? 'invert(100%)' : 'grayscale(100%)'
                              }`,
                            }}
                            referrerPolicy="no-referrer"
                          />
                        ) : activeLineItem?.radiographyUrl?.startsWith('http') || activeLineItem?.radiographyUrl?.startsWith('data:image/png') ? (
                          <img
                            src={activeLineItem.radiographyUrl}
                            alt="Radiology Dental X-Ray"
                            className="w-full h-[420px] object-cover transition-all duration-150"
                            style={{
                              filter: `contrast(${pacsContrast}%) brightness(${pacsBrightness}%) ${
                                pacsInverted ? 'invert(100%)' : 'grayscale(100%)'
                              }`,
                            }}
                            referrerPolicy="no-referrer"
                          />
                        ) : activeLineItem?.serviceCode === 'CRN-PFM' || activeLineItem?.radiographyUrl === 'bitewing_crown' ? (
                          <DentalBitewingCrownSVG contrast={pacsContrast} brightness={pacsBrightness} inverted={pacsInverted} />
                        ) : activeLineItem?.serviceCode === 'CMP-3S' || activeLineItem?.radiographyUrl === 'panoramic_opg' ? (
                          <DentalOPGPanoramicSVG contrast={pacsContrast} brightness={pacsBrightness} inverted={pacsInverted} />
                        ) : (
                          <DentalRVGPeriapicalSVG contrast={pacsContrast} brightness={pacsBrightness} inverted={pacsInverted} />
                        )}
                      </div>

                      {/* Millimeter Grid Overlay */}
                      {pacsShowGrid && (
                        <div
                          className="absolute inset-0 pointer-events-none opacity-40"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, rgba(56, 189, 248, 0.4) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 1px, transparent 1px)
                            `,
                            backgroundSize: '24px 24px',
                          }}
                        />
                      )}

                      {/* Caliper Digital Measurement Overlay */}
                      {pacsShowCaliper && (
                        <div className="absolute inset-0 pointer-events-none z-30">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line
                              x1={pacsMeasurementPoints[0].x}
                              y1={pacsMeasurementPoints[0].y}
                              x2={pacsMeasurementPoints[1].x}
                              y2={pacsMeasurementPoints[1].y}
                              stroke="#22c55e"
                              strokeWidth="0.8"
                              strokeDasharray="1,1"
                            />
                            <circle
                              cx={pacsMeasurementPoints[0].x}
                              cy={pacsMeasurementPoints[0].y}
                              r="1.8"
                              fill="#22c55e"
                              stroke="#ffffff"
                              strokeWidth="0.4"
                            />
                            <circle
                              cx={pacsMeasurementPoints[1].x}
                              cy={pacsMeasurementPoints[1].y}
                              r="1.8"
                              fill="#22c55e"
                              stroke="#ffffff"
                              strokeWidth="0.4"
                            />
                          </svg>
                          <div
                            style={{
                              left: `${(pacsMeasurementPoints[0].x + pacsMeasurementPoints[1].x) / 2}%`,
                              top: `${(pacsMeasurementPoints[0].y + pacsMeasurementPoints[1].y) / 2}%`,
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 bg-emerald-950/90 text-emerald-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-500 shadow-md pointer-events-auto"
                          >
                            طول کانال: ۲۱.۵ میلی‌متر (Working Length)
                          </div>
                        </div>
                      )}

                      {/* DICOM HUD Header Information */}
                      <div className="absolute top-3 left-3 bg-slate-950/85 text-cyan-400 font-mono text-[10px] px-3 py-1.5 rounded-lg border border-cyan-500/40 backdrop-blur-md space-y-0.5 pointer-events-none">
                        <div className="font-bold flex items-center gap-1 text-cyan-300">
                          <Eye className="w-3 h-3" />
                          <span>PACS RVG DENTAL X-RAY #{activeLineItem?.fdiCode || '16'}</span>
                        </div>
                        <div className="text-slate-400 text-[9px]">RES: 2400x1600 | 16-bit Grayscale DICOM</div>
                      </div>

                      {/* AI Markers Overlay */}
                      {pacsShowAiLayer &&
                        activeLineItem?.aiMarkers?.map((marker, index) => {
                          const isSelected = selectedMarkerId === marker.id;

                          return (
                            <div
                              key={marker.id}
                              style={{ top: `${marker.y}%`, left: `${marker.x}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                              onClick={() => {
                                setSelectedMarkerId(marker.id);
                                if (activeLineItem && activeLineItem.questions) {
                                  const qIdx = activeLineItem.questions.findIndex(
                                    (q) => q.markerId === marker.id || q.id === marker.linkedQuestionId
                                  );
                                  if (qIdx !== -1) {
                                    const q = activeLineItem.questions[qIdx];
                                    setActiveQuestionIndex(qIdx);
                                    setExpandedQuestionIds((prev) => ({ ...prev, [q.id]: true }));
                                  }
                                }
                              }}
                            >
                              <span
                                className={`absolute inline-flex h-8 w-8 rounded-full opacity-75 animate-ping ${
                                  marker.isOverridden
                                    ? 'bg-slate-400'
                                    : marker.category === 'confidence'
                                    ? 'bg-[#ffe552]'
                                    : 'bg-[#ffd200]'
                                }`}
                              />

                              <button
                                type="button"
                                className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 font-black text-xs shadow-xl transition-all transform hover:scale-125 ${
                                  marker.isOverridden
                                    ? 'bg-slate-600 text-white border-slate-300 line-through'
                                    : isSelected
                                    ? 'bg-[#ffe552] text-[#005581] border-[#005581] ring-4 ring-[#005581]'
                                    : 'bg-[#005581] text-white border-[#72cdf4]'
                                }`}
                              >
                                {marker.isOverridden ? '✕' : toFa(index + 1)}
                              </button>
                            </div>
                          );
                        })}

                      {/* Radiograph Footer Badge */}
                      <div className="absolute bottom-3 right-3 bg-[#005581]/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-lg border border-[#72cdf4] shadow flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#ffd200]" />
                        <span>
                          پرونده {selectedClaim.claimNumber} | {activeLineItem?.toothNumber}
                        </span>
                      </div>
                    </div>

                    {activeMarker && (
                      <div className="bg-[#fffffa] p-4 rounded-2xl border-2 border-[#005581] space-y-3 shadow-md animate-fadeIn">
                        <div className="flex items-center justify-between pb-2 border-b border-[#72cdf4]">
                          <div className="flex items-center gap-2 text-xs font-black text-[#005581]">
                            <Sparkles className="w-4 h-4 text-[#005581]" />
                            <span>جزئیات علامت رادیولوژی AI: {activeMarker.title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              activeMarker.isOverridden
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-[#ffe552] text-[#005581]'
                            }`}
                          >
                            {activeMarker.isOverridden
                              ? 'امضا و اورراید شده توسط پزشک'
                              : `اطمینان AI: ${toFa(activeMarker.aiConfidence)}٪`}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-[#005581]">
                          <div className="font-bold leading-relaxed">
                            <span className="font-black">تشخیص رادیولوژی هوش مصنوعی: </span>
                            {activeMarker.detectionText}
                          </div>
                          <div className="font-medium text-[11px] text-[#005581]/80">
                            <span className="font-black text-[#005581]">علت علامت‌گذاری: </span>
                            {activeMarker.flagReason}
                          </div>

                          {activeMarker.isOverridden && (
                            <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-300 text-[11px] font-bold text-slate-800 space-y-1 mt-2">
                              <div>نوع اقدام: {activeMarker.overriddenAction === 'delete' ? 'حذف با امضا' : 'اصلاح با امضا'}</div>
                              <div>دلیل پزشک: {activeMarker.overrideReason}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#72cdf4]/40">
                          <button
                            type="button"
                            onClick={() => setSelectedMarkerId(null)}
                            className="text-[11px] text-[#005581] font-bold hover:underline"
                          >
                            بستن جزئیات
                          </button>

                          {!activeMarker.isOverridden && (
                            <button
                              type="button"
                              onClick={() => setShowOverrideModal(true)}
                              className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>تغییر یا حذف این هشدار با امضای دیجیتال</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* QUESTIONS */}
                <div className="xl:col-span-5 space-y-4">
                  {/* Appeal Statement and Evidence Box in Step 2 */}
                  {isClaimAppealed && activeAppeal && (
                    <div className="bg-amber-50/95 rounded-2xl p-4 border-2 border-amber-400 space-y-3 shadow-sm animate-fadeIn">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-300">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-black text-amber-950">
                            لایحه دفاعیه و مدارک ضمیمه‌شده در بخش اعتراض
                          </h4>
                        </div>
                        <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                          ثبت توسط {activeAppeal.submittedBy || 'حسابدار / کلینیک'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-amber-300 text-slate-800 font-bold leading-relaxed shadow-2xs">
                          <span className="text-amber-800 text-[10px] font-black block mb-0.5">متن لایحه اعتراض کلینیک:</span>
                          «{activeAppeal.reason}»
                        </div>
                        {activeAppeal.ruleCitation && (
                          <div className="text-[10px] text-amber-900 font-bold flex items-center gap-1.5 bg-amber-100/70 p-2 rounded-lg border border-amber-200">
                            <span className="shrink-0 font-extrabold text-amber-950">استناد به آیین‌نامه:</span>
                            <span className="font-mono">{activeAppeal.ruleCitation}</span>
                          </div>
                        )}
                        {activeAppeal.responseNotes && (
                          <div className="text-[10px] text-sky-900 font-bold flex items-center gap-1.5 bg-sky-100/70 p-2 rounded-lg border border-sky-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#005581] shrink-0" />
                            <span>تاییدیه ارجاع بازبین ادعا: {activeAppeal.responseNotes}</span>
                          </div>
                        )}
                      </div>

                      {appealAttachedImages.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-amber-200">
                          <div className="flex items-center justify-between text-[11px] font-black text-amber-950">
                            <span>مدارک ضمیمه‌شده ({toFa(appealAttachedImages.length)}):</span>
                            <span className="text-[9px] text-amber-800">کلیک روی تصویر جهت ارزیابی در ویوور PACS</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {appealAttachedImages.map((img) => {
                              const isViewingInPacs = selectedPacsImageOverrideUrl === img.url;
                              return (
                                <div
                                  key={img.id}
                                  onClick={() => setSelectedPacsImageOverrideUrl(img.url)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 group ${
                                    isViewingInPacs
                                      ? 'bg-amber-300/90 border-amber-500 ring-2 ring-amber-500 shadow-sm'
                                      : 'bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                                  }`}
                                >
                                  <img
                                    src={img.url}
                                    alt={img.title}
                                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-amber-300"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0 flex-1 text-[10px]">
                                    <div className="font-black text-slate-900 truncate">{img.title}</div>
                                    <div className={`text-[9px] font-bold ${isViewingInPacs ? 'text-emerald-900 font-black' : 'text-amber-800'}`}>
                                      {isViewingInPacs ? '✓ در حال نمایش در PACS' : 'نمایش در PACS'}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#fffffa] rounded-2xl p-5 border-2 border-[#005581] space-y-4 shadow-sm">
                    <div className="pb-3 border-b border-[#72cdf4] space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-[#005581] flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#005581]" />
                          <span>پرسش‌های کارشناسی بالینی (گام‌به‌گام)</span>
                        </h3>
                        <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#ffd200]">
                          سوال {toFa(activeQuestionIndex + 1)} از {toFa(activeLineItem?.questions?.length || 0)}
                        </span>
                      </div>

                      {activeMarker && (
                        <div className="bg-[#005581] text-white p-2.5 rounded-xl text-xs flex items-center justify-between shadow-sm animate-fadeIn">
                          <div className="flex items-center gap-2 font-bold text-[11px]">
                            <Sparkles className="w-4 h-4 text-[#ffe552] shrink-0" />
                            <span>نمایش سوال اختصاصی علامت {activeMarker.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedMarkerId(null)}
                            className="text-[10px] bg-[#ffe552] text-[#005581] px-2 py-0.5 rounded font-black hover:bg-[#ffd200]"
                          >
                            نمایش همه
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] font-bold text-[#005581]/80 pt-1">
                        <span>
                          پاسخ داده شده:{' '}
                          <span className="font-black text-[#005581]">
                            {toFa(activeLineItem?.questions?.filter((q) => q.selectedAnswer).length || 0)} از{' '}
                            {toFa(activeLineItem?.questions?.length || 0)}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handlePrevQuestion}
                            className="p-1 rounded-lg border border-[#72cdf4] text-[#005581] hover:bg-[#72cdf4]/20"
                            title="سوال قبلی"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="p-1 rounded-lg border border-[#72cdf4] text-[#005581] hover:bg-[#72cdf4]/20"
                            title="سوال بعدی"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeLineItem?.questions
                        ?.filter((q) => !activeMarker || q.markerId === activeMarker.id || q.id === activeMarker.linkedQuestionId)
                        ?.map((q, qIndex) => {
                          const isExpanded = expandedQuestionIds[q.id] || qIndex === activeQuestionIndex || activeMarker?.id === q.markerId;
                          const isAnswered = Boolean(q.selectedAnswer);
                          const linkedMarker = activeLineItem.aiMarkers.find((m) => m.id === q.markerId);

                          return (
                            <div
                              key={q.id}
                              className={`rounded-2xl border-2 transition-all text-xs overflow-hidden ${
                                qIndex === activeQuestionIndex || activeMarker?.id === q.markerId
                                  ? 'border-[#005581] bg-white shadow-md'
                                  : 'border-[#72cdf4] bg-[#fffffa]'
                              }`}
                            >
                              <div
                                onClick={() => {
                                  toggleQuestionExpansion(q.id);
                                  setActiveQuestionIndex(qIndex);
                                  if (q.markerId) setSelectedMarkerId(q.markerId);
                                }}
                                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#72cdf4]/10 transition-colors"
                              >
                                <div className="flex items-center gap-2 font-black text-[#005581] leading-relaxed">
                                  {isAnswered ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-[#005581]/40 shrink-0 flex items-center justify-center text-[9px]">
                                      {toFa(qIndex + 1)}
                                    </div>
                                  )}
                                  <span className={isAnswered ? 'text-emerald-950 font-black' : ''}>
                                    {q.questionText}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {isAnswered && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                                      پاسخ داده شد ✓
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-[#005581]" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-[#005581]" />
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="p-3.5 pt-1 border-t border-[#72cdf4]/40 space-y-3 bg-[#fffffa]">
                                  {linkedMarker && (
                                    <div className="flex items-center justify-between bg-[#ffe552]/20 p-2 rounded-xl text-[11px] font-bold">
                                      <span>علامت مرتبط روی تصویر رادیولوژی:</span>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedMarkerId(linkedMarker.id)}
                                        className="bg-[#005581] text-[#ffd200] text-[10px] font-black px-2.5 py-1 rounded border border-[#72cdf4] hover:scale-105"
                                      >
                                        مشاهده نقطه رادیولوژی
                                      </button>
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-2">
                                    {q.options.map((opt) => {
                                      const isSelectedOpt = q.selectedAnswer === opt.id;

                                      return (
                                        <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() => handleAnswerSelect(q.id, opt.id)}
                                          className={`p-3 rounded-xl border text-xs font-black text-right transition-all flex items-center justify-between ${
                                            isSelectedOpt
                                              ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                                              : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                isSelectedOpt ? 'border-[#ffd200] bg-[#ffd200]' : 'border-[#005581]'
                                              }`}
                                            >
                                              {isSelectedOpt && <Check className="w-3 h-3 text-[#005581]" />}
                                            </div>
                                            <span>{opt.label}</span>
                                          </div>
                                          {opt.isAiRecommended && (
                                            <span className="bg-[#ffe552] text-[#005581] text-[9px] font-black px-2 py-0.5 rounded border border-[#ffd200]">
                                              پیشنهاد AI
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="pt-1 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={handleNextQuestion}
                                      className="bg-[#005581] text-white hover:bg-[#003d5c] font-black text-[11px] px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span>تأیید پاسخ و سؤال بعدی</span>
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-105 cursor-pointer"
                >
                  <span>ورود به مرحله ۳: ثبت رای نهایی و مشاهده خلاصه ارزیابی‌ها</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#fffffa] rounded-2xl p-6 border-2 border-[#005581] space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#72cdf4]">
                  <h2 className="text-sm font-black text-[#005581] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#005581]" />
                    <span>۳. خلاصه اطلاعات ارزیابی‌شده و ثبت رای نهایی کارشناسی</span>
                  </h2>
                  <span className="bg-[#ffe552] text-[#005581] text-xs px-3 py-0.5 rounded-full font-black border border-[#ffd200]">
                    مرحله ۳ از ۴
                  </span>
                </div>

                {/* Summary of Appeal Dossier and Evidence in Step 3 */}
                {isClaimAppealed && activeAppeal && (
                  <div className="bg-amber-50/90 rounded-2xl p-5 border-2 border-amber-400 space-y-4 shadow-sm animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-amber-300 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-amber-950">
                            خلاصه لایحه دفاعیه اعتراض کلینیک و مدارک ضمیمه‌شده توسط حسابدار
                          </h3>
                          <span className="text-[10px] text-amber-800 font-medium">
                            ثبت‌کننده: {activeAppeal.submittedBy || 'حسابدار کلینیک'} • پزشک معالج: {activeAppeal.dentistName || selectedClaim.dentistName || 'دکتر کاویانی'} • تاریخ: {toFa(activeAppeal.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
                        موضوع: {activeAppeal.category || 'کسورات غیرمجاز تعرفه‌ای'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                      <div className="md:col-span-8 space-y-2">
                        <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-1 shadow-2xs">
                          <div className="text-[10px] font-extrabold text-amber-900 flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-amber-600" />
                            <span>متن لایحه دفاعیه کلینیک:</span>
                          </div>
                          <p className="text-xs font-bold leading-relaxed text-slate-800">
                            «{activeAppeal.reason}»
                          </p>
                          {activeAppeal.ruleCitation && (
                            <div className="text-[10px] text-slate-600 pt-1 font-medium border-t border-amber-100 flex items-center gap-1">
                              <span>مستندات قانونی / استناد به آیین‌نامه:</span>
                              <span className="font-bold text-amber-900 font-mono bg-amber-100/80 px-2 py-0.5 rounded">{activeAppeal.ruleCitation}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-[11px] text-sky-950 font-medium flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#005581] shrink-0" />
                          <span>
                            <strong>تاییدیه ارجاع بازبین ادعا:</strong> {activeAppeal.responseNotes || selectedClaim.reviewerDiagnosis || 'پرونده و مستندات اولیه تایید گردید و جهت انطباق رادیولوژی به پزشک معتمد ارجاع شد.'}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-white p-3 rounded-xl border border-amber-300 space-y-2">
                        <div className="text-[10px] font-black text-amber-950 flex items-center justify-between">
                          <span>مدارک تصویری ارزیابی‌شده ({toFa(appealAttachedImages.length)}):</span>
                          <span className="text-[9px] text-emerald-700 font-black">ارزیابی‌شده در PACS ✓</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {appealAttachedImages.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => setLightboxImageUrl(img.url)}
                              className="relative rounded-lg overflow-hidden border border-amber-200 aspect-video group cursor-pointer"
                              title="بزرگنمایی تصویر"
                            >
                              <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#005581] flex items-center gap-2 border-b border-[#72cdf4] pb-2">
                    <ClipboardList className="w-4 h-4 text-[#005581]" />
                    <span>خلاصه سازمان‌یافته و دقیق پاسخ‌های ثبت‌شده در بخش ۲ (بررسی کارشناسی):</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {activeLineItems.map((item, idx) => {
                      const answeredCount = item.questions.filter((q) => q.selectedAnswer).length;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-4 border-2 border-[#72cdf4] space-y-3 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#72cdf4]/40 text-xs">
                            <div className="flex items-center gap-2 font-black text-[#005581]">
                              <span className="bg-[#005581] text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">
                                {toFa(idx + 1)}
                              </span>
                              <span>
                                {item.toothNumber} - {item.serviceName}
                              </span>
                              <span className="text-[10px] font-mono bg-[#72cdf4]/20 px-2 py-0.5 rounded">
                                کد: {item.serviceCode}
                              </span>
                            </div>

                            <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#ffd200]">
                              {toFa(answeredCount)} از {toFa(item.questions.length)} سؤال پاسخ داده شد
                            </span>
                          </div>

                          <div className="space-y-2">
                            {item.questions.map((q, qIdx) => {
                              const foundOpt = q.options.find((o) => o.id === q.selectedAnswer);

                              return (
                                <div
                                  key={q.id}
                                  className="bg-[#fffffa] p-3 rounded-xl border border-[#72cdf4]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 text-[#005581] font-bold">
                                    <span className="text-[10px] opacity-70">{toFa(qIdx + 1)}.</span>
                                    <span>{q.questionText}</span>
                                  </div>

                                  <div className="shrink-0">
                                    {foundOpt ? (
                                      <span className="bg-[#005581] text-white font-black px-3 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow-sm">
                                        <Check className="w-3.5 h-3.5 text-[#ffd200]" />
                                        <span>{foundOpt.label}</span>
                                      </span>
                                    ) : (
                                      <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded text-[10px]">
                                        پاسخ داده نشده
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-[#72cdf4]/10 p-2.5 rounded-xl text-[11px] font-bold text-[#005581] flex items-center justify-between">
                            <span>علامت‌های آنالیز رادیولوژی هوش مصنوعی:</span>
                            <span className="font-black">
                              {item.aiMarkers.filter((m) => m.isOverridden).length > 0
                                ? `اصلاح/حذف ${toFa(item.aiMarkers.filter((m) => m.isOverridden).length)} هشدار با امضا`
                                : 'تأیید کامل تمام هشدارها بدون تغییر'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WRITTEN TEXT AREA */}
                <div className="bg-white rounded-2xl p-5 border-2 border-[#005581] space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#72cdf4] pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-[#005581]">
                      <FileText className="w-4.5 h-4.5 text-[#005581]" />
                      <span>بخش نوشتاری: خلاصه نظریه کارشناسی (برگرفته از نظرات هوش مصنوعی، بازبین ادعا و تغییرات پزشک)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedClaim) return;
                        const aiMarkersCount = activeLineItems.reduce((acc, item) => acc + (item.aiMarkers?.length || 0), 0);
                        const overridesCount = activeLineItems.reduce(
                          (acc, item) => acc + (item.aiMarkers?.filter((m) => m.isOverridden)?.length || 0),
                          0
                        );
                        const answeredCount = activeLineItems.flatMap((i) => i.questions || []).filter((q) => q.selectedAnswer).length;

                        if (isClaimAppealed && activeAppeal) {
                          let summary = `بر اساس بررسی لایحه دفاعیه اعتراض کلینیک و مدارک ضمیمه رادیولوژی RVG در ویوور PACS:\n`;
                          summary += `• پرونده اعتراضی ${selectedClaim.claimNumber} مربوط به بیمار ${selectedClaim.patientName} در کلینیک ${selectedClaim.clinicName} مورد کارشناسی مجدد قرار گرفت.\n`;
                          summary += `• لایحه دفاعیه حسابدار مبنی بر «${activeAppeal.reason}» و استناد به «${activeAppeal.ruleCitation}» تطبیق داده شد.\n`;
                          summary += `• مدارک رادیولوژی RVG ضمیمه‌شده در ویوور PACS ارزیابی شد؛ اپیکال سیل کامل و تراکم گوتاپرکا تا آپکس رادیوگرافیک مورد تأیید بالینی است.\n`;
                          summary += `• تعداد ${toFa(answeredCount)} سوال کارشناسی بالینی پاسخ داده شد و انطباق با ضوابط قانونی احراز گردید.\n`;
                          summary += `• نظر اولیه بازبین ادعا (${selectedClaim.claimReviewerName || claimReviewerInfo.name}): "${activeAppeal.responseNotes || claimReviewerInfo.note}"\n`;
                          summary += `• جمع‌بندی پزشک معتمد (${trustedDoctor.name}): با توجه به احراز شرایط درمانی و صحت گرافی، لایحه اعتراض کلینیک پذیرفته شده و کسورات اولیه ملغی می‌گردد.`;

                          setReviewerSummaryText(summary);
                          setFinalVerdict('approved');
                        } else {
                          let summary = `بر اساس ارزیابی هوش مصنوعی (${systemVersions.aiModel}) و تحلیل گرافی RVG:\n`;
                          summary += `• پرونده ${selectedClaim.claimNumber} مربوط به بیمار ${selectedClaim.patientName} در ${selectedClaim.clinicName} بررسی گردید.\n`;
                          summary += `• تعداد ${toFa(aiMarkersCount)} نقطه آنالیز هوش مصنوعی ارزیابی گردید که ${
                            overridesCount > 0
                              ? `${toFa(overridesCount)} مورد آن با نظر تخصصی پزشک معتمد تغییر/اصلاح یافت`
                              : 'تماماً مورد تأیید قرار گرفت'
                          }.\n`;
                          summary += `• تعداد ${toFa(answeredCount)} سوال کارشناسی بالینی در بخش دوم پاسخ داده شد.\n`;
                          summary += `• نظر اولیه بازبین ادعا (${claimReviewerInfo.name}): "${claimReviewerInfo.note}"\n`;
                          summary += `• جمع‌بندی پزشک معتمد: پس از تطبیق با آئین‌نامه ${systemVersions.rulesEngine}، اسناد و گرافی‌های درمانی فاقد مغایرت قانونی شناخته شد.`;

                          setReviewerSummaryText(summary);
                        }
                      }}
                      className="bg-[#ffe552] hover:bg-[#ffd200] text-[#005581] text-[11px] font-black px-3 py-1.5 rounded-xl border border-[#ffd200] flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#005581]" />
                      <span>بازسازی خودکار خلاصه نظرات</span>
                    </button>
                  </div>

                  <p className="text-[11px] font-medium text-[#005581]/80 leading-relaxed">
                    این متن خلاصه حاصل تحلیل خودکار الگوریتم‌های هوش مصنوعی، اصلاحات اعمال‌شده روی علامت‌ها و نظر کارشناس اولیه ادعا می‌باشد. می‌توانید قبل از ثبت نهایی متن را تغییر دهید:
                  </p>

                  <textarea
                    rows={5}
                    value={reviewerSummaryText}
                    onChange={(e) => setReviewerSummaryText(e.target.value)}
                    placeholder="متن خلاصه نظر پزشک معتمد و هوش مصنوعی را وارد یا ویرایش کنید..."
                    className="w-full p-3.5 rounded-xl border-2 border-[#72cdf4] focus:border-[#005581] focus:ring-2 focus:ring-[#ffe552] text-xs font-bold text-[#005581] leading-relaxed bg-[#fffffa] resize-y outline-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-[#005581]">تعیین رای نهایی پزشک معتمد برای این پرونده:</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setFinalVerdict('approved')}
                      className={`p-3.5 rounded-xl border text-xs font-black transition-all flex items-center gap-2 justify-center ${
                        finalVerdict === 'approved'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md scale-105'
                          : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                      <span>تأیید کامل بالینی</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFinalVerdict('partial')}
                      className={`p-3.5 rounded-xl border text-xs font-black transition-all flex items-center gap-2 justify-center ${
                        finalVerdict === 'partial'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md scale-105'
                          : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                      }`}
                    >
                      <Scale className="w-4 h-4 text-[#ffd200]" />
                      <span>تأیید جزئی (همراه با کسورات)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFinalVerdict('partial_rejection')}
                      className={`p-3.5 rounded-xl border text-xs font-black transition-all flex items-center gap-2 justify-center ${
                        finalVerdict === 'partial_rejection'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md scale-105'
                          : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 text-[#ffd200]" />
                      <span>رد جزئی خدمت ارائه‌شده</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFinalVerdict('rejected')}
                      className={`p-3.5 rounded-xl border text-xs font-black transition-all flex items-center gap-2 justify-center ${
                        finalVerdict === 'rejected'
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md scale-105'
                          : 'bg-white text-[#005581] border-[#72cdf4] hover:bg-[#72cdf4]/10'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-[#ffd200]" />
                      <span>رد کامل ادعا</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#72cdf4] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-bold text-[#005581]">
                    پزشک معتمد صادرکننده: <span className="font-black">{trustedDoctor.name}</span> ({trustedDoctor.medicalCode})
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSubmitSection3FinalVerdict}
                      className="bg-[#005581] hover:bg-[#003d5c] text-white font-black text-xs px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 hover:scale-105 cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5 text-[#ffd200]" />
                      <span>ثبت نهایی رأی کارشناسی و انتقال به تاریخچه</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#fffffa] rounded-2xl p-6 border-2 border-[#005581] space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#72cdf4] gap-2">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#005581]" />
                    <h2 className="text-sm font-black text-[#005581]">
                      دفترچه کامل حسابرسی حقوقی، آیین‌نامه پین‌شده و بازتولیدپذیری
                    </h2>
                  </div>
                  <span className="bg-[#005581] text-white text-xs font-mono px-3 py-1 rounded-full border border-[#72cdf4]">
                    Rules Engine: {systemVersions.rulesEngine}
                  </span>
                </div>

                <p className="text-xs text-[#005581] font-medium leading-relaxed">
                  در این بخش شناسنامه تمام پرونده‌های کارشناسی‌شده به‌صورت خلاصه نمایش داده می‌شود. جهت مشاهده تمام جزئیات آیین‌نامه‌ای، اطلاعات بازبین ادعا، نسخه مدل AI و امضای دیجیتال، روی هر کارت کلیک کنید.
                </p>

                <div className="space-y-4">
                  {auditTrailLogs.map((audit) => (
                    <div
                      key={audit.id}
                      onClick={() => setSelectedAuditDetailModal(audit)}
                      className="bg-white rounded-2xl p-5 border-2 border-[#005581] hover:border-[#72cdf4] hover:shadow-lg transition-all cursor-pointer space-y-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#72cdf4]/40">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#005581] text-white font-mono text-xs px-2.5 py-1 rounded-lg font-black">
                            {audit.claimNumber}
                          </span>
                          <div>
                            <span className="font-black text-xs text-[#005581]">{audit.patientName}</span>
                            <span className="text-[10px] text-[#005581]/70 block font-bold">{audit.clinicName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              audit.isDigitallySigned
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {audit.isDigitallySigned ? 'امضا شده با کلید غیرقابل تغییر' : 'ثبت مستقیم (روش غیردقیق)'}
                          </span>

                          <span className="bg-[#ffe552] text-[#005581] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#ffd200]">
                            {audit.reviewMethod === 'deep'
                              ? 'روش دقیق'
                              : audit.reviewMethod === 'standard'
                              ? 'روش استاندارد'
                              : 'روش سریع AI'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#005581] font-bold">
                        <div>
                          <span className="text-[10px] opacity-70 block font-normal">بازبین ادعا:</span>
                          <span>{audit.claimReviewerName}</span>
                        </div>

                        <div>
                          <span className="text-[10px] opacity-70 block font-normal">پزشک معتمد:</span>
                          <span>
                            {audit.medicalDoctorName} ({audit.medicalDoctorCode})
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] opacity-70 block font-normal">رای نهایی بالینی:</span>
                          <span className="font-black">{audit.medicalDoctorVerdictText}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#72cdf4]/40 flex items-center justify-between text-[11px] font-black text-[#005581]">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-[#005581]" />
                          <span>
                            مدل AI: {audit.aiModelVersion} | نسخه قواعد: {audit.rulesEngineVersion}
                          </span>
                        </span>

                        <span className="text-[#005581] group-hover:underline flex items-center gap-1 font-black">
                          <span>مشاهده تمام جزئیات حسابرسی حقوقی</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#005581]" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Overrides Log Table */}
              <div className="bg-[#fffffa] rounded-2xl p-6 border-2 border-[#005581] space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#72cdf4]">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#005581]" />
                    <h2 className="text-sm font-black text-[#005581]">
                      جدول وقایع و اورراید‌های هوش مصنوعی همراه با امضای دیجیتال (AI Overrides Log)
                    </h2>
                  </div>
                  <span className="bg-[#ffe552] text-[#005581] text-xs font-black px-3 py-0.5 rounded-full border border-[#ffd200]">
                    {toFa(aiOverridesLog.length)} وقایع ثبت‌شده
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#72cdf4]">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-[#005581] text-white font-black text-[11px]">
                      <tr>
                        <th className="p-3 border-b border-[#72cdf4]/40">پرونده / دندان</th>
                        <th className="p-3 border-b border-[#72cdf4]/40">موضوع علامت AI</th>
                        <th className="p-3 border-b border-[#72cdf4]/40">مدل AI & نسخه قواعد</th>
                        <th className="p-3 border-b border-[#72cdf4]/40">نام بازبین ادعا</th>
                        <th className="p-3 border-b border-[#72cdf4]/40">اقدام & علل پزشک معتمد</th>
                        <th className="p-3 border-b border-[#72cdf4]/40">امضای پزشک & کلید غیرقابل تغییر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#72cdf4] bg-white font-bold">
                      {aiOverridesLog.map((log) => (
                        <tr key={log.id} className="hover:bg-[#72cdf4]/10 transition-colors">
                          <td className="p-3 text-[#005581]">
                            <div className="font-mono">{log.claimNumber}</div>
                            <div className="text-[10px] text-[#005581]/70">{log.toothNumber}</div>
                          </td>
                          <td className="p-3 text-[#005581]">{log.markerTitle}</td>
                          <td className="p-3 text-[#005581] font-normal text-[10px]">
                            <div>{log.aiModelVersion}</div>
                            <div className="opacity-80">{log.rulesEngineVersion}</div>
                          </td>
                          <td className="p-3 text-[#005581]">{log.claimReviewerName}</td>
                          <td className="p-3">
                            <span className="bg-[#ffe552] text-[#005581] px-2 py-0.5 rounded text-[10px] font-black border border-[#ffd200] block mb-1">
                              {log.overrideActionText}
                            </span>
                            <span className="text-[11px] font-normal text-[#005581]">{log.doctorReason}</span>
                          </td>
                          <td className="p-3 text-[#005581]">
                            <div className="font-black text-[11px]">{log.doctorName}</div>
                            <div className="text-[10px] font-mono opacity-80">{log.wormKey}</div>
                            <div className="text-[9px] text-emerald-800 font-bold">{log.doctorSignatureStatus}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Lightbox Modal for Evidence Images */}
          {lightboxImageUrl && (
            <div
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setLightboxImageUrl(null)}
            >
              <div
                className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-amber-400 p-4 space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-white pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black">تصویر مدرک و گرافی ضمیمه‌شده به لایحه اعتراض کلینیک</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLightboxImageUrl(null)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[380px] max-h-[65vh]">
                  <img
                    src={lightboxImageUrl}
                    alt="Evidence Preview"
                    className="max-h-[65vh] w-auto object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-300 font-bold">
                    جهت اعمال فیلترهای نگاتیو، روشنایی، کنتراست و خط‌کش کولیس، تصویر را در ویوور PACS باز کنید.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPacsImageOverrideUrl(lightboxImageUrl);
                      setLightboxImageUrl(null);
                      setActiveStep(2);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>انتقال مستقیم به ویوور رادیولوژی PACS</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
