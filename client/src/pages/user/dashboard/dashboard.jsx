import React, { useEffect, useMemo, useState } from "react";
import StatsOverview from "../../../components/dashboard/StatsOverview";
import SubjectsProgress from "../../../components/dashboard/SubjectsProgress";
import Activities from "../../../components/dashboard/Activities";
import Notifications from "../../../components/dashboard/Notifications";


import {
  getDashboardSummary,
  getWorks,
  getActivities,
  getNews,
} from "@/services/dashboardApi";

/* ------------------------ helpers ------------------------ */
const toTimeHHmm = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
};
const toRelativeTH = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} วันที่แล้ว`;
};

// normalizers (กัน BE ส่ง snake_case)
const normWork = (w) => ({
  id: w.id ?? w.wk_id ?? w.work_id,
  jobTitle: w.jobTitle ?? w.job_title ?? "-",
  startDate: w.startDate ?? w.start_date ?? w.createdAt ?? w.created_at,
  endDate: w.endDate ?? w.end_date ?? null,
  jobDescription: w.jobDescription ?? w.job_description ?? "",
  files: Array.isArray(w.files)
    ? w.files
    : Array.isArray(w.file_upload)
    ? w.file_upload
    : [],
});
const normActivity = (a) => ({
  id: a.id ?? a.activity_id,
  name: a.name ?? "-",
  type: a.type ?? "",
  startDate: a.startDate ?? a.start_date ?? a.createdAt ?? a.created_at,
  endDate: a.endDate ?? a.end_date ?? null,
  description: a.description ?? "",
  photos: Array.isArray(a.photos)
    ? a.photos
    : Array.isArray(a.activity_upload)
    ? a.activity_upload
    : [],
});
const normNews = (n) => ({
  id: n.id ?? n.news_id,
  title: n.title ?? "-",
  createdAt: n.createdAt ?? n.created_at ?? n.updatedAt ?? n.updated_at,
});

/* =========================================================
 *                      Dashboard (NEW)
 * =======================================================*/
export default function Dashboard() {
  // เวลา
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // data states
  const [summary, setSummary] = useState(null);
  const [works, setWorks] = useState([]);
  const [acts, setActs] = useState([]);
  const [news, setNews] = useState([]);

  // loading & error per-block
  const [loadingAll, setLoadingAll] = useState(true);
  const [errAll, setErrAll] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingAll(true);
        setErrAll(null);

        const [smy, wks, acs, nws] = await Promise.all([
          getDashboardSummary(),                  // /dashboard/dashboard
          getWorks({ limit: 50, offset: 0 }),     // /dashboard/works
          getActivities({ limit: 50, offset: 0 }),// /dashboard/activities
          getNews({ limit: 10, offset: 0 }),      // /dashboard/news (public)
        ]);

        if (!alive) return;
        setSummary(smy || null);
        setWorks(Array.isArray(wks) ? wks.map(normWork) : []);
        setActs(Array.isArray(acs) ? acs.map(normActivity) : []);
        setNews(Array.isArray(nws) ? nws.map(normNews) : []);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setErrAll(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoadingAll(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ---------------- map for child components ---------------- */
  // SubjectsProgress expects: { name, progress, grade, assignments, completed }[]
  const subjects = useMemo(() => {
    return works.map((w) => {
      const fileCount = Array.isArray(w.files) ? w.files.length : 0;
      return {
        name: w.jobTitle || "—",
        progress: fileCount > 0 ? 100 : 60, // heuristic
        grade: "-",                          // ไม่มีจริง
        assignments: fileCount,
        completed: fileCount,
      };
    });
  }, [works]);

  // Activities expects: { id, subject, activity, time }[]
  const activityItems = useMemo(() => {
    return acts.slice(0, 8).map((a) => ({
      id: a.id,
      subject: a.name || "-",
      activity: a.type || a.description || "-",
      time: toTimeHHmm(a.startDate),
    }));
  }, [acts]);

  // Notifications expects: { id, title, time }[]
  const notifications = useMemo(() => {
    return news.map((n) => ({
      id: n.id,
      title: n.title,
      time: toRelativeTH(n.createdAt),
    }));
  }, [news]);

  // StatsOverview: overall / done / total / subjectsCount / gpa
  const stats = useMemo(() => {
    const c = summary?.counts || {};
    const total =
      (c.works || 0) + (c.activities || 0) + (c.sports || 0) + (c.certificates || 0);

    const done = works.reduce((acc, w) => {
      const k = Array.isArray(w.files) ? w.files.length : 0;
      return acc + (k > 0 ? 1 : 0);
    }, 0);

    const overall = total > 0 ? Math.round((done / total) * 100) : 0;
    const subjectsCount = c.works || 0;

    return { total, done, overall, subjectsCount, gpa: undefined };
  }, [summary, works]);

  // header time/date
  const timeStr = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = now.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* --------------------------- UI --------------------------- */
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
          <p className="text-sm text-gray-500">
            สรุปข้อมูลผู้ใช้จาก API 
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums">{timeStr}</div>
          <div className="text-emerald-600 font-medium">{dateStr}</div>
        </div>
      </div>

      {/* Global error / loading */}
      {errAll && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          เกิดข้อผิดพลาด: {errAll}
        </div>
      )}
      {loadingAll && !errAll && (
        <div className="bg-white border p-4 rounded-xl shadow animate-pulse">
          กำลังโหลดข้อมูล…
        </div>
      )}

      {/* Stats */}
      {!loadingAll && !errAll && (
        <StatsOverview
  worksCount={summary?.counts?.works || 0}
  activitiesCount={summary?.counts?.activities || 0}
  sportsCount={summary?.counts?.sports || 0}
  certificatesCount={summary?.counts?.certificates || 0}
/>
       
      )}

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* วิชา + Progress */}
        <div className="lg:col-span-2">
          {!loadingAll && !errAll && (
            subjects.length > 0 ? (
              <SubjectsProgress subjects={subjects} />
            ) : (
              <div className="bg-white border rounded-xl p-6 text-gray-500">
                ยังไม่มีข้อมูลงาน (works)
              </div>
            )
          )}
        </div>

        {/* Sidebar ขวา */}
        <div className="space-y-6">
          {!loadingAll && !errAll && (
            activityItems.length > 0 ? (
              <Activities activities={activityItems} />
            ) : (
              <div className="bg-white border rounded-xl p-6 text-gray-500">
                ยังไม่มีกิจกรรมล่าสุด
              </div>
            )
          )}

          {!loadingAll && !errAll && (
            notifications.length > 0 ? (
              <Notifications notifications={notifications} />
            ) : (
              <div className="bg-white border rounded-xl p-6 text-gray-500">
                ยังไม่มีข่าว/การแจ้งเตือน
              </div>
            )
          )}


        </div>
      </div>
    </div>
  );
}
