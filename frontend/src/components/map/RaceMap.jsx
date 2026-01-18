import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDate, getDistanceCategory, getRegistrationStatusLabel } from '../../lib/utils';
import { Calendar, Mountain, ExternalLink } from 'lucide-react';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (isUtmb) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="w-8 h-8 rounded-full ${isUtmb ? 'bg-primary' : 'bg-secondary'} border-2 border-white shadow-lg flex items-center justify-center">
        <svg class="w-4 h-4 ${isUtmb ? 'text-primary-foreground' : 'text-foreground'}" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.93 17.07A10 10 0 1117.07 2.93 10 10 0 012.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to fit bounds when races change
const FitBounds = ({ races }) => {
  const map = useMap();
  
  useEffect(() => {
    if (races.length > 0) {
      const bounds = L.latLngBounds(races.map(r => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [races, map]);
  
  return null;
};

export const RaceMap = ({ races, selectedRace, onRaceSelect, height = '600px' }) => {
  const mapRef = useRef(null);

  // France center
  const defaultCenter = [46.603354, 1.888334];
  const defaultZoom = 6;

  return (
    <div className="map-container" style={{ height }} data-testid="race-map">
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
      >
        {/* Dark tile layer - CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <FitBounds races={races} />

        {races.map((race) => {
          const distanceCategory = getDistanceCategory(race.distance_km);
          const statusInfo = getRegistrationStatusLabel(race.registration_status);

          return (
            <Marker
              key={race.id}
              position={[race.latitude, race.longitude]}
              icon={createCustomIcon(race.is_utmb)}
              eventHandlers={{
                click: () => onRaceSelect?.(race),
              }}
            >
              <Popup className="race-popup">
                <div className="min-w-[250px] p-1">
                  {/* Image */}
                  <div className="relative h-32 -mx-1 -mt-1 mb-3 rounded-t-lg overflow-hidden">
                    <img
                      src={race.image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop'}
                      alt={race.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="font-heading text-sm font-bold text-white line-clamp-1">
                        {race.name}
                      </h3>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mb-3">
                    {race.is_utmb && (
                      <Badge className="utmb-badge border text-xs">UTMB</Badge>
                    )}
                    <Badge className={`${distanceCategory.class} border text-xs`}>
                      {race.distance_km} km
                    </Badge>
                    <Badge variant="outline" className={`${statusInfo.class} border text-xs`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(race.race_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mountain className="h-4 w-4 text-primary" />
                      D+ {race.elevation_gain}m
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/races/${race.id}`} className="flex-1">
                      <Button size="sm" className="w-full rounded-lg bg-primary text-primary-foreground text-xs">
                        Voir détails
                      </Button>
                    </Link>
                    {race.website_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => window.open(race.website_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
