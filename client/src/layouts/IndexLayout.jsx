import Sidebar from '@/components/layout/Sidebar';
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const IndexLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      setIsOpen(!m);
      if (m) setIsCollapsed(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed((v) => !v);
  const closeSidebar = () => setIsOpen(false);
  const onLogout = () => { if (confirm("คุณต้องการออกจากระบบหรือไม่?")) alert("ออกจากระบบเรียบร้อย"); };

  return (
    <main className="flex w-full h-screen bg-[#F8FAFE]">
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
      <section className={`transition-all duration-300 overflow-y-auto p-6 w-full ${!isMobile ? (isCollapsed ? "md:ml-[7rem]" : "md:ml-[20rem]") : "ml-0"}`}>
        <Outlet />
      </section>
    </main>
  );
};

export default IndexLayout;