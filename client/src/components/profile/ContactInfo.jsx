import { useState } from 'react';
import { Eye, EyeOff, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { getProfile } from '../../services/authApi'; // Re-fetch helper if needed

// Helper for visibility
const VisibilityToggle = ({ isVisible, onToggle }) => (
    <button
        onClick={onToggle}
        className={`ml-2 p-1 rounded-md transition-all ${isVisible ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}
        title={isVisible ? "สาธารณะ" : "ส่วนตัว"}
    >
        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
    </button>
);

const ContactInfo = ({ user, onUpdate, viewingSelf }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: user?.phone || '',
        line_id: user?.line_id || '',
    });

    // Socials State
    const [socials, setSocials] = useState(user?.socials || []);
    const [visibility, setVisibility] = useState(user?.profile_visibility || {});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialChange = (index, field, value) => {
        const newSocials = [...socials];
        newSocials[index][field] = value;
        setSocials(newSocials);
    };

    const addSocial = () => {
        setSocials([...socials, { platform: 'Facebook', url: '', is_visible: 1 }]); // 1 for true
    };

    const removeSocial = (index) => {
        const newSocials = socials.filter((_, i) => i !== index);
        setSocials(newSocials);
    };

    const handleToggle = (field) => {
        if (!viewingSelf) return;
        setVisibility({ ...visibility, [field]: visibility[field] === false ? true : false });
    };

    const getVisibility = (field) => visibility[field] !== false;
    const canShow = (field) => viewingSelf || getVisibility(field);

    const handleSave = async () => {
        try {
            // 1. Update basic info
            await onUpdate({
                ...user,
                ...formData,
                profile_visibility: visibility
            });

            // 2. Update Socials (Separate Endpoint)
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE}/auth/profile/socials`, {
                socials: socials.map(s => ({ ...s, is_visible: s.is_visible ? true : false }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh user object by triggering a re-fetch? 
            // Ideally onUpdate should refetch or we update local state correctly.
            // For now, let UI update.

            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('บันทึกไม่สำเร็จ');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    📞 ช่องทางติดต่อ
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

            <div className="space-y-5">
                {/* Phone */}
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase">เบอร์โทรศัพท์</span>
                            {viewingSelf && <VisibilityToggle isVisible={getVisibility('phone')} onToggle={() => handleToggle('phone')} />}
                        </div>
                        {isEditing ? (
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded-md text-sm" />
                        ) : (
                            <p className="text-slate-800 font-medium">
                                {canShow('phone') ? (formData.phone || "-") : "ซ่อนข้อมูล"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase">อีเมล</span>
                            {/* Email visibility usually public? Or optional. Let's make optional */}
                            {viewingSelf && <VisibilityToggle isVisible={getVisibility('email')} onToggle={() => handleToggle('email')} />}
                        </div>
                        <p className="text-slate-800 font-medium break-all">
                            {canShow('email') ? formData.email : "ซ่อนข้อมูล"}
                        </p>
                    </div>
                </div>

                {/* Line ID */}
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-green-600 uppercase">Line ID</span>
                            {viewingSelf && <VisibilityToggle isVisible={getVisibility('line_id')} onToggle={() => handleToggle('line_id')} />}
                        </div>
                        {isEditing ? (
                            <input name="line_id" value={formData.line_id} onChange={handleChange} className="w-full p-2 border rounded-md text-sm" placeholder="Line ID" />
                        ) : (
                            <p className="text-slate-800 font-medium">
                                {canShow('line_id') ? (formData.line_id || "-") : "ซ่อนข้อมูล"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Socials */}
                <div className="pt-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Social Media</h3>

                    {isEditing ? (
                        <div className="space-y-3">
                            {socials.map((s, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <select
                                        value={s.platform}
                                        onChange={(e) => handleSocialChange(idx, 'platform', e.target.value)}
                                        className="p-2 border rounded-md w-1/3 text-sm"
                                    >
                                        <option value="Facebook">Facebook</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Twitter (X)">Twitter (X)</option>
                                        <option value="Website">Website</option>
                                        <option value="Github">Github</option>
                                    </select>
                                    <input
                                        value={s.url}
                                        onChange={(e) => handleSocialChange(idx, 'url', e.target.value)}
                                        className="p-2 border rounded-md flex-1 text-sm"
                                        placeholder="URL"
                                    />
                                    <button onClick={() => removeSocial(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addSocial} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mt-2">
                                <Plus size={16} /> เพิ่มช่องทาง
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {socials.length === 0 && <p className="text-slate-400 text-sm">-</p>}
                            {socials.map((s, idx) => (
                                <a
                                    key={idx}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                                >
                                    <span className="font-medium text-slate-700 group-hover:text-green-600">{s.platform}</span>
                                </a>
                            ))}
                        </div>
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
                        <Save size={18} /> บันทึก
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContactInfo;
