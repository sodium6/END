import { useState } from "react";
import { User, Briefcase, Users, Zap, Plus, X, Save, Upload, File, Eye, Download } from "lucide-react";

const Portfolio = () => {
    // State for form data
    const [personalInfo, setPersonalInfo] = useState({
        first_name_th: "",
        last_name_th: "",
        first_name_en: "",
        last_name_en: "",
        education: "",
        phone: "",
        email: "",
        st_id_display: "",
        password_new: "",
    });

    const [workExperiences, setWorkExperiences] = useState([]);
    const [activities, setActivities] = useState([]);
    const [sports, setSports] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Utils
    const isTempId = (id) => typeof id === "string" && id.startsWith("tmp-");
    const tmpId = () => `tmp-${Date.now()}`;

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Personal info handlers
    const handlePersonalInfoChange = (field, value) => {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    };

    // Work experience handlers
    const addWorkRow = () => {
        const newWork = {
            id: tmpId(),
            jobTitle: "",
            startDate: "",
            endDate: "",
            jobDescription: "",
            portfolioLink: "",
            files: [],
        };
        setWorkExperiences((prev) => [...prev, newWork]);
    };

    const removeWorkRow = async (id) => {
        if (!confirm('ยืนยันการลบงาน?')) return;
        setWorkExperiences((prev) => prev.filter((w) => w.id !== id));
    };

    const updateWorkRow = (id, field, value) => {
        setWorkExperiences((prev) => 
            prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
        );
    };

    // File handling for work experiences
    const handleWorkFileUpload = async (workId, files) => {
        if (!files || !files.length) return;

        const validFiles = Array.from(files).filter((file) => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (ขนาดไม่เกิน 10MB)`);
                return false;
            }
            return true;
        });

        if (!validFiles.length) return;

        setWorkExperiences((prev) =>
            prev.map((work) =>
                work.id === workId
                    ? { 
                        ...work, 
                        files: [...(work.files || []), ...validFiles.map(file => ({
                            id: tmpId(),
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            file: file,
                            isTemp: true
                        }))]
                    }
                    : work
            )
        );
    };

    const removeWorkFile = async (workId, fileIndex) => {
        if (!confirm('ยืนยันการลบไฟล์?')) return;
        
        setWorkExperiences((prev) =>
            prev.map((work) =>
                work.id === workId
                    ? { 
                        ...work, 
                        files: work.files.filter((_, index) => index !== fileIndex)
                    }
                    : work
            )
        );
    };

    // File preview functionality
    const previewFileHandler = (file) => {
        if (!file) return;

        const fileUrl = file.file ? URL.createObjectURL(file.file) : file.url;
        const fileType = file.type || file.name.split('.').pop().toLowerCase();
        
        setPreviewFile({
            name: file.name,
            url: fileUrl,
            type: fileType,
            size: file.size
        });
        setShowPreview(true);
    };

    const closePreview = () => {
        if (previewFile && previewFile.url && previewFile.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewFile.url);
        }
        setPreviewFile(null);
        setShowPreview(false);
    };

    const isImageFile = (type) => {
        return type && (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type.toLowerCase()));
    };

    const isPDFFile = (type) => {
        return type === 'application/pdf' || type === 'pdf';
    };

    // Activity handlers
    const addActivityRow = () => {
        const newActivity = {
            id: tmpId(),
            name: "",
            type: "",
            startDate: "",
            endDate: "",
            description: ""
        };
        setActivities((prev) => [...prev, newActivity]);
    };

    const removeActivity = async (id) => {
        if (!confirm('ยืนยันการลบกิจกรรม?')) return;
        setActivities((prev) => prev.filter((a) => a.id !== id));
    };

    const updateActivityRow = (id, field, value) => {
        setActivities((prev) => 
            prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
        );
    };

    // Sport handlers
    const addSportRow = () => {
        const newSport = {
            id: tmpId(),
            name: "",
            type: "",
            date: "",
            result: "",
            description: ""
        };
        setSports((prev) => [...prev, newSport]);
    };

    const removeSportRow = async (id) => {
        if (!confirm('ยืนยันการลบกีฬา?')) return;
        setSports((prev) => prev.filter((s) => s.id !== id));
    };

    const updateSportRow = (id, field, value) => {
        setSports((prev) => 
            prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    // Save portfolio
    const savePortfolio = async () => {
        try {
            const portfolioData = {
                personalInfo,
                workExperiences,
                activities,
                sports,
                timestamp: new Date().toISOString()
            };
            
            console.log('Saving portfolio:', portfolioData);
            alert('บันทึก Portfolio สำเร็จ!');
        } catch (err) {
            console.error("savePortfolio error:", err);
            alert("บันทึกล้มเหลว กรุณาลองใหม่");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Portfolio</h1>
                    <p className="text-xl text-emerald-600">
                        {personalInfo.first_name_th && personalInfo.last_name_th
                            ? `${personalInfo.first_name_th} ${personalInfo.last_name_th}`
                            : "ชื่อนักศึกษา"}
                    </p>
                </div>

                {/* Personal Information Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <User className="w-6 h-6" />
                            ข้อมูลส่วนตัว
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ (ไทย)</label>
                                <input
                                    type="text"
                                    value={personalInfo.first_name_th}
                                    onChange={(e) => handlePersonalInfoChange("first_name_th", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="ชื่อ (ไทย)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (ไทย)</label>
                                <input
                                    type="text"
                                    value={personalInfo.last_name_th}
                                    onChange={(e) => handlePersonalInfoChange("last_name_th", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="นามสกุล (ไทย)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">กำลังศึกษา</label>
                                <input
                                    type="text"
                                    value={personalInfo.education}
                                    onChange={(e) => handlePersonalInfoChange("education", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="เช่น ปวส.2 สาขาวิทยาการคอมพิวเตอร์"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                                <input
                                    type="tel"
                                    value={personalInfo.phone}
                                    onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="08x-xxx-xxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ (อังกฤษ)</label>
                                <input
                                    type="text"
                                    value={personalInfo.first_name_en}
                                    onChange={(e) => handlePersonalInfoChange("first_name_en", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="First name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (อังกฤษ)</label>
                                <input
                                    type="text"
                                    value={personalInfo.last_name_en}
                                    onChange={(e) => handlePersonalInfoChange("last_name_en", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="Last name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                                <input
                                    type="email"
                                    value={personalInfo.email}
                                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="example@rmutk.ac.th"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">รหัสนักศึกษา</label>
                                <input
                                    type="text"
                                    value={personalInfo.st_id_display}
                                    onChange={(e) => handlePersonalInfoChange("st_id_display", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                    placeholder="XXXXXXXXXXX-X"
                                    disabled
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password (กรอกเฉพาะกรณีต้องการเปลี่ยน)
                                </label>
                                <input
                                    type="password"
                                    value={personalInfo.password_new}
                                    onChange={(e) => handlePersonalInfoChange("password_new", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Work Experience Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Briefcase className="w-6 h-6" />
                            ประวัติการทำงาน
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {workExperiences.map((work, index) => (
                                <div key={work.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">ประสบการณ์ทำงานที่ {index + 1}</h3>
                                        <button
                                            onClick={() => removeWorkRow(work.id)}
                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                        >
                                            ลบ
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ตำแหน่ง / บริษัท</label>
                                            <input
                                                type="text"
                                                value={work.jobTitle}
                                                onChange={(e) => updateWorkRow(work.id, "jobTitle", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                placeholder="เช่น นักศึกษาฝึกงาน - บริษัท ABC"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มงาน</label>
                                                <input
                                                    type="date"
                                                    value={work.startDate || ""}
                                                    onChange={(e) => updateWorkRow(work.id, "startDate", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                                                <input
                                                    type="date"
                                                    value={work.endDate || ""}
                                                    onChange={(e) => updateWorkRow(work.id, "endDate", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดงาน</label>
                                            <textarea
                                                rows={4}
                                                value={work.jobDescription}
                                                onChange={(e) => updateWorkRow(work.id, "jobDescription", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                placeholder="เขียนรายละเอียดงานที่ทำ หน้าที่รับผิดชอบ และสิ่งที่ได้เรียนรู้"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ลิงก์ผลงาน หรือไฟล์แนบ</label>
                                            <div className="space-y-4">
                                                <input
                                                    type="url"
                                                    value={work.portfolioLink}
                                                    onChange={(e) => updateWorkRow(work.id, "portfolioLink", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                    placeholder="https://github.com/yourusername หรือ https://yourdemo.com"
                                                />

                                                <div
                                                    className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer"
                                                    onClick={() => {
                                                        const input = document.createElement("input");
                                                        input.type = "file";
                                                        input.multiple = true;
                                                        input.accept = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif";
                                                        input.onchange = (e) => handleWorkFileUpload(work.id, e.target.files);
                                                        input.click();
                                                    }}
                                                >
                                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="mt-4">
                                                        <button
                                                            type="button"
                                                            className="bg-white text-emerald-600 px-4 py-2 border-2 border-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors"
                                                        >
                                                            เลือกไฟล์ผลงาน
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-500">PNG, JPG, PDF, DOC, PPT (ขนาดไม่เกิน 10MB)</p>
                                                </div>

                                                {work.files && work.files.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-medium text-gray-700">ไฟล์ที่แนบ:</h4>
                                                        {work.files.map((file, fileIndex) => (
                                                            <div key={fileIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                                <div className="flex items-center gap-2">
                                                                    <File className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-sm font-medium">{file.name}</span>
                                                                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => previewFileHandler(file)}
                                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                                        title="ดูตัวอย่าง"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => removeWorkFile(work.id, fileIndex)}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                        title="ลบไฟล์"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addWorkRow}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-6 hover:from-emerald-600 hover:to-green-700 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            เพิ่มประสบการณ์ทำงาน
                        </button>
                    </div>
                </div>

                {/* Activities Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Users className="w-6 h-6" />
                            หมวดหมู่กิจกรรม
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {activities.map((activity, index) => (
                                <div key={activity.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">กิจกรรมที่ {index + 1}</h3>
                                        <button
                                            onClick={() => removeActivity(activity.id)}
                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อกิจกรรม</label>
                                            <input
                                                type="text"
                                                value={activity.name}
                                                onChange={(e) => updateActivityRow(activity.id, "name", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="เช่น กิจกรรมค่ายอาสาสมัคร"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทกิจกรรม</label>
                                            <select
                                                value={activity.type}
                                                onChange={(e) => updateActivityRow(activity.id, "type", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มกิจกรรม</label>
                                            <input
                                                type="date"
                                                value={activity.startDate || ""}
                                                onChange={(e) => updateActivityRow(activity.id, "startDate", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุดกิจกรรม</label>
                                            <input
                                                type="date"
                                                value={activity.endDate || ""}
                                                onChange={(e) => updateActivityRow(activity.id, "endDate", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดกิจกรรม</label>
                                            <textarea
                                                rows={3}
                                                value={activity.description}
                                                onChange={(e) => updateActivityRow(activity.id, "description", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="เขียนรายละเอียดการกิจกรรม"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addActivityRow}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-6 hover:from-emerald-600 hover:to-green-700 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            เพิ่มกิจกรรม
                        </button>
                    </div>
                </div>

                {/* Sports Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Zap className="w-6 h-6" />
                            กีฬา
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {sports.map((sport, index) => (
                                <div key={sport.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">กีฬาที่ {index + 1}</h3>
                                        <button
                                            onClick={() => removeSportRow(sport.id)}
                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อกีฬา/ประเภทกีฬา</label>
                                            <input
                                                type="text"
                                                value={sport.name}
                                                onChange={(e) => updateSportRow(sport.id, "name", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="เช่น ฟุตบอล, บาสเก็ตบอล"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทกีฬา</label>
                                            <select
                                                value={sport.type}
                                                onChange={(e) => updateSportRow(sport.id, "type", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                <option value="">เลือกประเภท</option>
                                                <option value="ฟุตบอล">ฟุตบอล</option>
                                                <option value="บาสเก็ตบอล">บาสเก็ตบอล</option>
                                                <option value="วอลเลย์บอล">วอลเลย์บอล</option>
                                                <option value="แบดมินตัน">แบดมินตัน</option>
                                                <option value="ลู่">ลู่</option>
                                                <option value="ลาน">ลาน</option>
                                                <option value="ปิงปอง">ปิงปอง</option>
                                                <option value="เทนนิส">เทนนิส</option>
                                                <option value="มวยไทย">มวยไทย</option>
                                                <option value="อื่นๆ">อื่นๆ</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่แข่งขัน</label>
                                            <input
                                                type="date"
                                                value={sport.date || ""}
                                                onChange={(e) => updateSportRow(sport.id, "date", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ผลการแข่งขัน</label>
                                            <select
                                                value={sport.result}
                                                onChange={(e) => updateSportRow(sport.id, "result", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                <option value="">เลือกผลการแข่งขัน</option>
                                                <option value="ชนะเลิศอันดับ 1">ชนะเลิศอันดับ 1</option>
                                                <option value="รองชนะเลิศอันดับ 1">รองชนะเลิศอันดับ 1</option>
                                                <option value="รองชนะเลิศอันดับ 2">รองชนะเลิศอันดับ 2</option>
                                                <option value="เหรียญทองการแข่งขัน">เหรียญทองการแข่งขัน</option>
                                                <option value="ไม่ได้รับรางวัล">ไม่ได้รับรางวัล</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
                                            <textarea
                                                rows={3}
                                                value={sport.description}
                                                onChange={(e) => updateSportRow(sport.id, "description", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="เขียนรายละเอียดการแข่งขัน ประสบการณ์ที่ได้รับ และสิ่งที่ได้เรียนรู้"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addSportRow}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-6 hover:from-emerald-600 hover:to-green-700 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            เพิ่มกีฬา
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="text-center pt-8">
                    <button
                        onClick={savePortfolio}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xl px-12 py-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                    >
                        <Save className="w-6 h-6" />
                        บันทึก Portfolio
                    </button>
                </div>
            </div>

            {/* File Preview Modal */}
            {showPreview && previewFile && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <File className="w-5 h-5 text-gray-500" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">{previewFile.name}</h3>
                                    <p className="text-sm text-gray-500">{formatFileSize(previewFile.size)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {previewFile.url && (
                                    <a
                                        href={previewFile.url}
                                        download={previewFile.name}
                                        className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        ดาวน์โหลด
                                    </a>
                                )}
                                <button
                                    onClick={closePreview}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 max-h-[70vh] overflow-auto">
                            {isImageFile(previewFile.type) ? (
                                <div className="text-center">
                                    <img
                                        src={previewFile.url}
                                        alt={previewFile.name}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg mx-auto"
                                    />
                                </div>
                            ) : isPDFFile(previewFile.type) ? (
                                <div className="w-full h-96">
                                    <iframe
                                        src={previewFile.url}
                                        className="w-full h-full border border-gray-300 rounded-lg"
                                        title={previewFile.name}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">ไม่สามารถแสดงตัวอย่างไฟล์นี้ได้</p>
                                    <p className="text-sm text-gray-500">
                                        ประเภทไฟล์: {previewFile.type || 'ไม่ทราบ'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Portfolio;