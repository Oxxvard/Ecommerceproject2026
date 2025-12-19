import { MetadataRoute } from 'next'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://maisonluxe.com'

  try {
    await dbConnect()

    // Récupérer tous les produits
    const products = await Product.find({}, 'slug updatedAt').lean()
    
    // Récupérer toutes les catégories
    const categories = await Category.find({}, 'slug updatedAt').lean()

    // Pages statiques
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/produits`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    // Pages produits
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...productPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Retourner au moins les pages statiques en cas d'erreur
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
