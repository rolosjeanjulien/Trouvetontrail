import { useState, useEffect } from 'react';
import { RaceCard } from '../components/races/RaceCard';
import { RaceFilters } from '../components/races/RaceFilters';
import { racesAPI, favoritesAPI } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function RaceList() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  const loadRaces = async () => {
    setLoading(true);
    try {
      const res = await racesAPI.getAll(filters);
      setRaces(res.data);
    } catch (err) {
      console.error('Error loading races:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (user) {
      try {
        const res = await favoritesAPI.getAll();
        setFavorites(res.data.map(f => f.race.id));
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    }
  };

  useEffect(() => {
    loadRaces();
  }, [filters]);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handleFavoriteChange = async () => {
    await loadFavorites();
  };

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="race-list-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-2">
            TOUTES LES COURSES
          </h1>
          <p className="text-muted-foreground">
            Découvrez l'ensemble des courses de trail en France
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <RaceFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            onSearch={loadRaces}
          />
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6" data-testid="results-count">
            {races.length} course{races.length > 1 ? 's' : ''} trouvée{races.length > 1 ? 's' : ''}
          </p>
        )}

        {/* Race grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : races.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              Aucune course trouvée avec ces critères
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {races.map((race, i) => (
              <div key={race.id} className={`animate-fade-in stagger-${(i % 6) + 1}`}>
                <RaceCard
                  race={race}
                  isFavorite={favorites.includes(race.id)}
                  onFavoriteChange={handleFavoriteChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
