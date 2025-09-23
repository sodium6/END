import { Navigate, useLocation } from 'react-router-dom';
import useAdminAuth from '../../../hooks/useAdminAuth';

export default function RequireAdminAuth({ children }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location }} />;

  return children;
}


