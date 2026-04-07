import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, setShowRegisterModal, signInWithEmail, signInWithGoogle } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (!showLoginModal) {
      setEmail('');
      setPassword('');
      setForgotMode(false);
      setForgotEmail('');
      setForgotSent(false);
    }
  }, [showLoginModal]);

  const handleEmailLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        toast({
          title: 'Erreur de connexion',
          description: error.message || 'Identifiants incorrects. Réessayez.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Connexion réussie', description: 'Bienvenue sur Expat-Congo !' });
        setShowLoginModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        setForgotSent(true);
        toast({ title: 'Email envoyé', description: `Lien de réinitialisation envoyé à ${forgotEmail}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="sm:max-w-[480px] p-0 rounded-modal shadow-modal border-0 gap-0 overflow-hidden">
        <div className="px-6 pb-6 pt-6">
          <h2 className="text-heading text-20 font-bold text-foreground mb-4">
            {forgotMode ? 'Mot de passe oublié' : 'Se connecter'}
          </h2>

          {forgotMode ? (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-24">📧</span>
                  </div>
                  <p className="text-14 text-text-secondary mb-2">
                    Un lien de réinitialisation a été envoyé à <strong>{forgotEmail}</strong>
                  </p>
                  <p className="text-12 text-text-muted">Vérifiez votre boîte de réception et vos spams.</p>
                  <Button variant="outline" className="mt-4" onClick={() => { setForgotMode(false); setForgotSent(false); }}>
                    Retour à la connexion
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-14 text-text-secondary">
                    Entrez votre email pour recevoir un lien de réinitialisation.
                  </p>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="rounded-input"
                    onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                  />
                  <Button variant="default" size="lg" className="w-full" onClick={handleForgotPassword} disabled={!forgotEmail || loading}>
                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                  </Button>
                  <button onClick={() => setForgotMode(false)} className="text-14 text-primary hover:underline block text-center w-full">
                    ← Retour à la connexion
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-14 font-medium text-foreground mb-1 block">Email</label>
                  <Input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-input" />
                </div>
                <div>
                  <label className="text-14 font-medium text-foreground mb-1 block">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-input pr-10"
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button onClick={() => setForgotMode(true)} className="text-12 text-primary hover:underline mt-1">
                    Mot de passe oublié ?
                  </button>
                </div>
                <Button variant="default" size="lg" className="w-full" onClick={handleEmailLogin} disabled={!email || !password || loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-12 text-text-muted">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button variant="outline" size="lg" className="w-full gap-2" onClick={() => signInWithGoogle()}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Se connecter avec Google
                </Button>

                <p className="text-center text-14 text-text-secondary">
                  Pas encore de compte ?{' '}
                  <button onClick={switchToRegister} className="text-primary font-medium hover:underline">
                    Créer un compte gratuit
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
