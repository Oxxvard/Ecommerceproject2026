import mongoose, { Schema, Model } from 'mongoose';

export interface ICoupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  usedBy: mongoose.Types.ObjectId[];
  startDate?: Date;
  expiryDate?: Date;
  isActive: boolean;
  applicableCategories?: mongoose.Types.ObjectId[];
  applicableProducts?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Le code promo est requis'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Le type de réduction est requis'],
    },
    value: {
      type: Number,
      required: [true, 'La valeur de réduction est requise'],
      min: [0, 'La valeur doit être positive'],
    },
    description: {
      type: String,
      trim: true,
    },
    minPurchase: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    startDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCategories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
    }],
    applicableProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
CouponSchema.index({ code: 1, isActive: 1 });
CouponSchema.index({ expiryDate: 1 });

// Validation personnalisée
CouponSchema.pre('save', function(next) {
  // Valider que percentage ne dépasse pas 100%
  if (this.type === 'percentage' && this.value > 100) {
    next(new Error('Le pourcentage ne peut pas dépasser 100%'));
  }
  next();
});

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
