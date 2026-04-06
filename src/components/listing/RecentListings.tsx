import { useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '@/components/listing/ListingCard';
import ListingCardSkeleton from '@/components/listing/ListingCardSkeleton';
import { ArrowRight } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';

const RecentListings = () => {
  const [visibleCount, setVisibleCount] = useState(8);
  const { data: listings, isLoading } = useListings({ limit: 24, isSponsored: false });

  const visibleListings = listings?.slice(0, visibleCount) || [];
  const hasMore = listings && visibleCount < listings.length;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-20 md:text-24 text-foreground">
            Annonces récentes
          </h2>
          <Link
            to="/annonces"
            className="flex items-center gap-1 text-14 font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
          ) : (
            visibleListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
          {!isLoading && listings?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Aucune annonce trouvée. Soyez le premier à en publier une !
            </div>
          )}
        </div>
        {hasMore && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => setVisibleCount(c => c + 8)}>
              Voir plus d'annonces
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentListings;
