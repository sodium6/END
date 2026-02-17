import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import axios from 'axios';

const HeaderProfile = ({ user, onUpdate, viewingSelf }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: user?.title || '',
        first_name_th: user?.first_name_th || '',
        last_name_th: user?.last_name_th || '',
        first_name_en: user?.first_name_en || '',
        last_name_en: user?.last_name_en || '',
        nickname: user?.nickname || '',
        about_me: user?.user_desc || '',
    });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await onUpdate({
                ...user,
                ...formData,
                user_desc: formData.about_me // Map back to DB field
            });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('บันทึกไม่สำเร็จ');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            // Assuming api wrapper is not standard axios, but let's use standard for upload to keep it clean or use the one from props context
            // Using direct axios for now, assuming base URL handling or relative path
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE}/upload/profile-pic`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update user profile with new pic URL
            // We need to call onUpdate to save the profile_pic field in DB? 
            // Or does upload just return URL and we must save it?
            // Yes, usually we save the URL.

            const newPicUrl = res.data.url;
            await onUpdate({ ...user, profile_pic: newPicUrl }); // Trigger save to DB

        } catch (err) {
            console.error(err);
            alert('อัปโหลดรูปภาพไม่สำเร็จ');
        }
    };



    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Image */}
                <div className="relative group mx-auto md:mx-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-200 flex items-center justify-center">
                        {user?.profile_pic ? (
                            <img
                                src={`${import.meta.env.VITE_API_BASE.replace('/api', '')}${user.profile_pic}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-5xl font-bold text-slate-400">
                                {user?.first_name_th?.charAt(0) || user?.first_name_en?.charAt(0) || "U"}
                            </span>
                        )}
                    </div>
                    {viewingSelf && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <Camera size={20} className="text-slate-600" />
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Info & Bio */}
                <div className="flex-1 w-full text-center md:text-left">
                    {isEditing ? (
                        <div className="space-y-4 max-w-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="title"
                                    placeholder="คำนำหน้า"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="p-2 border rounded-lg w-full"
                                />
                                <input
                                    name="nickname"
                                    placeholder="ชื่อเล่น"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    className="p-2 border rounded-lg w-full"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    name="first_name_th"
                                    placeholder="ชื่อ (ไทย)"
                                    value={formData.first_name_th}
                                    onChange={handleChange}
                                    className="p-2 border rounded-lg w-full"
                                />
                                <input
                                    name="last_name_th"
                                    placeholder="นามสกุล (ไทย)"
                                    value={formData.last_name_th}
                                    onChange={handleChange}
                                    className="p-2 border rounded-lg w-full"
                                />
                                <input
                                    name="first_name_en"
                                    placeholder="Name (English)"
                                    value={formData.first_name_en}
                                    onChange={handleChange}
                                    className="p-2 border rounded-lg w-full"
                                />
                                <input
                                    name="last_name_en"
                                    placeholder="Surname (English)"
                                    value={formData.last_name_en}
                                    onChange={handleChange}
                                    className="p-2 border rounded-lg w-full"
                                />
                            </div>
                            <textarea
                                name="about_me"
                                placeholder="แนะนำตัวเองสั้นๆ..."
                                value={formData.about_me}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border rounded-lg"
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
                                    {user?.title} {user?.first_name_th} {user?.last_name_th}
                                    {user?.nickname && <span className="text-lg text-slate-500 font-normal">({user.nickname})</span>}
                                </h1>
                                <p className="text-lg text-slate-600">{user?.first_name_en} {user?.last_name_en}</p>
                                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        {user?.st_id_canonical || user?.st_id}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                                        {user?.user_type}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">แนะนำตัว</h3>
                                <p className="whitespace-pre-line">{user?.user_desc || "ยังไม่ได้ระบุข้อมูลแนะนำตัว..."}</p>
                            </div>

                            {viewingSelf && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
                                >
                                    แก้ไขข้อมูลเบื้องต้น
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeaderProfile;
