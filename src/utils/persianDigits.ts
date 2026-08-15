export function toPersianDigits(n: number | string | undefined | null): string {
  if (n === undefined || n === null) return '';
  const str = String(n);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function formatPricePersian(amount: number): string {
  const formatted = amount.toLocaleString('en-US');
  return toPersianDigits(formatted) + ' تومان';
}
