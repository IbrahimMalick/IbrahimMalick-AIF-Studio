import { useEffect } from "react";

export default function SEOHead({ 
  title, 
  description, 
  image,
  url,
  type = "website",
  keywords = []
}) {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = `${title} | AIFreedomDuane`;
    }

    // Set meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic SEO
    updateMetaTag('description', description);
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Open Graph
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url || window.location.href, true);
    updateMetaTag('og:type', type, true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

  }, [title, description, image, url, type, keywords]);

  return null;
}

export function generateStructuredData(type, data) {
  const schemas = {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "AIFreedomDuane",
      "url": "https://aifreedomduane.com",
      "logo": data.logo,
      "sameAs": data.socialLinks || []
    },
    article: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.title,
      "description": data.description,
      "image": data.image,
      "author": {
        "@type": "Person",
        "name": data.author
      },
      "datePublished": data.publishedDate,
      "dateModified": data.modifiedDate
    },
    product: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": data.name,
      "description": data.description,
      "image": data.image,
      "offers": {
        "@type": "Offer",
        "price": data.price,
        "priceCurrency": "USD"
      }
    }
  };

  return schemas[type] || null;
}