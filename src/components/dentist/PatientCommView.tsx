import React, { useState } from 'react';
import { Patient } from '../../types';
import {
  MessageSquare,
  Search,
  User,
  SendHorizontal,
  Clock,
  Sparkles,
  Phone,
  FolderOpen,
  CheckCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  time: string;
}

interface PatientCommViewProps {
  patients: Patient[];
  onOpenPatientRecord?: (patientId: string) => void;
}

export const PatientCommView: React.FC<PatientCommViewProps> = ({
  patients,
  onOpenPatientRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || 'p-101'
  );
  const [inputText, setInputText] = useState('');

  // Initial chat threads per patient ID
  const [chatThreads, setChatThreads] = useState<Record<string, ChatMessage[]>>({
    'p-101': [
      { id: '1', sender: 'patient', text: 'سلام آقای دکتر، بعد از عصب‌کشی دیروز دندان ۱۶، هنوز کمی درد موقع جویدن دارم. طبیعیه؟', time: '۱۰:۱۵' },
      { id: '2', sender: 'doctor', text: 'سلام و احترام. بله تا ۲ الی ۳ روز احساس حساسیت هنگام جفت شدن دندان‌ها کاملاً طبیعی است. کپسول ژلوفن تجویز شده را مصرف بفرمایید.', time: '۱۰:۲۰' },
      { id: '3', sender: 'patient', text: 'ممنون دکتر جان. جلسه‌ی بعدی پانسمان و پر کردن کی هست؟', time: '۱۰:۲۲' },
    ],
    'p-102': [
      { id: '10', sender: 'patient', text: 'سلام دکتر، روکش زیرکونیای من آماده شده؟ منشی گفتن آخر هفته حاضر میشه.', time: 'دیروز' },
      { id: '11', sender: 'doctor', text: 'سلام، بله کست و روکش از لابراتوار ارسال شده و برای نوبت قالب‌گیری نهایی روز سه‌شنبه منتظرتون هستیم.', time: 'دیروز' },
    ],
  });

  // Filter patients based on search
  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.nationalId.includes(q) ||
      p.udrCode.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const activeMessages = selectedPatient ? chatThreads[selectedPatient.id] || [] : [];

  const handleSendMessage = (textToSend?: string) => {
    const msgText = textToSend || inputText;
    if (!msgText.trim() || !selectedPatient) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      text: msgText,
      time: 'هم‌اکنون',
    };

    setChatThreads((prev) => ({
      ...prev,
      [selectedPatient.id]: [...(prev[selectedPatient.id] || []), newMsg],
    }));

    if (!textToSend) setInputText('');
  };

  const quickReplies = [
    'دستورالعمل مراقبت بعد از درمان ریشه (RCT): از خوردن غذاهای سفت با دندان پانسمان‌شده پرهیز کنید.',
    'مصرف ژلوفن ۴۰۰ میلی‌گرم هر ۸ ساعت هنگام درد خفیف تا متوسط توصیه می‌شود.',
    'جهت پیگیری جلسه دوم، لطفا با بخش پذیرش جهت هماهنگی تماس بگیرید.',
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#005581] text-[#ffd200] flex items-center justify-center font-black shadow">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>مرکز پیگیری و ارتباط مستقیم پیامکی با بیماران</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                پیام‌رسان متصل به پرونده
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              جستجو و انتخاب بیمار جهت پاسخ به سوالات بعد از درمان، ارسال توصیه‌ها و پیگیری وضعیت آنلاین
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Left Column: Search & Patient List (md:col-span-4) */}
        <div className="md:col-span-4 border-l border-slate-100 dark:border-slate-800 p-3 space-y-3 bg-slate-50/30 dark:bg-slate-900">
          {/* Patient Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="سرچ بیمار جهت شروع چت..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-[#005581]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Patients Contacts List */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredPatients.map((patient) => {
              const isSelected = patient.id === selectedPatient?.id;
              const msgs = chatThreads[patient.id] || [];
              const lastMsg = msgs[msgs.length - 1];

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#005581] text-white border-[#005581] shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-[#005581]/40 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#005581]/10 text-[#005581]'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs">{patient.fullName}</span>
                    </div>

                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                    }`}>
                      {patient.udrCode}
                    </span>
                  </div>

                  {lastMsg ? (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <p className={`truncate max-w-[180px] ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {lastMsg.sender === 'doctor' ? 'شما: ' : ''}{lastMsg.text}
                      </p>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {lastMsg.time}
                      </span>
                    </div>
                  ) : (
                    <p className={`text-[10px] italic ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      آماده شروع گفتگو...
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Chat Window (md:col-span-8) */}
        {selectedPatient ? (
          <div className="md:col-span-8 flex flex-col justify-between p-4 bg-white dark:bg-slate-900">
            {/* Active Patient Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005581] text-[#ffd200] font-black flex items-center justify-center text-sm shadow">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {selectedPatient.fullName}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      پاسخ‌دهی فعال
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>کد پرونده: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedPatient.udrCode}</strong></span>
                    <span>شماره همراه: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedPatient.phone}</strong></span>
                  </div>
                </div>
              </div>

              {onOpenPatientRecord && (
                <button
                  onClick={() => onOpenPatientRecord(selectedPatient.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#005581]" />
                  <span>باز کردن پرونده</span>
                </button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 my-4 space-y-3 max-h-[320px] overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              {activeMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  پیامی ثبت نشده است. پاسخ یا توصیه کلینیکی خود را برای بیمار ارسال کنید.
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl max-w-[85%] text-xs space-y-1 shadow-xs ${
                      msg.sender === 'doctor'
                        ? 'bg-[#005581] text-white mr-auto rounded-tl-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 ml-auto rounded-tr-none'
                    }`}
                  >
                    <div className="leading-relaxed font-medium">{msg.text}</div>
                    <div className={`text-[10px] text-left flex items-center justify-end gap-1 ${
                      msg.sender === 'doctor' ? 'text-slate-300' : 'text-slate-400'
                    }`}>
                      <span>{msg.time}</span>
                      {msg.sender === 'doctor' && <CheckCheck className="w-3 h-3 text-[#ffd200]" />}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Replies Templates */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>توصیه‌ها و پاسخ‌های آماده کلینیکی:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#005581] hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer text-right"
                  >
                    + {reply.slice(0, 38)}...
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="تایپ پاسخ دندان‌پزشک به بیمار..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-[#005581]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="px-5 py-2.5 bg-[#005581] hover:bg-[#004266] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition"
                >
                  <span>ارسال</span>
                  <SendHorizontal className="w-4 h-4 text-[#ffd200]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-8 text-slate-400 text-xs">
            بیماری جهت گفتگو انتخاب نشده است.
          </div>
        )}
      </div>
    </div>
  );
};
