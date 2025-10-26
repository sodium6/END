import React from 'react';

const EmailBroadcastForm = ({ form, onChange, onSubmit, loading }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...form, [name]: value });
  };

  const handleAudienceChange = (event) => {
    const { value } = event.target;
    onChange({ ...form, audience: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="subject">
          หัวข้อ
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="body">
          ข้อความ
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          value={form.body}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="เขียนประกาศของคุณที่นี่..."
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">ผู้รับ</legend>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="audience"
              value="all"
              checked={form.audience === 'all'}
              onChange={handleAudienceChange}
            />
            <span>สมาชิกที่ใช้งานอยู่ทั้งหมด</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="audience"
              value="custom"
              checked={form.audience === 'custom'}
              onChange={handleAudienceChange}
            />
            <span>รายชื่อที่กำหนดเอง</span>
          </label>
        </div>
        {form.audience === 'custom' && (
          <textarea
            name="customRecipients"
            value={form.customRecipients}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="ป้อนที่อยู่อีเมลคั่นด้วยเครื่องหมายจุลภาค อัฒภาค หรือขึ้นบรรทัดใหม่"
          />
        )}
      </fieldset>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? 'กำลังส่ง...' : 'ส่งประกาศ'}
        </button>
      </div>
    </form>
  );
};

export default EmailBroadcastForm;