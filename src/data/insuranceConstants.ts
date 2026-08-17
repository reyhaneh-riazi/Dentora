// Standard insurance providers in Iran for dental & medical clinics

export interface InsuranceOption {
  value: string;
  label: string;
}

export const SUGGESTED_BASE_INSURANCES: InsuranceOption[] = [
  { value: 'بیمه تامین اجتماعی', label: 'بیمه تامین اجتماعی' },
  { value: 'بیمه خدمات درمانی (سلامت ایران)', label: 'بیمه خدمات درمانی (سلامت ایران)' },
  { value: 'بیمه نیروهای مسلح', label: 'بیمه نیروهای مسلح' },
  { value: 'بیمه روستاییان و عشایر', label: 'بیمه روستاییان و عشایر' },
  { value: 'فاقد بیمه پایه (آزاد)', label: 'فاقد بیمه پایه (آزاد)' },
  { value: '__other__', label: 'سایر بیمه‌های پایه (ثبت دستی...)' },
];

export const SUGGESTED_SUPPLEMENTARY_INSURANCES: InsuranceOption[] = [
  { value: 'بیمه ایران', label: 'بیمه ایران' },
  { value: 'بیمه دانا', label: 'بیمه دانا' },
  { value: 'بیمه البرز', label: 'بیمه البرز' },
  { value: 'بیمه سامان', label: 'بیمه سامان' },
  { value: 'بیمه آسیا', label: 'بیمه آسیا' },
  { value: 'بیمه کوثر', label: 'بیمه کوثر' },
  { value: 'بیمه معلم', label: 'بیمه معلم' },
  { value: 'آتیه‌سازان حافظ', label: 'بیمه آتیه‌سازان حافظ' },
  { value: 'بیمه دی', label: 'بیمه دی' },
  { value: 'بیمه پارسیان', label: 'بیمه پارسیان' },
  { value: 'بیمه پاسارگاد', label: 'بیمه پاسارگاد' },
  { value: 'بیمه کارآفرین', label: 'بیمه کارآفرین' },
  { value: 'بیمه ما', label: 'بیمه ما' },
  { value: 'بیمه ملت', label: 'بیمه ملت' },
  { value: 'بیمه سینا', label: 'بیمه سینا' },
  { value: 'بیمه رازی', label: 'بیمه رازی' },
  { value: 'بیمه نوین', label: 'بیمه نوین' },
  { value: 'بیمه سرمد', label: 'بیمه سرمد' },
  { value: 'بیمه تجارت نو', label: 'بیمه تجارت نو' },
  { value: 'بیمه آرمان', label: 'بیمه آرمان' },
  { value: 'فاقد بیمه تکمیلی (آزاد)', label: 'فاقد بیمه تکمیلی (آزاد)' },
  { value: '__other__', label: 'سایر بیمه‌های تکمیلی (ثبت دستی...)' },
];
