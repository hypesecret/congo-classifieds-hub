import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  ShieldAlert 
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import KYCBadge from '@/components/auth/KYCBadge';

const REJECTION_REASONS = [
  'Contenu interdit ou dangereux',
  'Photos inadaptées ou de mauvaise qualité',
  'Prix anormalement bas (arnaque probable)',
  'Annonce en doublon',
  'Informations insuffisantes ou mensongères',
  'Catégorie incorrecte',
  'Autre (précisez)'
];

const formatFCFA = (value: number) => {
  return new Intl.NumberFormat('fr-CG', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);
};

const AdminModeration = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const statusMap: Record<string, string> = { pending: 'pending_moderation', approved: 'active', rejected: 'rejected', reported: 'reported' };
  const { data: listings, isLoading } = useListings({ status: statusMap[activeTab] || activeTab });
  const pendingListings = activeTab === 'pending' ? listings || [] : [];

  // Modal states
  const [viewedListing, setViewedListing] = useState<any | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(new Set(pendingListings.map(l => l.id)));
    } else {
      setSelectedListings(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedListings);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedListings(newSelected);
  };

  const updateStatus = async (ids: string[], status: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status, rejection_reason: reason })
        .in('id', ids);
      
      if (error) throw error;
      
      toast.success(status === 'active' ? 'Annonce(s) approuvée(s) !' : 'Annonce(s) rejetée(s).');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  const handleBulkApprove = async () => {
    await updateStatus(Array.from(selectedListings), 'active');
    setShowBulkApproveDialog(false);
    setSelectedListings(new Set());
  };

  const handleRejectSubmit = async () => {
    if (viewedListing) {
      await updateStatus([viewedListing.id], 'rejected', rejectReason);
      setShowRejectDialog(false);
      setViewedListing(null);
      setRejectReason('');
    }
  };

  const handleApprove = async (id: string) => {
    await updateStatus([id], 'active');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-24 font-bold text-foreground font-heading flex items-center gap-2">
            Annonces à modérer
            <span className="bg-danger/10 text-danger text-14 px-2.5 py-0.5 rounded-full font-semibold">
              {pendingListings.length}
            </span>
          </h1>
          <p className="text-14 text-text-secondary mt-1">Vérifiez et approuvez les nouvelles annonces</p>
        </div>

        {selectedListings.size > 0 && (
          <div className="flex items-center gap-3 bg-primary-light/50 px-4 py-2 rounded-card border border-primary/20 animate-fade-in">
            <span className="text-14 font-medium text-primary-dark">
              {selectedListings.size} sélectionnée(s)
            </span>
            <Button 
              size="sm" 
              onClick={() => setShowBulkApproveDialog(true)}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              Approuver la sélection
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              En attente ({pendingListings.length})
            </TabsTrigger>
            <TabsTrigger value="approved">Approuvées</TabsTrigger>
            <TabsTrigger value="rejected">Rejetées</TabsTrigger>
            <TabsTrigger value="reported" className="text-danger data-[state=active]:bg-danger data-[state=active]:text-white">
              Signalées
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Rechercher une annonce..." 
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
            <div className="grid grid-cols-[auto_1fr_200px_150px_auto] gap-4 p-4 border-b border-border bg-background/50 font-medium text-13 text-text-secondary">
              <div className="flex items-center justify-center w-6">
                <Checkbox 
                  checked={selectedListings.size === pendingListings.length && pendingListings.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div>Annonce</div>
              <div>Vendeur</div>
              <div>Détails</div>
              <div className="text-right w-24">Actions</div>
            </div>

            {/* List Items */}
            {pendingListings.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                Aucune annonce en attente de modération.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingListings.map(listing => (
                  <div key={listing.id} className="grid grid-cols-[auto_1fr_200px_150px_auto] gap-4 p-4 items-center hover:bg-background/50 transition-colors">
                    <div className="flex items-center justify-center w-6">
                      <Checkbox 
                        checked={selectedListings.has(listing.id)}
                        onCheckedChange={(c) => handleSelectOne(listing.id, !!c)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 min-w-0 cursor-pointer" onClick={() => setViewedListing(listing)}>
                      <div className="w-16 h-16 rounded overflow-hidden bg-background shrink-0 border border-border">
                         {listing.cover_image ? (
                           <img src={listing.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-text-muted text-10">Sans image</div>
                         )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-15 font-semibold text-foreground truncate hover:text-primary transition-colors">
                          {listing.title}
                        </p>
                        <span className="text-12 text-text-secondary bg-surface-hover px-2 py-0.5 rounded mt-1 inline-block">
                          {listing.category}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-12 shrink-0">
                          {listing.profiles?.full_name?.[0] || '?'}
                        </div>
                        <p className="text-14 font-medium text-foreground truncate">{listing.profiles?.full_name || 'Inconnu'}</p>
                      </div>
                      <div className="mt-1.5 flex items-center">
                        <KYCBadge 
                          level={listing.profiles?.kyc_level || 0} 
                          status={(listing.profiles?.kyc_status as any) === 'approved' ? 'approved' : 'none'} 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col text-13">
                      <span className="font-bold text-primary">{formatFCFA(listing.price || 0)}</span>
                      <span className="text-text-secondary mt-1">{listing.city}</span>
                      <span className="text-text-muted text-11 mt-0.5">
                        {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 w-24">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-success hover:text-success hover:bg-success/10" 
                        title="Approuver"
                        onClick={() => handleApprove(listing.id)}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-danger hover:text-danger hover:bg-danger/10" 
                        title="Rejeter"
                        onClick={() => { setViewedListing(listing); setShowRejectDialog(true); }}
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-text-secondary" 
                        title="Voir les détails"
                        onClick={() => setViewedListing(listing)}
                      >
                        <Eye className="w-5 h-5" />
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
            Sélectionnez un filtre ou utilisez la recherche pour voir les annonces approuvées.
          </div>
        </TabsContent>
        <TabsContent value="rejected">
          <div className="bg-surface rounded-card border border-border p-8 text-center text-text-muted">
             Aucune donnée pour tester.
          </div>
        </TabsContent>
        <TabsContent value="reported">
          <div className="bg-surface rounded-card border border-border p-8 text-center text-text-muted">
             Rendez-vous dans la section "Signalements" pour une vue détaillée.
          </div>
        </TabsContent>
      </Tabs>

      {/* Listing Detail Modal */}
      <Dialog open={!!viewedListing && !showRejectDialog} onOpenChange={(open) => !open && setViewedListing(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
          {viewedListing && (
            <div className="flex flex-col md:flex-row h-[80vh] max-h-[700px]">
              {/* Left: Images */}
              <div className="md:w-1/2 bg-black flex items-center justify-center relative">
                {viewedListing.cover_image ? (
                  <img src={viewedListing.cover_image} alt="Listing" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-text-muted flex flex-col items-center">
                    <Eye className="w-12 h-12 mb-2 opacity-50" />
                    Aucune photo
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-12 backdrop-blur-md">
                  1 / {Math.max(1, (viewedListing.images?.length || 0))}
                </div>
              </div>

              {/* Right: Info & Actions */}
              <div className="md:w-1/2 flex flex-col bg-surface h-full">
                <div className="p-6 overflow-y-auto flex-1 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-20 font-bold text-foreground font-heading leading-tight">{viewedListing.title}</h2>
                      <div className="text-primary font-bold text-18 mt-2">{formatFCFA(viewedListing.price)}</div>
                    </div>
                    <span className="text-12 bg-surface-hover px-2.5 py-1 rounded text-text-secondary whitespace-nowrap">
                      {viewedListing.category}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4 text-14 text-foreground leading-relaxed">
                    <p>{viewedListing.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
                      <div>
                        <span className="text-text-muted block text-12 mb-1">Localisation</span>
                        <span className="font-medium">{viewedListing.city}, {viewedListing.neighborhood}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-12 mb-1">Soumise</span>
                        <span className="font-medium">
                          {viewedListing.created_at ? new Date(viewedListing.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Card */}
                  <div className="mt-6 bg-background rounded-card border border-border p-4">
                    <h3 className="text-12 font-semibold text-text-muted uppercase tracking-wider mb-3">Vendeur</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-16">
                          {viewedListing.profiles?.full_name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-15">{viewedListing.profiles?.full_name || 'Inconnu'}</p>
                          <div className="mt-1">
                            <KYCBadge level={viewedListing.profiles?.kyc_level || 0} status={viewedListing.profiles?.kyc_status === 'approved' ? 'approved' : 'none'} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-12 text-text-secondary">
                        <p>ID: {viewedListing.user_id?.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Moderation History */}
                  <div className="mt-6">
                    <h3 className="text-12 font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                       Historique de modération
                    </h3>
                    <div className="text-13 text-text-secondary bg-surface-hover rounded p-3">
                       Soumise par l'utilisateur — {viewedListing.submittedAt}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-background flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1 bg-success hover:bg-success/90 text-white gap-2"
                    onClick={() => {
                      handleApprove(viewedListing.id);
                      setViewedListing(null);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" /> Approuver
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4" /> Rejeter
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 gap-2 border-warning text-warning hover:bg-warning/10"
                    onClick={() => {
                      console.log('Demander modif', viewedListing.id);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" /> Demander modif
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-danger flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Rejeter l'annonce
            </DialogTitle>
            <DialogDescription>
              Veuillez sélectionner la raison du rejet. Un email automatique sera envoyé à l'utilisateur avec ce motif pour qu'il puisse corriger son annonce.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un motif de rejet" />
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

      {/* Bulk Approve Confirmation Dialog */}
      <Dialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation par lots</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'approuver <strong>{selectedListings.size}</strong> annonces simultanément. Elles seront immédiatement visibles sur la plateforme.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowBulkApproveDialog(false)}>Annuler</Button>
            <Button onClick={handleBulkApprove} className="bg-primary hover:bg-primary-dark text-white">
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModeration;
