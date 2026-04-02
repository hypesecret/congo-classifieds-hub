import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { CreditCard, BookOpen, Car, Upload, Camera, Check, ChevronLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type KYCStep = 1 | 2 | 3 | 4;
type DocType = 'cni' | 'passport' | 'permis';

const DOC_TYPES: { type: DocType; label: string; icon: typeof CreditCard; recommended?: boolean; description: string }[] = [
  { type: 'cni', label: 'Carte Nationale d\'Identité', icon: CreditCard, recommended: true, description: 'Document le plus courant et le plus rapide à vérifier' },
  { type: 'passport', label: 'Passeport', icon: BookOpen, description: 'Passeport congolais en cours de validité' },
  { type: 'permis', label: 'Permis de conduire', icon: Car, description: 'Permis de conduire congolais valide' },
];

const KYCVerificationModal = () => {
  const { showKYCModal, setShowKYCModal, user } = useAuthStore();
  const [step, setStep] = useState<KYCStep>(1);
  const [docType, setDocType] = useState<DocType | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Fichier trop volumineux', description: 'La taille maximale est de 5 MB.', variant: 'destructive' });
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({ title: 'Format non supporté', description: 'Impossible de charger cette image. Vérifiez le format (JPG, PNG) et la taille (max 5 MB).', variant: 'destructive' });
      return;
    }
    setter(file);
  };

  const handleSubmit = async () => {
    if (!user || !docType || !frontFile || !backFile || !selfieFile) return;
    setLoading(true);
    try {
      const uploadFile = async (file: File, path: string) => {
        const { error } = await supabase.storage.from('kyc-documents').upload(`${user.id}/${path}`, file, { upsert: true });
        if (error) throw error;
        return `${user.id}/${path}`;
      };

      const frontUrl = await uploadFile(frontFile, `${docType}-front.${frontFile.name.split('.').pop()}`);
      const backUrl = await uploadFile(backFile, `${docType}-back.${backFile.name.split('.').pop()}`);
      const selfieUrl = await uploadFile(selfieFile, `selfie.${selfieFile.name.split('.').pop()}`);

      const { error } = await supabase.from('kyc_verifications').insert({
        user_id: user.id,
        document_type: docType,
        document_front_url: frontUrl,
        document_back_url: backUrl,
        selfie_url: selfieUrl,
      });

      if (error) throw error;

      await supabase.from('profiles').update({ kyc_status: 'pending' as unknown as undefined }).eq('user_id', user.id);

      toast({ title: 'Demande envoyée', description: 'Temps d\'examen estimé : 24 à 48 heures.' });
      setShowKYCModal(false);
    } catch {
      toast({ title: 'Erreur', description: 'Une erreur est survenue. Réessayez dans quelques secondes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const UploadZone = ({ label, file, inputRef, onChange }: { label: string; file: File | null; inputRef: React.RefObject<HTMLInputElement | null>; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-card p-6 text-center cursor-pointer transition-all hover:border-primary hover:bg-primary-light/30 ${
        file ? 'border-primary bg-primary-light/20' : 'border-border'
      }`}
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" onChange={onChange} className="hidden" capture="environment" />
      {file ? (
        <div className="space-y-2">
          <Check className="w-8 h-8 text-primary mx-auto" />
          <p className="text-14 font-medium text-foreground">{file.name}</p>
          <p className="text-12 text-text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary-light mx-auto flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <p className="text-14 font-medium text-foreground">{label}</p>
          <p className="text-12 text-text-muted">JPG ou PNG, max 5 MB</p>
          <Button variant="outline" size="sm" className="gap-1.5 mt-1">
            <Camera className="w-3.5 h-3.5" />
            Prendre en photo
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={showKYCModal} onOpenChange={setShowKYCModal}>
      <DialogContent className="sm:max-w-[520px] p-0 rounded-modal shadow-modal border-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${s === step ? 'bg-primary' : s < step ? 'bg-primary/40' : 'bg-border'}`} />
          ))}
        </div>

        <div className="px-6 pb-6 pt-2">
          {step > 1 && (
            <button onClick={() => setStep((s) => (s - 1) as KYCStep)} className="flex items-center gap-1 text-14 text-text-secondary hover:text-foreground mb-3">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          )}

          {/* Step 1: Document choice */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-heading text-20 font-bold text-foreground">Choisissez votre document</h2>
                <p className="text-14 text-text-secondary mt-1">Sélectionnez le type de pièce d'identité à soumettre.</p>
              </div>
              <div className="space-y-3">
                {DOC_TYPES.map(({ type, label, icon: Icon, recommended, description }) => (
                  <button
                    key={type}
                    onClick={() => { setDocType(type); setStep(2); }}
                    className={`w-full text-left p-4 border rounded-card transition-all hover:border-primary hover:shadow-xs flex items-start gap-3 ${
                      docType === type ? 'border-primary bg-primary-light/20' : 'border-border'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-category bg-primary-light flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-14 font-semibold text-foreground">{label}</span>
                        {recommended && (
                          <span className="text-11 px-1.5 py-0.5 bg-primary/10 text-primary rounded-pill font-medium">Recommandé</span>
                        )}
                      </div>
                      <p className="text-12 text-text-muted mt-0.5">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Upload */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-heading text-20 font-bold text-foreground">Photos du document</h2>
                <p className="text-14 text-text-secondary mt-1">Prenez en photo le recto et le verso de votre document.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <UploadZone label="Recto" file={frontFile} inputRef={frontRef} onChange={handleFileChange(setFrontFile)} />
                <UploadZone label="Verso" file={backFile} inputRef={backRef} onChange={handleFileChange(setBackFile)} />
              </div>
              <p className="text-12 text-text-muted">Assurez-vous que le document est lisible et bien éclairé.</p>
              <Button variant="default" size="lg" className="w-full" onClick={() => setStep(3)} disabled={!frontFile || !backFile}>
                Continuer
              </Button>
            </div>
          )}

          {/* Step 3: Selfie */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-heading text-20 font-bold text-foreground">Photo selfie</h2>
                <p className="text-14 text-text-secondary mt-1">Regardez la caméra, visage bien éclairé.</p>
              </div>
              <div className="flex justify-center">
                <div className="w-48">
                  <UploadZone label="Selfie" file={selfieFile} inputRef={selfieRef} onChange={handleFileChange(setSelfieFile)} />
                </div>
              </div>
              <Button variant="default" size="lg" className="w-full" onClick={() => setStep(4)} disabled={!selfieFile}>
                Continuer
              </Button>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-heading text-20 font-bold text-foreground">Vérification finale</h2>
                <p className="text-14 text-text-secondary mt-1">Vérifiez vos documents avant de soumettre.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-primary-light/30 rounded-card">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-14 text-foreground">{DOC_TYPES.find(d => d.type === docType)?.label} — Recto ✓</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary-light/30 rounded-card">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-14 text-foreground">{DOC_TYPES.find(d => d.type === docType)?.label} — Verso ✓</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary-light/30 rounded-card">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-14 text-foreground">Photo selfie ✓</span>
                </div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-card p-3">
                <p className="text-14 text-foreground font-medium">Temps d'examen estimé : 24 à 48 heures</p>
                <p className="text-12 text-text-secondary mt-0.5">Vous recevrez une notification dès que votre vérification sera traitée.</p>
              </div>
              <Button variant="default" size="lg" className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Soumettre ma demande'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KYCVerificationModal;
