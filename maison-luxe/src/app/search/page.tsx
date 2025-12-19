'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Search, Loader2 } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query || query.trim().length < 2) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Résultats de recherche</h1>
          </div>
          {query && (
            <p className="text-xl text-gray-300">
              pour &quot;<span className="font-semibold">{query}</span>&quot;
            </p>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-gray-900 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Recherche en cours...</p>
          </div>
        ) : !query || query.trim().length < 2 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Commencez votre recherche
            </h2>
            <p className="text-gray-600">
              Entrez au moins 2 caractères pour rechercher des produits
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h2>
            <p className="text-gray-600 mb-6">
              Essayez avec d&apos;autres mots-clés ou parcourez nos catégories
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600 text-lg">
                <span className="font-semibold text-gray-900">{products.length}</span>{' '}
                produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
