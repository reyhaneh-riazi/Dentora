import { ElectronicPrescription, PrescriptionItem } from '../types';

export interface MedicationMaster {
  id: string;
  name: string;
  genericName: string;
  persianName: string;
  defaultDosage: string;
  form: string;
  defaultUnit: string;
  defaultQuantity: number;
  defaultFrequency: string;
  defaultDuration: string;
  defaultInstructions: string;
  category: 'antibiotic' | 'analgesic' | 'anti_inflammatory' | 'mouthwash' | 'corticosteroid' | 'pediatric' | 'other';
  allergyTags: string[]; // e.g. ['penicillin', 'beta-lactam', 'nsaid', 'aspirin']
  contraindications: string[];
}

export const DENTAL_MEDICATIONS_DB: MedicationMaster[] = [
  {
    id: 'med-amox-500',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    persianName: 'کپسول آموکسی‌سیلین ۵۰۰ میلی‌گرم',
    defaultDosage: '500 mg',
    form: 'کپسول',
    defaultUnit: 'عدد',
    defaultQuantity: 20,
    defaultFrequency: 'هر ۸ ساعت (۳ بار در روز)',
    defaultDuration: '۷ روز',
    defaultInstructions: 'با یک لیوان کامل آب، رأس ساعت معین میل شود.',
    category: 'antibiotic',
    allergyTags: ['پنی‌سیلین', 'penicillin', 'بتالاکتام', 'beta-lactam'],
    contraindications: ['حساسیت شدید به پنی‌سیلین‌ها'],
  },
  {
    id: 'med-coamox-625',
    name: 'Co-Amoxiclav 625mg',
    genericName: 'Amoxicillin + Clavulanic Acid',
    persianName: 'قرص کوآموکسی‌کلاو ۶۲۵ میلی‌گرم',
    defaultDosage: '625 mg',
    form: 'قرص روکش‌دار',
    defaultUnit: 'عدد',
    defaultQuantity: 20,
    defaultFrequency: 'هر ۸ ساعت (۳ بار در روز)',
    defaultDuration: '۷ روز',
    defaultInstructions: 'در ابتدای وعده غذایی مصرف شود تا از عوارض گوارشی کاسته شود.',
    category: 'antibiotic',
    allergyTags: ['پنی‌سیلین', 'penicillin', 'کوآموکسی‌کلاو', 'بتالاکتام'],
    contraindications: ['سابقه زردی یا نارسایی کبدی ناشی از کوآموکسی‌کلاو', 'حساسیت به پنی‌سیلین'],
  },
  {
    id: 'med-metro-250',
    name: 'Metronidazole 250mg',
    genericName: 'Metronidazole',
    persianName: 'قرص مترونیدازول ۲۵۰ میلی‌گرم',
    defaultDosage: '250 mg',
    form: 'قرص',
    defaultUnit: 'عدد',
    defaultQuantity: 30,
    defaultFrequency: 'هر ۸ ساعت (۳ بار در روز)',
    defaultDuration: '۷ روز',
    defaultInstructions: 'همراه یا بعد از غذا میل شود. از مصرف همزمان الکل خودداری شود.',
    category: 'antibiotic',
    allergyTags: ['مترونیدازول', 'metronidazole'],
    contraindications: ['سه ماهه اول بارداری', 'اختلالات عصبی فعال'],
  },
  {
    id: 'med-clinda-300',
    name: 'Clindamycin 300mg',
    genericName: 'Clindamycin',
    persianName: 'کپسول کلیندامایسین ۳۰۰ میلی‌گرم',
    defaultDosage: '300 mg',
    form: 'کپسول',
    defaultUnit: 'عدد',
    defaultQuantity: 16,
    defaultFrequency: 'هر ۶ ساعت (۴ بار در روز)',
    defaultDuration: '۵ الی ۷ روز',
    defaultInstructions: 'با یک لیوان بزرگ آب میل شود و تا ۳۰ دقیقه پس از مصرف دراز نکشید.',
    category: 'antibiotic',
    allergyTags: ['کلیندامایسین', 'clindamycin', 'لینکوزامید'],
    contraindications: ['سابقه کولیت اولسراتیو یا اسهال ناشی از آنتی‌بیوتیک'],
  },
  {
    id: 'med-gelofen-400',
    name: 'Gelofen (Ibuprofen) 400mg',
    genericName: 'Ibuprofen',
    persianName: 'کپسول ژلاتینی ژلوفن ۴۰۰ میلی‌گرم',
    defaultDosage: '400 mg',
    form: 'کپسول ژلاتینی نرم',
    defaultUnit: 'عدد',
    defaultQuantity: 20,
    defaultFrequency: 'هر ۶ الی ۸ ساعت در صورت احساس درد',
    defaultDuration: '۳ الی ۵ روز',
    defaultInstructions: 'ترجیحاً بعد از وعده غذایی یا همراه با شیر میل شود.',
    category: 'analgesic',
    allergyTags: ['nsaid', 'بروفن', 'ژلوفن', 'آسپرین', 'ایبوپروفن', 'ibuprofen'],
    contraindications: ['زخم فعال معده یا دوازدهه', 'نارسایی شدید قلبی یا کلیوی', 'آسم حساس به آسپرین'],
  },
  {
    id: 'med-naprox-500',
    name: 'Naproxen 500mg',
    genericName: 'Naproxen',
    persianName: 'قرص ناپروکسن ۵۰۰ میلی‌گرم',
    defaultDosage: '500 mg',
    form: 'قرص',
    defaultUnit: 'عدد',
    defaultQuantity: 14,
    defaultFrequency: 'هر ۱۲ ساعت (۲ بار در روز)',
    defaultDuration: '۵ روز',
    defaultInstructions: 'بعد از غذا همراه با آب فراوان میل شود.',
    category: 'analgesic',
    allergyTags: ['nsaid', 'ناپروکسن', 'naproxen', 'آسپرین'],
    contraindications: ['خونریزی گوارشی', 'نارسایی کلیوی شدید'],
  },
  {
    id: 'med-acetam-codeine',
    name: 'Acetaminophen Codeine 300/10mg',
    genericName: 'Acetaminophen + Codeine',
    persianName: 'قرص استامینوفن کدئین ۳۰۰/۱۰ میلی‌گرم',
    defaultDosage: '300/10 mg',
    form: 'قرص',
    defaultUnit: 'عدد',
    defaultQuantity: 20,
    defaultFrequency: 'هر ۶ الی ۸ ساعت در صورت درد شدید',
    defaultDuration: '۳ روز',
    defaultInstructions: 'در هنگام درد مصرف شود. ممکن است باعث خواب‌آلودگی گردد.',
    category: 'analgesic',
    allergyTags: ['استامینوفن', 'کدئین', 'codeine', 'acetaminophen'],
    contraindications: ['نارسایی شدید تنفسی', 'بیماری حاد کبدی'],
  },
  {
    id: 'med-novafen',
    name: 'Novafen (Acetaminophen+Ibuprofen+Caffeine)',
    genericName: 'Novafen Compound',
    persianName: 'کپسول نووفن (ترکیبی ضددرد قوی)',
    defaultDosage: 'Capsule',
    form: 'کپسول',
    defaultUnit: 'عدد',
    defaultQuantity: 20,
    defaultFrequency: 'هر ۸ ساعت در صورت درد شدید',
    defaultDuration: '۳ الی ۵ روز',
    defaultInstructions: 'همراه با غذا یا یک لیوان آب میل شود.',
    category: 'analgesic',
    allergyTags: ['nsaid', 'ایبوپروفن', 'استامینوفن', 'کافئین'],
    contraindications: ['زخم معده', 'فشار خون کنترل‌نشده'],
  },
  {
    id: 'med-mefenamic-250',
    name: 'Mefenamic Acid 250mg',
    genericName: 'Mefenamic Acid',
    persianName: 'کپسول مفنامیک اسید ۲۵۰ میلی‌گرم',
    defaultDosage: '250 mg',
    form: 'کپسول',
    defaultUnit: 'عدد',
    defaultQuantity: 20,
    defaultFrequency: 'هر ۶ الی ۸ ساعت',
    defaultDuration: '۴ روز',
    defaultInstructions: 'همراه غذا مصرف شود.',
    category: 'analgesic',
    allergyTags: ['nsaid', 'مفنامیک', 'mefenamic acid'],
    contraindications: ['زخم گوارشی فعال'],
  },
  {
    id: 'med-dexa-amp',
    name: 'Dexamethasone 8mg/2ml Ampoule',
    genericName: 'Dexamethasone Sodium Phosphate',
    persianName: 'آمپول دگزامتازون ۸ میلی‌گرم',
    defaultDosage: '8 mg/2ml',
    form: 'آمپول عضلانی',
    defaultUnit: 'ویال',
    defaultQuantity: 1,
    defaultFrequency: 'یک نوبت عضلانی بلافاصله پس از جراحی',
    defaultDuration: 'تک دوز',
    defaultInstructions: 'تزریق عضلانی عمیق جهت کنترل ادم و التهاب پس از جراحی سنگین فک.',
    category: 'corticosteroid',
    allergyTags: ['کورتیکواستروئید', 'دگزامتازون', 'dexamethasone'],
    contraindications: ['عفونت‌های قارچی سیستمیک', 'دیابت کنترل‌نشده شدید'],
  },
  {
    id: 'med-chx-02',
    name: 'Chlorhexidine 0.2% Mouthwash',
    genericName: 'Chlorhexidine Gluconate',
    persianName: 'دهان‌شویه کلرهگزیدین ۰.۲ درصد',
    defaultDosage: '0.2%',
    form: 'دهان‌شویه',
    defaultUnit: 'بطری',
    defaultQuantity: 1,
    defaultFrequency: 'روزی ۲ بار (صبح و شب بعد مسواک)',
    defaultDuration: '۷ الی ۱۰ روز',
    defaultInstructions: '۱۵ میلی‌لیتر را به مدت ۱ دقیقه در دهان قرقره نموده و بیرون بریزید. تا ۳۰ دقیقه بعد چیزی نخورید.',
    category: 'mouthwash',
    allergyTags: ['کلرهگزیدین', 'chlorhexidine'],
    contraindications: ['کودکان زیر ۶ سال'],
  },
  {
    id: 'med-persica-drop',
    name: 'Persica Herbal Drop',
    genericName: 'Persica Herbal Extract',
    persianName: 'قطره گیاهی پرسیکا',
    defaultDosage: 'Drop',
    form: 'قطره دهانی',
    defaultUnit: 'بطری',
    defaultQuantity: 1,
    defaultFrequency: 'روزی ۳ بار (هر بار ۱۰ تا ۱۵ قطره در آب)',
    defaultDuration: '۱۰ روز',
    defaultInstructions: 'در یک استکان آب ولرم حل کرده و دهان را شستشو دهید.',
    category: 'mouthwash',
    allergyTags: ['گیاهی', 'پرسیکا'],
    contraindications: ['حساسیت به نعناع یا بومادران'],
  },
  {
    id: 'med-ped-amox-susp',
    name: 'Amoxicillin 250mg/5ml Susp.',
    genericName: 'Amoxicillin Suspension',
    persianName: 'سوسپانسیون آموکسی‌سیلین ۲۵۰ میلی‌گرم (کودکان)',
    defaultDosage: '250mg/5ml',
    form: 'سوسپانسیون خوراکی',
    defaultUnit: 'شیشه',
    defaultQuantity: 1,
    defaultFrequency: 'هر ۸ ساعت ۵ میلی‌لیتر (۱ پیمانه)',
    defaultDuration: '۷ روز',
    defaultInstructions: 'قبل از هر بار مصرف شیشه را خوب تکان دهید. در یخچال نگهداری شود.',
    category: 'pediatric',
    allergyTags: ['پنی‌سیلین', 'penicillin'],
    contraindications: ['آلرژی شناخته‌شده به پنی‌سیلین'],
  },
  {
    id: 'med-ped-acetam-syrup',
    name: 'Acetaminophen 120mg/5ml Syrup',
    genericName: 'Acetaminophen Syrup',
    persianName: 'شربت استامینوفن ۱۲۰ میلی‌گرم کودکان',
    defaultDosage: '120mg/5ml',
    form: 'شربت',
    defaultUnit: 'شیشه',
    defaultQuantity: 1,
    defaultFrequency: 'هر ۶ ساعت بر حسب وزن کودک',
    defaultDuration: '۳ روز در صورت تب یا درد',
    defaultInstructions: 'با پیمانه مخصوص مدرج مصرف شود.',
    category: 'pediatric',
    allergyTags: ['استامینوفن', 'acetaminophen'],
    contraindications: ['نارسایی شدید کبدی'],
  },
  {
    id: 'med-ped-ibu-syrup',
    name: 'Ibuprofen 100mg/5ml Pediatric Syrup',
    genericName: 'Ibuprofen Suspension',
    persianName: 'سوسپانسیون ایبوپروفن ۱۰۰ میلی‌گرم کودکان',
    defaultDosage: '100mg/5ml',
    form: 'سوسپانسیون',
    defaultUnit: 'شیشه',
    defaultQuantity: 1,
    defaultFrequency: 'هر ۸ ساعت همراه با غذا',
    defaultDuration: '۳ روز',
    defaultInstructions: 'همراه با شیر یا غذا به کودک داده شود.',
    category: 'pediatric',
    allergyTags: ['nsaid', 'ایبوپروفن', 'بروفن'],
    contraindications: ['خونریزی گوارشی', 'آسم شدید'],
  },
];

export interface PrescriptionTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  category: 'surgery' | 'endo' | 'perio' | 'acute_pain' | 'pediatric' | 'implant';
  items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[];
}

export const DENTAL_PRESCRIPTION_TEMPLATES: PrescriptionTemplate[] = [
  {
    id: 'tpl-wisdom-surgery',
    name: 'پکیج جراحی دندان عقل و کشیدن دندان',
    description: 'شامل آنتی‌بیوتیک سیستمیک، مسکن قوی ضدالتهاب و دهان‌شویه ضدعفونی‌کننده',
    badge: 'جراحی و کشیدن',
    category: 'surgery',
    items: [
      {
        medicationId: 'med-amox-500',
        medicationName: 'کپسول آموکسی‌سیلین ۵۰۰ میلی‌گرم (Amoxicillin 500)',
        dosage: '500 mg',
        form: 'کپسول',
        quantity: 20,
        unit: 'عدد',
        frequency: 'هر ۸ ساعت (۳ بار در روز)',
        duration: '۷ روز کامل',
        instructions: 'با یک لیوان کامل آب، رأس ساعت مقرر میل شود.',
        notes: 'تا اتمام کامل دوره دارویی مصرف ادامه یابد.',
      },
      {
        medicationId: 'med-gelofen-400',
        medicationName: 'کپسول ژلاتینی ژلوفن ۴۰۰ میلی‌گرم (Gelofen 400)',
        dosage: '400 mg',
        form: 'کپسول ژلاتینی نرم',
        quantity: 20,
        unit: 'عدد',
        frequency: 'هر ۶ الی ۸ ساعت در صورت درد',
        duration: '۴ روز',
        instructions: 'حتماً بعد از وعده غذایی میل شود.',
        notes: 'در صورت سوزش معده همراه با آنتی‌اسید مصرف شود.',
      },
      {
        medicationId: 'med-chx-02',
        medicationName: 'دهان‌شویه کلرهگزیدین ۰.۲ درصد (CHX 0.2%)',
        dosage: '0.2%',
        form: 'دهان‌شویه',
        quantity: 1,
        unit: 'بطری',
        frequency: 'روزی ۲ بار (صبح و شب)',
        duration: '۷ روز (از ۲۴ ساعت پس از جراحی)',
        instructions: '۱۵ سی‌سی را به مدت ۱ دقیقه غرغره و تخلیه نمایید. تا ۳۰ دقیقه چیزی نخورید.',
        notes: 'شستشو با ملایمت و بدون مکش شدید انجام گیرد.',
      },
    ],
  },
  {
    id: 'tpl-endo-relief',
    name: 'پکیج پس از عصب‌کشی و درمان ریشه (Endo)',
    description: 'تسکین سریع دردهای ضربان‌دار پری‌آپیکال و مهار التهاب لیگامان پریودنتال',
    badge: 'درمان ریشه (اندو)',
    category: 'endo',
    items: [
      {
        medicationId: 'med-gelofen-400',
        medicationName: 'کپسول ژلاتینی ژلوفن ۴۰۰ میلی‌گرم (Gelofen 400)',
        dosage: '400 mg',
        form: 'کپسول ژلاتینی نرم',
        quantity: 15,
        unit: 'عدد',
        frequency: 'هر ۶ ساعت در صورت احساس درد',
        duration: '۳ روز',
        instructions: 'همراه یا بعد از غذا مصرف شود.',
        notes: 'جهت کنترل درد پس از پرکردن کانال',
      },
      {
        medicationId: 'med-acetam-codeine',
        medicationName: 'قرص استامینوفن کدئین ۳۰۰/۱۰ میلی‌گرم',
        dosage: '300/10 mg',
        form: 'قرص',
        quantity: 10,
        unit: 'عدد',
        frequency: 'هر ۸ ساعت در صورت بروز درد شدید ضربان‌دار',
        duration: '۲ الی ۳ روز',
        instructions: 'در صورت عدم پاسخ به ژلوفن، با فاصله ۲ ساعت قابل مصرف است.',
        notes: 'در هنگام رانندگی احتیاط شود.',
      },
    ],
  },
  {
    id: 'tpl-perio-infection',
    name: 'پکیج عفونت لثه و بیماری‌های پریودنتال (پریو)',
    description: 'درمان توام بی‌هوازی و هوازی آبسه‌های پریودنتال و عفونت‌های حاد بافت همبند',
    badge: 'پریودنتال و لثه',
    category: 'perio',
    items: [
      {
        medicationId: 'med-amox-500',
        medicationName: 'کپسول آموکسی‌سیلین ۵۰۰ میلی‌گرم (Amoxicillin 500)',
        dosage: '500 mg',
        form: 'کپسول',
        quantity: 20,
        unit: 'عدد',
        frequency: 'هر ۸ ساعت',
        duration: '۷ روز',
        instructions: 'راس ساعت و با آب فراوان مصرف شود.',
      },
      {
        medicationId: 'med-metro-250',
        medicationName: 'قرص مترونیدازول ۲۵۰ میلی‌گرم (Metronidazole 250)',
        dosage: '250 mg',
        form: 'قرص',
        quantity: 30,
        unit: 'عدد',
        frequency: 'هر ۸ ساعت همراه با آموکسی‌سیلین',
        duration: '۷ روز',
        instructions: 'همراه با غذا میل شود. از نوشیدن الکل اکیداً پرهیز شود.',
        notes: 'پوشش باکتری‌های بی‌هوازی شیار لثه',
      },
      {
        medicationId: 'med-persica-drop',
        medicationName: 'قطره گیاهی پرسیکا (Persica Drop)',
        dosage: 'Drop',
        form: 'قطره دهانی',
        quantity: 1,
        unit: 'بطری',
        frequency: 'روزی ۳ بار (هر بار ۱۰ قطره در یک استکان آب)',
        duration: '۱۰ روز',
        instructions: 'شستشوی دهان و ماساژ لثه‌ها پس از هر بار مسواک زدن',
      },
    ],
  },
  {
    id: 'tpl-acute-pain',
    name: 'پکیج تسکین دردهای حاد دندانی (Acute Pain)',
    description: 'ترکیب ضددرد و ضدالتهاب سریع‌الاثر برای کنترل پالپیت حاد و دردهای شبانه',
    badge: 'درد حاد و اورژانس',
    category: 'acute_pain',
    items: [
      {
        medicationId: 'med-naprox-500',
        medicationName: 'قرص ناپروکسن ۵۰۰ میلی‌گرم (Naproxen 500)',
        dosage: '500 mg',
        form: 'قرص',
        quantity: 10,
        unit: 'عدد',
        frequency: 'هر ۱۲ ساعت (۲ بار در روز)',
        duration: '۳ الی ۵ روز',
        instructions: 'همراه غذا و یک لیوان کامل آب میل گردد.',
        notes: 'اثر ضدالتهابی طولانی‌مدت جهت آرامش خواب شبانه',
      },
      {
        medicationId: 'med-novafen',
        medicationName: 'کپسول نووفن (Novafen Compound)',
        dosage: 'Capsule',
        form: 'کپسول',
        quantity: 15,
        unit: 'عدد',
        frequency: 'هر ۸ ساعت در صورت بروز دردهای ناگهانی',
        duration: '۳ روز',
        instructions: 'با معده پر میل شود.',
      },
    ],
  },
  {
    id: 'tpl-pediatric',
    name: 'پکیج دندان‌پزشکی کودکان و اطفال',
    description: 'فرمولاسیون متناسب با سن و وزن کودکان با طعم مطبوع میوه‌ای و تحمل گوارشی بالا',
    badge: 'اطفال و کودکان',
    category: 'pediatric',
    items: [
      {
        medicationId: 'med-ped-amox-susp',
        medicationName: 'سوسپانسیون آموکسی‌سیلین ۲۵۰ میلی‌گرم/۵ سی‌سی',
        dosage: '250mg/5ml',
        form: 'سوسپانسیون خوراکی',
        quantity: 1,
        unit: 'شیشه',
        frequency: 'هر ۸ ساعت ۵ سی‌سی (۱ پیمانه کامل)',
        duration: '۷ روز',
        instructions: 'قبل از مصرف شیشه را خوب تکان دهید. در یخچال نگهداری شود.',
      },
      {
        medicationId: 'med-ped-acetam-syrup',
        medicationName: 'شربت استامینوفن ۱۲۰ میلی‌گرم/۵ سی‌سی کودکان',
        dosage: '120mg/5ml',
        form: 'شربت',
        quantity: 1,
        unit: 'شیشه',
        frequency: 'هر ۶ ساعت در صورت درد یا تب',
        duration: '۳ روز',
        instructions: 'بر اساس دوز تجویزی پزشک به کودک خورانده شود.',
      },
    ],
  },
];

/**
 * Check for allergy warnings between patient's documented allergies and proposed prescription items
 */
export function checkPrescriptionAllergies(
  patientAllergies: string[] = [],
  items: PrescriptionItem[] = []
): string[] {
  const warnings: string[] = [];
  if (!patientAllergies || patientAllergies.length === 0 || !items || items.length === 0) {
    return warnings;
  }

  const normalizedPatientAllergies = patientAllergies.map((a) => a.toLowerCase().trim());

  items.forEach((item) => {
    const medMaster = DENTAL_MEDICATIONS_DB.find(
      (m) => m.id === item.medicationId || m.name.toLowerCase().includes(item.medicationName.toLowerCase()) || item.medicationName.toLowerCase().includes(m.name.toLowerCase())
    );

    const checkTags = medMaster
      ? medMaster.allergyTags
      : [item.medicationName.toLowerCase()];

    normalizedPatientAllergies.forEach((allergy) => {
      // Check Penicillin family
      if (
        (allergy.includes('پنی') || allergy.includes('penicillin') || allergy.includes('آمپی') || allergy.includes('آموکسی')) &&
        (item.medicationName.includes('آموکسی') || item.medicationName.toLowerCase().includes('amox') || item.medicationName.includes('کوآموکسی') || item.medicationName.toLowerCase().includes('clav'))
      ) {
        warnings.push(`⚠️ هشدار حساسیت دارویی شدید: بیمار به «${allergy}» حساسیت دارد و داروی «${item.medicationName}» از خانواده بتالاکتام/پنی‌سیلین است.`);
      }

      // Check NSAID / Aspirin family
      if (
        (allergy.includes('nsaid') || allergy.includes('بروفن') || allergy.includes('ژلوفن') || allergy.includes('آسپرین') || allergy.includes('ناپروکسن')) &&
        (item.medicationName.includes('ژلوفن') || item.medicationName.includes('ایبوپروفن') || item.medicationName.includes('ناپروکسن') || item.medicationName.includes('مفنامیک') || item.medicationName.includes('نووفن'))
      ) {
        warnings.push(`⚠️ هشدار منع مصرف NSAID: سابقه حساسیت یا مشکل گوارشی با «${allergy}» برای داروی «${item.medicationName}» وجود دارد.`);
      }

      // Direct tag match
      checkTags.forEach((tag) => {
        if (allergy.includes(tag.toLowerCase()) || tag.toLowerCase().includes(allergy)) {
          const warningMsg = `⚠️ هشدار حساسیت تایید شده: تطابق برچسب دارویی «${tag}» با سابقه حساسیت «${allergy}» در پرونده بیمار.`;
          if (!warnings.includes(warningMsg)) {
            warnings.push(warningMsg);
          }
        }
      });
    });
  });

  return Array.from(new Set(warnings));
}

/**
 * Mock Service API to submit electronic prescription to National Health Insurance Electronic Portal (SEPAS / Tamin / Salamat)
 */
export async function submitElectronicPrescriptionMock(
  prescriptionData: Omit<ElectronicPrescription, 'id' | 'trackingCode' | 'status' | 'createdAt' | 'submittedAt' | 'externalPrescriptionId'>
): Promise<{
  success: boolean;
  prescription: ElectronicPrescription;
  message: string;
}> {
  // Simulate network latency (400ms - 800ms)
  await new Promise((resolve) => setTimeout(resolve, 650));

  const rxId = `RX-${Date.now().toString().slice(-6)}`;
  const trackingCode = `IR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  const externalPrescriptionId = `SEPAS-${Math.floor(100000 + Math.random() * 900000)}-DENT`;
  const submittedAt = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

  const prescription: ElectronicPrescription = {
    ...prescriptionData,
    id: rxId,
    prescriptionNumber: rxId,
    trackingCode,
    externalPrescriptionId,
    status: 'accepted',
    createdAt: submittedAt,
    submittedAt,
  };

  return {
    success: true,
    prescription,
    message: `نسخه الکترونیک با موفقیت در سامانه بیمه‌گر سلامت ثبت و تایید شد. کد رهگیری: ${trackingCode}`,
  };
}
