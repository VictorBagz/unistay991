import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'UniStay - Your Ultimate Student Housing Platform',
  description = 'Find the perfect student accommodation, connect with roommates, discover campus jobs, and stay updated with university news.',
  keywords = 'student housing, university accommodation, roommate finder, campus jobs, student life',
  image = '/images/unistayLogo.png',
  url = 'https://unistay-navigator.com',
}) => {
  React.useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const metaTags = {
      'description': description,
      'keywords': keywords,
      'og:type': 'website',
      'og:url': url,
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'twitter:card': 'summary_large_image',
      'twitter:url': url,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'theme-color': '#001F3F'
    };

    // Update existing meta tags or create new ones
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`) ||
                 document.querySelector(`meta[property="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });

    // Update favicon links
    const faviconSizes = {
      'favicon-32x32.png': '32x32',
      'favicon-16x16.png': '16x16',
      'apple-touch-icon.png': '180x180'
    };

    Object.entries(faviconSizes).forEach(([file, size]) => {
      const rel = file.includes('apple') ? 'apple-touch-icon' : 'icon';
      let link = document.querySelector(`link[rel="${rel}"][sizes="${size}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link') as HTMLLinkElement;
        link.setAttribute('rel', rel);
        link.setAttribute('sizes', size);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', `/${file}`);
    });

    // Add manifest
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link') as HTMLLinkElement;
      manifestLink.setAttribute('rel', 'manifest');
      manifestLink.setAttribute('href', '/manifest.json');
      document.head.appendChild(manifestLink);
    }
  }, [title, description, keywords, image, url]);

  return null;
};

export default SEO;