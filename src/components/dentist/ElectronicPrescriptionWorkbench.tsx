import React, { useState, useEffect } from 'react';
import {
  Patient,
  Appointment,
  ClinicRegistration,
  ElectronicPrescription,
  PrescriptionItem,
} from '../../types';
import {
  DENTAL_MEDICATIONS_DB,
  DENTAL_PRESCRIPTION_TEMPLATES,
  MedicationMaster,
  PrescriptionTemplate,
  checkPrescriptionAllergies,
  submitElectronicPrescriptionMock,
} from '../../services/prescriptionService';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Search,
  Sparkles,
  Send,
  Loader2,
  Copy,
  CheckCheck,
  AlertTriangle,
  Info,
  Layers,
  FileText,
  User,
  Building,
  Clock,
  Calendar,
  Pill,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  Edit3,
} from 'lucide-react';

interface ElectronicPrescriptionWorkbenchProps {
  activePatient: Patient;
  appointment: Appointment;
  currentClinic?: ClinicRegistration;
  currentUserName?: string;
  treatmentDiagnosis?: string;
  selectedToothFdi?: number;
  existingPrescription?: ElectronicPrescription | null;
  onSavePrescription: (prescription: ElectronicPrescription) => void;
  onUpdateLegacyPrescriptionStrings?: (prescriptionStrings: string[]) => void;
}

export const ElectronicPrescriptionWorkbench: React.FC<ElectronicPrescriptionWorkbenchProps> = ({
  activePatient,
  appointment,
  currentClinic,
  currentUserName,
  treatmentDiagnosis,
  selectedToothFdi,
  existingPrescription,
  onSavePrescription,
  onUpdateLegacyPrescriptionStrings,
}) => {
  // Doctor context
  const doctorName =
    currentUserName ||
    (currentClinic?.ownerRole === 'dentist' ? currentClinic.ownerName : 'دکتر محمدرضا کاویانی');
  const doctorMedicalCode = '۹۸۴۲۱';
  const doctorSpecialty = 'متخصص جراحی دهان، فک و صورت و دندان‌پزشک معالج';

  // Items in active electronic prescription
  const [items, setItems] = useState<PrescriptionItem[]>(() => {
    if (existingPrescription && existingPrescription.items && existingPrescription.items.length > 0) {
      return existingPrescription.items;
    }
    // Default initial template: Wisdom/Surgery or standard dental analgesic
    const initialTpl = DENTAL_PRESCRIPTION_TEMPLATES[0];
    return initialTpl.items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
    }));
  });

  // Clinical diagnosis & instructions
  const [diagnosisText, setDiagnosisText] = useState(
    existingPrescription?.diagnosis ||
      treatmentDiagnosis ||
      `معاینه و اقدام درمانی دندان ${selectedToothFdi || 16} (${appointment.reason || 'درمان بالینی'})`
  );
  const [generalNotes, setGeneralNotes] = useState(
    existingPrescription?.notes ||
      'مصرف دقیق و به موقع داروها راس ساعت مقرر. در صورت بروز هرگونه عارضه گوارشی یا کهیر پوستی سریعاً به مطب اطلاع داده شود.'
  );

  // Search & Catalog state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPrescription, setSubmittedPrescription] = useState<ElectronicPrescription | null>(
    existingPrescription && existingPrescription.status === 'accepted' ? existingPrescription : null
  );
  const [copiedCode, setCopiedCode] = useState(false);

  // New Custom Medication inline form state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customDosage, setCustomDosage] = useState('500 mg');
  const [customForm, setCustomForm] = useState('کپسول');
  const [customQty, setCustomQty] = useState(20);
  const [customUnit, setCustomUnit] = useState('عدد');
  const [customFreq, setCustomFreq] = useState('هر ۸ ساعت (۳ بار در روز)');
  const [customDuration, setCustomDuration] = useState('۷ روز');
  const [customInstructions, setCustomInstructions] = useState('با یک لیوان کامل آب بعد از غذا');
  const [customNotes, setCustomNotes] = useState('');

  // Active Allergy Warnings
  const allergyWarnings = checkPrescriptionAllergies(activePatient.allergies || [], items);

  // Helper to sync legacy strings on explicit actions
  const syncLegacyStrings = (currentItems: PrescriptionItem[]) => {
    if (onUpdateLegacyPrescriptionStrings) {
      const summaryList = currentItems.map(
        (it) => `${it.medicationName} (${it.dosage || ''}) - ${it.quantity} ${it.unit} [${it.frequency}]`
      );
      onUpdateLegacyPrescriptionStrings(summaryList);
    }
  };

  // Apply a template
  const handleApplyTemplate = (tpl: PrescriptionTemplate) => {
    const newItems: PrescriptionItem[] = tpl.items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
    }));
    setItems(newItems);
    syncLegacyStrings(newItems);
  };

  // Add medication from catalog
  const handleAddMedicationFromCatalog = (med: MedicationMaster) => {
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      medicationId: med.id,
      medicationName: med.persianName,
      dosage: med.defaultDosage,
      form: med.form,
      quantity: med.defaultQuantity,
      unit: med.defaultUnit,
      frequency: med.defaultFrequency,
      duration: med.defaultDuration,
      instructions: med.defaultInstructions,
      notes: med.allergyTags.length > 0 ? `برچسب‌های دارویی: ${med.allergyTags.join('، ')}` : '',
    };
    const updated = [...items, newItem];
    setItems(updated);
    syncLegacyStrings(updated);
  };

  // Remove medication
  const handleRemoveItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    syncLegacyStrings(updated);
  };

  // Update an item property
  const handleUpdateItem = (id: string, field: keyof PrescriptionItem, val: any) => {
    const updated = items.map((it) => (it.id === id ? { ...it, [field]: val } : it));
    setItems(updated);
    syncLegacyStrings(updated);
  };

  // Add custom medication
  const handleSaveCustomMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMedName.trim()) return;

    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicationName: customMedName.trim(),
      dosage: customDosage.trim(),
      form: customForm,
      quantity: Number(customQty) || 1,
      unit: customUnit,
      frequency: customFreq.trim(),
      duration: customDuration.trim(),
      instructions: customInstructions.trim(),
      notes: customNotes.trim(),
    };

    const updated = [...items, newItem];
    setItems(updated);
    syncLegacyStrings(updated);
    setCustomMedName('');
    setShowAddCustomModal(false);
  };

  // Submit to mock electronic prescription system
  const handleTransmitEPrescription = async () => {
    if (items.length === 0) {
      alert('لطفاً حداقل یک قلم دارو به نسخه الکترونیک اضافه کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<
        ElectronicPrescription,
        'id' | 'trackingCode' | 'status' | 'createdAt' | 'submittedAt' | 'externalPrescriptionId'
      > = {
        prescriptionNumber: '',
        patientId: activePatient.id,
        patientName: activePatient.fullName,
        nationalId: activePatient.nationalId,
        visitId: appointment.id,
        doctorId: appointment.dentistId || 'u-dentist1',
        doctorName: doctorName,
        doctorMedicalCode: doctorMedicalCode,
        doctorSpecialty: doctorSpecialty,
        clinicId: currentClinic?.id || 'clinic-alborz',
        clinicName: currentClinic?.name || 'کلینیک تخصصی دندان‌پزشکی البرز',
        insuranceProvider: activePatient.primaryInsurance?.provider || 'بیمه تامین اجتماعی',
        supplementaryInsuranceProvider: activePatient.supplementaryInsurance?.provider || 'بیمه تکمیلی دانا',
        items,
        diagnosis: diagnosisText,
        procedureNotes: `اقدامات بالینی روی دندان FDI ${selectedToothFdi || 16}`,
        toothFdi: selectedToothFdi,
        patientAllergies: activePatient.allergies || [],
        patientMedicalHistory: activePatient.medicalHistory || [],
        allergyWarnings,
        notes: generalNotes,
      };

      const res = await submitElectronicPrescriptionMock(payload);
      if (res.success) {
        setSubmittedPrescription(res.prescription);
        onSavePrescription(res.prescription);
      }
    } catch (err) {
      console.error('Error submitting electronic prescription:', err);
      alert('خطا در ارتباط با درگاه سامانه نسخه الکترونیک.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy tracking code
  const handleCopyTrackingCode = () => {
    if (!submittedPrescription) return;
    navigator.clipboard.writeText(submittedPrescription.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Filter drug catalog
  const filteredCatalog = DENTAL_MEDICATIONS_DB.filter((med) => {
    const matchesSearch =
      !searchQuery.trim() ||
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.persianName.includes(searchQuery) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || med.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="electronic-prescription-workbench" className="space-y-4">
      {/* 1. Context Awareness Header Bar (Single Source of Truth) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#005581]/10 via-[#005581]/5 to-transparent dark:from-slate-800 dark:to-slate-900 border border-[#005581]/20 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#005581]/15 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-[#005581] text-white flex items-center justify-center shadow-md">
              <Pill className="w-5 h-5 text-[#ffd200]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  سامانه صدور نسخه الکترونیک دنتورا (EP-Prescription Hub)
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  متصل به درگاه بیمه‌گر
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                یکپارچه با پرونده بالینی، سوابق حساسیتی و پایگاه داده اقلام دارویی استاندارد دندان‌پزشکی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="text-xs text-slate-600 dark:text-slate-400">شناسه ویزیت:</span>
            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#005581] dark:text-[#72cdf4] border border-slate-200 dark:border-slate-700">
              {appointment.id}
            </span>
          </div>
        </div>

        {/* Auto-filled Patient & Clinical Context Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold">بیمار معالج:</span>
            <strong className="text-slate-900 dark:text-slate-100 truncate block">{activePatient.fullName}</strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold">کد ملی:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{activePatient.nationalId || 'نامشخص'}</strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold">سن / جنسیت:</span>
            <strong className="text-slate-900 dark:text-slate-100">{activePatient.age} سال ({activePatient.gender})</strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold">بیمه پایه:</span>
            <strong className="text-slate-900 dark:text-slate-100 truncate block">
              {activePatient.primaryInsurance?.provider || 'تامین اجتماعی'}
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold">دندان‌پزشک معالج:</span>
            <strong className="text-slate-900 dark:text-slate-100 truncate block">{doctorName}</strong>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-400 font-bold">شماره نظام پزشکی:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">{doctorMedicalCode}</strong>
          </div>
        </div>
      </div>

      {/* 2. Allergy & Cross-Reactivity Alerts Engine */}
      {activePatient.allergies && activePatient.allergies.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-rose-900 dark:text-rose-200 flex-1">
            <div className="font-black flex items-center justify-between">
              <span>سوابق حساسیت ثبت‌شده در پرونده UDR بیمار:</span>
              <span className="font-mono px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 text-[11px]">
                {activePatient.allergies.join('، ')}
              </span>
            </div>
            {allergyWarnings.length > 0 ? (
              <div className="mt-2 space-y-1">
                {allergyWarnings.map((warn, i) => (
                  <div key={i} className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 font-bold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-rose-800 dark:text-rose-300">
                اقلام فعلی نسخه تداخلی با حساسیت‌های ثبت‌شده بیمار ندارند.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Quick Preset Prescription Templates (پکیج‌های پرتکرار دندانپزشکی) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#005581] dark:text-[#72cdf4]" />
            <span>پکیج‌های درمانی سریع دندان‌پزشکی (Quick Prescription Templates):</span>
          </h5>
          <span className="text-[11px] text-slate-400">یک کلیک جهت درج پکیج کامل</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {DENTAL_PRESCRIPTION_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-[#005581]/10 hover:border-[#005581] text-right transition group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-black text-[#005581] dark:text-[#72cdf4] mb-1">
                  {tpl.badge}
                </span>
                <h6 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                  {tpl.name}
                </h6>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block group-hover:text-[#005581] font-bold">
                + درج {tpl.items.length} قلم دارو
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Active Prescription Medication Table / Card List */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#005581]" />
              <span>اقلام نسخه دارویی بیمار ({items.length} قلم انتخاب‌شده)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              ویرایش دوز، تعداد، دوره مصرف و دستور اختصاصی مصرف دارو
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isCatalogOpen
                  ? 'bg-[#005581] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isCatalogOpen ? 'بستن دارونامه' : 'جستجو در دارونامه دندان‌پزشکی'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ داروی دستی</span>
            </button>
          </div>
        </div>

        {/* Search & Medication Catalog Dropdown Drawer */}
        {isCatalogOpen && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی نام تجاری، ژنریک، کپسول یا دهان‌شویه (مثلاً Amoxicillin، Gelofen، کلرهگزیدین)..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#005581] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'همه' },
                  { id: 'antibiotic', label: 'آنتی‌بیوتیک' },
                  { id: 'analgesic', label: 'مسکن/ضدالتهاب' },
                  { id: 'mouthwash', label: 'دهان‌شویه' },
                  { id: 'pediatric', label: 'کودکان' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition ${
                      selectedCategory === cat.id
                        ? 'bg-[#005581] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredCatalog.map((med) => (
                <div
                  key={med.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col justify-between gap-2 shadow-2xs hover:border-[#005581] transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{med.genericName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold">
                        {med.form}
                      </span>
                    </div>
                    <strong className="text-xs text-slate-900 dark:text-slate-100 block mt-0.5">
                      {med.persianName}
                    </strong>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      دوز: {med.defaultDosage} | {med.defaultFrequency}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddMedicationFromCatalog(med)}
                    className="w-full py-1.5 bg-[#005581] hover:bg-[#004266] text-[#ffd200] font-black text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن به نسخه</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescription Items List */}
        {items.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 text-xs space-y-2">
            <Pill className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-bold">هنوز هیچ دارویی به نسخه اضافه نشده است.</p>
            <p className="text-[11px] text-slate-400">
              از پکیج‌های سریع بالا یا دکمه «جستجو در دارونامه» جهت انتخاب داروها استفاده فرمایید.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 text-xs transition hover:border-[#005581]/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-full bg-[#005581] text-[#ffd200] font-black text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 text-sm">
                      {item.medicationName}
                    </strong>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      {item.form} ({item.dosage})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-rose-500 hover:text-rose-700 font-bold text-xs flex items-center gap-1 self-end sm:self-center cursor-pointer p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف از نسخه</span>
                  </button>
                </div>

                {/* Grid Inputs for Medication Dosage & Frequency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                      تعداد و واحد:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                        className="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                      فواصل و نحوه مصرف:
                    </label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => handleUpdateItem(item.id, 'frequency', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                      طول دوره مصرف:
                    </label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleUpdateItem(item.id, 'duration', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                      دستور اختصاصی مصرف:
                    </label>
                    <input
                      type="text"
                      value={item.instructions || ''}
                      onChange={(e) => handleUpdateItem(item.id, 'instructions', e.target.value)}
                      placeholder="مثلاً بعد از وعده غذایی..."
                      className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diagnosis & Doctor Clinical Notes for Prescription */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              تشخیص بالینی / علت تجویز (Diagnosis):
            </label>
            <input
              type="text"
              value={diagnosisText}
              onChange={(e) => setDiagnosisText(e.target.value)}
              placeholder="تشخیص یا دلیل تجویز نسخه..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              توصیه‌های تکمیلی به بیمار (Notes):
            </label>
            <input
              type="text"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="نکات احتیاطی یا نحوه مصرف..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 5. Transmit to Electronic System Card & Success State */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
        {!submittedPrescription ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  ارسال و ثبت نهایی در سامانه نسخه الکترونیک سلامت
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تولید شناسه سپاس (SEPAS)، کد رهگیری ۱۲ رقمی و ارسال آنی به کارتابل داروخانه‌های سراسر کشور
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTransmitEPrescription}
              disabled={isSubmitting || items.length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60 whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>در حال ارتباط با درگاه بیمه‌گر...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>تأیید و ارسال به سامانه نسخه الکترونیک</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-300 dark:border-emerald-800 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="font-black text-sm text-emerald-950 dark:text-emerald-100">
                  نسخه الکترونیک با موفقیت تایید و صادر گردید (وضعیت: ثبت قطعی در سامانه سلامت)
                </span>
              </div>

              <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900/80 font-bold border border-emerald-300 dark:border-emerald-700">
                زمان ثبت: {submittedPrescription.submittedAt}
              </span>
            </div>

            {/* Official Electronic Prescription Barcode & Tracking Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">کد رهگیری ۱۲ رقمی نسخه:</span>
                <div className="flex items-center justify-between">
                  <strong className="font-mono text-base text-emerald-800 dark:text-emerald-300 tracking-wider">
                    {submittedPrescription.trackingCode}
                  </strong>
                  <button
                    type="button"
                    onClick={handleCopyTrackingCode}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                    title="کپی کد رهگیری"
                  >
                    {copiedCode ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">شناسه درگاه سپاس (SEPAS ID):</span>
                <strong className="font-mono text-xs text-slate-900 dark:text-slate-100 block">
                  {submittedPrescription.externalPrescriptionId}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">شماره نسخه مطب:</span>
                <strong className="font-mono text-xs text-slate-900 dark:text-slate-100 block">
                  {submittedPrescription.prescriptionNumber}
                </strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-[11px] text-emerald-900 dark:text-emerald-200 font-medium">
                بیمار می‌تواند با ارائه کد ملی ({activePatient.nationalId}) و کد رهگیری به کلیه داروخانه‌های طرف قرارداد مراجعه نماید.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubmittedPrescription(null)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش نسخه</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Medication Modal Form */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#005581]" />
                <span>افزودن داروی دلخواه به نسخه</span>
              </h4>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomMedication} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام دارو / نام ژنریک: *
                </label>
                <input
                  type="text"
                  required
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  placeholder="مثلاً کپسول سفالکسین ۵۰۰ یا قطره نیستاتین..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شکل دارویی:
                  </label>
                  <select
                    value={customForm}
                    onChange={(e) => setCustomForm(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="قرص">قرص</option>
                    <option value="کپسول">کپسول</option>
                    <option value="شربت">شربت</option>
                    <option value="دهان‌شویه">دهان‌شویه</option>
                    <option value="سوسپانسیون">سوسپانسیون</option>
                    <option value="آمپول">آمپول</option>
                    <option value="قطره">قطره</option>
                    <option value="ژل موضعی">ژل موضعی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    دوز دارو:
                  </label>
                  <input
                    type="text"
                    value={customDosage}
                    onChange={(e) => setCustomDosage(e.target.value)}
                    placeholder="مثلاً 500 mg یا 0.2%"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تعداد:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customQty}
                    onChange={(e) => setCustomQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    واحد:
                  </label>
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="عدد">عدد</option>
                    <option value="جعبه">جعبه</option>
                    <option value="بطری">بطری</option>
                    <option value="شیشه">شیشه</option>
                    <option value="تیوب">تیوب</option>
                    <option value="ویال">ویال</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    فاصله مصرف:
                  </label>
                  <input
                    type="text"
                    value={customFreq}
                    onChange={(e) => setCustomFreq(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    طول دوره:
                  </label>
                  <input
                    type="text"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  دستور مصرف:
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold shadow cursor-pointer"
                >
                  افزودن به نسخه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
