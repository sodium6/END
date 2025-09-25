import React from 'react';
import { useNavigate } from 'react-router-dom';

const statusBadge = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'suspended':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const UserTable = ({ users, onEdit, onDelete }) => {
  const navigate = useNavigate();

  if (!users || users.length === 0) {
    return <div className="py-12 text-center text-gray-500">No admin accounts found.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Role</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Created</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{user.full_name || '-'}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {user.role || 'admin'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(user.status)}`}>
                  {user.status || 'unknown'}
                </span>
              </td>
              <td className="px-4 py-3">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                  className="px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-100"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(user.id)}
                  className="px-3 py-1.5 rounded border text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="px-3 py-1.5 rounded border text-red-600 hover:bg-red-50"
                >
                  Delete
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
