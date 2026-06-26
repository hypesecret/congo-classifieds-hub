import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Plus, ArrowRight, ImageIcon } from 'lucide-react';
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
        supabase
          .from('listings')
          .select('id, title, price, city, images, category_id, categories(name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
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

const formatCompact = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k';
  return n.toString();
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Brazzaville');
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
    <section className="container mx-auto px-4 py-6 md:py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 md:gap-5">

        {/* Main Search Bento Tile */}
        <div className="bg-primary rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-primary-foreground shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
          />
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-heading font-bold text-28 sm:text-36 md:text-48 leading-[1.05] mb-5 md:mb-7">
              Trouvez tout au <span className="text-accent">Congo</span>
            </h1>
            <div className="flex flex-col gap-3">
              <div className="bg-surface rounded-2xl flex items-center px-4 py-3 shadow-elevated">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Que cherchez-vous ?"
                  className="ml-3 w-full bg-transparent outline-none text-14 md:text-16 text-foreground placeholder:text-muted-foreground font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/25 rounded-2xl px-4 py-3 flex items-center">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="ml-2 w-full bg-transparent outline-none text-13 md:text-14 font-semibold text-primary-foreground appearance-none cursor-pointer"
                  >
                    <option className="text-foreground">Tout le Congo</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="text-foreground">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-accent hover:brightness-95 text-accent-foreground font-bold rounded-2xl py-3 transition-all active:scale-95 shadow-elevated text-14 md:text-15"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & CTA Row */}
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <div className="bg-surface border-2 border-primary/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col justify-center">
            <p className="text-11 md:text-12 font-bold text-primary uppercase tracking-wider mb-1">Live</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-22 md:text-28 font-heading font-extrabold text-foreground">
                {formatCompact(data?.listingsCount ?? 0)}
              </span>
              <span className="text-10 md:text-11 font-bold text-primary bg-primary-light px-1.5 py-0.5 rounded-full whitespace-nowrap">
                +{data?.todayCount ?? 0} aujourd'hui
              </span>
            </div>
            <p className="text-10 md:text-11 text-muted-foreground font-medium mt-1">Annonces actives</p>
          </div>
          <Link
            to="/deposer"
            className="bg-foreground rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col items-center justify-center text-center group hover:bg-primary-dark transition-colors"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-accent rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
              <Plus className="w-5 h-5 text-accent-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-background font-heading text-13 md:text-15 font-bold leading-tight">
              Déposer une annonce
            </span>
          </Link>
        </div>

        {/* Featured Ad Bento Tile */}
        <Link
          to={featured ? `/annonce/${featured.id}` : '/annonces'}
          className="bg-surface rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-border relative overflow-hidden group hover:shadow-elevated transition-shadow block"
        >
          <div className="flex justify-between items-start mb-4 gap-2">
            <span className="bg-accent text-accent-foreground text-10 font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Vedette
            </span>
            {featured?.categories?.name && (
              <span className="text-11 md:text-12 font-semibold text-primary truncate">
                {featured.categories.name}
              </span>
            )}
          </div>
          <div className="h-36 md:h-44 bg-background rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
            {featuredImage ? (
              <img
                src={featuredImage}
                alt={featured?.title || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex justify-between items-end gap-3">
            <div className="min-w-0">
              <p className="text-11 text-muted-foreground">
                {featured ? featured.title : 'Découvrez nos meilleures annonces'}
              </p>
              <p className="text-18 md:text-22 font-heading font-extrabold text-foreground truncate">
                {featured ? formatPrice(featured.price) : '—'}
              </p>
              {featured?.city && (
                <p className="text-11 text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {featured.city}
                </p>
              )}
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 text-12 font-bold text-primary group-hover:gap-2 transition-all">
              Voir <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Categories Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/annonces?categorie=${cat.slug}`}
              className="bg-surface p-2.5 md:p-3 rounded-2xl border border-border flex flex-col items-center gap-1.5 hover:border-accent hover:-translate-y-0.5 transition-all"
            >
              <span className="text-22 md:text-24" aria-hidden>
                {CATEGORY_EMOJI[cat.slug] || '📦'}
              </span>
              <span className="text-10 md:text-11 font-bold text-center text-foreground leading-tight line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
          <Link
            to="/annonces"
            className="bg-accent p-2.5 md:p-3 rounded-2xl flex flex-col items-center justify-center gap-1 group col-span-4 sm:col-span-6 lg:col-span-12 lg:hidden"
          >
            <span className="text-11 font-black text-accent-foreground uppercase inline-flex items-center gap-1">
              Toutes les annonces <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
