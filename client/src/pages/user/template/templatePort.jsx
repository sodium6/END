import React, { useMemo, useState } from "react";
import {
  Check,
  Search,
  SlidersHorizontal,
  Eye,
  Palette,
  Sparkles,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Template picker (no framer-motion)
 * Props (optional):
 *  - onSelect: (templateId) => void
 *  - onContinue: (templateObj) => void
 */
function TemplatePort({ onSelect, onContinue }) {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("ทั้งหมด");
  const [preview, setPreview] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const FILTERS = ["ทั้งหมด", "มินิมอล", "มืออาชีพ", "ภาพเยอะ", "โมเดิร์น"];

  const TEMPLATES = useMemo(
    () => [
      {
        id: "emerald-minimal",
        name: "Emerald Minimal",
        tagline: "คลีน โฟกัสเนื้อหา ใช้งานง่าย",
        tag: "มินิมอล",
        gradient:
          "linear-gradient(135deg, #064e3b 0%, #065f46 45%, #10b981 100%)",
        chips: ["1 หน้า", "Dark Header", "PDF-ready"],
      },
      {
        id: "forest-pro",
        name: "Forest Pro",
        tagline: "โครงสร้างมืออาชีพ เน้นความน่าเชื่อถือ",
        tag: "มืออาชีพ",
        gradient:
          "linear-gradient(135deg, #052e2b 0%, #064e3b 55%, #059669 100%)",
        chips: ["Nav หลายส่วน", "แสดงโปรเจกต์", "พิมพ์สวย"],
      },
      {
        id: "leaf-visual",
        name: "Leaf Visual",
        tagline: "โชว์ภาพเด่น เหมาะสำหรับงานศิลป์/ดีไซน์",
        tag: "ภาพเยอะ",
        gradient:
          "linear-gradient(135deg, #022c22 0%, #065f46 50%, #34d399 100%)",
        chips: ["แกลเลอรี", "คาร์ดโปรเจกต์", "ธีมเข้ม"],
      },
      {
        id: "neo-emerald",
        name: "Neo Emerald",
        tagline: "โมเดิร์น เน้นคอนทราสต์ ไอคอนชัด",
        tag: "โมเดิร์น",
        gradient:
          "linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #2dd4bf 100%)",
        chips: ["Section Card", "CTA เด่น", "Responsive"],
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const hitFilter = filter === "ทั้งหมด" || t.tag === filter;
      const hitQ =
        !q ||
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.tagline.toLowerCase().includes(q.toLowerCase());
      return hitFilter && hitQ;
    });
  }, [TEMPLATES, q, filter]);

  const handleSelect = (id) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  const handleUse = (tpl, e) => {
    e?.preventDefault?.();
    setSelectedId(tpl.id);
    setPreview(null);
  
    // id ของพื้นหลังที่ PortfolioView เข้าใจ
    const bgId = BG_ID_MAP[tpl.id] || "tpl-1";
  
    // ส่งต่อให้พาเร้นท์ (ถ้ามีใช้)
    onSelect?.(tpl.id);
    onContinue?.(tpl);
  
    // persist และแนบใน URL ด้วย
    localStorage.setItem("portfolio.tpl", bgId);
    navigate(`/template/view?tpl=${encodeURIComponent(bgId)}`, {
      state: { templateId: bgId },
    });
  };
  
  const BG_ID_MAP = {
    "emerald-minimal": "tpl-1",
    "forest-pro": "tpl-2",
    "leaf-visual": "tpl-3",
    "neo-emerald": "tpl-1", // จะให้ไปหน้าไหนก็ปรับได้
    blank: "tpl-1",
  };
  
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <div className="relative">
        <header className="max-w-6xl mx-auto px-6 pt-12 pb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            เทมเพลต E-Portfolio ธีมเขียวเข้ม
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            เลือกเทมเพลตพอร์ตของคุณ
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            เลือกสไตล์ที่ใช่ ปรับแต่งได้ทั้งหมด รองรับทั้งการดูบนเว็บและการพิมพ์เป็น PDF
          </p>

          {/* Search & Filter */}
          <div className="mt-8 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาเทมเพลต…"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              <div className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                ตัวกรอง
              </div>
              {FILTERS.map((f) => {
                const active = f === filter;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl border transition ${
                      active
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200/40"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </header>
      </div>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blank Template */}
          <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <PlusCircle className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">เริ่มจากศูนย์</h3>
                <p className="text-sm text-gray-600">เลย์เอาต์เปล่า ปรับได้อิสระ</p>
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center justify-between">
              <div className="text-xs text-gray-500">ว่างเปล่า</div>
              <button
                type="button"
                onClick={(e) =>
                  handleUse(
                    {
                      id: "blank",
                      name: "Blank",
                      tag: "มินิมอล",
                    },
                    e
                  )
                }
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition px-4 py-2 rounded-lg"
              >
                ใช้เทมเพลตนี้ <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real templates */}
          {filtered.map((t) => {
            const selected = selectedId === t.id;
            return (
              <div
                key={t.id}
                className={`group relative rounded-2xl border overflow-hidden transition shadow-sm ${
                  selected
                    ? "border-emerald-500 shadow-emerald-100"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Preview header */}
                <div className="h-40 relative" style={{ backgroundImage: t.gradient }}>
                  <div className="absolute inset-0 p-4 flex items-end">
                    {/* ✅ items-end (แก้จาก items:end) */}
                    <div className="bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
                      {t.tag}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreview(t)}
                    className="absolute right-3 top-3 inline-flex items-center gap-2 text-xs bg-white/80 hover:bg-white text-gray-800 px-3 py-2 rounded-lg border border-white transition"
                  >
                    <Eye className="w-4 h-4" /> ดูตัวอย่าง
                  </button>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                        <span>{t.name}</span>
                        {selected && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs">
                            <Check className="w-4 h-4" /> เลือกแล้ว
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{t.tagline}</p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <Palette className="w-5 h-5 text-emerald-700" />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.chips.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleSelect(t.id)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        selected
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {selected ? "เลือกแล้ว" : "เลือกเทมเพลต"}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleUse(t, e)} // ✅ ไป /template/view
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition px-4 py-2 rounded-lg"
                    >
                      ดำเนินการต่อ
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          คุณสามารถปรับสี ฟอนต์ และเลย์เอาต์ได้ทั้งหมดหลังจากเลือกเทมเพลตแล้ว
        </div>
      </main>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-3xl bg-white text-gray-900 border border-gray-200 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-56" style={{ backgroundImage: preview.gradient }} />
            <div className="p-6">
              <h3 className="text-2xl font-bold">{preview.name}</h3>
              <p className="mt-1 text-gray-600">{preview.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {preview.chips.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUse(preview, e)} // ✅ ไป /template/view จาก modal
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition px-4 py-2 rounded-lg"
                >
                  ใช้เทมเพลตนี้ <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatePort;
