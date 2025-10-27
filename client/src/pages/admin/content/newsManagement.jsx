import React, { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../../services/adminApi";
import { Link, useNavigate } from "react-router-dom";
import NewsTable from "../../../components/admin/tables/NewsTable";

const PAGE_SIZE = 10;
const ANNOUNCEMENT_CATEGORY = "announcement";

export default function NewsManagement() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState('');           // '' | 'draft' | 'published'
  const [dateFrom, setDateFrom] = useState('');       // 'YYYY-MM-DD'
  const [dateTo, setDateTo] = useState('');


  const where = useMemo(() => (q?.trim() ? q.trim() : ""), [q]);

  const fetchNews = useCallback(async () => {
  try {
    setLoading(true); setErr('');
    const { data, total } = await adminApi.getNews({
      page,
      pageSize: PAGE_SIZE,
      q: where,                     // คีย์เวิร์ด: หัวข้อ/หมวดหมู่/สถานะ/วันที่ (แบบ to_char)
      status: status || undefined,  // ฟิลเตอร์สถานะเฉพาะเจาะจง
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      excludeCategory: ANNOUNCEMENT_CATEGORY,
    });
    setNews(data || []); setTotal(total || 0);
  } catch (e) { setErr(e.message || 'ไม่สามารถโหลดข่าวได้'); }
  finally { setLoading(false); }
}, [page, where, status, dateFrom, dateTo]);


  const handleEdit = (newsId) => {
    navigate(`/admin/content/news/edit/${newsId}`);
  };

  const handleDelete = async (newsId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้")) {
      try {
        await adminApi.deleteNews(newsId);
        fetchNews();
      } catch (error) {
        setErr(error.message || "ไม่สามารถลบบทความได้");
      }
    }
  };

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">ข่าวสาร</h1>
        <div className="flex gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="ค้นหา: หัวข้อ / สถานะ / วันที่ "
            autoComplete="off"
            className="px-3 py-2 border rounded-md w-80"
          />
          <Link
            to="/admin/content/news/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + สร้างบทความข่าว
          </Link>
        </div>
      </div>

      {err && <div className="mb-4 text-red-600">{err}</div>}
      {loading ? (
        <div className="py-12 text-center text-gray-500">กำลังโหลด...</div>
      ) : (
        <>
          <NewsTable news={news} onEdit={handleEdit} onDelete={handleDelete} />
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
