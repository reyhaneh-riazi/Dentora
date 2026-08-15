import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface SimulatedPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  description: string;
}

export const SimulatedPaymentGatewayModal: React.FC<SimulatedPaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  description,
}) => {
  const [cardNumber, setCardNumber] = useState('6037991822334455');
  const [cvv2, setCvv2] = useState('342');
  const [expMonth, setExpMonth] = useState('08');
  const [expYear, setExpYear] = useState('07');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = () => {
    setOtpSent(true);
    setOtpCode('789102');
    alert('رمز پویا با موفقیت به شماره همراه صاحب کارت پیامک شد.\nرمز آزمایشی: 789102');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cardNumber.replaceAll('-', '').replaceAll(' ', '').length < 16) {
      setErrorMessage('لطفاً شماره کارت ۱۶ رقمی معتبر وارد کنید.');
      return;
    }
    if (!cvv2 || cvv2.length < 3) {
      setErrorMessage('کد CVV2 نامعتبر است.');
      return;
    }
    if (!otpCode || otpCode.length < 5) {
      setErrorMessage('لطفاً رمز پویا را وارد کنید.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs dir-rtl font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl border-2 border-[#005581]/30 shadow-2xl max-w-lg w-full overflow-hidden relative">
        
        {/* Gateway Header Banner */}
        <div className="bg-gradient-to-r from-[#004266] via-[#005581] to-[#00334e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-[#ffd200]">
              <CreditCard className="w-6 h-6 text-[#ffd200]" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">درگاه پرداخت الکترونیک شتاب (شاپرک)</h3>
              <p className="text-[11px] text-slate-200">پرداخت امن شاپرک - بانک سامان / سداد</p>
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
        <div className="bg-amber-50/80 p-4 border-b border-amber-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-amber-900 font-bold block">موضوع تراکنش: {description}</span>
            <span className="text-amber-700 text-[11px]">شناسه پذیرنده: 9812401923</span>
          </div>

          <div className="text-left font-mono">
            <span className="text-slate-500 text-[10px] block">مبلغ قابل پرداخت:</span>
            <strong className="text-emerald-700 text-base font-black">{amount.toLocaleString()} تومان</strong>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
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
              onChange={(e) => setCardNumber(e.target.value)}
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
            <span>اتصال شما با الگوریتم SSL 256-bit رمزنگاری شده است.</span>
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
