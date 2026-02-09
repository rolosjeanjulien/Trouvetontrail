import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Mountain, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur');
      }

      setSuccess(true);
      toast.success('Mot de passe modifié !');
    } catch (err) {
      toast.error(err.message || 'Le lien est invalide ou expiré');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20" data-testid="reset-password-page">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl border-border rounded-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Mountain className="h-10 w-10 text-primary" />
          </Link>
          <h1 className="font-heading text-2xl font-bold">
            {success ? 'MOT DE PASSE MODIFIÉ' : error ? 'LIEN INVALIDE' : 'NOUVEAU MOT DE PASSE'}
          </h1>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-muted-foreground">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Link to="/login">
              <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground">
                Se connecter
              </Button>
            </Link>
          </div>
        ) : error ? (
          <div className="text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-muted-foreground">
              Ce lien de réinitialisation est invalide ou a expiré. 
              Veuillez demander un nouveau lien.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground">
                Demander un nouveau lien
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground uppercase tracking-wide">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-12 bg-background border-border rounded-xl pr-12"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground uppercase tracking-wide">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 bg-background border-border rounded-xl"
                data-testid="confirm-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wide"
              data-testid="submit-btn"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Modifier le mot de passe'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
