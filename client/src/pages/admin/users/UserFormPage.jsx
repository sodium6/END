
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import { userSchema } from '../../../schemas/admin';
import UserForm from '../../../components/admin/forms/UserForm';

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      adminApi.getUserById(id)
        .then(data => setUser(data.user))
        .catch(err => setError(err.message || 'Failed to fetch user'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validation = userSchema.safeParse(user);
      if (!validation.success) {
        // A more sophisticated error handling would show errors per field
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
      }

      if (isEditing) {
        await adminApi.updateUser(id, user);
      } else {
        await adminApi.createUser(user);
      }
      
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit User' : 'Create User'}</h1>
      <UserForm 
        user={user} 
        setUser={setUser} 
        onSubmit={handleSubmit} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
}
