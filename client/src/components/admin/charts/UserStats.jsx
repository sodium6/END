import React from "react";

const STATUS_LABELS = {
  active: "ใช้งานอยู่",
  pending: "รอดำเนินการ",
  suspended: "ถูกระงับ",
  rejected: "ถูกปฏิเสธ",
};

export default function UserStats({ members = {}, admins = {} }) {
  const memberStatuses = members.status || {};
  const adminRoles = admins.byRole || {};

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <section>
        <h3 className="text-base font-semibold text-gray-800">ภาพรวมสมาชิก</h3>
        <p className="mt-1 text-xs text-gray-500">จำนวนสมาชิกทั้งหมด {members.total ?? 0} คน</p>
        <ul className="mt-3 space-y-1">
          {Object.entries(memberStatuses).map(([key, value]) => (
            <li key={key} className="flex items-center justify-between rounded-md bg-gray-100 px-3 py-2">
              <span>{STATUS_LABELS[key] || key}</span>
              <span className="font-medium">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-gray-800">สรุปผู้ดูแลระบบ</h3>
        <p className="mt-1 text-xs text-gray-500">รวม {admins.total ?? 0} บัญชี</p>
        <ul className="mt-3 space-y-1">
          <li className="flex items-center justify-between rounded-md bg-indigo-50 px-3 py-2">
            <span>ซูเปอร์แอดมิน</span>
            <span className="font-medium">{adminRoles.superadmin ?? 0}</span>
          </li>
          <li className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2">
            <span>แอดมิน</span>
            <span className="font-medium">{adminRoles.admin ?? 0}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
