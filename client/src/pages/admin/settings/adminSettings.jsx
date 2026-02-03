import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApiEmail from "../../../services/adminApiEmail";
import { adminAuthApi } from "../../../services/adminAuthApi";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [subs, setSubs] = useState({ total: 0 });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [pubRes, subSum] = await Promise.all([
          adminApiEmail.listPublishedNews(),
          adminApiEmail.subscribersSummary().catch(() => ({ total: 0 })),
        ]);
        const raw = Array.isArray(pubRes?.data)
          ? pubRes.data
          : Array.isArray(pubRes)
            ? pubRes
            : [];
        const data = raw.map((n) => ({ ...n, id: n.id ?? n.news_id }));
        setItems(data);
        setSubs(subSum || { total: 0 });
        setSelected(new Set());
        setSelectAll(false);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || e.message || "โหลดข้อมูลล้มเหลว");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setSelectAll(items.length > 0 && selected.size === items.length);
  }, [items, selected]);

  const toggleAll = (checked) => {
    if (checked) setSelected(new Set(items.map((x) => x.id)));
    else setSelected(new Set());
    setSelectAll(!!checked);
  };

  const toggleOne = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectedItems = useMemo(
    () => items.filter((x) => selected.has(x.id)),
    [items, selected]
  );

  const handleSend = async () => {
    if (selectedItems.length === 0) {
      setError("กรุณาเลือกข่าวอย่างน้อย 1 รายการก่อนส่งอีเมล");
      return;
    }
    setError("");
    setSending(true);
    setResults([]);

    try {
      try {
        await adminApiEmail.broadcastBulk(
          selectedItems.map((x) => x.id),
          { message }
        );
        setResults(selectedItems.map((x) => ({ id: x.id, title: x.title, ok: true })));
      } catch {
        const out = [];
        for (const n of selectedItems) {
          try {
            await adminApiEmail.broadcastOne(n.id, { message });
            out.push({ id: n.id, title: n.title, ok: true });
          } catch (e) {
            out.push({
              id: n.id,
              title: n.title,
              ok: false,
              detail: e?.response?.data?.message || e.message || "failed",
            });
          }
        }
        setResults(out);
      }
    } finally {
      setSending(false);
    }
  };

  const handleSendAll = async () => {
    if (items.length === 0) return;
    setError("");
    setSending(true);
    setResults([]);
    try {
      try {
        await adminApiEmail.broadcastBulk(items.map((x) => x.id), { message });
        setResults(items.map((x) => ({ id: x.id, title: x.title, ok: true })));
      } catch {
        const out = [];
        for (const n of items) {
          try {
            await adminApiEmail.broadcastOne(n.id, { message });
            out.push({ id: n.id, title: n.title, ok: true });
          } catch (e) {
            out.push({
              id: n.id,
              title: n.title,
              ok: false,
              detail: e?.response?.data?.message || e.message || "failed",
            });
          }
        }
        setResults(out);
      }
    } finally {
      setSending(false);
    }
  };

  const navigate = useNavigate();
  const handleDeleteAdmin = async () => {
    if (!window.confirm("⚠️ คำเตือน: คุณแน่ใจหรือไม่ที่จะลบบัญชีผู้ดูแลระบบของตนเอง? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      return;
    }

    // Double confirm
    const confirmName = prompt("กรุณาพิมพ์ 'CONFIRM' เพื่อยืนยันการลบ:");
    if (confirmName !== 'CONFIRM') return;

    try {
      await adminAuthApi.deleteSelf();
      alert("ลบบัญชีเรียบร้อยแล้ว");
      localStorage.removeItem("admin_token");
      navigate("/admin/login"); // Adjust route if needed
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📧</span>
            <h1 className="text-3xl font-bold">การจัดการส่งข่าวสาร</h1>
          </div>
          <p className="text-emerald-100 ml-14">จัดการและส่งข่าวประชาสัมพันธ์ไปยังผู้สมัครรับข่าวสาร</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-md">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">เกิดข้อผิดพลาด</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Subscriber Count */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-full p-4">
              <span className="text-3xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">ผู้สมัครรับข่าวสารทั้งหมด</p>
              <p className="text-3xl font-bold text-emerald-700">{subs.total}</p>
              <p className="text-xs text-gray-500">อีเมล</p>
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-emerald-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✉️</span>
            <h2 className="text-xl font-bold text-gray-800">ข้อความเพิ่มเติม</h2>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
            placeholder="เรียนผู้รับข่าวสาร ขอแจ้งข่าวสารสำคัญดังนี้..."
          />

          <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <span>💡</span>
            <p>ข้อความนี้จะแสดงที่ด้านบนของอีเมล หากเว้นว่างไว้ จะส่งเฉพาะเนื้อหาข่าวที่เลือก</p>
          </div>
        </div>

        {/* News Selection */}
        <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📰</span>
                <div>
                  <h2 className="text-xl font-bold">เลือกข่าวที่ต้องการส่ง</h2>
                  <p className="text-emerald-100 text-sm">ข่าวที่มีสถานะ Published เท่านั้น</p>
                </div>
              </div>

              <label className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="font-medium">เลือกทั้งหมด</span>
              </label>
            </div>
          </div>

          <div className="p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-500 text-lg">ยังไม่มีข่าวที่เผยแพร่</p>
                <p className="text-gray-400 text-sm mt-2">กรุณาสร้างและเผยแพร่ข่าวก่อนส่งอีเมล</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`group border-2 rounded-xl p-4 transition-all cursor-pointer ${selected.has(n.id)
                      ? "border-emerald-400 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                      }`}
                    onClick={() => toggleOne(n.id, !selected.has(n.id))}
                  >
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.has(n.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleOne(n.id, e.target.checked);
                        }}
                        className="w-5 h-5 mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors mb-1">
                          {n.title}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                            {n.category || "ทั่วไป"}
                          </span>
                          <span className="flex items-center gap-1">
                            📅 {new Date(n.updated_at || n.created_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSend}
                disabled={sending || selected.size === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    <span>✉️</span>
                    <span>ส่งข่าวที่เลือก</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSendAll}
                disabled={sending || items.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-gray-600 text-white font-semibold hover:from-slate-700 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>ส่งทั้งหมด</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 text-sm bg-white px-4 py-2 rounded-lg border border-gray-200 ml-auto">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-700">{selected.size}</span>
                  <span className="text-gray-600">ข่าวที่เลือก</span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-700">{subs.total}</span>
                  <span className="text-gray-600">ผู้รับ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-xl font-bold text-gray-800">ผลการส่งอีเมล</h3>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={`${r.id}-${i}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 ${r.ok
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                    }`}
                >
                  <span className="text-2xl">{r.ok ? "✅" : "❌"}</span>
                  <div className="flex-1">
                    <p className={`font-medium ${r.ok ? "text-green-800" : "text-red-800"}`}>
                      {r.title}
                    </p>
                    {!r.ok && r.detail && (
                      <p className="text-sm text-red-600 mt-1">ข้อผิดพลาด: {r.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  สำเร็จ: <span className="font-bold text-green-600">{results.filter(r => r.ok).length}</span> /
                  ล้มเหลว: <span className="font-bold text-red-600">{results.filter(r => !r.ok).length}</span>
                </span>
                <span className="text-gray-600">
                  ทั้งหมด: <span className="font-bold">{results.length}</span> รายการ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-md p-6 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-3xl">💣</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-800">พื้นที่อันตราย (Danger Zone)</h2>
              <p className="text-red-600 mt-1">
                การกระทำในส่วนนี้อาจส่งผลกระทบถาวร กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
              </p>

              <div className="mt-6 pt-6 border-t border-red-200 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-red-900">ลบบัญชีผู้ดูแลระบบ (ของฉัน)</h3>
                  <p className="text-sm text-red-700/80">
                    ลบบัญชี Admin ปัจจุบันออกจากระบบทันที
                  </p>
                </div>
                <button
                  onClick={handleDeleteAdmin}
                  className="px-5 py-2.5 bg-white border-2 border-red-500 text-red-600 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  ลบบัญชีของฉัน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}