import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Menu, X, Bell, Plus, ChevronDown, LogOut, User, Shield, MessageSquare, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { CITIES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import KYCBadge from '@/components/auth/KYCBadge';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('Brazzaville');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, profile, setShowLoginModal, setShowRegisterModal, setShowKYCModal, signOut } = useAuthStore();
  const { unreadCount } = useNotifications();

  const isAuthenticated = !!user;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) setCityDropdownOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/annonces?q=${encodeURIComponent(searchQuery.trim())}&ville=${encodeURIComponent(selectedCity)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-xs">
      {/* Desktop */}
      <div className="hidden md:flex items-center h-16 container mx-auto gap-4">
        <Link to="/" className="flex-shrink-0"><Logo size="md" /></Link>

        <div className="flex-1 max-w-[480px] flex items-center bg-background border border-border rounded-input overflow-hidden">
          <div className="relative" ref={cityDropdownRef}>
            <button onClick={() => setCityDropdownOpen(!cityDropdownOpen)} className="flex items-center gap-1 px-3 h-10 text-14 text-muted-foreground border-r border-border hover:bg-surface transition-colors">
              {selectedCity}<ChevronDown className="w-3.5 h-3.5" />
            </button>
            {cityDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-input shadow-md z-50 min-w-[180px]">
                <button onClick={() => { setSelectedCity('Toutes les villes'); setCityDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-14 hover:bg-primary-light transition-colors">Toutes les villes</button>
                {CITIES.map(city => (
                  <button key={city} onClick={() => { setSelectedCity(city); setCityDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-14 hover:bg-primary-light transition-colors">{city}</button>
                ))}
              </div>
            )}
          </div>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Que cherchez-vous ?" className="flex-1 h-10 px-3 text-14 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          <button onClick={handleSearch} className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary-dark transition-colors"><Search className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/messages')} className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-11 font-semibold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-pill hover:bg-background transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-14 overflow-hidden">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-surface border border-border rounded-card shadow-md z-50 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-14 font-semibold text-foreground">{profile?.full_name || 'Utilisateur'}</p>
                      <p className="text-12 text-muted-foreground">{profile?.email || user?.email}</p>
                      <div className="mt-1.5"><KYCBadge level={profile?.kyc_level ?? 0} status={profile?.kyc_status ?? 'none'} /></div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { navigate('/profil'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-foreground hover:bg-primary-light transition-colors flex items-center gap-2"><User className="w-4 h-4" /> Mon profil</button>
                      <button onClick={() => { navigate('/profil?tab=listings'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-foreground hover:bg-primary-light transition-colors flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Mes annonces</button>
                      <button onClick={() => { navigate('/messages'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-foreground hover:bg-primary-light transition-colors flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Messages</button>
                      <button onClick={() => { navigate('/profil?tab=favoris'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-foreground hover:bg-primary-light transition-colors flex items-center gap-2"><Heart className="w-4 h-4" /> Favoris</button>
                      {(profile?.kyc_level ?? 0) < 2 && (
                        <button onClick={() => { setShowKYCModal(true); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-primary font-medium hover:bg-primary-light transition-colors flex items-center gap-2"><Shield className="w-4 h-4" /> Vérifier mon identité</button>
                      )}
                      <div className="border-t border-border my-1" />
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-danger hover:bg-danger-light transition-colors flex items-center gap-2"><LogOut className="w-4 h-4" /> Se déconnecter</button>
                    </div>
                  </div>
                )}
              </div>

              <Button variant="default" size="default" className="gap-1.5" onClick={() => navigate('/deposer')}><Plus className="w-4 h-4" />Déposer une annonce</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowLoginModal(true)}>Se connecter</Button>
              <Button variant="default" size="default" className="gap-1.5" onClick={() => setShowRegisterModal(true)}><Plus className="w-4 h-4" />Déposer une annonce</Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center h-14 px-4 gap-3">
        <Link to="/" className="flex-shrink-0"><Logo size="sm" /></Link>
        <div className="flex-1 flex items-center bg-background border border-border rounded-input overflow-hidden h-9">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Rechercher..." className="flex-1 h-full px-3 text-14 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          <button onClick={handleSearch} className="h-full px-3 bg-primary text-primary-foreground"><Search className="w-4 h-4" /></button>
        </div>
        {isAuthenticated && (
          <button onClick={() => navigate('/messages')} className="relative p-1.5 text-muted-foreground">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-11 font-semibold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
        )}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 text-muted-foreground">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3 animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-border mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-16 overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div><p className="text-14 font-semibold text-foreground">{profile?.full_name}</p><KYCBadge level={profile?.kyc_level ?? 0} status={profile?.kyc_status ?? 'none'} /></div>
              </div>
              <Button variant="default" className="w-full gap-1.5" onClick={() => { navigate('/deposer'); setMobileMenuOpen(false); }}><Plus className="w-4 h-4" />Déposer une annonce</Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => { navigate('/profil'); setMobileMenuOpen(false); }}><User className="w-4 h-4 mr-2" /> Mon profil</Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => { navigate('/messages'); setMobileMenuOpen(false); }}><MessageSquare className="w-4 h-4 mr-2" /> Messages</Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => { navigate('/profil?tab=favoris'); setMobileMenuOpen(false); }}><Heart className="w-4 h-4 mr-2" /> Favoris</Button>
              <Button variant="ghost" className="w-full justify-start text-danger" onClick={() => { signOut(); setMobileMenuOpen(false); }}><LogOut className="w-4 h-4 mr-2" /> Se déconnecter</Button>
            </>
          ) : (
            <>
              <Button variant="default" className="w-full gap-1.5" onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false); }}><Plus className="w-4 h-4" />Déposer une annonce</Button>
              <Button variant="outline" className="w-full" onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}>Se connecter</Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
