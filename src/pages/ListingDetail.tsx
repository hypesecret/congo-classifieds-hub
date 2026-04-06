import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Heart, Share2, MapPin, Clock, Eye,
  Phone, MessageSquare, BadgeCheck, ShieldCheck, Flag, ChevronDown, Maximize2, X,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ListingCard from '@/components/listing/ListingCard';
import KYCBadge from '@/components/auth/KYCBadge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/constants';
import { timeAgo } from '@/lib/timeAgo';
import { getSpecsForCategory } from '@/lib/categorySpecs';
import { useAuthStore } from '@/stores/authStore';
import { useListing } from '@/hooks/useListing';
import { useListings } from '@/hooks/useListings';
import { useToggleFavorite, useFavorites } from '@/hooks/useFavorites';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const { data: listing, isLoading } = useListing(id);
  const { data: similarListingsData } = useListings({ category: listing?.category_id, limit: 4 });
  const { data: favoriteIds } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();

  const similarListings = similarListingsData?.filter(l => l.id !== id) || [];
  const isFavorited = favoriteIds?.includes(id || '') || false;

  useSEO({
    title: listing ? `${listing.title} — ${listing.isFree ? 'Gratuit' : formatPrice(listing.price)} | Expat-Congo` : 'Annonce | Expat-Congo',
    description: listing?.description?.slice(0, 160),
    ogImage: listing?.images?.[0] || listing?.imageUrl,
  });

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-12 space-y-8 animate-pulse">
          <div className="h-64 bg-surface rounded-card" />
          <div className="space-y-4"><div className="h-8 w-1/3 bg-surface rounded" /><div className="h-4 w-1/4 bg-surface rounded" /></div>
        </div>
      </PageWrapper>
    );
  }

  if (!listing) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Annonce introuvable</h1>
          <p className="text-14 text-muted-foreground mb-6">Cette annonce n'existe plus ou a été supprimée.</p>
          <Link to="/"><Button>Retour à l'accueil</Button></Link>
        </div>
      </PageWrapper>
    );
  }

  const images = (listing.images && listing.images.length > 0) ? listing.images : [listing.imageUrl];
  const description = listing.description || "Aucune description fournie.";
  const specs = getSpecsForCategory(listing.category?.toLowerCase() || '');
  const relativeTime = listing.created_at ? timeAgo(listing.created_at) : listing.createdAt;

  const prevImage = () => setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1));
  const nextImage = () => setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0));

  const handleFavorite = () => {
    if (!user) { useAuthStore.getState().setShowLoginModal(true); return; }
    toggleFavorite({ listingId: listing.id, isFavorited });
  };

  const handleMessage = () => {
    if (!user) { useAuthStore.getState().setShowLoginModal(true); return; }
    navigate(`/messages?listing=${listing.id}&recipient=${listing.user_id}`);
  };

  const handleReport = async (reason: string) => {
    if (!user) { useAuthStore.getState().setShowLoginModal(true); return; }
    setReporting(true);
    try {
      const { error } = await supabase.from('reports').insert({ reporter_id: user.id, listing_id: listing.id, reason, status: 'pending' });
      if (error) throw error;
      toast({ title: "Signalement envoyé" });
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
    finally { setReporting(false); setReportOpen(false); }
  };

  const handleShare = async () => {
    const shareData = { title: listing.title, text: `${listing.title} — ${formatPrice(listing.price)}`, url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(shareData); }
      else { window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.title} ${shareData.url}`)}`); }
    } catch { navigator.clipboard.writeText(window.location.href); toast({ title: "Lien copié !" }); }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto py-3">
        <nav className="flex items-center gap-1.5 text-12 text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <span>›</span>
          <Link to={`/annonces?cat=${listing.category_id}`} className="hover:text-primary transition-colors">{listing.category}</Link>
          <span>›</span>
          <span className="text-foreground font-medium line-clamp-1">{listing.title}</span>
        </nav>
      </div>

      <div className="container mx-auto pb-24 md:pb-12">
        <div className="md:flex md:gap-6">
          {/* Left column */}
          <div className="md:w-[60%] space-y-6">
            {/* Image Gallery */}
            <div className="relative bg-surface rounded-card overflow-hidden">
              <div className="aspect-[4/3] relative">
                <img src={images[currentImage]} alt={listing.title} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface"><ChevronRight className="w-5 h-5" /></button>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-foreground/70 text-primary-foreground text-12 rounded-pill">{currentImage + 1}/{images.length}</span>
                  </>
                )}
                <button onClick={() => setLightboxOpen(true)} className="absolute top-3 right-3 w-9 h-9 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface"><Maximize2 className="w-4 h-4" /></button>
                {listing.isSponsored && <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-12 font-semibold rounded-pill">Sponsorisé</span>}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto hide-scrollbar">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={`w-16 h-12 rounded-input overflow-hidden flex-shrink-0 border-2 transition-colors ${i === currentImage ? 'border-primary' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile title */}
            <div className="md:hidden space-y-2">
              <h1 className="text-20 font-heading font-bold text-foreground">{listing.title}</h1>
              <div className="flex items-baseline gap-2">
                <span className="price-format text-24">{listing.isFree ? 'Gratuit' : formatPrice(listing.price)}</span>
                {listing.priceNegotiable && !listing.isFree && <span className="text-12 text-muted-foreground italic">Négociable</span>}
              </div>
              <div className="flex items-center gap-4 text-12 text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {relativeTime}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views_count || 0} vues</span>
              </div>
            </div>

            {/* Specs */}
            {specs.length > 0 && listing.specs && (
              <div className="bg-surface rounded-card border border-border p-4">
                <h2 className="text-16 font-heading font-semibold text-foreground mb-3">Caractéristiques</h2>
                <div className="grid grid-cols-2 gap-2">
                  {specs.map((spec) => (
                    <div key={spec.key} className="flex items-center justify-between p-2.5 bg-background rounded-input">
                      <span className="text-12 text-muted-foreground">{spec.label}</span>
                      <span className="text-12 font-medium text-foreground">{listing.specs?.[spec.key] || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-surface rounded-card border border-border p-4">
              <h2 className="text-16 font-heading font-semibold text-foreground mb-3">Description</h2>
              <p className={`text-14 text-muted-foreground leading-relaxed whitespace-pre-wrap ${!descExpanded && description.length > 200 ? 'line-clamp-4' : ''}`}>{description}</p>
              {description.length > 200 && (
                <button onClick={() => setDescExpanded(!descExpanded)} className="mt-2 text-14 text-primary font-medium flex items-center gap-1">
                  {descExpanded ? 'Voir moins' : 'Voir plus'}<ChevronDown className={`w-4 h-4 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Location */}
            <div className="bg-surface rounded-card border border-border p-4">
              <h2 className="text-16 font-heading font-semibold text-foreground mb-3">Localisation</h2>
              <div className="flex items-center gap-2 text-14 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {listing.neighborhood ? `${listing.neighborhood}, ${listing.city}` : listing.city}
              </div>
            </div>

            {/* Mobile seller card */}
            <div className="md:hidden bg-surface rounded-card border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-18">{listing.userName[0]}</div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-14 font-semibold text-foreground">{listing.userName}</span>
                    {listing.isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
                  </div>
                  <KYCBadge level={listing.profiles?.kyc_level || 0} status={listing.profiles?.kyc_status === 'approved' ? 'approved' : 'none'} />
                </div>
              </div>
              <Link to={`/annonces?userId=${listing.user_id}`} className="block text-14 text-primary font-medium mt-3">Voir toutes ses annonces →</Link>
            </div>

            {/* Share + Report */}
            <div className="flex items-center gap-4">
              <button onClick={handleShare} className="text-12 text-muted-foreground hover:text-primary flex items-center gap-1"><Share2 className="w-3 h-3" /> Partager</button>
              <div className="relative">
                <button onClick={() => setReportOpen(!reportOpen)} className="text-12 text-muted-foreground hover:text-danger flex items-center gap-1"><Flag className="w-3 h-3" /> Signaler</button>
                {reportOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-card shadow-md z-10 p-2 min-w-[200px]">
                    {['Annonce frauduleuse', 'Contenu inapproprié', 'Doublon', 'Autre'].map((r) => (
                      <button key={r} onClick={() => handleReport(r)} disabled={reporting} className="block w-full text-left text-14 text-muted-foreground hover:text-danger py-1.5 px-2 rounded transition-colors">{r}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Similar */}
            {similarListings.length > 0 && (
              <div>
                <h2 className="text-18 font-heading font-semibold text-foreground mb-4">Annonces similaires</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar md:grid md:grid-cols-4 md:overflow-visible">
                  {similarListings.map((l) => (
                    <div key={l.id} className="min-w-[200px] md:min-w-0"><ListingCard listing={l} /></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="hidden md:block md:w-[40%]">
            <div className="sticky top-20 space-y-4">
              <div className="bg-surface rounded-card border border-border p-5 shadow-card">
                <h1 className="text-18 font-heading font-bold text-foreground">{listing.title}</h1>
                {listing.isVerified && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-11 font-semibold rounded-pill mt-1"><ShieldCheck className="w-3 h-3" /> Vérifié</span>}
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="price-format text-28">{listing.isFree ? 'Gratuit' : formatPrice(listing.price)}</span>
                  {listing.priceNegotiable && !listing.isFree && <span className="text-12 text-muted-foreground italic">Négociable</span>}
                </div>
                <div className="flex items-center gap-4 mt-3 text-12 text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {relativeTime}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views_count || 0} vues</span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-14 text-muted-foreground"><MapPin className="w-4 h-4 text-primary" />{listing.neighborhood ? `${listing.neighborhood}, ${listing.city}` : listing.city}</div>
                <div className="flex gap-2 mt-5">
                  <Button variant="outline" className="flex-1 gap-2" asChild><a href={`tel:${listing.profiles?.phone || ''}`}><Phone className="w-4 h-4" /> Appeler</a></Button>
                  <Button variant="default" className="flex-1 gap-2" onClick={handleMessage}><MessageSquare className="w-4 h-4" /> Message</Button>
                </div>
                <div className="flex justify-center gap-4 mt-3">
                  <button onClick={handleFavorite} className="text-muted-foreground hover:text-danger transition-colors"><Heart className={`w-5 h-5 ${isFavorited ? 'fill-danger text-danger' : ''}`} /></button>
                  <button onClick={handleShare} className="text-muted-foreground hover:text-primary transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Seller */}
              <div className="bg-surface rounded-card border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-18">{listing.userName[0]}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-14 font-semibold text-foreground">{listing.userName}</span>
                      {listing.isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
                    </div>
                    <KYCBadge level={listing.profiles?.kyc_level || 0} status={listing.profiles?.kyc_status === 'approved' ? 'approved' : 'none'} />
                  </div>
                </div>
                <Link to={`/annonces?userId=${listing.user_id}`} className="block text-14 text-primary font-medium mt-3 hover:underline">Voir toutes ses annonces →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-surface border-t border-border p-3 flex gap-3 md:hidden z-40">
        <Button variant="outline" className="flex-1 gap-2" asChild><a href={`tel:${listing.profiles?.phone || ''}`}><Phone className="w-4 h-4" /> Appeler</a></Button>
        <Button variant="default" className="flex-1 gap-2" onClick={handleMessage}><MessageSquare className="w-4 h-4" /> Message</Button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-primary-foreground" onClick={() => setLightboxOpen(false)}><X className="w-8 h-8" /></button>
          <img src={images[currentImage]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center"><ChevronLeft className="w-6 h-6 text-primary-foreground" /></button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center"><ChevronRight className="w-6 h-6 text-primary-foreground" /></button>
            </>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default ListingDetail;
