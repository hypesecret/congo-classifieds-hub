import { useState } from 'react';
import { Facebook, MessageCircle, Instagram, Mail, Phone, MapPin, Shield, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { toast } from 'sonner';

const footerLinks = {
  categories: [
    { label: 'Immobilier', href: '/annonces?categorie=immobilier' },
    { label: 'Véhicules', href: '/annonces?categorie=vehicules' },
    { label: 'Emploi', href: '/annonces?categorie=emploi' },
    { label: 'Électronique', href: '/annonces?categorie=electronique' },
    { label: 'Services', href: '/annonces?categorie=services' },
    { label: 'Mode & Beauté', href: '/annonces?categorie=mode-beaute' },
  ],
  cities: [
    { label: 'Brazzaville', href: '/annonces?ville=Brazzaville' },
    { label: 'Pointe-Noire', href: '/annonces?ville=Pointe-Noire' },
    { label: 'Dolisie', href: '/annonces?ville=Dolisie' },
    { label: 'Ouesso', href: '/annonces?ville=Ouesso' },
    { label: 'Nkayi', href: '/annonces?ville=Nkayi' },
  ],
  help: [
    { label: 'À propos', href: '/a-propos' },
    { label: 'Comment ça marche', href: '/faq' },
    { label: 'Sécurité', href: '/confidentialite' },
    { label: 'Nous contacter', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Email invalide');
      return;
    }
    setSubscribed(true);
    toast.success('Merci ! Vous êtes inscrit à la newsletter');
    setEmail('');
  };

  return (
    <footer className="bg-foreground text-background hidden md:block border-t border-border/10">
      <div className="container mx-auto py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-5"><Logo size="md" variant="light" /></Link>
            <p className="max-w-xs text-14 text-background/60 leading-relaxed mb-6">
              La référence de la petite annonce au Congo-Brazzaville. Une plateforme sécurisée pour toutes vos transactions quotidiennes.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-background/5 border border-background/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://wa.me/242060000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-background/5 border border-background/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-background/5 border border-background/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-background font-heading font-bold text-13 uppercase tracking-wider mb-5">Catégories</h4>
            <ul className="space-y-3 text-14">
              {footerLinks.categories.map(link => (
                <li key={link.label}><Link to={link.href} className="text-background/60 hover:text-accent transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-background font-heading font-bold text-13 uppercase tracking-wider mb-5">Villes</h4>
            <ul className="space-y-3 text-14">
              {footerLinks.cities.map(link => (
                <li key={link.label}><Link to={link.href} className="text-background/60 hover:text-accent transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-background font-heading font-bold text-13 uppercase tracking-wider mb-5">Aide</h4>
            <ul className="space-y-3 text-14">
              {footerLinks.help.map(link => (
                <li key={link.label}><Link to={link.href} className="text-background/60 hover:text-accent transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Newsletter + trust */}
          <div className="col-span-2 lg:col-span-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-10 border-t border-background/10">
              <div className="lg:col-span-2">
                <h4 className="text-background font-heading font-bold text-14 mb-2">Recevez les meilleures annonces</h4>
                <p className="text-12 text-background/50 mb-4">Une newsletter par semaine, pas plus. Désinscription en un clic.</p>
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="bg-background/5 border border-background/10 rounded-input px-4 py-2.5 text-14 flex-1 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-background placeholder:text-background/40"
                  />
                  <button type="submit" disabled={subscribed} className="bg-primary hover:bg-primary-dark text-primary-foreground px-5 py-2.5 rounded-input text-14 font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60">
                    {subscribed ? <><Check className="w-4 h-4" /> OK</> : 'S\'inscrire'}
                  </button>
                </form>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-4 bg-background/5 rounded-card border border-background/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3.5 h-3.5 text-success" />
                    <span className="text-11 font-bold text-background uppercase tracking-wider">Plateforme sécurisée</span>
                  </div>
                  <p className="text-11 text-background/50 leading-snug">Vos données sont chiffrées et protégées. Annonces vérifiées.</p>
                </div>
                <div className="flex items-center gap-4 text-12 text-background/50">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +242 06 900 00 00</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> contact@expat-congo.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-11 font-medium text-background/40 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> © {new Date().getFullYear()} EXPAT-CONGO — FAIT À BRAZZAVILLE AVEC PASSION
          </p>
          <div className="flex items-center gap-6 text-11 font-medium text-background/40">
            <span>FRANÇAIS (CG)</span>
            <Link to="/cgu" className="hover:text-background transition-colors">MENTIONS LÉGALES</Link>
            <Link to="/confidentialite" className="hover:text-background transition-colors">CONFIDENTIALITÉ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
