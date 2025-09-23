import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../../services/adminApi";
import { Link, useNavigate } from "react-router-dom";
import NewsTable from "../../../components/admin/tables/NewsTable";

const PAGE_SIZE = 10;

export default function NewsManagement() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const where = useMemo(() => (q?.trim() ? q.trim() : ""), [q]);

  const handleEdit = (newsId) => {
    navigate(`/admin/content/news/edit/${newsId}`);
  };

  const handleDelete = async (newsId) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await adminApi.deleteNews(newsId);
        fetchNews(); // Refresh the list
      } catch (error) {
        setErr(error.message || "Failed to delete article.");
      }
    }
  };

  async function fetchNews() {
    try {
      setLoading(true);
      setErr("");
      const { data, total } = await adminApi.getNews({
        page,
        pageSize: PAGE_SIZE,
        q: where,
      });
      setNews(data || []);
      setTotal(total || 0);
    } catch (e) {
      setErr(e.message || "Failed to load news.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, where]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">จัดการข่าวสาร</h1>
        <div className="flex gap-3">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="ค้นหาหัวข้อข่าว"
            className="px-3 py-2 border rounded-md w-64"
          />
          <Link
            to="/admin/content/news/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + สร้างข่าวใหม่
          </Link>
        </div>
      </div>

      {err && <div className="mb-4 text-red-600">{err}</div>}
      {loading ? (
        <div className="py-12 text-center text-gray-500">กำลังโหลดข้อมูล…</div>
      ) : (
        <>
          <NewsTable news={news} onEdit={handleEdit} onDelete={handleDelete} />
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