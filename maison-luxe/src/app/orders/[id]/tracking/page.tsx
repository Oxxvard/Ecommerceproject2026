'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface TrackingInfo {
  trackingNumber: string;
  logisticName: string;
  from: string;
  to: string;
  status: string;
  deliveryDay: string;
  deliveryTime: string;
  lastMileCarrier: string;
  lastTrackNumber: string;
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchTrackingInfo();
    }
  }, [status, id]);

  const fetchTrackingInfo = async () => {
    try {
      const response = await fetch(`/api/orders/tracking?orderId=${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération du suivi');
      }

      const data = await response.json();
      setTrackingData(data);
    } catch (err: any) {
      console.error('Error fetching tracking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des informations de suivi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Erreur</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href="/orders"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('delivered')) {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    } else if (lowerStatus.includes('transit') || lowerStatus.includes('shipped')) {
      return <Truck className="w-8 h-8 text-blue-500" />;
    } else {
      return <Package className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('delivered')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (lowerStatus.includes('transit') || lowerStatus.includes('shipped')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          ← Retour aux commandes
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Suivi de commande #{(id as string)?.slice(-8)}
      </h1>

      {/* Informations CJ Order */}
      {trackingData.cjOrderId && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations CJ Dropshipping</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">ID Commande CJ:</span>
              <p className="font-medium">{trackingData.cjOrderId}</p>
            </div>
            {trackingData.cjOrderNumber && (
              <div>
                <span className="text-gray-600">Numéro CJ:</span>
                <p className="font-medium">{trackingData.cjOrderNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status de la commande */}
      {trackingData.status === 'pending' || trackingData.status === 'processing' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Package className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            {trackingData.status === 'pending' ? 'Commande en préparation' : 'Commande en cours de traitement'}
          </h2>
          <p className="text-yellow-700">{trackingData.message}</p>
        </div>
      ) : trackingData.trackingInfo && trackingData.trackingInfo.length > 0 ? (
        <div className="space-y-6">
          {trackingData.trackingInfo.map((track: TrackingInfo, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4 mb-6">
                {getStatusIcon(track.status)}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {track.logisticName}
                  </h2>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      track.status
                    )}`}
                  >
                    {track.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-600 text-sm">Numéro de suivi:</span>
                  <p className="font-mono font-medium">{track.trackingNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Expédition:</span>
                  <p className="font-medium">
                    {track.from} → {track.to}
                  </p>
                </div>
                {track.deliveryDay && (
                  <div>
                    <span className="text-gray-600 text-sm">Jours de livraison:</span>
                    <p className="font-medium">{track.deliveryDay} jours</p>
                  </div>
                )}
                {track.deliveryTime && (
                  <div>
                    <span className="text-gray-600 text-sm">Livré le:</span>
                    <p className="font-medium">{new Date(track.deliveryTime).toLocaleString('fr-FR')}</p>
                  </div>
                )}
              </div>

              {track.lastMileCarrier && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Dernier transporteur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Transporteur:</span>
                      <p className="font-medium">{track.lastMileCarrier}</p>
                    </div>
                    {track.lastTrackNumber && (
                      <div>
                        <span className="text-gray-600 text-sm">Numéro de suivi final:</span>
                        <p className="font-mono font-medium">{track.lastTrackNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune information de suivi disponible
          </h2>
          <p className="text-gray-600">
            Les informations de suivi seront disponibles une fois que votre commande sera
            expédiée.
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => fetchTrackingInfo()}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 inline-flex items-center gap-2"
        >
          <Loader2 className="w-4 h-4" />
          Actualiser
        </button>
      </div>
    </div>
  );
}
