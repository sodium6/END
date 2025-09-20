import React from "react";

export default function QuickActions() {
  const actions = [
    { label: "ส่งงาน", color: "emerald" },
    { label: "กลุ่มเรียน", color: "blue" },
    { label: "เป้าหมาย", color: "purple" },
    { label: "พักผ่อน", color: "orange" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-red-100">
      <div className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-t-2xl p-6">
        <h3 className="text-xl font-semibold">การดำเนินการด่วน</h3>
      </div>
      <div className="p-6 grid grid-cols-2 gap-3">
        {actions.map((a, i) => (
          <button
            key={i}
            className={`border border-${a.color}-200 text-${a.color}-600 hover:bg-${a.color}-50 rounded-md py-4 text-sm font-medium`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
