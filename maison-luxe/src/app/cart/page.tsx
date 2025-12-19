'use client';

import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
          <Link
            href="/produits"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-gray-600">{item.price.toFixed(2)} €</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="font-semibold text-gray-900 w-24 text-right">
                  {(item.price * item.quantity).toFixed(2)} €
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={clearCart}
            className="mt-4 text-red-600 hover:text-red-700 font-medium"
          >
            Vider le panier
          </button>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="text-sm">Calculée au checkout</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-md hover:bg-gray-800 font-semibold"
            >
              Passer la commande
            </Link>

            <Link
              href="/produits"
              className="block w-full text-center text-gray-700 hover:text-gray-900 mt-4"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
