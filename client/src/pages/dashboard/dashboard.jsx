import React, { useState, useEffect, useMemo } from "react";

// คอมโพเนนต์ย่อยอยู่ในโฟลเดอร์เดียวกันกับไฟล์นี้
import StatsOverview from "../../components/dashboard/StatsOverview";
import SubjectsProgress from "../../components/dashboard/SubjectsProgress";
import Activities from "../../components/dashboard/Activities";
import Notifications from "../../components/dashboard/Notifications";
import QuickActions from "../../components/dashboard/QuickActions";

export default function StudentPortfolioDashboard() {
  const [now, setNow] = useState(new Date());

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

  const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
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
  );
}