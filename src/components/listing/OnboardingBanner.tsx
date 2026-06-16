import { useState, useEffect } from "react";
import { Lightbulb, X, Camera, FileText, DollarSign } from "lucide-react";

const STORAGE_KEY = "ec_onboarding_create_dismissed";

const tips = [
  { icon: Camera, text: "Ajoutez 3 à 8 photos nettes — c'est ce qui vend le plus vite." },
  { icon: FileText, text: "Soyez précis dans le titre (marque, modèle, état)." },
  { icon: DollarSign, text: "Un prix juste = contact rapide. Comparez aux annonces similaires." },
];

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="mb-4 rounded-card border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 relative animate-in fade-in slide-in-from-top-2">
      <button
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute top-2 right-2 text-text-muted hover:text-foreground p-1"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Première annonce ? Suivez nos conseils</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((t) => (
          <li key={t.text} className="flex gap-2 items-start text-sm text-text-secondary">
            <t.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
