'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setStatus('error');
          return;
        }

        // Appeler l'API pour confirmer le paiement et récupérer l'orderId
        const res = await fetch('/api/checkout/success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Erreur de confirmation');
        }

        const data = await res.json();
        setOrderId(data.orderId);
        setStatus('success');
        clearCart();

        // Rediriger vers la page commande après 3 secondes
        setTimeout(() => {
          router.push(`/orders/${data.orderId}`);
        }, 3000);
      } catch (error: any) {
        console.error('Erreur:', error);
        setStatus('error');
      }
    };

    confirmPayment();
  }, [searchParams, router, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmation du paiement</h1>
            <p className="text-gray-600">Veuillez patienter...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement confirmé ! ✓</h1>
            <p className="text-gray-600 mb-6">
              Merci pour votre achat ! Vous serez redirigé vers les détails de votre commande.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Si vous n'êtes pas redirigé automatiquement :
              </p>
              <Link
                href={`/orders/${orderId}`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Voir ma commande
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">✗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de confirmation</h1>
            <p className="text-gray-600 mb-6">
              Une erreur s'est produite lors de la confirmation de votre paiement.
            </p>
            <div className="space-y-3">
              <Link
                href="/orders"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Voir mes commandes
              </Link>
              <p className="text-xs text-gray-500 mt-4">
                Si le problème persiste, veuillez contacter le support.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
