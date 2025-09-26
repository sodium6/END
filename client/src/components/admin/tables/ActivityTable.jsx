import React from "react";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

const STATUS_BADGES = {
  active: { className: "bg-green-100 text-green-700", label: "ใช้งานอยู่" },
  pending: { className: "bg-yellow-100 text-yellow-700", label: "รอดำเนินการ" },
  suspended: { className: "bg-red-100 text-red-700", label: "ถูกระงับ" },
  rejected: { className: "bg-gray-200 text-gray-700", label: "ถูกปฏิเสธ" },
};

export default function ActivityTable({ members = [] }) {
  if (!members.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        ยังไม่มีข้อมูลผู้ใช้ล่าสุด
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600">ชื่อ-นามสกุล</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">อีเมล</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">สถานะ</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">สมัครเมื่อ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {members.map((member) => {
            const statusKey = (member.status || "").toLowerCase();
            const badge = STATUS_BADGES[statusKey] || { className: "bg-gray-100 text-gray-700", label: statusKey || '-' };
            const fullName = [member.first_name_th, member.last_name_th].filter(Boolean).join(' ') ||
              member.full_name || member.name || '-';
            return (
              <tr key={member.id || member.email}>
                <td className="px-4 py-2 text-gray-800">{fullName}</td>
                <td className="px-4 py-2 text-gray-600">{member.email || '-'}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{formatDate(member.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
