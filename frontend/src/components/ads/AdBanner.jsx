import { useEffect, useRef } from 'react';

/**
 * Composant AdBanner pour Google AdSense
 * 
 * Pour activer les vraies pubs :
 * 1. Créer un compte Google AdSense
 * 2. Ajouter le script AdSense dans public/index.html :
 *    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>
 * 3. Remplacer data-ad-client et data-ad-slot par vos valeurs
 * 4. Passer isPlaceholder={false} au composant
 */

const AD_SIZES = {
  // Bannière horizontale large (728x90)
  leaderboard: { width: 728, height: 90, label: 'Leaderboard' },
  // Bannière mobile (320x50)
  mobileBanner: { width: 320, height: 50, label: 'Mobile Banner' },
  // Rectangle moyen (300x250)
  mediumRectangle: { width: 300, height: 250, label: 'Rectangle' },
  // Rectangle large (336x280)
  largeRectangle: { width: 336, height: 280, label: 'Large Rectangle' },
  // Skyscraper (160x600)
  skyscraper: { width: 160, height: 600, label: 'Skyscraper' },
  // Responsive (auto)
  responsive: { width: '100%', height: 'auto', label: 'Responsive' },
};

export const AdBanner = ({ 
  size = 'responsive',
  slot = '',
  client = '',
  isPlaceholder = true,
  className = '',
}) => {
  const adRef = useRef(null);
  const adConfig = AD_SIZES[size] || AD_SIZES.responsive;

  useEffect(() => {
    // Push ad when component mounts (for real AdSense)
    if (!isPlaceholder && window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [isPlaceholder]);

  // Placeholder mode - shows a subtle placeholder
  if (isPlaceholder) {
    return (
      <div 
        className={`ad-placeholder ${className}`}
        style={{
          width: typeof adConfig.width === 'number' ? `${adConfig.width}px` : adConfig.width,
          maxWidth: '100%',
          height: typeof adConfig.height === 'number' ? `${adConfig.height}px` : '90px',
          minHeight: '50px',
        }}
      >
        <div className="w-full h-full rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-center overflow-hidden">
          <div className="text-center px-4">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">
              Publicité
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Real AdSense mode
  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: typeof adConfig.width === 'number' ? `${adConfig.width}px` : adConfig.width,
          height: typeof adConfig.height === 'number' ? `${adConfig.height}px` : adConfig.height,
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={size === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={size === 'responsive' ? 'true' : undefined}
      />
    </div>
  );
};

/**
 * Bannière publicitaire horizontale pour le contenu
 * Idéale entre les sections ou en bas de page
 */
export const AdBannerHorizontal = ({ className = '' }) => (
  <div className={`w-full flex justify-center py-4 ${className}`}>
    <div className="hidden md:block">
      <AdBanner size="leaderboard" />
    </div>
    <div className="md:hidden">
      <AdBanner size="mobileBanner" />
    </div>
  </div>
);

/**
 * Rectangle publicitaire pour les sidebars
 */
export const AdBannerSidebar = ({ className = '' }) => (
  <div className={`flex justify-center ${className}`}>
    <AdBanner size="mediumRectangle" />
  </div>
);

/**
 * Bannière in-feed pour les listes
 * S'insère de manière native entre les éléments
 */
export const AdBannerInFeed = ({ className = '' }) => (
  <div className={`w-full p-4 ${className}`}>
    <AdBanner size="responsive" />
  </div>
);
