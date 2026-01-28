import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { 
  Upload, FileSpreadsheet, Download, Loader2, CheckCircle, 
  XCircle, ArrowLeft, AlertTriangle, Trash2
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

export default function ImportRaces() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast.error('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de l\'import');
      }

      setResult(data);
      if (data.imported > 0) {
        toast.success(`${data.imported} course(s) importée(s) avec succès !`);
      }
    } catch (err) {
      toast.error(err.message);
      setResult({ error: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/races/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de la suppression');
      }

      toast.success(data.message);
      setShowDeleteDialog(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="import-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Button>

        <Card className="p-8 bg-card border-border rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <FileSpreadsheet className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">IMPORT EXCEL</h1>
              <p className="text-muted-foreground">
                Importez vos courses depuis un fichier Excel
              </p>
            </div>
          </div>

          {/* Download template */}
          <div className="mb-8 p-4 bg-secondary/50 rounded-xl">
            <h3 className="font-heading text-sm uppercase tracking-wide mb-2">
              1. Téléchargez le template
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Utilisez ce fichier Excel comme modèle pour formater vos données.
            </p>
            <a 
              href="/template_courses_trail.xlsx" 
              download
              className="inline-flex"
            >
              <Button variant="outline" className="gap-2 rounded-xl" data-testid="download-template-btn">
                <Download className="h-4 w-4" />
                Télécharger le template
              </Button>
            </a>
          </div>

          {/* Upload section */}
          <div className="mb-8">
            <h3 className="font-heading text-sm uppercase tracking-wide mb-3">
              2. Uploadez votre fichier
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                data-testid="file-input"
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} Ko
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Cliquez ou glissez-déposez votre fichier Excel ici
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Formats acceptés : .xlsx, .xls
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-heading font-bold"
            data-testid="upload-btn"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Importer les courses
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-4 rounded-xl ${
              result.error 
                ? 'bg-destructive/10 border border-destructive/30' 
                : result.imported > 0 
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-yellow-500/10 border border-yellow-500/30'
            }`}>
              {result.error ? (
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Erreur</p>
                    <p className="text-sm text-destructive/80">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <p className="font-medium text-foreground">{result.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-green-500/10 rounded-lg text-center">
                      <div className="font-heading text-2xl font-bold text-green-400">
                        {result.imported}
                      </div>
                      <div className="text-xs text-muted-foreground">Importées</div>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                      <div className="font-heading text-2xl font-bold text-yellow-400">
                        {result.skipped}
                      </div>
                      <div className="text-xs text-muted-foreground">Ignorées</div>
                    </div>
                  </div>
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <p className="text-sm font-medium text-yellow-400">
                          Détails des erreurs :
                        </p>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {result.errors.map((err, i) => (
                          <p key={i} className="text-xs text-muted-foreground py-1 border-b border-border last:border-0">
                            {err}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Danger zone */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-heading text-sm uppercase tracking-wide text-destructive mb-3">
              Zone dangereuse
            </h3>
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">
                Supprimer toutes les courses de la base de données. Cette action est irréversible.
              </p>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
                data-testid="delete-all-btn"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer toutes les courses
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer TOUTES les courses ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer tout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
