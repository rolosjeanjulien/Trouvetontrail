import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { adminAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { formatDate, getDistanceCategory } from '../lib/utils';
import {
  Shield, Check, X, Loader2, MapPin, Calendar, Mountain,
  ExternalLink, AlertCircle, FileSpreadsheet, Flag, Bell
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingRaces, setPendingRaces] = useState([]);
  const [reports, setReports] = useState([]);
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
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      const [racesRes, reportsRes] = await Promise.all([
        adminAPI.getPending(),
        fetchReports()
      ]);
      setPendingRaces(racesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
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

  const handleValidateReport = async (raceId) => {
    setActionLoading(`report-${raceId}`);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/reports/${raceId}/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur');
      
      setReports(reports.filter(r => r.race_id !== raceId));
      toast.success('Inscriptions marquées comme fermées');
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReport = async (raceId) => {
    setActionLoading(`report-reject-${raceId}`);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/reports/${raceId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur');
      
      setReports(reports.filter(r => r.race_id !== raceId));
      toast.success('Signalements rejetés');
    } catch (err) {
      toast.error('Erreur');
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
              Modération des courses et signalements
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-card border-border rounded-2xl mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">
                  <span className="font-bold">{pendingRaces.length}</span> course(s) en attente
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-orange-400" />
                <span className="text-sm">
                  <span className="font-bold">{reports.length}</span> signalement(s)
                </span>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/admin/import')}
              className="gap-2 rounded-xl bg-primary text-primary-foreground"
              data-testid="import-btn"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importer des courses
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-primary/20">
              <Flag className="h-4 w-4" />
              Signalements ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-primary/20">
              <Bell className="h-4 w-4" />
              Courses en attente ({pendingRaces.length})
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <Card className="p-12 bg-card border-border rounded-2xl text-center">
                <Flag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-heading text-xl font-bold mb-2">Aucun signalement</h2>
                <p className="text-muted-foreground">
                  Les signalements d'inscriptions closes apparaîtront ici
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report, i) => (
                  <Card 
                    key={report.race_id} 
                    className={`p-6 bg-card border-border rounded-2xl ${
                      report.count >= 3 ? 'border-orange-500/50' : ''
                    }`}
                    data-testid={`report-${report.race_id}`}
                  >
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${
                            report.count >= 3 
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          } border`}>
                            {report.count}/3 signalements
                          </Badge>
                          {report.count >= 3 && (
                            <Badge className="bg-orange-500 text-white">
                              Validation auto imminente
                            </Badge>
                          )}
                        </div>
                        <h3 
                          className="font-heading text-lg font-bold cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/races/${report.race_id}`)}
                        >
                          {report.race_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dernier signalement : {formatDate(report.reports[0]?.created_at)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => handleValidateReport(report.race_id)}
                          disabled={actionLoading === `report-${report.race_id}`}
                        >
                          {actionLoading === `report-${report.race_id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Fermer inscriptions
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => handleRejectReport(report.race_id)}
                          disabled={actionLoading === `report-reject-${report.race_id}`}
                        >
                          {actionLoading === `report-reject-${report.race_id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Ignorer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Races Tab */}
          <TabsContent value="pending">
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
                      className="p-6 bg-card border-border rounded-2xl"
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
          </TabsContent>
        </Tabs>
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
