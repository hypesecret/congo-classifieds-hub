import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Settings, Package, LogOut, Camera, MapPin, Phone, Mail, Edit2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ListingCard from '@/components/listing/ListingCard';
import KYCBadge from '@/components/auth/KYCBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { useListings } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, setShowKYCModal } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    city: profile?.city || 'Brazzaville',
    phone: profile?.phone || '',
  });

  const { data: myListings, isLoading: loadingListings } = useListings({
    status: 'active',
  });

  const { data: favoriteIds } = useFavorites();

  // Filter to only show user's own listings
  const userListings = myListings?.filter(l => l.user_id === user?.id) || [];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Profil mis à jour' });
      setEditing(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Mon profil</h1>
          <p className="text-14 text-text-muted mb-6">Connectez-vous pour accéder à votre profil.</p>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-surface rounded-card border border-border p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-32 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-20 font-heading font-bold text-foreground">{profile?.full_name || 'Utilisateur'}</h1>
              <KYCBadge level={profile?.kyc_level ?? 0} status={profile?.kyc_status ?? 'none'} />
              <div className="flex items-center gap-4 mt-2 text-12 text-text-muted flex-wrap">
                {profile?.city && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.city}</span>
                )}
                {profile?.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {profile.phone}</span>
                )}
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {profile?.email || user.email}</span>
              </div>
              {profile?.bio && <p className="text-14 text-text-secondary mt-2">{profile.bio}</p>}
            </div>
            <div className="flex gap-2">
              {(profile?.kyc_level ?? 0) < 2 && (
                <Button variant="outline" size="sm" onClick={() => setShowKYCModal(true)}>
                  Vérifier mon identité
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(!editing)}>
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </Button>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-12 text-text-muted">Nom complet</label>
                  <Input value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-12 text-text-muted">Ville</label>
                  <Input value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-12 text-text-muted">Téléphone</label>
                  <Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-12 text-text-muted">Bio</label>
                <Textarea value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })} className="resize-none" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings">
          <TabsList className="mb-6">
            <TabsTrigger value="listings" className="gap-1.5">
              <Package className="w-4 h-4" /> Mes annonces ({userListings.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5">
              <Heart className="w-4 h-4" /> Favoris ({favoriteIds?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {loadingListings ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface rounded-card animate-pulse" />)}
              </div>
            ) : userListings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-14 text-text-muted mb-4">Vous n'avez pas encore d'annonces</p>
                <Button onClick={() => navigate('/deposer')}>Déposer une annonce</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userListings.map(l => (
                  <ListingCard key={l.id} listing={l} isFavorited={favoriteIds?.includes(l.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-14 text-text-muted">Vos annonces favorites apparaîtront ici</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Profile;
