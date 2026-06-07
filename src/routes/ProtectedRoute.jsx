import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-structly-white">
        <div className="brutal-card flex items-center gap-3 p-5 font-black">
          <Loader2 className="h-5 w-5 animate-spin" />
          Lagi menyiapkan strukturmu...
        </div>
      </div>
    );
  }

  if (!isConfigured || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
