import { Shield, Users, Heart, Globe2, Sparkles, CheckCircle2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";

const team = [
  { name: "Aïcha Mbemba", role: "Co-fondatrice & CEO", city: "Brazzaville", initials: "AM" },
  { name: "Jean-Pierre Loubaki", role: "Co-fondateur & CTO", city: "Pointe-Noire", initials: "JL" },
  { name: "Sandrine Okemba", role: "Responsable Confiance & Sécurité", city: "Brazzaville", initials: "SO" },
  { name: "Marc Tchicaya", role: "Lead Produit", city: "Dolisie", initials: "MT" },
];

const values = [
  { icon: Shield, title: "Sécurité", text: "Vérification d'identité (KYC), modération active et masquage des numéros." },
  { icon: Heart, title: "Proximité", text: "Pensé pour le Congo : FCFA, villes locales, support en français." },
  { icon: Globe2, title: "Inclusion", text: "Une plateforme ouverte à tous, expatriés comme Congolais." },
  { icon: Sparkles, title: "Qualité", text: "Annonces de qualité, sans spam, avec photos et descriptions claires." },
];

const milestones = [
  "Lancement bêta à Brazzaville",
  "Couverture nationale (12 villes)",
  "Vérification KYC pour les vendeurs pros",
  "Paiement Mobile Money intégré",
];

export default function About() {
  useSEO({
    title: "À propos — Expat-Congo, la marketplace du Congo-Brazzaville",
    description:
      "Découvrez l'équipe et la mission d'Expat-Congo, la marketplace de petites annonces de référence au Congo-Brazzaville.",
    canonical: "https://expat-congo.lovable.app/a-propos",
  });
  return (
    <PageWrapper>
      <main className="container mx-auto px-4 py-10 max-w-5xl">

          {/* Hero */}
          <section className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Notre histoire
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              La marketplace de confiance du <span className="text-primary">Congo-Brazzaville</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expat-Congo connecte acheteurs, vendeurs et professionnels partout au pays.
              Notre mission : rendre les transactions du quotidien simples, sûres et locales.
            </p>
          </section>

          {/* Values */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {values.map((v) => (
              <Card key={v.title} className="p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.text}</p>
              </Card>
            ))}
          </section>

          {/* Story */}
          <section className="grid md:grid-cols-2 gap-8 mb-16 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">Notre mission</h2>
              <p className="text-muted-foreground mb-3">
                Né à Brazzaville en 2025, Expat-Congo répond à un besoin simple : disposer d'une
                plateforme moderne, fiable et 100 % adaptée au marché congolais.
              </p>
              <p className="text-muted-foreground">
                Nous combinons l'expérience des grandes marketplaces internationales avec
                une compréhension fine du terrain local : Mobile Money, villes secondaires,
                contact direct entre voisins.
              </p>
            </div>
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Nos étapes clés
              </h3>
              <ul className="space-y-3">
                {milestones.map((m, i) => (
                  <li key={m} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Team */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-3">
                <Users className="w-4 h-4" /> L'équipe
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-poppins">Des Congolais au service du Congo</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {team.map((m) => (
                <Card key={m.name} className="p-5 text-center hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
                    {m.initials}
                  </div>
                  <h3 className="font-semibold">{m.name}</h3>
                  <p className="text-sm text-primary">{m.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.city}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-2xl p-10">
            <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-3">Rejoignez la communauté</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Des milliers de Congolais publient et achètent chaque jour sur Expat-Congo.
            </p>
            <a
              href="/deposer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Publier une annonce gratuite
            </a>
          </section>
      </main>
    </PageWrapper>

  );
}
