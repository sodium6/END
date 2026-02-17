import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import UserTable from '../../../components/admin/tables/UserTable';
import MemberTable from '../../../components/admin/tables/MemberTable';

const PAGE_SIZE = 10;
const MEMBER_STATUS_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'pending', label: 'รอการอนุมัติ' },
  { value: 'active', label: 'ใช้งานอยู่' },
  { value: 'suspended', label: 'ถูกระงับ' },
  { value: 'rejected', label: 'ถูกปฏิเสธ' },
];

export default function UserManagement() {
  const navigate = useNavigate();

  const [view, setView] = useState('admin'); // 'admin' | 'member'

  // Admin account state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotal, setAdminTotal] = useState(0);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState('');

  // Member state
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatus, setMemberStatus] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotal, setMemberTotal] = useState(0);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  const adminQuery = useMemo(() => adminSearch.trim(), [adminSearch]);
  const memberQuery = useMemo(() => memberSearch.trim(), [memberSearch]);

  const fetchAdmins = useCallback(async () => {
    try {
      setAdminLoading(true);
      setAdminError('');
      const { data, total } = await adminApi.getUsers({
        page: adminPage,
        pageSize: PAGE_SIZE,
        q: adminQuery,
      });
      setAdminUsers(data || []);
      setAdminTotal(total || 0);
    } catch (error) {
      setAdminError(error?.message || 'ไม่สามารถโหลดบัญชีผู้ดูแลระบบได้');
    } finally {
      setAdminLoading(false);
    }
  }, [adminPage, adminQuery]);

  const fetchMembers = useCallback(async () => {
    try {
      setMemberLoading(true);
      setMemberError('');
      const { data, total } = await adminApi.getMembers({
        page: memberPage,
        pageSize: PAGE_SIZE,
        q: memberQuery,
        status: memberStatus,
      });
      setMembers(data || []);
      setMemberTotal(total || 0);
    } catch (error) {
      setMemberError(error?.message || 'ไม่สามารถโหลดสมาชิกได้');
    } finally {
      setMemberLoading(false);
    }
  }, [memberPage, memberQuery, memberStatus]);

  useEffect(() => {
    if (view === 'admin') {
      fetchAdmins();
    }
  }, [view, fetchAdmins]);

  useEffect(() => {
    if (view === 'member') {
      fetchMembers();
    }
  }, [view, fetchMembers]);

  const handleEditAdmin = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleDeleteAdmin = async (userId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ดูแลระบบนี้')) {
      return;
    }
    try {
      await adminApi.deleteUser(userId);
      fetchAdmins();
    } catch (error) {
      setAdminError(error?.message || 'ไม่สามารถลบบัญชีผู้ดูแลระบบได้');
    }
  };

  const handleMemberStatusChange = useCallback(
    async (memberId, nextStatus) => {
      let confirmationMessage = 'คุณแน่ใจหรือไม่?';
      if (nextStatus === 'active') {
        confirmationMessage = 'เปิดใช้งานบัญชีสมาชิกนี้หรือไม่';
      } else if (nextStatus === 'suspended') {
        confirmationMessage = 'ระงับบัญชีสมาชิกนี้หรือไม่';
      }
      if (!window.confirm(confirmationMessage)) {
        return;
      }
      try {
        await adminApi.updateMemberStatus(memberId, nextStatus);
        fetchMembers();
      } catch (error) {
        setMemberError(error?.response?.data?.message || error?.message || 'ไม่สามารถอัปเดตสถานะสมาชิกได้');
      }
    },
    [fetchMembers]
  );

  const handleResetMemberPassword = useCallback(
    async (memberId) => {
      const input = window.prompt('ป้อนรหัสผ่านใหม่ (เว้นว่างไว้เพื่อสร้างอัตโนมัติ):', '');
      if (input === null) {
        return;
      }
      const trimmed = input.trim();
      try {
        const { newPassword, generated } = await adminApi.resetMemberPassword(memberId, trimmed);
        const message = generated
          ? `สร้างรหัสผ่านใหม่แล้ว: ${newPassword}`
          : 'อัปเดตรหัสผ่านสำเร็จแล้ว';
        alert(message);
        fetchMembers();
      } catch (error) {
        setMemberError(error?.response?.data?.message || error?.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้');
      }
    },
    [fetchMembers]
  );

  const handleDeleteMember = useCallback(
    async (memberId) => {
      if (!window.confirm('ลบบัญชีสมาชิกนี้หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้')) {
        return;
      }
      try {
        await adminApi.deleteMember(memberId);
        fetchMembers();
      } catch (error) {
        setMemberError(error?.response?.data?.message || error?.message || 'ไม่สามารถลบสมาชิกได้');
      }
    },
    [fetchMembers]
  );

  const renderPagination = (currentPage, totalCount, onChangePage) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    return (
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-gray-500">
          ทั้งหมด {totalCount} รายการ  หน้า {currentPage} จาก {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => onChangePage((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1.5 rounded border disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onChangePage((prev) => prev + 1)}
            className="px-3 py-1.5 rounded border disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>
    );
  };

  const isAdminView = view === 'admin';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView('admin')}
          className={`px-4 py-2 rounded-md border ${isAdminView ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
        >
          บัญชีผู้ดูแลระบบ
        </button>
        <button
          type="button"
          onClick={() => setView('member')}
          className={`px-4 py-2 rounded-md border ${!isAdminView ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
        >
          สมาชิกทั่วไป
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={isAdminView ? adminSearch : memberSearch}
            onChange={(e) => {
              if (isAdminView) {
                setAdminPage(1);
                setAdminSearch(e.target.value);
              } else {
                setMemberPage(1);
                setMemberSearch(e.target.value);
              }
            }}
            placeholder={isAdminView ? 'ค้นหาด้วยชื่อผู้ใช้หรืออีเมล' : 'ค้นหาด้วยชื่อ, อีเมล, หรือรหัสนักศึกษา'}
            className="px-3 py-2 border rounded-md w-64"
          />

          {!isAdminView && (
            <select
              value={memberStatus}
              onChange={(e) => {
                setMemberPage(1);
                setMemberStatus(e.target.value);
              }}
              className="px-3 py-2 border rounded-md"
            >
              {MEMBER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <Link
          to="/admin/users/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + สร้างบัญชีใหม่
        </Link>
      </div>

      {isAdminView ? (
        <>
          {adminError && <div className="text-red-600">{adminError}</div>}
          {adminLoading ? (
            <div className="py-12 text-center text-gray-500">กำลังโหลดบัญชีผู้ดูแลระบบ...</div>
          ) : (
            <>
              <UserTable users={adminUsers} onEdit={handleEditAdmin} onDelete={handleDeleteAdmin} />
              {renderPagination(adminPage, adminTotal, setAdminPage)}
            </>
          )}
        </>
      ) : (
        <>
          {memberError && <div className="text-red-600">{memberError}</div>}
          {memberLoading ? (
            <div className="py-12 text-center text-gray-500">กำลังโหลดสมาชิก...</div>
          ) : (
            <>
              <MemberTable
                members={members}
                onChangeStatus={handleMemberStatusChange}
                onResetPassword={handleResetMemberPassword}
                onDelete={handleDeleteMember}
              />
              {renderPagination(memberPage, memberTotal, setMemberPage)}
            </>
          )}
        </>
      )}
    </div>
  );
}