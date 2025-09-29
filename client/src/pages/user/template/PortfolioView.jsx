import React, { useEffect, useMemo, useState } from "react";
import {
  File as FileIcon,
  Download,
  Printer,
  User,
  Briefcase,
  Users,
  Zap,
  Eye,
  Image as ImageIcon,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  ExternalLink,
  Palette,
  ArrowLeft,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { getPortfolioData } from "../../../services/getPortfolioDataApi";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
// Template Components
import Template1 from "@/components/portfolio/backgrounds/Template1";
import Template2 from "@/components/portfolio/backgrounds/Template2";
import Template3 from "@/components/portfolio/backgrounds/Template3";
import ToggleSwitch from "@/components/portfolio/backgrounds/ToggleSwitch";

export default function PortfolioView({ userId: propUserId }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const navigate = useNavigate();
  const goBack = () => navigate("/public-relations");
  const [printDebug, setPrintDebug] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("debug-print", printDebug);
    return () => document.body.classList.remove("debug-print");
  }, [printDebug]);
  // Helper functions
  const toAbsUrl = (p) => {
    if (!p) return "";
    const s = String(p);
    const abs = s.startsWith("http")
      ? s
      : `${API_BASE}${s.startsWith("/") ? s : `/${s}`}`;
    const alreadyEncoded = /%[0-9A-Fa-f]{2}/.test(abs);
    if (!alreadyEncoded && /[^\x20-\x7E]/.test(abs)) return encodeURI(abs);
    return abs;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  // Template id from previous page / query / storage
  const location = useLocation();
  const [params] = useSearchParams();
  const templateId =
    location.state?.templateId ||
    params.get("tpl") ||
    localStorage.getItem("portfolio.tpl") ||
    "template1";

  // userId from token
  const userIdFromToken = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded?.id ?? null;
    } catch {
      return null;
    }
  }, []);
  const userId = propUserId ?? userIdFromToken;

  // State management
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templateId);
  const [showSection, setShowSection] = useState({
    personal: true,
    works: true,
    activities: true,
    sports: true,
  });

  // Load data from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) {
        setErr("ไม่พบผู้ใช้");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getPortfolioData(userId);
        const payload = res?.data?.data ?? res?.data ?? res;
        if (!mounted) return;
        setData(payload || null);
        setErr("");
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || "โหลดข้อมูลล้มเหลว");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // CSS เดียวใช้ทั้งหน้า และ inject ใน popup
// PortfolioView.jsx

const PRINT_CSS = `
@media print {
/* ——— PRINT helpers for the Dark Modern page ——— */
#portfolio-print-area .print-section{
  /* กันเนื้อหาชนขอบกระดาษ */
  padding-top:14mm !important;
  padding-bottom:14mm !important;
  padding-left:12mm !important;
  padding-right:12mm !important;
}

/* บังคับคอลัมน์ตอนพิมพ์ให้เท่าหน้าเว็บ */
.print-cols-2{
  display:grid !important;
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  gap:2rem !important;
}
.print-cols-3{
  display:grid !important;
  grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  gap:2rem !important;
}

/* ทำพื้นเข้ม/เส้นขอบให้ทึบตอนพิมพ์ (เลี่ยงซีด/โปร่ง) */
.print-solid-800{ background:#1f2937 !important; }   /* เทียบ tailwind gray-800 */
.print-card-border{ border-color:#374151 !important; }/* เทียบ tailwind gray-700 */

/* ลดเอฟเฟกต์ที่เพี้ยนบน PDF */
*[class*="shadow"]{ box-shadow:none !important; }
*{ animation:none !important; transition:none !important; }

/* กันโดนตัดครึ่ง */
.print-avoid-break,
.no-break-inside,
figure,
img{ break-inside:avoid; page-break-inside:avoid; }

/* ให้สีตรงกับหน้าจอ */
html,body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }



@media print {
  .file-chip a { display: none !important; }
}

  #portfolio-print-area .page-break{
    break-before: page !important;
    page-break-before: always !important;
    height:0; margin:0; border:0; padding:0;
  }

  /* ยูทิลิตี้ช่วยกันโดนตัดครึ่ง */
  #portfolio-print-area .print\:break-inside-avoid{
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  #portfolio-print-area .print-cover{
    /* กรณีเบราว์เซอร์คิด 1vh = ความสูงหน้ากระดาษ */
    height: 90vh !important;
    min-height: 90vh !important;
    
    box-sizing: border-box;
    
    overflow: hidden; /* กันส่วนเกินผลักไปหน้าใหม่ */
  }


  /* ลดระยะห่าง/ขนาดตัวอักษรเฉพาะหน้าปกตอนพิมพ์ให้พอดีหน้า */
  #portfolio-print-area .print-cover h1{
    font-size: 42pt !important;
    line-height: 1.05 !important;
    margin: 0 0 6mm !important;
  }
  #portfolio-print-area .print-cover .w-24.h-1{
    margin: 0 auto 5mm !important;
  }
  #portfolio-print-area .print-cover h2{
    font-size: 26pt !important;
    margin: 0 0 3mm !important;
  }
  #portfolio-print-area .print-cover h3{
    font-size: 14pt !important;
    margin: 0 0 4mm !important;
  }
  #portfolio-print-area .print-cover p{
    margin: 0 0 3mm !important;
  }

  /* กันส่วนตกแต่ง absolute ไม่ให้ผลักเนื้อหา */
  #portfolio-print-area .print-cover [class*="absolute"]{
    pointer-events: none;
  }
  #portfolio-print-area .preface-grid{
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 2rem !important;          /* ปรับได้ตามต้องการ */
  }
  #portfolio-print-area .preface-grid > *{
    break-inside: avoid; page-break-inside: avoid;
  }
  
  /* ให้สี/กราเดียนต์อยู่ครบ */
  html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .screen-only { display: none !important; }
  .print-only  { display: block !important; }


  #portfolio-print-area .print-cover   { break-after: page; page-break-after: always;  padding-top: 10mm !important;  }
  #portfolio-print-area .print-section { break-before: page; page-break-before: always;  padding-top: 10mm !important;  padding: 14mm 12mm 12mm !important;}

  #portfolio-print-area .print-cover + .print-section {
    break-before: auto !important; page-break-before: auto !important;  padding-top: 10mm !important;
  }

  /* ให้กริดที่ opt-in ไหลยาว (เพื่อให้ break ทำงาน) */
  #portfolio-print-area .print-flow { display: block !important; }
  #portfolio-print-area .print-flow [class*="col-span"] {
    display: block !important; width: 100% !important;
  }


  #portfolio-print-area .no-break-inside,
  #portfolio-print-area figure,
  #portfolio-print-area img,
  #portfolio-print-area table { break-inside: avoid; page-break-inside: avoid; }

  #portfolio-print-area [class*="shadow"] { box-shadow: none !important; }


  #portfolio-print-area .personal-cards{
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 1.5rem !important;
  }


  @page { size: A4; margin: -5mm !important;  }
  #portfolio-print-area { margin: 0 !important; padding: 0 !important; }

  /* ---------- DEBUG PAGE BREAK GUIDES ---------- */
  body.debug-print #portfolio-print-area .print-section::before {
    content: "— PAGE BREAK —";
    display: block;
    margin: 4mm 0;
    border-bottom: 1px dashed #FF3366;
    text-align: center;
    color: #FF3366;
    font-size: 10pt;
    opacity: .9;
  }
  /* ซ่อนเส้นของ “ส่วนแรกหลังปก” */
  body.debug-print #portfolio-print-area .print-cover + .print-section::before {
    content: none !important; display: none !important;
  }

  /* เส้นขอบบน/ล่างของทุกหน้า (ช่วยมองขอบกระดาษ) */
  body.debug-print::before,
  body.debug-print::after {
    content: "";
    position: fixed;
    left: 0; right: 0; height: 0;
    border-top: 1px dashed #FF3366;
    z-index: 2147483647;
  }
  body.debug-print::before { top: 0; }
  body.debug-print::after  { bottom: 0; }
}

/* ใช้ได้ทั้งจอและตอนพิมพ์: ชิปชื่อไฟล์ไม่ล้น */
#portfolio-print-area .file-chip{
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}




/* 1) ยกเลิกการบังคับ break หลังบล็อคสุดท้าย */
#portfolio-print-area .print-cover:last-of-type,
#portfolio-print-area .print-section:last-of-type {
  break-after: auto !important;
  page-break-after: auto !important;   /* fallback */
}

/* ถ้ามี <hr class="page-break"> หรือ marker อื่น ๆ อย่าให้ตัวสุดท้ายทำงาน */
#portfolio-print-area .page-break:last-child,
#portfolio-print-area .print-section:last-of-type > .page-break:last-child {
  display: none !important;
}

/* 2) กันโอเวอร์โฟลว์จิ๋ว ๆ ที่ทำให้เกิด ghost page */
#portfolio-print-area .print-section:last-of-type {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  border-bottom-width: 0 !important;
  box-shadow: none !important;
  transform: none !important;
}

/* 3) เซฟตี้: ตัดส่วนที่ล้นทั้งเอกสาร */
#portfolio-print-area { overflow: hidden !important; }
}




`;


  // Print functions
  const onPrint = () => window.print();

  const previewAsPDF = () => {
    const printable = document.querySelector("#portfolio-print-area");
    if (!printable) return;

    const css = [...document.querySelectorAll('link[rel="stylesheet"], style')]
      .map((n) => n.outerHTML)
      .join("\n");

    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Portfolio - PDF Preview</title>
          ${css}
          <style>${PRINT_CSS}</style>
        </head>
        <body>
          ${printable.outerHTML}
          <script>
            const imgs = Array.from(document.images || []);
            Promise.all(
              imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; }))
            ).then(() => { window.focus(); window.print(); });
          <\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Template mapping
  const templates = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
  };

  const CurrentTemplate = templates[selectedTemplate] || Template1;

  // Loading / Error
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        กรุณาเข้าสู่ระบบก่อน
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="h-6 w-52 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              <div className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
            </div>
            <div className="h-64 bg-white rounded-xl shadow-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-6">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for templates
  const {
    personalInfo: user = {},
    workExperiences: works = [],
    activities = [],
    sports = [],
  } = data || {};

  const portfolioData = {
    personalInfo: user,
    workExperiences: works,
    activities,
    sports,
  };

  return (
    <div className="min-h-screen bg-slate-50/60 print:bg-white font-['Sarabun',sans-serif]">
      {/* Top bar (hidden on print) */}
      <div className="print:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3">
          <button
            onClick={goBack}
            className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5
                       bg-slate-100 hover:bg-slate-200 active:scale-[.98] transition-all
                       text-slate-700 hover:text-slate-900 font-medium shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
            <span>กลับไปหน้า Public Relations</span>
          </button>
        </div>
      </div>

      {/* Right tools (hidden on print) */}
      <div className="fixed top-20 right-4 md:right-6 z-50 print:hidden">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/70 p-4 w-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-slate-900">เลือกเทมเพลต</span>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-4">
            <button
              onClick={() => setSelectedTemplate("template1")}
              className={`p-3 rounded-lg text-sm font-medium transition-all ring-1 ${
                selectedTemplate === "template1"
                  ? "bg-blue-600 text-white ring-transparent shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 ring-slate-200"
              }`}
            >
              Professional Blue
            </button>
            <button
              onClick={() => setSelectedTemplate("template2")}
              className={`p-3 rounded-lg text-sm font-medium transition-all ring-1 ${
                selectedTemplate === "template2"
                  ? "bg-slate-800 text-white ring-transparent shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 ring-slate-200"
              }`}
            >
              Dark Modern
            </button>
            <button
              onClick={() => setSelectedTemplate("template3")}
              className={`p-3 rounded-lg text-sm font-medium transition-all ring-1 ${
                selectedTemplate === "template3"
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ring-transparent shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 ring-slate-200"
              }`}
            >
              Creative Gradient
            </button>
          </div>

          {/* Section Toggles */}
          <div className="border-t border-slate-200/70 pt-3 mb-4">
            <p className="text-xs font-semibold text-slate-600 mb-3">แสดง/ซ่อนส่วน</p>
            <div className="space-y-2.5">
              <ToggleSwitch
                label="ข้อมูลส่วนตัว"
                checked={!!showSection.personal}
                onChange={(checked) =>
                  setShowSection((prev) => ({ ...prev, personal: checked }))
                }
              />
              <ToggleSwitch
                label="ประสบการณ์"
                checked={!!showSection.works}
                onChange={(checked) =>
                  setShowSection((prev) => ({ ...prev, works: checked }))
                }
              />
              <ToggleSwitch
                label="กิจกรรม"
                checked={!!showSection.activities}
                onChange={(checked) =>
                  setShowSection((prev) => ({ ...prev, activities: checked }))
                }
              />
              <ToggleSwitch
                label="กีฬา"
                checked={!!showSection.sports}
                onChange={(checked) =>
                  setShowSection((prev) => ({ ...prev, sports: checked }))
                }
              />
            </div>

          </div>

          {/* Print Buttons */}
          <div className="space-y-2">
            <button
              onClick={previewAsPDF}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                         px-4 py-3 rounded-xl hover:bg-blue-700 active:scale-[.98] transition-all text-sm font-medium
                         shadow-lg hover:shadow-xl"
            >
              <Eye className="w-4 h-4" />
              ดูตัวอย่าง PDF
            </button>
            <button
              onClick={onPrint}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white
                         px-4 py-3 rounded-xl hover:bg-emerald-700 active:scale-[.98] transition-all text-sm font-medium
                         shadow-lg hover:shadow-xl"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ / บันทึก PDF
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-600">
  <input
    type="checkbox"
    checked={printDebug}
    onChange={(e) => setPrintDebug(e.target.checked)}
  />
  แสดงเส้นคั่นหน้า (debug)
</label>

          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/70">
            <p className="text-xs text-slate-500 text-center">
              💡 กด <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 font-mono">Ctrl+P</kbd> เพื่อพิมพ์ได้เลย
            </p>
          </div>
        </div>
      </div>

      {/* เนื้อหา Portfolio */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6 md:py-8">
        <div
          id="portfolio-print-area"
          className="
    bg-white md:rounded-2xl md:shadow-lg
    print:rounded-none print:shadow-none
    print:max-w-none print:w-full print:mx-0 print:px-0
  "
        >
          <CurrentTemplate
            data={portfolioData}
            showSection={showSection}
            formatDate={formatDate}
            toAbsUrl={toAbsUrl}
          />
        </div>
      </div>

      {/* Print Styles */}
      <style>{PRINT_CSS}</style>
    </div>
  );
}
