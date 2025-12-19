export function generateProductJsonLd(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'MaisonLuxe',
    },
    offers: {
      '@type': 'Offer',
      url: `https://maisonluxe.com/products/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.price,
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MaisonLuxe',
    url: 'https://maisonluxe.com',
    logo: 'https://maisonluxe.com/logo.png',
    description: 'Boutique de luxe en ligne proposant des produits haut de gamme',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@maisonluxe.com',
    },
  }
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
