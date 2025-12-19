#!/usr/bin/env node

/**
 * Script de vérification de santé du site
 * Vérifie les optimisations SEO et performance
 */

const https = require('https');
const fs = require('fs');

console.log('🔍 Vérification de la santé du site MaisonLuxe\n');

// Vérifier la présence des fichiers essentiels
const essentialFiles = [
  'src/app/robots.ts',
  'src/app/sitemap.ts',
  'src/app/manifest.ts',
  'src/app/loading.tsx',
  'src/app/error.tsx',
  'src/app/not-found.tsx',
  'src/lib/jsonld.ts',
  '.env',
];

console.log('📁 Vérification des fichiers essentiels:');
let filesMissing = 0;
essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) filesMissing++;
});

console.log('\n📊 Résumé:');
console.log(`  Fichiers présents: ${essentialFiles.length - filesMissing}/${essentialFiles.length}`);

if (filesMissing === 0) {
  console.log('\n✅ Tous les fichiers essentiels sont présents!');
} else {
  console.log(`\n⚠️  ${filesMissing} fichier(s) manquant(s)`);
}

// Vérifier les variables d'environnement
console.log('\n🔐 Variables d\'environnement:');
const requiredEnvVars = ['MONGODB_URI', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
let envMissing = 0;

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  requiredEnvVars.forEach(envVar => {
    const exists = envContent.includes(envVar + '=');
    console.log(`  ${exists ? '✅' : '❌'} ${envVar}`);
    if (!exists) envMissing++;
  });
} else {
  console.log('  ❌ Fichier .env introuvable');
  envMissing = requiredEnvVars.length;
}

// Recommandations
console.log('\n💡 Recommandations:');
console.log('  1. Testez sur PageSpeed Insights: https://pagespeed.web.dev/');
console.log('  2. Vérifiez Search Console: https://search.google.com/search-console');
console.log('  3. Validez le HTML: https://validator.w3.org/');
console.log('  4. Testez les Core Web Vitals');
console.log('  5. Vérifiez le sitemap: /sitemap.xml');
console.log('  6. Vérifiez robots.txt: /robots.txt');

console.log('\n🎯 Score global: ' + (filesMissing === 0 && envMissing === 0 ? '✅ EXCELLENT' : '⚠️  À AMÉLIORER'));
