import { useState, useEffect, useCallback } from 'react';
import { adminAuthApi } from '../services/adminAuthApi';

export default function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await adminAuthApi.me();
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const login = async (username, password) => {
    const { data } = await adminAuthApi.login(username, password);
    localStorage.setItem('admin_token', data.token);
    await loadMe();
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  return { admin, loading, login, logout, isAuthenticated: !!admin };
}
