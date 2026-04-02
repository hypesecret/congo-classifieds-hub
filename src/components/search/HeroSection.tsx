import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Gift } from 'lucide-react';

const stats = [
  { icon: TrendingUp, label: '12 450 annonces actives' },
  { icon: Users, label: '8 200 vendeurs vérifiés' },
  { icon: Gift, label: 'Gratuit pour tous' },
];

const HeroSection = () => (
  <section className="bg-gradient-to-b from-background to-surface py-10 md:py-16">
    <div className="container mx-auto text-center space-y-6">
      <h1 className="font-heading font-bold text-28 md:text-40 lg:text-48 text-text-primary leading-tight max-w-3xl mx-auto">
        Achetez, vendez et trouvez{' '}
        <span className="text-primary">tout ce dont vous avez besoin</span> au Congo
      </h1>
      <p className="text-16 md:text-18 text-text-secondary max-w-xl mx-auto">
        Des milliers d'annonces vérifiées à Brazzaville, Pointe-Noire et partout au Congo
      </p>
      <div className="flex justify-center">
        <Link to="/deposer">
          <Button variant="hero" size="lg">
            Déposer une annonce
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-4">
        {stats.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-text-secondary">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-14 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
