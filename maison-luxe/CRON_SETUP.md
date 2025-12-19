# Guide de configuration du Cron pour le sync stock CJ

## Option 1 : Vercel Cron (Recommandé si vous déployez sur Vercel)

### Étape 1 : Créer vercel.json à la racine du projet

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-stock",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Le cron s'exécutera automatiquement toutes les 6 heures.

### Étape 2 : Ajouter CRON_SECRET dans Vercel

1. Allez dans votre projet Vercel → Settings → Environment Variables
2. Ajoutez : `CRON_SECRET` = `maisonluxe_cron_secret_2024_change_in_prod`

---

## Option 2 : EasyCron (Gratuit, fonctionne avec n'importe quel hébergeur)

1. Créez un compte gratuit : https://www.easycron.com/
2. Créez un nouveau cron job :
   - **URL** : `https://votre-domaine.com/api/cron/sync-stock`
   - **Schedule** : Toutes les 6 heures (ou selon vos besoins)
   - **HTTP Headers** : 
     ```
     Authorization: Bearer maisonluxe_cron_secret_2024_change_in_prod
     ```

---

## Option 3 : GitHub Actions (Gratuit)

### Créer .github/workflows/sync-stock.yml

```yaml
name: Sync CJ Stock

on:
  schedule:
    - cron: '0 */6 * * *'  # Toutes les 6 heures
  workflow_dispatch:  # Permet d'exécuter manuellement

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Call sync endpoint
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://votre-domaine.com/api/cron/sync-stock
```

Ajoutez `CRON_SECRET` dans GitHub → Settings → Secrets and variables → Actions

---

## Option 4 : Cron.job.org (Le plus simple)

1. Allez sur https://cron-job.org/
2. Créez un compte gratuit
3. Créez un job :
   - **URL** : `https://votre-domaine.com/api/cron/sync-stock`
   - **Schedule** : `0 */6 * * *` (toutes les 6 heures)
   - **Headers** : 
     ```
     Authorization: Bearer maisonluxe_cron_secret_2024_change_in_prod
     ```

---

## Test manuel

```bash
curl -H "Authorization: Bearer maisonluxe_cron_secret_2024_change_in_prod" \
  https://votre-domaine.com/api/cron/sync-stock
```

---

## Fréquences recommandées

- **E-commerce actif** : Toutes les 3-6 heures
- **Volume moyen** : Toutes les 12 heures  
- **Faible volume** : 1 fois par jour

---

## Sécurité

⚠️ **Important** : Changez `CRON_SECRET` en production avec une valeur aléatoire forte :
```bash
openssl rand -base64 32
```
