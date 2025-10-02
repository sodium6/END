// services/certApi.js
import api from "./api";


api.interceptors.request.use((config) => {
  // สมมติคุณเก็บ token ไว้ใน localStorage หรือ sessionStorage
  const raw =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";
  if (raw) {
    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// ✅ ไม่ต้องส่ง user_id แล้ว
export const listMyCertificates = (params = {}) =>
  api.get(`/certificates/get`, { params }).then(r => r.data);

export const createCertificate = (formData) =>
  api.post(`/certificates/create`, formData).then(r => r.data);

export const updateCertificate = (id, formData) =>
  api.put(`/certificates/update/${id}`, formData).then(r => r.data);

export const deleteCertificate = (id) =>
  api.delete(`/certificates/delete/${id}`).then(r => r.data);

export const getCertificate = (id) =>
  api.get(`/certificates/get/${id}`).then(r => r.data);

// ถ้าจะ “ดาวน์โหลดจริง” เป็น blob ให้ใช้ /get/:id/file (ด้านล่างคือแบบขอดูไฟล์)
export const viewCertificateFile = (id) =>
  api.get(`/certificates/get/${id}/file`, { responseType: "blob" }).then(r => r.data);