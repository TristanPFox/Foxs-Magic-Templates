import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return token ? <Outlet /> : <Navigate to="/landing" replace />;
}
