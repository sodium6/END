import React from "react";

export default function Notifications({ notifications }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-pink-100">
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-t-2xl p-6">
        <h3 className="text-xl font-semibold">การแจ้งเตือน</h3>
      </div>
      <div className="p-6 space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-pink-50 p-3 rounded-lg border border-pink-100">
            <p className="font-medium text-gray-800">{n.title}</p>
            <p className="text-xs text-gray-500">{n.time}</p>
          </div>
        ))}
        <button className="w-full mt-4 border border-pink-300 text-pink-600 rounded-md py-2 text-sm font-medium hover:bg-pink-50">
          ดูการแจ้งเตือนทั้งหมด
        </button>
      </div>
    </div>
  );
}

