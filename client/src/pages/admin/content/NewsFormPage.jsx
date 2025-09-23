
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import NewsForm from '../../../components/admin/forms/NewsForm';

export default function NewsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState({
    title: '',
    content: '',
    category: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      adminApi.getNewsById(id)
        .then(data => setNewsItem(data.news))
        .catch(err => setError(err.message || 'Failed to fetch news article'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        await adminApi.updateNews(id, newsItem);
      } else {
        await adminApi.createNews(newsItem);
      }
      navigate('/admin/content/news');
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit News Article' : 'Create News Article'}</h1>
      <NewsForm 
        newsItem={newsItem} 
        setNewsItem={setNewsItem} 
        onSubmit={handleSubmit} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
}
