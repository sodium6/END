import api from "./api";

// สมัครสมาชิก
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// ยืนยัน OTP (Email)
export const verifyOtp = async (email, otp) => {
  const res = await api.post("/auth/verify-email", { email, otp });
  // Store token if returned
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

// ขอ OTP ใหม่ (Resend)
export const resendOtp = async (email) => {
  const res = await api.post("/auth/resend-otp", { email });
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

// Password Reset Functions (Existing)
export const requestOtp = async (stIdCanonical) => {
  const { data } = await api.post("/auth/requestOtp", {
    st_id_canonical: stIdCanonical,
  });
  return data;
};

export const verifyResetOtp = async (stIdCanonical, otp) => {
  const { data } = await api.post("/auth/verifyOtp", {
    st_id_canonical: stIdCanonical,
    otp,
  });
  return data;
};

export const resetPassword = async (stIdCanonical, resetToken, newPassword) => {
  const { data } = await api.post("/auth/resetPassword", {
    st_id_canonical: stIdCanonical,
    reset_token: resetToken,
    new_password: newPassword,
  });
  return data;
};