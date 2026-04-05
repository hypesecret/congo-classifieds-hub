import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  requireAdmin?: boolean; // If true, requires 'admin' specifically. Defaults to false (moderator or admin).
}

const AdminRoute: React.FC<AdminRouteProps> = ({ requireAdmin = false }) => {
  const { user, loading: authLoading } = useAuthStore();
  const location = useLocation();
  const [role, setRole] = useState<'admin' | 'moderator' | 'user' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          setRole(null);
        } else {
          setRole(data.role as 'admin' | 'moderator' | 'user');
        }
      } catch (err) {
        console.error('Failed to check user role:', err);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    };

    if (!authLoading) {
      checkRole();
    }
  }, [user, authLoading]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Save intended location to redirect back after login later if desired
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const isAuthorized = requireAdmin 
    ? role === 'admin' 
    : (role === 'admin' || role === 'moderator');

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
