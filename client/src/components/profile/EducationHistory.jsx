import { useState } from 'react';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import axios from 'axios';

const EducationHistory = ({ user, onUpdate, viewingSelf }) => {
    const [educations, setEducations] = useState(user?.education_history || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newEdu, setNewEdu] = useState({
        level: 'ปริญญาตรี',
        institution: 'มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ',
        faculty: '',
        program: '',
        start_year: '',
        end_year: '',
        gpa: ''
    });

    const handleDelete = async (id) => {
        if (!window.confirm("ต้องการลบข้อมูลนี้ใช่หรือไม่?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE}/auth/profile/education/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEducations(educations.filter(e => e.id !== id));
            // Trigger full update? Maybe not needed if local state is enough for display
        } catch (err) {
            console.error(err);
            alert("ลบไม่สำเร็จ");
        }
    };

    const handleAdd = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE}/auth/profile/education`, newEdu, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Instead of relying on response to get ID, let's just trigger a reload or onUpdate which fetches fresh data
            // Or we can assume success and append (but missing ID for delete).
            // Best to call onUpdate() to re-fetch entire profile or returned list.
            // But for simplicity, let's just reload page or ask parent to refetch.
            await onUpdate(null, true); // true = force refetch
            setIsAdding(false);
            setNewEdu({
                level: 'ปริญญาตรี',
                institution: 'มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ',
                faculty: '',
                program: '',
                start_year: '',
                end_year: '',
                gpa: ''
            });
        } catch (err) {
            console.error(err);
            alert("เพิ่มข้อมูลไม่สำเร็จ");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="text-green-600" /> ประวัติการศึกษา
                </h2>
                {viewingSelf && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <Plus size={16} /> เพิ่มข้อมูล
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 animate-fadeIn">
                    <h3 className="font-bold text-slate-700 mb-3">เพิ่มประวัติการศึกษา</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select
                            value={newEdu.level}
                            onChange={e => setNewEdu({ ...newEdu, level: e.target.value })}
                            className="p-2 border rounded-lg"
                        >
                            <option>มัธยมศึกษาตอนปลาย</option>
                            <option>ปวช.</option>
                            <option>ปวส.</option>
                            <option>ปริญญาตรี</option>
                            <option>ปริญญาโท</option>
                            <option>ปริญญาเอก</option>
                        </select>
                        <input
                            placeholder="ชื่อสถานศึกษา"
                            value={newEdu.institution}
                            onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })}
                            className="p-2 border rounded-lg"
                        />
                        <input
                            placeholder="คณะ"
                            value={newEdu.faculty}
                            onChange={e => setNewEdu({ ...newEdu, faculty: e.target.value })}
                            className="p-2 border rounded-lg"
                        />
                        <input
                            placeholder="สาขาวิชา"
                            value={newEdu.program}
                            onChange={e => setNewEdu({ ...newEdu, program: e.target.value })}
                            className="p-2 border rounded-lg"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="ปีที่เริ่ม"
                                value={newEdu.start_year}
                                onChange={e => setNewEdu({ ...newEdu, start_year: e.target.value })}
                                className="p-2 border rounded-lg w-full"
                            />
                            <input
                                type="number"
                                placeholder="ปีที่จบ (หรือคาดว่า)"
                                value={newEdu.end_year}
                                onChange={e => setNewEdu({ ...newEdu, end_year: e.target.value })}
                                className="p-2 border rounded-lg w-full"
                            />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="เกรดเฉลี่ย (Optional)"
                            value={newEdu.gpa}
                            onChange={e => setNewEdu({ ...newEdu, gpa: e.target.value })}
                            className="p-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-slate-500">ยกเลิก</button>
                        <button onClick={handleAdd} className="px-4 py-1.5 bg-green-600 text-white rounded-lg">บันทึก</button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {educations.length === 0 && <p className="text-center text-slate-400 py-4">ยังไม่มีข้อมูลการศึกษา</p>}
                {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="flex gap-4 p-4 border rounded-xl hover:border-green-200 transition-colors bg-slate-50/50">
                        <div className="bg-white p-3 rounded-full h-fit border border-slate-100 shadow-sm">
                            <GraduationCap className="text-green-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{edu.level}</h3>
                                    <p className="text-slate-600 font-medium">{edu.institution}</p>
                                </div>
                                {viewingSelf && (
                                    <button onClick={() => handleDelete(edu.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 text-sm text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                <p><span className="font-semibold">คณะ:</span> {edu.faculty || "-"}</p>
                                <p><span className="font-semibold">สาขา:</span> {edu.program || "-"}</p>
                                <p><span className="font-semibold">ปีการศึกษา:</span> {edu.start_year} - {edu.end_year || "ปัจจุบัน"}</p>
                                {edu.gpa && <p><span className="font-semibold">GPA:</span> {edu.gpa}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducationHistory;
