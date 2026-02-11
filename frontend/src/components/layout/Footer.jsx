import { Link } from 'react-router-dom';
import { Mountain } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Mountain className="h-6 w-6 text-primary" />
              <span className="font-heading text-lg font-bold">
                TROUVE TON <span className="text-primary">TRAIL</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              La référence des courses de trail en France. Trouvez votre prochaine course, 
              suivez les dates d'inscription et ne manquez plus aucun départ.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-sm uppercase tracking-wide text-foreground mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/races" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Toutes les courses
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Carte
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading text-sm uppercase tracking-wide text-foreground mb-4">
              Informations
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/mentions-legales" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  CGU
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Trouve Ton Trail. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Fait avec ❤️ pour les traileurs
          </p>
        </div>
      </div>
    </footer>
  );
};
