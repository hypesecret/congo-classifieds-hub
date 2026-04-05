import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal, X, Grid3X3, List, Search as SearchIcon,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ListingCard from '@/components/listing/ListingCard';
import CategoryGrid from '@/components/search/CategoryGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { CITIES } from '@/lib/constants';
import { useListings } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

const DATE_FILTERS = [
  { value: 'all', label: 'Tout' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const catParam = searchParams.get('cat') || '';
  const villeParam = searchParams.get('ville') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam);
  const [selectedCity, setSelectedCity] = useState<string>(villeParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [dateFilter, setDateFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [negotiableOnly, setNegotiableOnly] = useState(false);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('cat', selectedCategory);
    if (selectedCity && selectedCity !== 'Toutes les villes') params.set('ville', selectedCity);
    
    // Only update if params actually changed to avoid infinite loops
    const currentSearchStr = searchParams.toString();
    const newSearchStr = params.toString();
    if (newSearchStr !== currentSearchStr) {
      setSearchParams(params, { replace: true });
    }
  }, [searchQuery, selectedCategory, selectedCity, setSearchParams, searchParams]);

  const { data: listings, isLoading } = useListings({
    query: searchQuery,
    category: selectedCategory,
    city: selectedCity === 'Toutes les villes' ? undefined : selectedCity,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
    sortBy: sortBy as any,
  });

  const { data: categories } = useCategories();

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setPriceRange([0, 50000000]);
    setDateFilter('all');
    setVerifiedOnly(false);
    setNegotiableOnly(false);
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-16 font-heading font-semibold text-foreground">Filtres</h3>
        <button onClick={clearFilters} className="text-12 text-primary hover:underline">Effacer tout</button>
      </div>

      {/* Category */}
      <div>
        <p className="text-14 font-medium text-foreground mb-2">Catégorie</p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {categories?.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.id}
                onChange={() => setSelectedCategory(cat.id)}
                className="w-4 h-4 rounded-full border-border text-primary focus:ring-primary"
              />
              <span className="text-14 text-text-secondary flex-1">{cat.name}</span>
              <span className="text-11 text-text-muted">({cat.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-14 font-medium text-foreground mb-2">Localisation</p>
        <div className="space-y-1">
          {CITIES.map((city) => (
            <label key={city} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="radio"
                name="city"
                checked={selectedCity === city}
                onChange={() => setSelectedCity(city)}
                className="w-4 h-4 rounded-full border-border text-primary focus:ring-primary"
              />
              <span className="text-14 text-text-secondary">{city}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-14 font-medium text-foreground mb-2">Prix</p>
        <div className="flex gap-2 mb-3">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0] || ''}
            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
            className="rounded-input text-12"
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1] === 50000000 ? '' : priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000000])}
            className="rounded-input text-12"
          />
        </div>
        <Slider
          value={[priceRange[0]]}
          max={50000000}
          step={10000}
          onValueChange={([v]) => setPriceRange([v, priceRange[1]])}
        />
      </div>

      {/* Date */}
      <div>
        <p className="text-14 font-medium text-foreground mb-2">Date de publication</p>
        <div className="space-y-1">
          {DATE_FILTERS.map((df) => (
            <label key={df.value} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="radio"
                name="date"
                checked={dateFilter === df.value}
                onChange={() => setDateFilter(df.value)}
                className="w-4 h-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-14 text-text-secondary">{df.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <p className="text-14 font-medium text-foreground mb-2">Options</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-14 text-text-secondary">Vendeurs vérifiés uniquement</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={negotiableOnly} onChange={(e) => setNegotiableOnly(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-14 text-text-secondary">Prix négociable</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <div className="container mx-auto py-4">
        <div className="md:flex md:gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-[280px] flex-shrink-0">
            <div className="bg-surface rounded-card border border-border p-4 sticky top-20">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-14 text-text-secondary">
                <span className="font-semibold text-foreground">{listings?.length || 0}</span> annonces trouvées
                {searchQuery && <> pour « <span className="font-medium text-foreground">{searchQuery}</span> »</>}
              </p>
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden gap-1.5"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filtres
                </Button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3 rounded-input border border-input bg-surface text-14 text-foreground"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* View toggle */}
                <div className="flex border border-border rounded-input overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-secondary hover:bg-background'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-secondary hover:bg-background'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results grid/list */}
            {isLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-surface rounded-card animate-pulse shadow-xs border border-border" />
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} variant={viewMode} />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-background rounded-full flex items-center justify-center">
                  <SearchIcon className="w-10 h-10 text-text-muted" />
                </div>
                <h3 className="text-18 font-heading font-semibold text-foreground mb-2">
                  Aucune annonce trouvée{searchQuery ? ` pour « ${searchQuery} »` : ''}
                </h3>
                <p className="text-14 text-text-muted mb-8">
                  Essayez avec des mots différents ou explorez nos catégories
                </p>
                <CategoryGrid />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-modal max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-surface px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-16 font-heading font-semibold text-foreground">Filtres</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel />
            </div>
            <div className="sticky bottom-0 bg-surface border-t border-border p-4">
              <Button variant="default" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Voir {listings?.length || 0} résultats
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default SearchResults;
