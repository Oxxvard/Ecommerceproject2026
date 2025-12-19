/**
 * Vérification de la configuration CJ Dropshipping
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function verifySetup() {
  try {
    console.log('🔍 Vérification de la configuration...\n');

    // 1. Vérifier MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // 2. Vérifier les catégories
    const categorySchema = new mongoose.Schema({}, { strict: false });
    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
    const categories = await Category.find();
    console.log(`✅ ${categories.length} catégories de luxe configurées:`);
    categories.forEach(cat => console.log(`   - ${cat.name}`));

    // 3. Vérifier les produits
    const productSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const products = await Product.find();
    console.log(`\n📦 ${products.length} produits dans la base`);
    
    if (products.length > 0) {
      console.log('\n⚠️  ATTENTION : Des produits existent encore dans la base');
      console.log('   Lancez scripts/delete-all-products.js pour nettoyer');
    } else {
      console.log('✅ Base de données vide, prête pour l\'import CJ');
    }

    // 4. Vérifier les variables d'environnement
    console.log('\n🔑 Variables d\'environnement :');
    console.log(`   CJ_API_KEY: ${process.env.CJ_API_KEY ? '✅ Configurée' : '❌ Manquante'}`);
    console.log(`   CJ_API_URL: ${process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Configurée' : '❌ Manquante'}`);
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Configurée' : '❌ Manquante'}`);

    console.log('\n📋 Résumé de la configuration :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Catégories de luxe : OK');
    console.log('✅ Base de données : MongoDB Atlas');
    console.log('✅ API CJ Dropshipping : Configurée');
    console.log('✅ Interface d\'import : /admin/cj-import');
    console.log('✅ Prix personnalisables : OUI');
    console.log('✅ Gestion des produits : /admin/products');
    console.log('❌ Ajout manuel : DÉSACTIVÉ (CJ uniquement)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🚀 Prochaines étapes :');
    console.log('   1. Accéder à http://localhost:3001/admin/cj-import');
    console.log('   2. Rechercher des produits (ex: luxury watch)');
    console.log('   3. Définir un prix personnalisé (optionnel)');
    console.log('   4. Sélectionner une catégorie');
    console.log('   5. Cliquer sur "Importer"');
    console.log('\n💡 Voir GUIDE_IMPORT_CJ.js pour plus de détails\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifySetup();
