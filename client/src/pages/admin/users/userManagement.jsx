import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../../services/adminApi"; // ใช้ service ฝั่ง client
import { Link, useNavigate } from "react-router-dom";
import UserTable from "../../../components/admin/tables/UserTable";

const PAGE_SIZE = 10;

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const where = useMemo(() => (q?.trim() ? q.trim() : ""), [q]);

  const handleEdit = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    // You should add a confirmation dialog here before deleting
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(userId);
        fetchUsers(); // Refresh the user list
      } catch (error) {
        setErr(error.message || "Failed to delete user.");
      }
    }
  };

  async function fetchUsers() {
    try {
      setLoading(true);
      setErr("");
      const { data, total } = await adminApi.getUsers({
        page,
        pageSize: PAGE_SIZE,
        q: where,
      });
      setUsers(data || []);
      setTotal(total || 0);
    } catch (e) {
      setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, where]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">จัดการผู้ใช้</h1>
        <div className="flex gap-3">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="ค้นหา ชื่อ/อีเมล"
            className="px-3 py-2 border rounded-md w-64"
          />
          <Link
            to="/admin/users/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + เพิ่มผู้ใช้
          </Link>
        </div>
      </div>

      {err && <div className="mb-4 text-red-600">{err}</div>}
      {loading ? (
        <div className="py-12 text-center text-gray-500">กำลังโหลดข้อมูล…</div>
      ) : (
        <>
          <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
          {/* Pagination */}
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-500">
              ทั้งหมด {total} รายการ • หน้า {page} จาก {Math.max(1, Math.ceil(total / PAGE_SIZE))}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded border disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
