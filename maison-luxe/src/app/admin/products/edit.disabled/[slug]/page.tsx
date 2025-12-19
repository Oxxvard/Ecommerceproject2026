'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    costPrice: '',
    compareAtPrice: '',
    category: '',
    stock: '',
    featured: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [slug]);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchProduct() {
    try {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) {
        throw new Error('Produit non trouvé');
      }
      const data = await response.json();
      setProduct(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price.toString(),
        costPrice: data.costPrice.toString(),
        compareAtPrice: data.compareAtPrice?.toString() || '',
        category: typeof data.category === 'object' ? data.category._id : data.category,
        stock: data.stock.toString(),
        featured: data.featured,
      });
      setImages(data.images.length > 0 ? data.images : ['']);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(error.message || 'Erreur lors du chargement du produit');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, name: value, slug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const validImages = images.filter(img => img.trim() !== '');
      
      if (validImages.length === 0) {
        toast.error('Ajoutez au moins une image');
        setSaving(false);
        return;
      }

      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        images: validImages,
        category: formData.category,
        stock: parseInt(formData.stock),
        featured: formData.featured,
      };

      const response = await fetch(`/api/products/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour');
      }

      toast.success('Produit mis à jour avec succès !');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du produit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/products/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      toast.success('Produit supprimé avec succès !');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Erreur lors de la suppression du produit');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/products"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux produits
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Modifier le produit
            </h1>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Montre de luxe en or"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                placeholder="montre-de-luxe-en-or"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Description détaillée du produit..."
              />
            </div>

            {/* Prix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix de vente (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="99.99"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix d'achat (€) *
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="50.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix comparé (€)
                </label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="149.99"
                />
              </div>
            </div>

            {/* Catégorie et Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Images (URLs) *
              </label>
              <div className="space-y-3">
                {images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="inline-flex items-center px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter une image
                </button>
              </div>
            </div>

            {/* Produit vedette */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="featured" className="ml-3 text-sm font-medium text-gray-700">
                Produit vedette (apparaît sur la page d'accueil)
              </label>
            </div>

            {/* Boutons */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="luxury-gradient text-white px-8 py-3 rounded-xl font-semibold hover:shadow-accent transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <Link
                href="/admin/products"
                className="px-8 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
