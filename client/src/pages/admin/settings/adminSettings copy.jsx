import React, { useEffect, useMemo, useState } from "react";
import adminApiEmail from "../../../services/adminApiEmail"; // <-- ถ้าเป็น named: { adminApiEmail }

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);              // ข่าวที่เผยแพร่
  const [selected, setSelected] = useState(new Set()); // id ที่เลือก
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
        // normalize ให้มี id เสมอ
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

  // sync checkbox "เลือกทั้งหมด"
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

    // พยายามส่งแบบ bulk ก่อน แล้วค่อย fallback ทีละข่าว
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

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
        <p className="text-gray-500">กำลังโหลด…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      {error && (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="p-4 rounded border bg-white">
        <p className="text-gray-700">
          ผู้สมัครรับข่าวสารทั้งหมด: <b>{subs.total}</b> อีเมล
        </p>
      </div>

      <div className="p-4 rounded border bg-white">
        <label className="block text-sm font-semibold mb-2">
          ข้อความเพิ่มเติม (จะแนบไว้ด้านบนอีเมล)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2"
          placeholder="เช่น เรียนผู้รับข่าวสาร…"
        />
        <p className="text-xs text-gray-500 mt-2">
          * ถ้าเว้นว่าง จะส่งเฉพาะเนื้อหาข่าวตามที่เลือกด้านล่าง
        </p>
      </div>

      <div className="p-4 rounded border bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">ข่าวที่พร้อมส่ง (สถานะ: published)</h2>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            เลือกทั้งหมด
          </label>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีข่าวที่เผยแพร่</p>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id} className="p-3 rounded border">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(n.id)}
                    onChange={(e) => toggleOne(n.id, e.target.checked)}
                  />
                  <div>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500">
                      หมวดหมู่: {n.category || "ทั่วไป"} • อัปเดต:{" "}
                      {new Date(n.updated_at || n.created_at).toLocaleString("th-TH")}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleSend}
            disabled={sending || selected.size === 0}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300"
          >
            {sending ? "กำลังส่ง…" : "ส่งอีเมล (เฉพาะที่เลือก)"}
          </button>

          <button
            onClick={handleSendAll}
            disabled={sending || items.length === 0}
            className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 disabled:bg-slate-300"
          >
            {sending ? "กำลังส่ง…" : "ส่งข่าวทั้งหมดที่แสดง"}
          </button>

          <span className="text-sm text-gray-600 self-center">
            เลือกไว้ <b>{selected.size}</b> ข่าว • ผู้รับทั้งหมด <b>{subs.total}</b> อีเมล
          </span>
        </div>
      </div>

      {results.length > 0 && (
        <div className="p-4 rounded border bg-white">
          <h3 className="font-semibold mb-2">ผลการส่ง</h3>
          <ul className="list-disc pl-6 space-y-1">
            {results.map((r, i) => (
              <li key={`${r.id}-${i}`} className={r.ok ? "text-emerald-700" : "text-red-600"}>
                {r.ok ? "✅" : "❌"} {r.title}
                {!r.ok && r.detail ? ` – ${r.detail}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
