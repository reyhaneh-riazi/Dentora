import React, { useState } from 'react';
import { ClinicRegistration, LabOrder } from '../../types';
import {
  Truck,
  Flame,
  PenTool,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  X,
  ChevronLeft,
  Filter,
  Eye,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  RefreshCw,
  Home,
  Check,
} from 'lucide-react';

interface LabPortalViewProps {
  labOrders: LabOrder[];
  clinics?: ClinicRegistration[];
  onUpdateOrderStatus: (orderId: string, status: LabOrder['status'], milestone: string, targetClinicId?: string) => void;
  onAddLabOrder?: (newOrder: LabOrder, targetClinicId?: string) => void;
  onBackToLanding?: () => void;
}

type LabFilterTab = 'all' | 'designing' | 'in_furnace' | 'shipped' | 'delivered';

export const LabPortalView: React.FC<LabPortalViewProps> = ({
  labOrders,
  clinics = [],
  onUpdateOrderStatus,
  onAddLabOrder,
  onBackToLanding,
}) => {
  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<LabFilterTab>('all');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  // New Order Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState(`LAB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newPatientName, setNewPatientName] = useState('');
  const [newDentistName, setNewDentistName] = useState('دکتر حسینی');
  const [newLabName, setNewLabName] = useState('لابراتوار تخصصی پارس دنتال');
  const [newClinicTargetId, setNewClinicTargetId] = useState(clinics[0]?.id || 'clinic-alborz');
  const [newItemType, setNewItemType] = useState<LabOrder['itemType']>('روکش زيرکونيا');
  const [newToothFdi, setNewToothFdi] = useState<number>(36);
  const [newStatus, setNewStatus] = useState<LabOrder['status']>('designing');
  const [newExpectedDate, setNewExpectedDate] = useState('۱۴۰۵/۰۵/۲۵');

  // Custom Milestone Edit Input in Detail Modal
  const [customMilestone, setCustomMilestone] = useState('');

  // Default Milestones Mapping
  const getMilestoneForStatus = (status: LabOrder['status']): string => {
    switch (status) {
      case 'designing':
        return 'در حال طراحی 3D و CAD/CAM فریم روکش';
      case 'in_furnace':
        return 'مرحله پخت پودر زيرکونيا / سرامیک در کوره سانتر High-Temp';
      case 'shipped':
        return 'تحویل به پیک جهت ارسال به کلینیک دندان‌پزشکی';
      case 'delivered':
        return 'تحویل نهایی به مطب و آماده‌سازی جهت نصب روی دندان بیمار';
      case 'ordered':
      default:
        return 'ثبت اولیه سفارش در سیستم لابراتوار';
    }
  };

  // Status Labels and Color Helpers
  const getStatusBadge = (status: LabOrder['status']) => {
    switch (status) {
      case 'designing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 font-bold text-xs flex items-center gap-1.5 border border-blue-200 dark:border-blue-900">
            <PenTool className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>طراحی CAD</span>
          </span>
        );
      case 'in_furnace':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 border border-amber-200 dark:border-amber-900">
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>کوره سانتر</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 font-bold text-xs flex items-center gap-1.5 border border-sky-200 dark:border-sky-900">
            <Truck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>ارسال به مطب</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>تحویل نهایی</span>
          </span>
        );
      case 'ordered':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>ثبت سفارش</span>
          </span>
        );
    }
  };

  // Filter Orders by Tab, Clinic, and Search query
  const filteredOrders = labOrders.filter((order) => {
    // 1. Status tab filter
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'designing'
        ? order.status === 'designing' || order.status === 'ordered'
        : order.status === activeTab;

    // 2. Clinic filter
    const matchesClinic =
      selectedClinicId === 'all' || !order.clinicId || order.clinicId === selectedClinicId;

    // 3. Search query
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.patientName.toLowerCase().includes(query) ||
      order.orderNumber.toLowerCase().includes(query) ||
      order.dentistName.toLowerCase().includes(query) ||
      (order.clinicName && order.clinicName.toLowerCase().includes(query)) ||
      order.itemType.toLowerCase().includes(query) ||
      order.toothFdi.toString().includes(query);

    return matchesTab && matchesClinic && matchesSearch;
  });

  // Calculate Order Status Counts
  const countDesigning = labOrders.filter((o) => o.status === 'designing' || o.status === 'ordered').length;
  const countFurnace = labOrders.filter((o) => o.status === 'in_furnace').length;
  const countShipped = labOrders.filter((o) => o.status === 'shipped').length;
  const countDelivered = labOrders.filter((o) => o.status === 'delivered').length;

  // List of distinct clinics associated with orders
  const uniqueClinicsCount = clinics.length > 0 ? clinics.length : 2;

  // Handle Status Update
  const handleApplyStatusChange = (newSt: LabOrder['status'], milestoneOverride?: string) => {
    if (!selectedOrder) return;

    const ms = milestoneOverride || customMilestone.trim() || getMilestoneForStatus(newSt);
    onUpdateOrderStatus(selectedOrder.id, newSt, ms, selectedOrder.clinicId);

    // Update selectedOrder local view state
    setSelectedOrder((prev) => (prev ? { ...prev, status: newSt, currentMilestone: ms } : null));
    setCustomMilestone('');
  };

  // Handle Add New Order Submit
  const handleAddNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      alert('لطفاً نام بیمار را وارد کنید.');
      return;
    }

    const selectedClinicObj = clinics.find((c) => c.id === newClinicTargetId);

    const created: LabOrder = {
      id: `lab-${Date.now()}`,
      orderNumber: newOrderNumber,
      patientId: `p-${Date.now()}`,
      patientName: newPatientName.trim(),
      dentistName: newDentistName.trim() || 'دندان‌پزشک معالج',
      toothFdi: Number(newToothFdi) || 36,
      labName: newLabName.trim() || 'لابراتوار دندان‌سازی',
      clinicId: newClinicTargetId,
      clinicName: selectedClinicObj?.name || 'کلینیک دندان‌پزشکی',
      itemType: newItemType,
      status: newStatus,
      orderedDate: '۱۴۰۵/۰۵/۱۵',
      expectedDeliveryDate: newExpectedDate,
      currentMilestone: getMilestoneForStatus(newStatus),
    };

    if (onAddLabOrder) {
      onAddLabOrder(created, newClinicTargetId);
    } else {
      labOrders.unshift(created);
    }

    setIsAddModalOpen(false);
    setNewPatientName('');
    setNewOrderNumber(`LAB-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#003857] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shadow-inner">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>پورتال جامع لابراتوارهای دندان‌سازی</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-xs font-mono">
                    {labOrders.length} سفارش فعال
                  </span>
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1 text-emerald-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>همگام‌سازی بلادرنگ با {uniqueClinicsCount} کلینیک همکار</span>
                </span>
                <span className="text-slate-500">•</span>
                <span>ردیابی مراحل CAD/CAM، کوره، ارسال و تحویل</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>صفحه اصلی</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#ffd200] hover:bg-[#ffe552] text-slate-950 font-black text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت سفارش جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLINIC FILTER & LAB CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
        
        {/* Top Filter Row: Multi-clinic switcher & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          {/* Multi-Clinic Selection Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Building2 className="w-4 h-4 text-[#005581]" />
              <span>کلینیک طرف قرارداد:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedClinicId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedClinicId === 'all'
                  ? 'bg-[#005581] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              همه کلینیک‌ها ({labOrders.length})
            </button>

            {clinics.map((c) => {
              const clinicOrdersCount = labOrders.filter((o) => o.clinicId === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClinicId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedClinicId === c.id
                      ? 'bg-[#005581] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    selectedClinicId === c.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {clinicOrdersCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="جستجوی بیمار، کد سفارش، پزشک، کلینیک..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-[#005581]"
            />
          </div>
        </div>

        {/* Bottom Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'all'
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-[#ffd200]" />
            <span>همه مراحل</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
              {labOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('designing')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'designing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <PenTool className="w-4 h-4 text-blue-400" />
            <span>۱. طراحی CAD</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-800 dark:text-blue-200 text-[10px] font-mono">
              {countDesigning}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('in_furnace')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'in_furnace'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>۲. کوره سانتر</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[10px] font-mono">
              {countFurnace}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('shipped')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'shipped'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Truck className="w-4 h-4 text-sky-400" />
            <span>۳. ارسال به مطب</span>
            <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-200 text-[10px] font-mono">
              {countShipped}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'delivered'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>۴. تحویل نهایی</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-mono">
              {countDelivered}
            </span>
          </button>
        </div>
      </div>

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          سفارشی با فیلترهای انتخابی یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order, idx) => (
            <div
              key={`${order.clinicId || 'cl'}_${order.id || idx}`}
              onClick={() => setSelectedOrder(order)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-[#005581] transition cursor-pointer space-y-4 group relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#005581] dark:text-cyan-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      {order.clinicName && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#005581]" />
                          <span>{order.clinicName}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-[#005581] transition">
                      {order.itemType} (دندان {order.toothFdi})
                    </h3>
                  </div>

                  {getStatusBadge(order.status)}
                </div>

                {/* Details Meta */}
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">بیمار:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{order.patientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">پزشک معالج:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{order.dentistName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">لابراتوار:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{order.labName}</span>
                  </div>
                </div>

                {/* Current Milestone Banner */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center justify-between">
                    <span>گام فعلی ساخت:</span>
                    <span className="text-[10px] text-slate-400 font-mono">تحویل: {order.expectedDeliveryDate}</span>
                  </div>
                  <div className="text-[#005581] dark:text-cyan-400 font-bold line-clamp-1 text-xs">
                    {order.currentMilestone}
                  </div>
                </div>
              </div>

              {/* View & Change Status Trigger */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#005581] dark:text-cyan-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>تغییر وضعیت و ثبت گام</span>
                </span>
                <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORDER DETAILS & STATUS CHANGE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005581] text-[#ffd200] font-black flex items-center justify-center text-sm shadow">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#005581] dark:text-cyan-400">
                      {selectedOrder.orderNumber}
                    </span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100 mt-0.5">
                    جزئیات سفارش {selectedOrder.itemType} (دندان {selectedOrder.toothFdi})
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Information Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">نام بیمار:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedOrder.patientName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">کلینیک طرف قرارداد:</span>
                <p className="font-bold text-[#005581] dark:text-cyan-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{selectedOrder.clinicName || 'کلینیک دندان‌پزشکی'}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">دندان‌پزشک معالج:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedOrder.dentistName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">لابراتوار سازنده:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedOrder.labName}</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-slate-500 font-medium">تاریخ سفارش و تحویل:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  ثبت: {selectedOrder.orderedDate} | پیش‌بینی تحویل: <span className="text-cyan-600">{selectedOrder.expectedDeliveryDate}</span>
                </p>
              </div>
            </div>

            {/* VISUAL WORKFLOW STEPPER */}
            <div className="space-y-3">
              <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>روند وضعیت سفارش ساخت لابراتوار</span>
                <span className="text-xs text-slate-500 font-normal">
                  همگام‌سازی لحظه‌ای با پورتال کلینیک
                </span>
              </h4>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {/* Step 1: طراحی */}
                <div
                  className={`p-3 rounded-2xl border text-center space-y-1 transition ${
                    selectedOrder.status === 'designing' || selectedOrder.status === 'ordered'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                      : selectedOrder.status === 'in_furnace' ||
                        selectedOrder.status === 'shipped' ||
                        selectedOrder.status === 'delivered'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-900 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <PenTool className="w-5 h-5 mx-auto" />
                  <div className="font-black text-xs">۱. طراحی</div>
                  <div className="text-[10px] opacity-80">CAD/CAM</div>
                </div>

                {/* Step 2: کوره */}
                <div
                  className={`p-3 rounded-2xl border text-center space-y-1 transition ${
                    selectedOrder.status === 'in_furnace'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300'
                      : selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-900 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Flame className="w-5 h-5 mx-auto" />
                  <div className="font-black text-xs">۲. کوره</div>
                  <div className="text-[10px] opacity-80">پخت زیرکونیا</div>
                </div>

                {/* Step 3: ارسال */}
                <div
                  className={`p-3 rounded-2xl border text-center space-y-1 transition ${
                    selectedOrder.status === 'shipped'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300'
                      : selectedOrder.status === 'delivered'
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 text-sky-900 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Truck className="w-5 h-5 mx-auto" />
                  <div className="font-black text-xs">۳. ارسال</div>
                  <div className="text-[10px] opacity-80">تحویل به پیک</div>
                </div>

                {/* Step 4: تحویل */}
                <div
                  className={`p-3 rounded-2xl border text-center space-y-1 transition ${
                    selectedOrder.status === 'delivered'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 mx-auto" />
                  <div className="font-black text-xs">۴. تحویل</div>
                  <div className="text-[10px] opacity-80">تحویل مطب</div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS TO CHANGE STATUS */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-black text-xs text-slate-700 dark:text-slate-300">
                تغییر وضعیت سفارش (ثبت آنی در دیتابیس کلینیک):
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyStatusChange('designing')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    selectedOrder.status === 'designing'
                      ? 'bg-blue-700 text-white shadow-inner ring-2 ring-blue-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-[#ffd200]" />
                  <span>طراحی</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyStatusChange('in_furnace')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    selectedOrder.status === 'in_furnace'
                      ? 'bg-amber-700 text-white shadow-inner ring-2 ring-amber-400'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  }`}
                >
                  <Flame className="w-4 h-4 text-[#ffd200]" />
                  <span>کوره</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyStatusChange('shipped')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    selectedOrder.status === 'shipped'
                      ? 'bg-sky-700 text-white shadow-inner ring-2 ring-sky-400'
                      : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#ffd200]" />
                  <span>ارسال</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyStatusChange('delivered')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    selectedOrder.status === 'delivered'
                      ? 'bg-emerald-700 text-white shadow-inner ring-2 ring-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#ffd200]" />
                  <span>تحویل</span>
                </button>
              </div>

              {/* Custom Milestone Input */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  توضیحات و گام ساخت اختصاصی (در پرونده دندان‌پزشک نیز نمایش داده می‌شود):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMilestone}
                    onChange={(e) => setCustomMilestone(e.target.value)}
                    placeholder={`مثال: ${getMilestoneForStatus(selectedOrder.status)}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#005581]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyStatusChange(selectedOrder.status, customMilestone)}
                    className="px-4 py-2 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    ثبت گام
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW LAB ORDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#005581]" />
                <span>ثبت سفارش جدید در شبکه سراسری لابراتوار</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewOrderSubmit} className="space-y-4 text-xs font-bold">
              {/* Target Clinic Selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  انتخاب کلینیک طرف قرارداد: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newClinicTargetId}
                  onChange={(e) => setNewClinicTargetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                >
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">شماره سفارش:</label>
                <input
                  type="text"
                  required
                  value={newOrderNumber}
                  onChange={(e) => setNewOrderNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">نام و نام خانوادگی بیمار:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کامران حسینی"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">دندان‌پزشک معالج:</label>
                  <input
                    type="text"
                    value={newDentistName}
                    onChange={(e) => setNewDentistName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">شماره دندان (FDI):</label>
                  <input
                    type="number"
                    value={newToothFdi}
                    onChange={(e) => setNewToothFdi(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">نوع کار لابراتواری:</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="روکش زيرکونيا">روکش زيرکونيا</option>
                    <option value="سرامیک PFM">سرامیک PFM</option>
                    <option value="نایت گارد">نایت گارد</option>
                    <option value="اباتمنت ایمپلنت">اباتمنت ایمپلنت</option>
                    <option value="پروتز پارسیل">پروتز پارسیل</option>
                    <option value="لمینت Emax">لمینت Emax</option>
                    <option value="اینله / آنله">اینله / آنله</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">وضعیت اولیه:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="designing">طراحی CAD</option>
                    <option value="in_furnace">کوره سانتر</option>
                    <option value="shipped">ارسال به مطب</option>
                    <option value="delivered">تحویل شده</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">لابراتوار سازنده:</label>
                <input
                  type="text"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">تاریخ تحویل پیش‌بینی‌شده:</label>
                <input
                  type="text"
                  value={newExpectedDate}
                  onChange={(e) => setNewExpectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#005581] hover:bg-[#004266] text-white font-black text-sm shadow-md cursor-pointer transition"
                >
                  ذخیره و ایجاد سفارش در پرونده کلینیک
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
