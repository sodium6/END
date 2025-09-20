import React, { useState } from "react";

export default function PublicRelations() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ตัวอย่างข่าว (จริงๆ ควร fetch จาก DB / API)
  const newsList = [
    {
      id: 1,
      title: "กำหนดการปฐมนิเทศนักศึกษาใหม่ ปีการศึกษา 2568",
      date: "20 กันยายน 2568",
      content: "ขอเชิญนักศึกษาใหม่ทุกคนเข้าร่วมกิจกรรมปฐมนิเทศ...",
    },
    {
      id: 2,
      title: "ประกาศวันหยุดพิเศษ",
      date: "25 กันยายน 2568",
      content: "มหาวิทยาลัยประกาศหยุดเรียนและทำการหนึ่งวัน...",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.endsWith("@university.ac.th")) {
      // TODO: ส่งไป backend หรือ Supabase
      setSubmitted(true);
    } else {
      alert("กรุณาใช้อีเมลมหาวิทยาลัย (@university.ac.th)");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* ส่วนหัว */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-blue-700">
          ศูนย์ประชาสัมพันธ์ มหาวิทยาลัย
        </h1>
        <p className="text-gray-600 mt-2">
          ข่าวสาร & การแจ้งเตือนล่าสุด
        </p>
      </header>

      {/* ข่าวสาร */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">
          ข่าวสารล่าสุด
        </h2>
        <div className="space-y-4">
          {newsList.map((news) => (
            <div
              key={news.id}
              className="p-4 bg-white shadow rounded-lg border border-gray-200"
            >
              <h3 className="text-lg font-bold text-blue-600">{news.title}</h3>
              <p className="text-sm text-gray-500">{news.date}</p>
              <p className="mt-2 text-gray-700">{news.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* สมัครรับข่าวสาร */}
      <section className="bg-blue-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">
          สมัครรับข่าวสารผ่านอีเมลมหาวิทยาลัย
        </h2>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="กรอกอีเมลมหาวิทยาลัย (@university.ac.th)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              สมัครรับข่าว
            </button>
          </form>
        ) : (
          <p className="text-green-600 font-medium">
            ✅ คุณได้สมัครรับข่าวสารเรียบร้อยแล้ว!
          </p>
        )}
      </section>
    </div>
  );
}
