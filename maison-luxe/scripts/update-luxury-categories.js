const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maisonluxe:RXeI4z6Mz6WJ1sCA@cluster0.ict9fq8.mongodb.net/maisonluxe';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  order: { type: Number, default: 0 }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const luxuryCategories = [
  {
    name: 'Montres',
    slug: 'montres',
    description: 'Collection exclusive de montres de luxe et montres design',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    order: 1
  },
  {
    name: 'Bijoux',
    slug: 'bijoux',
    description: 'Bijoux précieux et accessoires raffinés',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    order: 2
  },
  {
    name: 'Colliers',
    slug: 'colliers',
    description: 'Colliers élégants en or, argent et pierres précieuses',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    order: 3
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Bracelets de luxe pour homme et femme',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    order: 4
  },
  {
    name: 'Bagues',
    slug: 'bagues',
    description: 'Bagues sophistiquées et alliances',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    order: 5
  },
  {
    name: 'Boucles d\'Oreilles',
    slug: 'boucles-oreilles',
    description: 'Boucles d\'oreilles élégantes et raffinées',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    order: 6
  },
  {
    name: 'Sacs de Luxe',
    slug: 'sacs-luxe',
    description: 'Maroquinerie haut de gamme et sacs à main design',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    order: 7
  },
  {
    name: 'Lunettes',
    slug: 'lunettes',
    description: 'Lunettes de soleil et lunettes de vue premium',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    order: 8
  },
  {
    name: 'Accessoires',
    slug: 'accessoires',
    description: 'Accessoires de mode haut de gamme',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    order: 9
  },
  {
    name: 'Parfums',
    slug: 'parfums',
    description: 'Parfums de luxe et fragrances exclusives',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    order: 10
  }
];

async function updateCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer toutes les anciennes catégories
    console.log('\n🗑️  Suppression des anciennes catégories...');
    const deletedCategories = await Category.deleteMany({});
    console.log(`✅ ${deletedCategories.deletedCount} catégories supprimées`);

    // Supprimer tous les anciens produits (ils ne correspondront plus)
    console.log('\n🗑️  Suppression des anciens produits...');
    const deletedProducts = await Product.deleteMany({});
    console.log(`✅ ${deletedProducts.deletedCount} produits supprimés`);

    // Créer les nouvelles catégories luxe
    console.log('\n✨ Création des nouvelles catégories luxe...');
    const createdCategories = await Category.insertMany(luxuryCategories);
    console.log(`✅ ${createdCategories.length} catégories créées :\n`);
    
    createdCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
    });

    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Importez vos nouveaux produits via l\'admin');
    console.log('   2. Ou utilisez l\'API CJ Dropshipping pour importer automatiquement');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

updateCategories();
