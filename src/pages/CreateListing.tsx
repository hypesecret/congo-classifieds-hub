import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, Upload, Camera, Image as ImageIcon, X, GripVertical,
  Check, Smartphone, CreditCard,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ListingCard from '@/components/listing/ListingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES as MOCK_CATEGORIES, CITIES, formatPrice } from '@/lib/constants';
import { getSpecsForCategory } from '@/lib/categorySpecs';
import { useAuthStore } from '@/stores/authStore';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const STEPS = [
  { label: 'Catégorie', short: '1' },
  { label: 'Détails', short: '2' },
  { label: 'Photos', short: '3' },
  { label: 'Prix & Lieu', short: '4' },
  { label: 'Aperçu', short: '5' },
];

// Subcategories are now fetched from Supabase

const BOOST_PACKS = [
  {
    id: 'free',
    name: 'Annonce Gratuite',
    price: 0,
    features: ['Publication dans les résultats', '60 jours de visibilité'],
    missing: ['Pas de mise en avant'],
  },
  {
    id: 'visibility',
    name: 'Annonce Boostée',
    price: 2500,
    badge: 'Populaire',
    badgeColor: 'bg-accent text-accent-foreground',
    features: ['Tout du gratuit', 'Top des résultats 7 jours', 'Badge « En vedette »', '3x plus de vues estimées'],
  },
  {
    id: 'premium',
    name: 'Annonce Premium',
    price: 5000,
    badge: 'Recommandé',
    badgeColor: 'bg-primary text-primary-foreground',
    features: ['Tout du boosté', 'Carrousel homepage 14 jours', 'Badge « Premium » or visible', '8x plus de vues estimées'],
  },
  {
    id: 'pro',
    name: 'Annonce Pro',
    price: 15000,
    features: ['Tout du premium (30 jours)', 'Stats détaillées (vues, contacts)', 'Position #1 dans la catégorie', 'Support prioritaire'],
  },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, setShowLoginModal } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [city, setCity] = useState(profile?.city || 'Brazzaville');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [showPhone, setShowPhone] = useState(true);
  const [boostPack, setBoostPack] = useState('free');
  const [paymentMethod, setPaymentMethod] = useState('mtn');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  if (!user) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center max-w-lg">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Déposez votre annonce</h1>
          <p className="text-14 text-text-muted mb-6">Connectez-vous pour publier une annonce sur Expat-Congo.</p>
          <Button variant="default" size="lg" onClick={() => setShowLoginModal(true)}>Se connecter</Button>
        </div>
      </PageWrapper>
    );
  }

  const { data: mainCategories } = useCategories();
  const { data: subCategories } = useCategories(selectedCategory || null);

  const categoryObj = mainCategories?.find((c) => c.id === selectedCategory);
  const categorySpecs = getSpecsForCategory(categoryObj?.slug || '');

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - photos.length;
    const toAdd = files.slice(0, remaining);
    setPhotos((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedCategory;
      case 2: return title.length >= 5;
      case 3: return photos.length >= 1;
      case 4: return (!!price || isFree) && !!city;
      default: return true;
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const photo of photos) {
        const filePath = `${user.id}/${Date.now()}-${photo.name}`;
        const { error } = await supabase.storage.from('listing-images').upload(filePath, photo);
        if (!error) {
          const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(filePath);
          imageUrls.push(urlData.publicUrl);
        }
      }

      const { error } = await supabase.from('listings').insert({
        user_id: user.id,
        title,
        description,
        price: isFree ? 0 : parseInt(price) || 0,
        price_negotiable: priceNegotiable,
        is_free: isFree,
        city,
        neighborhood: neighborhood || null,
        images: imageUrls,
        cover_image: imageUrls[0] || null,
        specs,
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory,
        is_sponsored: boostPack !== 'free',
        sponsor_level: boostPack !== 'free' ? boostPack : null,
      });

      if (error) throw error;

      setPublished(true);
      toast({ title: 'Annonce soumise !', description: 'Elle sera publiée après vérification par notre équipe.' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue. Réessayez dans quelques secondes.', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center max-w-lg">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-24 font-heading font-bold text-foreground mb-2">Votre annonce a été soumise !</h1>
          <p className="text-14 text-text-muted mb-8">Elle sera publiée après vérification par notre équipe (&lt; 2 heures)</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>Voir mon annonce</Button>
            <Button variant="default" onClick={() => { setPublished(false); setStep(1); setSelectedCategory(''); setSelectedSubcategory(''); setTitle(''); setDescription(''); setPhotos([]); setPhotoPreviews([]); setPrice(''); setBoostPack('free'); }}>
              Déposer une autre annonce
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const previewListing = {
    id: 'preview',
    title: title || 'Votre annonce',
    price: isFree ? 0 : parseInt(price) || 0,
    isFree,
    city,
    neighborhood,
    category: categoryObj?.name || '',
    imageUrl: photoPreviews[0] || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop',
    isSponsored: boostPack !== 'free',
    sponsorLevel: boostPack as any,
    createdAt: 'À l\'instant',
    userName: profile?.full_name || 'Vous',
    isVerified: (profile?.kyc_level ?? 0) >= 2,
    priceNegotiable,
  };

  return (
    <PageWrapper>
      <div className="container mx-auto py-6 max-w-[720px]">
        {/* Progress bar */}
        <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
          <div className="h-1 bg-background">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
          </div>

          {/* Step labels (desktop) */}
          <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`text-12 font-medium transition-colors ${i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-text-secondary cursor-pointer' : 'text-text-muted'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Step dots (mobile) */}
          <div className="flex md:hidden items-center justify-center gap-2 py-3 border-b border-border">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i + 1 === step ? 'bg-primary' : i + 1 < step ? 'bg-primary/40' : 'bg-border-strong'}`} />
            ))}
          </div>

          <div className="p-6">
            {/* STEP 1 — Catégorie */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-20 font-heading font-bold text-foreground">Dans quelle catégorie ?</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mainCategories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(''); }}
                      className={`p-4 rounded-card border transition-all text-left ${selectedCategory === cat.id ? 'border-primary bg-primary-light shadow-sm' : 'border-border bg-background hover:border-border-strong'}`}
                    >
                      <div className="w-10 h-10 rounded-category flex items-center justify-center mb-2" style={{ backgroundColor: cat.color }}>
                        <span className="text-16">🏷</span>
                      </div>
                      <p className="text-14 font-medium text-foreground">{cat.name}</p>
                    </button>
                  ))}
                </div>
                {selectedCategory && subCategories && subCategories.length > 0 && (
                  <div>
                    <p className="text-14 font-medium text-foreground mb-2">Sous-catégorie</p>
                    <div className="flex flex-wrap gap-2">
                      {subCategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubcategory(sub.id)}
                          className={`px-4 py-2 rounded-pill text-14 border transition-colors ${selectedSubcategory === sub.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border text-text-secondary hover:border-border-strong'}`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Détails */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-20 font-heading font-bold text-foreground">Détails de l'annonce</h2>

                <div>
                  <label className="text-14 font-medium text-foreground block mb-1">Titre de l'annonce</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                    placeholder="Ex: iPhone 14 Pro Max 256GB Noir"
                    className="rounded-input"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-11 text-text-muted">Un titre précis attire 2x plus de contacts</span>
                    <span className="text-11 text-text-muted">{title.length}/80</span>
                  </div>
                </div>

                {/* Dynamic specs */}
                {categorySpecs.length > 0 && (
                  <div className="space-y-3">
                    {categorySpecs.map((spec) => (
                      <div key={spec.key}>
                        <label className="text-14 font-medium text-foreground block mb-1">{spec.label}</label>
                        {spec.type === 'select' && spec.options ? (
                          <select
                            value={specs[spec.key] || ''}
                            onChange={(e) => setSpecs({ ...specs, [spec.key]: e.target.value })}
                            className="w-full h-10 px-3 rounded-input border border-input bg-background text-14 text-foreground"
                          >
                            <option value="">Sélectionner</option>
                            {spec.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : spec.type === 'toggle' ? (
                          <button
                            onClick={() => setSpecs({ ...specs, [spec.key]: specs[spec.key] === 'true' ? 'false' : 'true' })}
                            className={`px-4 py-2 rounded-pill text-14 border transition-colors ${specs[spec.key] === 'true' ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border text-text-secondary'}`}
                          >
                            {specs[spec.key] === 'true' ? 'Oui' : 'Non'}
                          </button>
                        ) : (
                          <div className="relative">
                            <Input
                              type={spec.type === 'number' ? 'number' : 'text'}
                              value={specs[spec.key] || ''}
                              onChange={(e) => setSpecs({ ...specs, [spec.key]: e.target.value })}
                              placeholder={spec.placeholder}
                              className="rounded-input"
                            />
                            {spec.unit && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-12 text-text-muted">{spec.unit}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-14 font-medium text-foreground block mb-1">Description détaillée</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                    placeholder="Décrivez votre article : état, caractéristiques, raison de la vente..."
                    rows={5}
                    className="rounded-input"
                  />
                  <p className="text-11 text-text-muted text-right mt-1">{description.length}/2000</p>
                </div>
              </div>
            )}

            {/* STEP 3 — Photos */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-20 font-heading font-bold text-foreground">Ajoutez des photos</h2>
                  <p className="text-14 text-text-muted mt-1">Les annonces avec photos reçoivent 5x plus de contacts</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="hidden"
                  onChange={handlePhotoAdd}
                />

                {/* Photo grid */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {photoPreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-card overflow-hidden border border-border group">
                      <img src={preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-11 rounded-pill">Photo principale</span>
                      )}
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-foreground/60 text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 10 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-card border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-primary" />
                      <span className="text-11 text-text-muted text-center">Ajouter</span>
                    </button>
                  )}
                </div>

                <p className="text-12 text-text-muted">JPG, PNG — Max 10 photos — 5MB chacune</p>

                {/* Mobile camera buttons */}
                <div className="flex gap-3 md:hidden">
                  <Button variant="default" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4" /> Prendre une photo
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="w-4 h-4" /> Galerie
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4 — Prix & Localisation */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-20 font-heading font-bold text-foreground">Prix & Localisation</h2>

                {/* Price */}
                <div className="space-y-3">
                  <div>
                    <label className="text-14 font-medium text-foreground block mb-1">Prix de vente</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={isFree ? '' : price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Ex: 75000"
                        disabled={isFree}
                        className="rounded-input pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-12 text-text-muted font-medium">FCFA</span>
                    </div>
                    {price && !isFree && (
                      <p className="text-12 text-text-muted mt-1">Votre annonce affichera : {formatPrice(parseInt(price))}</p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={priceNegotiable} onChange={(e) => setPriceNegotiable(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-14 text-text-secondary">Prix négociable</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isFree} onChange={(e) => { setIsFree(e.target.checked); if (e.target.checked) setPrice(''); }} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-14 text-text-secondary">Article gratuit (don)</span>
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <div>
                    <label className="text-14 font-medium text-foreground block mb-1">Ville</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-input bg-background text-14 text-foreground"
                    >
                      {[...CITIES, 'Autre'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-14 font-medium text-foreground block mb-1">Quartier</label>
                    <Input
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Bacongo, Poto-Poto, Moungali"
                      className="rounded-input"
                    />
                  </div>
                  <div>
                    <label className="text-14 font-medium text-foreground block mb-1">Téléphone de contact</label>
                    <div className="flex items-center gap-2">
                      <span className="text-14 text-text-secondary">🇨🇬 +242</span>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="06 XXX XXXX"
                        className="rounded-input flex-1"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-14 text-text-secondary">Afficher le numéro sur l'annonce</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5 — Aperçu & Publication */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-20 font-heading font-bold text-foreground">Aperçu & Publication</h2>

                <div>
                  <p className="text-14 text-text-muted mb-3">Voici comment apparaîtra votre annonce</p>
                  <div className="max-w-[280px]">
                    <ListingCard listing={previewListing} />
                  </div>
                </div>

                {/* Boost packs */}
                <div>
                  <h3 className="text-16 font-heading font-semibold text-foreground mb-3">Donnez plus de visibilité à votre annonce</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {BOOST_PACKS.map((pack) => (
                      <button
                        key={pack.id}
                        onClick={() => setBoostPack(pack.id)}
                        className={`p-4 rounded-card border text-left transition-all relative ${boostPack === pack.id ? 'border-primary bg-primary-light shadow-sm' : 'border-border bg-background hover:border-border-strong'}`}
                      >
                        {pack.badge && (
                          <span className={`absolute -top-2 right-3 px-2 py-0.5 text-11 font-semibold rounded-pill ${pack.badgeColor}`}>
                            {pack.badge}
                          </span>
                        )}
                        <p className="text-14 font-semibold text-foreground">{pack.name}</p>
                        <p className="text-16 font-heading font-bold text-primary mt-1">
                          {pack.price === 0 ? 'Gratuit' : formatPrice(pack.price)}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {pack.features.map((f) => (
                            <li key={f} className="text-12 text-text-secondary flex items-start gap-1.5">
                              <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" /> {f}
                            </li>
                          ))}
                          {pack.missing?.map((m) => (
                            <li key={m} className="text-12 text-text-muted flex items-start gap-1.5">
                              <X className="w-3 h-3 text-text-muted mt-0.5 flex-shrink-0" /> {m}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                {boostPack !== 'free' && (
                  <div className="space-y-3 bg-background rounded-card p-4 border border-border">
                    <p className="text-14 font-medium text-foreground">Mode de paiement</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'mtn', label: 'MTN Mobile Money', icon: Smartphone },
                        { id: 'airtel', label: 'Airtel Money', icon: Smartphone },
                        { id: 'card', label: 'Carte bancaire', icon: CreditCard },
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`flex-1 p-3 rounded-input border text-center transition-colors ${paymentMethod === pm.id ? 'border-primary bg-primary-light' : 'border-border bg-surface'}`}
                        >
                          <pm.icon className="w-5 h-5 mx-auto mb-1 text-text-secondary" />
                          <span className="text-11 text-text-secondary">{pm.label}</span>
                        </button>
                      ))}
                    </div>
                    {(paymentMethod === 'mtn' || paymentMethod === 'airtel') && (
                      <div>
                        <Input
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder={paymentMethod === 'mtn' ? '+242 06 XXX XXXX' : '+242 05 XXX XXXX'}
                          className="rounded-input"
                        />
                        <p className="text-11 text-text-muted mt-1">Vous recevrez une demande de paiement sur votre téléphone</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-border">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  ← Retour
                </Button>
              )}
              <div className="ml-auto">
                {step < 5 ? (
                  <Button
                    variant="default"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="gap-1.5"
                  >
                    Continuer <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handlePublish}
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publication en cours...'
                      : boostPack === 'free'
                        ? 'Publier mon annonce gratuitement'
                        : `Payer ${formatPrice(BOOST_PACKS.find((p) => p.id === boostPack)?.price || 0)} et publier`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CreateListing;
