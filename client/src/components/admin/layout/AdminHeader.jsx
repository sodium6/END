import React from "react";

export default function AdminHeader() {
  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative text-gray-600 hover:text-gray-800">
          🔔
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-2">
          <img
            src="https://i.pravatar.cc/40"
            alt="Admin Avatar"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-gray-700 font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
