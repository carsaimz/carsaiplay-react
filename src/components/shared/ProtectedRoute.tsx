import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PageLoader from '@/components/ui/PageLoader';

interface Props {
  children?: React.ReactNode;
  role?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin' && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children ? <>{children}</> : <Outlet />;
}
