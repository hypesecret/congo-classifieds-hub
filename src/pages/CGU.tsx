import PageWrapper from '@/components/layout/PageWrapper';

const CGU = () => (
  <PageWrapper>
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-32 font-heading font-bold text-foreground mb-2">Conditions Générales d'Utilisation</h1>
      <p className="text-14 text-text-muted mb-8">Dernière mise à jour : 1er avril 2026</p>

      <div className="prose prose-sm max-w-none text-text-secondary space-y-6">
        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">1. Objet</h2>
          <p>Les présentes CGU régissent l'utilisation de la plateforme Expat-Congo, service de petites annonces en ligne accessible depuis le Congo-Brazzaville et l'international. En utilisant le service, vous acceptez sans réserve les présentes conditions.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">2. Inscription</h2>
          <p>L'inscription est gratuite et ouverte à toute personne physique majeure ou personne morale. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion. Toute activité réalisée sous son compte est de sa responsabilité.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">3. Publication d'annonces</h2>
          <p>Les annonces doivent respecter la législation congolaise et les règles de la plateforme. Sont interdites : les annonces de produits illicites, contrefaits, dangereux, les contenus discriminatoires, les arnaques ou toute offre trompeuse. Expat-Congo se réserve le droit de supprimer toute annonce sans préavis.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">4. Paiements et services premium</h2>
          <p>La publication d'annonces standard est gratuite. Des services payants (boost, sponsoring) sont proposés. Les paiements s'effectuent via MTN Mobile Money, Airtel Money ou carte bancaire. Tout paiement validé est définitif et non remboursable, sauf disposition contraire prévue par la loi OHADA.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">5. Responsabilité</h2>
          <p>Expat-Congo agit en tant qu'intermédiaire et ne peut être tenu responsable des transactions entre utilisateurs. La plateforme ne garantit ni la qualité, ni la disponibilité des biens et services annoncés. L'utilisateur assume l'entière responsabilité de ses transactions.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">6. Propriété intellectuelle</h2>
          <p>Le contenu de la plateforme (design, logo, textes) est la propriété d'Expat-Congo. Les utilisateurs conservent la propriété de leurs annonces mais accordent une licence d'utilisation non exclusive pour leur affichage sur la plateforme.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">7. Résiliation</h2>
          <p>L'utilisateur peut supprimer son compte à tout moment. Expat-Congo peut suspendre ou supprimer un compte en cas de violation des CGU, sans préavis ni indemnité.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">8. Droit applicable</h2>
          <p>Les présentes CGU sont régies par le droit de la République du Congo et les Actes Uniformes OHADA. Tout litige sera soumis aux tribunaux compétents de Brazzaville.</p>
        </section>
      </div>
    </div>
  </PageWrapper>
);

export default CGU;
