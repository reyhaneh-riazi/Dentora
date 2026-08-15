import React, { useState } from 'react';
import { TodayMoneyBoard, Invoice, InstallmentPlan } from '../../types';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Download,
  Plus,
  ArrowDownRight,
  PieChart,
} from 'lucide-react';

interface FinancialDashboardProps {
  moneyBoard: TodayMoneyBoard;
  invoices: Invoice[];
  installments: InstallmentPlan[];
  onPayInstallment: (planId: string, installmentNo: number) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  moneyBoard,
  invoices,
  installments,
  onPayInstallment,
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'waterfall' | 'installments' | 'commissions'>('board');

  // Waterfall Calculation Playground State
  const [procedureCost, setProcedureCost] = useState<number>(5200000); // e.g. 5,200,000 Tomans
  const [baseInsuranceCoveragePercent, setBaseInsuranceCoveragePercent] = useState<number>(20); // 20%
  const [supplInsuranceCoveragePercent, setSupplInsuranceCoveragePercent] = useState<number>(60); // 60%

  // Waterfall results
  const baseInsuranceAmount = Math.round((procedureCost * baseInsuranceCoveragePercent) / 100);
  const remainingAfterBase = procedureCost - baseInsuranceAmount;
  const supplInsuranceAmount = Math.round((remainingAfterBase * supplInsuranceCoveragePercent) / 100);
  const patientShare = procedureCost - baseInsuranceAmount - supplInsuranceAmount;

  return (
    <div className="space-y-4">
      {/* Header & Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>مدیریت مالی، صورت‌حساب چندسهمی و تابلوی نقدینگی دنتورا</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تحلیل جریان نقدینگی، محاسبه آبشاری سهم بیمه، اقساط سررسید و کارانه پزشکان قراردادی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('گزارش جامع مالی با فرمت Excel صادر گردید.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>خروجی اکسل</span>
          </button>
        </div>
      </div>

      {/* TABS Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'board'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>تابلوی پول امروز (Today's Money Board)</span>
        </button>

        <button
          onClick={() => setActiveTab('waterfall')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'waterfall'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>محاسبه آبشاری صورت‌حساب (پایه←تکمیلی←بیمار)</span>
        </button>

        <button
          onClick={() => setActiveTab('installments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'installments'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>برنامه اقساط و بدهی بیماران</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'commissions'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>سهم و کارانه پزشکان قراردادی</span>
        </button>
      </div>

      {/* TAB 1: Today's Money Board (تابلوی پول امروز) */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Received Today */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>مبلغ دریافت‌شده امروز (نقد/پوز)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 font-mono">
                {moneyBoard.receivedTodayCashPos.toLocaleString()} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">تراکنش‌های کارتخوان و واریزی حضوری</p>
            </div>

            {/* 2. Insurance Pending Total */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-900 dark:text-cyan-200 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                <span>مبالغ وابسته به بیمه (مطالبات)</span>
                <Clock className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-cyan-800 dark:text-cyan-300 font-mono">
                {moneyBoard.insurancePendingTotal.toLocaleString()} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">در حال بررسی در صف ادعاهای بیمه‌گر</p>
            </div>

            {/* 3. Installments Due Today */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>اقساط سررسید امروز</span>
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-800 dark:text-amber-300 font-mono">
                {moneyBoard.installmentsDueToday.toLocaleString()} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">پیامک خودکار یادآوری قسط ارسال شده است</p>
            </div>

            {/* 4. Overdue Installments */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400">
                <span>اقساط سررسیدگذشته (معوق)</span>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-800 dark:text-rose-300 font-mono">
                {moneyBoard.installmentsOverdueTotal.toLocaleString()} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">نیازمند پیگیری توسط منشی/حسابدار</p>
            </div>

            {/* 5. Total Invoiced Today */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-900 dark:text-purple-200 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-400">
                <span>مبلغ کل فاکتورشده امروز</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-800 dark:text-purple-300 font-mono">
                {moneyBoard.totalInvoicedToday.toLocaleString()} <span className="text-xs font-normal">تومان</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">مجموع ارزش خدمات درمانی ارائه‌شده</p>
            </div>

            {/* 6. Bottleneck Claims Count */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>پرونده‌های مانع جریان نقدی (Bottlenecks)</span>
                <AlertOctagon className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black text-red-400 font-mono">
                {moneyBoard.blockedClaimsCount} <span className="text-xs font-normal text-slate-300">پرونده</span>
              </div>
              <p className="text-[11px] text-slate-400">ادعاهای نیازمند مدرک تکمیلی یا اعتراض</p>
            </div>
          </div>

          {/* Today's Invoices Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">ریز صورت‌حساب‌های صادره امروز</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="py-2 px-3">شماره فاکتور</th>
                    <th className="py-2 px-3">نام بیمار</th>
                    <th className="py-2 px-3">دندان‌پزشک</th>
                    <th className="py-2 px-3">مبلغ کل</th>
                    <th className="py-2 px-3">سهم بیمه پایه</th>
                    <th className="py-2 px-3">سهم بیمه تکمیلی</th>
                    <th className="py-2 px-3">پرداختی بیمار</th>
                    <th className="py-2 px-3">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-600">{inv.id}</td>
                      <td className="py-2.5 px-3 font-bold">{inv.patientName}</td>
                      <td className="py-2.5 px-3">{inv.dentistName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{inv.totalAmount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{inv.baseInsuranceCovered.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-600">{inv.supplInsuranceCovered.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{inv.patientSharePaid.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status === 'paid' ? 'تسویه کامل' : 'اقساط / در انتظار بیمه'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Payer Waterfall Calculator (محاسبه آبشاری) */}
      {activeTab === 'waterfall' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <span>محاسبه آبشاری دوگانه پوشش بیمه (D-20 Waterfall Engine)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              فرمول محاسبه: تعرفه مصوب درمان ← کسر سهم بیمه پایه ← کسر سهم بیمه تکمیلی ← سهم خالص پرداختی بیمار
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  مبلغ کل تعرفه درمان (تومان):
                </label>
                <input
                  type="number"
                  value={procedureCost}
                  onChange={(e) => setProcedureCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  پوشش بیمه پایه (تامین اجتماعی / سلامت): {baseInsuranceCoveragePercent}٪
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={baseInsuranceCoveragePercent}
                  onChange={(e) => setBaseInsuranceCoveragePercent(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  پوشش بیمه تکمیلی (سامان / ایران): {supplInsuranceCoveragePercent}٪
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={supplInsuranceCoveragePercent}
                  onChange={(e) => setSupplInsuranceCoveragePercent(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Visual Waterfall Breakdown */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900 text-white font-mono text-xs border border-slate-800 shadow">
              <h4 className="font-bold text-sm text-cyan-400 border-b border-slate-800 pb-2">
                نتیجه تفکیک آبشاری صورت‌حساب:
              </h4>

              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">۱. هزینه کل درمان:</span>
                <span className="font-bold text-lg">{procedureCost.toLocaleString()} تومان</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800 text-slate-300">
                <span>۲. سهم بیمه پایه ({baseInsuranceCoveragePercent}٪):</span>
                <span className="text-emerald-400 font-bold">- {baseInsuranceAmount.toLocaleString()} تومان</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800 text-slate-300">
                <span>۳. سهم بیمه تکمیلی ({supplInsuranceCoveragePercent}٪ باقی‌مانده):</span>
                <span className="text-cyan-400 font-bold">- {supplInsuranceAmount.toLocaleString()} تومان</span>
              </div>

              <div className="flex justify-between items-center py-2 bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/40 mt-2">
                <span className="font-bold text-emerald-300 text-xs font-sans">سهم خالص نهایی بیمار:</span>
                <span className="font-black text-xl text-emerald-400">{patientShare.toLocaleString()} تومان</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Installment Plans (اقساط بیمار) */}
      {activeTab === 'installments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span>برنامه اقساط و زمان‌بندی سررسید بدهی بیماران</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت پیش‌پرداخت، تقسیم اقساط ماهانه و ثبت وصول نقد/کارتخوان در مطب
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {installments.map((plan) => (
              <div key={plan.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      بیمار: {plan.patientName} ({plan.phone})
                    </span>
                    <div className="text-slate-500 mt-0.5">
                      مبلغ کل: <strong>{plan.totalAmount.toLocaleString()} تومان</strong> | پیش‌پرداخت: <strong>{plan.prePaymentAmount.toLocaleString()} تومان</strong>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-amber-600 font-bold">
                      باقی‌مانده اقساط: {plan.remainingAmount.toLocaleString()} تومان ({plan.installmentsCount} قسط)
                    </span>
                  </div>
                </div>

                {/* Schedule Table */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {plan.schedule.map((item) => (
                    <div
                      key={item.installmentNo}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        item.status === 'paid'
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span>قسط شماره {item.installmentNo}</span>
                        <span>{item.dueDate}</span>
                      </div>
                      <div className="font-mono font-bold text-sm">{item.amount.toLocaleString()} تومان</div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] font-semibold">
                          {item.status === 'paid' ? 'تسویه‌شده' : 'در انتظار سررسید'}
                        </span>
                        {item.status !== 'paid' && (
                          <button
                            onClick={() => onPayInstallment(plan.id, item.installmentNo)}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                          >
                            ثبت دریافت
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Doctor Commissions (سهم پزشکان) */}
      {activeTab === 'commissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            گزارش کارانه و سهم درآمد پزشکان قراردادی (D-14)
          </h3>
          <p className="text-xs text-slate-500">تقسیم درآمد دقیق بر اساس درصد مصوب مالک کلینیک</p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2 px-3">نام دندان‌پزشک</th>
                  <th className="py-2 px-3">تخصص</th>
                  <th className="py-2 px-3">درصد کارانه</th>
                  <th className="py-2 px-3">کل درآمد کارکرد</th>
                  <th className="py-2 px-3">سهم خالص پزشک</th>
                  <th className="py-2 px-3">سهم کلینیک</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold">دکتر کاویانی</td>
                  <td className="py-2.5 px-3">عصب‌کشی (انودونتیکس)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-600">45٪</td>
                  <td className="py-2.5 px-3 font-mono">6,200,000 تومان</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">2,790,000 تومان</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">3,410,000 تومان</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold">دکتر شریفی</td>
                  <td className="py-2.5 px-3">جراحی ایمپلنت</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-600">50٪</td>
                  <td className="py-2.5 px-3 font-mono">22,500,000 تومان</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">11,250,000 تومان</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">11,250,000 تومان</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
