import React, { useState } from 'react';
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Shield,
  MessageSquare,
  Ban,
  UserCog,
  Eye,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  MapPin,
  List,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import KYCBadge from '@/components/auth/KYCBadge';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Dummy data removed, using useAdminUsers hook

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, verified, banned, admins
  
  const { data: users, isLoading } = useAdminUsers();

  // Modals
  const [viewedUser, setViewedUser] = useState<any | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState('');

  const filteredUsers = (users || []).filter(u => {
    // Search match
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(searchLower) || 
      u.email.toLowerCase().includes(searchLower) || 
      u.phone.includes(searchQuery);

    // Filter match
    if (!matchesSearch) return false;
    if (filterMode === 'verified') return u.kycLevel >= 2;
    if (filterMode === 'banned') return u.status === 'banned';
    if (filterMode === 'admins') return u.role === 'admin' || u.role === 'moderator';
    return true;
  });

  const handleBan = async (userId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: isBanned, ban_reason: isBanned ? 'Violation des conditions' : null })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success(isBanned ? 'Utilisateur banni' : 'Utilisateur débanni');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (viewedUser?.id === userId) setViewedUser({ ...viewedUser, status: isBanned ? 'banned' : 'active' });
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  const handleRoleChange = async () => {
    if (!viewedUser || !newRole) return;
    try {
      // Upsert role
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: viewedUser.id, role: newRole as any }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      toast.success('Rôle mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowRoleDialog(false);
    } catch (e: any) {
      toast.error('Erreur : ' + e.message);
    }
  };

  const formatFCFA = (value: number) => {
    return new Intl.NumberFormat('fr-CG', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-24 font-bold text-foreground font-heading">Utilisateurs</h1>
          <p className="text-14 text-text-secondary mt-1">Gérez les comptes, les rôles et les profils KYC</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
          <MessageSquare className="w-4 h-4" /> Message groupé
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface">
          <div className="flex gap-2">
            <Button 
              variant={filterMode === 'all' ? 'default' : 'outline'} 
              className={filterMode === 'all' ? 'bg-primary text-white' : ''}
              onClick={() => setFilterMode('all')}
            >
              Tous
            </Button>
            <Button 
              variant={filterMode === 'verified' ? 'default' : 'outline'}
              className={filterMode === 'verified' ? 'bg-primary text-white' : ''}
              onClick={() => setFilterMode('verified')}
            >
              Vérifiés (L2+)
            </Button>
            <Button 
              variant={filterMode === 'banned' ? 'default' : 'outline'}
              className="text-danger border-danger/30 hover:bg-danger/10 hover:text-danger"
              onClick={() => setFilterMode('banned')}
            >
              Bannis
            </Button>
            <Button 
              variant={filterMode === 'admins' ? 'default' : 'outline'}
              onClick={() => setFilterMode('admins')}
            >
              Admins/Modos
            </Button>
          </div>

          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Rechercher par nom, email, tél..." 
              className="w-full h-10 pl-9 pr-4 rounded-input border border-border text-14 outline-none focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-14">
            <thead className="bg-background/50 border-b border-border text-text-secondary font-medium text-13">
              <tr>
                <th className="p-4 font-medium">Utilisateur</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Statut KYC</th>
                <th className="p-4 font-medium">Annonces</th>
                <th className="p-4 font-medium">Inscription</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewedUser(user)}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-14 shrink-0 relative">
                          {user.name[0]}
                          {user.role === 'admin' && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full ring-2 ring-white">
                              <Shield className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                            {user.name}
                            {user.status === 'banned' && <span className="bg-danger text-white text-10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Banni</span>}
                          </p>
                          <p className="text-12 text-text-secondary">{user.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-13 text-foreground">{user.phone}</p>
                      <p className="text-12 text-text-secondary">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <KYCBadge level={user.kycLevel} status={user.kycStatus} />
                    </td>
                    <td className="p-4 text-foreground font-medium">
                      {user.listingsCount}
                    </td>
                    <td className="p-4 text-13 text-text-secondary">
                      {user.registeredAt}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-text-secondary hover:text-foreground">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setViewedUser(user)}>
                            <Eye className="w-4 h-4 mr-2" /> Voir le profil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="w-4 h-4 mr-2" /> Envoyer un message
                          </DropdownMenuItem>
                          {user.kycLevel < 2 && (
                            <DropdownMenuItem>
                              <CheckCircle className="w-4 h-4 mr-2 text-success" /> Forcer vérification KYC
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setViewedUser(user); setNewRole(user.role); setShowRoleDialog(true); }}>
                            <UserCog className="w-4 h-4 mr-2" /> Modifier le rôle
                          </DropdownMenuItem>
                          {user.status !== 'banned' ? (
                            <DropdownMenuItem className="text-danger focus:text-danger" onClick={() => handleBan(user.id, true)}>
                              <Ban className="w-4 h-4 mr-2" /> Bannir l'utilisateur
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-success focus:text-success" onClick={() => handleBan(user.id, false)}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Débannir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Detail Full Screen Modal */}
      <Dialog open={!!viewedUser} onOpenChange={(open) => !open && setViewedUser(null)}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col bg-background">
          {viewedUser && (
            <>
              {/* Header */}
              <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-16">
                    {viewedUser.name[0]}
                  </div>
                  <div>
                    <h2 className="text-18 font-bold text-foreground font-heading">{viewedUser.name}</h2>
                    <div className="flex items-center gap-2 text-13 text-text-secondary mt-0.5">
                      <span>Membre depuis : {viewedUser.registeredAt}</span>
                      <span className="w-1 h-1 rounded-full bg-border inline-block"></span>
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Rôle : <span className="font-semibold text-foreground uppercase">{viewedUser.role}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2 text-primary border-primary/30 hover:bg-primary/5">
                    <MessageSquare className="w-4 h-4" /> Message
                  </Button>
                  <Button variant="outline" className="gap-2 text-danger border-danger/30 hover:bg-danger/10 hover:text-danger">
                    <Ban className="w-4 h-4" /> Bannir
                  </Button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Profile Info */}
                  <div className="space-y-6 md:col-span-1">
                    <Card>
                      <CardContent className="p-5 space-y-4">
                        <KYCBadge level={viewedUser.kycLevel} status={viewedUser.kycStatus} />
                        
                        <div className="space-y-3 pt-4 border-t border-border">
                          <p className="flex items-center gap-3 text-14 text-text-secondary">
                            <Phone className="w-4 h-4" /> <span className="text-foreground">{viewedUser.phone}</span>
                          </p>
                          <p className="flex items-center gap-3 text-14 text-text-secondary">
                            <Mail className="w-4 h-4" /> <span className="text-foreground">{viewedUser.email}</span>
                          </p>
                          <p className="flex items-center gap-3 text-14 text-text-secondary">
                            <MapPin className="w-4 h-4" /> <span className="text-foreground">{viewedUser.city}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <h3 className="text-14 font-semibold text-foreground mb-4">Statistiques Globales</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-12 text-text-muted mb-1">Volume de transactions (estimé)</p>
                            <p className="text-18 font-bold text-primary">{formatFCFA(viewedUser.stats.transactions)}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-hover p-3 rounded">
                              <p className="text-20 font-bold text-danger">{viewedUser.stats.reportsAgainst}</p>
                              <p className="text-12 text-text-secondary">Signalements reçus</p>
                            </div>
                            <div className="bg-surface-hover p-3 rounded">
                              <p className="text-20 font-bold text-foreground">{viewedUser.stats.messages}</p>
                              <p className="text-12 text-text-secondary">Messages envoyés</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Tabs */}
                  <div className="md:col-span-2">
                    <Tabs defaultValue="annonces" className="w-full">
                      <TabsList className="bg-surface border border-border w-full justify-start rounded-b-none h-12 px-2">
                        <TabsTrigger value="annonces" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <List className="w-4 h-4 mr-2" /> Annonces ({viewedUser.listingsCount})
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <CreditCard className="w-4 h-4 mr-2" /> Transactions
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-danger data-[state=active]:text-danger">
                          <AlertTriangle className="w-4 h-4 mr-2" /> Signalements liés
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <MessageSquare className="w-4 h-4 mr-2" /> Messages ({viewedUser.stats.messages})
                        </TabsTrigger>
                      </TabsList>

                      <div className="border border-t-0 border-border bg-surface rounded-b-card min-h-[400px]">
                        <TabsContent value="annonces" className="p-0 m-0">
                          {viewedUser.listingsCount > 0 ? (
                            <div className="p-8 text-center text-text-muted">Tableau des annonces de l'utilisateur (Placeholder)</div>
                          ) : (
                            <div className="p-16 flex flex-col items-center justify-center text-center text-text-muted">
                              <List className="w-12 h-12 mb-4 opacity-20" />
                              <p>Cet utilisateur n'a publié aucune annonce.</p>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="transactions" className="p-0 m-0">
                          <div className="p-8 text-center text-text-muted">Historique des achats de boosts (Placeholder)</div>
                        </TabsContent>
                        <TabsContent value="reports" className="p-0 m-0">
                           {viewedUser.stats.reportsAgainst > 0 ? (
                             <div className="p-8 text-center text-danger border-t-4 border-danger">Tableau des signalements reçus (Placeholder)</div>
                           ) : (
                             <div className="p-16 flex flex-col items-center justify-center text-center text-success">
                               <CheckCircle className="w-12 h-12 mb-4 opacity-20" />
                               <p>Aucun signalement contre cet utilisateur. Tout va bien !</p>
                             </div>
                           )}
                        </TabsContent>
                        <TabsContent value="messages" className="p-0 m-0">
                          <div className="p-16 flex flex-col items-center justify-center text-center text-text-muted">
                            <Shield className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium text-foreground">Confidentialité protégée</p>
                            <p className="mt-2 text-14 max-w-sm">Le contenu des messages privés n'est pas accessible aux administrateurs. Seules les statistiques de volume sont visibles.</p>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
