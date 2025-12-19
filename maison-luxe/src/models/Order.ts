import mongoose, { Schema, Model } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  _id: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingCost?: number;
  coupon?: {
    code: string;
    discount: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    province?: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  stripeSessionId?: string;
  cjOrderId?: string;
  cjOrderNumber?: string;
  cjOrderError?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  estimatedDelivery?: Date;
  cjData?: {
    orderId?: string;
    orderStatus?: string;
    logisticName?: string;
    lastWebhookUpdate?: Date;
    tracking?: {
      trackingNumber?: string;
      logisticName?: string;
      trackingStatus?: string;
      trackingFrom?: string;
      trackingTo?: string;
      deliveryTime?: string;
      deliveryDay?: string;
      lastMileCarrier?: string;
      lastTrackNumber?: string;
      lastUpdate?: Date;
    };
    trackingEvents?: any[];
  };
  emailSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    required: true,
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function(v: IOrderItem[]) {
          return v && v.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    coupon: {
      code: { type: String },
      discount: { type: Number, min: 0 },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    cjOrderId: {
      type: String,
    },
    cjOrderNumber: {
      type: String,
    },
    cjOrderError: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
    trackingCarrier: {
      type: String,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    estimatedDelivery: {
      type: Date,
    },
    cjData: {
      type: Schema.Types.Mixed,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour les requêtes user + date
OrderSchema.index({ user: 1, createdAt: -1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
