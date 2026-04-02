import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Heart, Share2, MapPin, Clock, Eye,
  Phone, MessageSquare, BadgeCheck, ShieldCheck, Flag, ChevronDown,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ListingCard from '@/components/listing/ListingCard';
import KYCBadge from '@/components/auth/KYCBadge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/constants';
import { getSpecsForCategory } from '@/lib/categorySpecs';
import { useAuthStore } from '@/stores/authStore';
import { useListing } from '@/hooks/useListing';
import { useListings } from '@/hooks/useListings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const user = useAuthStore((s) => s.user);

  const { data: listing, isLoading } = useListing(id);
  const { data: similarListingsData } = useListings({
    category: listing?.category_id,
    limit: 4,
  });

  const similarListings = similarListingsData?.filter(l => l.id !== id) || [];

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-12 space-y-8 animate-pulse">
          <div className="h-64 bg-surface rounded-card" />
          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-surface rounded" />
            <div className="h-4 w-1/4 bg-surface rounded" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!listing) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Annonce introuvable</h1>
          <p className="text-14 text-text-muted mb-6">Cette annonce n'existe plus ou a été supprimée.</p>
          <Link to="/">
            <Button variant="default">Retour à l'accueil</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const images = (listing.images && listing.images.length > 0) ? listing.images : [listing.imageUrl];
  const description = listing.description || "Aucune description fournie par le vendeur.";
  const specs = getSpecsForCategory(listing.category?.toLowerCase() || '');

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: listing.category || 'Toutes les catégories', href: `/recherche?cat=${listing.category_id}` },
    { label: listing.city, href: `/recherche?ville=${listing.city}` },
  ];

  const prevImage = () => setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1));
  const nextImage = () => setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0));

  const handleMessage = () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour envoyer un message." });
      return;
    }
    navigate(`/messages?listing=${listing.id}&recipient=${listing.user_id}`);
  };

  const handleReport = async (reason: string) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour signaler une annonce." });
      return;
    }
    setReporting(true);
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        listing_id: listing.id,
        reason: reason,
        status: 'pending'
      });
      if (error) throw error;
      toast({ title: "Signalement envoyé", description: "Merci de nous aider à maintenir la sécurité de la plateforme." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'envoyer le signalement.", variant: "destructive" });
    } finally {
      setReporting(false);
      setReportOpen(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Lien copié", description: "Le lien de l'annonce a été copié dans votre presse-papiers." });
    }
  };

  return (
    <PageWrapper>
      {/* Breadcrumb */}
      <div className="container mx-auto py-3">
        <nav className="flex items-center gap-1.5 text-12 text-text-muted">
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>›</span>}
              <Link to={bc.href} className="hover:text-primary transition-colors">{bc.label}</Link>
            </span>
          ))}
          <span>›</span>
          <span className="text-text-primary font-medium line-clamp-1">{listing.title}</span>
        </nav>
      </div>

      <div className="container mx-auto pb-20 md:pb-12">
        <div className="md:flex md:gap-6">
          {/* Left column */}
          <div className="md:w-[65%] space-y-6">
            {/* Image Gallery */}
            <div className="relative bg-background rounded-card overflow-hidden">
              <div className="aspect-[16/9] relative bg-surface">
                <img
                  src={images[currentImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-foreground/70 text-primary-foreground text-12 rounded-pill">
                      {currentImage + 1}/{images.length}
                    </span>
                  </>
                )}
                {listing.isSponsored && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-sponsored text-primary-foreground text-12 font-semibold rounded-pill">
                    Sponsorisé
                  </span>
                )}
              </div>
              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 py-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-primary' : 'bg-border-strong'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title + Meta (mobile) */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-20 font-heading font-bold text-foreground">{listing.title}</h1>
                {listing.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-11 font-semibold rounded-pill">
                    <ShieldCheck className="w-3 h-3" /> Vérifié
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="price-format text-24">
                  {listing.isFree ? 'Gratuit' : formatPrice(listing.price)}
                </span>
                {listing.priceNegotiable && !listing.isFree && (
                  <span className="text-12 text-text-muted">Négociable</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-12 text-text-muted">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {listing.createdAt}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views_count || 0} vues</span>
              </div>
            </div>

            {/* Key Specs */}
            {specs.length > 0 && listing.specs && (
              <div className="bg-surface rounded-card border border-border p-4">
                <h2 className="text-16 font-heading font-semibold text-foreground mb-3">Caractéristiques</h2>
                <div className="grid grid-cols-2 gap-3">
                  {specs.map((spec) => (
                    <div key={spec.key} className="flex items-center gap-2 p-2 bg-background rounded-input">
                      <span className="text-12 text-text-muted">{spec.label}</span>
                      <span className="text-12 font-medium text-foreground ml-auto">{listing.specs?.[spec.key] || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-surface rounded-card border border-border p-4">
              <h2 className="text-16 font-heading font-semibold text-foreground mb-3">Description</h2>
              <p className={`text-14 text-text-secondary leading-relaxed ${!descExpanded && description.length > 300 ? 'line-clamp-4' : ''}`}>
                {description}
              </p>
              {description.length > 300 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-2 text-14 text-primary font-medium flex items-center gap-1"
                >
                  {descExpanded ? 'Voir moins' : 'Voir plus'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${descExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Location */}
            <div className="bg-surface rounded-card border border-border p-4">
              <h2 className="text-16 font-heading font-semibold text-foreground mb-3">Localisation</h2>
              <div className="flex items-center gap-2 text-14 text-text-secondary">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{listing.neighborhood ? `${listing.neighborhood}, ${listing.city}` : listing.city}</span>
              </div>
              <div className="mt-3 h-40 bg-background rounded-input flex items-center justify-center text-text-muted text-12">
                Carte disponible prochainement
              </div>
            </div>

            {/* Seller Card (mobile) */}
            <div className="md:hidden bg-surface rounded-card border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-18 overflow-hidden">
                  {listing.userName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-14 font-semibold text-foreground">{listing.userName}</span>
                    {listing.isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
                  </div>
                  <KYCBadge 
                    level={listing.profiles?.kyc_level || 0} 
                    status={listing.profiles?.kyc_status === 'approved' ? 'approved' : 'none'} 
                  />
                  <p className="text-12 text-text-muted mt-0.5">
                    Membre depuis {listing.profiles?.created_at ? new Date(listing.profiles.created_at).toLocaleDateString() : '2024'}
                  </p>
                </div>
              </div>
              <Link to="#" className="block text-14 text-primary font-medium mt-3">
                Voir toutes ses annonces →
              </Link>
            </div>

            {/* Report */}
            <div className="relative">
              <button
                onClick={() => setReportOpen(!reportOpen)}
                className="text-12 text-text-muted hover:text-danger transition-colors flex items-center gap-1"
              >
                <Flag className="w-3 h-3" /> Signaler cette annonce ▾
              </button>
              {reportOpen && (
                <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-card shadow-md z-10 p-3 space-y-2 min-w-[220px]">
                  {['Annonce frauduleuse', 'Contenu inapproprié', 'Doublon', 'Mauvaise catégorie', 'Autre'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleReport(reason)}
                      disabled={reporting}
                      className="block w-full text-left text-14 text-text-secondary hover:text-danger py-1 transition-colors"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <div>
                <h2 className="text-18 font-heading font-semibold text-foreground mb-4">Annonces similaires</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarListings.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar (desktop) */}
          <div className="hidden md:block md:w-[35%]">
            <div className="sticky top-20 space-y-4">
              {/* Price Card */}
              <div className="bg-surface rounded-card border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-18 font-heading font-bold text-foreground">{listing.title}</h1>
                  {listing.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-11 font-semibold rounded-pill">
                      <ShieldCheck className="w-3 h-3" /> Vérifié
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="price-format text-28">
                    {listing.isFree ? 'Gratuit' : formatPrice(listing.price)}
                  </span>
                  {listing.priceNegotiable && !listing.isFree && (
                    <span className="text-12 text-text-muted">Négociable</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 text-12 text-text-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {listing.createdAt}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views_count || 0} vues</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-14 text-text-secondary">
                  <MapPin className="w-4 h-4 text-primary" />
                  {listing.neighborhood ? `${listing.neighborhood}, ${listing.city}` : listing.city}
                </div>
                <div className="flex gap-2 mt-5">
                  <Button variant="outline" className="flex-1 gap-2" asChild>
                    <a href={`tel:${listing.profiles?.phone || ''}`}>
                      <Phone className="w-4 h-4" /> Appeler
                    </a>
                  </Button>
                  <Button variant="default" className="flex-1 gap-2" onClick={handleMessage}>
                    <MessageSquare className="w-4 h-4" /> Envoyer un message
                  </Button>
                </div>
                <div className="flex justify-center gap-3 mt-3">
                  <button className="text-text-muted hover:text-danger transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button onClick={handleShare} className="text-text-muted hover:text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Seller Card */}
              <div className="bg-surface rounded-card border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-18 overflow-hidden">
                    {listing.userName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-14 font-semibold text-foreground">{listing.userName}</span>
                      {listing.isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
                    </div>
                    <KYCBadge 
                      level={listing.profiles?.kyc_level || 0} 
                      status={listing.profiles?.kyc_status === 'approved' ? 'approved' : 'none'} 
                    />
                    <p className="text-12 text-text-muted mt-0.5">
                      Membre depuis {listing.profiles?.created_at ? new Date(listing.profiles.created_at).toLocaleDateString() : '2024'}
                    </p>
                  </div>
                </div>
                <Link to="#" className="block text-14 text-primary font-medium mt-3">
                  Voir toutes ses annonces →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-3 flex gap-3 md:hidden z-40">
        <Button variant="outline" className="flex-1 gap-2" asChild>
          <a href={`tel:${listing.profiles?.phone || ''}`}>
            <Phone className="w-4 h-4" /> Appeler
          </a>
        </Button>
        <Button variant="default" className="flex-1 gap-2" onClick={handleMessage}>
          <MessageSquare className="w-4 h-4" /> Envoyer un message
        </Button>
      </div>
    </PageWrapper>
  );
};

export default ListingDetail;
