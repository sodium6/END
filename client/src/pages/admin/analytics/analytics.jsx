import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../../services/adminApi";

const STATUS_LABELS = {
  active: "ใช้งานอยู่",
  pending: "รอดำเนินการ",
  suspended: "ถูกระงับ",
  rejected: "ถูกปฏิเสธ",
  published: "เผยแพร่แล้ว",
  draft: "ฉบับร่าง",
  sent: "ส่งสำเร็จ",
  pending_email: "รอการส่ง",
  failed: "ส่งไม่สำเร็จ",
};

const DEFAULT_SUMMARY = {
  members: {
    total: 0,
    status: {
      active: 0,
      pending: 0,
      suspended: 0,
      rejected: 0,
    },
    signupsLast30Days: [],
  },
  admins: {
    total: 0,
    byRole: {
      superadmin: 0,
      admin: 0,
    },
  },
  news: {
    total: 0,
    status: {
      published: 0,
      draft: 0,
    },
  },
  email: {
    totalBroadcasts: 0,
    lastBroadcast: null,
  },
};

const SummaryCard = ({ title, value, subtext }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
  </div>
);

const StatusList = ({ data }) => (
  <ul className="space-y-2 text-sm text-gray-700">
    {Object.entries(data).map(([status, count]) => (
      <li key={status} className="flex items-center justify-between">
        <span>{STATUS_LABELS[status] || status}</span>
        <span className="font-medium">{count}</span>
      </li>
    ))}
  </ul>
);

const SignupBarChart = ({ series }) => {
  const max = useMemo(() => Math.max(...series.map((item) => item.count), 1), [series]);
  const formatter = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" });

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2">
      {series.map(({ date, count }) => (
        <div key={date} className="flex w-10 flex-col items-center">
          <div
            className="w-full rounded-t bg-blue-500"
            style={{ height: `${(count / max) * 140}px` }}
          />
          <span className="mt-2 text-xs text-gray-500">{formatter.format(new Date(date))}</span>
          <span className="text-xs font-medium text-gray-700">{count}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const fetchedSummary = await adminApi.getAnalyticsSummary();
        setSummary(fetchedSummary);
      } catch (err) {
        if (err?.response?.status === 404) {
          setSummary(DEFAULT_SUMMARY);
          setError("");
        } else {
          console.error("Failed to load analytics summary", err);
          setError(err?.message || "ไม่สามารถโหลดข้อมูลการวิเคราะห์ได้");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">แดชบอร์ดการวิเคราะห์</h1>
        <p className="mt-4 text-gray-500">กำลังรวบรวมข้อมูล โปรดรอสักครู่...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">แดชบอร์ดการวิเคราะห์</h1>
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const viewModel = summary || DEFAULT_SUMMARY;
  const { members, admins, news, email } = viewModel;
  const signupSeries = members.signupsLast30Days.length > 0 ? members.signupsLast30Days : [
    { date: new Date().toISOString(), count: 0 },
  ];

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">แดชบอร์ดการวิเคราะห์</h1>
        <p className="mt-2 text-sm text-gray-600">
          สรุปข้อมูลสมาชิก ผู้ดูแล ข่าวสาร และการส่งอีเมลล่าสุด
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-gray-800">สรุปภาพรวม</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="สมาชิกทั้งหมด"
            value={members.total}
            subtext={`จำนวนใช้งาน ${members.status.active} | รอดำเนินการ ${members.status.pending}`}
          />
          <SummaryCard
            title="ผู้ดูแลระบบ"
            value={admins.total}
            subtext={`ซูเปอร์แอดมิน ${admins.byRole.superadmin} | แอดมิน ${admins.byRole.admin}`}
          />
          <SummaryCard
            title="ข่าวประชาสัมพันธ์"
            value={news.total}
            subtext={`เผยแพร่แล้ว ${news.status.published} | ฉบับร่าง ${news.status.draft}`}
          />
          <SummaryCard
            title="การส่งอีเมล"
            value={email.totalBroadcasts}
            subtext={email.lastBroadcast ? `หัวข้อ: ${email.lastBroadcast.subject}` : "ยังไม่มีการส่งอีเมล"}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800">สถานะสมาชิก</h3>
          <p className="text-xs text-gray-500">จำนวนสมาชิกตามสถานะปัจจุบัน</p>
          <div className="mt-4">
            <StatusList data={members.status} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800">การสมัครสมาชิก (30 วันที่ผ่านมา)</h3>
          <p className="text-xs text-gray-500">จำนวนผู้สมัครสมาชิกในแต่ละวัน</p>
          <div className="mt-4">
            <SignupBarChart series={signupSeries} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800">สถานะข่าวสาร</h3>
          <StatusList data={news.status} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800">รายละเอียดการส่งอีเมลล่าสุด</h3>
          {email.lastBroadcast ? (
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">หัวข้อ:</span> {email.lastBroadcast.subject}</p>
              <p><span className="font-medium">จำนวนผู้รับ:</span> {email.lastBroadcast.recipient_count}</p>
              <p><span className="font-medium">สถานะ:</span> {STATUS_LABELS[email.lastBroadcast.status] || email.lastBroadcast.status}</p>
              <p>
                <span className="font-medium">เวลาที่ส่ง:</span>{' '}
                {email.lastBroadcast.sent_at ? new Date(email.lastBroadcast.sent_at).toLocaleString('th-TH') : '-'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">ยังไม่เคยส่งอีเมลประชาสัมพันธ์</p>
          )}
        </div>
      </section>
    </div>
  );
}
