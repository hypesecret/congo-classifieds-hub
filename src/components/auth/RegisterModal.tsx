import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/authStore';
import { CITIES } from '@/lib/constants';
import { Eye, EyeOff, ChevronDown, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PHONE_PREFIXES = [
  { label: '🇨🇬 +242', value: '+242' },
];

const CITY_OPTIONS = ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Ouesso', 'Autre'];

type Step = 1 | 2 | 3;

const RegisterModal = () => {
  const { showRegisterModal, setShowRegisterModal, setShowLoginModal, signUpWithEmail, updateProfile } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Brazzaville');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [cityOpen, setCityOpen] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!showRegisterModal) {
      setStep(1);
      setPhone('');
      setOtpCode(['', '', '', '', '', '']);
      setFullName('');
      setEmail('');
      setPassword('');
      setAcceptCGU(false);
    }
  }, [showRegisterModal]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handlePhoneSubmit = () => {
    if (!phone || phone.length < 7) return;
    setStep(2);
    setResendTimer(60);
    // In production: send OTP via Supabase/Twilio
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const code = otpCode.join('');
    if (code.length !== 6) return;
    // In production: verify OTP with backend
    setStep(3);
  };

  const getPasswordStrength = (pw: string): { level: number; label: string; color: string } => {
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

  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleFinalSubmit = async () => {
    if (!fullName || !password || password.length < 8 || !acceptCGU) return;
    if (!email) {
      toast({ title: 'Email requis', description: 'Veuillez renseigner un email valide pour créer votre compte.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUpWithEmail(email, password, {
        full_name: fullName,
        phone: phone ? `+242${phone.replace(/\s/g, '')}` : '',
        city,
      });
      if (error) {
        toast({
          title: 'Erreur',
          description: error.message || 'Une erreur est survenue. Réessayez dans quelques secondes.',
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

  return (
    <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
      <DialogContent className="sm:max-w-[480px] p-0 rounded-modal shadow-modal border-0 gap-0 overflow-hidden">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                s === step ? 'bg-primary' : s < step ? 'bg-primary/40' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Step 1: Phone */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-heading text-20 font-bold text-foreground">Votre numéro de téléphone</h2>
                <p className="text-14 text-text-secondary mt-1">Nous vous enverrons un code de vérification par SMS.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 h-10 border border-border rounded-input bg-background text-14 text-text-secondary shrink-0">
                  🇨🇬 +242
                </div>
                <Input
                  type="tel"
                  placeholder="06 XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 rounded-input"
                  maxLength={12}
                />
              </div>
              <p className="text-12 text-text-muted">Formats : 06 XXX XXXX (MTN) ou 05 XXX XXXX (Airtel)</p>

              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handlePhoneSubmit}
                disabled={!phone || phone.replace(/\s/g, '').length < 7}
              >
                Recevoir le code
              </Button>

              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-12 text-text-muted">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2"
                onClick={() => useAuthStore.getState().signInWithGoogle()}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continuer avec Google
              </Button>

              <p className="text-center text-14 text-text-secondary">
                Vous avez déjà un compte ?{' '}
                <button onClick={switchToLogin} className="text-primary font-medium hover:underline">
                  Se connecter
                </button>
              </p>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-heading text-20 font-bold text-foreground">Code de vérification</h2>
                <p className="text-14 text-text-secondary mt-1">
                  Code reçu par SMS au +242 {phone} —{' '}
                  <button onClick={() => setStep(1)} className="text-primary font-medium hover:underline">
                    Modifier
                  </button>
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-20 font-heading font-bold border border-border rounded-input bg-background focus:border-primary focus:ring-2 focus:ring-ring outline-none transition-all"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleOtpSubmit}
                disabled={otpCode.join('').length !== 6}
              >
                Vérifier
              </Button>

              <p className="text-center text-14 text-text-secondary">
                {resendTimer > 0 ? (
                  <>Renvoyer le code dans {resendTimer}s</>
                ) : (
                  <button onClick={() => setResendTimer(60)} className="text-primary font-medium hover:underline">
                    Renvoyer le code
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Step 3: Profile */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-heading text-20 font-bold text-foreground">Finalisez votre compte</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-14 font-medium text-foreground mb-1 block">Nom complet *</label>
                  <Input
                    placeholder="Ex: Jean-Pierre Mouanda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-input"
                  />
                </div>

                <div>
                  <label className="text-14 font-medium text-foreground mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-input"
                  />
                  <p className="text-12 text-text-muted mt-1">Optionnel mais recommandé pour la récupération</p>
                </div>

                <div>
                  <label className="text-14 font-medium text-foreground mb-1 block">Ville</label>
                  <div className="relative">
                    <button
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

                <div>
                  <label className="text-14 font-medium text-foreground mb-1 block">Mot de passe *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-input pr-10"
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
                    En créant un compte, vous acceptez nos{' '}
                    <a href="/cgu" className="text-primary hover:underline">CGU</a>
                  </label>
                </div>
              </div>

              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleFinalSubmit}
                disabled={!fullName || password.length < 8 || !acceptCGU || loading}
              >
                {loading ? 'Création en cours...' : 'Créer mon compte gratuit'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
