#!/usr/bin/env node

/**
 * Script pour préchauffer le cache Next.js en dev
 * Compile toutes les routes importantes au démarrage
 */

const http = require('http');

const routes = [
  '/',
  '/produits',
  '/about',
  '/contact',
  '/cart',
  '/admin',
  '/admin/products',
  '/api/products',
  '/api/categories',
  '/api/auth/session',
];

console.log('🔥 Préchauffage du cache Next.js...\n');

const warmup = async () => {
  let completed = 0;
  
  for (const route of routes) {
    try {
      await new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${route}`, (res) => {
          completed++;
          console.log(`✅ [${completed}/${routes.length}] ${route}`);
          resolve();
        }).on('error', reject);
      });
      
      // Petit délai entre les requêtes
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.log(`⚠️  ${route} - En attente du serveur...`);
    }
  }
  
  console.log('\n✅ Cache préchauffé ! Navigation rapide activée 🚀');
};

// Attendre que le serveur soit prêt
setTimeout(() => {
  warmup().catch(err => {
    console.log('\n⚠️  Assurez-vous que le serveur Next.js est démarré (npm run dev)');
  });
}, 3000);
