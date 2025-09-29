<style>{`
/* ให้หน้ากระดาษขาวจริง */
  html, body {
    background: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* โหมดแสดง/ซ่อน */
  .screen-only { display: none !important; }
  .print-only  { display: block !important; }

  /* บังคับแบ่งหน้าแบบส่วนๆ */
  #portfolio-print-area .print-cover {
    break-after: page !important;
    page-break-after: always !important;
  }
  #portfolio-print-area .print-section {
    break-before: page !important;
    page-break-before: always !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
  }

  /* แก้ปัญหา grid/overflow ทำให้ page-break ได้ผล */
  #portfolio-print-area { 
    background: #fff !important; 
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  #portfolio-print-area .grid { 
    display: block !important;
  }
  #portfolio-print-area [class*="col-span"] {
    display: block !important;
    width: 100% !important;
  }

  /* กันโดนตัดครึ่งกล่อง/รูป */
  #portfolio-print-area .no-break-inside,
  #portfolio-print-area figure,
  #portfolio-print-area img,
  #portfolio-print-area table {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }int .bg-gradient-to-br {
    background-color: #fdf2f8 !important; /* pink-50 */
  }
`}</style>



 
            
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
  import { useLocation, useSearchParams , useNavigate } from "react-router-dom";
  // Template Components
  import Template1 from "@/components/portfolio/backgrounds/Template1";
  import Template2 from "@/components/portfolio/backgrounds/Template2";
  import Template3 from "@/components/portfolio/backgrounds/Template3";
  import ToggleSwitch from "@/components/portfolio/backgrounds/ToggleSwitch";
  
  // Main Component with Database Integration
  export default function PortfolioView({ userId: propUserId }) {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const navigate = useNavigate();
    const goBack = () => navigate("/public-relations");
    
    // Helper functions from original code
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
  
    // Print functions
    const onPrint = () => window.print();
  
    const previewAsPDF = () => {
      const printable = document.querySelector("#portfolio-print-area");
      if (!printable) return;
  
      const css = [
        ...document.querySelectorAll('link[rel="stylesheet"], style'),
      ]
        .map((n) => n.outerHTML)
        .join("\n");
  
      const win = window.open("", "_blank", "noopener,noreferrer");
      if (!win) return;
  
      const printOnly = `
        <style>
          @media print {
            @page { size: A4; margin: 12mm; }
            a[href]:after { content: ""; }
            img { break-inside: avoid; }
            .shadow-sm, .shadow, .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
            .bg-gradient-to-br, .bg-gradient-to-r { background: white !important; }
            .text-white { color: black !important; }
          }
          body { background: white; }
        </style>
      `;
  
      win.document.write(`
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Portfolio - PDF Preview</title>
            ${css}
            ${printOnly}
          </head>
          <body>
            ${printable.outerHTML}
            <script>
              const imgs = Array.from(document.images || []);
              Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })))
                .then(() => { window.focus(); window.print(); });
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
  
    // Loading state
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
  
    // Prepare data for templates (use API key names)
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
        {/* ปุ่มย้อนกลับ - แสดงด้านบนซ้าย ซ่อนเมื่อพิมพ์ */}
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
  
        {/* เครื่องมือมุมขวา */}
        <div className="fixed top-20 right-4 md:right-6 z-50 print:hidden">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/70 p-4 w-[280px]">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-slate-900">เลือกเทมเพลต</span>
            </div>
  
            <div className="grid grid-cols-1 gap-2 mb-4">
              <button
                onClick={() => setSelectedTemplate("template1")}
                className={`p-3 rounded-lg text-sm font-medium transition-all ring-1
                            ${selectedTemplate === "template1"
                              ? "bg-blue-600 text-white ring-transparent shadow-md"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 ring-slate-200"}`}
              >
                Professional Blue
              </button>
              <button
                onClick={() => setSelectedTemplate("template2")}
                className={`p-3 rounded-lg text-sm font-medium transition-all ring-1
                            ${selectedTemplate === "template2"
                              ? "bg-slate-800 text-white ring-transparent shadow-md"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 ring-slate-200"}`}
              >
                Dark Modern
              </button>
              <button
                onClick={() => setSelectedTemplate("template3")}
                className={`p-3 rounded-lg text-sm font-medium transition-all ring-1
                            ${selectedTemplate === "template3"
                              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ring-transparent shadow-md"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 ring-slate-200"}`}
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
                  onChange={(checked) => setShowSection(prev => ({ ...prev, personal: checked }))}
                />
                <ToggleSwitch
                  label="ประสบการณ์"
                  checked={!!showSection.works}
                  onChange={(checked) => setShowSection(prev => ({ ...prev, works: checked }))}
                />
                <ToggleSwitch
                  label="กิจกรรม"
                  checked={!!showSection.activities}
                  onChange={(checked) => setShowSection(prev => ({ ...prev, activities: checked }))}
                />
                <ToggleSwitch
                  label="กีฬา"
                  checked={!!showSection.sports}
                  onChange={(checked) => setShowSection(prev => ({ ...prev, sports: checked }))}
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
          <div id="portfolio-print-area" className="bg-white md:rounded-2xl md:shadow-lg print:shadow-none print:rounded-none overflow-hidden">
            <CurrentTemplate
              data={portfolioData}
              showSection={showSection}
              formatDate={formatDate}
              toAbsUrl={toAbsUrl}
            />
          </div>
        </div>
  
        {/* Print Styles */}
        {/* <style>{`
          @media print {
            @page { size: A4; margin: 12mm; }
            

            .print\\:hidden { display: none !important; }
            
      
            body { background: white !important; }
            a[href]:after { content: ""; }
            img { break-inside: avoid; }
            .shadow-sm, .shadow, .shadow-lg, .shadow-xl, .shadow-2xl { 
              box-shadow: none !important; 
            }
            .bg-gradient-to-br, .bg-gradient-to-r { 
              background: white !important; 
            }
            .bg-transparent { 
              background: white !important; 
            }
            .text-white { 
              color: black !important; 
            }
            

            #portfolio-print-area {
              margin: 0 !important;
              padding: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
            }
          }
        `}</style> */}
      </div>
    );
  }