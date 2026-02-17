import React from 'react';

const statusLabel = (status) => {
  switch (status) {
    case 'pending':
      return { text: 'รอการอนุมัติ', className: 'bg-yellow-100 text-yellow-800' };
    case 'active':
      return { text: 'ใช้งานอยู่', className: 'bg-green-100 text-green-800' };
    case 'suspended':
      return { text: 'ถูกระงับ', className: 'bg-red-100 text-red-800' };
    case 'rejected':
      return { text: 'ถูกปฏิเสธ', className: 'bg-gray-200 text-gray-700' };
    default:
      return { text: status || 'ไม่รู้จัก', className: 'bg-gray-100 text-gray-700' };
  }
};

const MemberTable = ({ members, onChangeStatus, onResetPassword, onDelete }) => {
  if (!members || members.length === 0) {
    return <div className="py-12 text-center text-gray-500">ไม่พบสมาชิก</div>;
  }

  const renderStatusActions = (member) => {
    const actions = [];
    if (member.status === 'pending' || member.status === 'rejected') {
      actions.push(
        <button
          key="approve"
          onClick={() => onChangeStatus(member.id, 'active')}
          className="px-3 py-1.5 rounded border text-green-600 hover:bg-green-50"
        >
          อนุมัติ
        </button>
      );
    }
    if (member.status === 'active') {
      actions.push(
        <button
          key="suspend"
          onClick={() => onChangeStatus(member.id, 'suspended')}
          className="px-3 py-1.5 rounded border text-amber-600 hover:bg-amber-50"
        >
          ระงับ
        </button>
      );
    }
    if (member.status === 'suspended') {
      actions.push(
        <button
          key="activate"
          onClick={() => onChangeStatus(member.id, 'active')}
          className="px-3 py-1.5 rounded border text-blue-600 hover:bg-blue-50"
        >
          เปิดใช้งาน
        </button>
      );
    }

    actions.push(
      <button
        key="reset"
        onClick={() => onResetPassword(member.id)}
        className="px-3 py-1.5 rounded border text-indigo-600 hover:bg-indigo-50"
      >
        รีเซ็ตรหัสผ่าน
      </button>
    );

    actions.push(
      <button
        key="delete"
        onClick={() => onDelete(member.id)}
        className="px-3 py-1.5 rounded border text-red-600 hover:bg-red-50"
      >
        ลบ
      </button>
    );

    return actions;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">ชื่อ (ไทย)</th>
            <th className="px-4 py-3 text-left font-semibold">รหัสนักศึกษา</th>
            <th className="px-4 py-3 text-left font-semibold">อีเมล</th>
            <th className="px-4 py-3 text-left font-semibold">การศึกษา</th>
            <th className="px-4 py-3 text-left font-semibold">สถานะ</th>
            <th className="px-4 py-3 text-left font-semibold">สร้างเมื่อ</th>
            <th className="px-4 py-3 text-left font-semibold">อนุมัติเมื่อ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const statusInfo = statusLabel(member.status);
            return (
              <tr key={member.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {member.first_name_th || member.last_name_th
                    ? `${member.first_name_th} ${member.last_name_th}`
                    : '-'}
                </td>
                <td className="px-4 py-3">{member.st_id_canonical || member.st_id || '-'}</td>
                <td className="px-4 py-3">{member.email}</td>
                <td className="px-4 py-3">{member.education || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  {member.approved_at ? new Date(member.approved_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {renderStatusActions(member)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTable;

