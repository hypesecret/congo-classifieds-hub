import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, Plus } from 'lucide-react';
import { CITIES, CATEGORIES, formatPrice } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const CATEGORY_EMOJI: Record<string, string> = {
  immobilier: '🏠',
  vehicules: '🚗',
  emploi: '💼',
  services: '🛠️',
  electronique: '📱',
  'mode-beaute': '👗',
  'maison-jardin': '🛋️',
  loisirs: '🏀',
  agriculture: '🌾',
  animaux: '🐾',
  'materiaux-btp': '🧱',
  autres: '➕',
};

const useHeroData = () => {
  return useQuery({
    queryKey: ['hero-data'],
    queryFn: async () => {
      const [countRes, sellersRes, featuredRes, todayRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('user_id').eq('status', 'active'),
        supabase.from('listings').select('id, title, price, city, images, category_id, categories(name)').eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', new Date(Date.now() - 86400000).toISOString()),
      ]);
      return {
        listingsCount: countRes.count || 0,
        uniqueSellers: new Set((sellersRes.data || []).map((l: any) => l.user_id)).size,
        featured: featuredRes.data as any,
        todayCount: todayRes.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Tout le Congo');
  const { data } = useHeroData();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city && city !== 'Tout le Congo') params.set('ville', city);
    navigate(`/annonces?${params.toString()}`);
  };

  const featured = data?.featured;
  const featuredImage = featured?.images?.[0];

  return (
    <section className="container mx-auto py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Main hero / search */}
        <div className="md:col-span-8 bg-gradient-to-br from-primary to-primary-dark rounded-card p-6 md:p-10 lg:p-12 relative overflow-hidden flex flex-col justify-center min-h-[320px] md:min-h-[400px]">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <h1 className="font-heading font-bold text-28 md:text-40 lg:text-48 text-primary-foreground mb-6 md:mb-8 leading-[1.1]">
              Trouvez tout le Congo<br className="hidden sm:block" /> au meilleur prix.
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="sm:w-[38%] relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-14 pl-9 pr-8 rounded-input bg-surface text-14 font-semibold border-none appearance-none outline-none text-foreground">
                  <option>Tout le Congo</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="sm:flex-1 flex gap-2 bg-surface p-1 rounded-input shadow-elevated">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Véhicules, Immobilier, iPhone…"
                  className="flex-grow h-12 px-4 bg-transparent outline-none text-14 text-foreground placeholder:text-muted-foreground"
                />
                <button onClick={handleSearch} className="bg-accent text-accent-foreground hover:brightness-95 transition px-5 rounded-input font-bold text-14 flex items-center gap-2">
                  <Search className="w-4 h-4" /> <span className="hidden sm:inline">Rechercher</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured card */}
        <Link to={featured ? `/annonce/${featured.id}` : '/annonces'} className="md:col-span-4 bg-surface border border-border rounded-card overflow-hidden flex flex-col group hover:shadow-elevated transition-shadow">
          <div className="h-44 md:h-48 bg-background relative overflow-hidden">
            {featuredImage ? (
              <img src={featuredImage} alt={featured?.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-light to-surface flex items-center justify-center text-primary text-48">🏷️</div>
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-2">
              <span className="text-primary font-bold text-18">{featured ? formatPrice(featured.price) : '—'}</span>
              {featured?.categories?.name && (
                <span className="bg-background text-muted-foreground text-11 font-bold px-2 py-1 rounded uppercase tracking-wide">{featured.categories.name}</span>
              )}
            </div>
            <h3 className="font-heading font-bold text-16 leading-tight mb-2 text-foreground line-clamp-2">
              {featured?.title || 'Découvrez nos meilleures annonces'}
            </h3>
            <p className="text-muted-foreground text-12 flex items-center gap-1 mb-4">
              <MapPin className="w-3 h-3" /> {featured?.city || 'Congo-Brazzaville'}
            </p>
            <span className="mt-auto w-full py-2.5 bg-foreground text-background rounded-input font-bold text-13 text-center group-hover:bg-primary-dark transition-colors">
              Voir l'offre
            </span>
          </div>
        </Link>

        {/* Stats chips */}
        <div className="md:col-span-8 grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-surface border border-border p-4 md:p-6 rounded-card flex flex-col justify-center">
            <span className="text-20 md:text-24 font-heading font-bold text-primary">{(data?.listingsCount ?? 0).toLocaleString('fr-FR')}</span>
            <span className="text-10 text-muted-foreground font-bold uppercase tracking-wider mt-1">Annonces actives</span>
          </div>
          <div className="bg-surface border border-border p-4 md:p-6 rounded-card flex flex-col justify-center">
            <span className="text-20 md:text-24 font-heading font-bold text-primary">{(data?.uniqueSellers ?? 0).toLocaleString('fr-FR')}</span>
            <span className="text-10 text-muted-foreground font-bold uppercase tracking-wider mt-1">Vendeurs</span>
          </div>
          <div className="bg-accent p-4 md:p-6 rounded-card flex flex-col justify-center border border-accent">
            <span className="text-20 md:text-24 font-heading font-bold text-foreground">+{(data?.todayCount ?? 0).toLocaleString('fr-FR')}</span>
            <span className="text-10 text-foreground/70 font-bold uppercase tracking-wider mt-1">Aujourd'hui</span>
          </div>
        </div>

        {/* Publish CTA chip (mobile-friendly under featured) */}
        <Link to="/deposer" className="md:col-span-4 hidden md:flex bg-foreground text-background rounded-card p-5 items-center justify-between hover:bg-primary-dark transition-colors group">
          <div>
            <p className="text-11 font-bold uppercase tracking-wider opacity-70">Vous vendez ?</p>
            <p className="font-heading font-bold text-16 mt-1">Déposez gratuitement</p>
          </div>
          <span className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </span>
        </Link>

        {/* Categories grid */}
        <div className="md:col-span-12 mt-2">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/annonces?categorie=${cat.slug}`}
                className="bg-surface border border-border p-3 md:p-4 rounded-card flex flex-col items-center gap-1.5 hover:border-primary hover:-translate-y-0.5 transition-all"
              >
                <span className="text-20 md:text-22">{CATEGORY_EMOJI[cat.slug] || '📦'}</span>
                <span className="text-10 md:text-11 font-bold text-center text-foreground leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
