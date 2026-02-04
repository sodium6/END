import { useEffect, useState } from "react";
import { Zap, Plus, X, Upload, Eye, File as FileIcon, ArrowLeft, Folder } from "lucide-react";
import {
    getSports,
    addSport as apiAddSport,
    updateSport as apiUpdateSport,
    deleteSport as apiDeleteSport,
} from "../../../services/portfolioApi";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const SportPage = () => {
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
    const [sports, setSports] = useState([]);
    const [selectedSport, setSelectedSport] = useState(null);
    const [viewMode, setViewMode] = useState("list"); // 'list' | 'detail' | 'create'

    // Note: Sports API currently DOES NOT support file uploads in the provided controller.
    // Based on `sportController.js` and `portfolio.jsx`, there is no `uploadSportFiles`.
    // The user requirement "create folder... allow adding images(pages)" might imply they want it for Sports too.
    // However, the backend `sportController` has NO file upload logic.
    // For now, I will implement the folder structure for managing the *Data* of the sport.
    // If image upload is strictly required for Sports, I would need backend changes.
    // Given the prompt "do not overwrite... pull logic", and `portfolio.jsx` has NO sport image upload,
    // I will assume Sport "Folder" just holds the details for now, OR I will check if I missed something.
    // Re-checking `portfolio.jsx` -> Correct, Sports only has name, type, date, result, description. No file upload UI for sports.

    // So for Sports, the "Folder" view is essentially the "Edit Detail" view.

    // ---------- utils ----------
    const sanitizeDates = (obj, fields) => {
        const copy = { ...obj };
        fields.forEach((f) => {
            if (copy[f] === "") copy[f] = null;
        });
        return copy;
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


    // ---------- Load Data ----------
    const fetchSports = async () => {
        try {
            const sps = await getSports(userId);
            // Ensure fields
            const safeSports = (Array.isArray(sps) ? sps : []).map(s => ({
                id: s.id,
                name: s.name || "",
                type: s.type || "",
                date: s.date || "",
                result: s.result || "",
                description: s.description || ""
            }));
            setSports(safeSports);
        } catch (err) {
            console.error("Load sports failed", err);
        }
    };

    useEffect(() => {
        fetchSports();
    }, [userId]);


    // ---------- Actions ----------
    const handleCreateSport = async (data) => {
        try {
            const payload = sanitizeDates(data, ["date"]);
            await apiAddSport(userId, payload);
            await fetchSports();
            setViewMode("list");
            Swal.fire({ icon: 'success', title: 'เพิ่มกีฬาสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'เพิ่มไม่สำเร็จ', text: err.message });
        }
    };

    const handleUpdateSport = async (id, data) => {
        try {
            const payload = sanitizeDates(data, ["date"]);
            await apiUpdateSport(id, payload);
            await fetchSports();
            if (selectedSport && selectedSport.id === id) {
                setSelectedSport({ ...selectedSport, ...payload });
            }
            Swal.fire({ icon: 'success', title: 'แก้ไขสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'แก้ไขไม่สำเร็จ', text: err.message });
        }
    };

    const handleDeleteSport = async (id) => {
        const ok = await confirmDelete('ยืนยันการลบกีฬา?', 'ลบข้อมูลกีฬานี้');
        if (!ok) return;

        try {
            await apiDeleteSport(id);
            setSports(prev => prev.filter(s => s.id !== id));
            if (selectedSport?.id === id) {
                setSelectedSport(null);
                setViewMode("list");
            }
            Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: err.message });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFE] p-6 font-['Sarabun',sans-serif]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <Zap className="w-8 h-8 text-emerald-600" />
                    กีฬา (Sports)
                </h1>

                {viewMode === "list" && (
                    <button
                        onClick={() => {
                            setSelectedSport({ name: "", type: "", date: "", result: "", description: "" });
                            setViewMode("create");
                        }}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        เพิ่มรายการคลังกีฬา
                    </button>
                )}
            </div>

            {/* List View */}
            {viewMode === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sports.map(sport => (
                        <div
                            key={sport.id}
                            onClick={() => {
                                setSelectedSport(sport);
                                setViewMode("detail");
                            }}
                            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col min-h-[180px]"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="truncate font-semibold text-slate-800 flex-1">{sport.name}</div>
                            </div>

                            <div className="space-y-1 text-sm text-slate-600 mb-4 flex-1">
                                <p><span className="text-slate-400">ประเภท:</span> {sport.type || "-"}</p>
                                <p><span className="text-slate-400">ผล:</span> {sport.result || "-"}</p>
                            </div>

                            <div className="mt-auto pt-3 border-t text-xs text-slate-400 flex justify-between">
                                <span>{sport.date ? new Date(sport.date).toLocaleDateString('th-TH') : "-"}</span>
                                <span className="text-emerald-500 font-medium group-hover:underline">แก้ไข</span>
                            </div>
                        </div>
                    ))}

                    {sports.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            ยังไม่มีรายการกีฬา กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น
                        </div>
                    )}
                </div>
            )}

            {/* Create View */}
            {viewMode === "create" && (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">เพิ่มรายการกีฬาใหม่</h2>
                    <SportForm
                        initialData={selectedSport}
                        onSubmit={handleCreateSport}
                        onCancel={() => setViewMode("list")}
                    />
                </div>
            )}

            {/* Detail View */}
            {viewMode === "detail" && selectedSport && (
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="border-b px-6 py-4 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <button
                            onClick={() => setViewMode("list")}
                            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            กลับไปหน้ารวม
                        </button>
                        <button
                            onClick={() => handleDeleteSport(selectedSport.id)}
                            className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                        >
                            ลบรายการ
                        </button>
                    </div>
                    <div className="p-8">
                        <SportForm
                            initialData={selectedSport}
                            onSubmit={(data) => handleUpdateSport(selectedSport.id, data)}
                            isEdit={true}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

const SportForm = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        date: "",
        result: "",
        description: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                type: initialData.type || "",
                date: initialData.date ? initialData.date.split('T')[0] : "",
                result: initialData.result || "",
                description: initialData.description || ""
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อกีฬา/รายการแข่งขัน</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="เช่น ฟุตบอลประเพณี"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทกีฬา</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">เลือกประเภท</option>
                        <option value="ฟุตบอล">ฟุตบอล</option>
                        <option value="บาสเก็ตบอล">บาสเก็ตบอล</option>
                        <option value="วอลเลย์บอล">วอลเลย์บอล</option>
                        <option value="แบดมินตัน">แบดมินตัน</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่แข่งขัน</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ผลการแข่งขัน</label>
                    <select
                        name="result"
                        value={formData.result}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">เลือกผลการแข่งขัน</option>
                        <option value="ชนะเลิศอันดับ 1">ชนะเลิศอันดับ 1</option>
                        <option value="รองชนะเลิศอันดับ 1">รองชนะเลิศอันดับ 1</option>
                        <option value="รองชนะเลิศอันดับ 2">รองชนะเลิศอันดับ 2</option>
                        <option value="เหรียญทองการแข่งขัน">เหรียญทองการแข่งขัน</option>
                        <option value="ไม่ได้รับรางวัล">ไม่ได้รับรางวัล</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="รายละเอียด..."
                />
            </div>

            <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium">
                    {isEdit ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium">
                        ยกเลิก
                    </button>
                )}
            </div>
        </form>
    );
};

export default SportPage;
