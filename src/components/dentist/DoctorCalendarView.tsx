import React, { useState } from 'react';
import { Appointment, Patient } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  Phone,
  Stethoscope,
  XCircle,
  Sparkles,
  Search,
  Building,
  ShieldCheck,
  UserCheck,
  Check,
  Lock,
  Unlock,
} from 'lucide-react';

interface DoctorCalendarViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onSelectPatientToExamine?: (patientId: string, appointmentId: string) => void;
  onUpdateAppointmentStatus?: (aptId: string, status: Appointment['status']) => void;
}

type CalendarViewMode = 'day' | 'week' | 'list';

export const DoctorCalendarView: React.FC<DoctorCalendarViewProps> = ({
  appointments,
  patients,
  onSelectPatientToExamine,
  onUpdateAppointmentStatus,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('day');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const weekDays = [
    { dayName: 'شنبه', dateStr: '۱۸ مرداد', dateFull: '۱۴۰۵/۰۵/۱۸', isToday: true },
    { dayName: 'یکشنبه', dateStr: '۱۹ مرداد', dateFull: '۱۴۰۵/۰۵/۱۹', isToday: false },
    { dayName: 'دوشنبه', dateStr: '۲۰ مرداد', dateFull: '۱۴۰۵/۰۵/۲۰', isToday: false },
    { dayName: 'سه‌شنبه', dateStr: '۲۱ مرداد', dateFull: '۱۴۰۵/۰۵/۲۱', isToday: false },
    { dayName: 'چهارشنبه', dateStr: '۲۲ مرداد', dateFull: '۱۴۰۵/۰۵/۲۲', isToday: false },
    { dayName: 'پنج‌شنبه', dateStr: '۲۳ مرداد', dateFull: '۱۴۰۵/۰۵/۲۳', isToday: false },
  ];

  const currentDay = weekDays[selectedDateIndex];

  // Doctor Availability Time Slots state (Keyed by time slot string)
  // Status: 'available' (آزاد جهت وقت‌دهی منشی) | 'unavailable' (مسدود/مرخصی پزشک)
  const [slotAvailability, setSlotAvailability] = useState<Record<string, 'available' | 'unavailable'>>({
    '08:00 - 08:45': 'available',
    '08:45 - 09:30': 'available',
    '09:30 - 10:15': 'available',
    '10:15 - 11:00': 'available',
    '11:00 - 11:45': 'available',
    '11:45 - 12:30': 'available',
    '13:30 - 14:15': 'available',
    '14:15 - 15:00': 'available',
    '15:00 - 15:45': 'unavailable',
    '15:45 - 16:30': 'available',
    '16:30 - 17:15': 'available',
    '17:15 - 18:00': 'unavailable',
  });

  // Time Slots for Day View Grid
  const timeGrid = [
    '08:00 - 08:45',
    '08:45 - 09:30',
    '09:30 - 10:15',
    '10:15 - 11:00',
    '11:00 - 11:45',
    '11:45 - 12:30',
    '12:30 - 13:30', // Break / Lunch
    '13:30 - 14:15',
    '14:15 - 15:00',
    '15:00 - 15:45',
    '15:45 - 16:30',
    '16:30 - 17:15',
    '17:15 - 18:00',
  ];

  const handleToggleSlotAvailability = (slot: string) => {
    setSlotAvailability((prev) => ({
      ...prev,
      [slot]: prev[slot] === 'available' ? 'unavailable' : 'available',
    }));
  };

  const handleEnableAllSlots = () => {
    const updated: Record<string, 'available' | 'unavailable'> = {};
    timeGrid.forEach((s) => {
      if (!s.includes('12:30')) updated[s] = 'available';
    });
    setSlotAvailability(updated);
  };

  const handleDisableAllSlots = () => {
    const updated: Record<string, 'available' | 'unavailable'> = {};
    timeGrid.forEach((s) => {
      if (!s.includes('12:30')) updated[s] = 'unavailable';
    });
    setSlotAvailability(updated);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'in_unit'
        ? apt.status === 'in_unit' || apt.connectedToUnit
        : statusFilter === 'scheduled'
        ? apt.status === 'scheduled' || apt.status === 'checked_in'
        : statusFilter === 'completed'
        ? apt.status === 'completed'
        : apt.status === statusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      apt.patientName.includes(searchQuery) ||
      apt.reason.includes(searchQuery) ||
      apt.patientPhone.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const countTotalAppointments = appointments.length;
  const countAvailableSlots = Object.values(slotAvailability).filter((v) => v === 'available').length;
  const countBlockedSlots = Object.values(slotAvailability).filter((v) => v === 'unavailable').length;

  const getStatusBadge = (status: Appointment['status'], connectedToUnit?: boolean) => {
    if (status === 'in_unit' || connectedToUnit) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-[#005581] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs border border-[#005581]">
          <span className="w-2 h-2 rounded-full bg-[#ffd200] animate-pulse"></span>
          روی یونیت (در حال درمان)
        </span>
      );
    }
    if (status === 'checked_in') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-[#005581]/80 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-[#ffd200]" />
          حضور در سالن انتظار
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          تکمیل‌شده
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-[#005581]/10 text-[#005581] dark:text-[#72cdf4] font-bold text-[11px] flex items-center gap-1 border border-[#005581]/20">
        <Clock className="w-3.5 h-3.5 text-[#005581]" />
        رزرو منشی (برنامه‌ریزی‌شده)
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Calendar Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          {/* Title & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black shadow">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  مدیریت تایم‌های کاری و زمان‌های حضور دندان‌پزشک
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#005581] text-[#ffd200] font-bold">
                  همگام‌سازی آنلاین با پورتال منشی
                </span>
              </div>
              <p className="text-xs text-slate-500">
                در این بخش زمان‌های آزاد جهت نوبت‌دهی منشی را تعیین یا ویرایش کنید (امکان رزرو نوبت فقط در تایم‌های آزاد سبز رنگ توسط منشی وجود دارد).
              </p>
            </div>
          </div>

          {/* Date Navigator Controls */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedDateIndex((prev) => Math.max(0, prev - 1))}
              disabled={selectedDateIndex === 0}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
              title="روز قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 font-black text-xs text-[#005581] dark:text-[#72cdf4] min-w-[140px] text-center">
              {currentDay.dayName} {currentDay.dateStr}
            </div>

            <button
              onClick={() => setSelectedDateIndex((prev) => Math.min(weekDays.length - 1, prev + 1))}
              disabled={selectedDateIndex === weekDays.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
              title="روز بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDateIndex(0)}
              className="px-2.5 py-1 bg-[#005581] text-white rounded-lg font-bold text-[11px] shadow hover:bg-[#004266] transition cursor-pointer"
            >
              امروز
            </button>
          </div>

          {/* View Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-[#005581] text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
              }`}
            >
              دیدگاه روزانه (Day)
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-[#005581] text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
              }`}
            >
              دیدگاه هفتگی (Week)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#005581] text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
              }`}
            >
              لیست نوبت‌های ثبت‌شده
            </button>
          </div>
        </div>

        {/* Summary Metric Badges & Doctor Availability Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-[#005581]/5 border border-[#005581]/20 text-[#005581] dark:text-[#72cdf4] font-bold flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-[#005581]" />
              <span>زمان‌های آزاد جهت وقت‌دهی منشی:</span>
              <span className="font-mono text-sm font-black text-[#005581] dark:text-[#72cdf4]">{countAvailableSlots} بازه</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#005581]/5 border border-[#005581]/20 text-[#005581] dark:text-[#72cdf4] font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#005581]" />
              <span>نوبت‌های رزروشده امروز:</span>
              <span className="font-mono text-sm font-black text-[#005581] dark:text-[#72cdf4]">{countTotalAppointments} بیمار</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>بازه‌های مسدود/مرخصی:</span>
              <span className="font-mono text-sm font-black">{countBlockedSlots} بازه</span>
            </div>
          </div>

          {/* Quick Doctor Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnableAllSlots}
              className="px-3 py-1.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#ffd200]" />
              <span>باز کردن تمام بازه‌ها</span>
            </button>
            <button
              onClick={handleDisableAllSlots}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>مسدود کردن کل روز (مرخصی)</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DAY VIEW GRID (جدول تعاملی زمان‌های کاری دندان‌پزشک) */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-[#005581] dark:text-[#72cdf4] pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>جدول تعاملی زمان‌های کاری دندان‌پزشک ({currentDay.dayName} {currentDay.dateStr})</span>
            <span className="text-slate-500 font-normal">
              جهت تغییر وضعیت بازه (آزاد برای منشی / مسدود)، روی هر کارت کلیک کنید.
            </span>
          </div>

          <div className="space-y-2">
            {timeGrid.map((slot, index) => {
              // Check if an appointment exists for this slot
              const matchingApt = filteredAppointments.find(
                (a) => a.timeSlot === slot || (index === 1 && a.status === 'in_unit')
              );

              const isLunchBreak = slot.includes('12:30');
              const isAvailable = slotAvailability[slot] === 'available';

              return (
                <div
                  key={slot}
                  className={`flex flex-col sm:flex-row items-stretch gap-3 p-3 rounded-xl border transition ${
                    isLunchBreak
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30'
                      : matchingApt
                      ? 'bg-[#005581]/5 border-[#005581] shadow-xs'
                      : isAvailable
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Slot Time Label Column */}
                  <div className="w-full sm:w-36 flex sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-l border-slate-200 dark:border-slate-700 pl-2 pb-2 sm:pb-0">
                    <span className="font-mono font-bold text-xs text-[#005581] dark:text-[#72cdf4] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {slot}
                    </span>
                    {matchingApt ? (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        ● نوبت رزروشده
                      </span>
                    ) : isLunchBreak ? (
                      <span className="text-[10px] font-bold text-amber-700">استراحت</span>
                    ) : isAvailable ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <Unlock className="w-3 h-3" />
                        آزاد برای منشی
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" />
                        مسدود / مرخصی
                      </span>
                    )}
                  </div>

                  {/* Slot Body Content */}
                  <div className="flex-1">
                    {isLunchBreak ? (
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs py-1">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>زمان استراحت و ناهار کادر درمان (غیرقابل وقت‌دهی)</span>
                      </div>
                    ) : matchingApt ? (
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                              {matchingApt.patientName}
                            </span>
                            {getStatusBadge(matchingApt.status, matchingApt.connectedToUnit)}
                            {matchingApt.isFirstVisit && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                                ویزیت بار اول
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-3">
                            <span>علت مراجعه: <strong className="text-slate-900 dark:text-slate-100">{matchingApt.reason}</strong></span>
                            <span>تلفن تماس: <strong className="font-mono">{matchingApt.patientPhone}</strong></span>
                            {matchingApt.receptionNoteToDoctor && (
                              <span className="text-amber-700 dark:text-amber-300 font-bold">
                                نوت منشی: {matchingApt.receptionNoteToDoctor}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Action Buttons */}
                        <div className="flex items-center gap-2 self-end md:self-auto pt-2 md:pt-0">
                          {onSelectPatientToExamine && (
                            <button
                              onClick={() => onSelectPatientToExamine(matchingApt.patientId, matchingApt.id)}
                              className="px-3.5 py-1.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs shadow flex items-center gap-1 cursor-pointer"
                            >
                              <Stethoscope className="w-3.5 h-3.5 text-[#ffd200]" />
                              <span>فراخوان به یونیت</span>
                            </button>
                          )}

                          {onUpdateAppointmentStatus && matchingApt.status !== 'completed' && (
                            <button
                              onClick={() => onUpdateAppointmentStatus(matchingApt.id, 'completed')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اتمام درمان</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs py-1">
                        {isAvailable ? (
                          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>بازه زمانی آزاد است (منشی در پورتال پذیرش می‌تواند نوبت ثبت کند)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500 font-medium italic">
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            <span>بازه زمانی مسدود گردیده (منشی امکان وقت‌دهی ندارد)</span>
                          </div>
                        )}

                        <button
                          onClick={() => handleToggleSlotAvailability(slot)}
                          className={`px-3 py-1 rounded-xl font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1 ${
                            isAvailable
                              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>تغییر به مسدود / مرخصی</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>باز کردن جهت نوبت‌دهی</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK VIEW GRID */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 overflow-x-auto">
          <div className="text-xs font-black text-[#005581] dark:text-[#72cdf4] pb-2 border-b border-slate-100 dark:border-slate-800">
            نمای برنامه هفتگی و زمان‌های حضور دندان‌پزشک
          </div>

          <div className="grid grid-cols-6 gap-2 min-w-[700px]">
            {weekDays.map((wDay, idx) => (
              <div
                key={wDay.dayName}
                onClick={() => {
                  setSelectedDateIndex(idx);
                  setViewMode('day');
                }}
                className={`p-3 rounded-xl border space-y-3 cursor-pointer transition hover:border-[#005581] ${
                  idx === selectedDateIndex
                    ? 'bg-[#005581]/5 border-[#005581] ring-1 ring-[#005581]'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="block font-black text-xs text-slate-900 dark:text-slate-100">
                    {wDay.dayName}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500">{wDay.dateStr}</span>
                  {wDay.isToday && (
                    <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-[#ffd200] text-[#005581] font-black">
                      امروز
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] text-center">
                    {countAvailableSlots} بازه آزاد برای منشی
                  </div>
                  {idx === selectedDateIndex ? (
                    filteredAppointments.map((a) => (
                      <div
                        key={a.id}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1 shadow-xs"
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{a.patientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{a.timeSlot}</div>
                        <div className="text-[10px] text-[#005581] font-semibold truncate">{a.reason}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 text-center py-2 italic">
                      ۲ نوبت ثبت شده
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-[#005581] dark:text-[#72cdf4] pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>جدول کامل نوبت‌های ثبت‌شده توسط منشی</span>
            <span>تعداد موارد: {filteredAppointments.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">زمان نوبت</th>
                  <th className="p-3">نام بیمار</th>
                  <th className="p-3">تلفن تماس</th>
                  <th className="p-3">علت مراجعه</th>
                  <th className="p-3">وضعیت نوبت</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-[#005581]">{apt.timeSlot}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{apt.patientName}</td>
                    <td className="p-3 font-mono">{apt.patientPhone}</td>
                    <td className="p-3">{apt.reason}</td>
                    <td className="p-3">{getStatusBadge(apt.status, apt.connectedToUnit)}</td>
                    <td className="p-3 text-center">
                      {onSelectPatientToExamine && (
                        <button
                          onClick={() => onSelectPatientToExamine(apt.patientId, apt.id)}
                          className="px-3 py-1 bg-[#005581] hover:bg-[#004266] text-white rounded-lg font-bold text-[11px] cursor-pointer shadow"
                        >
                          شروع معاینه
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
