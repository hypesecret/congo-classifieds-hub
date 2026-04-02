import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Eye,
  Shield,
  Clock,
  User,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KYCBadge from '@/components/auth/KYCBadge';
import { useAdminKYC } from '@/hooks/useAdminKYC';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Dummy data removed, using useAdminKYC hook

const REJECTION_REASONS = [
  'Document flou ou illisible',
  'Le nom sur le document ne correspond pas au profil',
  'Le selfie ne correspond pas à la photo du document',
  'Document expiré',
  'Type de document non pris en charge',
  'Document falsifié ou altéré',
  'Parties du document masquées',
  'Autre (précisez)'
];

const AdminKYC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: requests, isLoading } = useAdminKYC(activeTab);
  const pendingRequests = activeTab === 'pending' ? requests || [] : [];

  // Modal states
  const [viewedRequest, setViewedRequest] = useState<any | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    if (!viewedRequest) return;
    try {
      // 1. Update verification status
      const { error: kycError } = await supabase
        .from('kyc_verifications')
        .update({ 
          status: 'approved', 
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', viewedRequest.id);
      
      if (kycError) throw kycError;

      // 2. Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          kyc_level: 2, 
          kyc_status: 'approved' 
        })
        .eq('user_id', viewedRequest.user.id);

      if (profileError) throw profileError;

      toast.success('KYC approuvé avec succès !');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      setViewedRequest(null);
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  const handleRejectSubmit = async () => {
    if (!viewedRequest) return;
    try {
      // 1. Update verification status
      const { error: kycError } = await supabase
        .from('kyc_verifications')
        .update({ 
          status: 'rejected', 
          rejection_reason: rejectReason,
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', viewedRequest.id);
      
      if (kycError) throw kycError;

      // 2. Update user profile to reflect rejection
      await supabase
        .from('profiles')
        .update({ kyc_status: 'rejected' })
        .eq('user_id', viewedRequest.user.id);

      toast.success('KYC rejeté.');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      setShowRejectDialog(false);
      setViewedRequest(null);
      setRejectReason('');
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-24 font-bold text-foreground font-heading flex items-center gap-2">
            Vérifications d'identité (KYC)
            <span className="bg-warning/10 text-warning-dark text-14 px-2.5 py-0.5 rounded-full font-semibold">
              {pendingRequests.length}
            </span>
          </h1>
          <p className="text-14 text-text-secondary mt-1">Vérifiez les documents d'identité pour accorder le badge Vérifié</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              En attente ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">Approuvés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                className="w-full h-10 pl-9 pr-4 rounded-input border border-border text-14 outline-none focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="w-4 h-4 text-text-secondary" />
            </Button>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <div className="bg-surface rounded-card border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_200px_150px_auto] gap-4 p-4 border-b border-border bg-background/50 font-medium text-13 text-text-secondary">
              <div>Utilisateur</div>
              <div>Document</div>
              <div>Soumis</div>
              <div className="text-right w-24">Actions</div>
            </div>

            {/* List Items */}
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                Aucune demande de vérification KYC en attente.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingRequests.map(req => (
                  <div key={req.id} className="grid grid-cols-[1fr_200px_150px_auto] gap-4 p-4 items-center hover:bg-background/50 transition-colors">
                    
                    <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setViewedRequest(req)}>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-14 shrink-0">
                        {req.user.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-15 font-semibold text-foreground truncate hover:text-primary transition-colors">
                          {req.user.name}
                        </p>
                        <p className="text-13 text-text-secondary truncate">{req.user.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-surface-hover flex items-center justify-center shrink-0 border border-border">
                        <User className="w-4 h-4 text-text-secondary" />
                      </div>
                      <div className="text-13">
                        <p className="font-medium text-foreground">{req.documentTypeName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-13 text-text-secondary">
                      <Clock className="w-3.5 h-3.5" />
                      {req.submittedAt}
                    </div>

                    <div className="flex items-center justify-end gap-2 w-24">
                      <Button 
                        className="w-full bg-primary hover:bg-primary-dark text-white text-13 h-8" 
                        onClick={() => setViewedRequest(req)}
                      >
                        Examiner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="bg-surface rounded-card border border-border p-8 text-center text-text-muted">
            Sélectionnez un filtre ou utilisez la recherche pour voir l'historique des approbations.
          </div>
        </TabsContent>
        <TabsContent value="rejected">
          <div className="bg-surface rounded-card border border-border p-8 text-center text-text-muted">
             Aucune donnée pour tester.
          </div>
        </TabsContent>
      </Tabs>

      {/* KYC Review Full Screen Modal */}
      <Dialog open={!!viewedRequest && !showRejectDialog} onOpenChange={(open) => !open && setViewedRequest(null)}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] max-h-[900px] p-0 overflow-hidden flex flex-col">
          {viewedRequest && (
            <>
              <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
                <h2 className="text-18 font-bold text-foreground font-heading flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Examen KYC : {viewedRequest.user.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-13 text-text-secondary">Soumis {viewedRequest.submittedAt}</span>
                  <div className="w-px h-6 bg-border mx-1"></div>
                  <Button variant="outline" size="sm" onClick={() => setViewedRequest(null)}>Fermer</Button>
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-background">
                {/* Left: Documents */}
                <div className="w-full md:w-7/12 p-6 overflow-y-auto border-r border-border space-y-6">
                  <div>
                    <h3 className="text-16 font-bold text-foreground mb-4">Documents d'identité ({viewedRequest.documentTypeName})</h3>
                    <div className="space-y-4">
                      <div className="rounded-card border border-border bg-surface p-2">
                        <p className="text-12 font-medium text-text-secondary mb-2 px-2 uppercase tracking-wider">Recto</p>
                        <div className="aspect-[1.58/1] bg-black/5 rounded overflow-hidden relative group">
                           {viewedRequest.images.front ? (
                             <img src={viewedRequest.images.front} alt="Document Recto" className="w-full h-full object-contain" />
                           ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-text-muted">Image non disponible</div>
                           )}
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <Button variant="secondary" size="sm" className="gap-2">
                               <Search className="w-4 h-4" /> Agrandir
                             </Button>
                           </div>
                        </div>
                      </div>

                      {viewedRequest.images.back && (
                        <div className="rounded-card border border-border bg-surface p-2">
                          <p className="text-12 font-medium text-text-secondary mb-2 px-2 uppercase tracking-wider">Verso</p>
                          <div className="aspect-[1.58/1] bg-black/5 rounded overflow-hidden relative group">
                             <img src={viewedRequest.images.back} alt="Document Verso" className="w-full h-full object-contain" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                               <Button variant="secondary" size="sm" className="gap-2">
                                 <Search className="w-4 h-4" /> Agrandir
                               </Button>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Selfie & Info */}
                <div className="w-full md:w-5/12 p-0 flex flex-col bg-surface overflow-hidden">
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                      <h3 className="text-16 font-bold text-foreground mb-4">Selfie de vérification</h3>
                      <div className="rounded-card border border-border bg-background p-2">
                        <div className="aspect-square max-h-[300px] mx-auto bg-black/5 rounded overflow-hidden relative">
                           {viewedRequest.images.selfie ? (
                             <img src={viewedRequest.images.selfie} alt="Selfie" className="w-full h-full object-cover" />
                           ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-text-muted">Image non disponible</div>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-card border border-border bg-background p-5">
                      <h3 className="text-14 font-bold text-foreground mb-4 border-b border-border pb-2">Informations du profil</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-12 text-text-muted mb-1">Nom complet enregistré</p>
                          <p className="text-16 font-semibold text-foreground">{viewedRequest.user.name}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-12 text-text-muted mb-1">Téléphone</p>
                            <p className="text-14 font-medium">{viewedRequest.user.phone}</p>
                          </div>
                          <div>
                            <p className="text-12 text-text-muted mb-1">Ville</p>
                            <p className="text-14 font-medium">{viewedRequest.user.city}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-12 text-text-muted mb-1">Email</p>
                            <p className="text-14 font-medium">{viewedRequest.user.email}</p>
                          </div>
                        </div>

                        <div className="bg-warning/10 border border-warning/20 rounded p-3 mt-2 flex gap-3">
                          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                          <p className="text-13 text-warning-dark">
                            Vérifiez que le nom enregistré <strong>({viewedRequest.user.name})</strong> correspond exactement au nom figurant sur le document d'identité.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 border-t border-border bg-background flex flex-col sm:flex-row gap-3 shrink-0">
                    <Button 
                      className="flex-1 bg-success hover:bg-success/90 text-white gap-2 h-12 text-16"
                      onClick={handleApprove}
                    >
                      <CheckCircle className="w-5 h-5" /> Approuver (Niveau 2)
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 gap-2 h-12 text-16"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <XCircle className="w-5 h-5" /> Rejeter la demande
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-danger flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Rejeter la vérification KYC
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet. L'utilisateur devra soumettre à nouveau ses documents.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un motif" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((reason, i) => (
                  <SelectItem key={i} value={reason}>{reason}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {rejectReason.startsWith('Autre') && (
              <textarea 
                className="w-full h-24 p-3 rounded-card border border-border focus:border-danger outline-none text-14 resize-none"
                placeholder="Précisez la raison détaillée ici..."
                autoFocus
              />
            )}
            
            <div className="bg-surface-hover p-3 rounded text-13 text-text-secondary">
              L'utilisateur recevra un SMS/Email avec cette raison et un lien pour réessayer.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Annuler</Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSubmit} 
              disabled={!rejectReason}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYC;
