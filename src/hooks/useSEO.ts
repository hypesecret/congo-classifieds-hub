import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
}

export const useSEO = ({ title, description, ogImage, ogUrl, canonical }: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }

    setMeta('og:title', title, true);
    setMeta('twitter:title', title);

    if (ogImage) {
      setMeta('og:image', ogImage, true);
      setMeta('twitter:image', ogImage);
    }

    if (ogUrl) {
      setMeta('og:url', ogUrl, true);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, ogImage, ogUrl, canonical]);
};
