// src/components/certificates/component.jsx
import React, { useEffect, useState } from "react";
import { X, Loader2, FileText } from "lucide-react";

/* =============== helpers =============== */
const isPdfName = (name = "") => /\.pdf(\?|$)/i.test(name);
const isImageName = (name = "") =>
  /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(name);

/* =============== Modal =============== */
export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white rounded-2xl shadow-2xl ${
          wide ? "max-w-4xl" : "max-w-lg"
        } w-full max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h2 className="text-xl font-bold text-emerald-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="h-5 w-5 text-emerald-700" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* =============== File Preview (reusable) =============== */
export function FilePreview({ blob, filename, directUrl }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // ถ้ามีลิงก์จากเซิร์ฟเวอร์ให้ใช้ก่อน
    if (directUrl) {
      setUrl(directUrl);
      return;
    }
    // ถ้าเป็นไฟล์ใหม่ ใช้ object URL
    if (blob) {
      const obj = URL.createObjectURL(blob);
      setUrl(obj);
      return () => URL.revokeObjectURL(obj);
    }
    setUrl("");
  }, [blob, directUrl]);

  if (!url)
    return (
      <div className="text-gray-500 text-center py-8">ยังไม่มีไฟล์สำหรับพรีวิว</div>
    );

  const name = filename || url;

  if (isPdfName(name)) {
    return (
      <div className="w-full h-[420px] rounded-xl overflow-hidden border-2 border-emerald-200 shadow-inner">
        <iframe src={url} className="w-full h-full" title="PDF Preview" />
      </div>
    );
  }

  if (isImageName(name)) {
    return (
      <div className="flex justify-center items-center bg-emerald-50/50 rounded-xl p-4 border-2 border-emerald-200">
        <img
          src={url}
          alt={filename || "preview"}
          className="max-w-full max-h-[420px] rounded-lg shadow-lg"
        />
      </div>
    );
  }

  return (
    <div className="text-gray-500 text-center py-8">
      ไม่รองรับการแสดงตัวอย่างไฟล์ชนิดนี้
    </div>
  );
}

/* =============== Form (with live preview) =============== */
export function CertForm({ initial = null, onSubmit, submitting }) {
  const isEdit = !!initial;

  // ฟิลด์ข้อความ
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");

  // ไฟล์ใหม่ + สถานะลบไฟล์เดิม
  const [file, setFile] = useState(null);
  const [removeCurrent, setRemoveCurrent] = useState(false);

  // URL ของไฟล์เดิมจากเซิร์ฟเวอร์ (ถ้ามี)
  const existingUrl = initial?.file_full || initial?.file_url || "";

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    // ถ้าเลือกไฟล์ใหม่ ให้ยกเลิก "ลบไฟล์เดิม" อัตโนมัติ
    if (f && removeCurrent) setRemoveCurrent(false);
  };

  const clearSelected = () => setFile(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title.trim());
    if (description.trim()) fd.append("description", description.trim());
    // อัปโหลดไฟล์ใหม่ (ชื่อ field ต้องเป็น 'file' ให้ตรงกับ multer.single('file'))
    if (file) fd.append("file", file);
    // ตอนแก้ไข: ถ้าติ๊ก “ลบไฟล์เดิม” ให้ส่ง flag ไป
    if (isEdit && !file && removeCurrent) fd.append("remove_file", "1");
    onSubmit(fd);
  };

  const showExisting =
    isEdit && existingUrl && !file && !removeCurrent; // แสดงไฟล์เดิมถ้าไม่ได้เลือกไฟล์ใหม่และไม่ได้ติกลบ

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ชื่อ Certificate <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น Certificate of Achievement"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          คำอธิบาย
        </label>
        <textarea
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all min-h-[120px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="รายละเอียดเพิ่มเติม เช่น ผู้ออกใบรับรอง เลขที่เอกสาร วันที่ได้รับ ฯลฯ"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          เลือกไฟล์ (ภาพหรือ PDF){!isEdit && <span className="text-red-500"> *</span>}
        </label>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 hover:border-emerald-400 transition-colors
                     file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
          required={!isEdit}
        />

        {/* ปุ่มเคลียร์ไฟล์ที่เพิ่งเลือก */}
        {file && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelected}
              className="px-3 py-1.5 text-sm rounded-lg border border-emerald-200 hover:bg-emerald-50"
            >
              ล้างไฟล์ที่เลือก
            </button>
            <span className="text-xs text-gray-500">
              {file.name} • {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}

        {/* ตัวเลือก “ลบไฟล์เดิม” ตอนแก้ไข */}
        {isEdit && existingUrl && !file && (
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={removeCurrent}
              onChange={(e) => setRemoveCurrent(e.target.checked)}
            />
            ลบไฟล์ปัจจุบัน
          </label>
        )}

        {/* ✅ พรีวิวสด: ถ้าเลือกไฟล์ใหม่ให้พรีวิวไฟล์ใหม่ / ถ้าแก้ไขและยังไม่ได้เลือกไฟล์ใหม่ให้พรีวิวไฟล์เดิม */}
        <div className="mt-2">
          <FilePreview
            blob={file || null}
            filename={file?.name || (showExisting ? existingUrl : "")}
            directUrl={showExisting ? existingUrl : ""}
          />
        </div>

        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          รองรับไฟล์ .png .jpg .jpeg .webp .gif และ .pdf
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={!!submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "บันทึกการแก้ไข" : "อัปโหลด"}
        </button>
      </div>
    </form>
  );
}

export default { Modal, FilePreview, CertForm };
