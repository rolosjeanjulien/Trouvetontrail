import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Mountain, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20" data-testid="login-page">
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
          <h1 className="font-heading text-2xl font-bold">CONNEXION</h1>
          <p className="text-muted-foreground mt-2">
            Accédez à votre compte Trouve Ton Dossard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="h-12 bg-background border-border rounded-xl"
              data-testid="email-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-muted-foreground uppercase tracking-wide">
              Mo
