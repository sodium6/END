import React from "react";

export default function Activities({ activities }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-cyan-100">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-2xl p-6">
        <h3 className="text-xl font-semibold">กิจกรรมวันนี้</h3>
      </div>
      <div className="p-6 space-y-3">
        {activities.map((a) => (
          <div key={a.id} className="flex justify-between items-center bg-cyan-50 p-3 rounded-lg border border-cyan-100">
            <div>
              <p className="font-medium text-gray-800">{a.activity}</p>
              <p className="text-xs text-gray-500">{a.subject} • {a.time}</p>
            </div>
          </div>
        ))}
        <button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-2 text-sm font-medium">
          ดูตารางเรียนทั้งหมด
        </button>
      </div>
    </div>
  );
}
