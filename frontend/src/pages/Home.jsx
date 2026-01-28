import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { RaceCard } from '../components/races/RaceCard';
import { racesAPI, seedAPI, favoritesAPI } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { FRANCE_REGIONS, formatDate, getDistanceCategory } from '../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Mountain, Map, Calendar, ArrowRight, TrendingUp, Search, 
  MapPin, Loader2, Sparkles
} from 'lucide-react';

export default function Home() {
  const [featuredRaces, setFeaturedRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [searchRegion, setSearchRegion] = useState('');
  const [searchDistance, setSearchDistance] = useState('');
  const [searchElevation, setSearchElevation] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to seed if empty
        await seedAPI.seed().catch(() => {});
        
        // Load races with open registration
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

  const handleSearch = async () => {
    setSearching(true);
    setSearchResult(null);
    
    try {
      // Build filters
      const params = { registration_status: 'open' };
      
      if (searchRegion) {
        params.region = searchRegion;
      }
      
      if (searchDistance) {
        const [min, max] = searchDistance.split('-').map(Number);
        if (min) params.min_distance = min;
        if (max) params.max_distance = max;
      }
      
      const res = await racesAPI.getAll(params);
      let races = res.data;
      
      // Filter by elevation if specified
      if (searchElevation && races.length > 0) {
        const [minElev, maxElev] = searchElevation.split('-').map(Number);
        races = races.filter(r => {
          if (minElev && r.elevation_gain < minElev) return false;
          if (maxElev && r.elevation_gain > maxElev) return false;
          return true;
        });
      }
      
      // Get the first race (sorted by date)
      if (races.length > 0) {
        setSearchResult({ race: races[0], total: races.length });
      } else {
        setSearchResult({ race: null, total: 0 });
      }
    } catch (err) {
      console.error(err);
      setSearchResult({ race: null, total: 0, error: true });
    } finally {
      setSearching(false);
    }
  };

  const stats = [
    { icon: Mountain, value: '500+', label: 'Courses en France' },
    { icon: Map, value: '13', label: 'Régions couvertes' },
    { icon: Calendar, value: '2025', label: 'Calendrier à jour' },
    { icon: TrendingUp, value: '10k+', label: 'Coureurs actifs' },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
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

          {/* Search Box */}
          <Card className="max-w-4xl mx-auto p-6 bg-card/90 backdrop-blur-xl border-border rounded-2xl mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-lg font-bold">TROUVEZ VOTRE PROCHAIN TRAIL</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Region */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Région</label>
                <Select value={searchRegion} onValueChange={setSearchRegion}>
                  <SelectTrigger className="h-12 bg-background border-border rounded-xl" data-testid="search-region">
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {FRANCE_REGIONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Distance</label>
                <Select value={searchDistance} onValueChange={setSearchDistance}>
                  <SelectTrigger className="h-12 bg-background border-border rounded-xl" data-testid="search-distance">
                    <SelectValue placeholder="Toutes distances" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes distances</SelectItem>
                    <SelectItem value="0-30">Court (&lt; 30 km)</SelectItem>
                    <SelectItem value="30-60">Moyen (30-60 km)</SelectItem>
                    <SelectItem value="60-100">Long (60-100 km)</SelectItem>
                    <SelectItem value="100-500">Ultra (&gt; 100 km)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Elevation */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Dénivelé</label>
                <Select value={searchElevation} onValueChange={setSearchElevation}>
                  <SelectTrigger className="h-12 bg-background border-border rounded-xl" data-testid="search-elevation">
                    <SelectValue placeholder="Tous dénivelés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous dénivelés</SelectItem>
                    <SelectItem value="0-1000">Facile (&lt; 1000 D+)</SelectItem>
                    <SelectItem value="1000-2500">Modéré (1000-2500 D+)</SelectItem>
                    <SelectItem value="2500-5000">Difficile (2500-5000 D+)</SelectItem>
                    <SelectItem value="5000-20000">Extrême (&gt; 5000 D+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSearch}
              disabled={searching}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-heading font-bold"
              data-testid="search-submit-btn"
            >
              {searching ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              Trouver mon trail
            </Button>

            {/* Search Result */}
            {searchResult && (
              <div className="mt-6 animate-fade-in">
                {searchResult.race ? (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-medium">
                        Prochain trail disponible ({searchResult.total} course{searchResult.total > 1 ? 's' : ''} trouvée{searchResult.total > 1 ? 's' : ''})
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Race image */}
                      <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={searchResult.race.image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop'}
                          alt={searchResult.race.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Race info */}
                      <div className="flex-1 text-left">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {searchResult.race.is_utmb && (
                            <Badge className="utmb-badge border text-xs">UTMB</Badge>
                          )}
                          <Badge className={`${getDistanceCategory(searchResult.race.distance_km).class} border text-xs`}>
                            {searchResult.race.distance_km} km
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border text-xs">
                            Inscriptions ouvertes
                          </Badge>
                        </div>
                        <h4 className="font-heading text-lg font-bold text-foreground mb-1">
                          {searchResult.race.name}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {searchResult.race.location}, {searchResult.race.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(searchResult.race.race_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mountain className="h-3.5 w-3.5" />
                            D+ {searchResult.race.elevation_gain}m
                          </span>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="flex items-center">
                        <Button
                          onClick={() => navigate(`/races/${searchResult.race.id}`)}
                          className="rounded-xl bg-primary text-primary-foreground"
                          data-testid="view-result-btn"
                        >
                          Voir
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-secondary/50 border border-border rounded-xl text-center">
                    <p className="text-muted-foreground">
                      Aucune course avec inscriptions ouvertes ne correspond à vos critères.
                    </p>
                    <Button
                      variant="link"
                      className="text-primary mt-2"
                      onClick={() => navigate('/races')}
                    >
                      Voir toutes les courses
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full px-8 py-6 font-heading font-semibold tracking-wide uppercase border-white/20 hover:bg-white/10"
              onClick={() => navigate('/races')}
              data-testid="explore-races-btn"
            >
              Voir toutes les courses
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
