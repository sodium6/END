import api from "./api";

// สมัครสมาชิก
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// เข้าสู่ระบบ
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

// ดึงข้อมูลโปรไฟล์ (ต้องมี token)
export const getProfile = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };
  
  // ออกจากระบบ
  export const logoutUser = async () => {
    const token = localStorage.getItem("token");
    try {
      await api.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn("logout API failed:", err);
    }
    localStorage.removeItem("token");
  };