const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maisonluxe:RXeI4z6Mz6WJ1sCA@cluster0.ict9fq8.mongodb.net/maisonluxe';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: Number,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, default: 100 },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Produits réalistes inspirés de CJ Dropshipping
const productsData = {
  'montres': [
    {
      name: 'Montre Automatique Skeleton Elite',
      slug: 'montre-automatique-skeleton-elite',
      description: 'Montre mécanique automatique avec cadran squelette visible. Boîtier en acier inoxydable 316L, bracelet en cuir véritable italien, mouvement japonais haute précision. Étanche 50m. Un chef-d\'œuvre d\'horlogerie accessible.',
      price: 189.99,
      compareAtPrice: 349.99,
      images: [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80'
      ],
      stock: 45,
      rating: 4.8,
      reviewCount: 234,
      featured: true
    },
    {
      name: 'Montre Chronographe Aviateur Premium',
      slug: 'montre-chronographe-aviateur-premium',
      description: 'Chronographe multifonctions inspiré des montres d\'aviateur. Cadran noir mat, lunette tournante, 6 aiguilles fonctionnelles. Mouvement quartz japonais Miyota. Bracelet acier inoxydable massif. Étanche 100m.',
      price: 149.99,
      compareAtPrice: 289.99,
      images: [
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'
      ],
      stock: 62,
      rating: 4.7,
      reviewCount: 189
    },
    {
      name: 'Montre Minimaliste Scandinave Rose Gold',
      slug: 'montre-minimaliste-scandinave-rose-gold',
      description: 'Design minimaliste nordique ultra-fin (6mm). Boîtier rose gold brossé, cadran épuré sans marquage, bracelet mesh milanais interchangeable. Mouvement quartz silencieux. Parfait pour un look élégant et moderne.',
      price: 119.99,
      compareAtPrice: 199.99,
      images: [
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80',
        'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&q=80'
      ],
      stock: 78,
      rating: 4.9,
      reviewCount: 312,
      featured: true
    },
    {
      name: 'Montre Sport Digitale Tactical',
      slug: 'montre-sport-digitale-tactical',
      description: 'Montre tactique militaire multifonctions. Écran LED double affichage, chronomètre, alarme, calendrier, rétroéclairage. Résistante aux chocs, étanche 50m. Bracelet en TPU renforcé. Idéale sports outdoor.',
      price: 79.99,
      compareAtPrice: 129.99,
      images: [
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1606390089315-e175a537d0c4?w=800&q=80'
      ],
      stock: 95,
      rating: 4.6,
      reviewCount: 156
    },
    {
      name: 'Montre Tourbillon Prestige Or',
      slug: 'montre-tourbillon-prestige-or',
      description: 'Montre mécanique avec tourbillon visible. Boîtier plaqué or 18 carats, fond transparent saphir, 42 heures de réserve de marche. Bracelet cuir crocodile véritable. Pièce d\'exception pour collectionneurs.',
      price: 299.99,
      compareAtPrice: 599.99,
      images: [
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
        'https://images.unsplash.com/photo-1611148692596-dc8b1c4d0d8f?w=800&q=80'
      ],
      stock: 23,
      rating: 4.9,
      reviewCount: 87,
      featured: true
    },
    {
      name: 'Montre Connectée Hybrid Élégance',
      slug: 'montre-connectee-hybrid-elegance',
      description: 'Smartwatch hybride analogique-digitale. Suivi activité, notifications smartphone, autonomie 30 jours. Design classique avec aiguilles mécaniques + écran OLED discret. Compatible iOS/Android.',
      price: 169.99,
      compareAtPrice: 279.99,
      images: [
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
      ],
      stock: 54,
      rating: 4.5,
      reviewCount: 203
    }
  ],
  'bijoux': [
    {
      name: 'Parure Cristaux Swarovski Aurora',
      slug: 'parure-cristaux-swarovski-aurora',
      description: 'Ensemble collier et boucles d\'oreilles ornés de cristaux Swarovski authentiques. Plaqué or blanc 18 carats, hypoallergénique. Design intemporel parfait pour occasions spéciales. Écrin luxe inclus.',
      price: 89.99,
      compareAtPrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 67,
      rating: 4.8,
      reviewCount: 276,
      featured: true
    },
    {
      name: 'Bracelet Perles Tahiti Naturelles',
      slug: 'bracelet-perles-tahiti-naturelles',
      description: 'Bracelet de perles de culture véritables de Tahiti. Perles AAA 8-9mm, montées sur fil de soie renforcé, fermoir argent 925. Chaque perle est unique avec reflets irisés naturels.',
      price: 129.99,
      compareAtPrice: 249.99,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
      ],
      stock: 34,
      rating: 4.9,
      reviewCount: 142
    },
    {
      name: 'Broche Papillon Émail Cloisonné',
      slug: 'broche-papillon-email-cloisonne',
      description: 'Broche artisanale en émail cloisonné fait main. Base laiton doré, émaux multiples cuites au four. Travail d\'orfèvre traditionnel chinois. Pièce unique signée, parfaite pour vestes et écharpes.',
      price: 59.99,
      compareAtPrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 89,
      rating: 4.7,
      reviewCount: 98
    },
    {
      name: 'Set 3 Bracelets Joncs Empilables',
      slug: 'set-3-bracelets-joncs-empilables',
      description: 'Trio de bracelets joncs empilables en acier inoxydable 316L. Finitions or, argent et rose gold. Design minimaliste ajustable. Résistants à l\'eau et hypoallergéniques. Style tendance à mixer.',
      price: 69.99,
      compareAtPrice: 119.99,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80'
      ],
      stock: 112,
      rating: 4.6,
      reviewCount: 187,
      featured: true
    },
    {
      name: 'Pendentif Arbre de Vie Opale',
      slug: 'pendentif-arbre-vie-opale',
      description: 'Pendentif arbre de vie serti d\'une opale naturelle éthiopienne. Argent 925 rhodié, chaîne incluse 45cm. Symbole de vie et d\'éternité. Pierre aux reflets multicolores changeants selon la lumière.',
      price: 79.99,
      compareAtPrice: 139.99,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1599459183200-59c7687a0275?w=800&q=80'
      ],
      stock: 56,
      rating: 4.8,
      reviewCount: 213
    }
  ],
  'colliers': [
    {
      name: 'Collier Chaîne Cubaine Or 18K',
      slug: 'collier-chaine-cubaine-or-18k',
      description: 'Chaîne cubaine massive plaquée or 18 carats 3 microns. Maillons 8mm, longueur 50cm. Fermoir mousqueton sécurisé. Hip-hop luxe, résistant et durable. Garantie anti-ternissement 2 ans.',
      price: 99.99,
      compareAtPrice: 179.99,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 73,
      rating: 4.7,
      reviewCount: 198,
      featured: true
    },
    {
      name: 'Collier Ras de Cou Diamants CZ',
      slug: 'collier-ras-cou-diamants-cz',
      description: 'Choker scintillant serti de zircones cubiques AAA. Argent 925 rhodié blanc, 38 pierres taille brillant. Éclat diamant à prix accessible. Idéal mariages et soirées glamour.',
      price: 79.99,
      compareAtPrice: 149.99,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
      ],
      stock: 45,
      rating: 4.9,
      reviewCount: 267
    },
    {
      name: 'Collier Pendentif Lune Croissant',
      slug: 'collier-pendentif-lune-croissant',
      description: 'Collier délicat lune croissante sertie de petits diamants CZ. Or rose 14K, chaîne fine 42cm ajustable. Design bohème chic et féminin. Livré dans un écrin velours premium.',
      price: 59.99,
      compareAtPrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80'
      ],
      stock: 91,
      rating: 4.8,
      reviewCount: 321
    },
    {
      name: 'Collier Multi-Rangs Perles Baroque',
      slug: 'collier-multi-rangs-perles-baroque',
      description: 'Collier statement 3 rangs de perles baroques naturelles. Perles d\'eau douce irrégulières, fermoir magnétique doré. Style vintage romantique. Pièce unique fait main.',
      price: 109.99,
      compareAtPrice: 199.99,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'
      ],
      stock: 29,
      rating: 4.6,
      reviewCount: 87,
      featured: true
    },
    {
      name: 'Collier Infinity Infini Pavé',
      slug: 'collier-infinity-infini-pave',
      description: 'Pendentif infini pavé de micro-zircones. Argent 925 plaqué or blanc. Symbole d\'amour éternel. Chaîne vénitienne 45cm. Cadeau parfait Saint-Valentin ou anniversaire.',
      price: 49.99,
      compareAtPrice: 89.99,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 134,
      rating: 4.7,
      reviewCount: 412
    }
  ],
  'bracelets': [
    {
      name: 'Bracelet Tennis Diamants Simulés',
      slug: 'bracelet-tennis-diamants-simules',
      description: 'Bracelet tennis ligne continue de 64 zircones AAA taille brillant. Argent 925 rhodié, fermoir sécurisé. Éclat exceptionnel type diamant. Indémodable pour toutes occasions.',
      price: 119.99,
      compareAtPrice: 219.99,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
      ],
      stock: 51,
      rating: 4.9,
      reviewCount: 289,
      featured: true
    },
    {
      name: 'Bracelet Cuir Tressé Magnétique',
      slug: 'bracelet-cuir-tresse-magnetique',
      description: 'Bracelet homme cuir véritable italien tressé main. Fermoir magnétique acier inoxydable. Multi-brins noir et marron. Style décontracté élégant. Ajustable 18-22cm.',
      price: 39.99,
      compareAtPrice: 69.99,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80'
      ],
      stock: 127,
      rating: 4.6,
      reviewCount: 176
    },
    {
      name: 'Bracelet Chakra Pierre Naturelle',
      slug: 'bracelet-chakra-pierre-naturelle',
      description: '7 pierres semi-précieuses naturelles représentant les chakras. Perles 8mm: améthyste, lapis-lazuli, turquoise, aventurine, citrine, cornaline, jaspe rouge. Élastique résistant. Lithothérapie et bien-être.',
      price: 49.99,
      compareAtPrice: 89.99,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'
      ],
      stock: 83,
      rating: 4.8,
      reviewCount: 234,
      featured: true
    },
    {
      name: 'Bracelet Manchette Viking Acier',
      slug: 'bracelet-manchette-viking-acier',
      description: 'Manchette ouverte motifs vikings nordiques gravés. Acier inoxydable 316L poli miroir. Design masculin puissant. Ajustable tour de poignet. Style rock tribal scandinave.',
      price: 59.99,
      compareAtPrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
      ],
      stock: 64,
      rating: 4.7,
      reviewCount: 143
    },
    {
      name: 'Bracelet Charme Pandora Style',
      slug: 'bracelet-charme-pandora-style',
      description: 'Bracelet à charms compatible style Pandora. Argent 925 avec 5 breloques incluses: cœur, trèfle, étoile, perle Murano, espaceur. Fermoir sécurisé. Ajoutez vos propres charms.',
      price: 89.99,
      compareAtPrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
      ],
      stock: 72,
      rating: 4.8,
      reviewCount: 298
    }
  ],
  'bagues': [
    {
      name: 'Bague Solitaire Moissanite 2 Carats',
      slug: 'bague-solitaire-moissanite-2-carats',
      description: 'Bague de fiançailles solitaire moissanite 2ct équivalent diamant. Or blanc 18K, pierre taille brillant ronde, 6 griffes. Brillance supérieure au diamant, éthique et durable. Certificat inclus.',
      price: 249.99,
      compareAtPrice: 499.99,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 18,
      rating: 4.9,
      reviewCount: 156,
      featured: true
    },
    {
      name: 'Alliance Tungstène Carbure Rainure',
      slug: 'alliance-tungstene-carbure-rainure',
      description: 'Alliance homme tungstène carbure ultra-résistant. Finition polie miroir avec rainure centrale. Inrayable, hypoallergénique, confort intérieur bombé. Largeur 8mm. Livré écrin luxe.',
      price: 69.99,
      compareAtPrice: 129.99,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
      ],
      stock: 94,
      rating: 4.7,
      reviewCount: 412
    },
    {
      name: 'Bague Vintage Opale Feu Éthiopie',
      slug: 'bague-vintage-opale-feu-ethiopie',
      description: 'Bague Art Déco opale de feu éthiopienne 1.5ct. Argent 925 oxyé antique, entourage marcassites. Reflets orange-rouge-vert spectaculaires. Pièce unique vintage inspirée années 20.',
      price: 129.99,
      compareAtPrice: 229.99,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
      ],
      stock: 27,
      rating: 4.8,
      reviewCount: 98,
      featured: true
    },
    {
      name: 'Chevalière Homme Acier Onyx Noir',
      slug: 'chevaliere-homme-acier-onyx-noir',
      description: 'Chevalière masculine acier 316L pierre onyx naturel noir. Monture rectangulaire large, finition mate brossée. Style classique intemporel. Résiste eau et rayures. Tailles 58-68.',
      price: 79.99,
      compareAtPrice: 139.99,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 56,
      rating: 4.6,
      reviewCount: 187
    },
    {
      name: 'Set 3 Bagues Empilables Minimalistes',
      slug: 'set-3-bagues-empilables-minimalistes',
      description: 'Trio bagues fines empilables or rose, argent, or jaune 14K. Design ultra-fin 1.5mm, lisses et brillantes. À porter ensemble ou séparément. Style délicat moderne. Hypoallergéniques.',
      price: 44.99,
      compareAtPrice: 79.99,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
      ],
      stock: 143,
      rating: 4.7,
      reviewCount: 376
    }
  ],
  'boucles-oreilles': [
    {
      name: 'Créoles Diamantées Pavées Or',
      slug: 'creoles-diamantees-pavees-or',
      description: 'Créoles moyennes 25mm pavées intérieur-extérieur de zircones AAA. Or jaune 18K, fermoir clic sécurisé. Brillance maximale 360°. Confortables port quotidien. Éclat garanti.',
      price: 89.99,
      compareAtPrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 78,
      rating: 4.9,
      reviewCount: 421,
      featured: true
    },
    {
      name: 'Pendantes Perle Tahiti Baroque',
      slug: 'pendantes-perle-tahiti-baroque',
      description: 'Boucles pendantes perles de Tahiti baroques 10mm. Argent 925 rhodié, attaches poussettes. Chaque perle unique avec irisations vert-gris. Élégance naturelle intemporelle.',
      price: 119.99,
      compareAtPrice: 219.99,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
      ],
      stock: 34,
      rating: 4.8,
      reviewCount: 167
    },
    {
      name: 'Puces Cristal Swarovski 6mm',
      slug: 'puces-cristal-swarovski-6mm',
      description: 'Clous d\'oreilles cristaux Swarovski authentiques 6mm taille ronde. Monture argent 925, fermoirs papillon. Disponibles 12 couleurs. Hypoallergéniques. Parfaites quotidien ou soirée.',
      price: 39.99,
      compareAtPrice: 69.99,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
      ],
      stock: 187,
      rating: 4.7,
      reviewCount: 589,
      featured: true
    },
    {
      name: 'Chandeliers Art Déco Strass',
      slug: 'chandeliers-art-deco-strass',
      description: 'Boucles chandeliers longues style années 20. Rhodium argenté, cascades de strass et perles. Design vintage glamour Great Gatsby. Parfaites mariages et galas. Longueur 7cm.',
      price: 69.99,
      compareAtPrice: 119.99,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 45,
      rating: 4.8,
      reviewCount: 213
    },
    {
      name: 'Asymétriques Géométriques Modernes',
      slug: 'asymetriques-geometriques-modernes',
      description: 'Paire asymétrique design contemporain. Formes géométriques or rose mat et poli. Une courte, une longue. Statement audacieux et artistique. Pour femmes avant-gardistes.',
      price: 54.99,
      compareAtPrice: 94.99,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
      ],
      stock: 61,
      rating: 4.6,
      reviewCount: 142
    }
  ],
  'sacs-luxe': [
    {
      name: 'Sac à Main Cuir Italian Saffiano',
      slug: 'sac-main-cuir-italian-saffiano',
      description: 'Sac cabas cuir véritable italien Saffiano texturé. Doublure soie, 3 compartiments intérieurs, poche zippée. Anses réglables. Dimensions 35x25x12cm. Élégance professionnelle intemporelle. Noir ou camel.',
      price: 179.99,
      compareAtPrice: 349.99,
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'
      ],
      stock: 42,
      rating: 4.9,
      reviewCount: 312,
      featured: true
    },
    {
      name: 'Pochette Soirée Cristaux Strass',
      slug: 'pochette-soiree-cristaux-strass',
      description: 'Minaudière rigide entièrement recouverte de strass multicolores. Fermoir clip doré, chaînette amovible. Doublure satin. Parfaite mariages et événements. Dimensions 18x10x5cm. Véritable bijou accessoire.',
      price: 89.99,
      compareAtPrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'
      ],
      stock: 56,
      rating: 4.7,
      reviewCount: 189
    },
    {
      name: 'Sac Bandoulière Chaîne Matelassé',
      slug: 'sac-bandouliere-chaine-matelasse',
      description: 'Sac crossbody cuir matelassé matelassage losanges. Chaîne dorée entrelacée cuir. Rabat magnétique, compartiment principal + poche. Style iconique intemporel. 22x15x7cm. Disponible 5 couleurs.',
      price: 149.99,
      compareAtPrice: 279.99,
      images: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'
      ],
      stock: 67,
      rating: 4.8,
      reviewCount: 456,
      featured: true
    },
    {
      name: 'Tote Bag Toile Monogramme Premium',
      slug: 'tote-bag-toile-monogramme-premium',
      description: 'Grand tote toile enduite imperméable motif monogramme. Anses cuir cognac, base renforcée. Spacieux pour laptop 15", shopping, voyage. 40x30x15cm. Style casual chic quotidien.',
      price: 129.99,
      compareAtPrice: 229.99,
      images: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'
      ],
      stock: 83,
      rating: 4.6,
      reviewCount: 287
    },
    {
      name: 'Sac Seau Bucket Daim Franges',
      slug: 'sac-seau-bucket-daim-franges',
      description: 'Sac seau bohème daim véritable avec franges latérales. Cordon coulissant, bandoulière ajustable. Intérieur coton doublé. Look hippie chic décontracté. Dimensions 28x30x15cm. Taupe ou noir.',
      price: 109.99,
      compareAtPrice: 189.99,
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'
      ],
      stock: 38,
      rating: 4.7,
      reviewCount: 167
    }
  ],
  'lunettes': [
    {
      name: 'Lunettes Soleil Aviateur Polarisées',
      slug: 'lunettes-soleil-aviateur-polarisees',
      description: 'Aviateurs classiques verres polarisés UV400. Monture métal doré léger, branches ajustables. Verres anti-reflets traités. Étui rigide + chiffon inclus. Protection 100% UVA/UVB. Unisexe intemporel.',
      price: 79.99,
      compareAtPrice: 139.99,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80'
      ],
      stock: 124,
      rating: 4.8,
      reviewCount: 534,
      featured: true
    },
    {
      name: 'Solaires Oversized Cat-Eye Glamour',
      slug: 'solaires-oversized-cat-eye-glamour',
      description: 'Grandes lunettes papillon œil-de-chat style vintage Hollywood. Acétate italien brillant, verres dégradés gris. Branches dorées détail logo. Glamour années 60. Noir, écaille, rouge.',
      price: 89.99,
      compareAtPrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80'
      ],
      stock: 76,
      rating: 4.9,
      reviewCount: 421
    },
    {
      name: 'Lunettes Vue Rondes Rétro Métal',
      slug: 'lunettes-vue-rondes-retro-metal',
      description: 'Monture ronde vintage métal ultra-fin. Style John Lennon intellectuel. Verres neutres ou sur mesure. Plaquettes ajustables confort. Or, argent, noir mat. Unisexe tendance.',
      price: 59.99,
      compareAtPrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80'
      ],
      stock: 98,
      rating: 4.7,
      reviewCount: 312,
      featured: true
    },
    {
      name: 'Solaires Sport Wrap Performance',
      slug: 'solaires-sport-wrap-performance',
      description: 'Lunettes sport wrap enveloppantes. Verres polycarbonate incassables polarisés, monture TR90 flexible. Antidérapantes, ventilées anti-buée. Cyclisme, running, ski. Protection maximale.',
      price: 69.99,
      compareAtPrice: 119.99,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'https://images.unsplash.com/photo-1509695507497-903c140c4f17?w=800&q=80'
      ],
      stock: 87,
      rating: 4.6,
      reviewCount: 234
    },
    {
      name: 'Vue Carrées Acétate Designer',
      slug: 'vue-carrees-acetate-designer',
      description: 'Monture carrée épaisse acétate de cellulose italien. Design architecturale moderne. Charnières métal renforcées. Verres bloquant lumière bleue disponibles. Écaille havane, noir, cristal.',
      price: 94.99,
      compareAtPrice: 169.99,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80'
      ],
      stock: 54,
      rating: 4.8,
      reviewCount: 198
    }
  ],
  'accessoires': [
    {
      name: 'Écharpe Cachemire Pure 100%',
      slug: 'echarpe-cachemire-pure-100',
      description: 'Écharpe cachemire mongolien grade A ultra-doux. Tissage artisanal 200x70cm, franges torsadées. Chaleur incomparable, légèreté aérienne. 15 couleurs classiques disponibles. Cadeau premium.',
      price: 149.99,
      compareAtPrice: 299.99,
      images: [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80'
      ],
      stock: 67,
      rating: 4.9,
      reviewCount: 287,
      featured: true
    },
    {
      name: 'Ceinture Cuir Réversible Or/Argent',
      slug: 'ceinture-cuir-reversible-or-argent',
      description: 'Ceinture réversible cuir pleine fleur italien. Boucle automatique clipsable double-face or/argent. Noir/marron réversible. Largeur 3.5cm, ajustable 110-130cm. Élégance versatile homme.',
      price: 79.99,
      compareAtPrice: 139.99,
      images: [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
        'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=800&q=80'
      ],
      stock: 91,
      rating: 4.7,
      reviewCount: 412
    },
    {
      name: 'Porte-Cartes RFID Cuir Minimaliste',
      slug: 'porte-cartes-rfid-cuir-minimaliste',
      description: 'Porte-cartes slim cuir vegan premium. Protection RFID anti-piratage. 6 emplacements cartes + poche billets. Ultra-fin 8mm. Design minimaliste moderne. Noir, cognac, bleu marine.',
      price: 44.99,
      compareAtPrice: 79.99,
      images: [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'
      ],
      stock: 143,
      rating: 4.8,
      reviewCount: 567,
      featured: true
    },
    {
      name: 'Boutons Manchette Acier Cristal',
      slug: 'boutons-manchette-acier-cristal',
      description: 'Boutons de manchette élégants acier poli. Centre cristal bleu Swarovski. Système de fixation basculant. Coffret cadeau velours. Parfaits chemises habillées et costumes.',
      price: 59.99,
      compareAtPrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      ],
      stock: 78,
      rating: 4.6,
      reviewCount: 189
    },
    {
      name: 'Chapeau Fedora Feutre Laine',
      slug: 'chapeau-fedora-feutre-laine',
      description: 'Fedora classique 100% laine feutrée. Ruban gros-grain noir, bord 6cm. Fabrication traditionnelle. Doublure satin intérieure. Style gentleman intemporel. Tailles 56-60. Noir, gris, camel.',
      price: 89.99,
      compareAtPrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
        'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800&q=80'
      ],
      stock: 52,
      rating: 4.7,
      reviewCount: 234
    }
  ],
  'parfums': [
    {
      name: 'Eau de Parfum Oud Royal 100ml',
      slug: 'eau-parfum-oud-royal-100ml',
      description: 'Parfum oriental luxueux à base d\'oud authentique. Notes de tête: bergamote, safran. Cœur: rose, oud, patchouli. Fond: ambre, musc, vanille. Concentration 20%. Flacon cristal gravé. Tenue 12h+.',
      price: 129.99,
      compareAtPrice: 249.99,
      images: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
        'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80'
      ],
      stock: 47,
      rating: 4.9,
      reviewCount: 312,
      featured: true
    },
    {
      name: 'Parfum Floral Jasmin Nuit 75ml',
      slug: 'parfum-floral-jasmin-nuit-75ml',
      description: 'Eau de toilette féminine florale sophistiquée. Jasmin sambac, fleur d\'oranger, tubéreuse. Fond boisé santal, cèdre. Élégance nocturne sensuelle. Atomiseur rechargeable design Art Déco.',
      price: 89.99,
      compareAtPrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
        'https://images.unsplash.com/photo-1588405748879-acb4b903e952?w=800&q=80'
      ],
      stock: 64,
      rating: 4.8,
      reviewCount: 456
    },
    {
      name: 'Cologne Citrus Méditerranée 100ml',
      slug: 'cologne-citrus-mediterranee-100ml',
      description: 'Eau de Cologne fraîche unisexe. Agrumes vivifiants: citron Amalfi, bergamote Calabre, orange amère. Notes marines légères. Parfait été et sport. Vaporisateur généreux. Fabriqué France.',
      price: 69.99,
      compareAtPrice: 119.99,
      images: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80'
      ],
      stock: 112,
      rating: 4.7,
      reviewCount: 387,
      featured: true
    },
    {
      name: 'Parfum Cuir Tabac Gentleman 50ml',
      slug: 'parfum-cuir-tabac-gentleman-50ml',
      description: 'Eau de parfum masculine cuir fumé. Tabac blond, cuir de Russie, notes épicées poivrées. Fond boisé vétiver, cèdre Atlas. Élégance virile intemporelle. Concentration intense 25%. Coffret bois.',
      price: 149.99,
      compareAtPrice: 279.99,
      images: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
        'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80'
      ],
      stock: 38,
      rating: 4.8,
      reviewCount: 213
    },
    {
      name: 'Huile Parfum Roll-On Musc Blanc',
      slug: 'huile-parfum-roll-on-musc-blanc',
      description: 'Huile de parfum concentrée sans alcool. Musc blanc pur, notes poudrées délicates. Application roll-on précise poignets et nuque. Tenue exceptionnelle 24h. Vegan, hypoallergénique. Format voyage 10ml.',
      price: 39.99,
      compareAtPrice: 69.99,
      images: [
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
        'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80'
      ],
      stock: 156,
      rating: 4.6,
      reviewCount: 498
    }
  ]
};

async function seedProducts() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les catégories
    const categories = await Category.find({});
    console.log(`📂 ${categories.length} catégories trouvées\n`);

    let totalProducts = 0;

    for (const category of categories) {
      const products = productsData[category.slug];
      
      if (!products || products.length === 0) {
        console.log(`⚠️  Aucun produit pour ${category.name}`);
        continue;
      }

      console.log(`✨ Ajout de ${products.length} produits pour "${category.name}"...`);

      for (const product of products) {
        const newProduct = new Product({
          ...product,
          category: category._id
        });
        await newProduct.save();
        totalProducts++;
        console.log(`   ✓ ${product.name} (${product.price}€)`);
      }
      console.log('');
    }

    console.log(`\n🎉 Migration terminée avec succès !`);
    console.log(`📦 ${totalProducts} produits ajoutés au total`);
    console.log(`\n📊 Répartition:`);
    
    for (const category of categories) {
      const count = productsData[category.slug]?.length || 0;
      console.log(`   ${category.name}: ${count} produits`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

seedProducts();
