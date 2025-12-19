/**
 * Guide d'utilisation de l'interface d'import CJ Dropshipping
 * ============================================================
 * 
 * Étapes pour importer des produits CJ dans votre catalogue :
 */

// 1. Accéder à l'interface d'import
// URL: http://localhost:3001/admin/cj-import
// Connexion admin requise

// 2. Sélectionner une catégorie de destination
// - Montres
// - Bijoux
// - Colliers
// - Bracelets
// - Bagues
// - Boucles d'Oreilles
// - Sacs de Luxe
// - Lunettes
// - Accessoires
// - Parfums

// 3. Rechercher des produits CJ
// Exemples de mots-clés :
const searchExamples = [
  'luxury watch',
  'gold bracelet',
  'diamond necklace',
  'designer bag',
  'sunglasses',
  'pearl earrings',
  'silver ring',
  'perfume',
  'leather wallet',
  'luxury scarf'
];

// 4. Définir un prix personnalisé (optionnel)
// - Par défaut : Coût CJ × 1.7 (marge de 70%)
// - Personnalisé : Entrez le prix de votre choix
// - La marge sera calculée automatiquement

// 5. Cliquer sur "Importer"
// Le système va :
// ✅ Récupérer les détails complets du produit
// ✅ Télécharger les images
// ✅ Calculer le stock depuis tous les entrepôts
// ✅ Appliquer votre prix (ou le prix auto)
// ✅ Créer un prix comparé (+40% pour effet promo)
// ✅ Sauvegarder dans MongoDB
// ✅ Lier au fournisseur CJ pour les commandes futures

// EXEMPLE D'IMPORT
// ================
const exampleImport = {
  // Produit CJ trouvé
  cjProduct: {
    id: '123456',
    nameEn: 'Luxury Automatic Watch Men Mechanical Skeleton',
    bigImage: 'https://cjdropshipping.com/...',
    sellPrice: '45.00', // Coût fournisseur
    warehouseInventoryNum: 1250
  },
  
  // Catégorie sélectionnée
  category: 'Montres',
  
  // Option 1 : Prix automatique (défaut)
  importAuto: {
    costPrice: 45.00,
    price: 76.50,      // 45 × 1.7 = marge 70%
    compareAtPrice: 107.10, // 76.50 × 1.4 = effet promo
    margin: '70%'
  },
  
  // Option 2 : Prix personnalisé
  importCustom: {
    customPrice: 129.00,    // Votre prix choisi
    costPrice: 45.00,
    price: 129.00,
    compareAtPrice: 180.60,  // 129 × 1.4
    margin: '186%'           // (129-45)/45 = super marge !
  }
};

// GESTION DES PRODUITS
// ====================
// - Voir tous les produits : /admin/products
// - Affiche : Nom, Coût, Prix vente, Marge %, Stock
// - Action : Supprimer uniquement (pas d'édition manuelle)
// - Pour modifier : supprimer et ré-importer avec nouveau prix

// SYNCHRONISATION DES STOCKS
// ===========================
// TODO: Créer un cron job pour synchroniser automatiquement
// - Endpoint : /api/cron/sync-stock
// - Fréquence : Toutes les 6 heures
// - Action : Met à jour le stock depuis CJ pour tous les produits

console.log('✅ Interface CJ Dropshipping configurée');
console.log('📦 Produits factices supprimés');
console.log('💰 Prix personnalisables lors de l\'import');
console.log('🚀 Prêt pour l\'import de produits réels !');
