import { Facebook, MessageCircle, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  categories: [
    { label: 'Immobilier', href: '#' },
    { label: 'Véhicules', href: '#' },
    { label: 'Emploi', href: '#' },
    { label: 'Électronique', href: '#' },
    { label: 'Services', href: '#' },
    { label: 'Mode & Beauté', href: '#' },
  ],
  useful: [
    { label: 'Conditions Générales', href: '#' },
    { label: 'Politique de Confidentialité', href: '#' },
    { label: 'Nous contacter', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Blog', href: '#' },
  ],
};

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="container mx-auto py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-24 text-primary">Expat-Congo</h3>
          <p className="text-14 text-text-muted leading-relaxed">
            La référence des petites annonces au Congo-Brazzaville. Achetez, vendez et trouvez tout ce dont vous avez besoin.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-heading font-semibold text-16 mb-4">Catégories populaires</h4>
          <ul className="space-y-2.5">
            {footerLinks.categories.map(link => (
              <li key={link.label}>
                <a href={link.href} className="text-14 text-text-muted hover:text-primary-foreground transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Useful links */}
        <div>
          <h4 className="font-heading font-semibold text-16 mb-4">Liens utiles</h4>
          <ul className="space-y-2.5">
            {footerLinks.useful.map(link => (
              <li key={link.label}>
                <a href={link.href} className="text-14 text-text-muted hover:text-primary-foreground transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading font-semibold text-16 mb-4">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-14 text-text-muted">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>+242 06 900 00 00</span>
            </li>
            <li className="flex items-start gap-2 text-14 text-text-muted">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>contact@expat-congo.com</span>
            </li>
            <li className="flex items-start gap-2 text-14 text-text-muted">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Brazzaville, République du Congo</span>
            </li>
            <li className="flex items-start gap-2 text-14 text-text-muted">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Pointe-Noire, République du Congo</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center text-12 text-text-muted">
        © {new Date().getFullYear()} Expat-Congo. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export default Footer;
