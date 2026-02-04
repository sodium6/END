import { useEffect, useState } from "react";
import { Briefcase, Plus, X, Upload, ArrowLeft, Link as LinkIcon } from "lucide-react";
import {
    getWork,
    addWork as apiAddWork,
    updateWork as apiUpdateWork,
    deleteWork as apiDeleteWork,
    uploadWorkFiles,
    listWorkFiles,
    deleteWorkFile,
} from "../../../services/portfolioApi";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const WorkPage = () => {
    // ---------- auth / userId ----------
    const token = localStorage.getItem("token");
    let userId = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userId = decoded.id;
        } catch (err) {
            console.error("Decode token error:", err);
        }
    }

    if (!userId) {
        window.location.href = "/sign-in";
        return null;
    }

    // ---------- state ----------
    const [works, setWorks] = useState([]);
    const [selectedWork, setSelectedWork] = useState(null); // For "Folder" view
    const [viewMode, setViewMode] = useState("list"); // 'list' | 'detail' | 'create'

    // Preview
    const [previewFile, setPreviewFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // ---------- utils ----------
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const toAbsUrl = (p) => {
        if (!p) return "";
        const s = String(p);
        const abs = s.startsWith("http")
            ? s
            : `${API_BASE}${s.startsWith("/") ? s : `/uploads/portfolio_image/${s}`}`;
        return abs;
    };

    const confirmDelete = async (title = 'ยืนยันการลบ?', text = 'ต้องการลบข้อมูลนี้หรือไม่') => {
        const res = await Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        });
        return res.isConfirmed;
    };

    const sanitizeDates = (obj, fields) => {
        const copy = { ...obj };
        fields.forEach((f) => {
            if (copy[f] === "") copy[f] = null;
        });
        return copy;
    };

    const previewFileHandler = (f) => {
        if (!f) return;
        const isNativeFile = typeof File !== "undefined" && f instanceof File;
        const url = isNativeFile ? URL.createObjectURL(f) : toAbsUrl(f.url || f.filePath);
        const name = f.name || f.originalName || "file";
        const type = f.type || (name.includes(".") ? name.split(".").pop().toLowerCase() : "");
        setPreviewFile({ name, url, type });
        setShowPreview(true);
    };

    const closePreview = () => {
        if (previewFile && previewFile.url && previewFile.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewFile.url);
        }
        setPreviewFile(null);
        setShowPreview(false);
    };

    // ---------- Load Data ----------
    const fetchWorks = async () => {
        try {
            const data = await getWork(userId);
            // data items likely have { id, jobTitle, ..., files: [] }
            // Let's ensure structure
            const normalized = data.map(w => ({
                ...w,
                files: (w.files || []).map(f => ({
                    ...f,
                    url: toAbsUrl(f.filePath)
                }))
            }));
            setWorks(normalized);
        } catch (err) {
            console.error("Load works failed", err);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, [userId]);


    // ---------- Actions ----------
    const handleCreateWork = async (data) => {
        try {
            const payload = sanitizeDates(data, ["startDate", "endDate"]);
            await apiAddWork(userId, payload);
            await fetchWorks();
            setViewMode("list");
            Swal.fire({ icon: 'success', title: 'เพิ่มข้อมูลสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'เพิ่มไม่สำเร็จ', text: err.message });
        }
    };

    const handleUpdateWork = async (id, data) => {
        try {
            const payload = sanitizeDates(data, ["startDate", "endDate"]);
            await apiUpdateWork(id, payload);
            await fetchWorks();
            if (selectedWork && selectedWork.id === id) {
                const updated = { ...selectedWork, ...payload };
                setSelectedWork(updated);
            }
            Swal.fire({ icon: 'success', title: 'อัปเดตสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'อัปเดตไม่สำเร็จ', text: err.message });
        }
    };

    const handleDeleteWork = async (id) => {
        const ok = await confirmDelete('ยืนยันการลบ?', 'ข้อมูลงานและไฟล์แนบจะถูกลบ');
        if (!ok) return;

        try {
            await apiDeleteWork(id);
            setWorks(prev => prev.filter(w => w.id !== id));
            if (selectedWork?.id === id) {
                setSelectedWork(null);
                setViewMode("list");
            }
            Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: err.message });
        }
    };

    const handleFileUpload = async (files) => {
        if (!selectedWork || !files || !files.length) return;
        try {
            const { files: uploaded = [] } = await uploadWorkFiles(userId, selectedWork.id, files);
            // Simple refresh
            const updatedList = await getWork(userId);
            const normalized = updatedList.map(w => ({
                ...w,
                files: (w.files || []).map(f => ({
                    ...f,
                    url: toAbsUrl(f.filePath)
                }))
            }));
            setWorks(normalized);
            const found = normalized.find(w => w.id === selectedWork.id);
            if (found) setSelectedWork(found);

        } catch (err) {
            console.error(err);
            alert("อัปโหลดไม่สำเร็จ");
        }
    };

    const handleRemoveFile = async (fileId, idx) => {
        if (!selectedWork) return;
        const target = selectedWork.files[idx];
        if (!target?.id) return;

        try {
            await deleteWorkFile(target.id);
            // Optimistic update
            const updatedFiles = selectedWork.files.filter((_, i) => i !== idx);
            setSelectedWork(prev => ({ ...prev, files: updatedFiles }));
            setWorks(prev => prev.map(w => w.id === selectedWork.id ? { ...w, files: updatedFiles } : w));
        } catch (err) {
            console.error("delete file error", err);
            alert("ลบรูปไม่สำเร็จ");
        }
    };


    // ---------- Render ----------
    return (
        <div className="min-h-screen bg-[#F8FAFE] p-6 font-['Sarabun',sans-serif]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                    ประสบการณ์การทำงาน (Work Experience)
                </h1>

                {viewMode === "list" && (
                    <button
                        onClick={() => {
                            setSelectedWork({ jobTitle: "", startDate: "", endDate: "", jobDescription: "", portfolioLink: "" });
                            setViewMode("create");
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        เพิ่มข้อมูลประสบการ
                    </button>
                )}
            </div>

            {/* List View */}
            {viewMode === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {works.map(work => (
                        <div
                            key={work.id}
                            onClick={() => {
                                setSelectedWork(work);
                                setViewMode("detail");
                            }}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-200"
                        >
                            <h3 className="font-semibold text-lg text-slate-800 mb-1">{work.jobTitle}</h3>
                            <div className="text-sm text-slate-500 mb-4">
                                {work.startDate ? new Date(work.startDate).toLocaleDateString('th-TH') : "?"} - {work.endDate ? new Date(work.endDate).toLocaleDateString('th-TH') : "ปัจจุบัน"}
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-3 mb-4">{work.jobDescription}</p>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto">
                                <span className="bg-slate-100 px-2 py-1 rounded-full">
                                    ไฟล์แนบ: {work.files ? work.files.length : 0}
                                </span>
                                {work.portfolioLink && <LinkIcon className="w-3 h-3" />}
                            </div>
                        </div>
                    ))}

                    {works.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                            ยังไม่มีข้อมูลประสบการณ์
                        </div>
                    )}
                </div>
            )}

            {/* Create Form */}
            {viewMode === "create" && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-6">เพิ่มประสบการณ์การทำงาน</h2>
                    <WorkForm
                        initialData={selectedWork}
                        onSubmit={handleCreateWork}
                        onCancel={() => setViewMode("list")}
                    />
                </div>
            )}

            {/* Detail View */}
            {viewMode === "detail" && selectedWork && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col md:flex-row">
                    {/* Left: Form */}
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-100">
                        <div className="flex items-center gap-2 mb-6 text-slate-500 cursor-pointer hover:text-blue-600 w-fit" onClick={() => setViewMode("list")}>
                            <ArrowLeft className="w-5 h-5" />
                            <span>กลับ</span>
                        </div>

                        <WorkForm
                            initialData={selectedWork}
                            onSubmit={(data) => handleUpdateWork(selectedWork.id, data)}
                            isEdit={true}
                            onDelete={() => handleDeleteWork(selectedWork.id)}
                        />
                    </div>

                    {/* Right: Files */}
                    <div className="flex-1 p-6 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-700">ไฟล์แนบ / ผลงาน ({selectedWork.files?.length || 0})</h3>
                            <div className="relative">
                                <button className="text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                                    <Upload className="w-4 h-4" />
                                    อัปโหลดไฟล์
                                </button>
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {selectedWork.files?.map((file, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 hover:shadow-sm transition group relative">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden cursor-pointer" onClick={() => previewFileHandler(file)}>
                                        {file.type?.startsWith('image') || file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <img src={file.url} className="w-full h-full object-cover" alt="thumb" />
                                        ) : (
                                            <Briefcase className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-700 truncate cursor-pointer hover:text-blue-600" onClick={() => previewFileHandler(file)}>
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {/* Size if available */}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(file.id, idx)}
                                        className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {(!selectedWork.files || selectedWork.files.length === 0) && (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    ยังไม่มีไฟล์แนบ
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && previewFile && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4" onClick={closePreview}>
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button onClick={closePreview} className="absolute -top-10 right-0 text-white hover:text-blue-400">
                            <X className="w-8 h-8" />
                        </button>
                        {previewFile.type?.startsWith('image') || previewFile.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={previewFile.url} alt="preview" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
                        ) : (
                            <iframe src={previewFile.url} className="w-full h-[80vh] bg-white rounded-lg" title="preview" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Internal Form Component
const WorkForm = ({ initialData, onSubmit, onCancel, isEdit = false, onDelete }) => {
    const [formData, setFormData] = useState({
        jobTitle: "",
        startDate: "",
        endDate: "",
        jobDescription: "",
        portfolioLink: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                jobTitle: initialData.jobTitle || "",
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "",
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
                jobDescription: initialData.jobDescription || "",
                portfolioLink: initialData.portfolioLink || ""
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ตำแหน่งงาน / ชื่อโครงการ</label>
                <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="เช่น Developer Intern, หัวหน้าโครงการ..."
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">เริ่ม</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สิ้นสุด</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดงาน</label>
                <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="อธิบายหน้าที่ความรับผิดชอบ สิ่งที่ได้เรียนรู้..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ลิงก์ผลงาน (ถ้ามี)</label>
                <input
                    type="url"
                    name="portfolioLink"
                    value={formData.portfolioLink}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="https://..."
                />
            </div>

            <div className="pt-4 flex flex-col md:flex-row gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
                    {isEdit ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}
                </button>
                {/* Cancel (create mode) or Delete (edit mode) */}
                {!isEdit && onCancel && (
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-slate-600">
                        ยกเลิก
                    </button>
                )}
                {isEdit && onDelete && (
                    <button type="button" onClick={onDelete} className="px-6 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">
                        ลบ
                    </button>
                )}
            </div>
        </form>
    );
};

export default WorkPage;
