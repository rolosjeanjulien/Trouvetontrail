import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { racesAPI, favoritesAPI } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { formatDate, getDistanceCategory, getRegistrationStatusLabel } from '../lib/utils';
import { AdBannerSidebar } from '../components/ads/AdBanner';
import { toast } from 'sonner';
import {
  MapPin, Calendar, Mountain, Clock, Heart, ExternalLink,
  ArrowLeft, Share2, Loader2, Flag, AlertTriangle, CheckCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function RaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    const loadRace = async () => {
      try {
        const res = await racesAPI.getById(id);
        setRace(res.data);

        if (user) {
          const favRes = await favoritesAPI.getAll();
          setIsFavorite(favRes.data.some(f => f.race.id === id));
        }
        
        // Check if already reported (localStorage)
        const reported = localStorage.getItem(`reported_${id}`);
        if (reported) setHasReported(true);
      } catch (err) {
        toast.error('Course non trouvée');
        navigate('/races');
      } finally {
        setLoading(false);
      }
    };
    loadRace();
  }, [id, user, navigate]);

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesAPI.remove(race.id);
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        await favoritesAPI.add(race.id);
        setIsFavorite(true);
        toast.success('Ajouté aux favoris ! Vous serez notifié à l\'ouverture des inscriptions.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: race.name,
        text: `Découvrez ${race.name} - ${race.distance_km}km de trail`,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  const handleReportClosed = async () => {
    setReportLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/races/${race.id}/report-closed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Inscriptions closes signalées par un visiteur' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erreur');
      }
      
      // Mark as reported in localStorage
      localStorage.setItem(`reported_${race.id}`, 'true');
      setHasReported(true);
      
      if (data.auto_closed) {
        toast.success('Les inscriptions ont été automatiquement fermées. Merci !', {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />
        });
        // Refresh race data
        const res = await racesAPI.getById(id);
        setRace(res.data);
      } else {
        toast.success(`Merci ! ${data.report_count}/3 signalement(s). L'équipe va vérifier.`, {
          duration: 5000
        });
      }
      
      setReportDialogOpen(false);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du signalement');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!race) return null;

  const distanceCategory = getDistanceCategory(race.distance_km);
  const statusInfo = getRegistrationStatusLabel(race.registration_status);
  const isOpen = race.registration_status === 'open';

  return (
    <div className="min-h-screen pt-16" data-testid="race-detail-page">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={race.image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop'}
          alt={race.name}
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-full"
            onClick={() => navigate(-1)}
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {race.is_utmb && (
                <Badge className="utmb-badge border">UTMB World Series</Badge>
              )}
              <Badge className={`${distanceCategory.class} border`}>
                {distanceCategory.label} - {race.distance_km} km
              </Badge>
              <Badge variant="outline" className={`${statusInfo.class} border`}>
                {statusInfo.label}
              </Badge>
              {race.auto_closed_by_reports && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 border">
                  Fermé par la communauté
                </Badge>
              )}
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
              {race.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{race.location}, {race.region}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="p-6 bg-card border-border rounded-2xl">
              <h2 className="font-heading text-xl font-bold mb-4">À PROPOS</h2>
              <p className="text-muted-foreground leading-relaxed">
                {race.description}
              </p>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-card border-border rounded-xl text-center">
                <Mountain className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-heading text-2xl font-bold">{race.distance_km}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Kilomètres</div>
              </Card>
              <Card className="p-4 bg-card border-border rounded-xl text-center">
                <div className="h-6 w-6 text-primary mx-auto mb-2 font-bold">D+</div>
                <div className="font-heading text-2xl font-bold">{race.elevation_gain}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Mètres</div>
              </Card>
              <Card className="p-4 bg-card border-border rounded-xl text-center">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-heading text-lg font-bold">{formatDate(race.race_date)}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Date course</div>
              </Card>
              <Card className="p-4 bg-card border-border rounded-xl text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-heading text-lg font-bold">{formatDate(race.registration_open_date)}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Ouv. inscriptions</div>
              </Card>
            </div>

            {/* Location info */}
            <Card className="p-6 bg-card border-border rounded-2xl">
              <h2 className="font-heading text-xl font-bold mb-4">LOCALISATION</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Ville:</strong> {race.location}</p>
                <p><strong className="text-foreground">Département:</strong> {race.department}</p>
                <p><strong className="text-foreground">Région:</strong> {race.region}</p>
              </div>
            </Card>

            {/* Report Box - Visible si inscriptions ouvertes */}
            {isOpen && (
              <Card className="p-6 bg-orange-500/10 border-orange-500/30 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Flag className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                      Les inscriptions sont-elles fermées ?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Si vous savez que les inscriptions à cette course sont closes, signalez-le pour aider 
                      la communauté. Après 3 signalements, le statut sera automatiquement mis à jour.
                    </p>
                    <Button
                      variant="outline"
                      className={`rounded-xl border-orange-500/50 ${
                        hasReported 
                          ? 'bg-orange-500/20 text-orange-300 cursor-not-allowed' 
                          : 'text-orange-400 hover:bg-orange-500/20'
                      }`}
                      onClick={() => !hasReported && setReportDialogOpen(true)}
                      disabled={hasReported}
                      data-testid="report-closed-btn"
                    >
                      {hasReported ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Signalement envoyé
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Signaler inscriptions closes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions card */}
            <Card className="p-6 bg-card border-border rounded-2xl sticky top-24">
              <div className="space-y-4">
                <Button
                  className={`w-full rounded-xl h-12 font-heading font-bold ${
                    isFavorite
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                  data-testid="favorite-btn"
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}
                </Button>

                {race.website_url && (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-12 border-border"
                    onClick={() => window.open(race.website_url, '_blank')}
                    data-testid="website-btn"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Site officiel
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full rounded-xl h-12"
                  onClick={handleShare}
                  data-testid="share-btn"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Partager
                </Button>
              </div>

              {/* Registration info */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-heading text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  Inscriptions
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ouverture</span>
                    <span className="text-foreground">{formatDate(race.registration_open_date)}</span>
                  </div>
                  {race.registration_close_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fermeture</span>
                      <span className="text-foreground">{formatDate(race.registration_close_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Ad Banner - sidebar */}
            <AdBannerSidebar className="mt-6" />
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Signaler inscriptions closes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de signaler que les inscriptions à <strong>{race?.name}</strong> sont 
              closes ou complètes.
              <br /><br />
              • Un email sera envoyé à l'équipe pour vérification
              <br />
              • Après 3 signalements, le statut sera automatiquement mis à jour
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportClosed}
              disabled={reportLoading}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              {reportLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirmer le signalement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
