import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { RaceCard } from '../components/races/RaceCard';
import { racesAPI, seedAPI, favoritesAPI } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Mountain, Map, Calendar, ArrowRight, TrendingUp } from 'lucide-react';

export default function Home() {
  const [featuredRaces, setFeaturedRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to seed if empty
        await seedAPI.seed().catch(() => {});
        
        // Load races
        const res = await racesAPI.getAll({ registration_status: 'open' });
        setFeaturedRaces(res.data.slice(0, 6));
        
        // Load favorites if logged in
        if (user) {
          const favRes = await favoritesAPI.getAll();
          setFavorites(favRes.data.map(f => f.race.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const stats = [
    { icon: Mountain, value: '500+', label: 'Courses en France' },
    { icon: Map, value: '13', label: 'Régions couvertes' },
    { icon: Calendar, value: '2025', label: 'Calendrier à jour' },
    { icon: TrendingUp, value: '10k+', label: 'Coureurs actifs' },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2074&auto=format&fit=crop"
            alt="Trail runner on mountain"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="accent-glow absolute inset-0" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1.5">
            La référence des trails en France
          </Badge>
          
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
            TROUVEZ VOTRE
            <span className="block text-primary">PROCHAIN DÉFI</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Découvrez l'ensemble des courses de trail en France, suivez les dates d'ouverture des inscriptions 
            et ne manquez plus jamais une course.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 font-heading font-bold tracking-wide uppercase text-lg"
              onClick={() => navigate('/races')}
              data-testid="explore-races-btn"
            >
              Explorer les courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full px-8 py-6 font-heading font-semibold tracking-wide uppercase border-white/20 hover:bg-white/10"
              onClick={() => navigate('/map')}
              data-testid="view-map-btn"
            >
              <Map className="mr-2 h-5 w-5" />
              Voir la carte
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className={`text-center animate-fade-in stagger-${i + 1}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="font-heading text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Races Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge className="mb-4 bg-secondary text-foreground border-border">Inscriptions ouvertes</Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                COURSES À LA UNE
              </h2>
            </div>
            <Link to="/races">
              <Button variant="ghost" className="text-primary hover:text-primary/80 gap-2" data-testid="see-all-races-btn">
                Voir toutes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loader" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRaces.map((race, i) => (
                <div key={race.id} className={`animate-fade-in stagger-${i + 1}`}>
                  <RaceCard 
                    race={race} 
                    isFavorite={favorites.includes(race.id)}
                    onFavoriteChange={() => {
                      if (favorites.includes(race.id)) {
                        setFavorites(favorites.filter(id => id !== race.id));
                      } else {
                        setFavorites([...favorites, race.id]);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
            NE MANQUEZ PLUS AUCUNE INSCRIPTION
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Créez votre compte et suivez vos courses favorites. Recevez une notification 
            dès que les inscriptions ouvrent.
          </p>
          {!user && (
            <Link to="/register">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 font-heading font-bold tracking-wide uppercase text-lg"
                data-testid="cta-register-btn"
              >
                Créer mon compte gratuit
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-primary" />
              <span className="font-heading text-lg font-bold">
                TRAIL<span className="text-primary">FRANCE</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 TrailFrance. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
