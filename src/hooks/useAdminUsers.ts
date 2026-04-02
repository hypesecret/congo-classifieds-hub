import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      return profiles.map((p: any) => ({
        id: p.user_id,
        name: p.full_name || 'Sans nom',
        email: p.email || 'Pas d\'email',
        phone: p.phone || 'Pas de numéro',
        city: p.city || 'Non renseignée',
        kycLevel: p.kyc_level || 0,
        kycStatus: p.kyc_status || 'none',
        listingsCount: p.listings_count || 0,
        registeredAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Inconnue',
        status: p.is_banned ? 'banned' : 'active',
        role: p.user_roles?.[0]?.role || 'user',
        is_banned: p.is_banned,
        ban_reason: p.ban_reason,
        stats: {
          transactions: 0, // Need transactions table join for real data
          reportsAgainst: 0, // Need reports table join
          messages: 0 // Need messages table join
        }
      }));
    }
  });
};
