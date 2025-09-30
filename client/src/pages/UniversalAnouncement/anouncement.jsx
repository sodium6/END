import React, { useEffect, useState } from "react";
import { getNews, getNewsById, subscribe } from "../../services/newsApi";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "";

export default function UniversalAnouncement() {
  const [newsList, setNewsList] = useState([]);
  const [newsById, setNewsById] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 5;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  const absUrl = (maybeUrl) => {
    if (!maybeUrl) return "";
    if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
    const base = API_BASE || window.location.origin;
    return `${base}${maybeUrl}`;
  };

  const onSubscribe = async () => {
    setEmailMsg("");
    setSubmitted(false);

    const v = (email || "").trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!ok) {
      setEmailMsg("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await subscribe(v);
      const msg =
        resp?.message === "already_subscribed"
          ? "อีเมลนี้สมัครไว้แล้ว ขอบคุณครับ"
          : "ลงทะเบียนสำเร็จ ขอบคุณที่ติดตามข่าวสารครับ";

      setSubmitted(true);
      setEmailMsg(msg);
      setEmail("");
    } catch (e) {
      console.error(e);
      setEmailMsg("สมัครรับข่าวสารไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSubscribe();
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getNews();
        setNewsList(Array.isArray(data) ? data : data?.data || []);
      } catch (e) {
        console.error(e);
        setErr("ดึงข่าวไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openNews = async (id) => {
    try {
      const n = await getNewsById(id);
      const payload = Array.isArray(n) ? n[0] : n?.data || n;
      setNewsById(payload || null);
    } catch (e) {
      console.error(e);
      setErr("ดึงรายละเอียดข่าวไม่สำเร็จ");
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("th-TH", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

  // Pagination calculation
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = newsList.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(newsList.length / newsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <nav className="bg-gradient-to-r from-emerald-800 to-green-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-white">
                  🎓 มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ
                </span>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600 mt-4">กำลังโหลดข่าวสาร...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-emerald-800 to-green-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">
                🎓 มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-white hover:text-emerald-100 hover:bg-emerald-700/50 rounded-lg transition-all duration-200"
              >
                เข้าสู่ระบบ
              </a>
              <a
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-emerald-800 bg-white hover:bg-emerald-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                สมัครสมาชิก
              </a>
              <a
                href="/admin/login"
                className="px-4 py-2 text-sm font-medium text-white hover:text-emerald-100 hover:bg-emerald-700/50 rounded-lg border border-white/30 transition-all duration-200"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold text-emerald-800 mb-4">
            ศูนย์ประชาสัมพันธ์
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            ข่าวสารและการแจ้งเตือนสำคัญจากมหาวิทยาลัย
          </p>
        </header>

        {err && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{err}</span>
            </div>
          </div>
        )}

        {/* News Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-emerald-800">
              📰 ข่าวสารล่าสุด
            </h2>
            <span className="text-sm text-emerald-700 bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-200">
              {newsList.length} ข่าว
            </span>
          </div>

          <div className="grid gap-6">
            {currentNews.map((news) => {
              const imgSrc =
                news.featured_image_full ||
                absUrl(news.featured_image_url) ||
                "";
              return (
                <article
                  key={news.news_id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100"
                >
                  {imgSrc && (
                    <div className="relative w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                      <div className="w-full" style={{ maxHeight: '400px' }}>
                        <img
                          src={imgSrc}
                          alt={news.title || "featured"}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-emerald-700 shadow-md border border-emerald-200">
                        {news.category || "ทั่วไป"}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                          {news.title || "(ไม่มีหัวข้อ)"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            📅 {fmtDate(news.created_at)}
                          </span>
                          {!imgSrc && (
                            <span className="text-emerald-600">
                              • {news.category || "ทั่วไป"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {news.content || "-"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                ← ก่อนหน้า
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show only 5 pages at a time
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md"
                            : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="flex items-center px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                ถัดไป →
              </button>
            </div>
          )}
        </section>

        {/* Selected News Detail */}
        {newsById && (
          <section className="bg-white rounded-2xl shadow-xl border border-emerald-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-green-600 p-6 text-white">
              <h3 className="text-2xl font-bold">{newsById.title}</h3>
              <p className="text-emerald-100 mt-2">
                {fmtDate(newsById.created_at)} • {newsById.category || "ทั่วไป"}
              </p>
            </div>
            
            {(newsById.featured_image_full ||
              absUrl(newsById.featured_image_url)) && (
              <div className="relative w-full bg-gradient-to-br from-emerald-50 to-teal-50">
                <img
                  src={
                    newsById.featured_image_full ||
                    absUrl(newsById.featured_image_url)
                  }
                  alt={newsById.title}
                  className="w-full object-contain"
                  style={{ maxHeight: '500px' }}
                />
              </div>
            )}
            
            <div className="p-6">
              <p className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                {newsById.content}
              </p>
            </div>
          </section>
        )}

        {/* Newsletter Subscription */}
        <section className="bg-gradient-to-br from-emerald-700 to-green-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-3xl font-bold mb-3">
              สมัครรับข่าวสารทางอีเมล
            </h2>
            <p className="text-emerald-100 mb-6">
              รับข่าวสารและการแจ้งเตือนสำคัญจากมหาวิทยาลัยก่อนใคร
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailMsg("");
                  setSubmitted(false);
                }}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-md"
              />
              <button
                onClick={onSubscribe}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 disabled:bg-gray-300 disabled:text-gray-500 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {submitting ? "กำลังบันทึก..." : "สมัครเลย"}
              </button>
            </div>

            {emailMsg && (
              <div
                className={`mt-4 p-3 rounded-xl ${
                  submitted
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                } font-medium shadow-sm`}
              >
                {emailMsg}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-600">
          <p className="text-sm">
            © 2024 มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ| ศูนย์ประชาสัมพันธ์
          </p>
        </footer>
      </div>
    </div>
  );
}