import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserTable = ({ users, onEdit, onDelete }) => {
  const navigate = useNavigate();

  if (!users || users.length === 0) {
    return <div className="py-12 text-center text-gray-500">ไม่พบผู้ใช้</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">ชื่อ</th>
            <th className="px-4 py-3 text-left font-semibold">อีเมล</th>
            <th className="px-4 py-3 text-left font-semibold">สิทธิ์</th>
            <th className="px-4 py-3 text-left font-semibold">สถานะ</th>
            <th className="px-4 py-3 text-left font-semibold">สมัครเมื่อ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{u.full_name || "-"}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {u.role || "user"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.status === "active"
                      ? "bg-green-100 text-green-800"
                      : u.status === "suspended"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {u.status || "unknown"}
                </span>
              </td>
              <td className="px-4 py-3">
                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                  className="px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                >
                  ดูรายละเอียด
                </button>
                <button
                  onClick={() => onEdit(u.id)}
                  className="px-3 py-1.5 rounded border text-blue-600 hover:bg-blue-50"
                >
                  แก้ไข
                </button>
                 <button
                  onClick={() => onDelete(u.id)}
                  className="px-3 py-1.5 rounded border text-red-600 hover:bg-red-50"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;