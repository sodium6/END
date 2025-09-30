import React, { useEffect, useMemo, useState } from "react";
import { adminApiEmail } from "../../../services/adminApiEmail";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);          
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [subs, setSubs] = useState({ total: 0 });   
  const [message, setMessage] = useState("");      
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);       

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [{ data }, subsum] = await Promise.all([
          adminApiEmail.listPublishedNews(),
          adminApiEmail.subscribersSummary().catch(() => ({ total: 0 })),
        ]);
        setItems(Array.isArray(data) ? data : []);
        setSubs(subsum || { total: 0 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // toggle เลือกทั้งหมด
  const toggleAll = (checked) => {
    setSelectAll(!!checked);
    setSelected(checked ? new Set(items.map((x) => x.id)) : new Set());
  };

  // toggle checkbox ทีละรายการ
  const toggleOne = (id, checked) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const sendingList = useMemo(
    () => items.filter((x) => selected.has(x.id)),
    [items, selected]
  );

  const handleSend = async () => {
    if (sendingList.length === 0) {
      // ถ้าไม่เลือกอะไร ให้ถือว่า "ส่งทั้งหมด" ที่โชว์อยู่
      sendingList.push(...items);
      toggleAll(true);
    }

    setSending(true);
    setResults([]);

    // พยายามใช้ bulk ก่อน ถ้าไม่มี endpoint นี้จะ fallback ส่งทีละข่าว
    try {
      await adminApiEmail.broadcastBulk(
        sendingList.map((x) => x.id),
        { message }
      );
      setResults(
        sendingList.map((x) => ({ id: x.id, title: x.title, ok: true }))
      );
    } catch {
      // fallback: ส่งทีละข่าว
      const out = [];
      for (const n of sendingList) {
        try {
          await adminApiEmail.broadcastOne(n.id, { message });
          out.push({ id: n.id, title: n.title, ok: true });
        } catch (e) {
          out.push({ id: n.id, title: n.title, ok: false, detail: e?.message || "failed" });
        }
      }
      setResults(out);
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

      {/* สรุปจำนวนผู้รับ */}
      <div className="p-4 rounded border bg-white">
        <p className="text-gray-700">
          ผู้สมัครรับข่าวสารทั้งหมด: <b>{subs.total}</b> อีเมล
        </p>
      </div>

      {/* กล่องข้อความเพิ่มเติม */}
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

      {/* รายการข่าวให้เลือก */}
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

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSend}
            disabled={sending || items.length === 0}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300"
          >
            {sending ? "กำลังส่ง…" : "ส่งอีเมลถึงผู้ติดตาม"}
          </button>
          <span className="text-sm text-gray-600 self-center">
            จะส่งจำนวน <b>{selected.size || items.length}</b> ข่าว ไปยัง{" "}
            <b>{subs.total}</b> ผู้รับ
          </span>
        </div>
      </div>

      {/* ผลลัพธ์การส่ง */}
      {results.length > 0 && (
        <div className="p-4 rounded border bg-white">
          <h3 className="font-semibold mb-2">ผลการส่ง</h3>
          <ul className="list-disc pl-6 space-y-1">
            {results.map((r) => (
              <li key={r.id} className={r.ok ? "text-emerald-700" : "text-red-600"}>
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
