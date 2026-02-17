import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EmailBroadcastForm from '../../../components/admin/forms/EmailBroadcastForm';
import { adminApi } from '../../../services/adminApi';

const PAGE_SIZE = 10;

const statusBadgeClasses = {
  sent: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

export default function EmailBroadcastPage() {
  const [form, setForm] = useState({
    subject: '',
    body: '',
    audience: 'all',
    customRecipients: '',
  });
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const query = useMemo(() => search.trim(), [search]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError('');
      const { data, total } = await adminApi.getEmailBroadcasts({
        page,
        pageSize: PAGE_SIZE,
        q: query,
      });
      setHistory(data || []);
      setTotal(total || 0);
    } catch (error) {
      setHistoryError(error?.message || 'ไม่สามารถโหลดประวัติการส่งอีเมลประกาศได้');
    } finally {
      setHistoryLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const payload = {
        subject: form.subject.trim(),
        body: form.body.trim(),
        audience: form.audience,
      };
      if (form.audience === 'custom') {
        payload.customRecipients = form.customRecipients;
      }
      const result = await adminApi.sendEmailBroadcast(payload);
      setSuccessMessage(`ส่งอีเมลประกาศถึงผู้รับ ${result.recipientCount} คนแล้ว`);
      setForm({ subject: '', body: '', audience: 'all', customRecipients: '' });
      setPage(1);
      fetchHistory();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'ไม่สามารถส่งอีเมลประกาศได้');
    } finally {
      setSending(false);
    }
  };

  const renderStatus = (status) => {
    const className = statusBadgeClasses[status] || 'bg-gray-100 text-gray-700';
    let translatedStatus = status;
    switch (status) {
      case 'sent':
        translatedStatus = 'ส่งแล้ว';
        break;
      case 'pending':
        translatedStatus = 'รอดำเนินการ';
        break;
      case 'failed':
        translatedStatus = 'ล้มเหลว';
        break;
      default:
        translatedStatus = status;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {translatedStatus}
      </span>
    );
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">การส่งอีเมลประกาศ</h1>
        <p className="text-sm text-gray-600">
          ส่งประกาศถึงสมาชิกทางอีเมล เฉพาะผู้ใช้ที่ใช้งานอยู่เท่านั้นที่จะได้รับเมื่อส่งถึงผู้รับทั้งหมด
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <EmailBroadcastForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        loading={sending}
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">ประวัติการส่งประกาศ</h2>
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="ค้นหาด้วยหัวข้อ"
            className="w-full md:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {historyError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {historyError}
          </div>
        )}

        {historyLoading ? (
          <div className="py-12 text-center text-gray-500">กำลังโหลดประวัติ...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-gray-500">ยังไม่มีการส่งอีเมลประกาศ</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">หัวข้อ</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">ผู้รับ</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">จำนวนผู้รับ</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">สถานะ</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">ส่งเมื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {history.map((item) => (
                  <tr key={item.broadcast_id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.subject}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{item.audience === 'all' ? 'ทั้งหมด' : item.audience === 'custom' ? 'กำหนดเอง' : item.audience}</td>
                    <td className="px-4 py-3 text-gray-700">{item.recipient_count}</td>
                    <td className="px-4 py-3 text-gray-700">{renderStatus(item.status)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.sent_at ? new Date(item.sent_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            ทั้งหมด {total} รายการ  หน้า {page} จาก {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}