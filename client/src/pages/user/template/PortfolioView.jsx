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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios  from "axios";
// Template Components
import Template1 from "@/components/portfolio/backgrounds/Template1";
import Template2 from "@/components/portfolio/backgrounds/Template2";
import Template3 from "@/components/portfolio/backgrounds/Template3";
import ToggleSwitch from "@/components/portfolio/backgrounds/ToggleSwitch";

export default function PortfolioView({ userId: propUserId }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const navigate = useNavigate();
  const goBack = () => navigate("/my-portfolio");
  const [printDebug, setPrintDebug] = useState(false);

 const location = useLocation();
  const [params] = useSearchParams();

  const templateId =
    location.state?.templateId ||
    params.get("tpl") ||
    localStorage.getItem("portfolio.tpl") ||
    "template1";

  // ดึง userId จาก token (เหมือนเดิม)
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

  // 👇 เพิ่มตรงนี้: ดึงจาก query ?userId=...
  const userIdFromQuery = params.get("userId");

  // ลำดับความสำคัญ: prop > token > query
  const userId = propUserId ?? userIdFromToken ?? userIdFromQuery;

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

  // ฟังก์ชัน downloadPDF ที่แก้ไขแล้ว
 const downloadPDF = async () => {
  try {
    if (!userId) {
      alert("ไม่พบผู้ใช้");
      return;
    }

    // ส่งสถานะ template + toggle แต่ละ section ไปให้ backend
    const qs = new URLSearchParams({
      tpl: selectedTemplate,
      personal: showSection.personal ? "1" : "0",
      works: showSection.works ? "1" : "0",
      activities: showSection.activities ? "1" : "0",
      sports: showSection.sports ? "1" : "0",
    });

    const res = await axios.get(
      `${API_BASE}/api/data/${userId}/pdf?${qs.toString()}`,
      { responseType: "blob" }
    );

    // สร้าง blob แล้วสั่งโหลด
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const firstName = data?.personalInfo?.first_name_th || "User";
    const lastName = data?.personalInfo?.last_name_th || "";
    a.download = `Portfolio_${firstName}_${lastName}_${dateStr}.pdf`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download PDF failed:", err);
    alert("ดาวน์โหลด PDF ไม่สำเร็จ");
  }
};





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

  const PRINT_CSS = `
  @media print {
    #portfolio-print-area .print-section{
      padding-top:14mm !important;
      padding-bottom:14mm !important;
      padding-left:12mm !important;
      padding-right:12mm !important;
      break-before: page !important;
      page-break-before: always !important;
    }
    #portfolio-print-area .print-cover{
      height: 90vh !important;
      min-height: 90vh !important;
      box-sizing: border-box;
      overflow: hidden;
      break-after: page !important;
      page-break-after: always !important;
      padding-top: 10mm !important;
    }
    #portfolio-print-area .print-cover + .print-section{
      break-before: auto !important;
      page-break-before: auto !important;
      padding-top: 10mm !important;
    }
    .print-cols-2{ display:grid !important; grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:2rem !important; }
    .print-cols-3{ display:grid !important; grid-template-columns:repeat(3,minmax(0,1fr)) !important; gap:2rem !important; }
    .print-solid-800{ background:#1f2937 !important; }
    .print-card-border{ border-color:#374151 !important; }
    *[class*="shadow"]{ box-shadow:none !important; }
    *{ animation:none !important; transition:none !important; }
    .print-avoid-break, .no-break-inside, figure, img{
      break-inside:avoid; page-break-inside:avoid;
    }
    #portfolio-print-area .print\\:break-inside-avoid{
      break-inside:avoid !important; page-break-inside:avoid !important;
    }
    #portfolio-print-area .page-break{
      break-before: page !important;
      page-break-before: always !important;
      height:0; margin:0; border:0; padding:0;
    }
    #portfolio-print-area .print-flow{ display:block !important; }
    #portfolio-print-area .print-flow [class*="col-span"]{ display:block !important; width:100% !important; }
    html,body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .screen-only{ display:none !important; }
    .print-only{ display:block !important; }
    #portfolio-print-area figure, #portfolio-print-area img, #portfolio-print-area table{ 
      break-inside:avoid; page-break-inside:avoid; 
    }
    #portfolio-print-area [class*="shadow"]{ box-shadow:none !important; }
    #portfolio-print-area .personal-cards{
      display:grid !important; grid-template-columns:repeat(4,minmax(0,1fr)) !important; gap:1.5rem !important;
    }
    #portfolio-print-area .preface-grid{
      display:grid !important; grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:2rem !important;
    }
    #portfolio-print-area .preface-grid > *{ break-inside:avoid; page-break-inside:avoid; }
    .file-chip a{ display:none !important; }
    @page{ size:A4; margin:-5mm !important; }
    #portfolio-print-area{ margin:0 !important; padding:0 !important; }
    #portfolio-print-area .print-cover:last-of-type, #portfolio-print-area .print-section:last-of-type{
      break-after:auto !important; page-break-after:auto !important;
    }
    #portfolio-print-area .page-break:last-child, 
    #portfolio-print-area .print-section:last-of-type > .page-break:last-child{
      display:none !important;
    }
    #portfolio-print-area .print-section:last-of-type{
      margin-bottom:0 !important; padding-bottom:0 !important;
      border-bottom-width:0 !important; box-shadow:none !important; transform:none !important;
    }
    #portfolio-print-area .print-section.print-section2{
      padding:22mm 12mm 12mm !important;
      break-before:auto !important;
      page-break-before:auto !important;
    }
    #portfolio-print-area .print-cover + .print-section.print-section2{
      padding:22mm 12mm 12mm !important;
      break-before:auto !important; page-break-before:auto !important;
    }
    #portfolio-print-area .print-section.print-section2 [class*="sticky"],
    #portfolio-print-area .print-section.print-section2 [class*="fixed"]{
      position:static !important; top:auto !important;
    }
  }
  #portfolio-print-area .file-chip{
    display:inline-flex; align-items:center; max-width:100%;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  `;

  const onPrint = () => window.print();

  const previewAsPDF = () => {
    const printable = document.querySelector("#portfolio-print-area");
    if (!printable) {
      alert("ไม่พบพื้นที่สำหรับพิมพ์");
      return;
    }

    const css = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((n) => n.outerHTML)
      .join("\n");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Portfolio - PDF Preview</title>
          ${css}
          <style>${PRINT_CSS}</style>
        </head>
        <body>
          ${printable.outerHTML}
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) {
      alert("เบราว์เซอร์บล็อค popup ให้อนุญาต popup จากเว็บนี้ก่อน");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    win.onload = () => {
      win.focus();
      win.print();
    };
  };

  const templates = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
  };

  const CurrentTemplate = templates[selectedTemplate] || Template1;

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
      <div className="print:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 md:px-8 py-3">
          <button
            onClick={goBack}
            className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5
                 bg-slate-100 hover:bg-slate-200 active:scale-[.98] transition-all
                 text-slate-700 hover:text-slate-900 font-medium shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span>กลับไปหน้า My portfolio</span>
          </button>
        </div>
      </div>

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

          <div className="space-y-2">
            <button
              onClick={downloadPDF}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                         px-4 py-3 rounded-xl hover:bg-blue-700 active:scale-[.98] transition-all text-sm font-medium
                         shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด PDF
            </button>

            {/* <button
              onClick={previewAsPDF}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white
                         px-4 py-3 rounded-xl hover:bg-emerald-700 active:scale-[.98] transition-all text-sm font-medium
                         shadow-lg hover:shadow-xl"
            >
              <Eye className="w-4 h-4" />
              ดูตัวอย่าง PDF
            </button> */}

            <button
              onClick={onPrint}
              className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white
                         px-4 py-3 rounded-xl hover:bg-slate-700 active:scale-[.98] transition-all text-sm font-medium
                         shadow-lg hover:shadow-xl"
            >
              <Printer className="w-4 h-4" />
              พิมพ์เอกสาร
            </button>

            {/* <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={printDebug}
                onChange={(e) => setPrintDebug(e.target.checked)}
              />
              แสดงเส้นคั่นหน้า (debug)
            </label> */}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/70">
            {/* <p className="text-xs text-slate-500 text-center">
              💡 กด <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 font-mono">Ctrl+P</kbd> เพื่อพิมพ์ได้เลย
            </p> */}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6 md:py-8">
        <div
          id="portfolio-print-area"
          className="bg-white md:rounded-2xl md:shadow-lg print:rounded-none print:shadow-none
                     print:max-w-none print:w-full print:mx-0 print:px-0"
        >
          <CurrentTemplate
            data={portfolioData}
            showSection={showSection}
            formatDate={formatDate}
            toAbsUrl={toAbsUrl}
          />
        </div>
      </div>

      <style>{PRINT_CSS}</style>
    </div>
  );
}