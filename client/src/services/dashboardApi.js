// src/api/routes/dashboard.js
import api from "./api";

// helper เล็ก ๆ ให้คืนเฉพาะ res.data
const unwrap = (p) => p.then((r) => r.data);

// --------- public (ไม่ต้องส่ง token) ---------
export const getNews = (params = {}) =>
  unwrap(api.get("/dashboard/news", { params })); // ?limit ?offset

// --------- protected (ต้องมี Bearer token) ---------
export const getDashboardSummary = () =>
  unwrap(api.get("/dashboard/dashboard"));

export const getWorks = (params = { limit: 20, offset: 0 }) =>
  unwrap(api.get("/dashboard/works", { params }));

export const getActivities = (params = { limit: 20, offset: 0 }) =>
  unwrap(api.get("/dashboard/activities", { params }));

export const getSports = (params = { limit: 20, offset: 0 }) =>
  unwrap(api.get("/dashboard/sports", { params }));

export const getCertificates = (params = { limit: 20, offset: 0 }) =>
  unwrap(api.get("/dashboard/certificates", { params }));