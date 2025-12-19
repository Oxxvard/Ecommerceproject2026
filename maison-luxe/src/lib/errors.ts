/**
 * Système d'erreurs standardisé
 * Utilise une structure cohérente pour tous les erreurs API
 */

import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNALerror',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Erreurs courantes
export const ErrorCodes = {
  // Authentification
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: 'Non authentifié' },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'Accès refusé' },
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', status: 401, message: 'Email ou mot de passe incorrect' },
  SESSION_EXPIRED: { code: 'SESSION_EXPIRED', status: 401, message: 'Votre session a expiré' },

  // Validation
  VALIDATIONerror: { code: 'VALIDATIONerror', status: 400, message: 'Erreur de validation' },
  INVALID_INPUT: { code: 'INVALID_INPUT', status: 400, message: 'Entrée invalide' },
  MISSING_REQUIRED_FIELD: { code: 'MISSING_REQUIRED_FIELD', status: 400, message: 'Champ requis manquant' },

  // Ressources
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Ressource non trouvée' },
  ALREADY_EXISTS: { code: 'ALREADY_EXISTS', status: 409, message: 'La ressource existe déjà' },
  DUPLICATE_EMAIL: { code: 'DUPLICATE_EMAIL', status: 409, message: 'Cet email est déjà utilisé' },

  // Paiement
  PAYMENT_FAILED: { code: 'PAYMENT_FAILED', status: 402, message: 'Erreur de paiement' },
  INVALID_PAYMENT_METHOD: { code: 'INVALID_PAYMENT_METHOD', status: 400, message: 'Méthode de paiement invalide' },
  INSUFFICIENT_FUNDS: { code: 'INSUFFICIENT_FUNDS', status: 402, message: 'Fonds insuffisants' },

  // Produits
  OUT_OF_STOCK: { code: 'OUT_OF_STOCK', status: 400, message: 'Produit en rupture de stock' },
  INVALID_QUANTITY: { code: 'INVALID_QUANTITY', status: 400, message: 'Quantité invalide' },

  // Coupons
  INVALID_COUPON: { code: 'INVALID_COUPON', status: 400, message: 'Code promo invalide' },
  COUPON_EXPIRED: { code: 'COUPON_EXPIRED', status: 400, message: 'Code promo expiré' },
  COUPON_LIMIT_EXCEEDED: { code: 'COUPON_LIMIT_EXCEEDED', status: 400, message: 'Limite d\'utilisation atteinte' },

  // Rate limiting
  TOO_MANY_REQUESTS: { code: 'TOO_MANY_REQUESTS', status: 429, message: 'Trop de requêtes, veuillez réessayer plus tard' },

  // Serveur
  INTERNALerror: { code: 'INTERNALerror', status: 500, message: 'Erreur serveur interne' },
  DATABASEerror: { code: 'DATABASEerror', status: 500, message: 'Erreur base de données' },
  EXTERNAL_SERVICEerror: { code: 'EXTERNAL_SERVICEerror', status: 502, message: 'Service externe indisponible' },

  // Webhooks
  INVALID_WEBHOOK_SIGNATURE: { code: 'INVALID_WEBHOOK_SIGNATURE', status: 401, message: 'Signature webhook invalide' },
  WEBHOOK_PROCESSINGerror: { code: 'WEBHOOK_PROCESSINGerror', status: 500, message: 'Erreur traitement webhook' },
} as const;

/**
 * Créer une erreur API standardisée
 */
export function createError(
  errorCode: keyof typeof ErrorCodes,
  customMessage?: string,
  details?: any
): ApiError {
  const error = ErrorCodes[errorCode];
  return new ApiError(
    error.status,
    customMessage || error.message,
    error.code,
    details
  );
}

/**
 * Réponse JSON standardisée
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Créer une réponse de succès
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Créer une réponse d'erreur
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Retourne une NextResponse JSON standardisée en utilisant une clé d'ErrorCodes
 */
export function sendErrorResponse(
  errorCode: keyof typeof ErrorCodes,
  customMessage?: string,
  details?: any
) {
  const cfg = ErrorCodes[errorCode] as any;
  return NextResponse.json(
    errorResponse(cfg.code, customMessage || cfg.message, details),
    { status: cfg.status }
  );
}

/**
 * Retourne une NextResponse JSON personnalisée (si pas dans ErrorCodes)
 */
export function sendCustomError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json(
    errorResponse(code, message, details),
    { status }
  );
}

/**
 * Extraire les erreurs Zod de manière lisible
 */
export function formatZodError(error: any): Record<string, string> {
  const formatted: Record<string, string> = {};
  if (error.errors) {
    error.errors.forEach((err: any) => {
      const path = err.path.join('.');
      formatted[path] = err.message;
    });
  }
  return formatted;
}
