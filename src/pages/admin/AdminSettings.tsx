import React, { useState } from 'react';
import { 
  Save,
  Zap,
  Shield,
  Layout,
  Settings as SettingsIcon,
  Tag,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const AdminSettings = () => {
  // Boosts State
  const [boosts, setBoosts] = useState({
    visibilite: { price: 2500, days: 7 },
    premium: { price: 5000, days: 14 },
    pro: { price: 15000, days: 30 }
  });

  // Auto-mod State
  const [blacklistInput, setBlacklistInput] = useState('');
  const [blacklist, setBlacklist] = useState(['arnaque', 'faux billet', 'broutage']);
  const [minPhotos, setMinPhotos] = useState(1);

  // System State
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('Le site est en cours de maintenance. Veuillez patienter.');
  const [smsProvider, setSmsProvider] = useState('twilio');
  const [maxListings, setMaxListings] = useState(10);

  const handleSave = () => {
    toast.success('Paramètres sauvegardés avec succès', {
      description: 'Les modifications sont appliquées immédiatement.'
    });
  };

  const addBlacklistWord = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && blacklistInput.trim()) {
      e.preventDefault();
      if (!blacklist.includes(blacklistInput.trim().toLowerCase())) {
        setBlacklist([...blacklist, blacklistInput.trim().toLowerCase()]);
      }
      setBlacklistInput('');
    }
  };

  const removeBlacklistWord = (word: string) => {
    setBlacklist(blacklist.filter(w => w !== word));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-24 font-bold text-foreground font-heading">Paramètres de la plateforme</h1>
          <p className="text-14 text-text-secondary mt-1">Gérez les tarifs, la modération automatique et le système</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white gap-2">
          <Save className="w-4 h-4" /> Enregistrer les modifications
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation gauche */}
        <div className="w-full md:w-64 shrink-0">
          <Tabs defaultValue="boosts" orientation="vertical" className="w-full" onValueChange={() => {}}>
            <TabsList className="flex flex-col h-auto w-full bg-surface border border-border p-2 space-y-1">
              <TabsTrigger value="boosts" className="w-full justify-start text-left data-[state=active]:bg-primary-light/50 data-[state=active]:text-primary-dark data-[state=active]:shadow-none">
                <Zap className="w-4 h-4 mr-2" /> Tarifs des Boosts
              </TabsTrigger>
              <TabsTrigger value="automod" className="w-full justify-start text-left data-[state=active]:bg-primary-light/50 data-[state=active]:text-primary-dark data-[state=active]:shadow-none">
                <Shield className="w-4 h-4 mr-2" /> Modération auto
              </TabsTrigger>
              <TabsTrigger value="homepage" className="w-full justify-start text-left data-[state=active]:bg-primary-light/50 data-[state=active]:text-primary-dark data-[state=active]:shadow-none">
                <Layout className="w-4 h-4 mr-2" /> Page d'accueil
              </TabsTrigger>
              <TabsTrigger value="system" className="w-full justify-start text-left data-[state=active]:bg-primary-light/50 data-[state=active]:text-primary-dark data-[state=active]:shadow-none">
                <SettingsIcon className="w-4 h-4 mr-2" /> Système
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Section 1: Boosts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-16 flex items-center gap-2 font-heading">
                  <Zap className="w-5 h-5 text-primary" /> Tarifs des Boosts
                </CardTitle>
                <CardDescription>
                  Ajustez les prix et durées des packages sponsorisés. Les changements sont immédiats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-surface p-4 rounded-card border border-border">
                  <div>
                    <h3 className="font-semibold text-15 text-foreground">Pack Visibilité</h3>
                    <p className="text-13 text-text-secondary">Couleur de fond spécifique dans les listes</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-12 font-medium text-text-muted mb-1 block">Prix (FCFA)</label>
                      <input 
                        type="number" 
                        className="w-full h-10 px-3 rounded-input border border-border text-14 outline-none focus:border-primary"
                        value={boosts.visibilite.price}
                        onChange={e => setBoosts({...boosts, visibilite: {...boosts.visibilite, price: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-12 font-medium text-text-muted mb-1 block">Jours</label>
                      <input 
                        type="number" 
                        className="w-full h-10 px-3 rounded-input border border-border text-14 outline-none focus:border-primary"
                        value={boosts.visibilite.days}
                        onChange={e => setBoosts({...boosts, visibilite: {...boosts.visibilite, days: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-surface p-4 rounded-card border border-border">
                  <div>
                    <h3 className="font-semibold text-15 text-foreground">Pack Premium</h3>
                    <p className="text-13 text-text-secondary">Badge Premium + Remontée quotidienne</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-12 font-medium text-text-muted mb-1 block">Prix (FCFA)</label>
                      <input 
                        type="number" 
                        className="w-full h-10 px-3 rounded-input border border-border text-14 outline-none focus:border-primary"
                        value={boosts.premium.price}
                        onChange={e => setBoosts({...boosts, premium: {...boosts.premium, price: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-12 font-medium text-text-muted mb-1 block">Jours</label>
                      <input 
                        type="number" 
                        className="w-full h-10 px-3 rounded-input border border-border text-14 outline-none focus:border-primary"
                        value={boosts.premium.days}
                        onChange={e => setBoosts({...boosts, premium: {...boosts.premium, days: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-surface p-4 rounded-card border border-border">
                  <div>
                    <h3 className="font-semibold text-15 text-foreground">Pack Pro</h3>
                    <p className="text-13 text-text-secondary">Badge Or + En-tête de catégorie constant</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-12 font-medium text-text-muted mb-1 block">Prix (FCFA)</label>
                      <input 
                        type="number" 
                        className="w-full h-10 px-3 rounded-input border border-border text-14 outline-none focus:border-primary"
                        value={boosts.pro.price}
                        onChange={e => setBoosts({...boosts, pro: {...boosts.pro, price: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-12 font-medium text-text-muted mb-1 block">Jours</label>
                      <input 
                        type="number" 
                        className="w-full h-10 px-3 rounded-input border border-border text-14 outline-none focus:border-primary"
                        value={boosts.pro.days}
                        onChange={e => setBoosts({...boosts, pro: {...boosts.pro, days: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-16 flex items-center gap-2 font-heading">
                  <Shield className="w-5 h-5 text-primary" /> Modération Automatique
                </CardTitle>
                <CardDescription>
                  Règles déclenchant un signalement automatique ou bloquant la soumission d'une annonce.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-14 font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Tag className="w-4 h-4 text-text-secondary" /> Liste noire de mots-clés
                  </label>
                  <p className="text-13 text-text-muted mb-3">
                    Signale automatiquement les annonces contenant ces mots. Appuyez sur Entrée pour ajouter.
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 border border-border rounded-card bg-surface min-h-[100px] content-start">
                    {blacklist.map((word) => (
                      <span key={word} className="inline-flex items-center gap-1.5 bg-danger/10 text-danger-dark px-3 py-1 rounded text-13 font-medium">
                        {word}
                        <button onClick={() => removeBlacklistWord(word)} className="text-danger hover:text-danger-dark hover:bg-danger/20 p-0.5 rounded-full transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      className="bg-transparent border-none outline-none text-14 flex-1 min-w-[120px]"
                      placeholder="Ajouter un mot..."
                      value={blacklistInput}
                      onChange={e => setBlacklistInput(e.target.value)}
                      onKeyDown={addBlacklistWord}
                    />
                  </div>
                </div>

                <div className="h-px bg-border w-full my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-14 font-medium text-foreground mb-2 block">Photos minimum exigées</label>
                    <Select value={minPhotos.toString()} onValueChange={(val) => setMinPhotos(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre de photos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Aucune (0)</SelectItem>
                        <SelectItem value="1">Au moins 1 photo</SelectItem>
                        <SelectItem value="2">Au moins 2 photos</SelectItem>
                        <SelectItem value="3">Au moins 3 photos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-14 font-medium text-foreground mb-2 block">Prix anormal (Alerte auto)</label>
                    <div className="flex items-center gap-2 text-13 text-text-secondary bg-surface p-3 border border-border rounded-card">
                      <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                      <p>Les seuils de prix anormaux par catégorie sont actuellement configurés via la base de données JSON.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-16 flex items-center gap-2 font-heading">
                  <SettingsIcon className="w-5 h-5 text-primary" /> Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border border-border rounded-card bg-surface">
                  <div>
                    <h3 className="font-semibold text-15 text-foreground flex items-center gap-2">
                       Mode Maintenance
                       {maintenance && <span className="text-10 bg-warning text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">Actif</span>}
                    </h3>
                    <p className="text-13 text-text-secondary mt-1">Désactive l'accès à la plateforme pour les utilisateurs non-admins.</p>
                  </div>
                  <Switch 
                    checked={maintenance}
                    onCheckedChange={setMaintenance}
                    className="data-[state=checked]:bg-warning"
                  />
                </div>
                
                {maintenance && (
                  <div className="animate-fade-in">
                    <label className="text-14 font-medium text-foreground mb-2 block">Message de maintenance (affiché aux utilisateurs)</label>
                    <textarea 
                      className="w-full h-24 p-3 rounded-card border border-border focus:border-warning outline-none text-14 resize-none"
                      value={maintenanceMsg}
                      onChange={e => setMaintenanceMsg(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-14 font-medium text-foreground mb-2 block">Fournisseur SMS</label>
                    <Select value={smsProvider} onValueChange={setSmsProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="africastalking">Africa's Talking</SelectItem>
                        <SelectItem value="hubtel">Hubtel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-14 font-medium text-foreground mb-2 block">Limite annonces / jour / utilisateur</label>
                    <input 
                      type="number" 
                      className="w-full h-10 px-3 rounded-input border border-border text-14 outline-none focus:border-primary"
                      value={maxListings}
                      onChange={e => setMaxListings(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-12 text-text-muted mt-1.5">Évite le spam de masse par des bots.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
