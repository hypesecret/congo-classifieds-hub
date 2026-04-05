import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, setShowLoginModal } = useAuthStore();
  const path = location.pathname;

  // Hide on admin and deposer pages
  if (path.startsWith('/admin')) return null;

  const tabs = [
    { id: 'home', icon: Home, label: 'Accueil', path: '/' },
    { id: 'search', icon: Search, label: 'Rechercher', path: '/annonces' },
    { id: 'post', icon: Plus, label: 'Déposer', path: '/deposer' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profil', path: '/profil' },
  ];

  const isActive = (tabPath: string) => {
    if (tabPath === '/') return path === '/';
    return path.startsWith(tabPath);
  };

  const handleTap = (tab: typeof tabs[0]) => {
    if ((tab.id === 'messages' || tab.id === 'profile' || tab.id === 'post') && !user) {
      setShowLoginModal(true);
      return;
    }
    navigate(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-end justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const isCenter = tab.id === 'post';

          if (isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTap(tab)}
                className="flex flex-col items-center -mt-3 active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Plus className="w-7 h-7 text-primary-foreground" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTap(tab)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 active:scale-95 transition-transform"
            >
              <tab.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-text-muted'}`} />
              <span className={`text-11 ${active ? 'text-primary font-medium' : 'text-text-muted'}`}>{tab.label}</span>
              {active && <div className="w-4 h-[3px] rounded-full bg-primary mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
