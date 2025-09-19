import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/layout/Sidebar";

// คอมโพเนนต์ย่อยอยู่ในโฟลเดอร์เดียวกันกับไฟล์นี้
import StatsOverview from "./StatsOverview";
import SubjectsProgress from "./SubjectsProgress";
import Activities from "./Activities";
import Notifications from "./Notifications";
import QuickActions from "./QuickActions";

export default function StudentPortfolioDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      setIsOpen(!m);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const subjects = useMemo(
    () => [
      { name: "คณิตศาสตร์", progress: 85, grade: "A", assignments: 12, completed: 10 },
      { name: "ฟิสิกส์", progress: 78, grade: "B+", assignments: 8, completed: 6 },
      { name: "เคมี", progress: 92, grade: "A", assignments: 10, completed: 9 },
      { name: "ภาษาอังกฤษ", progress: 88, grade: "A", assignments: 15, completed: 13 },
      { name: "ประวัติศาสตร์", progress: 75, grade: "B", assignments: 6, completed: 4 },
      { name: "ภาษาไทย", progress: 90, grade: "A", assignments: 8, completed: 7 },
    ],
    []
  );

  const activities = [
    { id: 1, subject: "คณิตศาสตร์", activity: "ทำแบบฝึกหัดบทที่ 5", time: "09:30" },
    { id: 2, subject: "ฟิสิกส์", activity: "อ่านบทเรียนเรื่องแสง", time: "10:45" },
    { id: 3, subject: "เคมี", activity: "เตรียมการทดลอง", time: "14:00" },
    { id: 4, subject: "ภาษาอังกฤษ", activity: "เขียนเรียงความ", time: "16:30" },
  ];

  const notifications = [
    { id: 1, title: "การบ้านคณิตศาสตร์ครบกำหนดในวันพรุ่งนี้", time: "2 ชั่วโมงที่แล้ว" },
    { id: 2, title: "คะแนนสอบฟิสิกส์ออกแล้ว", time: "4 ชั่วโมงที่แล้ว" },
    { id: 3, title: "ประชุมกลุ่มโครงงานวิทยาศาสตร์", time: "6 ชั่วโมงที่แล้ว" },
  ];

  const total = subjects.reduce((a, s) => a + s.assignments, 0);
  const done = subjects.reduce((a, s) => a + s.completed, 0);
  const overall = Math.round((done / total) * 100);

  const toggleCollapse = () => setIsCollapsed((v) => !v);
  const closeSidebar = () => setIsOpen(false);
  const onLogout = () => { if (confirm("คุณต้องการออกจากระบบหรือไม่?")) alert("ออกจากระบบเรียบร้อย"); };

  const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,#ecfdf5,#f0fdf4,#f0fdfa)] font-[Sarabun,sans-serif]">
      {/* Toggle (mobile) */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-white shadow-md border border-slate-100 md:hidden hover:bg-slate-50 transition-all"
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <Sidebar
        isMobile={isMobile}
        isOpen={isOpen}
        closeSidebar={closeSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        onLogout={onLogout}
      />

      {/* Content */}
      <main className={`transition-all duration-300 min-h-screen p-4 ${!isMobile ? (isCollapsed ? "md:ml-[7rem]" : "md:ml-[20rem]") : "ml-0"}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
              <p className="text-sm text-gray-500">ตัวอย่างการแยก Sidebar เป็นคอมโพเนนต์</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">{timeStr}</div>
              <div className="text-emerald-600 font-medium">{dateStr}</div>
            </div>
          </div>

          {/* Stats 4 การ์ด */}
          <StatsOverview
            overall={overall}
            done={done}
            total={total}
            subjectsCount={subjects.length}
            gpa={3.65}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* วิชา + Progress */}
            <div className="lg:col-span-2">
              <SubjectsProgress subjects={subjects} />
            </div>

            {/* Sidebar ขวา */}
            <div className="space-y-6">
              <Activities activities={activities} />
              <Notifications notifications={notifications} />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
