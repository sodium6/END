import React from "react";

/**
 * แสดงสรุปเป็น "จำนวนรายการ" ต่อหมวด
 * Props ที่รองรับ:
 * - แบบใหม่: worksCount, activitiesCount, sportsCount, certificatesCount
 * - แบบเดิม (fallback): subjectsCount (ถือเป็น worksCount)
 */
export default function StatsOverview({
  worksCount,
  activitiesCount,
  sportsCount,
  certificatesCount,
  // legacy props (จะไม่ใช้ ถ้าแบบใหม่ถูกส่งมา)
  subjectsCount,
}) {
  // Fallback ให้ทำงานได้กับโค้ดเก่า: ถ้าไม่ได้ส่ง worksCount มา ให้ใช้ subjectsCount แทน
  const _works = typeof worksCount === "number" ? worksCount : (subjectsCount ?? 0);
  const _activities = typeof activitiesCount === "number" ? activitiesCount : 0;
  const _sports = typeof sportsCount === "number" ? sportsCount : 0;
  const _certs = typeof certificatesCount === "number" ? certificatesCount : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* ประวัติงาน */}
      <StatCard
        title="ประวัติงาน"
        value={_works}
        from="from-emerald-500"
        to="to-green-600"
        hint="ทั้งหมด"
      />

      {/* กิจกรรม */}
      <StatCard
        title="กิจกรรมที่เคยเข้าร่วม"
        value={_activities}
        from="from-blue-500"
        to="to-blue-700"
        hint="ทั้งหมด"
      />

      {/* กีฬา */}
      <StatCard
        title="กีฬาที่เคยเข้าร่วม"
        value={_sports}
        from="from-purple-500"
        to="to-purple-700"
        hint="ทั้งหมด"
      />

      {/* Certificates */}
      <StatCard
        title="Certificates"
        value={_certs}
        from="from-orange-400"
        to="to-orange-600"
        hint="ทั้งหมด"
      />
    </div>
  );
}

function StatCard({ title, value, from, to, hint }) {
  return (
    <div className={`bg-gradient-to-r ${from} ${to} text-white rounded-2xl p-6 shadow-lg`}>
      <p className="text-white/80 text-sm font-medium">{title}</p>
      <p className="text-4xl font-extrabold mt-1 tabular-nums">{Number(value || 0)}</p>
      {hint ? <p className="text-xs text-white/70 mt-1">{hint}</p> : null}
    </div>
  );
}
