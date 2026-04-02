import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

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
