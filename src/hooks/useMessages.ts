import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export const useConversations = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase
        .from('conversations') as any)
        .select(`
          *,
          listing:listings (
            id,
            title,
            cover_image,
            price
          )
        `)
        .contains('participant_ids', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithProfiles = await Promise.all((data || []).map(async (conv: any) => {
        const otherUserId = conv.participant_ids.find((pid: string) => pid !== user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, kyc_level, kyc_status')
          .eq('user_id', otherUserId)
          .single();

        return {
          ...conv,
          otherUser: profile || { id: otherUserId, full_name: 'Utilisateur', avatar_url: null, kyc_level: 0, kyc_status: 'none' as const }
        };
      }));

      return conversationsWithProfiles;
    },
    enabled: !!user,
  });
};

export const useConversationMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      listingId, 
      receiverId, 
      content 
    }: { 
      listingId: string, 
      receiverId: string, 
      content: string 
    }) => {
      if (!user) throw new Error("Non authentifié");

      // The handle_new_message trigger fills conversation_id automatically
      const { data, error } = await (supabase
        .from('messages') as any)
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          listing_id: listingId,
          content: content,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur d'envoi", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
};
