import { useState, useEffect } from 'react';
import { RaceMap } from '../components/map/RaceMap';
import { RaceFilters } from '../components/races/RaceFilters';
import { racesAPI } from '../lib/api';
import { Loader2 } from 'lucide-react';

export default function MapView() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedRace, setSelectedRace] = useState(null);

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

  useEffect(() => {
    loadRaces();
  }, [filters]);

  return (
    <div className="min-h-screen pt-20" data-testid="map-view-page">
      {/* Filters bar */}
      <div className="bg-card border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RaceFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            onSearch={loadRaces}
          />
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: 'calc(100vh - 140px)' }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <RaceMap 
            races={races}
            selectedRace={selectedRace}
            onRaceSelect={setSelectedRace}
            height="100%"
          />
        )}

        {/* Race count overlay */}
        <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-lg">
          <span className="text-sm text-foreground">
            <span className="font-bold text-primary">{races.length}</span> courses affichées
          </span>
        </div>
      </div>
    </div>
  );
}
