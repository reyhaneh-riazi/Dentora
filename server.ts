import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK lazily / safely on server
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("کلید GEMINI_API_KEY در تنظیمات سیستم یافت نشد.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Dentora OS", time: new Date().toISOString() });
});

// Gemini Copilot API: Speech/Dictation to structured clinical data
app.post("/api/copilot/analyze-dictation", async (req, res) => {
  try {
    const { transcript, toothNumber } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "متن دیکته الزامی است." });
    }

    const ai = getGeminiClient();
    const prompt = `شما هوش مصنوعی دستیار دندان‌پزشک در سیستم دنتورا (Dentora) هستید.
متن دیکته صوتی دندان‌پزشک هنگام معاینه:
"${transcript}"
دندان انتخاب‌شده: ${toothNumber || "مشخص‌نشده"}

لطفاً خروجی ساختاریافته به فرمت JSON زیر ارائه دهید:
{
  "toothNumber": number or null,
  "surface": string (مثلاً "Mesial", "Occlusal", "Distal", "Buccal", "Lingual" یا "Root" یا "ALL"),
  "problem": string (پوسیدگی، شکستگی، ضایعه پری‌آپیکال، نیاز به عصب‌کشی، پلاک و ...),
  "treatmentSuggested": string (ترمیم کامپوزیت، عصب‌کشی RCT، روکش زيرکونيا، ایمپلنت و ...),
  "prescriptionDraft": array of string (داروهای پیشنهادی مثل آموکسی‌سیلین 500، ژلوفن 400، کلرهگزیدین),
  "insuranceNarrative": string (شرح بالینی استاندارد برای بیمه شامل علت درمان و ضرورت طبابت),
  "requiredInsuranceDocs": array of string (مدارک و شواهد لازم بیمه مثل عکس رادیوگرافی پری‌آپیکال قبل/بعد، فاکتور معتبر، عکس فتوگرافی)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in analyze-dictation:", error);
    res.status(500).json({
      error: error.message || "خطا در پردازش هوش مصنوعی",
    });
  }
});

// Gemini Copilot API: Answer dentist's clinical question
app.post("/api/copilot/ask-clinical", async (req, res) => {
  try {
    const { question, patientContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: "پرسش بالینی الزامی است." });
    }

    const ai = getGeminiClient();
    const prompt = `شما دستیار هوشمند بالینی دنتورا (Dentora Copilot) هستید.
اطلاعات بیمار:
${JSON.stringify(patientContext || {}, null, 2)}

سوال دندان‌پزشک:
"${question}"

پاسخ کوتاه، علمی، مبتنی بر دستورالعمل‌های دندان‌پزشکی و با لحن حرفه‌ای و فارسی ارائه دهید. در انتها تاکید کنید که تصمیم نهایی با دندان‌پزشک معالج است.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error("Error in ask-clinical:", error);
    res.status(500).json({ error: error.message || "خطا در ارتباط با هوش مصنوعی" });
  }
});

// Gemini Copilot API: Generate Insurance Narrative
app.post("/api/copilot/generate-narrative", async (req, res) => {
  try {
    const { toothNumber, treatmentName, clinicalNotes, patientAge } = req.body;
    const ai = getGeminiClient();

    const prompt = `به عنوان سیستم پاک‌ساز ادعای دنتورا، یک شرح بالینی رسمی و استاندارد برای ارسال به سازمان بیمه‌گر (تکمیلی/پایه) جهت تایید درمان دندان‌پزشکی بنویسید.
شماره دندان: ${toothNumber}
عنوان درمان: ${treatmentName}
ملاحظات بالینی: ${clinicalNotes}
سن بیمار: ${patientAge || 35}

شرح بیمه باید کوتاه، مستدل، حاوی اصطلاحات استاندارد دندان‌پزشکی و منطبق بر ضوابط تعرفه باشد.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ success: true, narrative: response.text });
  } catch (error: any) {
    console.error("Error in generate-narrative:", error);
    res.status(500).json({ error: error.message || "خطا در تولید شرح بیمه" });
  }
});

// Gemini Copilot API: Triage Patient Question (P7)
app.post("/api/copilot/triage-patient", async (req, res) => {
  try {
    const { questionText } = req.body;
    const ai = getGeminiClient();

    const prompt = `سوال بیمار در پورتال ارتباطی کلینیک دندان‌پزشکی:
"${questionText}"

لطفاً بررسی کنید:
1. آیا نیازمند ارجاع فوری یا ویزیت اضطراری است؟ (خونریزی شدید، تورم چشم/صورت، درد غیرقابل کنترل، بلع مشکل)
2. دسته‌بندی سوال (نوبت‌دهی، مراقبت پس از درمان، مالی/اقساط، بیمه، سوال بالینی عمومی)
3. پیشنهاد پاسخ اولیه برای منشی یا بیمار.

خروجی به‌صورت JSON:
{
  "urgent": boolean,
  "category": string,
  "suggestedReply": string,
  "actionRequired": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({ success: true, triage: JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.error("Error in triage-patient:", error);
    res.status(500).json({ error: error.message || "خطا در تریاژ سوال بیمار" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dentora Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
