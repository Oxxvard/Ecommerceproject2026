'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    maxUses: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    applicableCategories: [] as string[],
    applicableProducts: [] as string[],
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && (session.user as any)?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadCoupon();
      loadCategoriesAndProducts();
    }
  }, [status, resolvedParams.id]);

  const loadCoupon = async () => {
    try {
      const res = await fetch(`/api/admin/coupons/${resolvedParams.id}`);
      if (!res.ok) throw new Error('Erreur lors du chargement du coupon');
      const coupon = await res.json();
      
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase || 0,
        maxDiscount: coupon.maxDiscount || 0,
        maxUses: coupon.maxUses || 0,
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
        isActive: coupon.isActive,
        applicableCategories: coupon.applicableCategories?.map((c: any) => c._id || c) || [],
        applicableProducts: coupon.applicableProducts?.map((p: any) => p._id || p) || [],
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadCategoriesAndProducts = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products?limit=1000'),
      ]);
      const cats = await catRes.json();
      const prods = await prodRes.json();
      setCategories(cats);
      setProducts(prods.products || prods);
    } catch (_err) {
      console.error('Erreur chargement catégories/produits:', _err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        applicableCategories: formData.applicableCategories.length ? formData.applicableCategories : null,
        applicableProducts: formData.applicableProducts.length ? formData.applicableProducts : null,
      };

      const res = await fetch(`/api/admin/coupons/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erreur lors de la mise à jour');
      }

      router.push('/admin/coupons');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Modifier le Coupon</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code du Coupon *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full border rounded-lg px-4 py-2"
                required
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Le code ne peut pas être modifié</p>
            </div>

            {/* Type et Valeur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Réduction *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant Fixe (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur *
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-2"
                  min="0"
                  max={formData.type === 'percentage' ? 100 : undefined}
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Restrictions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achat Minimum (€)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-4 py-2"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réduction Max (€)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-4 py-2"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Uniquement pour les coupons en pourcentage
                </p>
              </div>
            </div>

            {/* Utilisations max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisations Maximum
              </label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg px-4 py-2"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laisser à 0 pour illimité
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>

            {/* Catégories applicables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories Applicables
              </label>
              <select
                multiple
                value={formData.applicableCategories}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFormData({ ...formData, applicableCategories: selected });
                }}
                className="w-full border rounded-lg px-4 py-2 h-32"
              >
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Laisser vide pour toutes les catégories. Maintenir Ctrl/Cmd pour sélections multiples.
              </p>
            </div>

            {/* Produits applicables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produits Applicables
              </label>
              <select
                multiple
                value={formData.applicableProducts}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFormData({ ...formData, applicableProducts: selected });
                }}
                className="w-full border rounded-lg px-4 py-2 h-32"
              >
                {products.map((prod: any) => (
                  <option key={prod._id} value={prod._id}>
                    {prod.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Laisser vide pour tous les produits. Maintenir Ctrl/Cmd pour sélections multiples.
              </p>
            </div>

            {/* Actif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Coupon actif
              </label>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/coupons')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
