export interface SpecField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  placeholder?: string;
  options?: string[];
  unit?: string;
  icon?: string;
}

export const CATEGORY_SPECS: Record<string, SpecField[]> = {
  immobilier: [
    { key: 'surface', label: 'Surface', type: 'number', unit: 'm²', icon: 'Ruler', placeholder: 'Ex: 85' },
    { key: 'chambres', label: 'Chambres', type: 'select', options: ['1', '2', '3', '4', '5+'], icon: 'BedDouble' },
    { key: 'salles_bain', label: 'Salles de bain', type: 'select', options: ['1', '2', '3+'], icon: 'Bath' },
    { key: 'etat', label: 'État', type: 'select', options: ['Neuf', 'Bon état', 'À rénover'], icon: 'Sparkles' },
    { key: 'meuble', label: 'Meublé', type: 'toggle', icon: 'Sofa' },
    { key: 'type_bien', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Terrain', 'Bureau', 'Magasin'], icon: 'Home' },
  ],
  vehicules: [
    { key: 'marque', label: 'Marque', type: 'select', options: ['Toyota', 'Mercedes', 'BMW', 'Nissan', 'Honda', 'Hyundai', 'Kia', 'Peugeot', 'Renault', 'Autre'], icon: 'Car' },
    { key: 'modele', label: 'Modèle', type: 'text', placeholder: 'Ex: RAV4', icon: 'Tag' },
    { key: 'annee', label: 'Année', type: 'select', options: Array.from({ length: 36 }, (_, i) => String(2025 - i)), icon: 'Calendar' },
    { key: 'kilometrage', label: 'Kilométrage', type: 'number', unit: 'km', placeholder: 'Ex: 45000', icon: 'Gauge' },
    { key: 'carburant', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique'], icon: 'Fuel' },
    { key: 'boite', label: 'Boîte', type: 'select', options: ['Automatique', 'Manuelle'], icon: 'Settings' },
  ],
  emploi: [
    { key: 'contrat', label: 'Type de contrat', type: 'select', options: ['CDI', 'CDD', 'Freelance', 'Stage', 'Intérim'], icon: 'FileText' },
    { key: 'salaire_negociable', label: 'Salaire à négocier', type: 'toggle', icon: 'Banknote' },
    { key: 'experience', label: 'Expérience requise', type: 'select', options: ['Débutant', '1-3 ans', '3-5 ans', '5-10 ans', '10+ ans'], icon: 'Award' },
    { key: 'secteur', label: 'Secteur', type: 'select', options: ['BTP', 'Commerce', 'Informatique', 'Santé', 'Éducation', 'Finance', 'Transport', 'Autre'], icon: 'Building2' },
  ],
};

export const getSpecsForCategory = (slug: string): SpecField[] => {
  return CATEGORY_SPECS[slug] || [];
};
