import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import NewsForm from '../../../components/admin/forms/NewsForm';

const DEFAULT_CATEGORY = 'news';
const ANNOUNCEMENT_CATEGORY = 'announcement';

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
    featured_image_url: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      adminApi
        .getNewsById(id)
        .then((data) => {
          if (!data?.news) {
            throw new Error('News article not found');
          }
          const incoming = data.news;
          setNewsItem({
            title: incoming.title || '',
            content: incoming.content || '',
            category: incoming.category || DEFAULT_CATEGORY,
            featured_image_url: incoming.featured_image_url || '',
            status: incoming.status || 'draft',
          });
        })
        .catch((err) => {
          const message = err?.response?.data?.message || err.message || 'Failed to fetch news article';
          setError(message);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...newsItem,
        category: (newsItem.category || '').trim() || DEFAULT_CATEGORY,
      };

      if (isEditing) {
        await adminApi.updateNews(id, payload);
      } else {
        await adminApi.createNews(payload);
      }

      const targetCategory = (payload.category || '').toLowerCase();
      const destination =
        targetCategory === ANNOUNCEMENT_CATEGORY
          ? '/admin/content/announcements'
          : '/admin/content/news';
      navigate(destination);
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
          ? isAnnouncementRoute
            ? 'Edit Announcement'
            : 'Edit News Article'
          : isAnnouncementRoute
            ? 'Create Announcement'
            : 'Create News Article'}
      </h1>
      <NewsForm
        newsItem={newsItem}
        setNewsItem={setNewsItem}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        categoryLocked={isAnnouncementRoute}
      />
    </div>
  );
}
