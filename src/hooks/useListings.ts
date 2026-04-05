import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types';

interface UseListingsOptions {
  category?: string;
  isSponsored?: boolean;
  limit?: number;
  query?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  status?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

export const useListings = (options: UseListingsOptions = {}) => {
  return useQuery({
    queryKey: ['listings', options],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            full_name,
            kyc_status,
            avatar_url,
            kyc_level
          ),
          categories!category_id (
            name,
            slug
          )
        `);
      
      const status = options.status || 'active';
      query = query.eq('status', status);

      if (options.category) {
        query = query.eq('category_id', options.category);
      }

      if (options.isSponsored !== undefined) {
        query = query.eq('is_sponsored', options.isSponsored);
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options.query) {
        query = query.or(`title.ilike.%${options.query}%,description.ilike.%${options.query}%`);
      }

      if (options.city) {
        query = query.eq('city', options.city);
      }

      if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }

      if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.page !== undefined && options.pageSize) {
        const from = options.page * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      // Sorting
      if (options.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (options.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform DB data to frontend Listing type
      return (data || []).map((item: any): Listing => {
        const profile = (item as any).profiles;
        const category = (item as any).categories;
        
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
          images: item.images,
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
        };
      });
    }
  });
};
