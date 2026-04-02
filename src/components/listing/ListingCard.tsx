import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, BadgeCheck, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
  variant?: 'grid' | 'list';
  isFavorited?: boolean;
  onFavoriteToggle?: (listingId: string, favorited: boolean) => void;
}

const ListingCard = ({ listing, variant = 'grid', isFavorited = false, onFavoriteToggle }: ListingCardProps) => {
  const {
    id,
    title,
    description,
    price,
    isFree,
    city,
    neighborhood,
    imageUrl,
    isSponsored,
    createdAt,
    userName,
    isVerified,
    priceNegotiable,
  } = listing;

  const [favorited, setFavorited] = useState(isFavorited);
  const [imgLoaded, setImgLoaded] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !favorited;
    setFavorited(newState); // optimistic
    onFavoriteToggle?.(id, newState);

    if (!user) return;
    if (newState) {
      await supabase.from('favorites').insert({ user_id: user.id, listing_id: id });
    } else {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', id);
    }
  };

  const priceDisplay = isFree
    ? 'Gratuit'
    : price === 0 || !price
      ? 'Prix à négocier'
      : formatPrice(price);

  if (variant === 'list') {
    return (
      <Link to={`/annonce/${id}`} className="group flex bg-surface rounded-card border border-border shadow-xs hover:shadow-md transition-all duration-150 overflow-hidden cursor-pointer hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative w-[200px] flex-shrink-0 overflow-hidden bg-background">
          {!imgLoaded && <div className="absolute inset-0 bg-background animate-pulse" />}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          {isSponsored && (
            <span className="absolute top-2 left-2 px-2.5 py-1 bg-sponsored text-primary-foreground text-11 font-semibold rounded-pill">
              Sponsorisé
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="price-format text-18">{priceDisplay}</span>
              {priceNegotiable && !isFree && (
                <span className="text-11 text-text-muted">Négociable</span>
              )}
            </div>
            <h3 className="text-14 font-medium text-text-primary line-clamp-2 leading-snug">{title}</h3>
            {description && (
              <p className="text-12 text-text-secondary line-clamp-2">{description}</p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 mt-auto">
            <div className="flex items-center gap-1 text-12 text-text-muted">
              <MapPin className="w-3 h-3" />
              <span>{neighborhood ? `${neighborhood}, ${city}` : city}</span>
            </div>
            <div className="flex items-center gap-1 text-12 text-text-muted">
              <Clock className="w-3 h-3" />
              <span>{createdAt}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-12 text-text-secondary">{userName}</span>
              {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
            </div>
            <button
              onClick={handleFavorite}
              className="p-1.5 rounded-full hover:bg-background transition-colors"
              aria-label="Sauvegarder l'annonce"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-danger text-danger' : 'text-text-secondary'}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link to={`/annonce/${id}`} className="group bg-surface rounded-card border border-border shadow-xs hover:shadow-md transition-all duration-150 overflow-hidden cursor-pointer hover:-translate-y-0.5 block">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        {!imgLoaded && <div className="absolute inset-0 bg-background animate-pulse" />}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        {isSponsored && (
          <span className="absolute top-2 left-2 px-2.5 py-1 bg-sponsored text-primary-foreground text-11 font-semibold rounded-pill">
            Sponsorisé
          </span>
        )}
        {isVerified && (
          <span className="absolute top-2 right-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground" />
          </span>
        )}
        <button
          onClick={handleFavorite}
          className="absolute bottom-2 right-2 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          aria-label="Sauvegarder l'annonce"
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-danger text-danger' : 'text-text-secondary'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="price-format text-18">{priceDisplay}</span>
          {priceNegotiable && !isFree && (
            <span className="text-11 text-text-muted">Négociable</span>
          )}
        </div>
        <h3 className="text-14 font-medium text-text-primary line-clamp-2 leading-snug">{title}</h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-12 text-text-muted">
            <MapPin className="w-3 h-3" />
            <span>{neighborhood ? `${neighborhood}, ${city}` : city}</span>
          </div>
          <div className="flex items-center gap-1 text-12 text-text-muted">
            <Clock className="w-3 h-3" />
            <span>{createdAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t border-border">
          <span className="text-12 text-text-secondary">{userName}</span>
          {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
