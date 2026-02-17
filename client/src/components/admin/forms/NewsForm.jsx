import React, { useEffect, useState } from 'react';

const categoryOptions = [
  { value: 'news', label: 'ข่าว' },
  { value: 'announcement', label: 'ประกาศ' },
];

const NewsForm = ({
  newsItem,
  setNewsItem,
  onSubmit,
  loading,
  error,
  categoryLocked = false,
  categories = [], // Dynamic categories
  sendNotification = false,
  setSendNotification,
}) => {
  const [previewUrl, setPreviewUrl] = useState('');

  // ใช้รูปเดิมจาก server ตอน edit
  useEffect(() => {
    if (newsItem?.featured_image_full) {
      setPreviewUrl(newsItem.featured_image_full);
    }
  }, [newsItem?.featured_image_full]);

  // เคลียร์ object URL เวลา unmount/เปลี่ยนไฟล์
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'send_notification') {
      if (setSendNotification) setSendNotification(checked);
      return;
    }
    setNewsItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    // เคลียร์ URL เดิมถ้าเป็น blob
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // เก็บไฟล์ไว้ใน state หลัก (ให้ parent ใช้ตอน submit)
      setNewsItem((prev) => ({
        ...prev,
        featured_image: file,        // <-- ใช้ชื่อนี้ให้ตรงกับที่ handleSubmit เรียกใช้
        remove_featured_image: '0',  // ถ้ามีไฟล์ใหม่แปลว่าไม่ลบรูป
      }));
    } else {
      setPreviewUrl('');
      setNewsItem((prev) => ({ ...prev, featured_image: null }));
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setNewsItem((prev) => ({
      ...prev,
      featured_image: null,
      featured_image_url: null,
      featured_image_full: null,
      remove_featured_image: '1', // ให้ backend ลบรูปเก่า
    }));
  };

  // Logic for category value
  // If locked, usually announcement.
  // If not locked, use category_id or fallback
  const currentCategoryValue = categoryLocked
    ? 'announcement'
    : (newsItem.category_id || newsItem.category || '');

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">หัวข้อ</label>
        <input
          type="text"
          name="title"
          value={newsItem.title || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">เนื้อหา</label>
        <textarea
          name="content"
          rows="10"
          value={newsItem.content || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
        <select
          name={categoryLocked ? 'category' : 'category_id'}
          value={currentCategoryValue}
          onChange={handleChange}
          disabled={categoryLocked}
          className="mt-1 block w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
        >
          <option value="" disabled>เลือกหมวดหมู่</option>
          {categoryLocked && <option value="announcement">ประกาศ</option>}

          {!categoryLocked && categories.length > 0 ? (
            categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))
          ) : (
            // Fallback options if no categories loaded yet or legacy
            !categoryLocked && (
              <>
                <option value="news">ข่าว</option>
                {/* Add standard preset options if needed, but better to rely on DB */}
              </>
            )
          )}
        </select>
        {categoryLocked && (
          <p className="mt-1 text-xs text-gray-500">
            ประกาศถูกกำหนดให้เป็นหมวดหมู่ประกาศ
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">สถานะ</label>
        <select
          name="status"
          value={newsItem.status || 'draft'}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        >
          <option value="draft">ฉบับร่าง</option>
          <option value="published">เผยแพร่แล้ว</option>
        </select>
      </div>

      {/* Notification Checkbox - Only show if current status (or selected status) is published */}
      {(newsItem.status === 'published' && setSendNotification) && (
        <div className="flex items-center">
          <input
            id="send_notification"
            name="send_notification"
            type="checkbox"
            checked={sendNotification}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="send_notification" className="ml-2 block text-sm text-gray-900">
            ส่งอีเมลแจ้งเตือนไปยังผู้ติดตาม (เมื่อกดบันทึก)
          </label>
        </div>
      )}

      {/* อัปโหลดรูป + พรีวิว */}
      <div>
        <label className="block text-sm font-medium text-gray-700">เพิ่มรูปภาพ</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full"
        />

        {previewUrl ? (
          <div className="mt-3">
            <img
              src={previewUrl}
              alt="ตัวอย่าง"
              className="max-h-48 rounded border"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded"
            >
              ลบรูปภาพ
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-500">ไม่ได้เลือกรูปภาพ</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกบทความ'}
        </button>
      </div>
    </form>
  );
};

export default NewsForm;
