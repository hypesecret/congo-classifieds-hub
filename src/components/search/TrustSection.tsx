import { Shield, Lock, Phone } from 'lucide-react';

const items = [
  {
    icon: Shield,
    title: 'Annonces vérifiées',
    description: 'Chaque annonce est modérée pour garantir la qualité et la fiabilité des offres.',
  },
  {
    icon: Lock,
    title: 'Paiement sécurisé',
    description: 'Payez en toute sécurité via MTN Mobile Money ou Airtel Money.',
  },
  {
    icon: Phone,
    title: 'Support local',
    description: 'Une équipe basée à Brazzaville et Pointe-Noire, disponible pour vous aider.',
  },
];

const TrustSection = () => (
  <section className="py-10 md:py-16 bg-primary-light">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map(({ icon: Icon, title, description }) => (
          <div key={title} className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-18 text-text-primary">{title}</h3>
            <p className="text-14 text-text-secondary max-w-xs mx-auto">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
