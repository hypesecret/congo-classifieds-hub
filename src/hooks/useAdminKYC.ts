import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminKYC = (status: string = 'pending') => {
  return useQuery({
    queryKey: ['admin-kyc', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            phone,
            email,
            city,
            created_at,
            kyc_level,
            kyc_status
          )
        `)
        .eq('status', status as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((item: any) => ({
        id: item.id,
        user: {
          id: item.user_id,
          name: item.profiles?.full_name || 'Utilisateur inconnu',
          phone: item.profiles?.phone || 'Non renseigné',
          email: item.profiles?.email || 'Non renseigné',
          city: item.profiles?.city || 'Non renseignée',
          registeredAt: item.profiles?.created_at ? new Date(item.profiles.created_at).toLocaleDateString() : 'Inconnue',
          kycLevel: item.profiles?.kyc_level || 1,
          kycStatus: item.profiles?.kyc_status || 'none'
        },
        documentType: item.document_type,
        documentTypeName: 
          item.document_type === 'cni' ? 'Carte Nationale d\'Identité' :
          item.document_type === 'passport' ? 'Passeport' : 
          'Permis de conduire',
        status: item.status,
        submittedAt: item.created_at ? new Date(item.created_at).toLocaleString() : 'Inconnue',
        images: {
          front: item.document_front_url,
          back: item.document_back_url,
          selfie: item.selfie_url
        }
      }));
    }
  });
};
