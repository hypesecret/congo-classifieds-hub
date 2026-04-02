import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  Activity, 
  UserPlus, 
  FileText, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAdminStats } from '@/hooks/useAdminStats';

// Dummy Data for charts
const listingsData = [
  { name: '1 Mar', total: 45, sponsored: 12 },
  { name: '5 Mar', total: 52, sponsored: 15 },
  { name: '10 Mar', total: 38, sponsored: 8 },
  { name: '15 Mar', total: 65, sponsored: 20 },
  { name: '20 Mar', total: 48, sponsored: 14 },
  { name: '25 Mar', total: 70, sponsored: 25 },
  { name: '30 Mar', total: 85, sponsored: 30 },
];

const revenueData = [
  { name: 'S1', mtn: 45000, airtel: 30000, carte: 15000 },
  { name: 'S2', mtn: 52000, airtel: 35000, carte: 20000 },
  { name: 'S3', mtn: 48000, airtel: 28000, carte: 18000 },
  { name: 'S4', mtn: 61000, airtel: 42000, carte: 25000 },
];

// Dummy activity removed, using useAdminStats hook

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();
  
  const pendingModeration = stats?.pendingModeration || 0;

  const formatFCFA = (value: number) => {
    return new Intl.NumberFormat('fr-CG', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-24 font-bold text-foreground font-heading">Vue d'ensemble</h1>
        <p className="text-14 text-text-secondary mt-1">Supervisez l'activité de la plateforme Expat-Congo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annonces Actives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-14 font-medium text-text-secondary">Annonces actives</CardTitle>
            <FileText className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-24 font-bold text-foreground">{stats?.activeListings || 0}</div>
            <p className="text-12 text-success flex items-center font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              Live maintenant
            </p>
          </CardContent>
        </Card>

        {/* En attente */}
        <Card className={pendingModeration > 10 ? "border-danger/30 bg-danger/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-14 font-medium text-text-secondary">Modération en attente</CardTitle>
            {pendingModeration > 10 ? (
              <span className="flex items-center text-11 bg-danger text-white px-2 py-0.5 rounded-full font-semibold">
                Urgent
              </span>
            ) : (
              <Activity className="w-4 h-4 text-text-muted" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-24 font-bold ${pendingModeration > 10 ? 'text-danger' : 'text-foreground'}`}>
              {pendingModeration}
            </div>
            <p className="text-12 text-text-muted flex items-center mt-1">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              Nécessite votre attention
            </p>
          </CardContent>
        </Card>

        {/* Utilisateurs inscrits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-14 font-medium text-text-secondary">Utilisateurs inscrits</CardTitle>
            <UserPlus className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-24 font-bold text-foreground">{stats?.totalUsers || 0}</div>
            <p className="text-12 text-success flex items-center font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              Comptes créés
            </p>
          </CardContent>
        </Card>

        {/* Revenus */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-14 font-medium text-text-secondary">Revenus (C.A.)</CardTitle>
            <CreditCard className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-24 font-bold text-foreground">{formatFCFA(stats?.totalRevenue || 0)}</div>
            <p className="text-12 text-success flex items-center font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              Global cumulé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-16 font-semibold text-foreground">Annonces publiées (30 jours)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={listingsData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="total" name="Total publiées" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="sponsored" name="Sponsorisées" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-16 font-semibold text-foreground">Revenus par semaine (FCFA)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                  formatter={(value: number) => [formatFCFA(value), '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="mtn" name="MTN Mobile Money" stackId="a" fill="#FFCC00" radius={[0, 0, 4, 4]} />
                <Bar dataKey="airtel" name="Airtel Money" stackId="a" fill="#E50000" />
                <Bar dataKey="carte" name="Carte Bancaire" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-16 font-semibold text-foreground">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(stats?.recentActivity || []).map((activity: any, index: number) => {
              const Icon = activity.type === 'user' ? UserPlus : FileText;
              const iconColor = activity.type === 'user' ? 'text-blue-500' : 'text-emerald-500';
              const bgColor = activity.type === 'user' ? 'bg-blue-100' : 'bg-emerald-100';

              return (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Timeline connector */}
                  {index !== (stats?.recentActivity?.length || 0) - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-border" />
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-14 font-medium text-foreground">{activity.title}</p>
                        <p className="text-13 text-text-secondary mt-0.5">{activity.description}</p>
                      </div>
                      <span className="text-12 text-text-muted whitespace-nowrap">{activity.time}</span>
                    </div>
                    <Link 
                      to={activity.link}
                      className="inline-block mt-2 text-13 text-primary font-medium hover:underline"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
