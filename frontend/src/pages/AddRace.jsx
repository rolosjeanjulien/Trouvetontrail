import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { racesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { FRANCE_REGIONS } from '../lib/utils';
import { ArrowLeft, Loader2, MapPin, Calendar, Mountain } from 'lucide-react';

export default function AddRace() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    region: '',
    department: '',
    latitude: '',
    longitude: '',
    distance_km: '',
    elevation_gain: '',
    race_date: '',
    registration_open_date: '',
    registration_close_date: '',
    is_utmb: false,
    website_url: '',
    image_url: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        distance_km: parseFloat(formData.distance_km),
        elevation_gain: parseInt(formData.elevation_gain),
        registration_close_date: formData.registration_close_date || null,
        website_url: formData.website_url || null,
        image_url: formData.image_url || null,
      };

      await racesAPI.create(data);
      
      if (user.role === 'admin') {
        toast.success('Course ajoutée avec succès !');
      } else {
        toast.success('Course soumise ! Elle sera visible après modération.');
      }
      navigate('/races');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="add-race-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card className="p-8 bg-card border-border rounded-2xl">
          <h1 className="font-heading text-2xl font-bold mb-2">AJOUTER UNE COURSE</h1>
          <p className="text-muted-foreground mb-8">
            {user.role === 'admin' 
              ? 'Cette course sera publiée directement.' 
              : 'Cette course sera soumise à modération avant publication.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                <Mountain className="h-5 w-5 text-primary" />
                Informations générales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">Nom de la course *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="UTMB Mont-Blanc"
                    required
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-name-input"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Décrivez la course, son parcours, ses particularités..."
                    required
                    rows={4}
                    className="bg-background rounded-xl"
                    data-testid="race-description-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance_km">Distance (km) *</Label>
                  <Input
                    id="distance_km"
                    type="number"
                    value={formData.distance_km}
                    onChange={(e) => handleChange('distance_km', e.target.value)}
                    placeholder="100"
                    required
                    min="1"
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-distance-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elevation_gain">Dénivelé positif (m) *</Label>
                  <Input
                    id="elevation_gain"
                    type="number"
                    value={formData.elevation_gain}
                    onChange={(e) => handleChange('elevation_gain', e.target.value)}
                    placeholder="5000"
                    required
                    min="0"
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-elevation-input"
                  />
                </div>

                <div className="flex items-center gap-3 md:col-span-2">
                  <Switch
                    id="is_utmb"
                    checked={formData.is_utmb}
                    onCheckedChange={(v) => handleChange('is_utmb', v)}
                    data-testid="race-utmb-switch"
                  />
                  <Label htmlFor="is_utmb" className="cursor-pointer">
                    Course UTMB World Series
                  </Label>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localisation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Ville / Lieu *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Chamonix"
                    required
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-location-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Département *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Haute-Savoie"
                    required
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-department-input"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <Select value={formData.region} onValueChange={(v) => handleChange('region', v)} required>
                    <SelectTrigger className="h-12 bg-background rounded-xl" data-testid="race-region-select">
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {FRANCE_REGIONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    placeholder="45.9237"
                    required
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-latitude-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    placeholder="6.8694"
                    required
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-longitude-input"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Dates
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="race_date">Date de la course *</Label>
                  <Input
                    id="race_date"
                    type="date"
                    value={formData.race_date}
                    onChange={(e) => handleChange('race_date', e.target.value)}
                    required
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-date-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_open_date">Ouverture inscriptions *</Label>
                  <Input
                    id="registration_open_date"
                    type="date"
                    value={formData.registration_open_date}
                    onChange={(e) => handleChange('registration_open_date', e.target.value)}
                    required
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-reg-open-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_close_date">Fermeture inscriptions</Label>
                  <Input
                    id="registration_close_date"
                    type="date"
                    value={formData.registration_close_date}
                    onChange={(e) => handleChange('registration_close_date', e.target.value)}
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-reg-close-input"
                  />
                </div>
              </div>
            </div>

            {/* Optional */}
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-bold">Optionnel</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_url">Site web officiel</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    placeholder="https://example.com"
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-website-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-12 bg-background rounded-xl"
                    data-testid="race-image-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-heading font-bold"
                data-testid="submit-race-btn"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Soumettre'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
