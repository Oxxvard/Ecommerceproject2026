import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice: number; // Prix d'achat (Chine)
  shippingCost?: number; // Frais de fret/livraison
  compareAtPrice?: number;
  images: string[];
  colorVariants?: Array<{ 
    color: string; 
    images: string[];
    cjVid?: string; // Variant ID CJ pour cette couleur spécifique
  }>; // Variantes couleur avec images par couleur
  category: mongoose.Types.ObjectId | { _id: string; name: string; slug: string };
  stock: number;
  inStock?: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  cjProductId?: string; // ID produit CJ Dropshipping
  cjPid?: string; // Product ID CJ (PID)
  cjVid?: string; // Variant ID CJ (VID) - utilisé pour créer des commandes
  cjData?: {
    pid?: string;
    vid?: string;
    sku?: string;
    productId?: string;
    costPrice?: number;
    variants?: Array<Record<string, unknown>>;
    warehouseId?: string;
    lastStockUpdate?: Date;
    lastProductUpdate?: Date;
    updateType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one image is required',
      },
    },
    colorVariants: {
      type: [{
        color: { type: String, required: true },
        images: { type: [String], required: true, validate: {
          validator: function(v: string[]) {
            return v && v.length > 0;
          },
          message: 'At least one image is required per color variant',
        }},
        cjVid: { type: String }, // VID CJ pour cette variante
      }],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    cjProductId: {
      type: String,
      index: true,
    },
    cjPid: {
      type: String,
      index: true,
    },
    cjVid: {
      type: String,
      index: true,
    },
    cjData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
