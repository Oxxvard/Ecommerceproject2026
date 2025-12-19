const mongoose = require('mongoose');
require('dotenv').config();

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

async function createTestCoupons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer les anciens coupons de test
    await Coupon.deleteMany({ code: { $in: ['TEST10', 'PROMO20', 'WELCOME5'] } });

    // 1. Coupon pourcentage simple - 10% de réduction
    const coupon1 = await Coupon.create({
      code: 'TEST10',
      type: 'percentage',
      value: 10,
      minPurchase: 0,
      maxDiscount: 0,
      maxUses: 0, // illimité
      isActive: true,
    });
    console.log('✅ Créé: TEST10 - 10% de réduction (illimité)');

    // 2. Coupon pourcentage avec restrictions - 20% jusqu'à 50€ max, achat min 100€
    const coupon2 = await Coupon.create({
      code: 'PROMO20',
      type: 'percentage',
      value: 20,
      minPurchase: 100,
      maxDiscount: 50,
      maxUses: 10, // limité à 10 usages
      isActive: true,
    });
    console.log('✅ Créé: PROMO20 - 20% (max 50€, min 100€, 10 usages max)');

    // 3. Coupon montant fixe - 5€ de réduction
    const coupon3 = await Coupon.create({
      code: 'WELCOME5',
      type: 'fixed',
      value: 5,
      minPurchase: 20,
      maxUses: 100,
      isActive: true,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // expire dans 30 jours
    });
    console.log('✅ Créé: WELCOME5 - 5€ (min 20€, 100 usages, expire dans 30j)');

    console.log('\n📋 COUPONS DE TEST CRÉÉS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Code: TEST10');
    console.log('  → 10% de réduction sans limite');
    console.log('');
    console.log('Code: PROMO20');
    console.log('  → 20% de réduction (max 50€)');
    console.log('  → Achat minimum: 100€');
    console.log('  → Limité à 10 utilisations');
    console.log('');
    console.log('Code: WELCOME5');
    console.log('  → 5€ de réduction');
    console.log('  → Achat minimum: 20€');
    console.log('  → Expire dans 30 jours');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    console.log('\n✅ Terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestCoupons();
