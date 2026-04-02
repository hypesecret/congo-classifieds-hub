import React, { useState } from 'react';
import { 
  AlertTriangle,
  Trash2,
  Ban,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Eye,
  MoreVertical,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminReports } from '@/hooks/useAdminReports';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Dummy data removed, using useAdminReports hook

const BAN_DURATIONS = [
  { label: '1 Jour', value: '1' },
  { label: '7 Jours', value: '7' },
  { label: '30 Jours', value: '30' },
  { label: 'Permanent', value: 'permanent' }
];

const AdminReports = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: reports, isLoading } = useAdminReports(activeTab);
  const pendingReports = activeTab === 'pending' ? reports || [] : [];

  // Modal states
  const [reportToBan, setReportToBan] = useState<any | null>(null);
  const [banDuration, setBanDuration] = useState('7');
  const [banReason, setBanReason] = useState('');

  const [reportToIgnore, setReportToIgnore] = useState<any | null>(null);
  const [ignoreReason, setIgnoreReason] = useState('');

  const handleIgnore = async () => {
    if (!reportToIgnore) return;
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'ignored', admin_note: ignoreReason })
        .eq('id', reportToIgnore.id);
      
      if (error) throw error;
      
      toast.success('Signalement ignoré');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setReportToIgnore(null);
      setIgnoreReason('');
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  const handleWarn = async (report: any) => {
    toast.info('Fonctionnalité d\'avertissement bientôt disponible');
  };

  const handleDeleteListing = async (report: any) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'rejected', rejection_reason: 'Suppression suite à signalement (' + report.reason + ')' })
        .eq('id', report.listing.id);
      
      if (error) throw error;
      
      await supabase
        .from('reports')
        .update({ status: 'processed' })
        .eq('id', report.id);

      toast.success('Annonce supprimée');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  const handleBanSubmit = async () => {
    if (!reportToBan) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true, ban_reason: banReason })
        .eq('user_id', reportToBan.listing.seller.id);
      
      if (error) throw error;
      
      await supabase
        .from('reports')
        .update({ status: 'processed' })
        .eq('id', reportToBan.id);

      toast.success('Utilisateur banni');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setReportToBan(null);
      setBanDuration('7');
      setBanReason('');
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-24 font-bold text-foreground font-heading flex items-center gap-2">
            Signalements
            <span className="bg-danger/10 text-danger text-14 px-2.5 py-0.5 rounded-full font-semibold">
              {pendingReports.length}
            </span>
          </h1>
          <p className="text-14 text-text-secondary mt-1">Gérez les alertes des utilisateurs et de l'auto-modération</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-danger data-[state=active]:text-white">
              En attente ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="processed">Traités</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Rechercher..." 
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
            <div className="grid grid-cols-[150px_1fr_250px_120px] gap-4 p-4 border-b border-border bg-background/50 font-medium text-13 text-text-secondary">
              <div>Signalé par</div>
              <div>Motif & Détails</div>
              <div>Annonce et Vendeur</div>
              <div className="text-right">Actions</div>
            </div>

            {/* List Items */}
            {pendingReports.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                Aucun signalement en attente.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingReports.map(report => (
                  <div key={report.id} className="grid grid-cols-[150px_1fr_250px_120px] gap-4 p-4 items-start hover:bg-background/50 transition-colors">
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                          {report.reporter.name === 'AdminSystem' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-danger" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-warning-dark" />
                          )}
                        </div>
                        <p className="font-medium text-14 text-foreground truncate" title={report.reporter.name}>
                          {report.reporter.name}
                        </p>
                      </div>
                      <p className="text-12 text-text-muted mt-1 ml-8">{report.date}</p>
                    </div>

                    <div className="min-w-0 pr-4">
                      <p className="font-semibold text-14 text-danger mb-1">{report.reason}</p>
                      {report.details && (
                        <p className="text-13 text-text-secondary bg-surface-hover p-2 rounded border border-border">
                          "{report.details}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded shrink-0 bg-background border border-border overflow-hidden flex items-center justify-center">
                        {report.listing.image ? (
                          <img src={report.listing.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Eye className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-14 font-medium text-foreground truncate hover:text-primary cursor-pointer transition-colors" title={report.listing.title}>
                          {report.listing.title}
                        </p>
                        <p className="text-12 text-text-secondary truncate mt-0.5">Vendeur: {report.listing.seller.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 px-2 gap-1 text-text-secondary hover:text-foreground border border-transparent hover:border-border">
                            Actions <MoreVertical className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setReportToIgnore(report)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Ignorer (Faux positif)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleWarn(report)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Avertir l'utilisateur
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteListing(report)} className="text-warning-dark">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer l'annonce
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setReportToBan(report)} className="text-danger focus:text-danger">
                            <Ban className="w-4 h-4 mr-2" />
                            Bannir l'utilisateur
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="processed">
          <div className="bg-surface rounded-card border border-border p-8 text-center text-text-muted">
            Sélectionnez un filtre ou utilisez la recherche pour voir les signalements traités.
          </div>
        </TabsContent>
      </Tabs>

      {/* Ignore Dialog */}
      <Dialog open={!!reportToIgnore} onOpenChange={(open) => !open && setReportToIgnore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ignorer le signalement</DialogTitle>
            <DialogDescription>
              Une note interne sera créée pour expliquer pourquoi ce signalement a été ignoré. (Ex: Faux positif, concurrent malveillant, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea 
              className="w-full h-24 p-3 rounded-card border border-border focus:border-primary outline-none text-14 resize-none"
              placeholder="Raison (optionnel)..."
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportToIgnore(null)}>Annuler</Button>
            <Button onClick={handleIgnore}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={!!reportToBan} onOpenChange={(open) => !open && setReportToBan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-danger flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Bannir l'utilisateur : {reportToBan?.listing.seller.name}
            </DialogTitle>
            <DialogDescription>
              Configurez la durée et le motif de la suspension. L'utilisateur ne pourra plus se connecter pendant cette période.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <label className="text-12 font-medium text-text-secondary block mb-1.5">Durée de suspension</label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une durée" />
                </SelectTrigger>
                <SelectContent>
                  {BAN_DURATIONS.map((dur) => (
                    <SelectItem key={dur.value} value={dur.value}>{dur.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-12 font-medium text-text-secondary block mb-1.5">Motif (Message à l'utilisateur)</label>
              <textarea 
                className="w-full h-24 p-3 rounded-card border border-border focus:border-danger outline-none text-14 resize-none"
                placeholder="Ex: Tentative d'escroquerie, publications répétées de contenu interdit..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            
            <div className="bg-danger/10 border border-danger/20 rounded p-3 mt-2 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
              <div className="text-13 text-danger-dark">
                <p className="font-semibold mb-1">Attention, cette action :</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Désactivera toutes les annonces actives de l'utilisateur</li>
                  <li>Déconnectera immédiatement l'utilisateur de l'application</li>
                  <li>Sera consignée dans les logs de modération</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportToBan(null)}>Annuler</Button>
            <Button 
              variant="destructive" 
              onClick={handleBanSubmit} 
              disabled={!banReason}
            >
              Confirmer le bannissement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
