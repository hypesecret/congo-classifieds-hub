import { Link } from 'react-router-dom';
import ListingCard from '@/components/listing/ListingCard';
import { ArrowRight } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { Skeleton } from '@/components/ui/skeleton';

const RecentListings = () => {
  const { data: listings, isLoading } = useListings({ limit: 8, isSponsored: false });

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-20 md:text-24 text-text-primary">
            Dernières annonces
          </h2>
          <Link
            to="/annonces"
            className="flex items-center gap-1 text-14 font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Voir toutes les annonces
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-surface rounded-card animate-pulse" />
            ))
          ) : (
            listings?.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
          {!isLoading && listings?.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary">
              Aucune annonce trouvée. Soyez le premier à en publier une !
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RecentListings;
