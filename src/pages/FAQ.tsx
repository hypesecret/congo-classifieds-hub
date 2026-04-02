import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, ShieldCheck, Mail, Zap, Camera, CreditCard, MessageSquare, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FAQ_DATA = [
  {
    category: 'Annonces',
    icon: Camera,
    items: [
      {
        q: "Comment puis-je publier une annonce ?",
        a: "Pour publier une annonce, cliquez sur le bouton 'Déposer une annonce' en haut à droite. Vous devrez vous connecter, choisir une catégorie, ajouter une description, le prix et au moins une photo."
      },
      {
        q: "Combien de temps mon annonce reste-t-elle en ligne ?",
        a: "Une annonce standard reste en ligne pendant 60 jours. Vous pouvez la renouveler gratuitement une fois ce délai expiré."
      },
      {
        q: "Pourquoi mon annonce est-elle en attente de modération ?",
        a: "Afin de garantir la sécurité des utilisateurs, toutes les annonces sont vérifiées par notre équipe avant d'être visibles. Ce processus prend généralement moins de 12 heures."
      }
    ]
  },
  {
    category: 'Sécurité',
    icon: ShieldCheck,
    items: [
      {
        q: "Comment éviter les arnaques ?",
        a: "Ne payez jamais à l'avance sans avoir vu l'article. Privilégiez les remises en main propre dans des lieux publics. Méfiez-vous des prix trop bas et des vendeurs refusant les appels téléphoniques."
      },
      {
        q: "Qu'est-ce que la vérification KYC ?",
        a: "Le KYC (Know Your Customer) permet de certifier l’identité d’un vendeur. Un badge de vérification s'affiche sur son profil, ce qui augmente la confiance des acheteurs."
      }
    ]
  },
  {
    category: 'Paiements',
    icon: CreditCard,
    items: [
      {
        q: "Les annonces sont-elles gratuites ?",
        a: "Oui, la publication d'annonces standard est totalement gratuite sur Expat-Congo. Nous proposons des options payantes (Boosts) pour améliorer la visibilité."
      },
      {
        q: "Quels sont les moyens de paiement acceptés ?",
        a: "Nous acceptons les paiements via Mobile Money (MTN et Airtel) ainsi que par carte bancaire pour l'achat de services premium."
      }
    ]
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-32 md:text-40 font-bold text-foreground font-heading mb-4">Foire Aux Questions</h1>
            <p className="text-16 text-text-secondary">
              Trouvez rapidement des réponses à vos questions sur l'utilisation de la plateforme.
            </p>
          </div>

          <div className="space-y-10">
            {FAQ_DATA.map((section, idx) => (
              <section key={idx}>
                <h2 className="flex items-center gap-3 text-18 font-bold text-foreground mb-4 border-b border-border pb-2 capitalize">
                  <section.icon className="w-5 h-5 text-primary" /> {section.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} value={`${idx}-${i}`} className="border-border/60">
                      <AccordionTrigger className="text-15 text-left font-semibold hover:text-primary transition-colors">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-14 text-text-secondary leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>

          {/* Need more help? */}
          <div className="mt-16 bg-surface-hover rounded-card p-8 border border-border text-center">
            <h3 className="text-18 font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
            <p className="text-14 text-text-secondary mb-6 text-2xl font-light">
              Notre service client est disponible pour vous accompagner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="gap-2">
                  <Mail className="w-4 h-4" /> Nous écrire
                </Button>
              </Link>
              <Button variant="outline" className="gap-2" onClick={() => window.open('https://wa.me/242060000000')}>
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
