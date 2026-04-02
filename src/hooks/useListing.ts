import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types';

export const useListing = (id: string | undefined) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles (
            full_name,
            kyc_status,
            avatar_url,
            created_at,
            response_rate
          ),
          categories!category_id (
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transform DB data to frontend Listing type
      const item = data as any;
      const profile = item.profiles;
      const category = item.categories;

      return {
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        price: item.price || 0,
        is_free: item.is_free,
        isFree: item.is_free,
        city: item.city,
        neighborhood: item.neighborhood,
        category: category?.name || 'Autres',
        category_id: item.category_id,
        imageUrl: item.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
        cover_image: item.cover_image,
        images: item.images || [],
        is_sponsored: item.is_sponsored,
        isSponsored: item.is_sponsored || false,
        sponsor_level: item.sponsor_level,
        created_at: item.created_at,
        createdAt: new Date(item.created_at).toLocaleDateString(),
        userName: profile?.full_name || 'Utilisateur',
        isVerified: profile?.kyc_status === 'approved',
        price_negotiable: item.price_negotiable,
        priceNegotiable: item.price_negotiable || false,
        status: item.status,
        views_count: item.views_count,
        contact_count: item.contact_count,
        specs: item.specs as any
      } as Listing & { profiles?: any };
    },
    enabled: !!id
  });
};
