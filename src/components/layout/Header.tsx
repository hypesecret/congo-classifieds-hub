import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Menu, X, Bell, Plus, ChevronDown, LogOut, User, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CITIES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import KYCBadge from '@/components/auth/KYCBadge';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('Brazzaville');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, profile, setShowLoginModal, setShowRegisterModal, setShowKYCModal, signOut } = useAuthStore();

  const isAuthenticated = !!user;

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-xs">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center h-16 container mx-auto gap-4">
          <Link to="/" className="flex-shrink-0 font-heading font-bold text-24 text-primary">
            Expat-Congo
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-[480px] flex items-center bg-background border border-border rounded-input overflow-hidden">
            <div className="relative">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1 px-3 h-10 text-14 text-text-secondary border-r border-border hover:bg-surface transition-colors"
              >
                {selectedCity}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-input shadow-md z-50 min-w-[180px]">
                  <button
                    onClick={() => { setSelectedCity('Toutes les villes'); setCityDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-14 hover:bg-primary-light transition-colors"
                  >
                    Toutes les villes
                  </button>
                  {CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setCityDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-14 hover:bg-primary-light transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) navigate(`/annonces?q=${encodeURIComponent(searchQuery.trim())}&ville=${encodeURIComponent(selectedCity)}`); }}
              placeholder="Que cherchez-vous ? Ex: iPhone, appartement..."
              className="flex-1 h-10 px-3 text-14 bg-transparent outline-none text-foreground placeholder:text-text-muted"
            />
            <button
              onClick={() => { if (searchQuery.trim()) navigate(`/annonces?q=${encodeURIComponent(searchQuery.trim())}&ville=${encodeURIComponent(selectedCity)}`); }}
              className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary-dark transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            {isAuthenticated ? (
              <>
                <button className="relative p-2 text-text-secondary hover:text-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-primary-foreground text-11 font-semibold rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-pill hover:bg-background transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-14">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-surface border border-border rounded-card shadow-md z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-14 font-semibold text-foreground">{profile?.full_name || 'Utilisateur'}</p>
                        <p className="text-12 text-text-muted">{profile?.email || user?.email}</p>
                        <div className="mt-1.5">
                          <KYCBadge level={profile?.kyc_level ?? 0} status={profile?.kyc_status ?? 'none'} />
                        </div>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { navigate('/messages'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-foreground hover:bg-primary-light transition-colors flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Messages
                        </button>
                        <button onClick={() => { navigate('/annonces'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-14 text-foreground hover:bg-primary-light transition-colors flex items-center gap-2">
                          <User className="w-4 h-4" /> Mes annonces
                        </button>
                        {(profile?.kyc_level ?? 0) < 2 && (
                          <button
                            onClick={() => { setShowKYCModal(true); setUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-14 text-primary font-medium hover:bg-primary-light transition-colors flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4" /> Vérifier mon identité
                          </button>
                        )}
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-14 text-danger hover:bg-danger-light transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="default" size="default" className="gap-1.5" onClick={() => navigate('/deposer')}>
                  <Plus className="w-4 h-4" />
                  Déposer une annonce
                </Button>
              </>
            ) : (
              <>
                <button className="relative p-2 text-text-secondary hover:text-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <Button variant="outline" size="sm" onClick={() => setShowLoginModal(true)}>
                  Se connecter
                </Button>
                <Button variant="default" size="default" className="gap-1.5" onClick={() => setShowRegisterModal(true)}>
                  <Plus className="w-4 h-4" />
                  Déposer une annonce
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center h-14 px-4 gap-3">
          <Link to="/" className="font-heading font-bold text-20 text-primary">
            Expat-Congo
          </Link>
          <div className="flex-1 flex items-center bg-background border border-border rounded-input overflow-hidden h-9">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) navigate(`/annonces?q=${encodeURIComponent(searchQuery.trim())}`); }}
              placeholder="Rechercher..."
              className="flex-1 h-full px-3 text-14 bg-transparent outline-none text-foreground placeholder:text-text-muted"
            />
            <button 
              onClick={() => { if (searchQuery.trim()) navigate(`/annonces?q=${encodeURIComponent(searchQuery.trim())}`); }}
              className="h-full px-3 bg-primary text-primary-foreground"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          {isAuthenticated && (
            <button className="relative p-1.5 text-text-secondary">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-danger text-primary-foreground text-11 font-semibold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-text-secondary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3 animate-fade-in">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-border mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-16">
                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-14 font-semibold text-foreground">{profile?.full_name}</p>
                    <KYCBadge level={profile?.kyc_level ?? 0} status={profile?.kyc_status ?? 'none'} />
                  </div>
                </div>
                <Button variant="default" className="w-full gap-1.5" onClick={() => { navigate('/deposer'); setMobileMenuOpen(false); }}>
                  <Plus className="w-4 h-4" />
                  Déposer une annonce
                </Button>
                <Button variant="ghost" className="w-full justify-start text-text-secondary" onClick={() => { navigate('/messages'); setMobileMenuOpen(false); }}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Messages
                </Button>
                <Button variant="ghost" className="w-full justify-start text-text-secondary" onClick={() => { navigate('/annonces'); setMobileMenuOpen(false); }}>
                  <User className="w-4 h-4 mr-2" /> Mes annonces
                </Button>
                {(profile?.kyc_level ?? 0) < 2 && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary"
                    onClick={() => { setShowKYCModal(true); setMobileMenuOpen(false); }}
                  >
                    <Shield className="w-4 h-4 mr-2" /> Vérifier mon identité
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-danger"
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" className="w-full gap-1.5" onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false); }}>
                  <Plus className="w-4 h-4" />
                  Déposer une annonce
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}>
                  Se connecter
                </Button>
                <Button variant="ghost" className="w-full justify-start text-text-secondary" onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false); }}>
                  Créer un compte gratuit
                </Button>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
