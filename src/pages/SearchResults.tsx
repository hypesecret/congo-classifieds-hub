import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal, X, Grid3X3, List, Search as SearchIcon,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ListingCard from '@/components/listing/ListingCard';
import ListingCardSkeleton from '@/components/listing/ListingCardSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CITIES } from '@/lib/constants';
import { useListings } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';
import { useSEO } from '@/hooks/useSEO';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'price_asc', label: 'Prix ↑' },
  { value: 'price_desc', label: 'Prix ↓' },
];

const PAGE_SIZE = 12;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const catParam = searchParams.get('cat') || '';
  const villeParam = searchParams.get('ville') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam);
  const [selectedCity, setSelectedCity] = useState<string>(villeParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);

  const { data: categories } = useCategories();
  const selectedCatName = useMemo(() => categories?.find(c => c.id === selectedCategory)?.name, [categories, selectedCategory]);

  useSEO({
    title: selectedCatName
      ? `Annonces ${selectedCatName}${selectedCity ? ` à ${selectedCity}` : ''} | Expat-Congo`
      : 'Toutes les annonces | Expat-Congo',
    description: `Trouvez ${selectedCatName || 'des annonces'} au Congo-Brazzaville${selectedCity ? ` à ${selectedCity}` : ''}.`,
  });

  // Reset when filters change
  useEffect(() => {
    setPage(0);
    setAllListings([]);
    setHasMore(true);
  }, [searchQuery, selectedCategory, selectedCity, priceRange, sortBy]);

  const { data: listings, isLoading, isFetching } = useListings({
    query: searchQuery,
    category: selectedCategory,
    city: selectedCity === 'Toutes les villes' ? undefined : selectedCity,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
    sortBy: sortBy as any,
    page,
    pageSize: PAGE_SIZE,
  });

  // Accumulate listings for infinite scroll
  useEffect(() => {
    if (listings) {
      if (page === 0) {
        setAllListings(listings);
      } else {
        setAllListings(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newItems = listings.filter(l => !existingIds.has(l.id));
          return [...prev, ...newItems];
        });
      }
      if (listings.length < PAGE_SIZE) setHasMore(false);
    }
  }, [listings, page]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isFetching) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !isFetching) setPage(p => p + 1); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('cat', selectedCategory);
    if (selectedCity && selectedCity !== 'Toutes les villes') params.set('ville', selectedCity);
    const newStr = params.toString();
    if (newStr !== searchParams.toString()) setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedCity]);

  // Active filter chips
  const activeFilters = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (selectedCatName) chips.push({ label: selectedCatName, clear: () => setSelectedCategory('') });
    if (selectedCity && selectedCity !== 'Toutes les villes') chips.push({ label: selectedCity, clear: () => setSelectedCity('') });
    if (priceRange[0] > 0 || priceRange[1] < 50000000) chips.push({ label: 'Prix filtré', clear: () => setPriceRange([0, 50000000]) });
    return chips;
  }, [selectedCatName, selectedCity, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setPriceRange([0, 50000000]);
    setSearchQuery('');
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-16 font-heading font-semibold text-foreground">Filtres</h3>
        <button onClick={clearFilters} className="text-12 text-primary hover:underline">Effacer tout</button>
      </div>

      <div>
        <p className="text-14 font-medium text-foreground mb-2">Catégorie</p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {categories?.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 py-1 cursor-pointer">
              <input type="radio" name="category" checked={selectedCategory === cat.id} onChange={() => setSelectedCategory(cat.id)} className="w-4 h-4 accent-primary" />
              <span className="text-14 text-muted-foreground flex-1">{cat.name}</span>
              <span className="text-11 text-muted-foreground">({cat.count})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-14 font-medium text-foreground mb-2">Localisation</p>
        <div className="space-y-1">
          {CITIES.map((city) => (
            <label key={city} className="flex items-center gap-2 py-1 cursor-pointer">
              <input type="radio" name="city" checked={selectedCity === city} onChange={() => setSelectedCity(city)} className="w-4 h-4 accent-primary" />
              <span className="text-14 text-muted-foreground">{city}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-14 font-medium text-foreground mb-2">Prix (FCFA)</p>
        <div className="flex gap-2">
          <Input type="number" placeholder="Min" value={priceRange[0] || ''} onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} className="text-12" />
          <Input type="number" placeholder="Max" value={priceRange[1] === 50000000 ? '' : priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000000])} className="text-12" />
        </div>
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <div className="container mx-auto py-4">
        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light text-primary text-12 rounded-pill animate-scale-in">
                {f.label}
                <button onClick={f.clear}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="md:flex md:gap-6">
          <aside className="hidden md:block w-[280px] flex-shrink-0">
            <div className="bg-surface rounded-card border border-border p-4 sticky top-20">
              <FilterPanel />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-14 text-muted-foreground">
                <span className="font-semibold text-foreground">{allListings.length}</span> annonces
                {searchQuery && <> pour « <span className="font-medium text-foreground">{searchQuery}</span> »</>}
                {selectedCatName && <> en <span className="font-medium text-foreground">{selectedCatName}</span></>}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="md:hidden gap-1.5" onClick={() => setMobileFiltersOpen(true)}>
                  <SlidersHorizontal className="w-4 h-4" /> Filtres
                </Button>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 px-3 rounded-input border border-input bg-surface text-14 text-foreground">
                  {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <div className="flex border border-border rounded-input overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground'}`}>
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading && page === 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
                {Array(6).fill(0).map((_, i) => <ListingCardSkeleton key={i} variant={viewMode} />)}
              </div>
            ) : allListings.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
                  {allListings.map((listing) => <ListingCard key={listing.id} listing={listing} variant={viewMode} />)}
                </div>
                {/* Sentinel for infinite scroll */}
                {hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-8">
                    {isFetching && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                  </div>
                )}
                {!hasMore && allListings.length > PAGE_SIZE && (
                  <p className="text-center text-14 text-muted-foreground py-8">Toutes les annonces ont été chargées</p>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-18 font-heading font-semibold text-foreground mb-2">Aucune annonce trouvée</h3>
                <p className="text-14 text-muted-foreground mb-6">Essayez avec des mots différents ou modifiez les filtres</p>
                <Button variant="outline" onClick={clearFilters}>Modifier les filtres</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-modal max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-surface px-4 py-3 border-b border-border flex items-center justify-between z-10">
              <h3 className="text-16 font-heading font-semibold text-foreground">Filtres</h3>
              <button onClick={() => setMobileFiltersOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-4"><FilterPanel /></div>
            <div className="sticky bottom-0 bg-surface border-t border-border p-4">
              <Button variant="default" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Voir les résultats
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default SearchResults;
