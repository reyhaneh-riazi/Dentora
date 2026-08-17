// Iranian Identity and Input Validators

export function toEnglishDigits(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  const s = String(str);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = s;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), String(i));
    result = result.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }
  return result;
}

/**
 * Validates Iranian 10-digit National ID (کد ملی)
 * Uses standard Modulo 11 Checksum algorithm
 */
export function isValidNationalId(nationalId: string): boolean {
  if (!nationalId) return false;
  const clean = toEnglishDigits(nationalId).trim();
  
  if (!/^\d{10}$/.test(clean)) {
    return false;
  }

  // Reject known repeating pattern sequences (e.g. 0000000000, 1111111111, ..., 9999999999)
  const repeating = [
    '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
    '5555555555', '6666666666', '7777777777', '8888888888', '9999999999'
  ];
  if (repeating.includes(clean)) {
    return false;
  }

  const checkDigit = parseInt(clean[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * (10 - i);
  }
  
  const remainder = sum % 11;
  if (remainder < 2) {
    return checkDigit === remainder;
  } else {
    return checkDigit === 11 - remainder;
  }
}

/**
 * Validates Iranian 11-digit mobile phone number (09xxxxxxxxx or +989xxxxxxxxx)
 */
export function isValidMobile(mobile: string): boolean {
  if (!mobile) return false;
  let clean = toEnglishDigits(mobile).trim();
  
  // Replace +98 with 0
  if (clean.startsWith('+98')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('0098')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('98') && clean.length === 12) {
    clean = '0' + clean.slice(2);
  }
  
  return /^09\d{9}$/.test(clean);
}

/**
 * Validates standard email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const clean = toEnglishDigits(email).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

/**
 * Validates password strength (minimum 6 characters)
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: 'رمز عبور نمی‌تواند خالی باشد.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' };
  }
  return { valid: true };
}

/**
 * Validates Iranian Medical Council Number (شماره نظام پزشکی: 4 to 7 digits)
 */
export function isValidMedicalCouncil(code: string): boolean {
  if (!code) return false;
  const clean = toEnglishDigits(code).trim();
  return /^\d{4,7}$/.test(clean);
}
