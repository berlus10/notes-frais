# Notes de frais - Fédération Française de Spéléologie (FFS)

Application web de gestion des notes de frais développée pour la Fédération Française de Spéléologie. Le projet couvre l'ensemble du cycle : soumission d'une note de frais par un adhérent, validation par un administrateur, et génération du justificatif.

**Démo en ligne :** https://notes-frais-ffs.vercel.app

## Fonctionnalités

- Authentification par email/mot de passe avec sessions JWT (cookies httpOnly)
- Inscription, connexion, réinitialisation de mot de passe
- Création et suivi des notes de frais avec pièces justificatives
- Espace administrateur : validation ou rejet des notes de frais
- Génération de PDF pour chaque note de frais validée
- Notifications par email (confirmation, réinitialisation de mot de passe)
- Interface aux couleurs officielles de la FFS

## Stack technique

- **Framework** : Next.js (App Router), TypeScript
- **Base de données** : PostgreSQL (Neon), Prisma ORM
- **Authentification** : JWT, cookies httpOnly
- **Validation** : Zod
- **Stockage de fichiers** : Cloudflare R2
- **Emails transactionnels** : Resend
- **Génération de PDF** : react-pdf
- **Déploiement** : Vercel

## Installation locale

```bash
git clone https://github.com/berlus10/notes-frais.git
cd notes-frais
npm install
```

Créer un fichier `.env.local` à la racine avec les variables suivantes :

```
DATABASE_URL=
JWT_SECRET=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
RESEND_API_KEY=
```

Puis initialiser la base de données et lancer le serveur de développement :

```bash
npx prisma migrate dev
npm run dev
```

L'application est accessible sur http://localhost:3000

## Structure du projet

```
notes-frais/
├── app/
│   ├── admin/          # Espace administrateur
│   ├── api/            # Routes API (auth, notes de frais, PDF, upload)
│   ├── components/     # Composants UI partagés
│   ├── dashboard/      # Espace adhérent
│   └── ...             # Pages publiques (login, register, accueil...)
├── lib/                # Fonctions utilitaires (auth, email, prisma, stockage)
├── prisma/             # Schéma de base de données
└── types/              # Types TypeScript partagés
```

## Auteur

Berlus Djongon
