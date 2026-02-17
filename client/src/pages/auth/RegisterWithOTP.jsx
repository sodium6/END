import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser, verifyOtp, resendOtp } from "../../services/authApi";
import PrivacyPolicyModal from "../../components/PrivacyPolicyModal";

export default function RegisterWithOTP() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Register, 2: OTP
    const [emailForOtp, setEmailForOtp] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        user_type: "student", // default
        title: "",
        first_name_th: "",
        last_name_th: "",
        first_name_en: "",
        last_name_en: "",
        phone: "",
        email: "",
        education: "",
        st_id_main: "",
        st_id_check: "",
        password: "",
        confirm_password: "",
    });
    const [acceptPdpa, setAcceptPdpa] = useState(false);
    const [showPdpaModal, setShowPdpaModal] = useState(false);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "phone") value = value.replace(/\D/g, "").slice(0, 10);
        if (name === "st_id_main") value = value.replace(/\D/g, "").slice(0, 11);
        if (name === "st_id_check") value = value.replace(/\D/g, "").slice(0, 1);
        if (name === "otp") {
            setOtp(value.replace(/\D/g, "").slice(0, 6));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePasswords = () =>
        formData.password === formData.confirm_password;

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validatePasswords()) {
            alert("รหัสผ่านไม่ตรงกัน");
            return;
        }
        if (
            formData.st_id_main.length !== 11 ||
            formData.st_id_check.length !== 1
        ) {
            alert("กรุณากรอกรหัสนักศึกษาให้ครบ 11 หลัก + 1 หลัก");
            return;
        }

        if (!acceptPdpa) {
            alert("กรุณายอมรับนโยบายความเป็นส่วนตัว (PDPA) ก่อนสมัครสมาชิก");
            return;
        }

        const payload = {
            ...formData,
            st_id: `${formData.st_id_main}-${formData.st_id_check}`,
            st_id_canonical: `${formData.st_id_main}${formData.st_id_check}`,
        };

        setLoading(true);
        try {
            // Assuming registerUser now returns { message, email } on success from our new backend
            const result = await registerUser(payload);
            alert(result.message || "กรุณาตรวจสอบ Email เพื่อกรอกรหัส OTP");
            setEmailForOtp(formData.email);
            setStep(2);
        } catch (err) {
            console.error("Register error:", err);
            alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await verifyOtp(emailForOtp, otp); // We will add verifyOtp to authApi next
            alert("ยืนยันตัวตนสำเร็จ! กำลังเข้าสู่ระบบ...");
            // Auto login success, token should be stored by verifyOtp service or we do it here if it returns token
            // Our backend returns token in verifyEmail response
            if (result.token) {
                localStorage.setItem("token", result.token);
                // Navigate based on role or to home
                window.location.href = "/"; // Force refresh to update auth state header
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error("OTP Error:", err);
            alert(err.response?.data?.message || "รหัส OTP ไม่ถูกต้อง");
        } finally {
            setLoading(false);
        }
    };



    const handleResendOtp = async () => {
        if (!emailForOtp) return;
        setLoading(true);
        try {
            await resendOtp(emailForOtp);
            alert("ส่งรหัส OTP ใหม่ไปที่อีเมลเรียบร้อยแล้ว");
        } catch (err) {
            console.error("Resend OTP Error:", err);
            alert(err.response?.data?.message || "ไม่สามารถส่ง OTP ใหม่ได้");
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="font-sarabun min-h-screen flex justify-center items-center p-5 
          bg-gradient-to-br from-green-950 via-green-800 to-green-700">
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl 
                    p-10 w-full max-w-lg shadow-2xl border border-white/20 text-center">
                    <h2 className="text-white text-3xl font-semibold mb-6 drop-shadow-sm">
                        ยืนยันรหัส OTP
                    </h2>
                    <p className="text-white/80 mb-6">
                        รหัสยืนยันถูกส่งไปยังอีเมล: <br /> <strong className="text-white">{emailForOtp}</strong>
                    </p>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={handleChange}
                                placeholder="กรอกรหัส 6 หลัก"
                                maxLength={6}
                                required
                                className="w-full text-center text-3xl tracking-[1em] p-4 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light font-mono"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-5 rounded-lg font-medium 
                           bg-green-500 text-white shadow-lg
                           hover:bg-green-400 disabled:opacity-50 transition"
                        >
                            {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
                        </button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="text-white/80 hover:text-white underline text-sm disabled:opacity-50"
                            >
                                ไม่ได้รับรหัส? กดส่ง OTP อีกครั้ง
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sarabun min-h-screen flex justify-center items-center p-5 
        bg-gradient-to-br from-green-950 via-green-800 to-green-700">
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl 
                  p-10 w-full max-w-2xl shadow-2xl border border-white/20 text-center">

                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <img src="/logo.png" alt="RMUTK Logo" className="h-24 object-contain drop-shadow-lg" />
                </div>

                <h2 className="text-white text-3xl font-semibold mb-8 drop-shadow-sm">
                    สมัครสมาชิกใหม่
                </h2>

                <form className="mb-6 text-left space-y-4" onSubmit={handleRegister}>

                    {/* User Type Selection */}
                    <div className="flex gap-4 mb-6 bg-white/10 p-2 rounded-lg">
                        <label className={`flex-1 cursor-pointer text-center py-2 rounded-md transition ${formData.user_type === 'student' ? 'bg-green-500 text-white shadow' : 'text-white/70 hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="user_type"
                                value="student"
                                checked={formData.user_type === 'student'}
                                onChange={handleChange}
                                className="hidden"
                            />
                            นักศึกษาจ้า
                        </label>
                        <label className={`flex-1 cursor-pointer text-center py-2 rounded-md transition ${formData.user_type === 'alumni' ? 'bg-yellow-500 text-white shadow' : 'text-white/70 hover:bg-white/10'}`}>
                            <input
                                type="radio"
                                name="user_type"
                                value="alumni"
                                checked={formData.user_type === 'alumni'}
                                onChange={handleChange}
                                className="hidden"
                            />
                            ศิษย์เก่าจ้า
                        </label>
                    </div>

                    {/* คำนำหน้า */}
                    <div>
                        <label className="block text-white text-sm mb-1">คำนำหน้า:</label>
                        <select
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-green-light"
                        >
                            <option value="">เลือกคำนำหน้า</option>
                            <option value="นาย">นาย</option>
                            <option value="นางสาว">นางสาว</option>
                            <option value="นาง">นาง</option>
                        </select>
                    </div>

                    {/* ชื่อ-นามสกุลไทย */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-white text-sm mb-1">ชื่อ (ไทย):</label>
                            <input type="text" name="first_name_th" value={formData.first_name_th} onChange={handleChange} required className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white text-sm mb-1">นามสกุล (ไทย):</label>
                            <input type="text" name="last_name_th" value={formData.last_name_th} onChange={handleChange} required className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                    </div>

                    {/* ชื่อ-นามสกุลอังกฤษ */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-white text-sm mb-1">ชื่อ (อังกฤษ):</label>
                            <input type="text" name="first_name_en" value={formData.first_name_en} onChange={handleChange} required className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white text-sm mb-1">นามสกุล (อังกฤษ):</label>
                            <input type="text" name="last_name_en" value={formData.last_name_en} onChange={handleChange} required className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {/* เบอร์โทร */}
                        <div className="flex-1">
                            <label className="block text-white text-sm mb-1">เบอร์โทรศัพท์:</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0812345678" required className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                        {/* อีเมล */}
                        <div className="flex-[1.5]">
                            <label className="block text-white text-sm mb-1">อีเมล:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                    </div>

                    {/* การศึกษา */}
                    <div>
                        <label className="block text-white text-sm mb-1">ระดับการศึกษา:</label>
                        <select name="education" value={formData.education} onChange={handleChange} required className="w-full p-2.5 rounded-lg bg-white">
                            <option value="">เลือกระดับการศึกษา</option>
                            <option value="ม.6">ม.6</option>
                            <option value="ปวช.">ปวช.</option>
                            <option value="ปวส.">ปวส.</option>
                            <option value="ป.ตรี">ปริญญาตรี</option>
                            <option value="ป.โท">ปริญญาโท</option>
                            <option value="ป.เอก">ปริญญาเอก</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>

                    {/* รหัสนักศึกษา */}
                    <div>
                        <label className="block text-white text-sm mb-1">รหัสนักศึกษา:</label>
                        <div className="flex items-center gap-2">
                            <input type="text" name="st_id_main" value={formData.st_id_main} onChange={handleChange} placeholder="66605100039" required className="flex-1 p-2.5 rounded-lg bg-white" />
                            <span className="text-white">-</span>
                            <input type="text" name="st_id_check" value={formData.st_id_check} onChange={handleChange} placeholder="4" required className="w-16 p-2.5 text-center rounded-lg bg-white" />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-white text-sm mb-1">รหัสผ่าน:</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white text-sm mb-1">ยืนยันรหัสผ่าน:</label>
                            <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required className="w-full p-2.5 rounded-lg bg-white" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 mb-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={acceptPdpa}
                                    onChange={(e) => setAcceptPdpa(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-white/50 bg-white/10 transition-all checked:border-green-400 checked:bg-green-500 hover:border-white"
                                />
                                <svg
                                    className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <span className="text-white/90 text-sm leading-snug group-hover:text-white transition-colors select-none">
                                ข้าพเจ้ายอมรับ <span className="font-bold text-green-300">ข้อตกลงและเงื่อนไข</span> และ
                                <span
                                    className="font-bold text-green-300 hover:text-green-200 underline cursor-pointer ml-1"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowPdpaModal(true);
                                    }}
                                >
                                    นโยบายความเป็นส่วนตัว (PDPA)
                                </span>
                                ในการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลเพื่อการให้บริการของระบบ
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-4 mt-2 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-5 rounded-lg font-medium 
                         bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg
                         hover:from-green-500 hover:to-green-700 hover:-translate-y-0.5 transition"
                        >
                            {loading ? "กำลังบันทึก..." : "ถัดไป (ยืนยันตัวตน)"}
                        </button>
                        <Link to="/" className="flex-1 py-3 px-5 border border-white/50 rounded-lg text-white text-center hover:bg-white/10 transition">
                            ยกเลิก
                        </Link>
                    </div>
                </form>

                <div className="text-white/80 text-sm mt-4">
                    มีบัญชีแล้ว? <Link to="/" className="text-green-300 font-bold hover:underline">เข้าสู่ระบบ</Link>
                </div>
            </div>

            <PrivacyPolicyModal
                isOpen={showPdpaModal}
                onClose={() => setShowPdpaModal(false)}
            />
        </div>
    );
}
