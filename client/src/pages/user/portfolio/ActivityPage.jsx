import { useEffect, useState, useRef } from "react";
import { Users, Plus, X, Upload, Eye, File as FileIcon, Download, Folder, ArrowLeft, Save, Star } from "lucide-react";
import {
    getActivities,
    addActivity as apiAddActivity,
    updateActivity as apiUpdateActivity,
    deleteActivity as apiDeleteActivity,
    uploadActivityFiles,
    listActivityFiles,
    deleteActivityFile,
} from "../../../services/portfolioApi";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const ActivityPage = () => {
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
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null); // For "Folder" view
    const [viewMode, setViewMode] = useState("list"); // 'list' | 'detail' | 'create'
    const [showFavorites, setShowFavorites] = useState(false); // Filter only favorites

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
        const alreadyEncoded = /%[0-9A-Fa-f]{2}/.test(abs);
        if (!alreadyEncoded && /[^\x20-\x7E]/.test(abs)) {
            return encodeURI(abs);
        }
        return abs;
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        const url = isNativeFile
            ? URL.createObjectURL(f)
            : toAbsUrl(f.url || f.filePath || f.file_path);
        const name =
            f.name ||
            f.originalName || f.original_name ||
            ((f.filePath || f.file_path || "").split("/").pop() || "file");
        const size = typeof f.size === "number" ? f.size : (f.sizeBytes || f.size_bytes || 0);
        const type = f.type || (name.includes(".") ? name.split(".").pop().toLowerCase() : "");
        setPreviewFile({ name, url, type, size });
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
    const fetchActivities = async () => {
        try {
            const acts = await getActivities(userId);
            // Pre-fetch images for all activities to show thumbnails if needed, 
            // or just load them when opening the folder.
            // For now, let's load images when opening the details or mapped here.

            // To be consistent with existing logic, we might need to load images for all
            // OR just load when entering the folder. The user wants "Folder" feel.

            const actsWithPhotos = await Promise.all(
                (Array.isArray(acts) ? acts : []).map(async (a) => {
                    let photos = [];
                    try {
                        const res = await listActivityFiles(userId, a.id);
                        photos = (res || []).map((p) => ({
                            id: p.id,
                            name: p.originalName || decodeURIComponent((p.filePath || "").split("/").pop()),
                            size: p.sizeBytes ?? 0,
                            filePath: p.filePath,
                            url: toAbsUrl(p.filePath),
                        }));
                    } catch { /* ignore */ }
                    return {
                        id: a.id,
                        name: a.name ?? "",
                        type: a.type ?? "",
                        startDate: a.startDate ?? a.start_date ?? "",
                        endDate: a.endDate ?? a.end_date ?? "",
                        endDate: a.endDate ?? a.end_date ?? "",
                        description: a.description ?? "",
                        preference_level: a.preference_level ?? 0,
                        photos,
                    };
                })
            );
            setActivities(actsWithPhotos);
        } catch (err) {
            console.error("Load activities failed", err);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [userId]);


    // ---------- Actions ----------
    const handleCreateActivity = async (data) => {
        try {
            // Create "Folder" logic
            const payload = sanitizeDates(data, ["startDate", "endDate"]);
            await apiAddActivity(userId, payload);
            await fetchActivities();
            setViewMode("list");
            Swal.fire({ icon: 'success', title: 'สร้างกิจกรรมสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'สร้างไม่สำเร็จ', text: err.message });
        }
    };

    const handleUpdateActivity = async (id, data) => {
        try {
            const payload = sanitizeDates(data, ["startDate", "endDate"]);
            await apiUpdateActivity(id, payload);
            await fetchActivities();
            // Update selected activity state as well if we are in detail view
            if (selectedActivity && selectedActivity.id === id) {
                const updated = { ...selectedActivity, ...payload };
                setSelectedActivity(updated);
            }
            Swal.fire({ icon: 'success', title: 'อัปเดตสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'อัปเดตไม่สำเร็จ', text: err.message });
        }
    };

    const handleDeleteActivity = async (id) => {
        const ok = await confirmDelete('ยืนยันการลบกิจกรรม?', 'ลบโฟลเดอร์กิจกรรมนี้และรูปภาพทั้งหมด');
        if (!ok) return;

        try {
            await apiDeleteActivity(id);
            setActivities(prev => prev.filter(a => a.id !== id));
            if (selectedActivity?.id === id) {
                setSelectedActivity(null);
                setViewMode("list");
            }
            Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: err.message });
        }
    };

    const handleFileUpload = async (files) => {
        if (!selectedActivity || !files || !files.length) return;

        const valid = Array.from(files).filter((file) => {
            const okType = file.type?.startsWith("image/");
            const okSize = file.size <= 10 * 1024 * 1024;
            if (!okType) alert(`ไฟล์ ${file.name} ไม่ใช่รูปภาพ`);
            if (!okSize) alert(`ไฟล์ ${file.name} เกิน 10MB`);
            return okType && okSize;
        });
        if (!valid.length) return;

        try {
            const { files: uploaded = [] } = await uploadActivityFiles(userId, selectedActivity.id, valid);
            // Refresh data
            await fetchActivities();
            // Update current selected activity's photos locally to avoid full reload flicker if possible, 
            // but fetchActivities updates 'activities' state. We need to sync 'selectedActivity'.

            // Re-finding the activity from updated list (done in useEffect or manually)
            // Simplified: just re-fetch and update selected
            const acts = await getActivities(userId);
            // ... We reused the big fetch logic, let's just do a specific fetch or rely on global reload
            // For simplicity, I'll rely on the fact that I called fetchActivities which updates 'activities'
            // I need to update 'selectedActivity' from the new 'activities' list.

            // Hack: Quick local update for UI responsiveness
            const normalized = uploaded.map((f) => ({
                id: f.id,
                name: f.originalName || decodeURIComponent((f.filePath || "").split("/").pop()),
                size: f.sizeBytes ?? 0,
                filePath: f.filePath,
                url: toAbsUrl(f.filePath),
            }));

            setActivities(prev => prev.map(a =>
                a.id === selectedActivity.id
                    ? { ...a, photos: [...(a.photos || []), ...normalized] }
                    : a
            ));

            setSelectedActivity(prev => ({
                ...prev,
                photos: [...(prev.photos || []), ...normalized]
            }));

        } catch (err) {
            console.error(err);
            alert("อัปโหลดไม่สำเร็จ");
        }
    };

    const handleRemoveFile = async (fileId, idx) => {
        if (!selectedActivity) return;
        // Optimization: optimistic update
        const target = selectedActivity.photos[idx];
        if (!target?.id) return; // Should have id

        try {
            await deleteActivityFile(userId, target.id);
            // Update State
            setActivities(prev => prev.map(a =>
                a.id === selectedActivity.id
                    ? { ...a, photos: a.photos.filter((_, i) => i !== idx) }
                    : a
            ));
            setSelectedActivity(prev => ({
                ...prev,
                photos: prev.photos.filter((_, i) => i !== idx)
            }));
        } catch (err) {
            console.error("delete file error", err);
            alert("ลบรูปไม่สำเร็จ");
        }
    };


    // ---------- Render Views ----------

    // 1. Create/Edit Form (Embedded or Modal? Let's use a simple view for now)
    const renderForm = () => {
        // Simple internal state for form
        // If creating, empty. If editing, pre-fill.
        // For simplicity in this iteration, I'll put the form in the "Folder" detail view 
        // to edit properties, and a "Create New" modal/view.
        return null;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFE] p-6 font-['Sarabun',sans-serif]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <Users className="w-8 h-8 text-emerald-600" />
                    กิจกรรม (Activities)
                </h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFavorites(!showFavorites)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition ${showFavorites ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Star className={`w-5 h-5 ${showFavorites ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
                        <span>รายการโปรด</span>
                    </button>
                    {viewMode === "list" && (
                        <button
                            onClick={() => {
                                setSelectedActivity({ name: "", type: "", startDate: "", endDate: "", description: "", preference_level: 0 }); // Clean object for create
                                setViewMode("create");
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            สร้างโฟลเดอร์กิจกรรม
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {viewMode === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activities
                        .filter(a => !showFavorites || (a.preference_level && a.preference_level >= 4)) // Show level 4-5 as favorites? Or just > 0? User asked for "record/collect". Let's say all rated items? "Favorites" usually implies High/Highest (4-5). But let's verify user intent. User said "specify preference: much, most, little, least". "Favorites" filter might just be a quick way to see high rated ones. Let's stick with >= 4 for now as "Favorites" (Much/Most).
                        // wait, "favorites" usually means starred. Let's make it >= 1 if they want to see "rated" ones, OR let them toggle simply. 
                        // Actually, let's treat "Much (4)" and "Most (5)" as favorites for the filter.
                        .sort((a, b) => (b.preference_level || 0) - (a.preference_level || 0)) // Sort by rating
                        .map(act => (
                            <div
                                key={act.id}
                                onClick={() => {
                                    setSelectedActivity(act);
                                    setViewMode("detail");
                                }}
                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                            >
                                <div className="flex items-center justify-center h-32 bg-emerald-50 rounded-lg mb-4 relative overflow-hidden">
                                    {act.photos && act.photos.length > 0 ? (
                                        <img
                                            src={act.photos[0].url}
                                            alt="cover"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Folder className="w-16 h-16 text-emerald-200 group-hover:text-emerald-300 transition-colors" />
                                    )}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                            {act.photos?.length || 0} รูป
                                        </span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-800 truncate mb-1">{act.name}</h3>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs text-slate-500">{act.type || "ไม่ระบุประเภท"}</p>
                                    {act.preference_level > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs text-slate-600 font-medium">{act.preference_level}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto flex justify-between items-center text-xs text-slate-400">
                                    <span>{act.startDate ? new Date(act.startDate).toLocaleDateString('th-TH') : "-"}</span>
                                </div>
                            </div>
                        ))}

                    {activities.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            ยังไม่มีกิจกรรม กดปุ่ม "สร้างโฟลเดอร์กิจกรรม" เพื่อเริ่มต้น
                        </div>
                    )}
                </div>
            )}

            {viewMode === "create" && (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">สร้างกิจกรรมใหม่</h2>
                    <ActivityForm
                        initialData={selectedActivity}
                        onSubmit={handleCreateActivity}
                        onCancel={() => setViewMode("list")}
                    />
                </div>
            )}

            {viewMode === "detail" && selectedActivity && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
                    {/* Toolbar */}
                    <div className="border-b px-6 py-4 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <button
                            onClick={() => setViewMode("list")}
                            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            กลับไปหน้ารวม
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDeleteActivity(selectedActivity.id)}
                                className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                            >
                                ลบกิจกรรม
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Info Form */}
                        <div className="lg:col-span-1 border-r pr-6">
                            <h3 className="font-semibold text-lg mb-4 text-emerald-700">รายละเอียด</h3>
                            <ActivityForm
                                initialData={selectedActivity}
                                onSubmit={(data) => handleUpdateActivity(selectedActivity.id, data)}
                                isEdit={true}
                            />
                        </div>

                        {/* Right: Images */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg text-emerald-700">รูปภาพ ({selectedActivity.photos?.length || 0})</h3>
                                <div className="relative overflow-hidden">
                                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition">
                                        <Upload className="w-4 h-4" />
                                        เพิ่มรูปภาพ
                                    </button>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedActivity.photos?.map((file, idx) => (
                                    <div key={idx} className="group relative border rounded-lg p-2 bg-slate-50 hover:shadow-md transition">
                                        <div
                                            className="aspect-square bg-white rounded-md overflow-hidden mb-2 cursor-pointer"
                                            onClick={() => previewFileHandler(file)}
                                        >
                                            <img src={file.url} alt="img" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="text-xs text-slate-500 truncate mb-1">{file.name}</div>
                                        <button
                                            onClick={() => handleRemoveFile(file.id, idx)}
                                            className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {(!selectedActivity.photos || selectedActivity.photos.length === 0) && (
                                    <div className="col-span-full border-2 border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-400">
                                        ยังไม่มีรูปภาพ
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && previewFile && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4" onClick={closePreview}>
                    <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button onClick={closePreview} className="absolute -top-10 right-0 text-white hover:text-emerald-400">
                            <X className="w-8 h-8" />
                        </button>
                        <img src={previewFile.url} alt="preview" className="w-full h-full object-contain rounded-lg" />
                    </div>
                </div>
            )}

        </div>
    );
};

// Sub-component for Form to keep main component clean
const ActivityForm = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        startDate: "",
        endDate: "",
        startDate: "",
        endDate: "",
        description: "",
        preference_level: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                type: initialData.type || "",
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "", // ensure YYYY-MM-DD
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
                description: initialData.description || "",
                preference_level: initialData.preference_level || 0
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อกิจกรรม</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="เช่น กิจกรรมค่ายอาสา"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                    <option value="">เลือกประเภท</option>
                    <option value="กิจกรรมอาสาสมัคร">กิจกรรมอาสาสมัคร</option>
                    <option value="แข่งขันกีฬา">แข่งขันกีฬา</option>
                    <option value="การเรียนรู้">การเรียนรู้</option>
                    <option value="งานศิลปะ">งานศิลปะ</option>
                    <option value="กิจกรรมชุมชน">กิจกรรมชุมชน</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">เริ่ม</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สิ้นสุด</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="รายละเอียด..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ระดับความชอบ (ความประทับใจ)</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, preference_level: level }))}
                            className={`p-2 rounded-lg border transition ${formData.preference_level >= level
                                    ? 'bg-yellow-50 border-yellow-400 text-yellow-500'
                                    : 'bg-white border-slate-200 text-slate-300 hover:border-yellow-200'
                                }`}
                            title={["น้อยที่สุด", "น้อย", "ปานกลาง", "มาก", "มากที่สุด"][level - 1]}
                        >
                            <Star className={`w-6 h-6 ${formData.preference_level >= level ? 'fill-yellow-500' : ''}`} />
                        </button>
                    ))}
                    <div className="ml-2 flex items-center text-sm text-slate-500">
                        {formData.preference_level > 0
                            ? ["น้อยที่สุด", "น้อย", "ปานกลาง", "มาก", "มากที่สุด"][formData.preference_level - 1]
                            : "ยังไม่ระบุ"}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition">
                    {isEdit ? "บันทึกการแก้ไข" : "สร้างกิจกรรม"}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                        ยกเลิก
                    </button>
                )}
            </div>
        </form>
    );
};

export default ActivityPage;
