import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CITIES } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const useHeroStats = () => {
  return useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const [listingsRes, sellersRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('user_id').eq('status', 'active'),
      ]);
      const listingsCount = listingsRes.count || 0;
      const uniqueSellers = new Set((sellersRes.data || []).map((l: any) => l.user_id)).size;
      return { listingsCount, uniqueSellers };
    },
    staleTime: 5 * 60 * 1000,
  });
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Brazzaville');
  const { data: stats } = useHeroStats();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city && city !== 'Toutes les villes') params.set('ville', city);
    navigate(`/annonces?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary to-primary-dark py-12 md:py-20 overflow-hidden">
      {/* Subtle dot texture */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="container mx-auto text-center space-y-6 relative z-10">
        <h1 className="font-heading font-bold text-28 md:text-40 lg:text-48 text-primary-foreground leading-tight max-w-3xl mx-auto">
          Achetez et vendez au Congo
        </h1>
        <p className="text-16 md:text-18 text-primary-foreground/80 max-w-xl mx-auto">
          Des milliers d'annonces à Brazzaville, Pointe-Noire et partout au Congo
        </p>

        {/* Searchbar */}
        <div className="max-w-2xl mx-auto bg-surface rounded-card shadow-elevated p-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Que recherchez-vous ?"
            className="flex-1 h-12 px-4 text-14 bg-background rounded-input border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 px-3 text-14 bg-background rounded-input border border-border text-foreground outline-none"
          >
            <option value="Toutes les villes">Toutes les villes</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button variant="default" size="lg" className="h-12 px-6 gap-2" onClick={handleSearch}>
            <Search className="w-4 h-4" /> Rechercher
          </Button>
        </div>

        {/* Dynamic stats */}
        {stats && (stats.listingsCount > 0 || stats.uniqueSellers > 0) && (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-4">
            {stats.listingsCount > 0 && (
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-14 font-medium">{stats.listingsCount.toLocaleString('fr-FR')} annonces actives</span>
              </div>
            )}
            {stats.uniqueSellers > 0 && (
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-14 font-medium">{stats.uniqueSellers.toLocaleString('fr-FR')} vendeurs</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
