import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../../services/adminApi";
import NewsTable from "../../../components/admin/tables/NewsTable";

const PAGE_SIZE = 10;
const ANNOUNCEMENT_CATEGORY = "announcement";

export default function Announcements() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const where = useMemo(() => (q?.trim() ? q.trim() : ""), [q]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const { data, total } = await adminApi.getNews({
        page,
        pageSize: PAGE_SIZE,
        q: where,
        category: ANNOUNCEMENT_CATEGORY,
      });
      setItems(data || []);
      setTotal(total || 0);
    } catch (error) {
      setErr(error.message || "ไม่สามารถโหลดประกาศได้");
    } finally {
      setLoading(false);
    }
  }, [page, where]);

  const handleEdit = (id) => {
    navigate(`/admin/content/announcements/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้")) {
      try {
        await adminApi.deleteNews(id);
        fetchAnnouncements();
      } catch (error) {
        setErr(error.message || "ไม่สามารถลบประกาศได้");
      }
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">ประกาศ</h1>
        <div className="flex gap-3">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="ค้นหาประกาศตามหัวข้อ"
            className="px-3 py-2 border rounded-md w-64"
          />
          <Link
            to="/admin/content/announcements/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + สร้างประกาศ
          </Link>
        </div>
      </div>

      {err && <div className="mb-4 text-red-600">{err}</div>}
      {loading ? (
        <div className="py-12 text-center text-gray-500">กำลังโหลด...</div>
      ) : (
        <>
          <NewsTable news={items} onEdit={handleEdit} onDelete={handleDelete} />
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-500">
              ทั้งหมด {total} รายการ | หน้า {page} จาก {Math.max(1, Math.ceil(total / PAGE_SIZE))}
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
