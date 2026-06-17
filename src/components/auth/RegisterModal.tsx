import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, ChevronDown, Check, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CITY_OPTIONS = ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Ouesso', 'Impfondo', 'Autre'];

const RegisterModal = () => {
  const { showRegisterModal, setShowRegisterModal, setShowLoginModal, signUpWithEmail, signInWithGoogle } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Brazzaville');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (!showRegisterModal) {
      setFullName(''); setEmail(''); setPhone(''); setPassword('');
      setAcceptCGU(false); setSignupSuccess(false); setCityOpen(false);
    }
  }, [showRegisterModal]);

  const getPasswordStrength = (pw: string) => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels: Record<number, { label: string; color: string }> = {
      0: { label: '', color: '' },
      1: { label: 'Faible', color: 'bg-danger' },
      2: { label: 'Moyen', color: 'bg-sponsored' },
      3: { label: 'Bon', color: 'bg-accent' },
      4: { label: 'Excellent', color: 'bg-primary' },
    };
    return { level: score, ...levels[score] };
  };
  const strength = getPasswordStrength(password);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = !phone || /^[0-9\s]{7,12}$/.test(phone);
  const canSubmit = fullName.trim().length >= 2 && emailValid && phoneValid && password.length >= 8 && acceptCGU;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { error } = await signUpWithEmail(email, password, {
        full_name: fullName.trim(),
        phone: phone ? `+242${phone.replace(/\s/g, '')}` : '',
        city,
      });
      if (error) {
        toast({
          title: 'Erreur',
          description: error.message || 'Une erreur est survenue. Réessayez.',
          variant: 'destructive',
        });
      } else {
        setSignupSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  if (signupSuccess) {
    return (
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-[480px] p-0 rounded-modal shadow-modal border-0 gap-0 overflow-hidden">
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-heading text-20 font-bold text-foreground mb-3">Vérifiez votre email</h2>
            <p className="text-14 text-text-secondary mb-2">
              Un email de confirmation a été envoyé à <strong>{email}</strong>
            </p>
            <p className="text-12 text-text-muted mb-6">
              Cliquez sur le lien pour activer votre compte. Pensez à vérifier vos spams.
            </p>
            <Button variant="outline" onClick={() => setShowRegisterModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
      <DialogContent className="sm:max-w-[480px] p-0 rounded-modal shadow-modal border-0 gap-0 overflow-hidden">
        <div className="px-6 pt-6 pb-6">
          <h2 className="text-heading text-22 font-bold text-foreground">Créer un compte</h2>
          <p className="text-14 text-text-secondary mt-1 mb-5">
            Rejoignez la communauté Expat-Congo en moins d'une minute.
          </p>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 mb-4"
            onClick={() => signInWithGoogle()}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuer avec Google
          </Button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-12 text-text-muted">ou avec votre email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-14 font-medium text-foreground mb-1 block">Nom complet *</label>
              <Input
                placeholder="Ex: Jean-Pierre Mouanda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-input"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-14 font-medium text-foreground mb-1 block">Email *</label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-input"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-14 font-medium text-foreground mb-1 block">Téléphone</label>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center px-2 h-10 border border-border rounded-input bg-background text-13 text-text-secondary shrink-0">
                    🇨🇬 +242
                  </div>
                  <Input
                    type="tel"
                    placeholder="06 XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-input"
                    maxLength={12}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label className="text-14 font-medium text-foreground mb-1 block">Ville *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCityOpen(!cityOpen)}
                    className="flex items-center justify-between w-full h-10 px-3 border border-border rounded-input bg-background text-14 text-foreground"
                  >
                    {city}
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </button>
                  {cityOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-input shadow-md z-50">
                      {CITY_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setCity(c); setCityOpen(false); }}
                          className="w-full text-left px-3 py-2 text-14 hover:bg-primary-light transition-colors flex items-center justify-between"
                        >
                          {c}
                          {city === c && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-14 font-medium text-foreground mb-1 block">Mot de passe *</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-input pr-10"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((l) => (
                      <div
                        key={l}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          l <= strength.level ? strength.color : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-12 text-text-muted">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="cgu"
                checked={acceptCGU}
                onCheckedChange={(checked) => setAcceptCGU(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="cgu" className="text-13 text-text-secondary leading-tight cursor-pointer">
                J'accepte les{' '}
                <a href="/cgu" className="text-primary hover:underline" target="_blank" rel="noreferrer">CGU</a>
                {' '}et la{' '}
                <a href="/confidentialite" className="text-primary hover:underline" target="_blank" rel="noreferrer">Politique de confidentialité</a>
              </label>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            className="w-full mt-5"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte gratuit'}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-12 text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Compte 100% gratuit · Annonces illimitées</span>
          </div>

          <p className="text-center text-14 text-text-secondary mt-4">
            Vous avez déjà un compte ?{' '}
            <button onClick={switchToLogin} className="text-primary font-medium hover:underline">
              Se connecter
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
