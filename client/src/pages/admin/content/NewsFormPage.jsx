import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import NewsForm from '../../../components/admin/forms/NewsForm';

const DEFAULT_CATEGORY = 'news';
const ANNOUNCEMENT_CATEGORY = 'announcement';

// helper: รวม base URL ของ API (เผื่อ FE/BE คนละโดเมนพอร์ต)
const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  '';

export default function NewsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditing = !!id;
  const isAnnouncementRoute = location.pathname.includes('/admin/content/announcements');

  const [newsItem, setNewsItem] = useState({
    title: '',
    content: '',
    category: isAnnouncementRoute ? ANNOUNCEMENT_CATEGORY : DEFAULT_CATEGORY,
    status: 'draft',
    // รูป/พรีวิว
    featured_image: null,          // File (เวลาผู้ใช้เลือกใหม่)
    featured_image_url: '',        // พาธเดิม (อาจเป็น relative)
    featured_image_full: '',       // URL เต็มจากแบ็กเอนด์ (ควรใช้ตัวนี้เป็นหลัก)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // จัดการ Preview รูป: ไฟล์ใหม่ > full URL > (fallback) URL/PATH เดิม
  useEffect(() => {
    // ถ้ามีไฟล์ใหม่ -> ใช้ blob URL
    if (newsItem?.featured_image instanceof File) {
      const url = URL.createObjectURL(newsItem.featured_image);
      setPreviewUrl((old) => {
        if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
        return url;
      });
      return () => {
        URL.revokeObjectURL(url);
      };
    }

    // ไม่มีไฟล์ใหม่ -> ใช้ full URL จากแบ็กเอนด์ถ้ามี
    if (newsItem?.featured_image_full) {
      setPreviewUrl(newsItem.featured_image_full);
      return;
    }

    // fallback: ใช้ featured_image_url
    if (newsItem?.featured_image_url) {
      const raw = newsItem.featured_image_url;
      // ถ้าเป็น absolute อยู่แล้ว ก็ใช้เลย
      if (/^https?:\/\//i.test(raw)) {
        setPreviewUrl(raw);
      } else {
        // ถ้าเป็น relative path ให้ prefix ด้วย API_BASE ถ้ามี
        const abs = API_BASE ? `${API_BASE}${raw}` : raw;
        setPreviewUrl(abs);
      }
      return;
    }

    // ไม่มีอะไรให้พรีวิว
    setPreviewUrl('');
  }, [
    newsItem?.featured_image,
    newsItem?.featured_image_full,
    newsItem?.featured_image_url,
  ]);

  // โหลดข้อมูลเดิมตอนแก้ไข
  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);
    adminApi
      .getNewsById(id)
      .then((data) => {
        if (!data?.news) throw new Error('News article not found');
        const incoming = data.news;
        setNewsItem((prev) => ({
          ...prev,
          title: incoming.title || '',
          content: incoming.content || '',
          category: incoming.category || DEFAULT_CATEGORY,
          status: incoming.status || 'draft',
          featured_image: null, // สำคัญ: เคลียร์ไฟล์ใหม่
          featured_image_url: incoming.featured_image_url || '',
          featured_image_full: incoming.featured_image_full || '',
        }));
      })
      .catch((err) => {
        const message = err?.response?.data?.message || err.message || 'Failed to fetch news article';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  // ส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ถ้าเป็นหน้าประกาศ บังคับ category = announcement
      const category = isAnnouncementRoute
        ? ANNOUNCEMENT_CATEGORY
        : (newsItem.category || DEFAULT_CATEGORY);

      // สร้าง FormData
      const fd = new FormData();
      fd.append('title', (newsItem.title || '').trim());
      fd.append('content', newsItem.content || '');
      fd.append('category', category);
      fd.append('status', newsItem.status || 'draft');

      // แนบรูปภาพ: ไฟล์ใหม่ > (คงรูปเดิม) > (สั่งลบ)
      if (newsItem.featured_image instanceof File) {
        fd.append('featured_image', newsItem.featured_image);
      } else if (newsItem.featured_image_url) {
        // คงรูปเดิมไว้
        fd.append('featured_image_url', newsItem.featured_image_url);
      } else if (isEditing) {
        // ผู้ใช้ลบรูปออกตอนแก้ไข
        fd.append('remove_featured_image', '1');
      }

      // เรียก API (อย่าบังคับ Content-Type ให้เบราว์เซอร์ตั้ง boundary เอง)
      if (isEditing) {
        await adminApi.updateNews(id, fd);
      } else {
        await adminApi.createNews(fd);
      }

      // กลับหน้ารายการตามหมวด
      navigate(category === ANNOUNCEMENT_CATEGORY
        ? '/admin/content/announcements'
        : '/admin/content/news');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'An error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing
          ? (isAnnouncementRoute ? 'Edit Announcement' : 'Edit News Article')
          : (isAnnouncementRoute ? 'Create Announcement' : 'Create News Article')}
      </h1>

      <NewsForm
        newsItem={newsItem}
        setNewsItem={setNewsItem}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        categoryLocked={isAnnouncementRoute}
        existingImageUrl={previewUrl} // ให้ NewsForm ใช้พรีวิวนี้
      />
    </div>
  );
}
