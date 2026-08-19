import { toPersianDigits } from './persianDigits';

export type DoctorSlotCategory = 'general' | 'surgery' | 'all' | 'unavailable';

export interface DurationInfo {
  durationMinutes: number;
  durationLabel: string;
  isSurgical: boolean;
  category: 'surgery' | 'general';
  categoryTitle: string;
  explanation: string;
}

/**
 * Checks if a reason for visit contains surgical keywords: «جراحی» or «عمل» or surgical operations.
 */
export function checkIsSurgicalReason(reason: string): boolean {
  if (!reason) return false;
  const clean = reason.trim().toLowerCase();
  return (
    clean.includes('جراحی') ||
    clean.includes('عمل') ||
    clean.includes('surgery') ||
    clean.includes('operation') ||
    clean.includes('ایمپلنت') ||
    clean.includes('پیوند') ||
    clean.includes('فلپ') ||
    clean.includes('نهفته') ||
    clean.includes('سینوس لیفت') ||
    clean.includes('اکسترکشن جراحی')
  );
}

/**
 * Determines exact appointment duration and treatment category based on reason for visit.
 */
export function getAppointmentDuration(reason: string): DurationInfo {
  const clean = (reason || '').trim();
  const isSurg = checkIsSurgicalReason(clean);

  if (isSurg) {
    if (
      clean.includes('فک') ||
      clean.includes('پیوند استخوان') ||
      clean.includes('سینوس لیفت') ||
      clean.includes('ایمپلنت چند') ||
      clean.includes('جراحی وسیع')
    ) {
      return {
        durationMinutes: 120, // 2 hours
        durationLabel: '۲ ساعت',
        isSurgical: true,
        category: 'surgery',
        categoryTitle: 'جراحی و عمل‌های تخصصی پیشرفته',
        explanation: 'بازه زمانی نوبت بر حسب جراحی تخصصی و عمل‌های پیشرفته، ۲ ساعت تعیین گردید.',
      };
    }

    return {
      durationMinutes: 90, // 1.5 hours
      durationLabel: '۱ ساعت و ۳۰ دقیقه',
      isSurgical: true,
      category: 'surgery',
      categoryTitle: 'جراحی و عمل‌های تخصصی دندان‌پزشکی',
      explanation: 'بازه زمانی نوبت بر حسب جراحی دندان/لثه/ایمپلنت، ۱ ساعت و ۳۰ دقیقه تعیین گردید.',
    };
  }

  // Root Canal / Endodontics / Prosthodontics / Veneer
  if (
    clean.includes('عصب‌کشی') ||
    clean.includes('عصب کشی') ||
    clean.includes('درمان ریشه') ||
    clean.includes('اندو') ||
    clean.includes('روکش') ||
    clean.includes('پروتز') ||
    clean.includes('لمینیت') ||
    clean.includes('کامپوزیت ونیر')
  ) {
    return {
      durationMinutes: 60, // 1 hour
      durationLabel: '۱ ساعت',
      isSurgical: false,
      category: 'general',
      categoryTitle: 'درمان ریشه و کارهای تخصصی عمومی',
      explanation: 'بازه زمانی نوبت بر حسب عصب‌کشی و ترمیم تخصصی، ۱ ساعت کامل تعیین گردید.',
    };
  }

  // Restorations / Fillings / Orthodontics
  if (
    clean.includes('ترمیم') ||
    clean.includes('پر کردن') ||
    clean.includes('بیلداپ') ||
    clean.includes('ارتودنسی') ||
    clean.includes('بلیچینگ')
  ) {
    return {
      durationMinutes: 45, // 45 mins
      durationLabel: '۴۵ دقیقه',
      isSurgical: false,
      category: 'general',
      categoryTitle: 'ترمیم و کارهای عمومی دندان‌پزشکی',
      explanation: 'بازه زمانی نوبت بر حسب ترمیم و خدمات درمانی، ۴۵ دقیقه تعیین گردید.',
    };
  }

  // General Checkup, Consultation, Scaling
  return {
    durationMinutes: 30, // 30 mins
    durationLabel: '۳۰ دقیقه',
    isSurgical: false,
    category: 'general',
    categoryTitle: 'معاینه، چکاپ و جرم‌گیری عمومی',
    explanation: 'بازه زمانی نوبت بر حسب معاینه و کارهای عمومی، ۳۰ دقیقه تعیین گردید.',
  };
}

/**
 * Helper to add minutes to HH:MM format
 */
function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutesToAdd;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

export interface GeneratedTimeSlot {
  id: string;
  start: string; // "09:00"
  end: string;   // "10:30"
  label: string; // "۰۹:۰۰ تا ۱۰:۳۰"
  durationMinutes: number;
  durationLabel: string;
  shift: 'morning' | 'evening';
  category: DoctorSlotCategory; // 'general' | 'surgery' | 'all'
}

/**
 * Generates dynamic time slots according to calculated duration and shift.
 */
export function generateDynamicSlots(
  durationMinutes: number,
  shift: 'morning' | 'evening',
  doctorScheduleFilter?: (startTime: string) => DoctorSlotCategory
): GeneratedTimeSlot[] {
  const slots: GeneratedTimeSlot[] = [];

  const startHour = shift === 'morning' ? 8.5 : 15.0; // 08:30 or 15:00
  const endHour = shift === 'morning' ? 13.0 : 20.0;   // 13:00 or 20:00

  let currentMin = Math.round(startHour * 60);
  const maxMin = Math.round(endHour * 60);

  while (currentMin + durationMinutes <= maxMin) {
    const h = Math.floor(currentMin / 60);
    const m = currentMin % 60;
    const startTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const endTimeStr = addMinutesToTime(startTimeStr, durationMinutes);

    const slotCategory = doctorScheduleFilter ? doctorScheduleFilter(startTimeStr) : 'all';

    // Format Persian Label e.g. "۰۹:۰۰ تا ۱۰:۳۰"
    const label = `${toPersianDigits(startTimeStr)} تا ${toPersianDigits(endTimeStr)}`;
    const durationLabel =
      durationMinutes === 30
        ? '۳۰ دقیقه'
        : durationMinutes === 45
        ? '۴۵ دقیقه'
        : durationMinutes === 60
        ? '۱ ساعت'
        : durationMinutes === 90
        ? '۱.۵ ساعت'
        : durationMinutes === 120
        ? '۲ ساعت'
        : `${durationMinutes} دقیقه`;

    slots.push({
      id: `${shift}-${startTimeStr}-${endTimeStr}`,
      start: startTimeStr,
      end: endTimeStr,
      label,
      durationMinutes,
      durationLabel,
      shift,
      category: slotCategory,
    });

    currentMin += durationMinutes;
  }

  return slots;
}
