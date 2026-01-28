import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { adminAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { formatDate, getDistanceCategory } from '../lib/utils';
import {
  Shield, Check, X, Loader2, MapPin, Calendar, Mountain,
  ExternalLink, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingRaces, setPendingRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, raceId: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadPendingRaces();
    }
  }, [isAdmin]);

  const loadPendingRaces = async () => {
    try {
      const res = await adminAPI.getPending();
      setPendingRaces(res.data);
    } catch (err) {
      console.error('Error loading pending races:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (raceId) => {
    setActionLoading(raceId);
    try {
      await adminAPI.moderate(raceId, 'approve');
      setPendingRaces(pendingRaces.filter(r => r.id !== raceId));
      toast.success('Course approuvée !');
    } catch (err) {
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.raceId) return;
    
    setActionLoading(rejectDialog.raceId);
    try {
      await adminAPI.moderate(rejectDialog.raceId, 'reject', rejectReason);
      setPendingRaces(pendingRaces.filter(r => r.id !== rejectDialog.raceId));
      toast.success('Course rejetée');
      setRejectDialog({ open: false, raceId: null });
      setRejectReason('');
    } catch (err) {
      toast.error('Erreur lors du rejet');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="admin-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              ADMINISTRATION
            </h1>
            <p className="text-muted-foreground">
              Modération des courses soumises
            </p>
          </div>
        </div>

        {/* Stats */}
        <Card className="p-6 bg-card border-border rounded-2xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-400" />
              <span className="text-lg">
                <span className="font-bold text-foreground">{pendingRaces.length}</span>{' '}
                <span className="text-muted-foreground">course(s) en attente de modération</span>
              </span>
            </div>
          </div>
        </Card>

        {/* Pending races */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pendingRaces.length === 0 ? (
          <Card className="p-12 bg-card border-border rounded-2xl text-center">
            <Check className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Tout est à jour !</h2>
            <p className="text-muted-foreground">
              Aucune course en attente de modération
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRaces.map((race, i) => {
              const distanceCategory = getDistanceCategory(race.distance_km);
              
              return (
                <Card 
                  key={race.id} 
                  className={`p-6 bg-card border-border rounded-2xl animate-fade-in stagger-${(i % 6) + 1}`}
                  data-testid={`pending-race-${race.id}`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full lg:w-64 h-48 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={race.image_url || 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop'}
                        alt={race.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                          En attente
                        </Badge>
                        {race.is_utmb && (
                          <Badge className="utmb-badge border">UTMB</Badge>
                        )}
                        <Badge className={`${distanceCategory.class} border`}>
                          {race.distance_km} km
                        </Badge>
                      </div>

                      <h3 className="font-heading text-xl font-bold mb-2">{race.name}</h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {race.description}
                      </p>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          {race.location}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          {formatDate(race.race_date)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mountain className="h-4 w-4 text-primary" />
                          D+ {race.elevation_gain}m
                        </div>
                        {race.website_url && (
                          <a 
                            href={race.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Site web
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3 lg:justify-center">
                      <Button
                        className="flex-1 lg:flex-none rounded-xl bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(race.id)}
                        disabled={actionLoading === race.id}
                        data-testid={`approve-btn-${race.id}`}
                      >
                        {actionLoading === race.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Approuver
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 lg:flex-none rounded-xl border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => setRejectDialog({ open: true, raceId: race.id })}
                        disabled={actionLoading === race.id}
                        data-testid={`reject-btn-${race.id}`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, raceId: open ? rejectDialog.raceId : null })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">Rejeter la course</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet (optionnel)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Informations manquantes, doublon, etc."
            rows={3}
            className="bg-background"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, raceId: null })}>
              Annuler
            </Button>
            <Button 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleReject}
              disabled={actionLoading === rejectDialog.raceId}
            >
              {actionLoading === rejectDialog.raceId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirmer le rejet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
