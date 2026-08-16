import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianDigits';

export interface PersianBirthDatePickerProps {
  value?: string; // e.g. "1375/08/21" or "۱۳۷۵/۰۸/۲۱" or ""
  onChange: (dateStr: string) => void;
  label?: string;
  className?: string;
  required?: boolean;
}

const PERSIAN_MONTHS = [
  { value: '01', name: 'فروردین' },
  { value: '02', name: 'اردیبهشت' },
  { value: '03', name: 'خرداد' },
  { value: '04', name: 'تیر' },
  { value: '05', name: 'مرداد' },
  { value: '06', name: 'شهریور' },
  { value: '07', name: 'مهر' },
  { value: '08', name: 'آبان' },
  { value: '09', name: 'آذر' },
  { value: '10', name: 'دی' },
  { value: '11', name: 'بهمن' },
  { value: '12', name: 'اسفند' },
];

export const PersianBirthDatePicker: React.FC<PersianBirthDatePickerProps> = ({
  value = '',
  onChange,
  label = 'تاریخ تولد',
  className = '',
  required = false,
}) => {
  // Normalize value
  const englishValue = value
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .trim();

  let defaultYear = '1375';
  let defaultMonth = '01';
  let defaultDay = '01';

  if (englishValue.includes('/')) {
    const parts = englishValue.split('/');
    if (parts.length === 3) {
      defaultYear = parts[0] || '1375';
      defaultMonth = parts[1].padStart(2, '0');
      defaultDay = parts[2].padStart(2, '0');
    }
  }

  const [selectedYear, setSelectedYear] = React.useState<string>(defaultYear);
  const [selectedMonth, setSelectedMonth] = React.useState<string>(defaultMonth);
  const [selectedDay, setSelectedDay] = React.useState<string>(defaultDay);

  // Sync internal state when external value changes
  React.useEffect(() => {
    if (englishValue.includes('/')) {
      const parts = englishValue.split('/');
      if (parts.length === 3) {
        setSelectedYear(parts[0]);
        setSelectedMonth(parts[1].padStart(2, '0'));
        setSelectedDay(parts[2].padStart(2, '0'));
      }
    }
  }, [englishValue]);

  // Generate Year list from 1404 down to 1315
  const currentJalaliYear = 1404;
  const years: number[] = [];
  for (let y = currentJalaliYear; y >= 1315; y--) {
    years.push(y);
  }

  // Days list 1..31
  const days: string[] = [];
  for (let d = 1; d <= 31; d++) {
    days.push(d.toString().padStart(2, '0'));
  }

  const handleYearChange = (newYear: string) => {
    setSelectedYear(newYear);
    const updated = `${newYear}/${selectedMonth}/${selectedDay}`;
    onChange(toPersianDigits(updated));
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    const updated = `${selectedYear}/${newMonth}/${selectedDay}`;
    onChange(toPersianDigits(updated));
  };

  const handleDayChange = (newDay: string) => {
    setSelectedDay(newDay);
    const updated = `${selectedYear}/${selectedMonth}/${newDay}`;
    onChange(toPersianDigits(updated));
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-rose-500 mr-1">*</span>}
        </label>
      )}

      {/* 3 Dropdown Columns (Year, Month, Day) matching the requested UI */}
      <div className="grid grid-cols-3 gap-2">
        {/* Day Select */}
        <div className="relative">
          <select
            value={selectedDay}
            onChange={(e) => handleDayChange(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-[#005581] cursor-pointer text-center"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {toPersianDigits(Number(d).toString())}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
          <span className="absolute -top-2 right-3 px-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-400">
            روز
          </span>
        </div>

        {/* Month Select */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-[#005581] cursor-pointer text-center"
          >
            {PERSIAN_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
          <span className="absolute -top-2 right-3 px-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-400">
            ماه
          </span>
        </div>

        {/* Year Select */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-[#005581] cursor-pointer text-center"
          >
            {years.map((y) => (
              <option key={y} value={y.toString()}>
                {toPersianDigits(y.toString())}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
          <span className="absolute -top-2 right-3 px-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-400">
            سال
          </span>
        </div>
      </div>
    </div>
  );
};
