import React, { useState, useRef } from 'react';
import {
  Eye,
  Edit3,
  Link2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Send,
  RefreshCw,
  Layers,
  FileImage,
  Check,
  Trash2,
  Plus,
  Crosshair,
  Square,
  Sparkles,
  Maximize2,
  Sliders,
  ZoomIn,
  ZoomOut,
  X,
  FileText,
  Camera,
  Info,
  HelpCircle
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persianDigits';

export interface ImageAnnotation {
  id: string;
  text: string;
  toothFdi?: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width?: number; // percentage for box
  height?: number; // percentage for box
  type: 'pin' | 'box' | 'measurement';
  author: 'doctor' | 'ai';
  aiConfidence?: number;
  severity?: 'critical' | 'warning' | 'normal';
}

interface ImageXrayViewerProps {
  patientName: string;
  toothFdi?: number | null;
  onRevisionTreatmentPlan?: () => void;
  onSaveToDossier?: (annotationSummary: string, selectedImage: string) => void;
}

export const ImageXrayViewer: React.FC<ImageXrayViewerProps> = ({
  patientName,
  toothFdi = 16,
  onRevisionTreatmentPlan,
  onSaveToDossier,
}) => {
  const [selectedImageType, setSelectedImageType] = useState<'rvg' | 'opg' | 'cbct' | 'intraoral'>('rvg');
  const [activeTool, setActiveTool] = useState<'view' | 'pin' | 'box' | 'measure'>('pin');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(125);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showAiLayer, setShowAiLayer] = useState<boolean>(true);
  const [isBridgeActive, setIsBridgeActive] = useState<boolean>(true);
  const [supportAlertSent, setSupportAlertSent] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // New Annotation Form
  const [newAnnotationText, setNewAnnotationText] = useState('');
  const [newAnnotationTooth, setNewAnnotationTooth] = useState<number>(toothFdi || 16);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // External Link Input
  const [externalLink, setExternalLink] = useState('');
  const [externalImagesUploaded, setExternalImagesUploaded] = useState<string[]>([]);

  // High-Quality Realistic Dental Radiographs (Base64 SVG & High-Res Medical Data)
  const xrayImages: Record<string, string> = {
    rvg: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=85',
    opg: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1400&q=85',
    cbct: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=85',
    intraoral: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=85',
  };

  // Annotations list (both Doctor and AI)
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>([
    {
      id: 'ai-1',
      text: 'پوسیدگی عمیق مجاور پالپ (Distal/Occlusal)',
      toothFdi: 16,
      x: 46,
      y: 36,
      width: 14,
      height: 18,
      type: 'box',
      author: 'ai',
      aiConfidence: 95,
      severity: 'critical',
    },
    {
      id: 'ai-2',
      text: 'تحلیل استخوان آلوئول ۴.۲ میلی‌متر و پاکت پریودنتال',
      toothFdi: 16,
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
      toothFdi: 16,
      x: 48,
      y: 54,
      type: 'pin',
      author: 'doctor',
      severity: 'normal',
    },
  ]);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Quick diagnosis template chips
  const diagnosisPresets = [
    'پوسیدگی عمیق پالپ دندان ۱۶',
    'ضایعه پری‌آپیکال انتهای ریشه',
    'تحلیل استخوان مارجینال و پاکت ۵mm',
    'شکستگی تاج دندان و نیاز به پست/روکش',
    'نشت ترمیم کامپوزیت قبلی',
    'ریشه باقی‌مانده نیازمند جراحی',
  ];

  // Add Annotation on Click
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'view') return;
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    const textToUse = newAnnotationText.trim() || `یادداشت دندان‌پزشک روی دندان ${newAnnotationTooth}`;

    const newAnn: ImageAnnotation = {
      id: `doc-${Date.now()}`,
      text: textToUse,
      toothFdi: newAnnotationTooth,
      x,
      y,
      width: activeTool === 'box' ? 16 : undefined,
      height: activeTool === 'box' ? 14 : undefined,
      type: activeTool === 'box' ? 'box' : activeTool === 'measure' ? 'measurement' : 'pin',
      author: 'doctor',
      severity: 'normal',
    };

    setAnnotations((prev) => [...prev, newAnn]);
    setSelectedAnnotationId(newAnn.id);
    setNewAnnotationText('');
  };

  // Delete Annotation
  const handleDeleteAnnotation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  // Accept AI detection as doctor note
  const handleAcceptAiAnnotation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              author: 'doctor',
              text: `تأیید پزشک: ${a.text}`,
            }
          : a
      )
    );
  };

  // Clear all AI annotations
  const handleClearAllAiMarkers = () => {
    setAnnotations((prev) => prev.filter((a) => a.author !== 'ai'));
  };

  // Save to Dossier
  const handleSaveToDossier = () => {
    const summary = annotations
      .map(
        (a) =>
          `[${a.author === 'ai' ? 'هوش مصنوعی' : 'پزشک'}] (FDI ${a.toothFdi || toothFdi}): ${a.text}`
      )
      .join('\n');

    if (onSaveToDossier) {
      onSaveToDossier(summary, xrayImages[selectedImageType]);
    }

    setSaveSuccessNotice('تصویر نشانه‌گذاری‌شده و علائم بالینی با موفقیت به پرونده الکترونیک UDR و شرح پیوست بیمه اضافه گردید.');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Header & PACS Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-[#005581] dark:text-[#72cdf4] text-base flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#005581]" />
            <span>هاب تصویربرداری پزشکی Web-PACS و ابزار تشخیصی هوشمند</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            مشاهده گرافی، علامت‌گذاری نواحی پوسیدگی، کنترل علائم هوش مصنوعی و الصاق مستقیم به شرح بیمه
          </p>
        </div>

        {/* Local Hardware Bridge Status */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-2xl text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isBridgeActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
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
      </div>

      {/* Bridge Failure Notification Banner */}
      {!isBridgeActive && (
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

      {/* Top Toolbar: Modality Selector & Diagnostic Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        {/* Modality Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedImageType('rvg')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'rvg' ? 'bg-[#005581] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            پری‌آپیکال RVG (تک‌دندان)
          </button>
          <button
            type="button"
            onClick={() => setSelectedImageType('opg')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'opg' ? 'bg-[#005581] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            پانورامیک OPG (دو فک)
          </button>
          <button
            type="button"
            onClick={() => setSelectedImageType('cbct')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'cbct' ? 'bg-[#005581] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            مقطع ۳ بعدی CBCT
          </button>
          <button
            type="button"
            onClick={() => setSelectedImageType('intraoral')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              selectedImageType === 'intraoral' ? 'bg-[#005581] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            عکس رنگی دهان (HD Photo)
          </button>
        </div>

        {/* Tool Modes */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTool('pin')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTool === 'pin' ? 'bg-[#ffd200] text-[#005581] shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>پین و نشانه‌گذاری</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('box')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTool === 'box' ? 'bg-[#ffd200] text-[#005581] shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>کادربندی ناحیه (ROI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('view')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeTool === 'view' ? 'bg-[#005581] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>حالت مشاهده</span>
          </button>
        </div>

        {/* AI Layer Toggle */}
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
            <span>{showAiLayer ? 'لایه تشخیص AI فعال' : 'نمایش لایه AI (خاموش)'}</span>
          </button>

          {showAiLayer && annotations.some((a) => a.author === 'ai') && (
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

      {/* Main Medical Viewport & Annotation Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: X-Ray Canvas */}
        <div className="lg:col-span-2 space-y-2">
          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            className={`relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-black min-h-[380px] max-h-[480px] flex items-center justify-center select-none shadow-inner ${
              activeTool !== 'view' ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <img
              src={xrayImages[selectedImageType]}
              alt="Dental Radiograph Web-PACS"
              style={{
                filter: `${isInverted ? 'invert(1)' : ''} brightness(${brightness}%) contrast(${contrast}%) ${
                  selectedImageType === 'intraoral' ? '' : 'grayscale(100%)'
                }`,
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease, filter 0.2s ease',
              }}
              className="w-full h-full object-cover max-h-[460px]"
            />

            {/* Grid Calibration Lines (Medical Standard) */}
            <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* Watermark & Metadata Overlay */}
            <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md text-white text-[11px] p-2.5 rounded-2xl border border-white/20 font-mono space-y-0.5 shadow-lg pointer-events-none z-10">
              <div className="font-sans font-extrabold text-[#ffd200]">بیمار: {patientName}</div>
              <div>مدالیته: {selectedImageType.toUpperCase()} PACS</div>
              <div>دندان تحت بررسی: FDI {toothFdi || 16}</div>
              <div className="text-emerald-400 text-[10px]">فرمت: DICOM 3.0 Web-Streaming</div>
            </div>

            {/* DICOM Adjusters in Viewport Bottom Left */}
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
                className={`p-1.5 rounded-lg cursor-pointer text-xs font-bold ${
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
                title="تنظیمات پیش‌فرض"
              >
                Reset
              </button>
            </div>

            {/* Active Annotations Render */}
            {visibleAnnotations.map((ann) => {
              const isSelected = selectedAnnotationId === ann.id;
              const isAi = ann.author === 'ai';

              if (ann.type === 'box') {
                return (
                  <div
                    key={ann.id}
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      width: `${ann.width || 15}%`,
                      height: `${ann.height || 15}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotationId(ann.id);
                    }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between p-1 ${
                      isAi
                        ? 'border-purple-400 bg-purple-500/25 border-dashed shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                        : isSelected
                        ? 'border-[#ffd200] bg-yellow-500/30 ring-2 ring-[#ffd200]'
                        : 'border-rose-500 bg-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-white font-bold leading-none">
                      <span className="bg-black/80 px-1.5 py-0.5 rounded-md text-[9px] font-mono">
                        {isAi ? `AI (${ann.aiConfidence}%)` : `FDI ${ann.toothFdi || 16}`}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAnnotation(ann.id, e)}
                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 cursor-pointer shadow"
                        title="حذف این نشانه"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-black/80 text-white text-[9px] px-1 py-0.5 rounded truncate font-medium">
                      {ann.text}
                    </div>
                  </div>
                );
              }

              // Pin Marker Render
              return (
                <div
                  key={ann.id}
                  style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnotationId(ann.id);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 p-1.5 pr-2.5 rounded-full shadow-xl border cursor-pointer backdrop-blur-md transition group ${
                    isAi
                      ? 'bg-purple-900/90 text-purple-100 border-purple-400'
                      : isSelected
                      ? 'bg-[#005581] text-white border-[#ffd200] ring-2 ring-[#ffd200]'
                      : 'bg-rose-700/90 text-white border-white/60 hover:bg-rose-600'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isAi ? 'bg-purple-400 animate-ping' : 'bg-[#ffd200]'}`}></span>
                  <span className="text-[10px] font-extrabold max-w-[140px] truncate">{ann.text}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAnnotation(ann.id, e)}
                    className="p-0.5 rounded-full bg-black/40 hover:bg-rose-600 text-white ml-0.5 cursor-pointer transition"
                    title="حذف نشانه"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400">
            {activeTool !== 'view'
              ? 'روی تصویر کلیک کنید تا کادر تشخیصی یا پین در محل مربوطه ثبت گردد.'
              : 'ابزار مشاهده فعال است. جهت ثبت یادداشت یا کادر، از نوار بالا ابزار نشانه‌گذاری را انتخاب کنید.'}
          </div>
        </div>

        {/* Right 1 Col: Annotation Management & Editor */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Annotation Creation Form */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Edit3 className="w-4 h-4 text-[#005581]" />
              <span>ثبت یادداشت و تشخیص روی عکس:</span>
            </h4>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شماره دندان مرتبط (FDI):
              </label>
              <input
                type="number"
                value={newAnnotationTooth}
                onChange={(e) => setNewAnnotationTooth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                متن شرح یا تشخیص پزشک:
              </label>
              <textarea
                rows={2}
                value={newAnnotationText}
                onChange={(e) => setNewAnnotationText(e.target.value)}
                placeholder="مثلاً: پوسیدگی کلاس ۲ عمیق مجاور پالپ دندان ۱۶..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#005581]"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1.5">تشخیص‌های بالینی متداول:</span>
              <div className="flex flex-wrap gap-1">
                {diagnosisPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewAnnotationText(preset)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-[#005581] hover:text-white border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Annotations List with AI Approvals */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs flex-1">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#005581]" />
                <span>لیست علائم و یافته‌های تصویر ({visibleAnnotations.length})</span>
              </h4>
            </div>

            {visibleAnnotations.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <p>هیچ علامتی روی تصویر ثبت نشده است.</p>
                <p className="text-[11px]">با کلیک روی عکس، یادداشت ثبت نمایید.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pl-1">
                {visibleAnnotations.map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => setSelectedAnnotationId(ann.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer space-y-1 ${
                      selectedAnnotationId === ann.id
                        ? 'border-[#005581] bg-blue-50/50 dark:bg-slate-800 ring-2 ring-[#005581]/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ann.author === 'ai'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-[#005581]'
                          }`}
                        >
                          {ann.author === 'ai' ? `AI (${ann.aiConfidence}٪)` : `پزشک - FDI ${ann.toothFdi || 16}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {ann.author === 'ai' && (
                          <button
                            type="button"
                            onClick={(e) => handleAcceptAiAnnotation(ann.id, e)}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold transition cursor-pointer"
                            title="تایید تشخیص AI و انتقال به گزارش پزشک"
                          >
                            تایید
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAnnotation(ann.id, e)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="حذف نشانه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                      {ann.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button: Save to Dossier & Insurance */}
          <button
            type="button"
            onClick={handleSaveToDossier}
            className="w-full py-3 bg-[#005581] hover:bg-[#004266] text-white rounded-2xl font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#ffd200]" />
            <span>الصاق تصویر و نشانه‌ها به شرح بیمه و پرونده UDR</span>
          </button>
        </div>
      </div>

      {/* External Imaging Center Link Integration */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-[#005581]" />
            <span>اتصال به گرافی‌های مرکز رادیولوژی بیرونی (External PACS/URL)</span>
          </h4>
          <p className="text-slate-500 text-[11px] mt-0.5">
            در صورت انجام OPG/CBCT در مراکز خارج از کلینیک، لینک دسترسی ارسالی را جهت بارگذاری و الصاق خودکار وارد نمایید.
          </p>
        </div>

        <form onSubmit={handleImportExternalLink} className="flex gap-2 w-full sm:w-auto">
          <input
            type="url"
            placeholder="https://pacs.radiology-center.ir/viewer/..."
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none min-w-[240px]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#005581] hover:bg-[#004266] text-white font-bold rounded-xl text-xs shadow cursor-pointer whitespace-nowrap"
          >
            دریافت و الصاق
          </button>
        </form>
      </div>
    </div>
  );
};
