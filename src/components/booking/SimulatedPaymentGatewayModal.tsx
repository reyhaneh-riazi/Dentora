import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, X, CheckCircle2, AlertCircle, RefreshCw, Bookmark, Plus, Check } from 'lucide-react';
import { SavedBankCard } from '../../types';
import { toPersianDigits } from '../../utils/persianDigits';

interface SimulatedPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  description: string;
  savedCards?: SavedBankCard[];
  onSaveNewCard?: (card: SavedBankCard) => void;
}

const defaultSavedCards: SavedBankCard[] = [
  {
    id: 'sc-1',
    bankName: 'بانک سامان',
    cardNumber: '6219861045239811',
    cvv2: '742',
    expMonth: '۰۹',
    expYear: '۰۸',
    holderName: 'کارت پیش‌فرض',
    isDefault: true,
  },
  {
    id: 'sc-2',
    bankName: 'بانک ملت',
    cardNumber: '6104337890123456',
    cvv2: '419',
    expMonth: '۱۱',
    expYear: '۰۷',
    holderName: 'کارت دوم حساب بانکی',
  },
  {
    id: 'sc-3',
    bankName: 'بانک ملی ایران',
    cardNumber: '6037991822334455',
    cvv2: '342',
    expMonth: '۰۸',
    expYear: '۰۷',
    holderName: 'کارت متصل به شتاب',
  },
];

export const SimulatedPaymentGatewayModal: React.FC<SimulatedPaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  description,
  savedCards = defaultSavedCards,
  onSaveNewCard,
}) => {
  const cardsList = savedCards && savedCards.length > 0 ? savedCards : defaultSavedCards;
  const initialCard = cardsList[0];

  const [selectedCardId, setSelectedCardId] = useState<string>(initialCard ? initialCard.id : 'custom');
  const [cardNumber, setCardNumber] = useState(initialCard ? initialCard.cardNumber : '');
  const [cvv2, setCvv2] = useState(initialCard ? initialCard.cvv2 : '');
  const [expMonth, setExpMonth] = useState(initialCard ? initialCard.expMonth : '');
  const [expYear, setExpYear] = useState(initialCard ? initialCard.expYear : '');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shouldSaveCard, setShouldSaveCard] = useState(false);
  const [cardNickname, setCardNickname] = useState('');

  if (!isOpen) return null;

  const handleSelectSavedCard = (card: SavedBankCard) => {
    setSelectedCardId(card.id);
    setCardNumber(card.cardNumber);
    setCvv2(card.cvv2);
    setExpMonth(card.expMonth);
    setExpYear(card.expYear);
    setErrorMessage(null);
  };

  const handleSelectCustomCard = () => {
    setSelectedCardId('custom');
    setCardNumber('');
    setCvv2('');
    setExpMonth('');
    setExpYear('');
    setErrorMessage(null);
  };

  const handleRequestOtp = () => {
    setOtpSent(true);
    setOtpCode('789102');
    alert('رمز پویا با موفقیت به شماره همراه صاحب کارت پیامک شد.\nرمز آزمایشی شاپرک: 789102');
  };

  const formatCardNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' - ');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replaceAll('-', '').replaceAll(' ', '');
    if (cleanCard.length < 16) {
      setErrorMessage('لطفاً شماره کارت ۱۶ رقمی معتبر وارد کنید.');
      return;
    }
    if (!cvv2 || cvv2.length < 3) {
      setErrorMessage('کد CVV2 نامعتبر است (حداقل ۳ رقم).');
      return;
    }
    if (!expMonth || !expYear) {
      setErrorMessage('لطفاً تاریخ انقضای کارت (ماه و سال) را کامل وارد کنید.');
      return;
    }
    if (!otpCode || otpCode.length < 5) {
      setErrorMessage('لطفاً رمز دوم پویا را وارد کنید.');
      return;
    }

    if (shouldSaveCard && selectedCardId === 'custom' && onSaveNewCard) {
      onSaveNewCard({
        id: `card-${Date.now()}`,
        bankName: cardNickname || 'کارت ذخیره‌شده جدید',
        cardNumber: cleanCard,
        cvv2,
        expMonth,
        expYear,
        holderName: cardNickname || 'کارت شخصی بیمار',
      });
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs dir-rtl font-sans animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl border-2 border-[#005581]/30 shadow-2xl max-w-lg w-full overflow-hidden relative my-auto">
        
        {/* Gateway Header Banner */}
        <div className="bg-gradient-to-r from-[#004266] via-[#005581] to-[#00334e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-[#ffd200]">
              <CreditCard className="w-6 h-6 text-[#ffd200]" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">درگاه پرداخت الکترونیک شتاب (شاپرک)</h3>
              <p className="text-[11px] text-slate-200">پرداخت امن شاپرک - انتخاب کارت‌های ذخیره شده در سیستم</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Info Summary */}
        <div className="bg-amber-50/90 p-4 border-b border-amber-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-amber-900 font-bold block">موضوع تراکنش: {description}</span>
            <span className="text-amber-700 text-[11px]">شناسه پذیرنده کلینیک: ۹۸۱۲۴۰۱۹۲۳</span>
          </div>

          <div className="text-left font-mono">
            <span className="text-slate-500 text-[10px] block">مبلغ قابل پرداخت:</span>
            <strong className="text-emerald-700 text-base font-black">{amount.toLocaleString()} تومان</strong>
          </div>
        </div>

        {/* SAVED CARDS QUICK-PICKER SECTION */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#005581]" />
              <span>کارت‌های بانکی ذخیره‌شده در سیستم:</span>
            </span>
            <span className="text-[11px] text-slate-500">انتخاب سریع با یک کلیک</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cardsList.map((card) => {
              const isSelected = selectedCardId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectSavedCard(card)}
                  className={`p-2.5 rounded-2xl border text-right transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#005581] bg-blue-50/80 ring-2 ring-[#005581]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <CreditCard className="w-3.5 h-3.5 text-[#005581] shrink-0" />
                      <span className="truncate">{card.bankName}</span>
                      {card.isDefault && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold">اصلی</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 mt-1 tracking-wider">
                      •••• {toPersianDigits(card.cardNumber.slice(-4))}
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#005581] bg-[#005581] text-white' : 'border-slate-300 bg-slate-50'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}

            {/* Custom Card Button */}
            <button
              type="button"
              onClick={handleSelectCustomCard}
              className={`p-2.5 rounded-2xl border border-dashed text-right transition cursor-pointer flex items-center justify-between ${
                selectedCardId === 'custom'
                  ? 'border-[#005581] bg-blue-50/80 ring-2 ring-[#005581]/20'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Plus className="w-3.5 h-3.5 text-[#005581]" />
                <span>ورود کارت بانکی دیگر</span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                selectedCardId === 'custom' ? 'border-[#005581] bg-[#005581] text-white' : 'border-slate-300'
              }`}>
                {selectedCardId === 'custom' && <Check className="w-3 h-3" />}
              </div>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card Entry Form */}
        <form onSubmit={handlePay} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              شماره کارت ۱۶ رقمی:
            </label>
            <input
              type="text"
              required
              maxLength={19}
              value={cardNumber}
              onChange={(e) => {
                setSelectedCardId('custom');
                setCardNumber(e.target.value);
              }}
              placeholder="6037-9918-0000-0000"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-mono text-center text-sm font-bold tracking-widest outline-none bg-slate-50 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                کد CVV2:
              </label>
              <input
                type="password"
                required
                maxLength={4}
                value={cvv2}
                onChange={(e) => setCvv2(e.target.value)}
                placeholder="3 یا 4 رقم"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-mono text-center text-sm outline-none bg-slate-50 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                تاریخ انقضا (ماه / سال):
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  maxLength={2}
                  placeholder="ماه"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-mono text-center text-sm outline-none bg-slate-50 focus:bg-white transition"
                />
                <span className="self-center font-bold text-slate-400">/</span>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="سال"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-mono text-center text-sm outline-none bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Option to Save Card when entering a new card */}
          {selectedCardId === 'custom' && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={shouldSaveCard}
                  onChange={(e) => setShouldSaveCard(e.target.checked)}
                  className="w-4 h-4 rounded text-[#005581] accent-[#005581]"
                />
                <span>ذخیره این کارت در سیستم جهت پرداخت‌های آتی</span>
              </label>
              {shouldSaveCard && (
                <input
                  type="text"
                  placeholder="نام یا عنوان دلخواه برای این کارت (مثلاً کارت بانک پاسارگاد)"
                  value={cardNickname}
                  onChange={(e) => setCardNickname(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-[#005581]"
                />
              )}
            </div>
          )}

          {/* OTP Code Entry */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              رمز دوم پویا (SMS):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="رمز پویا"
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#005581] font-mono text-center text-sm font-bold tracking-wider outline-none bg-slate-50 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={handleRequestOtp}
                className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-[#005581] rounded-xl font-bold text-xs transition cursor-pointer whitespace-nowrap border border-blue-200"
              >
                {otpSent ? 'ارسال مجدد رمز' : 'دریافت رمز پویا'}
              </button>
            </div>
          </div>

          {/* SSL Safety Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>اتصال شما با الگوریتم شاپرک SSL 256-bit رمزنگاری شده است.</span>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 font-bold text-slate-600 cursor-pointer transition"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال پردازش تراکنش...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>پرداخت و بازگشت به سامانه</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
