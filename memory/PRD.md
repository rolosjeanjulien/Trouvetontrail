# Trouve Ton Dossard - Product Requirements Document

## Original Problem Statement
Application web "Trouve Ton Dossard" pour lister toutes les courses de trail en France avec une vue liste et carte, gestion des favoris, modération communautaire, et notifications.

## User Personas
- **Coureurs Trail**: Recherchent des courses par distance, dénivelé, région
- **Administrateurs**: Modèrent les soumissions et gèrent les données
- **Visiteurs**: Consultent les courses sans compte

## Core Requirements
1. ✅ Affichage liste et carte des courses (Leaflet)
2. ✅ Données: nom, description, lieu, dates, distance, dénivelé, UTMB
3. ✅ Authentification JWT (inscription, connexion)
4. ✅ Favoris avec notifications d'ouverture inscriptions
5. ✅ Import Excel/CSV pour ajout massif
6. ✅ Signalement inscriptions closes (3 signalements = auto-close)
7. ✅ Panel admin modération
8. ⏳ Notifications email (code prêt, SendGrid non configuré)
9. ✅ Pages légales (Mentions, CGU, Confidentialité)
10. ✅ Bannière cookies RGPD
11. ✅ Placeholders AdSense

## Tech Stack
- **Frontend**: React, Tailwind CSS, shadcn/ui, Leaflet
- **Backend**: FastAPI, MongoDB (motor)
- **Auth**: JWT
- **Email**: SendGrid (MOCKED - clé API requise)

## What's Implemented (Feb 2026)

### Core Features ✅
- Liste courses avec filtres (région, distance, UTMB)
- Vue carte interactive (Leaflet)
- Page détail course
- Authentification complète (register/login/forgot password)
- Dashboard favoris utilisateur
- Panel admin modération + import Excel
- Recherche homepage (distance, dénivelé, région)

### Report Feature (Feb 10, 2026) ✅
- Bouton "Signaler inscriptions closes" sur page détail
- Validation automatique après 3 signalements
- Panel admin avec onglet signalements
- Actions admin: valider/rejeter signalements
- Badge "Fermé par la communauté" si auto-closé

### Legal & Compliance ✅
- Mentions légales, CGU, Politique confidentialité
- Bannière cookies RGPD
- Footer global

## Configuration Required (P1)

### SendGrid Email
```env
# /app/backend/.env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDER_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Google AdSense
Remplacer les placeholders dans `/app/frontend/src/components/ads/AdBanner.jsx`:
- `data-ad-client="ca-pub-XXXXXXX"`
- `data-ad-slot="XXXXXXX"`

## Backlog

### P0 - Décisions Utilisateur
- [ ] Upload images courses (méthode à définir)
- [ ] Clarification "base WASM" (actuellement MongoDB)

### P1 - Configuration
- [ ] Configurer SendGrid API key
- [ ] Configurer AdSense IDs

### P2 - Améliorations
- [ ] Vue calendrier dates inscriptions
- [ ] Statistiques admin (nombre signalements, courses populaires)

## Test Credentials
- **Admin**: admin@trailfrance.com / admin123

## API Endpoints
- `/api/auth/{login, register, forgot-password, reset-password}`
- `/api/races/{, /:id, /:id/report-closed}`
- `/api/favorites/{, /:race_id}`
- `/api/admin/{pending, moderate/:id, import, reports, reports/:id/validate, reports/:id/reject}`
- `/api/filters/{regions, departments}`
- `/api/seed`
