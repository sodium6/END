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
  const res = await api.get("/auth/profile"); // สมมติเรามี endpoint profile
  return res.data;
};

// ออกจากระบบ
export const logoutUser = () => {
  localStorage.removeItem("token");
};
