#!/usr/bin/env node

require('dotenv').config();

const mongoose = require('mongoose');

async function updateAdminEmail() {
  try {
    console.log('=== Mise à jour email admin ===\n');

    const dbUri = process.env.MONGODB_URI;

    console.log('Connexion à MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✓ Connecté\n');

    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const admin = await User.findOne({ email: 'admin@maisonluxe.com' });
    
    if (admin) {
      admin.email = 'florianvial0@gmail.com';
      await admin.save();
      console.log('✅ Email admin changé: florianvial0@gmail.com');
    } else {
      console.log('⚠️ Admin non trouvé, création...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await User.create({
        name: 'Admin',
        email: 'florianvial0@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin créé: florianvial0@gmail.com / Admin123!');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateAdminEmail();
