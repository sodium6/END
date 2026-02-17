import React, { useEffect, useState } from "react";
import { getNews, getNewsById, subscribe } from "../../../services/newsApi";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "";

export default function PublicRelations() {
  const [newsList, setNewsList] = useState([]);
  const [newsById, setNewsById] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // state สำหรับสมัครอีเมล
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  const absUrl = (maybeUrl) => {
    if (!maybeUrl) return "";
    if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
    // Strip '/api' from the base URL if present, as uploads are served from root
    // VITE_API_BASE is http://localhost:3000/api, we need http://localhost:3000
    const base = (API_BASE || window.location.origin).replace(/\/api\/?$/, "");
    return `${base}${maybeUrl}`;
  };

  const onSubscribe = async (e) => {
    e.preventDefault();
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
      const resp = await subscribe(v); // ← เรียก service ที่เพิ่มใหม่
      // รองรับข้อความจาก backend
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


  useEffect(() => {
    (async () => {
      try {
        const data = await getNews(); // backend อาจคืน {data, total} หรือ array
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


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">กำลังโหลดข่าว…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* ส่วนหัว */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-blue-700">
          ศูนย์ประชาสัมพันธ์ มหาวิทยาลัย
        </h1>
        <p className="text-gray-600 mt-2">ข่าวสาร & การแจ้งเตือนล่าสุด</p>
      </header>

      {err && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      )}

      {/* ข่าวสาร */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">
          ข่าวสารล่าสุด
        </h2>

        <div className="space-y-4">
          {newsList.map((news, index) => {
            const imgSrc =
              news.featured_image_full ||
              absUrl(news.featured_image_url) ||
              "";
            return (
              <article
                key={news.news_id || index}
                className="p-4 bg-white shadow rounded-lg border border-gray-200"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-blue-600">
                      {news.title || "(ไม่มีหัวข้อ)"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {fmtDate(news.created_at)} • {news.category || "ทั่วไป"}
                    </p>
                  </div>

                  {/* <button
                    onClick={() => openNews(news.news_id)}
                    className="text-sm px-3 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    รายละเอียด
                  </button> */}
                </header>

                {imgSrc ? (
                  <div className="mt-3">
                    <img
                      src={imgSrc}
                      alt={news.title || "featured"}
                      className="w-full rounded-lg border border-gray-100 object-cover"
                    />
                  </div>
                ) : null}

                <p className="mt-3 text-gray-700 whitespace-pre-line">
                  {news.content || "-"}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* แสดงรายละเอียดข่าวที่เลือก (ตัวเลือก) */}
      {newsById && (
        <section className="p-5 rounded-lg border bg-white">
          <h3 className="text-xl font-bold text-blue-700">{newsById.title}</h3>
          <p className="text-sm text-gray-500 mb-3">
            {fmtDate(newsById.created_at)} • {newsById.category || "ทั่วไป"}
          </p>
          {(newsById.featured_image_full ||
            absUrl(newsById.featured_image_url)) && (
              <img
                src={
                  newsById.featured_image_full ||
                  absUrl(newsById.featured_image_url)
                }
                alt={newsById.title}
                className="w-full rounded-lg mb-4"
              />
            )}
          <p className="whitespace-pre-line text-gray-700">
            {newsById.content}
          </p>
        </section>
      )}

      {/* สมัครรับข่าวสาร (เฉพาะอีเมล) */}
      <section className="border rounded-lg bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          สมัครรับข่าวสารทางอีเมล
        </h2>
        <p className="text-gray-600 mb-4">
          กรอกอีเมลของคุณเพื่อรับข่าวสารอัปเดตจากเรา
        </p>

        <form onSubmit={onSubscribe} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailMsg("");
              setSubmitted(false);
            }}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? "กำลังบันทึก..." : "สมัครรับข่าวสาร"}
          </button>
        </form>

        {emailMsg && (
          <p
            className={`mt-3 text-sm ${submitted ? "text-green-600" : "text-red-600"
              }`}
          >
            {emailMsg}
          </p>
        )}
      </section>
    </div>
  );
}
