import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, any>;
  notify: boolean;
  created_at: string;
}

export const useSavedSearches = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['saved-searches', user?.id],
    queryFn: async () => {
      if (!user) return [] as SavedSearch[];
      const { data, error } = await supabase
        .from('saved_searches' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SavedSearch[];
    },
    enabled: !!user,
  });
};

export const useCreateSavedSearch = () => {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async ({ name, filters }: { name: string; filters: Record<string, any> }) => {
      if (!user) throw new Error('Non authentifié');
      const { error } = await supabase
        .from('saved_searches' as any)
        .insert({ user_id: user.id, name, filters });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({ title: 'Recherche sauvegardée' });
    },
  });
};

export const useDeleteSavedSearch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_searches' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-searches'] }),
  });
};
