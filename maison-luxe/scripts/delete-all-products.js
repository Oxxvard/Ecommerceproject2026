/**
 * Script pour supprimer tous les produits factices
 * Garde uniquement les catégories de luxe
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maisonluxe:RXeI4z6Mz6WJ1sCA@cluster0.ict9fq8.mongodb.net/maisonluxe';

async function deleteAllProducts() {
  try {
    console.log('🔌 Connexion à MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Définir le schéma Product
    const productSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    // Compter les produits existants
    const count = await Product.countDocuments();
    console.log(`📦 ${count} produits trouvés dans la base\n`);

    if (count === 0) {
      console.log('✨ Aucun produit à supprimer\n');
      return;
    }

    // Confirmation
    console.log('⚠️  Cette action va supprimer TOUS les produits de la base');
    console.log('   Les catégories de luxe seront conservées\n');

    // Supprimer tous les produits
    const result = await Product.deleteMany({});
    console.log(`✅ ${result.deletedCount} produits supprimés avec succès\n`);

    console.log('✨ Base de données nettoyée !');
    console.log('   Vous pouvez maintenant importer des produits CJ Dropshipping\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

deleteAllProducts();
