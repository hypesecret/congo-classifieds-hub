

# Analyse complete Expat-Congo vs Expat-Dakar : Etat actuel

## 2 bloqueurs critiques empechent TOUT de fonctionner

### Bloqueur 1 : Pas de Foreign Key `listings.user_id` → `profiles.user_id`

Chaque requete listings (homepage, recherche, detail, admin moderation, admin payments) utilise `profiles!listings_user_id_fkey(...)`. PostgREST retourne **erreur 400** car cette FK n'existe pas. Resultat : **zero annonce affichee** sur toute la plateforme.

### Bloqueur 2 : Tables `conversations` et `contact_messages` absentes du fichier types.ts

Le fichier auto-genere `types.ts` ne contient pas ces tables. TypeScript refuse de compiler `useMessages.ts`, `Messages.tsx` et `Contact.tsx`. Le build est **casse**.

---

## Inventaire ecran par ecran

### FONCTIONNE (donnees reelles Supabase)
| Ecran | Statut |
|---|---|
| CategoryGrid (homepage) | Categories reelles, 12 categories OK |
| Auth modals (Register/Login) | Supabase Auth fonctionne |
| KYC soumission modal | Insert dans kyc_verifications OK |
| Admin KYC review | Hook `useAdminKYC` branche sur Supabase |
| Admin Users | Hook `useAdminUsers` branche sur Supabase |
| Admin Reports | Hook `useAdminReports` branche sur Supabase |
| Admin Payments | Hook `useAdminPayments` branche sur Supabase |
| FAQ page | Contenu statique OK |
| Contact page | UI OK mais build casse (types.ts) |
| CGU / Confidentialite | Pages statiques OK |

### CASSE (erreur 400 DB — FK manquante)
| Ecran | Probleme |
|---|---|
| Homepage sponsored | `useListings` → erreur 400 FK |
| Homepage recentes | `useListings` → erreur 400 FK |
| SearchResults | `useListings` → erreur 400 FK |
| ListingDetail | `useListing` → erreur 400 FK |
| Admin Moderation | `useListings({status:'pending_moderation'})` → erreur 400 FK |
| Admin Payments boosts | Join `profiles:user_id` → erreur 400 FK |
| CreateListing | Insert OK mais impossible de voir le resultat |

### CASSE (build errors TypeScript)
| Fichier | Probleme |
|---|---|
| `useMessages.ts` | `conversations` n'existe pas dans types.ts |
| `Messages.tsx` | Proprietes `listing_id`, `otherUser.id`, `avatar_url`, `last_message_at`, `last_message`, `cover_image`, `title`, `price` non reconnues + `Link` non importe |
| `Contact.tsx` | `contact_messages` n'existe pas dans types.ts |

### MANQUANT (pages/features absentes)
| Feature | Detail |
|---|---|
| Page Profil (`/profil`) | Fichier `Profile.tsx` n'existe pas — pas de "Mes annonces", pas d'edition profil, pas de favoris |
| Hook `useFavorites` | Fichier n'existe pas — boutons favori non branches |
| Recherche mobile Header | `onKeyDown` pas branche |
| Bouton "Appeler" (ListingDetail) | Pas de `<a href="tel:...">` |
| Bouton "Envoyer message" (ListingDetail) | Pas de navigation vers `/messages` |
| Notifications | Pas de table, pas de badge reel, "3" hardcode |
| Partage WhatsApp | Pas d'implementation Web Share API |
| Mot de passe oublie | Pas de page `/reset-password` |
| Admin Categories | Page vide, redirige vers dashboard |
| Admin Settings | UI seule, pas de persistence |

---

## Plan de correction — 5 blocs

### Bloc 1 : Migration SQL (debloque 80% de la plateforme)

Une seule migration SQL :
- `ALTER TABLE listings ADD CONSTRAINT listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(user_id)`
- `ALTER TABLE conversations ADD CONSTRAINT conversations_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id)`
- `ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id)`
- `ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(user_id)`
- `ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(user_id)`
- `ALTER TABLE favorites ADD CONSTRAINT favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id)`
- `ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(user_id)`
- `ALTER TABLE reports ADD CONSTRAINT reports_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id)`
- `ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES profiles(user_id)`
- `ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(user_id)`
- `ALTER TABLE transactions ADD CONSTRAINT transactions_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id)`

Ceci regenere `types.ts` automatiquement avec toutes les relations + tables `conversations` et `contact_messages`.

### Bloc 2 : Fix build errors (Messages + Contact)

- **useMessages.ts** : Caster les requetes `conversations` et l'insert `messages` avec `as any` temporairement (sera resolu quand types.ts est regenere apres migration)
- **Messages.tsx** : Ajouter `import { Link } from 'react-router-dom'`, typer `otherUser` avec fallback complet incluant `id` et `avatar_url`, acceder `listing` comme objet (pas array)
- **Contact.tsx** : Caster l'insert `contact_messages` (sera resolu apres migration)

### Bloc 3 : Pages manquantes

- **Profile.tsx** : Page profil avec onglets "Mes annonces" / "Favoris" / "Parametres", edition profil, gestion annonces (pause/supprimer)
- **useFavorites.ts** : Hook toggle favori + liste favoris utilisateur
- Route `/profil` dans App.tsx

### Bloc 4 : Branchements UI manquants

- **ListingDetail** : Bouton "Appeler" → `<a href="tel:+242...">` avec le phone du profil vendeur, "Envoyer message" → navigation `/messages?listing=X&to=Y`
- **Header** : Recherche mobile `onKeyDown Enter` → navigate, logo `<Link to="/">`
- **ListingCard** : Brancher toggle favori sur `useFavorites`
- **CreateListing** : Utiliser UUID categories au lieu de slugs

### Bloc 5 : Seed data (pour que la plateforme affiche du contenu)

Inserer 15-20 listings de demo avec `status: 'active'`, images Unsplash, lies aux vraies categories UUID. Sans data, meme avec les FK fixes, la homepage sera vide.

---

## Comparaison avec Expat-Dakar

```text
FEATURE                 EXPAT-DAKAR    EXPAT-CONGO    MANQUE
─────────────────────── ────────────── ────────────── ──────────
Homepage + categories   OK             CASSE (FK)     Migration
Recherche + filtres     OK             CASSE (FK)     Migration
Detail annonce          OK             CASSE (FK)     Migration + CTAs
Depot annonce           OK             Partiel        Category UUID fix
Messagerie              OK             CASSE (build)  Fix types + FK
Profil utilisateur      OK             ABSENT         Page entiere
Favoris                 OK             ABSENT         Hook + UI
Auth email/phone        OK             Partiel        OTP pas reel
KYC verification        OK             OK             -
Admin moderation        OK             CASSE (FK)     Migration
Admin KYC               OK             OK             -
Admin users             OK             OK             -
Admin reports           OK             CASSE (FK)     Migration (join)
Admin payments          OK             CASSE (FK)     Migration (join)
Contact                 OK             CASSE (build)  Fix types
FAQ                     OK             OK             -
CGU / Privacy           OK             OK             -
SEO / Open Graph        OK             ABSENT         Phase ulterieure
Paiement mobile         OK             ABSENT         Phase ulterieure
Notifications           OK             ABSENT         Phase ulterieure
```

## Resume

**La plateforme est a 70% en terme d'UI mais 0% fonctionnelle** a cause d'une seule migration SQL manquante. Une fois les FK ajoutees : homepage, recherche, detail, moderation, payments se deverrouilleront instantanement. Restent a creer la page Profil, le hook Favoris, et a brancher les CTAs (Appeler/Message/Favori).

## Fichiers concernes

| Fichier | Action |
|---|---|
| Migration SQL | 11 FK + regeneration types.ts |
| `src/hooks/useMessages.ts` | Fix casts TS |
| `src/pages/Messages.tsx` | Import Link + typage |
| `src/pages/Contact.tsx` | Fix cast TS |
| `src/pages/Profile.tsx` | Creer (nouveau) |
| `src/hooks/useFavorites.ts` | Creer (nouveau) |
| `src/App.tsx` | Route /profil |
| `src/pages/ListingDetail.tsx` | CTAs Appeler/Message |
| `src/components/layout/Header.tsx` | Link + mobile search |
| `src/components/listing/ListingCard.tsx` | Toggle favori |
| Insert SQL | 15-20 listings seed |

