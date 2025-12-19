#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maisonluxe_ci';

const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String }, { timestamps: true });
const ProductSchema = new mongoose.Schema({ name: String, price: Number, stock: Number }, { timestamps: true });
const OrderSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, items: Array, totalAmount: Number, paymentStatus: String }, { timestamps: true });

async function seed() {
  console.log('CI seeding to', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
  const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

  // Clean
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // Create admin
  const adminPass = await bcrypt.hash('Admin123!', 10);
  const admin = await User.create({ name: 'CI Admin', email: 'ci-admin@example.com', password: adminPass, role: 'admin' });

  // Create user
  const userPass = await bcrypt.hash('User123!', 10);
  const user = await User.create({ name: 'CI User', email: 'ci-user@example.com', password: userPass, role: 'user' });

  // Create product
  const product = await Product.create({ name: 'CI Sample Product', price: 9.99, stock: 100 });

  // Create order
  const order = await Order.create({ user: user._id, items: [{ product: product._id, name: product.name, quantity: 1, price: product.price }], totalAmount: product.price, paymentStatus: 'paid' });

  console.log('Seeded:', { admin: admin.email, user: user.email, product: product.name, orderId: order._id.toString() });
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
