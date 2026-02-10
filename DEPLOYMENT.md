# Guide de Déploiement - Trouve Ton Dossard

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     VERCEL      │────▶│     RENDER      │────▶│  MONGODB ATLAS  │
│   (Frontend)    │     │    (Backend)    │     │   (Database)    │
│   React App     │     │    FastAPI      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Étape 1 : MongoDB Atlas (Base de données)

### 1.1 Créer un compte
1. Allez sur [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Créez un compte gratuit
3. Créez un nouveau cluster (choisissez **FREE - M0**)
4. Région : **Frankfurt** (proche de Render)

### 1.2 Configurer l'accès
1. **Database Access** → Add Database User
   - Username : `trouve_ton_dossard_user`
   - Password : Générez un mot de passe sécurisé (notez-le !)
   - Role : `Read and write to any database`

2. **Network Access** → Add IP Address
   - Cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ Pour la production, restreignez aux IPs de Render

### 1.3 Obtenir la Connection String
1. **Database** → **Connect** → **Connect your application**
2. Copiez l'URL, elle ressemble à :
   ```
   mongodb+srv://trouve_ton_dossard_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Remplacez `<password>` par votre mot de passe

---

## Étape 2 : Render (Backend API)

### 2.1 Créer un compte
1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec GitHub

### 2.2 Déployer le Backend
1. **New** → **Web Service**
2. Connectez votre repo GitHub
3. Configurez :
   - **Name** : `trouve-ton-dossard-api`
   - **Region** : `Frankfurt (EU Central)`
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 2.3 Variables d'environnement (Render)
Dans **Environment** → **Environment Variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `MONGO_URL` | `mongodb+srv://...` (votre URL Atlas) |
| `DB_NAME` | `trouve_ton_dossard` |
| `JWT_SECRET` | (cliquez Generate) |
| `CORS_ORIGINS` | `https://votre-app.vercel.app` |
| `FRONTEND_URL` | `https://votre-app.vercel.app` |
| `SENDGRID_API_KEY` | (optionnel) |
| `SENDER_EMAIL` | (optionnel) |
| `ADMIN_EMAIL` | (optionnel) |

### 2.4 Déployer
1. Cliquez **Create Web Service**
2. Attendez le déploiement (~5 min)
3. Notez l'URL : `https://trouve-ton-dossard-api.onrender.com`

### 2.5 Initialiser la base de données
Une fois déployé, appelez l'endpoint de seed :
```bash
curl -X POST https://trouve-ton-dossard-api.onrender.com/api/seed
```

---

## Étape 3 : Vercel (Frontend)

### 3.1 Créer un compte
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub

### 3.2 Importer le projet
1. **Add New** → **Project**
2. Importez votre repo GitHub
3. Configurez :
   - **Framework Preset** : `Create React App`
   - **Root Directory** : `frontend`
   - **Build Command** : `yarn build`
   - **Output Directory** : `build`

### 3.3 Variables d'environnement (Vercel)
Dans **Settings** → **Environment Variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `REACT_APP_BACKEND_URL` | `https://trouve-ton-dossard-api.onrender.com` |

⚠️ **Important** : Le préfixe `REACT_APP_` est obligatoire pour Create React App !

### 3.4 Déployer
1. Cliquez **Deploy**
2. Attendez (~2 min)
3. Votre app est en ligne ! 🎉

---

## Étape 4 : Finaliser la configuration

### 4.1 Mettre à jour CORS sur Render
Retournez sur Render et mettez à jour :
- `CORS_ORIGINS` : `https://votre-app.vercel.app`
- `FRONTEND_URL` : `https://votre-app.vercel.app`

Puis **Manual Deploy** → **Deploy latest commit**

### 4.2 Tester l'application
1. Ouvrez votre URL Vercel
2. Testez la connexion admin :
   - Email : `admin@trailfrance.com`
   - Password : `admin123`

---

## Résumé des URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://trouve-ton-dossard.vercel.app` |
| Backend (Render) | `https://trouve-ton-dossard-api.onrender.com` |
| API Endpoint | `https://trouve-ton-dossard-api.onrender.com/api/` |

---

## Dépannage

### Le frontend ne se connecte pas au backend
- Vérifiez que `REACT_APP_BACKEND_URL` est correct sur Vercel
- Vérifiez que `CORS_ORIGINS` inclut votre URL Vercel sur Render
- Redéployez les deux services après modification

### Erreur MongoDB
- Vérifiez que l'IP 0.0.0.0/0 est autorisée sur Atlas
- Vérifiez que le mot de passe dans `MONGO_URL` est correct
- Vérifiez que l'utilisateur a les droits `readWrite`

### Le backend est lent au premier appel
- Normal sur le plan gratuit Render (cold start ~30s)
- Le service "dort" après 15 min d'inactivité
- Solution : passer au plan payant ($7/mois)

### Les emails ne s'envoient pas
- Configurez `SENDGRID_API_KEY` sur Render
- Vérifiez que `SENDER_EMAIL` est vérifié sur SendGrid

---

## Coûts estimés

| Service | Plan Gratuit | Plan Pro |
|---------|--------------|----------|
| Vercel | ✅ Illimité (hobby) | $20/mois |
| Render | ✅ 750h/mois (dort après 15min) | $7/mois |
| MongoDB Atlas | ✅ 512MB | $9/mois (2GB) |

**Total gratuit** : 0€/mois (avec limitations)
**Total pro** : ~36€/mois (sans limitations)
