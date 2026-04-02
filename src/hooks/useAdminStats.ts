import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // 1. Active Listings
      const { count: activeListings, error: activeError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // 2. Pending Moderation
      const { count: pendingModeration, error: pendingError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // 3. Total Users
      const { count: totalUsers, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // 4. Revenue (Total)
      const { data: revenueData, error: revenueError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed');

      if (revenueError) throw revenueError;

      const totalRevenue = revenueData.reduce((sum, tx) => sum + tx.amount, 0);

      // 5. Recent Activity (Mocking from tables for now)
      // In a real app, we might have an activity_log table
      const { data: recentListings } = await supabase
        .from('listings')
        .select('title, created_at, user_id, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(2);

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      // 6. KYC Pending
      const { count: pendingKYC } = await supabase
        .from('kyc_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // 7. Reports Pending
      const { count: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        activeListings: activeListings || 0,
        pendingModeration: pendingModeration || 0,
        totalUsers: totalUsers || 0,
        totalRevenue,
        pendingKYC: pendingKYC || 0,
        pendingReports: pendingReports || 0,
        recentActivity: [
          ...(recentUsers || []).map(u => ({
            id: `user-${u.id}`,
            type: 'user',
            title: 'Nouvel utilisateur',
            description: `${u.full_name} s'est inscrit`,
            time: new Date(u.created_at || '').toLocaleString(),
            link: '/admin/users'
          })),
          ...(recentListings || []).map(l => ({
            id: `listing-${l.title}`,
            type: 'listing',
            title: 'Nouvelle annonce',
            description: l.title,
            time: new Date(l.created_at).toLocaleString(),
            link: '/admin/moderation'
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4)
      };
    }
  });
};
