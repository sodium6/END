import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import useAdminAuth from '../../../hooks/useAdminAuth';
import { adminAccountSchema, generalAccountSchema } from '../../../schemas/admin';
import UserForm from '../../../components/admin/forms/UserForm';

const INITIAL_STATE = {
  accountType: 'admin',
  username: '',
  full_name: '',
  email: '',
  password: '',
  role: 'admin',
  status: 'active',
  // general user fields
  title: '',
  first_name_th: '',
  last_name_th: '',
  first_name_en: '',
  last_name_en: '',
  phone: '',
  education: '',
  st_id: '',
  st_id_canonical: '',
};

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'superadmin';
  const [user, setUser] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!id;

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      navigate('/admin/users', { replace: true });
    }
  }, [authLoading, isSuperAdmin, navigate]);

  useEffect(() => {
    if (!isEditing || !isSuperAdmin) {
      return;
    }

    setLoading(true);
    adminApi
      .getUserById(id)
      .then((data) =>
        setUser((prev) => ({
          ...prev,
          accountType: 'admin',
          username: data.user.username,
          full_name: data.user.full_name,
          email: data.user.email,
          role: data.user.role,
          status: data.user.status || 'active',
          password: '',
        }))
      )
      .catch((err) => {
        const message = err?.response?.data?.message || err.message || 'Failed to fetch user';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id, isEditing, isSuperAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accountType = user.accountType || 'admin';
      let payload;

      if (accountType === 'general') {
        payload = {
          accountType: 'general',
          title: user.title?.trim() || '',
          first_name_th: user.first_name_th?.trim() || '',
          last_name_th: user.last_name_th?.trim() || '',
          first_name_en: user.first_name_en?.trim() || '',
          last_name_en: user.last_name_en?.trim() || '',
          phone: user.phone?.trim() || '',
          email: user.email?.trim() || '',
          education: user.education?.trim() || '',
          st_id: user.st_id?.trim() || '',
          st_id_canonical: user.st_id_canonical?.trim() || '',
          password: user.password?.trim() || '',
        };

        const validation = generalAccountSchema.safeParse(payload);
        if (!validation.success) {
          throw new Error(validation.error.errors.map((issue) => issue.message).join(', '));
        }

        await adminApi.createUser(validation.data);
      } else {
        const adminPayload = {
          accountType: 'admin',
          username: user.username?.trim() || '',
          full_name: user.full_name?.trim() || '',
          email: user.email?.trim() || '',
          role: user.role || 'admin',
          status: user.status || 'active',
          password: user.password ? user.password.trim() : undefined,
        };

        if (!isEditing && !adminPayload.password) {
          throw new Error('Password is required when creating a user');
        }

        const validation = adminAccountSchema.safeParse(adminPayload);
        if (!validation.success) {
          throw new Error(validation.error.errors.map((issue) => issue.message).join(', '));
        }

        const dataToSend = { ...validation.data };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }

        if (isEditing) {
          await adminApi.updateUser(id, dataToSend);
        } else {
          await adminApi.createUser(dataToSend);
        }
      }

      navigate('/admin/users');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'An error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit User' : 'Create User'}</h1>
      <UserForm
        user={user}
        setUser={setUser}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        isEditing={isEditing}
      />
    </div>
  );
}
