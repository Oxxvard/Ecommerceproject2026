#!/usr/bin/env node

/**
 * Script de vérification du démarrage
 * Valide toutes les configurations avant de lancer l'app
 * 
 * Exécuter: npm run startup-check
 */

const fs = require('fs');
const path = require('path');

// Charger le fichier .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !match[1].startsWith('#')) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function runStartupCheck() {
  log('blue', '\n╔════════════════════════════════════════╗');
  log('blue', '║  🚀 MAISON LUXE - STARTUP CHECK        ║');
  log('blue', '╚════════════════════════════════════════╝\n');

  let success = true;

  // ==========================================
  // 1. Vérifier les env vars
  // ==========================================
  log('cyan', '1. Vérification des variables d\'environnement...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    log('red', `   ❌ Variables manquantes: ${missingVars.join(', ')}`);
    log('red', '       Copier .env.example en .env.local et remplir\n');
    success = false;
  } else {
    log('green', '   ✅ Toutes les variables requises sont configurées\n');
  }

  // ==========================================
  // 2. Vérifier les fichiers critiques
  // ==========================================
  log('cyan', '2. Vérification des fichiers critiques...');
  const criticalFiles = [
    'src/lib/schemas.ts',
    'src/lib/errors.ts',
    'src/lib/env.ts',
    'src/lib/auth-middleware.ts',
    'src/lib/rate-limit.ts',
    'src/app/api/webhook/stripe/route.ts',
  ];

  let allFilesExist = true;
  for (const file of criticalFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      log('green', `   ✅ ${file}`);
    } else {
      log('red', `   ❌ ${file} - NON TROUVÉ`);
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    log('red', '\n   Certains fichiers critiques sont manquants!\n');
    success = false;
  } else {
    log('green', '\n   ✅ Tous les fichiers critiques sont présents\n');
  }

  // ==========================================
  // 3. Vérifier package.json
  // ==========================================
  log('cyan', '3. Vérification des dépendances...');
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );

    const requiredPackages = ['zod', 'next', 'mongoose', 'next-auth', 'stripe'];
    let allDepsInstalled = true;

    for (const pkg of requiredPackages) {
      if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
        log('green', `   ✅ ${pkg}`);
      } else {
        log('red', `   ❌ ${pkg} - NON INSTALLÉ`);
        allDepsInstalled = false;
      }
    }

    if (!allDepsInstalled) {
      log('yellow', '\n   ⚠️  Quelques dépendances manquent. Exécuter: npm install\n');
      success = false;
    } else {
      log('green', '\n   ✅ Toutes les dépendances requises sont installées\n');
    }
  } catch (error) {
    log('red', `   ❌ Erreur lecture package.json: ${error.message}\n`);
    success = false;
  }

  // ==========================================
  // 4. Vérifier .env.local
  // ==========================================
  log('cyan', '4. Vérification du fichier .env.local...');
  const envLocalExists = fs.existsSync(path.join(process.cwd(), '.env.local'));

  if (envLocalExists) {
    log('green', '   ✅ Fichier .env.local présent');
  } else {
    log('yellow', '   ⚠️  Fichier .env.local manquant');
    log('yellow', '       Copier .env.example en .env.local et remplir les valeurs');
  }
  log('');

  // ==========================================
  // 5. Afficher le résumé
  // ==========================================
  log('blue', '╔════════════════════════════════════════╗');

  if (success) {
    log('green', '║  ✅ STARTUP CHECK RÉUSSI               ║');
    log('blue', '╚════════════════════════════════════════╝');
    log('green', '\n🚀 Prêt à démarrer! Exécuter: npm run dev\n');
    process.exit(0);
  } else {
    log('red', '║  ❌ STARTUP CHECK ÉCHOUÉ               ║');
    log('blue', '╚════════════════════════════════════════╝');
    log('red', '\n🛑 Veuillez corriger les erreurs ci-dessus avant de démarrer.\n');
    process.exit(1);
  }
}

runStartupCheck().catch((error) => {
  log('red', `\n❌ Erreur critique: ${error.message}\n`);
  process.exit(1);
});

