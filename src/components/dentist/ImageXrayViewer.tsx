import React, { useState, useRef, useEffect } from 'react';
import { DentalXrayCanvas } from './DentalXrayCanvas';
import {
  Eye,
  Edit3,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Check,
  Trash2,
  Crosshair,
  Square,
  Sparkles,
  ZoomIn,
  ZoomOut,
  X,
  RotateCcw,
  Download,
  Share2,
  Info,
} from 'lucide-react';
import { PatientImageRecord, PatientImageAnnotation } from '../../types';

export type ImageAnnotation = PatientImageAnnotation;

interface ImageXrayViewerProps {
  patientName?: string;
  patientId?: string;
  doctorName?: string;
  toothFdi?: number | null;
  patientImages?: PatientImageRecord[];
  onRevisionTreatmentPlan?: () => void;
  onSaveToDossier?: (annotationSummary: string, selectedImage: string) => void;
  onSavePatientImage?: (imageRecord: PatientImageRecord) => void;
  readOnly?: boolean;
}

export const ImageXrayViewer: React.FC<ImageXrayViewerProps> = ({
  patientName = 'بیمار',
  patientId,
  doctorName = 'دکتر معالج',
  toothFdi = 16,
  patientImages = [],
  onRevisionTreatmentPlan,
  onSaveToDossier,
  onSavePatientImage,
  readOnly = false,
}) => {
  const [selectedImageType, setSelectedImageType] = useState<'rvg' | 'opg' | 'cbct' | 'intraoral'>('rvg');
  const [activeTool, setActiveTool] = useState<'view' | 'pin' | 'box'>(readOnly ? 'view' : 'pin');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(125);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showAiLayer, setShowAiLayer] = useState<boolean>(true);
  const [isBridgeActive, setIsBridgeActive] = useState<boolean>(true);
  const [supportAlertSent, setSupportAlertSent] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Selected annotation for on-image popover editing / viewing
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingToothFdi, setEditingToothFdi] = useState<number>(toothFdi || 16);

  // External Link Input
  const [externalLink, setExternalLink] = useState('');
  const [externalImagesUploaded, setExternalImagesUploaded] = useState<string[]>([]);

  // High-Quality Realistic Dental Radiographs (Medical Imaging)
  const xrayImages: Record<string, string> = {
    rvg: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=85',
    opg: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1600&q=85',
    cbct: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
    intraoral: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1400&q=85',
  };

  // Default fallback annotations if patient has no existing image record
  const defaultAnnotations: ImageAnnotation[] = [
    {
      id: 'ai-1',
      text: 'پوسیدگی عمیق مجاور شاخک پالپ (Distal/Occlusal)',
      toothFdi: toothFdi || 16,
      x: 46,
      y: 36,
      width: 15,
      height: 18,
      type: 'box',
      author: 'ai',
      aiConfidence: 95,
      severity: 'critical',
    },
    {
      id: 'ai-2',
      text: 'تحلیل استخوان آلوئول ۴.۲ میلی‌متر و پاکت پریودنتال',
      toothFdi: toothFdi || 16,
      x: 64,
      y: 68,
      width: 18,
      height: 14,
      type: 'box',
      author: 'ai',
      aiConfidence: 89,
      severity: 'warning',
    },
    {
      id: 'doc-1',
      text: 'شروع عصب‌کشی کانال مزیوباکال - طول کارکرد ۲۰mm',
      toothFdi: toothFdi || 16,
      x: 48,
      y: 54,
      type: 'pin',
      author: 'doctor',
      severity: 'normal',
    },
  ];

  // Annotations list (both Doctor and AI)
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>(defaultAnnotations);

  // Load annotations from patientImages prop if available for this modality
  useEffect(() => {
    if (patientImages && patientImages.length > 0) {
      const match = patientImages.find((img) => img.type === selectedImageType);
      if (match && match.annotations && match.annotations.length > 0) {
        setAnnotations(match.annotations);
        return;
      }
    }
    // Fallback annotations for this tooth FDI
    setAnnotations(
      defaultAnnotations.map((a) => ({
        ...a,
        toothFdi: toothFdi || 16,
      }))
    );
  }, [selectedImageType, patientImages, patientId, toothFdi]);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick diagnosis template chips
  const diagnosisPresets = [
    'پوسیدگی عمیق مجاور پالپ',
    'ضایعه پری‌آپیکال انتهای ریشه',
    'تحلیل استخوان مارجینال و پاکت ۵mm',
    'شکستگی تاج دندان و نیاز به روکش',
    'نشت ترمیم کامپوزیت قبلی',
    'ریشه باقی‌مانده نیازمند جراحی',
  ];

  // Sync edit states when selectedAnnotationId changes
  useEffect(() => {
    if (selectedAnnotationId) {
      const target = annotations.find((a) => a.id === selectedAnnotationId);
      if (target) {
        setEditingText(target.text);
        setEditingToothFdi(target.toothFdi || toothFdi || 16);
        if (!readOnly) {
          setTimeout(() => {
            if (editTextareaRef.current) {
              editTextareaRef.current.focus();
            }
          }, 100);
        }
      }
    }
  }, [selectedAnnotationId, readOnly]);

  // Helper to persist updated annotations to patient record
  const syncUpdatedAnnotations = (updatedAnnotations: ImageAnnotation[]) => {
    if (readOnly) return;
    const imageTitles: Record<string, string> = {
      rvg: `گرافی پری‌آپیکال RVG دندان ${toothFdi || 16}`,
      opg: 'رادیوگرافی پانورامیک سراسری فک (OPG)',
      cbct: 'مقطع ۳ بعدی سی‌تی اسکن دندانی CBCT',
      intraoral: 'عکس رنگی داخل دهانی HD',
    };

    const summary = updatedAnnotations
      .map(
        (a) =>
          `[${a.author === 'ai' ? 'هوش مصنوعی' : 'پزشک'}] (دندان FDI ${a.toothFdi || toothFdi}): ${a.text}`
      )
      .join('\n');

    const imageRecord: PatientImageRecord = {
      id: `img-${selectedImageType}-${patientId || 'pat'}`,
      title: imageTitles[selectedImageType] || `تصویر رادیولوژی دندان ${toothFdi || 16}`,
      type: selectedImageType,
      imageUrl: xrayImages[selectedImageType],
      toothFdi: toothFdi || 16,
      date: new Date().toLocaleDateString('fa-IR'),
      doctorName: doctorName || 'دکتر معالج',
      annotations: updatedAnnotations,
      doctorNotes:
        updatedAnnotations
          .filter((a) => a.author === 'doctor')
          .map((a) => a.text)
          .join(' - ') || 'بررسی رادیوگرافی انجام شد.',
      summaryText: summary,
    };

    if (onSavePatientImage) {
      onSavePatientImage(imageRecord);
    }
  };

  // Add Annotation on Click (Doctor only)
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (activeTool === 'view') return;
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    const newId = `doc-${Date.now()}`;
    const defaultText = `یادداشت جدید دندان ${toothFdi || 16}`;

    const newAnn: ImageAnnotation = {
      id: newId,
      text: defaultText,
      toothFdi: toothFdi || 16,
      x,
      y,
      width: activeTool === 'box' ? 16 : undefined,
      height: activeTool === 'box' ? 14 : undefined,
      type: activeTool === 'box' ? 'box' : 'pin',
      author: 'doctor',
      severity: 'normal',
    };

    const nextList = [...annotations, newAnn];
    setAnnotations(nextList);
    setSelectedAnnotationId(newId);
    setEditingText(defaultText);
    setEditingToothFdi(toothFdi || 16);
    syncUpdatedAnnotations(nextList);
  };

  // Update current annotation text in state (Doctor only)
  const handleSaveCurrentAnnotation = (newText?: string, newFdi?: number) => {
    if (readOnly || !selectedAnnotationId) return;
    const txt = (newText !== undefined ? newText : editingText).trim();
    const fdi = newFdi !== undefined ? newFdi : editingToothFdi;

    const nextList = annotations.map((a) =>
      a.id === selectedAnnotationId
        ? {
            ...a,
            text: txt || `یادداشت دندان ${fdi}`,
            toothFdi: fdi,
          }
        : a
    );

    setAnnotations(nextList);
    syncUpdatedAnnotations(nextList);
  };

  // Delete Annotation (Doctor only)
  const handleDeleteAnnotation = (id: string, e?: React.MouseEvent) => {
    if (readOnly) return;
    if (e) e.stopPropagation();
    const nextList = annotations.filter((a) => a.id !== id);
    setAnnotations(nextList);
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
    syncUpdatedAnnotations(nextList);
  };

  // Accept AI detection as doctor note
  const handleAcceptAiAnnotation = (id: string, e?: React.MouseEvent) => {
    if (readOnly) return;
    if (e) e.stopPropagation();
    const nextList = annotations.map((a) =>
      a.id === id
        ? {
            ...a,
            author: 'doctor' as const,
            text: `تأیید پزشک: ${a.text}`,
          }
        : a
    );
    setAnnotations(nextList);
    if (selectedAnnotationId === id) {
      setEditingText((prev) => `تأیید پزشک: ${prev}`);
    }
    syncUpdatedAnnotations(nextList);
  };

  // Clear all AI annotations
  const handleClearAllAiMarkers = () => {
    if (readOnly) return;
    const nextList = annotations.filter((a) => a.author !== 'ai');
    setAnnotations(nextList);
    if (selectedAnnotationId && selectedAnnotationId.startsWith('ai-')) {
      setSelectedAnnotationId(null);
    }
    syncUpdatedAnnotations(nextList);
  };

  // Save to Dossier (Doctor action)
  const handleSaveToDossier = () => {
    if (readOnly) return;
    const summary = annotations
      .map(
        (a) =>
          `[${a.author === 'ai' ? 'هوش مصنوعی' : 'پزشک'}] (دندان FDI ${a.toothFdi || toothFdi}): ${a.text}`
      )
      .join('\n');

    syncUpdatedAnnotations(annotations);

    if (onSaveToDossier) {
      onSaveToDossier(summary, xrayImages[selectedImageType]);
    }

    setSaveSuccessNotice(
      'تصویر نشانه‌گذاری‌شده و علائم بالینی با موفقیت در پرونده الکترونیک بیمار ثبت و در تمامی بخش‌ها همگام شد.'
    );
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // EXPORT ACTIONS FOR PATIENT & CLINIC
  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = xrayImages[selectedImageType];
    link.download = `Dentora-XRay-${selectedImageType.toUpperCase()}-${patientName}-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('فایل تصویر با کیفیت بالا دانلود شد.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setExportNotice('لینک امن دسترسی به گواهی رادیولوژی در کلیپ‌بورد کپی شد.');
      setTimeout(() => setExportNotice(null), 3000);
    }
  };

  const handleToggleBridge = () => {
    if (isBridgeActive) {
      setIsBridgeActive(false);
      setSupportAlertSent(true);
    } else {
      setIsBridgeActive(true);
      setSupportAlertSent(false);
    }
  };

  const handleImportExternalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalLink) return;
    setExternalImagesUploaded([externalLink, ...externalImagesUploaded]);
    alert(`لینک تصویربرداری مرکز بیرونی دریافت و به پرونده بیمار ${patientName} الصاق گردید.`);
    setExternalLink('');
  };

  const visibleAnnotations = annotations.filter((a) => showAiLayer || a.author === 'doctor');
  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header & PACS Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-[#005581] dark:text-[#72cdf4] text-base flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#005581]" />
            <span>
              {readOnly
                ? 'نمایشگر تخصصی تصاویر رادیوگرافی و گزارش تشخیصی دندان'
                : 'هاب تصویربرداری پزشکی Web-PACS و ابزار تشخیصی هوشمند'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {readOnly
              ? 'مشاهده تصاویر رادیولوژی با کیفیت بالا، علائم تشخیصی دندان‌پزشک و امکان دریافت فایل تصویر'
              : 'روی عکس علامت بزنید تا یادداشت ثبت شود. برای مشاهده متن کامل، ویرایش یا حذف، روی هر علامت کلیک نمایید.'}
          </p>
        </div>

        {/* Action / Export Controls in Header */}
        {readOnly ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-3.5 py-1.5 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="دانلود فایل اصلی تصویر با کیفیت بالا"
            >
              <Download className="w-4 h-4 text-[#ffd200]" />
              <span>دریافت فایل تصویر</span>
            </button>

            <button
              type="button"
              onClick={handleShareLink}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="اشتراک‌گذاری لینک امن"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Local Hardware Bridge Status for Clinic Staff */
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBridgeActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            ></span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              پل سخت‌افزاری RVG: {isBridgeActive ? 'متصل (Local PACS ON)' : 'قطع ارتباط (Bridge Error)'}
            </span>
            <button
              type="button"
              onClick={handleToggleBridge}
              className="text-[10px] text-[#005581] dark:text-[#72cdf4] underline font-bold mr-1 cursor-pointer"
            >
              {isBridgeActive ? 'شبیه‌سازی قطعی' : 'اتصال مجدد'}
            </button>
          </div>
        )}
      </div>

      {/* Export / Download Notification */}
      {exportNotice && (
        <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-[#005581] dark:text-sky-200 text-xs flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Bridge Failure Notification Banner (Clinic only) */}
      {!readOnly && !isBridgeActive && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
            <div>
              <strong>هشدار خطای سخت‌افزاری سنسور RVG:</strong> ارتباط با درایور لوکال دستگاه قطع شده است.
              {supportAlertSent && (
                <span className="block text-[11px] text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> تیکت پشتیبانی خودکار صادر گردید.
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsBridgeActive(true)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
          >
            تلاش مجدد اتصال
          </button>
        </div>
      )}

      {/* Save Success Banner */}
      {saveSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Top Toolbar: Modality Selector, Tools & DICOM Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        {/* Modality Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedImageType('rvg')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'rvg'
                ? 'bg-[#005581] text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            پری‌آپیکال RVG (تک‌دندان)
          </button>
          <button
            type="button"
            onClick={() => setSelectedImageType('opg')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'opg'
                ? 'bg-[#005581] text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            پانورامیک OPG (دو فک)
          </button>
          <button
            type="button"
            onClick={() => setSelectedImageType('cbct')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'cbct'
                ? 'bg-[#005581] text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            مقطع ۳ بعدی CBCT
          </button>
          <button
            type="button"
            onClick={() => setSelectedImageType('intraoral')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'intraoral'
                ? 'bg-[#005581] text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            عکس رنگی دهان (HD Photo)
          </button>
        </div>

        {/* Tool Modes (Hidden for Patient ReadOnly mode) */}
        {!readOnly && (
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTool('pin')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTool === 'pin'
                  ? 'bg-[#ffd200] text-[#005581] shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>پین و نشانه‌گذاری</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('box')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTool === 'box'
                  ? 'bg-[#ffd200] text-[#005581] shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>کادربندی ناحیه (ROI)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool('view');
                setSelectedAnnotationId(null);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTool === 'view'
                  ? 'bg-[#005581] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>حالت مشاهده</span>
            </button>
          </div>
        )}

        {/* AI Layer Toggle & Clear */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiLayer(!showAiLayer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              showAiLayer
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{showAiLayer ? 'لایه تشخیص هوش مصنوعی فعال' : 'نمایش لایه AI (خاموش)'}</span>
          </button>

          {!readOnly && showAiLayer && annotations.some((a) => a.author === 'ai') && (
            <button
              type="button"
              onClick={handleClearAllAiMarkers}
              className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition cursor-pointer"
              title="حذف کلیه علائم خودکار هوش مصنوعی"
            >
              پاک‌سازی علائم AI
            </button>
          )}
        </div>
      </div>

      {/* Main Full-Width Medical Viewport */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-black min-h-[440px] max-h-[620px] flex items-center justify-center select-none shadow-2xl">
        {/* Canvas Area */}
        <div
          ref={imageContainerRef}
          onClick={handleImageClick}
          className={`relative w-full h-full min-h-[440px] flex items-center justify-center ${
            !readOnly && activeTool !== 'view' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* Dedicated Dental Radiograph / CBCT / OPG / Intraoral Canvas */}
          <div
            style={{
              filter: `${isInverted ? 'invert(1)' : ''} brightness(${brightness}%) contrast(${contrast}%) ${
                selectedImageType === 'intraoral' ? '' : 'grayscale(100%)'
              }`,
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.2s ease, filter 0.2s ease',
            }}
            className="w-full h-full max-h-[580px] flex items-center justify-center pointer-events-none"
          >
            <DentalXrayCanvas type={selectedImageType} toothFdi={toothFdi || 16} />
          </div>

          {/* Grid Calibration Lines (Medical Standard) */}
          <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          {/* Top-Right Watermark & Patient Badge */}
          <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md text-white text-[11px] p-2.5 rounded-2xl border border-white/20 font-mono space-y-0.5 shadow-lg pointer-events-none z-10">
            <div className="font-sans font-extrabold text-[#ffd200]">بیمار: {patientName}</div>
            <div>مدالیته: {selectedImageType.toUpperCase()} PACS</div>
            <div>دندان تحت بررسی: FDI {toothFdi || 16}</div>
            <div className="text-emerald-400 text-[10px]">
              تعداد علائم ثبت‌شده: {visibleAnnotations.length} مورد
            </div>
          </div>

          {/* Bottom-Left DICOM Controls */}
          <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-1 text-white z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((z) => Math.min(z + 0.2, 2.5));
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((z) => Math.max(z - 0.2, 0.8));
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsInverted((inv) => !inv);
              }}
              className={`px-2 py-1 rounded-lg cursor-pointer text-xs font-bold ${
                isInverted ? 'bg-[#ffd200] text-black' : 'hover:bg-white/20 text-white'
              }`}
              title="نگاتیو / اینورت رنگ"
            >
              Invert
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBrightness(100);
                setContrast(125);
                setZoomLevel(1);
                setIsInverted(false);
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer text-[10px]"
              title="تنظیم مجدد پیش‌فرض"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Annotations Rendered Directly on Image */}
          {visibleAnnotations.map((ann) => {
            const isSelected = selectedAnnotationId === ann.id;
            const isAi = ann.author === 'ai';

            // BOX TYPE ANNOTATION
            if (ann.type === 'box') {
              return (
                <div
                  key={ann.id}
                  style={{
                    left: `${ann.x}%`,
                    top: `${ann.y}%`,
                    width: `${ann.width || 16}%`,
                    height: `${ann.height || 14}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnotationId(ann.id);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between p-1.5 group ${
                    isAi
                      ? 'border-purple-400 bg-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                      : isSelected
                      ? 'border-[#ffd200] bg-yellow-500/30 ring-4 ring-[#ffd200]/50'
                      : 'border-amber-400 bg-amber-500/20 hover:border-amber-300'
                  }`}
                >
                  {/* Top Badge on Box */}
                  <div className="flex items-center justify-between text-[10px] text-white font-bold leading-none gap-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono shadow ${
                        isAi ? 'bg-purple-900/90 text-purple-200' : 'bg-[#005581]/90 text-[#ffd200]'
                      }`}
                    >
                      {isAi ? `AI (${ann.aiConfidence}%)` : `FDI ${ann.toothFdi || toothFdi || 16}`}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAnnotation(ann.id, e)}
                        className="bg-rose-600/90 hover:bg-rose-700 text-white rounded-full p-0.5 cursor-pointer shadow transition"
                        title="حذف این علامت"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Text Badge displayed clearly on the box */}
                  <div className="bg-black/90 text-white text-[10px] px-2 py-1 rounded-lg font-bold leading-tight shadow-md border border-white/20 max-w-full truncate">
                    {ann.text}
                  </div>
                </div>
              );
            }

            // PIN TYPE ANNOTATION
            return (
              <div
                key={ann.id}
                style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnnotationId(ann.id);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 p-1.5 pr-2.5 rounded-2xl shadow-2xl border cursor-pointer backdrop-blur-md transition group select-none ${
                  isAi
                    ? 'bg-purple-950/90 text-purple-100 border-purple-400 hover:bg-purple-900 ring-1 ring-purple-400/50'
                    : isSelected
                    ? 'bg-[#005581] text-white border-[#ffd200] ring-4 ring-[#ffd200]/50 scale-105'
                    : 'bg-slate-900/90 text-white border-white/60 hover:bg-slate-800'
                }`}
              >
                {/* Visual Pin Indicator */}
                <span
                  className={`w-3 h-3 rounded-full shrink-0 shadow flex items-center justify-center text-[8px] font-black ${
                    isAi
                      ? 'bg-purple-400 text-purple-950 animate-pulse'
                      : 'bg-[#ffd200] text-[#005581]'
                  }`}
                >
                  ●
                </span>

                {/* Tooth FDI Badge */}
                <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 font-mono font-bold">
                  {ann.toothFdi || toothFdi || 16}
                </span>

                {/* Text clearly shown on image */}
                <span className="text-[11px] font-bold max-w-[200px] truncate leading-tight">
                  {ann.text}
                </span>

                {/* Quick Delete 'x' Button (Doctor only) */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAnnotation(ann.id, e)}
                    className="p-1 rounded-full bg-white/10 hover:bg-rose-600 text-white cursor-pointer transition mr-0.5"
                    title="حذف علامت"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ON-IMAGE INTERACTIVE EDITING OR READONLY VIEWING POPOVER */}
        {selectedAnnotation && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute z-30 bottom-6 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-[92%] sm:w-[420px] max-w-lg bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#005581] shadow-2xl p-4.5 space-y-3.5 animate-fadeIn text-slate-900 dark:text-slate-100"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-bold">
                  {readOnly ? <Info className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#005581] dark:text-[#72cdf4]">
                    {readOnly ? 'شرح و یافته تشخیصی' : 'مدیریت و ویرایش علامت روی عکس'}
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {selectedAnnotation.author === 'ai'
                      ? `تشخیص هوش مصنوعی (دقت ${selectedAnnotation.aiConfidence}٪)`
                      : 'ثبت شده توسط دندان‌پزشک معالج'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedAnnotation.author === 'ai'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {selectedAnnotation.author === 'ai' ? 'هوش مصنوعی' : 'پزشک معالج'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAnnotationId(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="بستن پنجره"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ReadOnly vs Editable Content */}
            {readOnly ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                  <span className="font-bold text-slate-600 dark:text-slate-300">شماره دندان مرتبط:</span>
                  <span className="font-bold text-[#005581] dark:text-[#72cdf4] font-mono">
                    دندان FDI {selectedAnnotation.toothFdi || toothFdi || 16}
                  </span>
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">متن شرح بالینی:</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {selectedAnnotation.text}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAnnotationId(null)}
                    className="px-4 py-1.5 rounded-xl bg-[#005581] text-white font-bold text-xs cursor-pointer hover:bg-[#004266]"
                  >
                    متوجه شدم
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tooth FDI Input */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    شماره دندان مرتبط (FDI):
                  </span>
                  <input
                    type="number"
                    value={editingToothFdi}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingToothFdi(val);
                      handleSaveCurrentAnnotation(editingText, val);
                    }}
                    className="w-24 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-center text-xs outline-none focus:ring-2 focus:ring-[#005581]"
                  />
                </div>

                {/* Full Textarea for Editing the Annotation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    متن کامل یادداشت یا تشخیص بالینی:
                  </label>
                  <textarea
                    ref={editTextareaRef}
                    rows={3}
                    value={editingText}
                    onChange={(e) => {
                      setEditingText(e.target.value);
                      handleSaveCurrentAnnotation(e.target.value, editingToothFdi);
                    }}
                    placeholder="متن یادداشت، تشخیص یا دستور درمانی را بنویسید..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#005581] leading-relaxed"
                  />
                </div>

                {/* Quick Diagnostic Presets */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500">
                    انتخاب سریع شرح‌های بالینی:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto">
                    {diagnosisPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setEditingText(preset);
                          handleSaveCurrentAnnotation(preset, editingToothFdi);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#005581] hover:text-white text-[10px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Delete, Accept AI, Done */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnotation(selectedAnnotation.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف علامت</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedAnnotation.author === 'ai' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptAiAnnotation(selectedAnnotation.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تأیید تشخیص AI</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleSaveCurrentAnnotation(editingText, editingToothFdi);
                        setSelectedAnnotationId(null);
                      }}
                      className="flex items-center gap-1 px-4 py-1.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-[#ffd200]" />
                      <span>تأیید و ذخیره</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Guide text under image */}
      <div className="text-center text-[11px] text-slate-500 dark:text-slate-400">
        {readOnly
          ? 'جهت مشاهده شرح و جزئیات هر یک از علائم و تشخیص‌های پزشک، روی علامت مربوطه روی تصویر کلیک فرمایید.'
          : activeTool !== 'view'
          ? 'جهت ثبت علامت جدید روی عکس کلیک کنید. با کلیک بر هر علامت، متن کامل و باکس ویرایش/حذف باز می‌شود.'
          : 'حالت مشاهده فعال است. جهت درج پین یا کادر، از نوار بالا ابزار نشانه‌گذاری را انتخاب فرمایید.'}
      </div>

      {/* Bottom Actions (Doctor only) */}
      {!readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Action Button: Save to Dossier & Insurance */}
          <button
            type="button"
            onClick={handleSaveToDossier}
            className="w-full py-3 bg-[#005581] hover:bg-[#004266] text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#ffd200]" />
            <span>الصاق تصویر و کلیه نشانه‌ها ({visibleAnnotations.length} مورد) به پرونده UDR و شرح بیمه</span>
          </button>

          {/* External Imaging Center Link Integration */}
          <form onSubmit={handleImportExternalLink} className="flex gap-2">
            <input
              type="url"
              placeholder="لینک تصویر مرکز رادیولوژی بیرونی (External PACS)..."
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-[#005581]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs shadow cursor-pointer whitespace-nowrap"
            >
              الصاق لینک
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
