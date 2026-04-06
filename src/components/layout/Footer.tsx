import { Facebook, MessageCircle, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

const footerLinks = {
  categories: [
    { label: 'Immobilier', href: '/annonces?cat=immobilier' },
    { label: 'Véhicules', href: '/annonces?cat=vehicules' },
    { label: 'Emploi', href: '/annonces?cat=emploi' },
    { label: 'Électronique', href: '/annonces?cat=electronique' },
    { label: 'Services', href: '/annonces?cat=services' },
    { label: 'Mode & Beauté', href: '/annonces?cat=mode' },
  ],
  useful: [
    { label: 'Conditions Générales', href: '/cgu' },
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'Nous contacter', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
};

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground hidden md:block">
    <div className="container mx-auto py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Link to="/"><Logo size="md" variant="light" /></Link>
          <p className="text-14 text-muted-foreground leading-relaxed">
            La référence des petites annonces au Congo-Brazzaville. Achetez, vendez et trouvez tout ce dont vous avez besoin.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="https://wa.me/242060000000" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"><MessageCircle className="w-4 h-4" /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-16 mb-4">Catégories</h4>
          <ul className="space-y-2.5">
            {footerLinks.categories.map(link => (
              <li key={link.label}><Link to={link.href} className="text-14 text-muted-foreground hover:text-primary-foreground transition-colors">{link.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-16 mb-4">Liens utiles</h4>
          <ul className="space-y-2.5">
            {footerLinks.useful.map(link => (
              <li key={link.label}><Link to={link.href} className="text-14 text-muted-foreground hover:text-primary-foreground transition-colors">{link.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-16 mb-4">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-14 text-muted-foreground"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>+242 06 900 00 00</span></li>
            <li className="flex items-start gap-2 text-14 text-muted-foreground"><Mail className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>contact@expat-congo.com</span></li>
            <li className="flex items-start gap-2 text-14 text-muted-foreground"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>Brazzaville, République du Congo</span></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center text-12 text-muted-foreground">
        © {new Date().getFullYear()} Expat-Congo. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export default Footer;
