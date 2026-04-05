import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Lock, Check } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setHasRecoveryToken(true);
    }
  }, []);

  const handleReset = async () => {
    if (password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caractères.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Mot de passe mis à jour !' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center max-w-md">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-24 font-heading font-bold text-foreground mb-2">Mot de passe modifié !</h1>
          <p className="text-14 text-text-muted mb-6">Votre mot de passe a été mis à jour avec succès.</p>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto py-16 max-w-md">
        <div className="bg-surface rounded-card border border-border p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-24 font-heading font-bold text-foreground">Nouveau mot de passe</h1>
            <p className="text-14 text-text-muted mt-1">Choisissez un nouveau mot de passe sécurisé.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-14 font-medium text-foreground block mb-1">Nouveau mot de passe</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caractères" />
            </div>
            <div>
              <label className="text-14 font-medium text-foreground block mb-1">Confirmer le mot de passe</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmez votre mot de passe" />
            </div>
            <Button className="w-full" onClick={handleReset} disabled={loading}>
              {loading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ResetPassword;
