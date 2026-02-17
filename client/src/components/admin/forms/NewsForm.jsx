import React, { useEffect, useState } from 'react';

const categoryOptions = [
  { value: 'news', label: 'News' },
  { value: 'announcement', label: 'Announcement' },
];

const NewsForm = ({
  newsItem,
  setNewsItem,
  onSubmit,
  loading,
  error,
  categoryLocked = false,
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
    const { name, value } = e.target;
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
        _file: file,                 // <-- ไฟล์จริง
        remove_featured_image: '0',  // ถ้ามีไฟล์ใหม่แปลว่าไม่ลบรูป
      }));
    } else {
      setPreviewUrl('');
      setNewsItem((prev) => ({ ...prev, _file: null }));
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setNewsItem((prev) => ({
      ...prev,
      _file: null,
      featured_image_url: null,
      featured_image_full: null,
      remove_featured_image: '1', // ให้ backend ลบรูปเก่า
    }));
  };

  const currentCategory = newsItem.category || '';
  const hasPresetCategory = categoryOptions.some((o) => o.value === currentCategory);

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
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
        <label className="block text-sm font-medium text-gray-700">Content</label>
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
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={currentCategory}
          onChange={handleChange}
          disabled={categoryLocked}
          className="mt-1 block w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
        >
          <option value="" disabled>Select category</option>
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
          {!hasPresetCategory && currentCategory && (
            <option value={currentCategory}>{currentCategory}</option>
          )}
        </select>
        {categoryLocked && (
          <p className="mt-1 text-xs text-gray-500">
            Announcements are fixed to the announcement category.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={newsItem.status || 'draft'}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* อัปโหลดรูป + พรีวิว */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Featured Image</label>

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
              alt="Preview"
              className="max-h-48 rounded border"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded"
            >
              Remove image
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-500">No image selected</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Article'}
        </button>
      </div>
    </form>
  );
};

export default NewsForm;
