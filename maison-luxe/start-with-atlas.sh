#!/bin/bash
# Script pour relancer l'application avec MongoDB Atlas

echo "🔄 Arrêt de MongoDB local..."
pkill -f mongod

echo "🚀 Démarrage de l'application Next.js..."
echo "📡 L'application utilisera MongoDB Atlas"
echo ""
echo "✅ Pour vérifier que tout fonctionne :"
echo "   1. L'application devrait démarrer normalement"
echo "   2. Vous devriez voir les produits s'afficher"
echo "   3. Les données seront maintenant permanentes dans le cloud"
echo ""

cd /workspaces/Ecommerceproject2026/maison-luxe
npm run dev
