import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Calendar, Mountain, Heart, ExternalLink } from 'lucide-react';
import { formatDate, getDistanceCategory, getRegistrationStatusLabel } from '../../lib/utils';
import { useAuth } from '../../lib/auth-context';
import { favoritesAPI } from '../../lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

export const RaceCard = ({ race, isFavorite = false, onFavoriteChange }) => {
  const { user } = useAuth();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const distanceCategory = getDistanceCategory(race.distance_km);
  const statusInfo = getRegistrationStatusLabel(race.registration_status);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesAPI.remove(race.id);
        toast.success('Retiré des favoris');
      } else {
        await favoritesAPI.add(race.id);
        toast.success('Ajouté aux favoris');
      }
      onFavoriteChange?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Link to={`/races/${race.id}`} data-testid={`race-card-${race.id}`}>
      <Card className="race-card group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={race.image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop'}
            alt={race.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {race.is_utmb && (
              <Badge className="utmb-badge border text-xs font-semibold">UTMB</Badge>
            )}
            <Badge className={`${distanceCategory.class} border text-xs font-semibold`}>
              {race.distance_km} km
            </Badge>
          </div>

          {/* Favorite button */}
          {user && (
            <button
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
              className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-black/50 text-white hover:bg-primary hover:text-primary-foreground'
              }`}
              data-testid={`favorite-btn-${race.id}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground line-clamp-1 mb-1">
              {race.name}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{race.location}, {race.department}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{formatDate(race.race_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mountain className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">D+ {race.elevation_gain}m</span>
            </div>
          </div>

          {/* Registration status */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Badge variant="outline" className={`${statusInfo.class} border text-xs`}>
              {statusInfo.label}
            </Badge>
            {race.website_url && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(race.website_url, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
