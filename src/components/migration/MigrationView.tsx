import React, { useState } from 'react';
import { MigrationState } from '../../types';
import { Database, ArrowRightLeft, CheckCircle2, RefreshCw, Layers, Check } from 'lucide-react';

export const MigrationView: React.FC = () => {
  const [migration, setMigration] = useState<MigrationState>({
    method: 'import_only',
    status: 'idle',
    recordsTransferred: 4820,
    totalRecords: 5000,
  });

  const handleStartMigration = () => {
    setMigration({ ...migration, status: 'in_progress' });
    setTimeout(() => {
      setMigration({
        ...migration,
        status: 'completed',
        recordsTransferred: 5000,
        lastSyncTime: '۱۳ مرداد ۱۴۰۵ - ۱۱:۴۵',
      });
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Database className="w-6 h-6 text-cyan-600" />
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            مهاجرت داده از سیستم‌های قدیمی کلینیک (P9 - Dentora Migration)
          </h2>
          <p className="text-xs text-slate-500">
            انتقال کامل پرونده‌ها، بیماران، نوبت‌ها، تصاویر و بدهی‌ها از نرم‌افزارهای قبلی (سلاک طب، کلینیکیفای، طب‌نویس و ...)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div
          onClick={() => setMigration({ ...migration, method: 'import_only' })}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            migration.method === 'import_only'
              ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 font-bold'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <h3 className="font-bold text-sm text-cyan-600">۱. فقط ورود داده (Import-Only - روش ترجیحی)</h3>
          <p className="text-slate-500 font-normal mt-1">
            داده‌های سیستم قبلی یک‌بار به‌طور کامل وارد دنتورا می‌شوند و نرم‌افزار قدیمی فقط‌خواندنی می‌شود.
          </p>
        </div>

        <div
          onClick={() => setMigration({ ...migration, method: 'read_through' })}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            migration.method === 'read_through'
              ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 font-bold'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <h3 className="font-bold text-sm text-cyan-600">۲. خواندن هم‌زمان (Read-Through)</h3>
          <p className="text-slate-500 font-normal mt-1">
            دنتورا داده‌های قدیمی را برای مشاهده نمایش می‌دهد اما همه نوبت‌ها و فاکتورهای جدید در دنتورا ثبت می‌شوند.
          </p>
        </div>

        <div
          onClick={() => setMigration({ ...migration, method: 'dual_entry' })}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            migration.method === 'dual_entry'
              ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 font-bold'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <h3 className="font-bold text-sm text-cyan-600">۳. ورود دوگانه (Dual-Entry - حداکثر ۹۰ روز)</h3>
          <p className="text-slate-500 font-normal mt-1">
            هر دو سیستم موقتاً فعال‌اند تا کلینیک به‌تدریج انتقال یابد.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
        <div className="flex justify-between items-center font-bold">
          <span className="flex items-center gap-1">
            وضعیت انتقال اطلاعات: {migration.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                تکمیل شد <Check className="w-3.5 h-3.5" />
              </span>
            ) : (
              'در حال همگام‌سازی'
            )}
          </span>
          <span className="font-mono text-cyan-600">{migration.recordsTransferred} / {migration.totalRecords} رکورد</span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-600 h-full transition-all duration-500"
            style={{ width: `${(migration.recordsTransferred / migration.totalRecords) * 100}%` }}
          ></div>
        </div>

        <button
          onClick={handleStartMigration}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          شروع همگام‌سازی کامل
        </button>
      </div>
    </div>
  );
};
