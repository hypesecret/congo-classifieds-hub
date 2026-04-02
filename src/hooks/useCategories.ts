import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types';

export const useCategories = (parentId?: string | null) => {
  return useQuery({
    queryKey: ['categories', parentId],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: any): Category => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon,
        color: item.color || '#F5F5F5',
        count: item.listings_count || 0
      }));
    }
  });
};
