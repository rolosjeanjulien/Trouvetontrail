import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { X, Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in"
      data-testid="cookie-banner"
    >
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-4 sm:p-6 border border-border shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon */}
            <div className="hidden sm:flex h-12 w-12 rounded-xl bg-primary/20 items-center justify-center flex-shrink-0">
              <Cookie className="h-6 w-6 text-primary" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-sm text-foreground">
                <strong>Cookies essentiels uniquement.</strong>{' '}
                <span className="text-muted-foreground">
                  Nous utilisons uniquement des cookies nécessaires au fonctionnement du site 
                  (authentification, préférences). Aucun tracking publicitaire.{' '}
                  <Link to="/confidentialite" className="text-primary hover:underline">
                    En savoir plus
                  </Link>
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecline}
                className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground"
                data-testid="cookie-decline"
              >
                Refuser
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                data-testid="cookie-accept"
              >
                Accepter
              </Button>
            </div>

            {/* Close button */}
            <button
              onClick={handleDecline}
              className="absolute top-2 right-2 sm:hidden p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
