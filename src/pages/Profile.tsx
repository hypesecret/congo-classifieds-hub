import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Heart, Settings, Package, LogOut, Camera, MapPin, Phone, Mail, Edit2, Lock } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ListingCard from '@/components/listing/ListingCard';
import ListingCardSkeleton from '@/components/listing/ListingCardSkeleton';
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
import { useSEO } from '@/hooks/useSEO';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'listings';
  const { user, profile, signOut, setShowKYCModal, setShowLoginModal } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    city: profile?.city || 'Brazzaville',
    phone: profile?.phone || '',
  });

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useSEO({ title: `Profil de ${profile?.full_name || 'Utilisateur'} | Expat-Congo` });

  const { data: myListings, isLoading: loadingListings } = useListings({
    userId: user?.id,
    status: statusFilter,
  });

  const { data: favoriteIds } = useFavorites();

  // Favorite listings fetch
  const { data: allListings } = useListings({ limit: 100 });
  const favoriteListings = allListings?.filter(l => favoriteIds?.includes(l.id)) || [];

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

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Erreur', description: 'Min. 6 caractères', variant: 'destructive' });
      return;
    }
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Mot de passe modifié !' });
      setNewPassword('');
      setOldPassword('');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setChangingPw(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = user?.email;
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    else toast({ title: 'Email envoyé', description: `Un lien de réinitialisation a été envoyé à ${email}` });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/avatar-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('listing-images').upload(path, file);
    if (error) { toast({ title: 'Erreur upload', variant: 'destructive' }); return; }
    const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('user_id', user.id);
    toast({ title: 'Photo mise à jour' });
    useAuthStore.getState().fetchProfile(user.id);
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Mon profil</h1>
          <p className="text-14 text-text-muted mb-6">Connectez-vous pour accéder à votre profil.</p>
          <Button onClick={() => setShowLoginModal(true)}>Se connecter</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto py-8 max-w-4xl pb-24 md:pb-8">
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
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-20 font-heading font-bold text-foreground">{profile?.full_name || 'Utilisateur'}</h1>
              <KYCBadge level={profile?.kyc_level ?? 0} status={profile?.kyc_status ?? 'none'} />
              <div className="flex items-center gap-4 mt-2 text-12 text-text-muted flex-wrap">
                {profile?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.city}</span>}
                {profile?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {profile.phone}</span>}
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {profile?.email || user.email}</span>
              </div>
              {profile?.bio && <p className="text-14 text-text-secondary mt-2">{profile.bio}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {(profile?.kyc_level ?? 0) < 2 && (
                <Button variant="outline" size="sm" onClick={() => setShowKYCModal(true)}>Vérifier</Button>
              )}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(!editing)}>
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </Button>
            </div>
          </div>

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
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="listings" className="gap-1.5">
              <Package className="w-4 h-4" /> Mes annonces
            </TabsTrigger>
            <TabsTrigger value="favoris" className="gap-1.5">
              <Heart className="w-4 h-4" /> Favoris ({favoriteIds?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="compte" className="gap-1.5">
              <Settings className="w-4 h-4" /> Compte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {/* Status filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { key: 'active', label: 'Actives' },
                { key: 'pending_moderation', label: 'En attente' },
                { key: 'rejected', label: 'Refusées' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`px-3 py-1.5 rounded-pill text-13 border transition-colors ${statusFilter === s.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border text-text-secondary'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {loadingListings ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <ListingCardSkeleton key={i} />)}
              </div>
            ) : !myListings || myListings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-14 text-text-muted mb-4">Aucune annonce {statusFilter !== 'active' ? 'dans cette catégorie' : ''}</p>
                <Button onClick={() => navigate('/deposer')}>Déposer une annonce</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {myListings.map(l => (
                  <ListingCard key={l.id} listing={l} isFavorited={favoriteIds?.includes(l.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favoris">
            {favoriteListings.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-14 text-text-muted">Aucun favori. Appuyez sur ❤️ sur une annonce pour la sauvegarder.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteListings.map(l => (
                  <ListingCard key={l.id} listing={l} isFavorited />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="compte">
            <div className="space-y-6 max-w-lg">
              {/* Change password */}
              <div className="bg-surface rounded-card border border-border p-5">
                <h3 className="text-16 font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Changer le mot de passe
                </h3>
                <div className="space-y-3">
                  <Input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <Button onClick={handleChangePassword} disabled={changingPw}>
                    {changingPw ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                  <button onClick={handleForgotPassword} className="text-14 text-primary hover:underline block">
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              {/* Logout + Delete */}
              <div className="bg-surface rounded-card border border-border p-5 space-y-3">
                <Button variant="outline" className="w-full gap-2 text-danger border-danger/30 hover:bg-danger-light" onClick={() => { signOut(); navigate('/'); }}>
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Profile;
