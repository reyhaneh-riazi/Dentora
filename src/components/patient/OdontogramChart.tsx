import React, { useState } from 'react';
import { ToothDetail } from '../../types';
import { Baby, Info } from 'lucide-react';

interface OdontogramChartProps {
  teethMap: Record<number, ToothDetail>;
  onSelectTooth?: (fdi: number) => void;
  selectedToothFdi?: number | null;
  readOnly?: boolean;
}

// Tooth anatomical SVG generator matching uploaded medical illustrations
const ToothAnatomicalSVG: React.FC<{
  fdi: number;
  jaw: 'upper' | 'lower';
  condition?: string;
}> = ({ fdi, jaw, condition = 'healthy' }) => {
  const isUpper = jaw === 'upper';
  // Determine if molar, premolar, canine, or incisor
  const lastDigit = fdi % 10;
  const isMolar = lastDigit >= 6;
  const isPremolar = lastDigit === 4 || lastDigit === 5;
  const isCanine = lastDigit === 3;
  const isFront = lastDigit === 1 || lastDigit === 2;

  // Render SVG based on tooth anatomy and condition
  return (
    <svg viewBox="0 0 40 55" className="w-9 h-13 mx-auto drop-shadow-xs">
      {isUpper ? (
        // Upper Jaw: Roots Pointing UP (Y from 4 to 28), Crown at Bottom (Y from 28 to 50)
        <g>
          {condition === 'implant' ? (
            // Titanium Implant Fixture
            <g>
              <rect x="15" y="6" width="10" height="22" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
              <line x1="15" y1="11" x2="25" y2="11" stroke="#475569" strokeWidth="1.5" />
              <line x1="15" y1="16" x2="25" y2="16" stroke="#475569" strokeWidth="1.5" />
              <line x1="15" y1="21" x2="25" y2="21" stroke="#475569" strokeWidth="1.5" />
              {/* Abutment Crown */}
              <path
                d="M10,28 C10,28 8,48 20,48 C32,48 30,28 30,28 Z"
                fill="#F8FAFC"
                stroke="#0284C7"
                strokeWidth="2"
              />
            </g>
          ) : (
            // Natural Teeth Roots & Crown
            <g>
              {/* Roots */}
              {isMolar ? (
                // Double Root
                <path
                  d="M11,28 C10,18 8,8 14,5 C17,12 20,20 20,28 C20,20 23,12 26,5 C32,8 30,18 29,28 Z"
                  fill={condition === 'rct_needed' ? '#FEF08A' : '#E8C170'}
                  stroke="#B45309"
                  strokeWidth="1.2"
                />
              ) : (
                // Single Tapered Root
                <path
                  d="M13,28 C14,16 16,5 20,4 C24,5 26,16 27,28 Z"
                  fill={condition === 'rct_needed' ? '#FEF08A' : '#E8C170'}
                  stroke="#B45309"
                  strokeWidth="1.2"
                />
              )}

              {/* Pulp Root Canal Lines if RCT needed */}
              {condition === 'rct_needed' && (
                <path
                  d={isMolar ? "M14,28 L14,10 M26,28 L26,10" : "M20,28 L20,8"}
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeDasharray="2,1"
                />
              )}

              {/* Crown */}
              <path
                d={
                  isMolar
                    ? "M8,28 C6,33 7,48 20,49 C33,48 34,33 32,28 Z"
                    : isPremolar
                    ? "M10,28 C8,34 9,47 20,48 C31,47 32,34 30,28 Z"
                    : "M12,28 C10,35 11,47 20,48 C29,47 30,35 28,28 Z"
                }
                fill={condition === 'crown' ? '#FDE047' : '#FFFFFF'}
                stroke={condition === 'crown' ? '#CA8A04' : '#64748B'}
                strokeWidth="1.5"
              />

              {/* Decay or Composite Markings */}
              {condition === 'decay' && (
                <circle cx="20" cy="38" r="4" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              )}

              {condition === 'composite' && (
                <rect x="14" y="34" width="12" height="7" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
              )}

              {condition === 'rct_needed' && (
                <circle cx="20" cy="37" r="3" fill="#A855F7" />
              )}
            </g>
          )}
        </g>
      ) : (
        // Lower Jaw: Crown at Top (Y from 5 to 25), Roots Pointing DOWN (Y from 25 to 50)
        <g>
          {condition === 'implant' ? (
            <g>
              {/* Abutment Crown Top */}
              <path
                d="M10,25 C10,25 8,5 20,5 C32,5 30,25 30,25 Z"
                fill="#F8FAFC"
                stroke="#0284C7"
                strokeWidth="2"
              />
              {/* Screw Fixture Down */}
              <rect x="15" y="25" width="10" height="22" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
              <line x1="15" y1="30" x2="25" y2="30" stroke="#475569" strokeWidth="1.5" />
              <line x1="15" y1="35" x2="25" y2="35" stroke="#475569" strokeWidth="1.5" />
              <line x1="15" y1="40" x2="25" y2="40" stroke="#475569" strokeWidth="1.5" />
            </g>
          ) : (
            <g>
              {/* Crown Top */}
              <path
                d={
                  isMolar
                    ? "M8,25 C6,20 7,5 20,4 C33,5 34,20 32,25 Z"
                    : isPremolar
                    ? "M10,25 C8,19 9,6 20,5 C31,6 32,19 30,25 Z"
                    : "M12,25 C10,18 11,6 20,5 C29,6 30,18 28,25 Z"
                }
                fill={condition === 'crown' ? '#FDE047' : '#FFFFFF'}
                stroke={condition === 'crown' ? '#CA8A04' : '#64748B'}
                strokeWidth="1.5"
              />

              {/* Decay or Composite Markings */}
              {condition === 'decay' && (
                <circle cx="20" cy="14" r="4" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              )}

              {condition === 'composite' && (
                <rect x="14" y="11" width="12" height="7" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
              )}

              {condition === 'rct_needed' && (
                <circle cx="20" cy="14" r="3" fill="#A855F7" />
              )}

              {/* Roots Down */}
              {isMolar ? (
                // Double Root Down
                <path
                  d="M11,25 C10,35 8,45 14,48 C17,41 20,33 20,25 C20,33 23,41 26,48 C32,45 30,35 29,25 Z"
                  fill={condition === 'rct_needed' ? '#FEF08A' : '#E8C170'}
                  stroke="#B45309"
                  strokeWidth="1.2"
                />
              ) : (
                // Single Tapered Root Down
                <path
                  d="M13,25 C14,37 16,48 20,49 C24,48 26,37 27,25 Z"
                  fill={condition === 'rct_needed' ? '#FEF08A' : '#E8C170'}
                  stroke="#B45309"
                  strokeWidth="1.2"
                />
              )}

              {/* Pulp Root Canal Lines */}
              {condition === 'rct_needed' && (
                <path
                  d={isMolar ? "M14,25 L14,43 M26,25 L26,43" : "M20,25 L20,45"}
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeDasharray="2,1"
                />
              )}
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

export const OdontogramChart: React.FC<OdontogramChartProps> = ({
  teethMap,
  onSelectTooth,
  selectedToothFdi,
  readOnly = true,
}) => {
  const [teethAgeGroup, setTeethAgeGroup] = useState<'adult' | 'pediatric'>('adult');

  // FDI Tooth Arrays
  // Upper Maxilla
  const adultUpperQ1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Right
  const adultUpperQ2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Left

  // Lower Mandible
  const adultLowerQ4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Right
  const adultLowerQ3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Left

  // Pediatric
  const pedsUpperQ5 = [55, 54, 53, 52, 51];
  const pedsUpperQ6 = [61, 62, 63, 64, 65];
  const pedsLowerQ8 = [85, 84, 83, 82, 81];
  const pedsLowerQ7 = [71, 72, 73, 74, 75];

  const getConditionLabel = (cond?: string) => {
    switch (cond) {
      case 'decay':
        return { text: 'پوسیدگی', bg: 'bg-rose-500 text-white' };
      case 'rct_needed':
        return { text: 'عصب‌کشی', bg: 'bg-purple-600 text-white' };
      case 'crown':
        return { text: 'روکش', bg: 'bg-amber-500 text-white' };
      case 'implant':
        return { text: 'ایمپلنت', bg: 'bg-emerald-600 text-white' };
      case 'composite':
        return { text: 'ترمیم‌شده', bg: 'bg-blue-600 text-white' };
      case 'extracted':
        return { text: 'کشیده‌شده', bg: 'bg-slate-700 text-white' };
      default:
        return { text: 'سالم', bg: 'bg-slate-100 text-slate-700 border border-slate-300' };
    }
  };

  const renderToothCard = (fdi: number, jaw: 'upper' | 'lower') => {
    const detail = teethMap[fdi];
    const isSelected = selectedToothFdi === fdi;
    const cond = detail?.condition || 'healthy';
    const condInfo = getConditionLabel(cond);

    return (
      <div
        key={fdi}
        onClick={() => onSelectTooth?.(fdi)}
        className={`w-14 sm:w-16 p-1.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition cursor-pointer shrink-0 bg-white shadow-2xs ${
          isSelected
            ? 'border-[#005581] ring-2 ring-[#005581]/30 bg-blue-50/50'
            : 'border-slate-200 hover:border-slate-400'
        }`}
      >
        {/* FDI Circle Badge */}
        <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-mono font-black flex items-center justify-center shadow-xs">
          {fdi}
        </div>

        {/* Anatomical Tooth SVG Drawing */}
        <div className="my-1.5">
          <ToothAnatomicalSVG fdi={fdi} jaw={jaw} condition={cond} />
        </div>

        {/* Status Badge */}
        <span className={`w-full py-0.5 rounded-lg text-[10px] font-bold truncate px-0.5 ${condInfo.bg}`}>
          {condInfo.text}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 dir-rtl">
      
      {/* Top Bar: Age Switcher (Adult vs Pediatric) ONLY */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 px-2">
          <Info className="w-4 h-4 text-[#005581]" />
          <span>چارت رسمی دندان‌پزشکی (Odontogram)</span>
        </div>

        <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTeethAgeGroup('adult')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              teethAgeGroup === 'adult' ? 'bg-[#005581] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            دندان‌های بزرگسال (۳۲ دندان)
          </button>
          <button
            type="button"
            onClick={() => setTeethAgeGroup('pediatric')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              teethAgeGroup === 'pediatric' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>دندان‌های شیری اطفال (۲۰)</span>
          </button>
        </div>
      </div>

      {/* Main Odontogram Container with Smooth Horizontal Scroll so no teeth are cut off */}
      <div className="w-full overflow-x-auto pb-4 pt-1 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <div className="min-w-[1220px] space-y-6 p-5 bg-slate-50/80 dark:bg-slate-900/60">

          {/* ========================================================== */}
          {/* UPPER JAW (MAXILLA)                                        */}
          {/* ========================================================== */}
          <div className="space-y-2">
            
            {/* Jaw Header */}
            <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="text-right">
                فک بالا (Maxilla) - راست بیمار (Q1)
              </div>
              <div className="px-4 py-1 rounded-full bg-[#004266] text-white text-[11px] font-bold shadow-xs">
                ریشه‌ها رو به بالا
              </div>
              <div className="text-left">
                فک بالا (Maxilla) - چپ بیمار (Q2)
              </div>
            </div>

            {/* Tooth Categories Pills Bar (MOLARS, PREMOLARS, CANINE, INCISOR) */}
            <div className="grid grid-cols-2 gap-4 text-center text-[11px] font-bold">
              {/* Right Side Q1 Categories */}
              <div className="flex gap-1 justify-end">
                <span className="flex-1 max-w-[120px] py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
                  آسیای بزرگ (MOLARS)
                </span>
                <span className="flex-1 max-w-[90px] py-1 bg-blue-100 text-blue-900 rounded-lg border border-blue-300">
                  آسیای کوچک (PREMOLARS)
                </span>
                <span className="w-14 py-1 bg-purple-100 text-purple-900 rounded-lg border border-purple-300">
                  نیش (CANINE)
                </span>
                <span className="flex-1 max-w-[90px] py-1 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                  پیشین / سانترال و لترال
                </span>
              </div>

              {/* Left Side Q2 Categories */}
              <div className="flex gap-1 justify-start">
                <span className="flex-1 max-w-[90px] py-1 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                  پیشین / سانترال و لترال
                </span>
                <span className="w-14 py-1 bg-purple-100 text-purple-900 rounded-lg border border-purple-300">
                  نیش (CANINE)
                </span>
                <span className="flex-1 max-w-[90px] py-1 bg-blue-100 text-blue-900 rounded-lg border border-blue-300">
                  آسیای کوچک (PREMOLARS)
                </span>
                <span className="flex-1 max-w-[120px] py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
                  آسیای بزرگ (MOLARS)
                </span>
              </div>
            </div>

            {/* Upper Teeth Row (Separated by dashed center line) */}
            <div className="flex items-center justify-center gap-3">
              {/* Q1 Teeth */}
              <div className="flex gap-1.5">
                {(teethAgeGroup === 'adult' ? adultUpperQ1 : pedsUpperQ5).map((fdi) =>
                  renderToothCard(fdi, 'upper')
                )}
              </div>

              {/* Center Divider Line */}
              <div className="h-28 border-r-2 border-dashed border-slate-300 dark:border-slate-700 mx-1"></div>

              {/* Q2 Teeth */}
              <div className="flex gap-1.5">
                {(teethAgeGroup === 'adult' ? adultUpperQ2 : pedsUpperQ6).map((fdi) =>
                  renderToothCard(fdi, 'upper')
                )}
              </div>
            </div>

          </div>

          <div className="border-t-2 border-slate-200 dark:border-slate-800 my-4"></div>

          {/* ========================================================== */}
          {/* LOWER JAW (MANDIBLE)                                       */}
          {/* ========================================================== */}
          <div className="space-y-2">
            
            {/* Tooth Categories Pills Bar for Lower Jaw */}
            <div className="grid grid-cols-2 gap-4 text-center text-[11px] font-bold">
              {/* Right Side Q4 Categories */}
              <div className="flex gap-1 justify-end">
                <span className="flex-1 max-w-[120px] py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
                  آسیای بزرگ (MOLARS)
                </span>
                <span className="flex-1 max-w-[90px] py-1 bg-blue-100 text-blue-900 rounded-lg border border-blue-300">
                  آسیای کوچک (PREMOLARS)
                </span>
                <span className="w-14 py-1 bg-purple-100 text-purple-900 rounded-lg border border-purple-300">
                  نیش (CANINE)
                </span>
                <span className="flex-1 max-w-[90px] py-1 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                  پیشین / سانترال و لترال
                </span>
              </div>

              {/* Left Side Q3 Categories */}
              <div className="flex gap-1 justify-start">
                <span className="flex-1 max-w-[90px] py-1 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                  پیشین / سانترال و لترال
                </span>
                <span className="w-14 py-1 bg-purple-100 text-purple-900 rounded-lg border border-purple-300">
                  نیش (CANINE)
                </span>
                <span className="flex-1 max-w-[90px] py-1 bg-blue-100 text-blue-900 rounded-lg border border-blue-300">
                  آسیای کوچک (PREMOLARS)
                </span>
                <span className="flex-1 max-w-[120px] py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
                  آسیای بزرگ (MOLARS)
                </span>
              </div>
            </div>

            {/* Lower Teeth Row (Separated by dashed center line) */}
            <div className="flex items-center justify-center gap-3">
              {/* Q4 Teeth */}
              <div className="flex gap-1.5">
                {(teethAgeGroup === 'adult' ? adultLowerQ4 : pedsLowerQ8).map((fdi) =>
                  renderToothCard(fdi, 'lower')
                )}
              </div>

              {/* Center Divider Line */}
              <div className="h-28 border-r-2 border-dashed border-slate-300 dark:border-slate-700 mx-1"></div>

              {/* Q3 Teeth */}
              <div className="flex gap-1.5">
                {(teethAgeGroup === 'adult' ? adultLowerQ3 : pedsLowerQ7).map((fdi) =>
                  renderToothCard(fdi, 'lower')
                )}
              </div>
            </div>

            {/* Jaw Footer */}
            <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="text-right">
                فک پایین (Mandible) - راست بیمار (Q4)
              </div>
              <div className="px-4 py-1 rounded-full bg-[#004266] text-white text-[11px] font-bold shadow-xs">
                ریشه‌ها رو به پایین
              </div>
              <div className="text-left">
                فک پایین (Mandible) - چپ بیمار (Q3)
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Legend Footer matching uploaded photo */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <span className="font-black text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-800 pb-2">
          راهنمای علائم و وضعیت سلامتی دندان‌ها:
        </span>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-400 inline-block"></span>
            <span>سالم</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-rose-700 dark:text-rose-400">پوسیدگی</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-600 inline-block"></span>
            <span className="text-purple-700 dark:text-purple-400">نیازمند عصب‌کشی (RCT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-amber-700 dark:text-amber-400">روکش زیرکونیا / سرامیک</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block"></span>
            <span className="text-emerald-700 dark:text-emerald-400">ایمپلنت (فیکسچر تیتانیوم)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block"></span>
            <span className="text-blue-700 dark:text-blue-400">ترمیم کامپوزیت / آمالگام</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-700 inline-block"></span>
            <span className="text-slate-600 dark:text-slate-400">کشیده‌شده</span>
          </div>
        </div>
      </div>

    </div>
  );
};
