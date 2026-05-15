import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export const useBlockedUsers = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async () => {
      if (!user) return [] as string[];
      const { data, error } = await supabase
        .from('blocked_users' as any)
        .select('blocked_id')
        .eq('blocker_id', user.id);
      if (error) throw error;
      return (data || []).map((r: any) => r.blocked_id as string);
    },
    enabled: !!user,
  });
};

export const useToggleBlock = () => {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async ({ targetId, isBlocked }: { targetId: string; isBlocked: boolean }) => {
      if (!user) throw new Error('Non authentifié');
      if (isBlocked) {
        const { error } = await supabase
          .from('blocked_users' as any)
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blocked_users' as any)
          .insert({ blocker_id: user.id, blocked_id: targetId });
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['blocked-users'] });
      toast({ title: vars.isBlocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué' });
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });
};
