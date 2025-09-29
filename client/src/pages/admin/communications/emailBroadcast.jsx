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
      setHistoryError(error?.message || 'Failed to load email broadcast history.');
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
      setSuccessMessage(`Email broadcast sent to ${result.recipientCount} recipients.`);
      setForm({ subject: '', body: '', audience: 'all', customRecipients: '' });
      setPage(1);
      fetchHistory();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to send email broadcast.');
    } finally {
      setSending(false);
    }
  };

  const renderStatus = (status) => {
    const className = statusBadgeClasses[status] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {status}
      </span>
    );
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Email Broadcast</h1>
        <p className="text-sm text-gray-600">
          Send announcements to members via email. Only active users will be targeted when sending to all recipients.
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
          <h2 className="text-lg font-semibold">Broadcast history</h2>
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search by subject"
            className="w-full md:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {historyError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {historyError}
          </div>
        )}

        {historyLoading ? (
          <div className="py-12 text-center text-gray-500">Loading history…</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No email broadcasts have been sent yet.</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Audience</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Recipients</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Sent at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {history.map((item) => (
                  <tr key={item.broadcast_id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.subject}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{item.audience}</td>
                    <td className="px-4 py-3 text-gray-700">{item.recipient_count}</td>
                    <td className="px-4 py-3 text-gray-700">{renderStatus(item.status)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.sent_at ? new Date(item.sent_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Total {total} records • Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
