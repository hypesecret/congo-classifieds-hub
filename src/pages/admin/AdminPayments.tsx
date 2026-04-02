import React, { useState } from 'react';
import { 
  CreditCard,
  Download,
  AlertTriangle,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminPayments } from '@/hooks/useAdminPayments';

// Dummy Data removed, using useAdminPayments hook

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <span className="inline-flex items-center gap-1 text-12 font-medium px-2 py-0.5 rounded-full bg-success/10 text-success"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmé</span>;
    case 'pending':
      return <span className="inline-flex items-center gap-1 text-12 font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning-dark"><Clock className="w-3.5 h-3.5" /> En attente</span>;
    case 'failed':
      return <span className="inline-flex items-center gap-1 text-12 font-medium px-2 py-0.5 rounded-full bg-danger/10 text-danger"><XCircle className="w-3.5 h-3.5" /> Échoué</span>;
    case 'refunded':
      return <span className="inline-flex items-center gap-1 text-12 font-medium px-2 py-0.5 rounded-full bg-border text-text-secondary"><ArrowRightLeft className="w-3.5 h-3.5" /> Remboursé</span>;
    default:
      return null;
  }
};

const AdminPayments = () => {
  const { data, isLoading } = useAdminPayments();
  const transactions = data?.transactions || [];
  const boosts = data?.boosts || [];

  const formatFCFA = (value: number) => {
    return new Intl.NumberFormat('fr-CG', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);
  };

  // KPIs
  const totalThisMonth = transactions
    .filter(tx => tx.status === 'completed') // Simple month filter would be needed for real logic
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
  const successRate = transactions.length > 0 
    ? (transactions.filter(tx => tx.status === 'completed').length / transactions.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-24 font-bold text-foreground font-heading">Revenus & Paiements</h1>
          <p className="text-14 text-text-secondary mt-1">Suivez les transactions financières et les boosts actifs</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Exporter CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-14 font-medium text-text-secondary">Chiffre d'affaires (Total)</h3>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-24 font-bold text-foreground">{formatFCFA(totalThisMonth)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-14 font-medium text-text-secondary">Boosts actifs</h3>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-24 font-bold text-foreground">{boosts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-14 font-medium text-text-secondary">Taux de succès</h3>
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
            </div>
            <p className="text-24 font-bold text-success">{successRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-14 font-medium text-text-secondary">En attente</h3>
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-warning-dark" />
              </div>
            </div>
            <p className="text-24 font-bold text-warning-dark">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-surface border border-border">
          <TabsTrigger value="transactions">Transactions récentes</TabsTrigger>
          <TabsTrigger value="boosts">Boosts actifs</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4 space-y-4">
          <Card>
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-surface">
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="all-providers">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Opérateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-providers">Tous les opérateurs</SelectItem>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="airtel">Airtel Money</SelectItem>
                    <SelectItem value="carte">Carte Bancaire</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select defaultValue="all-status">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Confirmés</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="failed">Échoués</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Rechercher une réf, utilisateur..." 
                  className="w-full h-10 pl-9 pr-4 rounded-input border border-border text-14 outline-none focus:border-primary transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-14">
                <thead className="bg-background/50 border-b border-border text-text-secondary font-medium text-13">
                  <tr>
                    <th className="p-4 font-medium">Date & Réf</th>
                    <th className="p-4 font-medium">Utilisateur</th>
                    <th className="p-4 font-medium">Achat</th>
                    <th className="p-4 font-medium">Montant</th>
                    <th className="p-4 font-medium">Moyen de paiement</th>
                    <th className="p-4 font-medium text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-surface-hover transition-colors">
                      <td className="p-4">
                        <p className="text-foreground">{tx.date}</p>
                        <p className="text-12 text-text-muted font-mono mt-0.5">{tx.reference}</p>
                      </td>
                      <td className="p-4 font-medium text-foreground">{tx.user}</td>
                      <td className="p-4">
                        <p className="font-medium text-primary">{tx.pack}</p>
                        <p className="text-12 text-text-secondary truncate max-w-[200px] mt-0.5" title={tx.listing}>{tx.listing}</p>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {formatFCFA(tx.amount)}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {tx.provider}
                      </td>
                      <td className="p-4 text-right">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="boosts" className="mt-4 space-y-4">
          <Card>
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
              <h3 className="font-semibold text-16 text-foreground">Annonces sponsorisées actives</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-13 text-text-secondary">
                  <div className="w-2.5 h-2.5 rounded-full bg-success"></div> Active
                </span>
                <span className="flex items-center gap-1.5 text-13 text-text-secondary">
                  <div className="w-2.5 h-2.5 rounded-full bg-warning"></div> Expire bientôt
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-14">
                <thead className="bg-background/50 border-b border-border text-text-secondary font-medium text-13">
                  <tr>
                    <th className="p-4 font-medium">Annonce</th>
                    <th className="p-4 font-medium">Vendeur</th>
                    <th className="p-4 font-medium">Pack & Durée</th>
                    <th className="p-4 font-medium">Performance</th>
                    <th className="p-4 font-medium text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {boosts.map(boost => (
                    <tr key={boost.id} className={`hover:bg-surface-hover transition-colors ${boost.expiringSoon ? 'bg-warning/5' : ''}`}>
                      <td className="p-4 font-medium text-foreground">
                        {boost.listing}
                      </td>
                      <td className="p-4 text-text-secondary">{boost.seller}</td>
                      <td className="p-4">
                        <p className="font-medium text-primary">{boost.pack}</p>
                        <p className="text-12 text-text-secondary mt-0.5">
                          {boost.startDate} - {boost.expiryDate}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-13 text-foreground"><span className="font-semibold">{boost.performance.views}</span> vues</p>
                        <p className="text-12 text-text-secondary"><span className="font-semibold">{boost.performance.clicks}</span> clics</p>
                      </td>
                      <td className="p-4 text-right">
                        {boost.expiringSoon ? (
                          <span className="inline-flex items-center gap-1 text-12 font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning-dark">
                            <AlertTriangle className="w-3.5 h-3.5" /> Expire bientôt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-12 font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                            Actif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
