import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authApi"; // ✅ import service

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "st_id_main") value = value.replace(/\D/g, "").slice(0, 11);
    if (name === "st_id_check") value = value.replace(/\D/g, "").slice(0, 1);

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswords = () =>
    formData.password === formData.confirm_password;

  const handleSubmit = async (e) => {
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

    const payload = {
      ...formData,
      st_id: `${formData.st_id_main}-${formData.st_id_check}`,
      st_id_canonical: `${formData.st_id_main}${formData.st_id_check}`, // ✅ ส่งรวมด้วย
    };

    try {
      const result = await registerUser(payload); // ✅ ใช้ service
      alert(result.message || "สมัครสมาชิกสำเร็จ");
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  return (
    <div className="font-sarabun min-h-screen flex justify-center items-center p-5 
        bg-gradient-to-br from-green-950 via-green-800 to-green-700">
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl 
                  p-10 w-full max-w-2xl shadow-2xl border border-white/20 text-center">
        
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <img
            src="/logo.png"
            alt="RMUTK Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <h2 className="text-white text-3xl font-semibold mb-10 drop-shadow-sm">
          สมัครสมาชิก
        </h2>

        {/* Form */}
        <form className="mb-6 text-left space-y-5" onSubmit={handleSubmit}>
          {/* คำนำหน้า */}
          <div>
            <label className="block text-white text-base mb-2">คำนำหน้า:</label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-green-light transition"
            >
              <option value="">เลือกคำนำหน้า</option>
              <option value="นาย">นาย</option>
              <option value="นางสาว">นางสาว</option>
              <option value="นาง">นาง</option>
            </select>
          </div>

          {/* ชื่อ-นามสกุลไทย */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-white mb-2">ชื่อ (ไทย):</label>
              <input
                type="text"
                name="first_name_th"
                value={formData.first_name_th}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white mb-2">นามสกุล (ไทย):</label>
              <input
                type="text"
                name="last_name_th"
                value={formData.last_name_th}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
              />
            </div>
          </div>

          {/* ชื่อ-นามสกุลอังกฤษ */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-white mb-2">ชื่อ (อังกฤษ):</label>
              <input
                type="text"
                name="first_name_en"
                value={formData.first_name_en}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white mb-2">นามสกุล (อังกฤษ):</label>
              <input
                type="text"
                name="last_name_en"
                value={formData.last_name_en}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
              />
            </div>
          </div>

          {/* เบอร์โทร */}
          <div>
            <label className="block text-white mb-2">เบอร์โทรศัพท์:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0812345678"
              required
              className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
            />
          </div>

          {/* อีเมล */}
          <div>
            <label className="block text-white mb-2">อีเมล:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
            />
          </div>

          {/* การศึกษา */}
          <div>
            <label className="block text-white mb-2">ระดับการศึกษา:</label>
            <select
              name="education"
              value={formData.education}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
            >
              <option value="">เลือกระดับการศึกษา</option>
              <option value="ม.6">มัธยมศึกษาตอนปลาย (ม.6)</option>
              <option value="ปวช.">ปวช.</option>
              <option value="ปวส.">ปวส.</option>
              <option value="ป.ตรี">ปริญญาตรี</option>
              <option value="ป.โท">ปริญญาโท</option>
              <option value="ป.เอก">ปริญญาเอก</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          {/* รหัสนักศึกษา */}
          <label className="block text-white mb-2">รหัสนักศึกษา:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="st_id_main"
              value={formData.st_id_main}
              onChange={handleChange}
              placeholder="66605100039"
              required
              className="flex-1 p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
            />
            <span className="text-white text-lg">-</span>
            <input
              type="text"
              name="st_id_check"
              value={formData.st_id_check}
              onChange={handleChange}
              placeholder="4"
              required
              className="w-16 p-3 text-center rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white mb-2">รหัสผ่าน:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
            />
            <small className="block text-white/70 text-xs mt-1 italic">
              รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
            </small>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-white mb-2">ยืนยันรหัสผ่าน:</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white shadow-inner focus:ring-4 focus:ring-green-light"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-lg font-medium 
                         bg-gradient-to-r from-green-light to-green-300 text-green-dark shadow-lg
                         hover:from-green-300 hover:to-green-400 hover:-translate-y-0.5 hover:shadow-xl transition"
            >
              สมัครสมาชิก
            </button>
            <Link
              to="/"
              className="flex-1 py-3 px-5 border-2 border-white/40 rounded-lg font-medium 
                         text-white hover:bg-white/10 hover:border-white hover:-translate-y-0.5 transition text-center"
            >
              ยกเลิก
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-white/80 text-sm text-center mt-5 pt-5 border-t border-white/30">
          มีบัญชีแล้ว?{" "}
          <Link
            to="/"
            className="text-green-light font-medium hover:text-green-300 hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}