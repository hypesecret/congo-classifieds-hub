import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminPayments = () => {
  return useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      // 1. Fetch all transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (full_name),
          listings:listing_id (title)
        `)
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      // 2. Fetch active boosts (sponsored listings)
      const { data: boosts, error: boostError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          is_sponsored,
          sponsor_level,
          sponsor_expires_at,
          created_at,
          views_count,
          contact_count,
          profiles:user_id (full_name)
        `)
        .eq('is_sponsored', true)
        .gt('sponsor_expires_at', new Date().toISOString());

      if (boostError) throw boostError;

      return {
        transactions: transactions.map((tx: any) => ({
          id: tx.id,
          date: tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Inconnue',
          user: tx.profiles?.full_name || 'Inconnu',
          listing: tx.listings?.title || 'N/A',
          pack: tx.type || 'Boost',
          amount: tx.amount,
          provider: tx.provider || 'N/A',
          status: tx.status || 'pending',
          reference: tx.provider_reference || tx.id.substring(0, 8)
        })),
        boosts: boosts.map((b: any) => ({
          id: b.id,
          listing: b.title,
          seller: b.profiles?.full_name || 'Inconnu',
          pack: b.sponsor_level || 'Premium',
          startDate: new Date(b.created_at).toLocaleDateString(),
          expiryDate: new Date(b.sponsor_expires_at).toLocaleDateString(),
          performance: { views: b.views_count || 0, clicks: b.contact_count || 0 },
          expiringSoon: new Date(b.sponsor_expires_at).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000
        }))
      };
    }
  });
};
