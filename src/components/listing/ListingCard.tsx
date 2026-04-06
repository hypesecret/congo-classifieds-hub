import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { timeAgo } from '@/lib/timeAgo';
import { useAuthStore } from '@/stores/authStore';
import { useToggleFavorite, useFavorites } from '@/hooks/useFavorites';
import type { Listing } from '@/types';
import React from 'react';

interface ListingCardProps {
  listing: Listing;
  variant?: 'grid' | 'list';
  isFavorited?: boolean;
}

const ListingCard = React.memo(({ listing, variant = 'grid', isFavorited: isFavoritedProp }: ListingCardProps) => {
  const {
    id, title, description, price, isFree, city, neighborhood,
    imageUrl, isSponsored, created_at, userName, isVerified, priceNegotiable,
  } = listing;

  const [imgLoaded, setImgLoaded] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { data: favoriteIds } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();

  const favorited = isFavoritedProp ?? (favoriteIds?.includes(id) || false);
  const isNew = created_at ? (Date.now() - new Date(created_at).getTime()) < 24 * 60 * 60 * 1000 : false;
  const relativeTime = created_at ? timeAgo(created_at) : '';

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      useAuthStore.getState().setShowLoginModal(true);
      return;
    }
    toggleFavorite({ listingId: id, isFavorited: favorited });
  };

  const priceDisplay = isFree
    ? 'Gratuit'
    : price === 0 || !price
      ? 'Prix à débattre'
      : formatPrice(price);

  if (variant === 'list') {
    return (
      <Link to={`/annonce/${id}`} className="group flex bg-surface rounded-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-0.5">
        <div className="relative w-[120px] h-[90px] flex-shrink-0 overflow-hidden bg-primary/5">
          {!imgLoaded && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" onLoad={() => setImgLoaded(true)} />
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            <span className="price-format text-16">{priceDisplay}</span>
            <h3 className="text-14 font-medium text-foreground line-clamp-1">{title}</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-12 text-muted-foreground"><MapPin className="w-3 h-3" />{city}</span>
            <span className="text-11 text-muted-foreground">{relativeTime}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/annonce/${id}`} className="group bg-surface rounded-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-[3px] block">
      <div className="relative aspect-[4/3] overflow-hidden bg-primary/5">
        {!imgLoaded && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width={400} height={300} onLoad={() => setImgLoaded(true)} />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && !isSponsored && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-11 font-semibold rounded-pill">NOUVEAU</span>
          )}
          {isSponsored && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-11 font-semibold rounded-pill flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> BOOSTÉ
            </span>
          )}
        </div>

        {isVerified && (
          <span className="absolute top-2 right-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground" />
          </span>
        )}
        
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 w-8 h-8 bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface transition-all active:scale-125"
          aria-label="Sauvegarder"
        >
          <Heart className={`w-4 h-4 transition-colors ${favorited ? 'fill-danger text-danger' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <div className="p-3 space-y-1.5">
        <span className="price-format text-18 block">{priceDisplay}</span>
        {priceNegotiable && !isFree && <span className="text-11 text-muted-foreground italic">Négociable</span>}
        <h3 className="text-14 font-medium text-foreground line-clamp-2 leading-snug">{title}</h3>
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-12 text-muted-foreground"><MapPin className="w-3 h-3" />{neighborhood ? `${neighborhood}, ${city}` : city}</span>
          <span className="text-11 text-muted-foreground">{relativeTime}</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
          <span className="text-12 text-muted-foreground">{userName}</span>
          {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
        </div>
      </div>
    </Link>
  );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
