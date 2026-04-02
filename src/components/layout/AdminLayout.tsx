import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  UserCheck, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  Grid, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navigation = [
  { name: "Vue d'ensemble", path: '/admin', icon: LayoutDashboard },
  { name: 'Modération', path: '/admin/moderation', icon: Shield, badge: '12' },
  { name: 'KYC', path: '/admin/kyc', icon: UserCheck, badge: '5' },
  { name: 'Signalements', path: '/admin/reports', icon: AlertTriangle, badge: '3' },
  { name: 'Utilisateurs', path: '/admin/users', icon: Users },
  { name: 'Paiements', path: '/admin/payments', icon: CreditCard },
  { name: 'Catégories', path: '/admin/categories', icon: Grid },
  { name: 'Paramètres', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { profile, user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Sidebar - Fixed 240px */}
      <aside className="w-[240px] flex-shrink-0 bg-surface border-r border-border flex flex-col">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/admin" className="font-heading font-bold text-18 text-primary">
            Expat-Congo Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-card transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-14">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-11 px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-danger text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Area */}
        <div className="h-16 border-t border-border px-4 py-3 flex items-center justify-between bg-surface-hover">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-14">
              {profile?.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-14 font-semibold text-foreground truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-11 text-text-muted truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-1.5 text-text-secondary hover:text-danger transition-colors rounded-md"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F8F9FC]"> {/* Slight off-white for typical dashboards */}
        <div className="p-8 max-w-[1400px] mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
