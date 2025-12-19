#!/usr/bin/env node

// Charger les variables d'environnement depuis .env
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maisonluxe';

// Schémas
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image: String,
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  price: Number,
  costPrice: Number,
  compareAtPrice: Number,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: Number,
  featured: Boolean,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

async function seedDatabase() {
  try {
    console.log('🚀 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connecté à MongoDB\n');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    // Nettoyer la base
    console.log('🧹 Nettoyage de la base de données...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✓ Base nettoyée\n');

    // Créer un admin
    console.log('👤 Création du compte admin...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await User.create({
      name: 'Administrateur',
      email: 'admin@maisonluxe.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✓ Admin créé: admin@maisonluxe.com / Admin123!\n');

    // Créer des utilisateurs
    console.log('👥 Création des utilisateurs...');
    const user1Password = await bcrypt.hash('User123!', 10);
    await User.create({
      name: 'Marie Dupont',
      email: 'marie@example.com',
      password: user1Password,
      role: 'user',
    });
    await User.create({
      name: 'Jean Martin',
      email: 'jean@example.com',
      password: user1Password,
      role: 'user',
    });
    console.log('✓ 2 utilisateurs créés\n');

    // Créer des catégories
    console.log('📁 Création des catégories...');
    const categories = await Category.insertMany([
      {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Gadgets et accessoires électroniques high-tech',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      },
      {
        name: 'Maison & Jardin',
        slug: 'maison-jardin',
        description: 'Décoration et accessoires pour la maison',
        image: 'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800&q=80',
      },
      {
        name: 'Mode & Accessoires',
        slug: 'mode-accessoires',
        description: 'Bijoux, sacs et accessoires tendance',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
      },
      {
        name: 'Sport & Fitness',
        slug: 'sport-fitness',
        description: 'Équipements et accessoires de sport',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
      },
      {
        name: 'Beauté & Santé',
        slug: 'beaute-sante',
        description: 'Produits de beauté et bien-être',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
      },
      {
        name: 'Jouets & Enfants',
        slug: 'jouets-enfants',
        description: 'Jouets éducatifs et accessoires pour enfants',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
      },
    ]);
    console.log(`✓ ${categories.length} catégories créées\n`);

    // Créer des produits
    console.log('🛍️  Création des produits...');
    
    const products = [
      // Électronique
      {
        name: 'Écouteurs Bluetooth Sans Fil Premium',
        slug: 'ecouteurs-bluetooth-premium',
        description: 'Écouteurs sans fil avec réduction de bruit active, autonomie 30h, charge rapide USB-C. Son haute définition et confort optimal pour une expérience audio exceptionnelle. Compatible avec tous les appareils Bluetooth.',
        price: 49.99,
        costPrice: 15.00,
        compareAtPrice: 89.99,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
          'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80',
        ],
        category: categories[0]._id,
        stock: 150,
        featured: true,
        rating: 4.7,
        reviewCount: 234,
      },
      {
        name: 'Montre Connectée Intelligente',
        slug: 'montre-connectee-intelligente',
        description: 'Montre connectée avec suivi santé 24/7, GPS intégré, notifications smartphone, étanche IP68. Écran AMOLED tactile, 100+ modes sportifs. Batterie longue durée 7 jours.',
        price: 79.99,
        costPrice: 25.00,
        compareAtPrice: 149.99,
        images: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        ],
        category: categories[0]._id,
        stock: 89,
        featured: true,
        rating: 4.5,
        reviewCount: 156,
      },
      {
        name: 'Lampe LED RGB Intelligente',
        slug: 'lampe-led-rgb-intelligente',
        description: 'Ampoule LED connectée WiFi 16 millions de couleurs, contrôle vocal Alexa/Google. Ambiance personnalisable, modes scènes prédéfinis. Économie d\'énergie garantie.',
        price: 24.99,
        costPrice: 8.00,
        compareAtPrice: 39.99,
        images: [
          'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&q=80',
        ],
        category: categories[0]._id,
        stock: 200,
        featured: false,
        rating: 4.3,
        reviewCount: 89,
      },
      {
        name: 'Clavier Mécanique Gaming RGB',
        slug: 'clavier-mecanique-gaming',
        description: 'Clavier mécanique switches bleus, rétroéclairage RGB personnalisable, touches anti-ghosting. Design ergonomique pour gaming et bureautique. Construction premium aluminium.',
        price: 69.99,
        costPrice: 22.00,
        compareAtPrice: 119.99,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        ],
        category: categories[0]._id,
        stock: 65,
        featured: false,
        rating: 4.8,
        reviewCount: 178,
      },

      // Maison & Jardin
      {
        name: 'Diffuseur d\'Huiles Essentielles Ultrasonique',
        slug: 'diffuseur-huiles-essentielles',
        description: 'Diffuseur aromatique 400ml avec 7 couleurs LED, arrêt automatique, ultra-silencieux. Parfait pour chambre, salon, bureau. Crée une atmosphère apaisante et relaxante.',
        price: 34.99,
        costPrice: 12.00,
        compareAtPrice: 59.99,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
        ],
        category: categories[1]._id,
        stock: 120,
        featured: true,
        rating: 4.6,
        reviewCount: 203,
      },
      {
        name: 'Set de Couteaux de Cuisine 8 Pièces',
        slug: 'set-couteaux-cuisine',
        description: 'Ensemble de couteaux professionnels en acier inoxydable avec support bambou. Lames ultra-tranchantes, ergonomiques, résistants à la corrosion. Kit complet pour tous usages.',
        price: 44.99,
        costPrice: 15.00,
        compareAtPrice: 89.99,
        images: [
          'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80',
        ],
        category: categories[1]._id,
        stock: 78,
        featured: false,
        rating: 4.7,
        reviewCount: 145,
      },
      {
        name: 'Tapis de Yoga Antidérapant Premium',
        slug: 'tapis-yoga-premium',
        description: 'Tapis yoga épais 6mm, matériau écologique TPE, surface antidérapante. Parfait pour yoga, pilates, fitness. Livré avec sangle de transport. Dimensions 183x61cm.',
        price: 29.99,
        costPrice: 10.00,
        compareAtPrice: 49.99,
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
        ],
        category: categories[1]._id,
        stock: 95,
        featured: false,
        rating: 4.4,
        reviewCount: 112,
      },
      {
        name: 'Organiseur de Tiroir Modulable',
        slug: 'organiseur-tiroir-modulable',
        description: 'Set de 6 boîtes de rangement ajustables pour tiroirs. Plastique résistant, facile à nettoyer. Idéal cuisine, bureau, salle de bain. Optimisez votre espace.',
        price: 19.99,
        costPrice: 6.00,
        compareAtPrice: 34.99,
        images: [
          'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
        ],
        category: categories[1]._id,
        stock: 150,
        featured: false,
        rating: 4.2,
        reviewCount: 67,
      },

      // Mode & Accessoires
      {
        name: 'Sac à Main Cuir Vintage Élégant',
        slug: 'sac-main-cuir-vintage',
        description: 'Sac à main en cuir PU premium, design vintage chic. Multiples compartiments, bandoulière ajustable. Parfait quotidien ou sorties. Dimensions idéales 30x25x10cm.',
        price: 54.99,
        costPrice: 18.00,
        compareAtPrice: 99.99,
        images: [
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
        ],
        category: categories[2]._id,
        stock: 67,
        featured: true,
        rating: 4.6,
        reviewCount: 189,
      },
      {
        name: 'Coffret Bijoux Collier et Boucles d\'Oreilles',
        slug: 'coffret-bijoux-elegant',
        description: 'Parure élégante plaqué or 18k, pierres zircon brillantes. Design moderne et raffiné. Hypoallergénique, résistant. Parfait cadeau avec écrin luxueux inclus.',
        price: 39.99,
        costPrice: 12.00,
        compareAtPrice: 79.99,
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
        ],
        category: categories[2]._id,
        stock: 110,
        featured: false,
        rating: 4.5,
        reviewCount: 143,
      },
      {
        name: 'Lunettes de Soleil Polarisées UV400',
        slug: 'lunettes-soleil-polarisees',
        description: 'Lunettes polarisées protection UV400, monture légère métal. Design aviateur intemporel, verres anti-reflets. Étui rigide et chiffon inclus. Confort optimal.',
        price: 27.99,
        costPrice: 9.00,
        compareAtPrice: 49.99,
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        ],
        category: categories[2]._id,
        stock: 134,
        featured: false,
        rating: 4.4,
        reviewCount: 98,
      },
      {
        name: 'Écharpe Cachemire Luxueuse',
        slug: 'echarpe-cachemire-luxueuse',
        description: 'Écharpe douce 100% cachemire synthétique premium, 200x70cm. Chaleur exceptionnelle, toucher soyeux. Plusieurs coloris tendance. Accessoire hiver indispensable.',
        price: 32.99,
        costPrice: 11.00,
        compareAtPrice: 59.99,
        images: [
          'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80',
        ],
        category: categories[2]._id,
        stock: 88,
        featured: false,
        rating: 4.7,
        reviewCount: 124,
      },

      // Sport & Fitness
      {
        name: 'Bandes de Résistance Fitness Set 5 Niveaux',
        slug: 'bandes-resistance-fitness',
        description: 'Kit 5 bandes élastiques résistance progressive, latex naturel. Parfait musculation, rééducation, yoga. Sac de transport + guide exercices. Ultra-résistantes.',
        price: 24.99,
        costPrice: 8.00,
        compareAtPrice: 44.99,
        images: [
          'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b6bd?w=800&q=80',
        ],
        category: categories[3]._id,
        stock: 156,
        featured: true,
        rating: 4.8,
        reviewCount: 267,
      },
      {
        name: 'Corde à Sauter Speed Rope Pro',
        slug: 'corde-sauter-speed-rope',
        description: 'Corde à sauter professionnelle roulements à billes, câble acier tressé. Poignées ergonomiques antidérapantes. Longueur ajustable. Cardio et perte poids.',
        price: 16.99,
        costPrice: 5.00,
        compareAtPrice: 29.99,
        images: [
          'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
        ],
        category: categories[3]._id,
        stock: 189,
        featured: false,
        rating: 4.5,
        reviewCount: 178,
      },
      {
        name: 'Gourde Sport Isotherme 1L',
        slug: 'gourde-sport-isotherme',
        description: 'Bouteille isotherme acier inoxydable, garde froid 24h / chaud 12h. Sans BPA, étanche 100%. Design ergonomique avec mousqueton. Parfait sport et randonnée.',
        price: 22.99,
        costPrice: 7.50,
        compareAtPrice: 39.99,
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
        ],
        category: categories[3]._id,
        stock: 145,
        featured: false,
        rating: 4.6,
        reviewCount: 201,
      },

      // Beauté & Santé
      {
        name: 'Kit Manucure Pédicure Électrique',
        slug: 'kit-manucure-electrique',
        description: 'Set professionnel 11 accessoires, vitesse variable, rechargeable USB. Polissage, limage, cuticules. Résultat salon à domicile. Étui de rangement premium inclus.',
        price: 36.99,
        costPrice: 12.00,
        compareAtPrice: 69.99,
        images: [
          'https://images.unsplash.com/photo-1610992015762-45dca7656217?w=800&q=80',
        ],
        category: categories[4]._id,
        stock: 98,
        featured: true,
        rating: 4.5,
        reviewCount: 167,
      },
      {
        name: 'Rouleau de Massage Facial Jade',
        slug: 'rouleau-massage-facial-jade',
        description: 'Rouleau facial en jade naturel et Gua Sha. Améliore circulation, réduit poches, raffermit. Rituel beauté relaxant. Pierre naturelle authentique avec étui.',
        price: 28.99,
        costPrice: 9.00,
        compareAtPrice: 49.99,
        images: [
          'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
        ],
        category: categories[4]._id,
        stock: 112,
        featured: false,
        rating: 4.4,
        reviewCount: 134,
      },
      {
        name: 'Brosse Lissante Ionique Chauffante',
        slug: 'brosse-lissante-ionique',
        description: 'Brosse chauffante technologie ionique anti-frisottis. Chauffe rapide 30s, 5 températures. Protection cheveux, résultat lisse brillant. Design ergonomique sécurisé.',
        price: 42.99,
        costPrice: 14.00,
        compareAtPrice: 79.99,
        images: [
          'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800&q=80',
        ],
        category: categories[4]._id,
        stock: 73,
        featured: false,
        rating: 4.6,
        reviewCount: 145,
      },

      // Jouets & Enfants
      {
        name: 'Puzzle 3D Bois Mécanique Animé',
        slug: 'puzzle-3d-bois-mecanique',
        description: 'Puzzle mécanique 3D en bois, sans colle, fonctionnel. 200+ pièces, assemblage fascinant. Éducatif et décoratif. Parfait cadeau enfants/adultes. Notice détaillée incluse.',
        price: 34.99,
        costPrice: 11.00,
        compareAtPrice: 59.99,
        images: [
          'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',
        ],
        category: categories[5]._id,
        stock: 87,
        featured: false,
        rating: 4.7,
        reviewCount: 156,
      },
      {
        name: 'Set de Construction Magnétique 100 Pièces',
        slug: 'set-construction-magnetique',
        description: 'Blocs magnétiques colorés, développe créativité et motricité. 100 pièces formes variées, aimants puissants. Non-toxique, sécurisé. Guide modèles inclus. 3 ans+.',
        price: 39.99,
        costPrice: 13.00,
        compareAtPrice: 69.99,
        images: [
          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80',
        ],
        category: categories[5]._id,
        stock: 124,
        featured: true,
        rating: 4.9,
        reviewCount: 287,
      },
      {
        name: 'Peluche Veilleuse Projection Étoiles',
        slug: 'peluche-veilleuse-etoiles',
        description: 'Doudou veilleuse musical projetant étoiles au plafond. 8 mélodies apaisantes, minuterie. Rassure bébé, favorise endormissement. Lavable, sécurisé. Cadeau naissance idéal.',
        price: 32.99,
        costPrice: 11.00,
        compareAtPrice: 54.99,
        images: [
          'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
        ],
        category: categories[5]._id,
        stock: 95,
        featured: false,
        rating: 4.6,
        reviewCount: 178,
      },
    ];

    await Product.insertMany(products);
    console.log(`✓ ${products.length} produits créés\n`);

    console.log('✨ Base de données remplie avec succès!\n');
    console.log('📊 Résumé:');
    console.log(`   - ${await User.countDocuments()} utilisateurs`);
    console.log(`   - ${await Category.countDocuments()} catégories`);
    console.log(`   - ${await Product.countDocuments()} produits`);
    console.log('\n🔐 Compte admin:');
    console.log('   Email: admin@maisonluxe.com');
    console.log('   Mot de passe: Admin123!');
    console.log('\n🌐 Accédez au site: http://localhost:3001');
    console.log('   Admin: http://localhost:3001/admin\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
