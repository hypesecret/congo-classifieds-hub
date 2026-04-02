import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ListingCard from '@/components/listing/ListingCard';
import { useListings } from '@/hooks/useListings';

const SponsoredCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: listings, isLoading } = useListings({ limit: 4, isSponsored: true });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!isLoading && listings?.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-accent/5">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-20 md:text-24 text-text-primary">
            Annonces sponsorisées
          </h2>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center hover:bg-background transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar md:grid md:grid-cols-4 md:overflow-visible"
        >
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="min-w-[260px] md:min-w-0 bg-surface rounded-card animate-pulse aspect-[4/5]" />
            ))
          ) : (
            listings?.map(listing => (
              <div key={listing.id} className="min-w-[260px] md:min-w-0">
                <ListingCard listing={listing} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SponsoredCarousel;
