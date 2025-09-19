import React from "react";

export default function SubjectsProgress({ subjects }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100">
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-2xl p-6">
        <h3 className="text-xl font-semibold">ความคืบหน้าในแต่ละวิชา</h3>
      </div>
      <div className="p-6 space-y-4">
        {subjects.map((subject, i) => (
          <div key={i} className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-800">{subject.name} <span className="text-xs text-emerald-600">เกรด {subject.grade}</span></span>
              <span className="text-sm text-gray-600">{subject.completed}/{subject.assignments} งาน</span>
            </div>
            <div className="h-2 bg-emerald-100 rounded-full">
              <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${subject.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

