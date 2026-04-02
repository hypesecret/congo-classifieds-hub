import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminReports = (status: string = 'pending') => {
  return useQuery({
    queryKey: ['admin-reports', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id (full_name),
          listing:listing_id (
            id,
            title,
            cover_image,
            seller:user_id (
              id,
              full_name
            )
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((r: any) => ({
        id: r.id,
        reporter: { 
          name: (r.reporter as any)?.full_name || 'Anonyme', 
          id: r.reporter_id 
        },
        listing: {
          id: r.listing?.id,
          title: r.listing?.title || 'Annonce supprimée',
          image: r.listing?.cover_image,
          seller: { 
            name: (r.listing?.seller as any)?.full_name || 'Inconnu', 
            id: (r.listing?.seller as any)?.id 
          }
        },
        reason: r.reason,
        details: r.details,
        status: r.status,
        date: r.created_at ? new Date(r.created_at).toLocaleString() : 'Inconnue'
      }));
    }
  });
};
