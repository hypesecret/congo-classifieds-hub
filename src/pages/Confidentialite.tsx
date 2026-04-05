import PageWrapper from '@/components/layout/PageWrapper';

const Confidentialite = () => (
  <PageWrapper>
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-32 font-heading font-bold text-foreground mb-2">Politique de Confidentialité</h1>
      <p className="text-14 text-text-muted mb-8">Dernière mise à jour : 1er avril 2026</p>

      <div className="prose prose-sm max-w-none text-text-secondary space-y-6">
        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">1. Données collectées</h2>
          <p>Nous collectons les données nécessaires au fonctionnement du service : nom, adresse email, numéro de téléphone, ville, et le contenu de vos annonces. Pour la vérification KYC, nous collectons une copie de votre pièce d'identité et un selfie.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">2. Utilisation des données</h2>
          <p>Vos données sont utilisées pour : la gestion de votre compte, la publication d'annonces, la messagerie entre utilisateurs, la vérification d'identité, l'amélioration du service et la prévention des fraudes.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">3. Partage des données</h2>
          <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec : nos prestataires techniques (hébergement, paiement), les autorités compétentes sur demande légale, et les autres utilisateurs dans le cadre des annonces (ville, nom affiché).</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">4. Cookies</h2>
          <p>Nous utilisons des cookies essentiels pour le fonctionnement du site (session, préférences). Aucun cookie publicitaire n'est utilisé sans votre consentement explicite.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">5. Vos droits</h2>
          <p>Conformément à la réglementation applicable, vous disposez d'un droit d'accès, de modification, de suppression et de portabilité de vos données. Vous pouvez exercer ces droits depuis votre profil ou en nous contactant à privacy@expat-congo.com.</p>
        </section>

        <section>
          <h2 className="text-18 font-heading font-semibold text-foreground">6. Contact</h2>
          <p>Pour toute question relative à la protection de vos données, contactez notre délégué à la protection des données à l'adresse : privacy@expat-congo.com ou par courrier à Expat-Congo, Brazzaville, République du Congo.</p>
        </section>
      </div>
    </div>
  </PageWrapper>
);

export default Confidentialite;
