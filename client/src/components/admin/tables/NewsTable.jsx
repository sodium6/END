import React from 'react';

const formatCategory = (value) => {
  if (!value) {
    return '-';
  }
  const normalized = String(value).trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatStatus = (status) => {
  switch (status) {
    case 'published':
      return 'เผยแพร่แล้ว';
    case 'draft':
      return 'ฉบับร่าง';
    default:
      return status;
  }
};

const NewsTable = ({ news, onEdit, onDelete }) => {
  if (!news || news.length === 0) {
    return <div className="py-12 text-center text-gray-500">ไม่พบข้อมูล</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">หัวข้อ</th>
            <th className="px-4 py-3 text-left font-semibold">หมวดหมู่</th>
            <th className="px-4 py-3 text-left font-semibold">สถานะ</th>
            <th className="px-4 py-3 text-left font-semibold">สร้างเมื่อ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.news_id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{item.title}</td>
              <td className="px-4 py-3">{formatCategory(item.category)}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formatStatus(item.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => onEdit(item.news_id)}
                  className="px-3 py-1.5 rounded border text-blue-600 hover:bg-blue-50"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => onDelete(item.news_id)}
                  className="px-3 py-1.5 rounded border text-red-600 hover:bg-red-50"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewsTable;
