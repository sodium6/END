import { useState } from "react";
import { Link } from "react-router-dom";
export default function SignIn() {
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
      const res = await fetch("../../api/login/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      alert("ยินดีต้อนรับ " + (result.user?.name || "ผู้ใช้"));
      window.location.href = "../dashboard/dashboard.html";
    } catch (err) {
      console.error("Login error:", err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="font-sarabun min-h-screen flex justify-center items-center p-5 
        bg-gradient-to-br from-green-950 via-green-800 to-green-700">
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl 
                  p-12 w-full max-w-md shadow-2xl text-center border border-white/20">
        
        {/* Logo */}
        <div className="mb-12 flex items-center justify-center">
          <img
            src="../images/logo.png"
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
          <a
            href="../register/register.html"
            className="text-green-light font-medium hover:text-green-300 hover:underline"
          >
            สมัครสมาชิก
          </a>
          <br />
          <span className="block mt-2">
            สำหรับนักศึกษาและศิษย์เก่าของมหาวิทยาลัยเทคโนโลยี่ราชมงคลเท่านั้น
          </span>
        </div>
      </div>
    </div>
  );
}
