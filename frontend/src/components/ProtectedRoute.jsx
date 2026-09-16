import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Logged in, but wrong role for this page — send them to their own dashboard
    const fallback = user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}