import React from "react";

export default function StatsOverview({ overall, done, total, subjectsCount, gpa }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-emerald-100 text-sm font-medium">ความคืบหน้าโดยรวม</p>
        <p className="text-3xl font-bold">{overall}%</p>
        <div className="mt-3 h-2 bg-emerald-400 rounded-full">
          <div className="h-2 bg-white/80 rounded-full" style={{ width: `${overall}%` }} />
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-blue-100 text-sm font-medium">งานที่เสร็จแล้ว</p>
        <p className="text-3xl font-bold">{done}/{total}</p>
        <div className="mt-3 h-2 bg-blue-400 rounded-full">
          <div className="h-2 bg-white/80 rounded-full" style={{ width: `${Math.round((done/total)*100)}%` }} />
        </div>
      </div>

      {/* Subjects Count */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-purple-100 text-sm font-medium">วิชาที่ลงทะเบียน</p>
        <p className="text-3xl font-bold">{subjectsCount}</p>
      </div>

      {/* GPA */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-orange-100 text-sm font-medium">เกรดเฉลี่ย</p>
        <p className="text-3xl font-bold">{gpa}</p>
      </div>
    </div>
  );
}
