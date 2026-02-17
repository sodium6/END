// src/pages/user/certificates/CertificatesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, Eye, Edit, Trash2, Download, X, FileText, Image as ImageIcon,
  Loader2, Search, Award, Calendar
} from "lucide-react";
import {
  createCertificate,
  updateCertificate,
  deleteCertificate,
  listMyCertificates,
  // viewCertificateFile, // ไม่ได้ใช้แล้ว
} from "../../../services/certApi";
import { jwtDecode } from "jwt-decode";


import { CertForm, Modal, FilePreview } from "../../../components/certificates/component";
/* ================= Utils ================= */
const formatDateTime = (v) => {
  if (!v) return "-";
  try {
    const d = new Date(v);
    return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return v;
  }
};
const isImageName = (name = "") => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
const isPdfName   = (name = "") => /\.(pdf)$/i.test(name);
const kindIcon = (name = "") =>
  isImageName(name) ? <ImageIcon className="h-5 w-5 text-emerald-600" /> : <FileText className="h-5 w-5 text-emerald-600" />;

/* ================= Page ================= */
export default function CertificatesPage({ propUserId }) {
  // ---- derive userId จาก token หรือ prop ----
  const userIdFromToken = useMemo(() => {
    try {
      const raw =
        localStorage.getItem("user_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("user_token") ||
        sessionStorage.getItem("token") ||
        "";
      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
      if (!token) return null;
      const p = jwtDecode(token);
      return p?.id ?? p?.user_id ?? p?.sub ?? null;
    } catch {
      return null;
    }
  }, []);

  const resolvedUserId = propUserId ?? userIdFromToken;

  // ---- state ----
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // ✅ ทำให้โครงสร้าง state ตรงกับ FilePreview
  const [preview, setPreview] = useState({ open: false, directUrl: "", filename: "", blob: null });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listMyCertificates();
      const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setRows(arr);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "โหลดรายการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedUserId != null) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedUserId]);

  // กรองฝั่ง client ตามช่องค้นหา
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.title || ""} ${r.description || ""}`.toLowerCase().includes(q)
    );
  }, [rows, query]);

  /* ---------- Actions ---------- */
  const handleCreate = async (fd) => {
    setSubmitting(true);

    if (resolvedUserId == null) {
      setToast("ยังไม่ทราบผู้ใช้ กรุณาเข้าสู่ระบบก่อนอัปโหลด");
      setSubmitting(false);
      return;
    }

    // ฝั่ง server อ่าน user จาก JWT อยู่แล้ว การ append user_id จะไม่จำเป็น
    try {
      await createCertificate(fd);
      setCreateOpen(false);
      setToast("อัปโหลดสำเร็จ");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "อัปโหลดไม่สำเร็จ";
      setToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ พรีวิว: ใช้ URL เต็มจาก backend (file_full) ถ้าไม่มีค่อย fallback เป็น file_url
  const handlePreview = (row) => {
    const href = row.file_full || row.file_url || "";
    if (!href) {
      setToast("ไม่พบลิงก์ไฟล์");
      return;
    }
    setPreview({
      open: true,
      directUrl: href,
      filename: row.file_url || row.title || "file",
      blob: null,
    });
  };

  // ✅ ดาวน์โหลด: ใช้ลิงก์ตรง (ไม่ต้อง blob)
  const handleDownload = (row) => {
    try {
      const href = row.file_full || row.file_url || "";
      if (!href) throw new Error("ไม่พบลิงก์ไฟล์");
      const a = document.createElement("a");
      const ext = (row.file_url || "").split("?")[0].split(".").pop();
      a.href = href;
      a.download = `${(row.title || "certificate").replace(/[^\wก-๙\-\s]/g, "_")}.${ext || "dat"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setToast("✓ ดาวน์โหลดสำเร็จ");
    } catch (e) {
      setToast("✗ " + (e?.message || "ดาวน์โหลดไม่สำเร็จ"));
    }
  };

  const handleEdit = async (fd) => {
    if (!editing) return;
    setSubmitting(true);
    try {
      const id = editing.cer_id || editing.id;
      await updateCertificate(id, fd);
      setEditOpen(false);
      setEditing(null);
      setToast("บันทึกการแก้ไขสำเร็จ");
      await load();
    } catch (e) {
      setToast(e?.response?.data?.message || e?.message || "แก้ไขไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row) return;
    const ok = window.confirm(`ยืนยันลบ “${row.title || "(ไม่มีชื่อ)"}” ?`);
    if (!ok) return;
    try {
      const id = row.cer_id || row.id;
      await deleteCertificate(id);
      setToast("ลบสำเร็จ");
      await load();
    } catch (e) {
      setToast(e?.response?.data?.message || e?.message || "ลบไม่สำเร็จ");
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">ใบรับรอง</h1>
              <p className="text-sm text-emerald-600">Certificates Management</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl shadow-lg border border-emerald-100 p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อหรือคำอธิบาย..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-emerald-100 bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            disabled={resolvedUserId == null}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 font-semibold shadow-lg hover:from-emerald-700 hover:to-teal-700 transform hover:-translate-y-0.5 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" /> อัปโหลดใหม่
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <X className="h-8 w-8" />
              </div>
              <p className="font-medium">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="font-medium text-gray-700">ยังไม่มีใบรับรอง</p>
              <p className="text-sm mt-2">คลิกปุ่ม "อัปโหลดใหม่" เพื่อเพิ่มใบรับรองของคุณ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-100">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-emerald-900">ไฟล์</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-emerald-900">ชื่อเอกสาร</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-emerald-900">คำอธิบาย</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-emerald-900">วันที่สร้าง</th>
                    <th className="py-4 px-6 text-right text-sm font-semibold text-emerald-900">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr
                      key={r.cer_id || r.id}
                      className={`border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/20'}`}
                    >
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-3">
                          {kindIcon(r.file_url || r.title)}
                          <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg uppercase">
                            {(r.file_url || "").split(".").pop() || "file"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{r.title || "(ไม่มีชื่อ)"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 max-w-md truncate">
                          {r.description || "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          {formatDateTime(r.create_at || r.created_at)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreview(r)}
                            className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="ดูไฟล์"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(r)}
                            className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                            title="ดาวน์โหลด"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditing(r);
                              setEditOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="แก้ไข"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {!loading && !error && filtered.length > 0 && (
          <div className="mt-4 text-center text-sm text-emerald-700 font-medium">
            แสดง {filtered.length} รายการ {query && `จากทั้งหมด ${rows.length} รายการ`}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white text-sm px-6 py-3 rounded-xl shadow-2xl border border-emerald-700">
            {toast}
          </div>
        )}

        {/* Create Modal */}
        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="อัปโหลด Certificate ใหม่">
          <CertForm onSubmit={handleCreate} submitting={submitting} />
        </Modal>

        {/* Edit Modal */}
        <Modal
          open={editOpen}
          onClose={() => { setEditOpen(false); setEditing(null); }}
          title={`แก้ไข: ${editing?.title || "(ไม่มีชื่อ)"}`}
        >
          <CertForm initial={editing} onSubmit={handleEdit} submitting={submitting} />
        </Modal>

        {/* Preview Modal */}
        <Modal
          open={preview.open}
          onClose={() => setPreview({ open: false, blob: null, filename: "", directUrl: "" })}
          title="พรีวิวไฟล์"
          wide
        >
          <div className="space-y-4">
            <FilePreview blob={preview.blob} filename={preview.filename} directUrl={preview.directUrl} />
            <div className="flex items-center justify-end">
              <button
                onClick={() => setPreview({ open: false, blob: null, filename: "", directUrl: "" })}
                className="rounded-xl border-2 border-emerald-200 px-6 py-2 font-medium hover:bg-emerald-50 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
