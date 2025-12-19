#!/usr/bin/env node

// Charger les variables d'environnement depuis .env
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

async function updateAdminEmail() {
  try {
    console.log('=== Mise à jour email admin ===\n');

    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maisonluxe';

    console.log('Connexion à MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✓ Connecté à MongoDB\n');

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
      console.log('✅ Email admin changé en florianvial0@gmail.com');
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
      console.log('✅ Admin créé avec florianvial0@gmail.com');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateAdminEmail();
}

createAdmin();
