/**
 * Rate limiting pour protéger les endpoints sensibles
 * Utilise un simple en-mémoire pour development, Redis en production
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store en-mémoire (simple, pas persistant entre restarts)
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Configuration du rate limiting par endpoint
 */
const RATE_LIMITS = {
  // Auth endpoints - strict
  'POST:/api/auth/signin': { requests: 5, windowMs: 15 * 60 * 1000 },
  'POST:/api/auth/register': { requests: 5, windowMs: 15 * 60 * 1000 },
  'POST:/api/auth/forgot-password': { requests: 3, windowMs: 60 * 60 * 1000 },

  // API endpoints - modéré
  'POST:/api/products': { requests: 10, windowMs: 60 * 1000 },
  'PUT:/api/products': { requests: 10, windowMs: 60 * 1000 },
  'DELETE:/api/products': { requests: 10, windowMs: 60 * 1000 },

  // Checkout - strict
  'POST:/api/checkout/create': { requests: 3, windowMs: 60 * 1000 },
  'POST:/api/checkout/success': { requests: 5, windowMs: 60 * 1000 },

  // Reviews - modéré
  'POST:/api/products/*/reviews': { requests: 5, windowMs: 60 * 1000 },

  // Search - générique
  'GET:/api/search': { requests: 30, windowMs: 60 * 1000 },

  // Default pour autres endpoints
  'DEFAULT': { requests: 100, windowMs: 60 * 1000 },
} as const;

/**
 * Obtenir la limite pour un endpoint
 */
function getLimitConfig(method: string, path: string) {
  const pathRegex = path
    .replace(/\[.*?\]/g, '*') // Convertir [id] en *
    .replace(/\/api\//, '');

  const key = `${method}:${path}`;

  // Chercher une correspondance exacte ou avec wildcard
  for (const [pattern, limit] of Object.entries(RATE_LIMITS)) {
    if (pattern === key || pattern.startsWith(`${method}:`) && new RegExp(`^${pattern}$`.replace(/\*/g, '.*')).test(key)) {
      return limit;
    }
  }

  return RATE_LIMITS.DEFAULT;
}

/**
 * Middleware de rate limiting
 */
export async function rateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting en développement (optionnel)
  if (process.env.NODE_ENV === 'development' && process.env.RATE_LIMIT_ENABLED !== 'true') {
    return null;
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const method = request.method;
  const path = new URL(request.url).pathname;

  const limit = getLimitConfig(method, path);
  const key = `${ip}:${method}:${path}`;

  const now = Date.now();
  let entry = rateLimitMap.get(key);

  // Nettoyer les entrées expirées
  if (entry && now > entry.resetTime) {
    entry = undefined;
  }

  if (!entry) {
    entry = { count: 1, resetTime: now + limit.windowMs };
    rateLimitMap.set(key, entry);
    return null; // OK
  }

  entry.count++;

  if (entry.count > limit.requests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.`,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.requests.toString(),
          'X-RateLimit-Remaining': Math.max(0, limit.requests - entry.count).toString(),
          'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
        },
      }
    );
  }

  return null; // OK
}

/**
 * Nettoyer les entrées expirées périodiquement
 */
export function startRateLimitCleanup(intervalMs = 10 * 60 * 1000) {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    rateLimitMap.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => rateLimitMap.delete(key));

    if (keysToDelete.length > 0) {
      logger.info(`🧹 Nettoyage rate limit: ${keysToDelete.length} entrées supprimées`);
    }
  }, intervalMs);
}
