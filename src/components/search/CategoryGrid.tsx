import { Link } from 'react-router-dom';
import {
  Home, Car, Briefcase, Wrench, Smartphone, Shirt,
  Sofa, Music, Leaf, PawPrint, Building, Grid3X3,
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

const iconMap: Record<string, React.ElementType> = {
  Home, Car, Briefcase, Wrench, Smartphone, Shirt,
  Sofa, Music, Leaf, PawPrint, Building, Grid3X3,
};

const CategoryGrid = () => {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        <h2 className="font-heading font-semibold text-20 md:text-24 text-text-primary mb-6">
          Catégories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[72px] md:h-[84px] bg-surface rounded-card animate-pulse border border-border" />
            ))
          ) : (
            categories?.map(cat => {
              const Icon = iconMap[cat.icon] || Grid3X3;
              return (
                <Link
                  key={cat.slug}
                  to={`/annonces?cat=${cat.slug}`}
                  className="flex items-center gap-3 p-3 md:p-4 bg-surface rounded-card border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-category flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-text-primary group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-14 font-medium text-text-primary block truncate">
                      {cat.name}
                    </span>
                    <span className="text-12 text-text-muted">
                      {cat.count.toLocaleString('fr-FR')} annonces
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
