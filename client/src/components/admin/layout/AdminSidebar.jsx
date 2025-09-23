import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiChevronDown, FiGrid, FiUsers, FiFileText, FiBarChart2, FiSettings } from 'react-icons/fi';

const SidebarLink = ({ to, icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-gray-900 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`
    }
  >
    {icon}
    {children}
  </NavLink>
);

const CollapsibleLink = ({ icon, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
      >
        <div className="flex items-center">
          {icon}
          {title}
        </div>
        <FiChevronDown className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 pl-3 border-l border-gray-600 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default function AdminSidebar() {
  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center">Admin</h2>
      </div>
      <nav className="space-y-2 flex-1">
        <SidebarLink to="/admin/dashboard" icon={<FiGrid className="mr-3" />}>
          Dashboard
        </SidebarLink>

        <CollapsibleLink icon={<FiUsers className="mr-3" />} title="จัดการผู้ใช้">
          <SidebarLink to="/admin/users">รายชื่อผู้ใช้</SidebarLink>
          <SidebarLink to="/admin/users/create">เพิ่มผู้ใช้ใหม่</SidebarLink>
        </CollapsibleLink>

        <CollapsibleLink icon={<FiFileText className="mr-3" />} title="จัดการเนื้อหา">
          <SidebarLink to="/admin/content/news">ข่าวสาร</SidebarLink>
          <SidebarLink to="/admin/content/announcements">ประกาศ</SidebarLink>
        </CollapsibleLink>

        <SidebarLink to="/admin/analytics" icon={<FiBarChart2 className="mr-3" />}>
          การวิเคราะห์
        </SidebarLink>
        <SidebarLink to="/admin/settings" icon={<FiSettings className="mr-3" />}>
          การตั้งค่า
        </SidebarLink>
      </nav>
      <div className="mt-auto">
         {/* Logout or other bottom items can go here */}
      </div>
    </aside>
  );
}