import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authApi";
import Swal from "sweetalert2";
export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    st_id_canonical: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // เรียก API ผ่าน authApi.js
      const result = await loginUser(formData);
  
      await Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: "ยินดีต้อนรับ " + (result.user?.name || "ผู้ใช้"),
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#2d5a3d", // เขียว primary ของคุณ
      });
  
      navigate("/dashboard"); // ✅ เปลี่ยนไปหน้า dashboard
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: err.response?.data?.message || "โปรดลองอีกครั้ง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ef4444", // แดง
      });
    }
  };

  return (
    <div
      className="font-sarabun min-h-screen flex justify-center items-center p-5 
        bg-gradient-to-br from-green-950 via-green-800 to-green-700"
    >
      <div
        className="bg-white/20 backdrop-blur-lg rounded-3xl 
                  p-12 w-full max-w-md shadow-2xl text-center border border-white/20"
      >
        {/* Logo */}
        <div className="mb-12 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="RMUTK Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <h2 className="text-white text-3xl font-semibold mb-8 drop-shadow-sm">
          เข้าสู่ระบบ
        </h2>

        {/* Form */}
        <form className="mb-6 space-y-5" onSubmit={handleSubmit}>
          <div className="text-left">
            <label
              htmlFor="st_id_canonical"
              className="block text-white text-base mb-2 font-normal"
            >
              รหัสนักศึกษา:
            </label>
            <input
              type="text"
              id="st_id_canonical"
              name="st_id_canonical"
              value={formData.st_id_canonical}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg text-base bg-white shadow-inner 
                         focus:outline-none focus:ring-4 focus:ring-green-light 
                         focus:-translate-y-0.5 transition"
            />
          </div>

          <div className="text-left">
            <label
              htmlFor="password"
              className="block text-white text-base mb-2 font-normal"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg text-base bg-white shadow-inner 
                         focus:outline-none focus:ring-4 focus:ring-green-light 
                         focus:-translate-y-0.5 transition"
            />
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-lg text-base font-medium 
                         bg-gradient-to-r from-green-light to-green-300 text-green-dark shadow-lg
                         hover:from-green-300 hover:to-green-400 hover:-translate-y-0.5 hover:shadow-xl transition"
            >
              เข้าสู่ระบบ
            </button>
            <Link
              to="/sign-up"
              className="flex-1 py-3 px-5 border-2 border-white/40 rounded-lg text-base font-medium 
                         text-white hover:bg-white/10 hover:border-white hover:-translate-y-0.5 transition"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-white/80 text-sm text-center mt-5 pt-5 border-t border-white/30">
          ยังไม่มีบัญชี?{" "}
          <Link
            to="/sign-up"
            className="text-green-light font-medium hover:text-green-300 hover:underline"
          >
            สมัครสมาชิก
          </Link>
          <br />
          <span className="block mt-2">
            สำหรับนักศึกษาและศิษย์เก่าของมหาวิทยาลัยเทคโนโลยี่ราชมงคลเท่านั้น
          </span>
        </div>
      </div>
    </div>
  );
}
