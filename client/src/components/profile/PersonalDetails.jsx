import { useState } from 'react';
import { Eye, EyeOff, Edit2, Save, X } from 'lucide-react';

const FormField = ({ label, value, name, onChange, type = "text", options = null }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
        {options ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none"
            >
                <option value="">-- เลือก --</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none"
            />
        )}
    </div>
);

const VisibilityToggle = ({ isVisible, onToggle, label }) => (
    <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${isVisible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
        title={isVisible ? "สาธารณะ (แสดง)" : "ส่วนตัว (ซ่อน)"}
    >
        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        {isVisible ? 'แสดง' : 'ซ่อน'}
    </button>
);

const PersonalDetails = ({ user, onUpdate, viewingSelf }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        dob: user?.dob ? user.dob.split('T')[0] : '',
        gender: user?.gender || '',
        nationality: user?.nationality || '',
        address: user?.address || '',
        province: user?.province || '',
    });

    const [visibility, setVisibility] = useState(user?.profile_visibility || {});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToggle = (field) => {
        if (!viewingSelf) return;
        const newVis = { ...visibility, [field]: !visibility[field] }; // Default might be undefined (hidden?) or default true. logic handles it.
        // Let's assume default true if undefined
        const isNowVisible = visibility[field] === undefined ? false : !visibility[field]; // Invert

        // Actually simpler: store 'false' for hidden. 'true' or undefined for visible.
        // But let's be explicit.

        setVisibility({ ...visibility, [field]: !getVisibility(field) });
        // Ideally we should save this immediately or on save? 
        // Let's save immediately for UX or wait for save? 
        // The requirement implies settings. Let's do it on Save for now to keep it simple, or separate API.
        // Let's bundle with onUpdate.
    };

    const getVisibility = (field) => {
        // Default to true if not set
        return visibility[field] !== false;
    };

    const handleSave = async () => {
        try {
            await onUpdate({
                ...user,
                ...formData,
                profile_visibility: visibility
            });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('บันทึกไม่สำเร็จ');
        }
    };

    const canShow = (field) => viewingSelf || getVisibility(field);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    📋 ข้อมูลส่วนตัว
                </h2>
                {viewingSelf && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-slate-500 hover:text-green-600 p-2 rounded-full hover:bg-slate-50"
                    >
                        <Edit2 size={18} />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Row 1: BD, Gender, Nation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase">วันเกิด</span>
                            {viewingSelf && <VisibilityToggle isVisible={getVisibility('dob')} onToggle={() => handleToggle('dob')} />}
                        </div>
                        {isEditing ? (
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                        ) : (
                            <p className="text-slate-800 font-medium">
                                {canShow('dob') ? (formData.dob || "-") : <span className="text-slate-400 italic">ซ่อนข้อมูล</span>}
                            </p>
                        )}
                    </div>

                    <div className="group relative">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase">เพศ</span>
                        </div>
                        {isEditing ? (
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded-lg">
                                <option value="">- ระบุ -</option>
                                <option value="ชาย">ชาย</option>
                                <option value="หญิง">หญิง</option>
                                <option value="LGBTQ+">LGBTQ+</option>
                                <option value="ไม่ระบุ">ไม่ระบุ</option>
                            </select>
                        ) : (
                            <p className="text-slate-800 font-medium">{formData.gender || "-"}</p>
                        )}
                    </div>

                    <div className="group relative">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase">สัญชาติ</span>
                        </div>
                        {isEditing ? (
                            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                        ) : (
                            <p className="text-slate-800 font-medium">{formData.nationality || "-"}</p>
                        )}
                    </div>
                </div>

                {/* Row 2: Address */}
                <div className="border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase">ที่อยู่</span>
                        {viewingSelf && <VisibilityToggle isVisible={getVisibility('address')} onToggle={() => handleToggle('address')} />}
                    </div>
                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea
                                name="address"
                                placeholder="บ้านเลขที่, หมู่บ้าน, ถนน..."
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                                rows={2}
                            />
                            <input
                                name="province"
                                placeholder="จังหวัด"
                                value={formData.province}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    ) : (
                        <p className="text-slate-800">
                            {canShow('address') ? (
                                <>
                                    {formData.address && <span>{formData.address}</span>}
                                    {formData.province && <span> จ.{formData.province}</span>}
                                    {!formData.address && !formData.province && "-"}
                                </>
                            ) : <span className="text-slate-400 italic">ซ่อนข้อมูล</span>}
                        </p>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="mt-8 flex gap-3 justify-end border-t border-slate-100 pt-4">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
                    >
                        <X size={18} /> ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm"
                    >
                        <Save size={18} /> บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            )}
        </div>
    );
};

export default PersonalDetails;
