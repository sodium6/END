// src/components/layout/Sidebar.jsx
import React from "react";

export default function Sidebar({
  isMobile,
  isOpen,
  closeSidebar,
  isCollapsed,
  toggleCollapse,
  activeItem,
  setActiveItem,
  onLogout,
}) {
  // ความกว้าง sidebar: desktop ใช้ collapse ได้, mobile คง w-80 เสมอ
  const sidebarWidth = !isMobile ? (isCollapsed ? "w-28" : "w-80") : "w-80";
  const showText = !(isCollapsed && !isMobile);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 flex flex-col " +
          sidebarWidth +
          " " +
          (isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0")
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-green-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="text-white h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            {showText && (
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 text-base">นักเรียนบิ๊ก</span>
                <span className="text-xs text-slate-500">ระบบจัดการการเรียน</span>
              </div>
            )}
          </div>

          {/* Collapse (desktop only) */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              className="hidden md:flex p-1.5 rounded-md hover:bg-slate-100 transition-all duration-200"
            >
              {isCollapsed ? (
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Search */}
        {showText && (
          <div className="px-4 py-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหา..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {[
              { id: "dashboard", label: "แดชบอร์ด", icon: "home" },
              { id: "analytics", label: "วิเคราะห์", icon: "chart" },
              { id: "subjects", label: "วิชาเรียน", icon: "book" },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={
                    "w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group " +
                    (activeItem === item.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50")
                  }
                  title={showText ? undefined : item.label}
                >
                  <div className="flex items-center justify-center min-w-[24px]">
                    {item.icon === "home" && (
                      <svg
                        className={"h-4.5 w-4.5 " + (activeItem === item.id ? "text-emerald-600" : "text-slate-500")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                    {item.icon === "chart" && (
                      <svg
                        className={"h-4.5 w-4.5 " + (activeItem === item.id ? "text-emerald-600" : "text-slate-500")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                      </svg>
                    )}
                    {item.icon === "book" && (
                      <svg
                        className={"h-4.5 w-4.5 " + (activeItem === item.id ? "text-emerald-600" : "text-slate-500")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    )}
                  </div>
                  {showText && <span className="text-sm">{item.label}</span>}
                </button>
              </li>
            ))}

            {/* Static link: portfolio */}
            <li>
              <a
                href="/Users/earth/Documents/GitHub/End/Frontend/myportfolio/my_portfolio.html"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md transition-all duration-200 group text-slate-600 hover:bg-slate-50"
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <svg className="h-4.5 w-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                {showText && <span className="text-sm">my portfolio</span>}
              </a>
            </li>

            {/* Notifications */}
            <li>
              <button
                onClick={() => setActiveItem("notifications")}
                className={
                  "w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group " +
                  (activeItem === "notifications"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50")
                }
                title={showText ? undefined : "การแจ้งเตือน"}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <svg
                    className={"h-4.5 w-4.5 " + (activeItem === "notifications" ? "text-emerald-600" : "text-slate-500")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.001 7h15.002l-1 12H5.001L4.001 7z" />
                  </svg>
                </div>
                {showText && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">การแจ้งเตือน</span>
                    <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">12</span>
                  </div>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50/30 p-3">
            <div className="flex items-center px-3 py-2 rounded-md bg-white hover:bg-slate-50 transition-colors duration-200">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-slate-700 font-medium text-sm">นศ</span>
              </div>
              {showText && (
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-slate-800 truncate">นักศึกษา RMUTK</p>
                  <p className="text-xs text-slate-500 truncate">รหัส: 65130500XXX</p>
                </div>
              )}
              <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="ออนไลน์" />
            </div>
          </div>
          <div className="p-3">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <svg className="h-4.5 w-4.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              {showText && <span className="text-sm">ออกจากระบบ</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
