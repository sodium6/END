import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from 'react-icons/fi';
import useAdminAuth from '../../../hooks/useAdminAuth';

export default function AdminHeader() {
  const navigate = useNavigate();
  const { admin, loading, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>

      <div className="flex items-center space-x-4 ml-auto">
        <div className="text-sm text-right">
          <p className="font-semibold text-gray-800">
            {loading ? 'Loading...' : admin?.name || admin?.username || 'Admin'}
          </p>
          {!loading && (
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {admin?.role || ''}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          title="ออกจากระบบ"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
