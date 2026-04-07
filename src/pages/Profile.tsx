import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Settings, Package, LogOut, Camera, MapPin, Phone, Mail, Edit2, Lock, Sun, Moon, Trash2 } from 'lucide-react';
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
import { compressImage } from '@/utils/imageOptimizer';

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
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useSEO({ title: `Profil de ${profile?.full_name || 'Utilisateur'} | Expat-Congo` });

  const { data: myListings, isLoading: loadingListings } = useListings({ userId: user?.id, status: statusFilter });
  const { data: favoriteIds } = useFavorites();

  // Optimized: fetch only favorited listings via their IDs
  const { data: favListings, isLoading: loadingFavs } = useQuery({
    queryKey: ['favorite-listings', favoriteIds],
    queryFn: async () => {
      if (!favoriteIds || favoriteIds.length === 0) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`*, profiles!listings_user_id_fkey(full_name, kyc_status, avatar_url, kyc_level), categories!category_id(name, slug)`)
        .in('id', favoriteIds)
        .eq('status', 'active');
      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.id, user_id: item.user_id, title: item.title, description: item.description,
        price: item.price || 0, is_free: item.is_free, isFree: item.is_free, city: item.city,
        neighborhood: item.neighborhood, category: item.categories?.name || 'Autres',
        category_id: item.category_id, imageUrl: item.cover_image || '', cover_image: item.cover_image,
        images: item.images, is_sponsored: item.is_sponsored, isSponsored: item.is_sponsored || false,
        sponsor_level: item.sponsor_level, created_at: item.created_at,
        createdAt: new Date(item.created_at).toLocaleDateString(),
        userName: item.profiles?.full_name || 'Utilisateur',
        isVerified: item.profiles?.kyc_status === 'approved',
        price_negotiable: item.price_negotiable, priceNegotiable: item.price_negotiable || false,
        status: item.status, views_count: item.views_count, contact_count: item.contact_count,
        specs: item.specs,
      }));
    },
    enabled: !!favoriteIds && favoriteIds.length > 0,
  });
  const favoriteListings = favListings || [];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update(editData).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Profil mis à jour' });
      setEditing(false);
      useAuthStore.getState().fetchProfile(user.id);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast({ title: 'Erreur', description: 'Min. 6 caractères', variant: 'destructive' }); return; }
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Mot de passe modifié !' });
      setNewPassword('');
    } catch (err: any) { toast({ title: 'Erreur', description: err.message, variant: 'destructive' }); }
    finally { setChangingPw(false); }
  };

  const handleForgotPassword = async () => {
    const email = user?.email;
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    else toast({ title: 'Email envoyé', description: `Lien de réinitialisation envoyé à ${email}` });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const compressed = await compressImage(file, 200, 0.9);
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('avatars').upload(path, compressed);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('user_id', user.id);
      toast({ title: 'Photo mise à jour' });
      useAuthStore.getState().fetchProfile(user.id);
    } catch { toast({ title: 'Erreur upload', variant: 'destructive' }); }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('expat-theme', newMode ? 'dark' : 'light');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER' || !user) return;
    await supabase.from('profiles').update({ is_banned: true, ban_reason: 'Account self-deleted' } as any).eq('user_id', user.id);
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: 'Compte supprimé' });
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Mon profil</h1>
          <p className="text-14 text-muted-foreground mb-6">Connectez-vous pour accéder à votre profil.</p>
          <Button onClick={() => setShowLoginModal(true)}>Se connecter</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto py-8 max-w-4xl pb-24 md:pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-card p-6 mb-6 text-primary-foreground">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center font-heading font-bold text-32 overflow-hidden border-2 border-primary-foreground/30">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-surface text-primary rounded-full flex items-center justify-center cursor-pointer shadow-md">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-20 font-heading font-bold">{profile?.full_name || 'Utilisateur'}</h1>
              <div className="mt-1"><KYCBadge level={profile?.kyc_level ?? 0} status={profile?.kyc_status ?? 'none'} /></div>
              <div className="flex items-center gap-4 mt-2 text-12 text-primary-foreground/70 flex-wrap">
                {profile?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.city}</span>}
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {profile?.email || user.email}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {(profile?.kyc_level ?? 0) < 2 && <Button variant="secondary" size="sm" onClick={() => setShowKYCModal(true)}>Vérifier</Button>}
              <Button variant="secondary" size="sm" className="gap-1" onClick={() => setEditing(!editing)}><Edit2 className="w-3.5 h-3.5" /> Modifier</Button>
            </div>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-surface rounded-card border border-border p-6 mb-6 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-12 text-muted-foreground">Nom complet</label><Input value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-12 text-muted-foreground">Ville</label><Input value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-12 text-muted-foreground">Téléphone</label><Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><label className="text-12 text-muted-foreground">Bio</label><Textarea value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })} rows={3} /></div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="listings" className="gap-1.5"><Package className="w-4 h-4" /> Mes annonces</TabsTrigger>
            <TabsTrigger value="favoris" className="gap-1.5"><Heart className="w-4 h-4" /> Favoris ({favoriteIds?.length || 0})</TabsTrigger>
            <TabsTrigger value="compte" className="gap-1.5"><Settings className="w-4 h-4" /> Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="flex gap-2 mb-4 flex-wrap">
              {[{ key: 'active', label: 'Actives' }, { key: 'pending_moderation', label: 'En attente' }, { key: 'rejected', label: 'Refusées' }].map(s => (
                <button key={s.key} onClick={() => setStatusFilter(s.key)} className={`px-3 py-1.5 rounded-pill text-13 border transition-colors ${statusFilter === s.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border text-muted-foreground'}`}>{s.label}</button>
              ))}
            </div>
            {loadingListings ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <ListingCardSkeleton key={i} />)}</div>
            ) : !myListings || myListings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-14 text-muted-foreground mb-4">Aucune annonce</p>
                <Button onClick={() => navigate('/deposer')}>Déposer une annonce</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{myListings.map(l => <ListingCard key={l.id} listing={l} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="favoris">
            {loadingFavs ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <ListingCardSkeleton key={i} />)}</div>
            ) : favoriteListings.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-14 text-muted-foreground">Aucun favori. Appuyez sur ❤️ pour sauvegarder une annonce.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{favoriteListings.map(l => <ListingCard key={l.id} listing={l} isFavorited />)}</div>
            )}
          </TabsContent>

          <TabsContent value="compte">
            <div className="space-y-6 max-w-lg">
              {/* Dark mode */}
              <div className="bg-surface rounded-card border border-border p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                  <span className="text-14 text-foreground font-medium">Mode sombre</span>
                </div>
                <button onClick={toggleDarkMode} className={`w-12 h-7 rounded-full transition-colors relative ${darkMode ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`w-5 h-5 rounded-full bg-surface shadow-sm absolute top-1 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Password */}
              <div className="bg-surface rounded-card border border-border p-5">
                <h3 className="text-16 font-heading font-semibold text-foreground mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Mot de passe</h3>
                <div className="space-y-3">
                  <Input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <Button onClick={handleChangePassword} disabled={changingPw}>{changingPw ? 'Modification...' : 'Modifier'}</Button>
                  <button onClick={handleForgotPassword} className="text-14 text-primary hover:underline block">Mot de passe oublié ?</button>
                </div>
              </div>

              {/* Logout + Delete */}
              <div className="bg-surface rounded-card border border-border p-5 space-y-3">
                <Button variant="outline" className="w-full gap-2 text-danger border-danger/30 hover:bg-danger-light" onClick={() => { signOut(); navigate('/'); }}>
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </Button>
                <Button variant="ghost" className="w-full gap-2 text-danger text-12" onClick={() => setShowDeleteModal(true)}>
                  <Trash2 className="w-4 h-4" /> Supprimer mon compte
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
          <div className="bg-surface rounded-card p-6 max-w-sm mx-4 shadow-modal">
            <h3 className="text-18 font-heading font-bold text-danger mb-3">Supprimer votre compte ?</h3>
            <p className="text-14 text-muted-foreground mb-4">Cette action est irréversible. Tapez <strong>SUPPRIMER</strong> pour confirmer.</p>
            <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="SUPPRIMER" className="mb-3" />
            <div className="flex gap-2">
              <Button variant="destructive" disabled={deleteConfirm !== 'SUPPRIMER'} onClick={handleDeleteAccount} className="flex-1">Confirmer</Button>
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} className="flex-1">Annuler</Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Profile;
