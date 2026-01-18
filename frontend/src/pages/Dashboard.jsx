import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { favoritesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { RaceCard } from '../components/races/RaceCard';
import { toast } from 'sonner';
import { Heart, Bell, Loader2, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const res = await favoritesAPI.getAll();
      setFavorites(res.data);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotify = async (raceId, currentValue) => {
    try {
      await favoritesAPI.toggleNotify(raceId, !currentValue);
      setFavorites(favorites.map(f => 
        f.favorite.race_id === raceId 
          ? { ...f, favorite: { ...f.favorite, notify_on_registration: !currentValue } }
          : f
      ));
      toast.success(currentValue ? 'Notifications désactivées' : 'Notifications activées');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleRemoveFavorite = async (raceId) => {
    try {
      await favoritesAPI.remove(raceId);
      setFavorites(favorites.filter(f => f.favorite.race_id !== raceId));
      toast.success('Retiré des favoris');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-2">
            MES FAVORIS
          </h1>
          <p className="text-muted-foreground">
            Suivez vos courses et recevez des notifications à l'ouverture des inscriptions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-card border-border rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-heading text-2xl font-bold">{favorites.length}</div>
                <div className="text-sm text-muted-foreground">Courses suivies</div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card border-border rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <div className="font-heading text-2xl font-bold">
                  {favorites.filter(f => f.favorite.notify_on_registration).length}
                </div>
                <div className="text-sm text-muted-foreground">Alertes actives</div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card border-border rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400 font-bold text-lg">!</span>
              </div>
              <div>
                <div className="font-heading text-2xl font-bold">
                  {favorites.filter(f => f.race.registration_status === 'open').length}
                </div>
                <div className="text-sm text-muted-foreground">Inscriptions ouvertes</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Favorites list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <Card className="p-12 bg-card border-border rounded-2xl text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Aucun favori</h2>
            <p className="text-muted-foreground mb-6">
              Commencez à suivre des courses pour être notifié à l'ouverture des inscriptions
            </p>
            <Button 
              onClick={() => navigate('/races')}
              className="rounded-full bg-primary text-primary-foreground"
            >
              Explorer les courses
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((item, i) => (
              <Card 
                key={item.favorite.id} 
                className={`p-4 bg-card border-border rounded-2xl animate-fade-in stagger-${(i % 6) + 1}`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Race image */}
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.race.image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop'}
                      alt={item.race.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Race info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.race.is_utmb && (
                        <Badge className="utmb-badge border text-xs">UTMB</Badge>
                      )}
                      <Badge className="bg-secondary text-foreground border-border text-xs">
                        {item.race.distance_km} km
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          item.race.registration_status === 'open' ? 'status-open' :
                          item.race.registration_status === 'not_open' ? 'status-not-open' : 'status-closed'
                        } border`}
                      >
                        {item.race.registration_status === 'open' ? 'Ouvertes' :
                         item.race.registration_status === 'not_open' ? 'À venir' : 'Fermées'}
                      </Badge>
                    </div>
                    <h3 
                      className="font-heading text-lg font-bold cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/races/${item.race.id}`)}
                    >
                      {item.race.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.race.location}, {item.race.region}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center gap-4 md:gap-3 justify-between md:justify-start">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.favorite.notify_on_registration}
                        onCheckedChange={() => handleToggleNotify(item.favorite.race_id, item.favorite.notify_on_registration)}
                        data-testid={`notify-switch-${item.race.id}`}
                      />
                      <span className="text-xs text-muted-foreground hidden md:inline">
                        {item.favorite.notify_on_registration ? 'Alerte ON' : 'Alerte OFF'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveFavorite(item.favorite.race_id)}
                      data-testid={`remove-favorite-${item.race.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
