import React, { useState } from 'react';
import { Patient, ToothDetail, ToothCondition } from '../../types';
import { Odontogram } from './Odontogram';
import { ImageXrayViewer } from './ImageXrayViewer';
import {
  Search,
  User,
  FolderOpen,
  Edit3,
  ShieldAlert,
  FileText,
  FileCheck,
  Plus,
  CheckCircle2,
  Clock,
  Save,
  X,
  Stethoscope,
  Building,
  Phone,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface PatientRecordsViewProps {
  patients: Patient[];
  onUpdatePatient?: (updatedPatient: Patient) => void;
  onSelectPatientToExamine?: (patientId: string) => void;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = ({
  patients,
  onUpdatePatient,
  onSelectPatientToExamine,
}) => {
  // Local list of patients to allow inline edits if callback not provided
  const [patientList, setPatientList] = useState<Patient[]>(patients);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || 'p-101'
  );
  const [activeRecordTab, setActiveRecordTab] = useState<'odontogram' | 'history' | 'xray' | 'consents'>('odontogram');

  // Selected tooth FDI for odontogram editing
  const [selectedToothFdi, setSelectedToothFdi] = useState<number | null>(16);

  // Modal states for editing patient details
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editInsurance, setEditInsurance] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editMedicalHistory, setEditMedicalHistory] = useState('');

  // Modal state for adding a new treatment log entry
  const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);
  const [newProcName, setNewProcName] = useState('عصب‌کشی دندان');
  const [newProcTooth, setNewProcTooth] = useState<number>(16);
  const [newProcCost, setNewProcCost] = useState<number>(4500000);
  const [newProcStatus, setNewProcStatus] = useState<'completed' | 'in_progress' | 'planned'>('completed');

  // Filter patients based on search query
  const filteredPatients = patientList.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.nationalId.includes(q) ||
      p.udrCode.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  });

  // Currently selected patient
  const selectedPatient = patientList.find((p) => p.id === selectedPatientId) || patientList[0];

  // Open edit modal for selected patient
  const handleOpenEditModal = () => {
    if (!selectedPatient) return;
    setEditFullName(selectedPatient.fullName);
    setEditNationalId(selectedPatient.nationalId);
    setEditPhone(selectedPatient.phone);
    setEditInsurance(selectedPatient.primaryInsurance?.provider || 'بیمه تامین اجتماعی');
    setEditAllergies(selectedPatient.allergies ? selectedPatient.allergies.join(', ') : '');
    setEditMedicalHistory(selectedPatient.medicalHistory ? selectedPatient.medicalHistory.join(', ') : '');
    setIsEditModalOpen(true);
  };

  // Save edited patient info
  const handleSavePatientDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const updatedPatient: Patient = {
      ...selectedPatient,
      fullName: editFullName,
      nationalId: editNationalId,
      phone: editPhone,
      primaryInsurance: {
        ...selectedPatient.primaryInsurance,
        provider: editInsurance,
      },
      allergies: editAllergies.split(',').map((s) => s.trim()).filter(Boolean),
      medicalHistory: editMedicalHistory.split(',').map((s) => s.trim()).filter(Boolean),
    };

    setPatientList((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
    if (onUpdatePatient) onUpdatePatient(updatedPatient);
    setIsEditModalOpen(false);
  };

  // Update tooth map for selected patient
  const handleToothUpdate = (fdiNumber: number, updatedTooth: ToothDetail) => {
    if (!selectedPatient) return;

    const updatedTeethMap = {
      ...selectedPatient.teethMap,
      [fdiNumber]: updatedTooth,
    };

    const updatedPatient: Patient = {
      ...selectedPatient,
      teethMap: updatedTeethMap,
    };

    setPatientList((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
    if (onUpdatePatient) onUpdatePatient(updatedPatient);
  };

  // Add a new treatment log item to the patient's record
  const handleAddTreatmentLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const currentTooth = selectedPatient.teethMap[newProcTooth] || {
      fdiNumber: newProcTooth,
      condition: 'in_progress',
      affectedSurfaces: ['Occlusal'],
      treatmentHistory: [],
    };

    const newLogItem = {
      id: `th-${Date.now()}`,
      date: new Date().toLocaleDateString('fa-IR'),
      procedureName: newProcName,
      dentistName: 'دکتر کاویانی',
      cost: newProcCost,
      status: newProcStatus,
    };

    const updatedTooth: ToothDetail = {
      ...currentTooth,
      treatmentHistory: [newLogItem, ...currentTooth.treatmentHistory],
    };

    handleToothUpdate(newProcTooth, updatedTooth);
    setIsAddTreatmentModalOpen(false);
  };

  // Collect all treatment history items from all teeth
  const allTreatmentLogs = selectedPatient
    ? (Object.values(selectedPatient.teethMap || {}) as ToothDetail[]).flatMap((t) =>
        (t.treatmentHistory || []).map((th) => ({ ...th, toothFdi: t.fdiNumber }))
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Top Banner & Search Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black shadow">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>پرونده جامع دندان‌پزشکی و سوابق درمانی بیماران</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#ffd200] text-[#005581] font-bold">
                  سرچ آنلاین پرونده‌ها
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                جستجوی هوشمند، مشاهده اودونتوگرام ۳D، پیشینه درمانی، گالری رادیوگرافی و ویرایش کامل پرونده
              </p>
            </div>
          </div>

          {/* Real Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، کد ملی، UDR یا همراه..."
              className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#005581]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Patients List Sidebar (1/3) + Detailed Patient Record (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Patient Cards List (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>نتایج جستجو ({filteredPatients.length} بیمار)</span>
              <span className="text-[10px] text-[#005581] font-mono">UDR System</span>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p>هیچ بیماری با عبارت «{searchQuery}» یافت نشد.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredPatients.map((patient) => {
                  const isSelected = patient.id === selectedPatient?.id;
                  return (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-[#005581] text-white border-[#005581] shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#005581]/50 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[#005581]'
                        }`}>
                          {patient.udrCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-[#ffd200] text-[#005581]' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {patient.age} ساله · {patient.gender}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm">{patient.fullName}</h4>
                        <div className={`text-xs mt-0.5 flex justify-between ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                          <span>کد ملی: <strong className="font-mono">{patient.nationalId}</strong></span>
                          <span>موبایل: <strong className="font-mono">{patient.phone}</strong></span>
                        </div>
                      </div>

                      <div className={`text-[11px] pt-1 border-t flex justify-between ${
                        isSelected ? 'border-white/20 text-slate-200' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <span>بیمه: {patient.primaryInsurance?.provider || 'تامین اجتماعی'}</span>
                        <span className="font-bold">{Object.keys(patient.teethMap || {}).length} دندان دارای سابقه</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Patient Record Details (lg:col-span-8) */}
        {selectedPatient && (
          <div className="lg:col-span-8 space-y-4">
            {/* Patient Header Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#005581]/10 text-[#005581] dark:text-[#72cdf4] font-black flex items-center justify-center text-lg border border-[#005581]/30">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {selectedPatient.fullName}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#005581] text-white">
                        {selectedPatient.udrCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-3">
                      <span>کد ملی: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedPatient.nationalId}</strong></span>
                      <span>تلفن: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedPatient.phone}</strong></span>
                      <span>سن / جنسیت: <strong>{selectedPatient.age} ساله ({selectedPatient.gender})</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenEditModal}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 rounded-xl font-bold text-xs border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>ویرایش مشخصات</span>
                  </button>

                  {onSelectPatientToExamine && (
                    <button
                      onClick={() => onSelectPatientToExamine(selectedPatient.id)}
                      className="px-3.5 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-[#ffd200]" />
                      <span>شروع معاینه کلینیکی</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Medical History & Allergies Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold">حساسیت‌های دارویی: </span>
                    <span>{selectedPatient.allergies?.length ? selectedPatient.allergies.join('، ') : 'بدون حساسیت ثبت‌شده'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold">پوشش بیمه اولیه: </span>
                    <span>{selectedPatient.primaryInsurance?.provider || 'تامین اجتماعی'}</span>
                    {selectedPatient.supplementaryInsurance?.active && (
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold ml-1">
                        + {selectedPatient.supplementaryInsurance.provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs Bar */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold pt-2">
                <button
                  onClick={() => setActiveRecordTab('odontogram')}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeRecordTab === 'odontogram'
                      ? 'bg-[#005581] text-white shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>اودونتوگرام بیمار</span>
                </button>

                <button
                  onClick={() => setActiveRecordTab('history')}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeRecordTab === 'history'
                      ? 'bg-[#005581] text-white shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>پیشینه درمانی و سوابق</span>
                </button>

                <button
                  onClick={() => setActiveRecordTab('xray')}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeRecordTab === 'xray'
                      ? 'bg-[#005581] text-white shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#005581]'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>تصاویر و رادیوگرافی</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: ODONTOGRAM */}
            {activeRecordTab === 'odontogram' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-[#005581] dark:text-[#72cdf4]">
                    اودونتوگرام تعاملی دندان‌های بیمار ({selectedPatient.fullName})
                  </h4>
                  <span className="text-xs text-slate-500">جهت مشاهده جزئیات و ویرایش، روی هر دندان کلیک کنید.</span>
                </div>

                <Odontogram
                  teethMap={selectedPatient.teethMap || {}}
                  onToothUpdate={(fdi, updated) => handleToothUpdate(fdi, updated)}
                  selectedToothFdi={selectedToothFdi}
                  onSelectTooth={(fdi) => setSelectedToothFdi(fdi)}
                />
              </div>
            )}

            {/* TAB CONTENT 2: TREATMENT HISTORY */}
            {activeRecordTab === 'history' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#005581] dark:text-[#72cdf4]">
                      پیشینه کامل درمان‌ها و اقدامات دندان‌پزشکی
                    </h4>
                    <p className="text-xs text-slate-500">لیست کلیه خدمات انجام شده، یادداشت‌های بالینی، نسخه‌ها و سوابق پزشکی بیمار</p>
                  </div>

                  <button
                    onClick={() => setIsAddTreatmentModalOpen(true)}
                    className="px-3 py-1.5 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold text-xs shadow flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#ffd200]" />
                    <span>ثبت سابقه درمانی جدید</span>
                  </button>
                </div>

                {/* Clinical Notes & Doctor Dictations */}
                {selectedPatient.clinicalNotes && selectedPatient.clinicalNotes.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                    <h5 className="text-xs font-bold text-[#005581] dark:text-[#72cdf4] flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>یادداشت‌ها و شرح‌های بالینی دندان‌پزشک:</span>
                    </h5>
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {selectedPatient.clinicalNotes.map((note, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescriptions issued */}
                {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      <span>نسخه‌های دارویی صادرشده:</span>
                    </h5>
                    <div className="space-y-2 text-xs">
                      {selectedPatient.prescriptions.map((rx) => (
                        <div key={rx.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                            <span>پزشک: {rx.dentistName}</span>
                            <span className="font-mono text-slate-500">{rx.date}</span>
                          </div>
                          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                            {rx.items.map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ul>
                          {rx.instructions && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">دستور: {rx.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatments List */}
                {allTreatmentLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    هیچ اقدام درمانی ثبت‌شده‌ای در نقشه دندان‌ها موجود نیست.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">اقدامات انجام‌شده بر روی دندان‌ها:</h5>
                    {allTreatmentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#005581] text-white text-[11px]">
                              دندان {log.toothFdi}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {log.procedureName}
                            </span>
                            {log.status === 'completed' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                تکمیل‌شده
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                در حال درمان
                              </span>
                            )}
                          </div>

                          <div className="text-slate-500 flex gap-3">
                            <span>تاریخ: <strong className="font-mono">{log.date}</strong></span>
                            <span>پزشک معالج: <strong>{log.dentistName}</strong></span>
                          </div>
                        </div>

                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          {log.cost ? log.cost.toLocaleString('fa-IR') + ' تومان' : 'تعرفه بیمه‌ای'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: RADIOGRAPHY & X-RAY GALLERY */}
            {activeRecordTab === 'xray' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-[#005581] dark:text-[#72cdf4]">
                    گالری تصاویر دیجیتال، عکس‌های OPG و پری‌آپیکال RVG
                  </h4>
                  <p className="text-xs text-slate-500">قابلیت بزرگنمایی، تنظیم کنتراست، ثبت نشانه‌ها و همگام‌سازی با پرونده بیمار</p>
                </div>

                <ImageXrayViewer
                  patientName={selectedPatient.fullName}
                  patientId={selectedPatient.id}
                  doctorName="دکتر معالج"
                  toothFdi={selectedToothFdi || 16}
                  patientImages={selectedPatient.patientImages || []}
                  onSavePatientImage={(imageRecord) => {
                    const existing = selectedPatient.patientImages || [];
                    const idx = existing.findIndex((img) => img.id === imageRecord.id);
                    const updatedImages = idx >= 0 ? existing.map((img, i) => (i === idx ? imageRecord : img)) : [imageRecord, ...existing];
                    const updatedPatient: Patient = {
                      ...selectedPatient,
                      patientImages: updatedImages,
                      medicalHistory: Array.from(new Set([...(selectedPatient.medicalHistory || []), `تصویربرداری و علائم بالینی (${imageRecord.title})`])),
                      clinicalNotes: [...(selectedPatient.clinicalNotes || []), `[${imageRecord.date} ${imageRecord.doctorName}] ${imageRecord.doctorNotes || imageRecord.summaryText || ''}`],
                    };
                    setPatientList((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
                    if (onUpdatePatient) onUpdatePatient(updatedPatient);
                  }}
                  onSaveToDossier={(summary) => {
                    const todayFa = new Date().toLocaleDateString('fa-IR');
                    const updatedPatient: Patient = {
                      ...selectedPatient,
                      clinicalNotes: [...(selectedPatient.clinicalNotes || []), `[${todayFa} PACS]: ${summary}`],
                    };
                    setPatientList((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
                    if (onUpdatePatient) onUpdatePatient(updatedPatient);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT PATIENT DETAILS MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#005581] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#005581]" />
                <span>ویرایش پرونده و مشخصات بیمار ({selectedPatient?.fullName})</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePatientDetails} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام و نام خانوادگی:
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کد ملی:
                  </label>
                  <input
                    type="text"
                    required
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره همراه:
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    بیمه اصلی:
                  </label>
                  <input
                    type="text"
                    value={editInsurance}
                    onChange={(e) => setEditInsurance(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  حساسیت‌های دارویی (با کاما جدا کنید):
                </label>
                <input
                  type="text"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  placeholder="پنی‌سیلین، بی‌حسی لیدوکایین"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  پیشینه بیماری‌های زمینه‌ای (با کاما جدا کنید):
                </label>
                <textarea
                  value={editMedicalHistory}
                  onChange={(e) => setEditMedicalHistory(e.target.value)}
                  rows={2}
                  placeholder="فشار خون خفیف، دیابت نوع ۲"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold shadow flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#ffd200]" />
                  <span>ذخیره تغییرات پرونده</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TREATMENT LOG MODAL */}
      {isAddTreatmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#005581] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#005581]" />
                <span>ثبت سابقه درمان جدید برای {selectedPatient?.fullName}</span>
              </h3>
              <button
                onClick={() => setIsAddTreatmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTreatmentLog} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شماره دندان (FDI):
                </label>
                <input
                  type="number"
                  min={11}
                  max={85}
                  value={newProcTooth}
                  onChange={(e) => setNewProcTooth(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان خدمت / اقدام درمانی:
                </label>
                <input
                  type="text"
                  required
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  placeholder="مثال: ترمیم کامپوزیت خلفی ۲ سطحی"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  هزینه درمان (تومان):
                </label>
                <input
                  type="number"
                  value={newProcCost}
                  onChange={(e) => setNewProcCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTreatmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005581] hover:bg-[#004266] text-white rounded-xl font-bold shadow cursor-pointer"
                >
                  ثبت در سوابق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
