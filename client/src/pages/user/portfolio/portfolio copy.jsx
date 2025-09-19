import { useState, useEffect, useRef } from 'react';
import { User, Briefcase, Users, Zap, Plus, X, Save, Upload, File } from 'lucide-react';
import {
  getUser,
  updateUser,
  getWork,
  addWork,
  updateWork,
  getActivities,
  addActivity,
  updateActivity,
  getSports,
  addSport,
  updateSport
} from "../../../services/portfolioApi";
import { jwtDecode } from "jwt-decode";
const Portfolio = () => {
    const token = localStorage.getItem("token");
    let userId = null;
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded.id; // 👈 id ที่ backend ใส่ตอน sign()
      } catch (err) {
        console.error("Decode token error:", err);
      }
    }
  
    // ถ้าไม่มี token ให้ redirect ไปหน้า login
    if (!userId) {
      window.location.href = "/sign-in";
      return null;
    }
  


  // ---------------- STATES ----------------
  const [personalInfo, setPersonalInfo] = useState({
    first_name_th: '',
    last_name_th: '',
    first_name_en: '',
    last_name_en: '',
    education: '',
    phone: '',
    email: '',
    st_id_display: '',
    password_new: ''
  });
  const [workExperiences, setWorkExperiences] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sports, setSports] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);


  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUser(userId);
        setPersonalInfo(userData || {});  
  
        const workData = await getWork(userId);
        setWorkExperiences(workData || []); 
  
        const activityData = await getActivities(userId);
        setActivities(activityData || []); 
  
        const sportsData = await getSports(userId);
        setSports(sportsData || []); 
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว:", err);
    
        setPersonalInfo({});
        setWorkExperiences([]);
        setActivities([]);
        setSports([]);
      }
    };
    fetchData();
  }, [userId]);
  

  // ---------------- PERSONAL INFO ----------------
  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const saveUserInfo = async () => {
    try {
      await updateUser(userId, personalInfo);
      alert("บันทึกข้อมูลผู้ใช้สำเร็จ");
    } catch (err) {
      console.error(err);
      alert("บันทึกข้อมูลผู้ใช้ล้มเหลว");
    }
  };

  // ---------------- WORK ----------------

  const addWorkExperience = async () => {
    try {
      const created = await addWork(userId, {
        jobTitle: "",
        startDate: "",
        endDate: "",
        jobDescription: "",
        portfolioLink: "",
      });
      setWorkExperiences(prev => [...prev, created]); // ✅ created ต้องมี id
    } catch (err) {
      console.error(err);
    }
  };


  const updateWorkExperience = async (id, field, value) => {
    setWorkExperiences(prev =>
      prev.map(work => work.id === id ? { ...work, [field]: value } : work)
    );
    try {
      const target = workExperiences.find(w => w.id === id);
      if (target) {
        await updateWork(id, { ...target, [field]: value });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeWorkExperience = (id) => {
    // 🔔 ถ้าอยากลบจริง ต้องเพิ่ม deleteWork API ด้วย
    setWorkExperiences(prev => prev.filter(work => work.id !== id));
  };

  // ---------------- ACTIVITIES ----------------
  const addActivityHandler = async () => {
    // เตรียม activity เปล่าไว้ก่อน
    const newActivity = {
      name: "",
      type: "",
      startDate: null,   // ใช้ null แทน "" กัน error date
      endDate: null,
      description: ""
    };
  
    try {
      // ยิงไป BE เพื่อสร้าง record จริง
      const created = await addActivity(userId, newActivity);
  
      // ถ้า BE return id กลับมา → เพิ่มเข้า state
      setActivities(prev => [...prev, created]);
    } catch (err) {
      console.error("addActivity error:", err);
  
      // fallback: ถ้า BE error → เพิ่ม activity เปล่าใน FE ให้ user กรอก
      setActivities(prev => [
        ...prev,
        { id: `tmp-${Date.now()}`, ...newActivity }
      ]);
    }
  };
  


  const updateActivityHandler = async (id, field, value) => {
    setActivities(prev =>
      prev.map(a => a.id === id ? { ...a, [field]: value } : a)
    );
    try {
      const target = activities.find(a => a.id === id);
      if (target) {
        await updateActivity(id, { ...target, [field]: value });
      }
    } catch (err) {
      console.error(err);
    }
  };



  const removeActivity = (id) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

 
  // ---------------- SPORTS ----------------
  const addSportHandler = async () => {
    const newSport = {
      name: '',
      type: '',
      date: '',
      result: '',
      description: ''
    };
    try {
      const created = await addSport(userId, newSport);
      setSports(prev => [...prev, created]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSportHandler = async (id, field, value) => {
    setSports(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
    try {
      const target = sports.find(s => s.id === id);
      if (target) {
        await updateSport(id, { ...target, [field]: value });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeSport = (id) => {
    setSports(prev => prev.filter(s => s.id !== id));
  };

  // ---------------- FILE HELPERS ----------------
  const handleWorkFileUpload = (workId, files) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (ขนาดไม่เกิน 10MB)`);
        return false;
      }
      return true;
    });
    setWorkExperiences(prev =>
      prev.map(work =>
        work.id === workId ? { ...work, files: [...work.files, ...validFiles] } : work
      )
    );
  };

  const removeWorkFile = (workId, fileIndex) => {
    setWorkExperiences(prev =>
      prev.map(work =>
        work.id === workId ? { ...work, files: work.files.filter((_, i) => i !== fileIndex) } : work
      )
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ---------------- SAVE PORTFOLIO ----------------
  const savePortfolio = async () => {
    await saveUserInfo();
    alert('บันทึก Portfolio สำเร็จ!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 font-['Sarabun',sans-serif]">
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
              : 'ชื่อนักศึกษา'
            }
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
                  onChange={(e) => handlePersonalInfoChange('first_name_th', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="ชื่อ (ไทย)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (ไทย)</label>
                <input
                  type="text"
                  value={personalInfo.last_name_th}
                  onChange={(e) => handlePersonalInfoChange('last_name_th', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="นามสกุล (ไทย)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">กำลังศึกษา</label>
                <input
                  type="text"
                  value={personalInfo.education}
                  onChange={(e) => handlePersonalInfoChange('education', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="เช่น ปวส.2 สาขาวิทยาการคอมพิวเตอร์"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="08x-xxx-xxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ (อังกฤษ)</label>
                <input
                  type="text"
                  value={personalInfo.first_name_en}
                  onChange={(e) => handlePersonalInfoChange('first_name_en', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (อังกฤษ)</label>
                <input
                  type="text"
                  value={personalInfo.last_name_en}
                  onChange={(e) => handlePersonalInfoChange('last_name_en', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="example@rmutk.ac.th"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รหัสนักศึกษา</label>
                <input
                  type="text"
                  value={personalInfo.st_id_display}
                  onChange={(e) => handlePersonalInfoChange('st_id_display', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="XXXXXXXXXXX-X"
                  disabled
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password (กรอกเฉพาะกรณีต้องการเปลี่ยน)</label>
                <input
                  type="password"
                  value={personalInfo.password_new}
                  onChange={(e) => handlePersonalInfoChange('password_new', e.target.value)}
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
                      onClick={() => removeWorkExperience(work.id)}
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
                        onChange={(e) => updateWorkExperience(work.id, 'jobTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="เช่น นักศึกษาฝึกงาน - บริษัท ABC"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มงาน</label>
                        <input
                          type="date"
                          value={work.startDate}
                          onChange={(e) => updateWorkExperience(work.id, 'startDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                        <input
                          type="date"
                          value={work.endDate}
                          onChange={(e) => updateWorkExperience(work.id, 'endDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดงาน</label>
                      <textarea
                        rows="4"
                        value={work.jobDescription}
                        onChange={(e) => updateWorkExperience(work.id, 'jobDescription', e.target.value)}
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
                          onChange={(e) => updateWorkExperience(work.id, 'portfolioLink', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          placeholder="https://github.com/yourusername หรือ https://yourdemo.com"
                        />
                        
                        <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer"
                             onClick={() => {
                               const input = document.createElement('input');
                               input.type = 'file';
                               input.multiple = true;
                               input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif';
                               input.onchange = (e) => handleWorkFileUpload(work.id, e.target.files);
                               input.click();
                             }}>
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
                        
                        {/* File List for this work experience */}
                        {work.files && work.files.length > 0 && (
                          <div className="space-y-2">
                            {work.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <File className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                </div>
                                <button
                                  onClick={() => removeWorkFile(work.id, fileIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
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
              onClick={addWorkExperience}
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
                        onChange={(e) => updateActivityHandler(activity.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="เช่น กิจกรรมค่ายอาสาสมัคร"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทกิจกรรม</label>
                      <select
                        value={activity.type}
                        onChange={(e) => updateActivityHandler(activity.id, 'type', e.target.value)}
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
                        value={activity.startDate}
                        onChange={(e) => updateActivityHandler(activity.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุดกิจกรรม</label>
                      <input
                        type="date"
                        value={activity.endDate}
                        onChange={(e) => updateActivityHandler(activity.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดกิจกรรม</label>
                      <textarea
                        rows="3"
                        value={activity.description}
                        onChange={(e) => updateActivityHandler(activity.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="เขียนรายละเอียดการกิจกรรม"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={addActivityHandler}
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
                      onClick={() => removeSport(sport.id)}
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
                        onChange={(e) => updateSportHandler(sport.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="เช่น ฟุตบอล, บาสเก็ตบอล"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทกีฬา</label>
                      <select
                        value={sport.type}
                        onChange={(e) => updateSportHandler(sport.id, 'type', e.target.value)}
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
                        value={sport.date}
                        onChange={(e) => updateSportHandler(sport.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ผลการแข่งขัน</label>
                      <select
                        value={sport.result}
                        onChange={(e) => updateSportHandler(sport.id, 'result', e.target.value)}
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
                        rows="3"
                        value={sport.description}
                        onChange={(e) => updateSportHandler(sport.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="เขียนรายละเอียดการแข่งขัน ประสบการณ์ที่ได้รับ และสิ่งที่ได้เรียนรู้"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={addSportHandler}
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
    </div>
  );
};

export default Portfolio;