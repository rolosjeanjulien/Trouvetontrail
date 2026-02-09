import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Mountain, Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur');
      }

      setSent(true);
      toast.success('Email envoyé !');
    } catch (err) {
      // On affiche toujours un message de succès pour des raisons de sécurité
      // (ne pas révéler si l'email existe ou non)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20" data-testid="forgot-password-page">
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
          <h1 className="font-heading text-2xl font-bold">MOT DE PASSE OUBLIÉ</h1>
          <p className="text-muted-foreground mt-2">
            {sent 
              ? "Vérifiez votre boîte mail"
              : "Entrez votre email pour réinitialiser votre mot de passe"
            }
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <p className="text-foreground mb-2">
                Si un compte existe avec l'adresse <strong>{email}</strong>, 
                vous recevrez un email avec les instructions de réinitialisation.
              </p>
              <p className="text-sm text-muted-foreground">
                Pensez à vérifier vos spams si vous ne voyez pas l'email.
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground uppercase tracking-wide">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="h-12 bg-background border-border rounded-xl pl-10"
                  data-testid="email-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wide"
              data-testid="submit-btn"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Envoyer le lien'}
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
