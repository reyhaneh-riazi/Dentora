import React, { useState } from 'react';
import { ToothDetail, ToothCondition, ToothSurface } from '../../types';
import { ShieldAlert, CheckCircle2, AlertCircle, Sparkles, Layers, Info, RotateCcw } from 'lucide-react';

interface OdontogramProps {
  teethMap: Record<number, ToothDetail>;
  onToothUpdate: (fdiNumber: number, updated: ToothDetail) => void;
  selectedToothFdi: number | null;
  onSelectTooth: (fdiNumber: number) => void;
}

// Tooth anatomical types
type ToothType = 'molar' | 'premolar' | 'canine' | 'incisor';

const getToothType = (fdi: number): ToothType => {
  const lastDigit = fdi % 10;
  if (lastDigit === 1 || lastDigit === 2) return 'incisor';
  if (lastDigit === 3) return 'canine';
  if (lastDigit === 4 || lastDigit === 5) return 'premolar';
  return 'molar'; // 6, 7, 8
};

const getToothNamePersian = (fdi: number): string => {
  const quad = Math.floor(fdi / 10);
  const pos = fdi % 10;

  const names: Record<number, string> = {
    1: 'سانترال (پیشین مرکزی)',
    2: 'لترال (پیشین کناری)',
    3: 'کانین (نیش)',
    4: 'پری‌مولر اول (آسیای کوچک اول)',
    5: 'پری‌مولر دوم (آسیای کوچک دوم)',
    6: 'مولر اول (آسیای بزرگ اول)',
    7: 'مولر دوم (آسیای بزرگ دوم)',
    8: 'مولر سوم (دندان عقل)',
  };

  const quadNames: Record<number, string> = {
    1: 'بالا راست',
    2: 'بالا چپ',
    3: 'پایین چپ',
    4: 'پایین راست',
    5: 'شیری بالا راست',
    6: 'شیری بالا چپ',
    7: 'شیری پایین چپ',
    8: 'شیری پایین راست',
  };

  return `${names[pos] || ''} (${quadNames[quad] || ''})`;
};

// Anatomical Tooth SVG component
const ToothAnatomySVG: React.FC<{
  fdi: number;
  isUpper: boolean;
  condition?: ToothCondition;
  affectedSurfaces: ToothSurface[];
}> = ({ fdi, isUpper, condition = 'healthy', affectedSurfaces }) => {
  const type = getToothType(fdi);
  const isExtracted = condition === 'extracted';
  const isImplant = condition === 'implant';
  const isRCT = condition === 'rct_needed';
  const isCrown = condition === 'crown';
  const isDecay = condition === 'decay';
  const isFilled = condition === 'filled';

  // Determine crown color fill
  let crownFill = 'url(#crownEnamelGrad)';
  if (isCrown) crownFill = 'url(#amberCrownGrad)';
  else if (isFilled) crownFill = 'url(#filledBlueGrad)';
  else if (isDecay && affectedSurfaces.length === 0) crownFill = '#fecdd3';

  // Surface highlight check
  const hasSurface = (s: ToothSurface) => affectedSurfaces.includes(s);

  return (
    <svg viewBox="0 0 50 85" className={`w-11 h-20 transition-transform ${isExtracted ? 'opacity-40 grayscale' : ''}`}>
      <defs>
        {/* Enamel Gradient */}
        <linearGradient id="crownEnamelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* Root Dentin Gradient */}
        <linearGradient id="rootDentinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Titanium Implant Screw Gradient */}
        <linearGradient id="titaniumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Crown Gold/Zirconia Gradient */}
        <linearGradient id="amberCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Composite/Amalgam Filled Gradient */}
        <linearGradient id="filledBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      <g transform={isUpper ? '' : 'translate(0, 85) scale(1, -1)'}>
        {/* ROOTS (Top half y: 4 to 45 for upper) */}
        {!isImplant ? (
          <g className="root-paths">
            {type === 'molar' && (
              // 3 or 2 Curved Roots
              <path
                d="M 12,42 C 8,28 6,10 11,5 C 15,10 18,25 21,42 C 24,25 28,8 32,5 C 37,8 36,25 38,42"
                fill="url(#rootDentinGrad)"
                stroke="#b45309"
                strokeWidth="0.8"
              />
            )}
            {type === 'premolar' && (
              // 2 Tapered Roots
              <path
                d="M 16,42 C 12,25 14,8 19,5 C 22,12 24,25 25,42 C 26,25 28,12 31,5 C 36,8 38,25 34,42"
                fill="url(#rootDentinGrad)"
                stroke="#b45309"
                strokeWidth="0.8"
              />
            )}
            {type === 'canine' && (
              // Long Single Sharp Root
              <path
                d="M 17,42 C 16,22 20,4 25,2 C 30,4 34,22 33,42 Z"
                fill="url(#rootDentinGrad)"
                stroke="#b45309"
                strokeWidth="0.8"
              />
            )}
            {type === 'incisor' && (
              // Straight Single Root
              <path
                d="M 18,42 C 17,25 21,6 25,4 C 29,6 33,25 32,42 Z"
                fill="url(#rootDentinGrad)"
                stroke="#b45309"
                strokeWidth="0.8"
              />
            )}

            {/* Root Canal Lines if RCT needed or infected */}
            {isRCT && (
              <path
                d={
                  type === 'molar'
                    ? 'M 11,8 L 21,40 M 32,8 L 25,40 M 36,8 L 38,40'
                    : 'M 25,5 L 25,40'
                }
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Root surface decay or issue */}
            {hasSurface('Root') && (
              <circle cx="25" cy="22" r="5" fill="#ef4444" opacity="0.85" />
            )}
          </g>
        ) : (
          /* Titanium Screw Fixture for Implant */
          <g>
            <path d="M 18,42 L 18,10 C 18,6 32,6 32,10 L 32,42 Z" fill="url(#titaniumGrad)" stroke="#334155" strokeWidth="0.8" />
            {/* Screw Threads */}
            <line x1="16" y1="14" x2="34" y2="14" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="17" y1="20" x2="33" y2="20" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="18" y1="26" x2="32" y2="26" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="19" y1="32" x2="31" y2="32" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="20" y1="38" x2="30" y2="38" stroke="#1e293b" strokeWidth="1.2" />
          </g>
        )}

        {/* CROWN (Bottom half y: 40 to 80 for upper) */}
        <g className="crown-group">
          {type === 'molar' && (
            /* Multi-cusp Molar Crown */
            <path
              d="M 8,42 C 6,45 5,60 7,72 C 10,79 18,81 25,81 C 32,81 40,79 43,72 C 45,60 44,45 42,42 C 35,44 32,40 25,43 C 18,40 15,44 8,42 Z"
              fill={crownFill}
              stroke="#64748b"
              strokeWidth="1.2"
            />
          )}

          {type === 'premolar' && (
            /* Double-cusp Premolar Crown */
            <path
              d="M 11,42 C 9,45 8,58 10,71 C 13,78 20,80 25,80 C 30,80 37,78 40,71 C 42,58 41,45 39,42 C 33,44 30,41 25,43 C 20,41 17,44 11,42 Z"
              fill={crownFill}
              stroke="#64748b"
              strokeWidth="1.2"
            />
          )}

          {type === 'canine' && (
            /* Pointed Canine Crown */
            <path
              d="M 14,42 C 12,45 11,58 13,70 C 16,77 22,82 25,83 C 28,82 34,77 37,70 C 39,58 38,45 36,42 C 30,43 25,41 25,41 C 25,41 20,43 14,42 Z"
              fill={crownFill}
              stroke="#64748b"
              strokeWidth="1.2"
            />
          )}

          {type === 'incisor' && (
            /* Flat Chisel Incisor Crown */
            <path
              d="M 15,42 C 13,46 12,58 14,71 C 17,77 22,79 25,79 C 28,79 33,77 36,71 C 38,58 37,46 35,42 Z"
              fill={crownFill}
              stroke="#64748b"
              strokeWidth="1.2"
            />
          )}

          {/* 6-SURFACE AFFECTED OVERLAYS */}
          {hasSurface('Occlusal') && (
            /* Center Occlusal / Incisal surface */
            <ellipse cx="25" cy="62" rx="7" ry="5" fill="#ef4444" opacity="0.9" />
          )}
          {hasSurface('Mesial') && (
            /* Left surface */
            <path d="M 8,50 C 7,60 11,70 16,72 L 18,50 Z" fill="#ef4444" opacity="0.9" />
          )}
          {hasSurface('Distal') && (
            /* Right surface */
            <path d="M 42,50 C 43,60 39,70 34,72 L 32,50 Z" fill="#ef4444" opacity="0.9" />
          )}
          {hasSurface('Buccal') && (
            /* Top/Outer Buccal border */
            <path d="M 12,45 C 20,47 30,47 38,45 L 36,53 C 28,55 20,55 14,53 Z" fill="#ef4444" opacity="0.9" />
          )}
          {hasSurface('Lingual') && (
            /* Bottom/Inner Lingual border */
            <path d="M 14,72 C 20,77 30,77 36,72 L 34,78 C 28,80 20,80 16,78 Z" fill="#ef4444" opacity="0.9" />
          )}
        </g>

        {/* Extracted X Overlay */}
        {isExtracted && (
          <g>
            <line x1="5" y1="5" x2="45" y2="80" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="5" x2="5" y2="80" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
};

export const Odontogram: React.FC<OdontogramProps> = ({
  teethMap,
  onToothUpdate,
  selectedToothFdi,
  onSelectTooth,
}) => {
  const [isPediatricMode, setIsPediatricMode] = useState(false);

  // Adult Quadrants (FDI Order)
  // Upper Arch Right to Left: Q1 (18..11), Q2 (21..28)
  const Q1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const Q2 = [21, 22, 23, 24, 25, 26, 27, 28];

  // Lower Arch Right to Left: Q4 (48..41), Q3 (31..38)
  const Q4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const Q3 = [31, 32, 33, 34, 35, 36, 37, 38];

  // Pediatric Quadrants
  const PedQ1 = [55, 54, 53, 52, 51];
  const PedQ2 = [61, 62, 63, 64, 65];
  const PedQ4 = [85, 84, 83, 82, 81];
  const PedQ3 = [71, 72, 73, 74, 75];

  const getConditionLabel = (condition?: ToothCondition) => {
    switch (condition) {
      case 'decay':
        return 'پوسیدگی';
      case 'rct_needed':
        return 'عصب‌کشی';
      case 'crown':
        return 'روکش';
      case 'implant':
        return 'ایمپلنت';
      case 'extracted':
        return 'کشیده‌شده';
      case 'filled':
        return 'ترمیم‌شده';
      default:
        return 'سالم';
    }
  };

  const getConditionBadgeStyle = (condition?: ToothCondition) => {
    switch (condition) {
      case 'decay':
        return 'bg-rose-500 text-white border-rose-600';
      case 'rct_needed':
        return 'bg-purple-600 text-white border-purple-700';
      case 'crown':
        return 'bg-amber-500 text-slate-900 font-bold border-amber-600';
      case 'implant':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'extracted':
        return 'bg-slate-500 text-white line-through border-slate-600';
      case 'filled':
        return 'bg-blue-600 text-white border-blue-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const conditionRequiredDocsMap: Record<ToothCondition, string[]> = {
    healthy: [],
    decay: ['عکس پری‌آپیکال/RVG اولیه (نشان‌دهنده عمق پوسیدگی)', 'فاکتور مطب'],
    rct_needed: [
      'عکس RVG قبل درمان (نشان‌دهنده درگیری پالپ)',
      'عکس RVG حین کار با فایل',
      'عکس RVG پایان درمان (پر کردن کانال)',
      'شرح بیمه تاییدشده پزشک',
    ],
    crown: ['عکس OPG/RVG قبل تراش', 'عکس بعد از قالب‌گیری/روکش', 'فاکتور رسمی لابراتوار با شماره بچ'],
    implant: ['عکس CBCT/OPG اولیه', 'عکس RVG فیکسچر جراحی‌شده', 'شماره سری/بچ اباتمنت و فیکسچر'],
    extracted: ['عکس رادیوگرافی اولیه نشان‌دهنده غیرقابل نگهداری بودن دندان'],
    filled: ['عکس رادیوگرافی یا فتوگرافی قبل ترمیم'],
    in_progress: ['عکس رادیوگرافی مرحله فعلی'],
  };

  const handleUpdateToothCondition = (fdi: number, newCondition: ToothCondition) => {
    const current = teethMap[fdi] || {
      fdiNumber: fdi,
      condition: 'healthy',
      affectedSurfaces: [],
      treatmentHistory: [],
    };

    onToothUpdate(fdi, {
      ...current,
      condition: newCondition,
    });
  };

  const handleToggleSurface = (fdi: number, surface: ToothSurface) => {
    const current = teethMap[fdi] || {
      fdiNumber: fdi,
      condition: 'decay',
      affectedSurfaces: [],
      treatmentHistory: [],
    };

    const exists = current.affectedSurfaces.includes(surface);
    const updatedSurfaces = exists
      ? current.affectedSurfaces.filter((s) => s !== surface)
      : [...current.affectedSurfaces, surface];

    onToothUpdate(fdi, {
      ...current,
      affectedSurfaces: updatedSurfaces,
    });
  };

  const renderToothItem = (fdi: number, isUpper: boolean) => {
    const tooth = teethMap[fdi];
    const isSelected = selectedToothFdi === fdi;

    return (
      <div
        key={fdi}
        onClick={() => onSelectTooth(fdi)}
        className={`group relative flex flex-col items-center justify-between p-1.5 rounded-2xl border-2 transition-all cursor-pointer min-w-[54px] sm:min-w-[62px] ${
          isSelected
            ? 'bg-[#005581]/10 border-[#005581] ring-2 ring-[#ffd200] shadow-lg scale-105 z-10'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#005581] hover:shadow-md'
        }`}
      >
        {/* Top Numbering for Upper Jaw */}
        {isUpper && (
          <div className="flex flex-col items-center mb-1">
            <span
              className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full shadow-sm transition ${
                isSelected
                  ? 'bg-[#ffd200] text-[#005581]'
                  : 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
              }`}
            >
              {fdi}
            </span>
          </div>
        )}

        {/* Anatomical SVG Graphic */}
        <div className="my-1 flex items-center justify-center">
          <ToothAnatomySVG
            fdi={fdi}
            isUpper={isUpper}
            condition={tooth?.condition}
            affectedSurfaces={tooth?.affectedSurfaces || []}
          />
        </div>

        {/* Bottom Numbering for Lower Jaw */}
        {!isUpper && (
          <div className="flex flex-col items-center mt-1">
            <span
              className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full shadow-sm transition ${
                isSelected
                  ? 'bg-[#ffd200] text-[#005581]'
                  : 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
              }`}
            >
              {fdi}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border mt-1 truncate max-w-full text-center ${getConditionBadgeStyle(
            tooth?.condition
          )}`}
        >
          {getConditionLabel(tooth?.condition)}
        </span>
      </div>
    );
  };

  const selectedToothDetail = selectedToothFdi ? teethMap[selectedToothFdi] : null;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#005581]" />
            <span>اودونتوگرام آناتومیک تعاملی (سیستم FDI)</span>
          </h3>
          <p className="text-xs text-slate-500">
            نمایش کامل آناتومی تاج و ریشه دندان‌ها، شماره‌گذاری استاندارد FDI و تفکیک ۶ سطح درمانی
          </p>
        </div>

        {/* Pediatric / Adult Mode Switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setIsPediatricMode(false)}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              !isPediatricMode
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
            }`}
          >
            دندان‌های دائمی بزرگسال (۳۲ عدد)
          </button>
          <button
            onClick={() => setIsPediatricMode(true)}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              isPediatricMode
                ? 'bg-[#005581] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
            }`}
          >
            دندان‌های شیری کودکان (۲۰ عدد)
          </button>
        </div>
      </div>

      {/* Main FDI Chart with Category Grouping Brackets */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 overflow-x-auto">
        {!isPediatricMode ? (
          <>
            {/* UPPER ARCH (MAXILLA) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#005581] dark:text-[#72cdf4]">
                <span>فک بالا (Maxilla) - راست بیمار (Q1)</span>
                <span className="bg-[#005581] text-white px-3 py-0.5 rounded-full text-[11px]">
                  ریشه‌ها رو به بالا
                </span>
                <span>فک بالا (Maxilla) - چپ بیمار (Q2)</span>
              </div>

              {/* Category Bracket Overlay */}
              <div className="flex justify-center items-center gap-1 min-w-[1150px] text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center pb-1 border-b border-slate-200 dark:border-slate-800">
                <div className="w-[190px] bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 py-1 rounded-t-md border-t-2 border-amber-500">
                  آسیای بزرگ (MOLARS - 18,17,16)
                </div>
                <div className="w-[125px] bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 py-1 rounded-t-md border-t-2 border-blue-500">
                  آسیای کوچک (PREMOLARS)
                </div>
                <div className="w-[62px] bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 py-1 rounded-t-md border-t-2 border-purple-500">
                  نیش (CANINE)
                </div>
                <div className="w-[250px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 py-1 rounded-t-md border-t-2 border-emerald-500">
                  پیشین / سانترال و لترال (INCISOR)
                </div>
                <div className="w-[62px] bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 py-1 rounded-t-md border-t-2 border-purple-500">
                  نیش (CANINE)
                </div>
                <div className="w-[125px] bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 py-1 rounded-t-md border-t-2 border-blue-500">
                  آسیای کوچک (PREMOLARS)
                </div>
                <div className="w-[190px] bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 py-1 rounded-t-md border-t-2 border-amber-500">
                  آسیای بزرگ (MOLARS - 26,27,28)
                </div>
              </div>

              {/* Upper Teeth Row */}
              <div className="flex justify-center items-center gap-1 min-w-[1150px] pt-2">
                <div className="flex gap-1 pl-2 border-l-2 border-dashed border-[#005581]/40">
                  {Q1.map((fdi) => renderToothItem(fdi, true))}
                </div>
                <div className="w-1 h-28 bg-[#005581] mx-2 rounded-full opacity-60"></div>
                <div className="flex gap-1 pr-2">
                  {Q2.map((fdi) => renderToothItem(fdi, true))}
                </div>
              </div>
            </div>

            {/* LOWER ARCH (MANDIBLE) */}
            <div className="space-y-2 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
              {/* Lower Teeth Row */}
              <div className="flex justify-center items-center gap-1 min-w-[1150px] pb-2">
                <div className="flex gap-1 pl-2 border-l-2 border-dashed border-[#005581]/40">
                  {Q4.map((fdi) => renderToothItem(fdi, false))}
                </div>
                <div className="w-1 h-28 bg-[#005581] mx-2 rounded-full opacity-60"></div>
                <div className="flex gap-1 pr-2">
                  {Q3.map((fdi) => renderToothItem(fdi, false))}
                </div>
              </div>

              {/* Category Bracket Overlay */}
              <div className="flex justify-center items-center gap-1 min-w-[1150px] text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="w-[190px] bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 py-1 rounded-b-md border-b-2 border-amber-500">
                  آسیای بزرگ (MOLARS - 48,47,46)
                </div>
                <div className="w-[125px] bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 py-1 rounded-b-md border-b-2 border-blue-500">
                  آسیای کوچک (PREMOLARS)
                </div>
                <div className="w-[62px] bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 py-1 rounded-b-md border-b-2 border-purple-500">
                  نیش (CANINE)
                </div>
                <div className="w-[250px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 py-1 rounded-b-md border-b-2 border-emerald-500">
                  پیشین / سانترال و لترال (INCISOR)
                </div>
                <div className="w-[62px] bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 py-1 rounded-b-md border-b-2 border-purple-500">
                  نیش (CANINE)
                </div>
                <div className="w-[125px] bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 py-1 rounded-b-md border-b-2 border-blue-500">
                  آسیای کوچک (PREMOLARS)
                </div>
                <div className="w-[190px] bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 py-1 rounded-b-md border-b-2 border-amber-500">
                  آسیای بزرگ (MOLARS)
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-black text-[#005581] dark:text-[#72cdf4]">
                <span>فک پایین (Mandible) - راست بیمار (Q4)</span>
                <span className="bg-[#005581] text-white px-3 py-0.5 rounded-full text-[11px]">
                  ریشه‌ها رو به پایین
                </span>
                <span>فک پایین (Mandible) - چپ بیمار (Q3)</span>
              </div>
            </div>
          </>
        ) : (
          /* Pediatric Arch Mode */
          <div className="space-y-6 min-w-[600px]">
            <div className="space-y-2">
              <div className="text-center text-xs font-bold text-purple-600">فک بالا - شیری (Pediatric Maxilla)</div>
              <div className="flex justify-center items-center gap-2">
                <div className="flex gap-2.5">{PedQ1.map((fdi) => renderToothItem(fdi, true))}</div>
                <div className="w-0.5 h-20 bg-purple-400 mx-2"></div>
                <div className="flex gap-2.5">{PedQ2.map((fdi) => renderToothItem(fdi, true))}</div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-purple-200">
              <div className="flex justify-center items-center gap-2">
                <div className="flex gap-2.5">{PedQ4.map((fdi) => renderToothItem(fdi, false))}</div>
                <div className="w-0.5 h-20 bg-purple-400 mx-2"></div>
                <div className="flex gap-2.5">{PedQ3.map((fdi) => renderToothItem(fdi, false))}</div>
              </div>
              <div className="text-center text-xs font-bold text-purple-600">فک پایین - شیری (Pediatric Mandible)</div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Condition Badges */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300">راهنمای وضعیت دندان‌ها:</span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded bg-slate-200 border border-slate-400"></span> سالم
        </span>
        <span className="flex items-center gap-1.5 text-rose-600 font-bold">
          <span className="w-3 h-3 rounded bg-rose-500"></span> پوسیدگی
        </span>
        <span className="flex items-center gap-1.5 text-purple-600 font-bold">
          <span className="w-3 h-3 rounded bg-purple-600"></span> نیازمند عصب‌کشی (RCT)
        </span>
        <span className="flex items-center gap-1.5 text-amber-600 font-bold">
          <span className="w-3 h-3 rounded bg-amber-500"></span> روکش زيرکونيا / سرامیک
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <span className="w-3 h-3 rounded bg-emerald-600"></span> ایمپلنت (فیکسچر تیتانیوم)
        </span>
        <span className="flex items-center gap-1.5 text-blue-600 font-bold">
          <span className="w-3 h-3 rounded bg-blue-600"></span> ترمیم کامپوزیت / آمالگام
        </span>
        <span className="flex items-center gap-1.5 text-slate-500 font-bold">
          <span className="w-3 h-3 rounded bg-slate-500 line-through"></span> کشیده‌شده
        </span>
      </div>

      {/* Selected Tooth Editor Panel */}
      {selectedToothFdi && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#005581] text-xs space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#ffd200] text-[#005581] font-mono font-black text-sm">
                دندان کد FDI: {selectedToothFdi}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {getToothNamePersian(selectedToothFdi)}
              </span>
            </div>
            <button
              onClick={() => onSelectTooth(0)}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 font-bold cursor-pointer"
            >
              بستن پنل ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition Picker */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                تعیین وضعیت بالینی دندان {selectedToothFdi}:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    'healthy',
                    'decay',
                    'rct_needed',
                    'crown',
                    'implant',
                    'filled',
                    'extracted',
                  ] as ToothCondition[]
                ).map((cond) => (
                  <button
                    key={cond}
                    onClick={() => handleUpdateToothCondition(selectedToothFdi, cond)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      selectedToothDetail?.condition === cond
                        ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#005581]'
                    }`}
                  >
                    <span>{getConditionLabel(cond)}</span>
                    {selectedToothDetail?.condition === cond && (
                      <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                    )}
                  </button>
                ))}
              </div>

              {/* 6 Surfaces Toggles */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                  تفکیک ۶ سطح دندان جهت درمان کامل:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    ['Occlusal', 'Mesial', 'Distal', 'Buccal', 'Lingual', 'Root'] as ToothSurface[]
                  ).map((surf) => {
                    const isAffected = selectedToothDetail?.affectedSurfaces.includes(surf);
                    return (
                      <button
                        key={surf}
                        onClick={() => handleToggleSurface(selectedToothFdi, surf)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                          isAffected
                            ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-rose-400'
                        }`}
                      >
                        {surf === 'Occlusal'
                          ? 'اکلوزال / انسیزال (سطح جویدن)'
                          : surf === 'Mesial'
                          ? 'مزیال (جلویی)'
                          : surf === 'Distal'
                          ? 'دیستال (عقبی)'
                          : surf === 'Buccal'
                          ? 'باکال (گونه‌ای)'
                          : surf === 'Lingual'
                          ? 'لینگوال (زبانی)'
                          : 'ریشه / کانال (Root)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* چک‌لیست خودکار مدارک الزامی بیمه */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400">
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
                <span>چک‌لیست خودکار مدارک الزامی بیمه</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                جهت پذیرش بدون کسورات در سامانه بیمه پایه و تکمیلی، ثبت مدارک زیر برای دندان {selectedToothFdi} الزامی است:
              </p>
              <ul className="space-y-1.5 mt-2 text-[11px]">
                {conditionRequiredDocsMap[selectedToothDetail?.condition || 'healthy'].length > 0 ? (
                  conditionRequiredDocsMap[selectedToothDetail?.condition || 'healthy'].map(
                    (doc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    )
                  )
                ) : (
                  <li className="text-slate-500 italic">برای دندان سالم نیاز به بارگذاری مدرک بیمه‌ای نیست.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
