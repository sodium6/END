import Sidebar from '@/components/layout/Sidebar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const IndexLayout = () => {
  return (
    <main className="flex w-full h-screen bg-[#F8FAFE]">
      <Sidebar />
      <section className="overflow-y-auto p-6 w-full">
        <Outlet />
      </section>
    </main>
  );
};

export default IndexLayout;
