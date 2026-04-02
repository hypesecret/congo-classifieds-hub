import { Phone, Shield, AlertCircle } from 'lucide-react';

interface KYCBadgeProps {
  level: number;
  status: 'none' | 'phone_verified' | 'pending' | 'approved' | 'rejected';
  size?: 'sm' | 'md';
}

const KYCBadge = ({ level, status, size = 'sm' }: KYCBadgeProps) => {
  const sizeClass = size === 'sm' ? 'text-11 px-2 py-0.5 gap-1' : 'text-12 px-2.5 py-1 gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (status === 'approved' || level >= 2) {
    return (
      <span className={`inline-flex items-center rounded-pill bg-primary/10 text-primary font-medium ${sizeClass}`}>
        <Shield className={iconSize} />
        ✓ Identité vérifiée
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className={`inline-flex items-center rounded-pill bg-sponsored/10 text-sponsored font-medium ${sizeClass}`}>
        <AlertCircle className={iconSize} />
        Vérification en cours
      </span>
    );
  }

  if (status === 'phone_verified' || level >= 1) {
    return (
      <span className={`inline-flex items-center rounded-pill bg-blue-50 text-blue-600 font-medium ${sizeClass}`}>
        <Phone className={iconSize} />
        Téléphone vérifié
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-pill bg-muted text-text-muted font-medium ${sizeClass}`}>
      Non vérifié
    </span>
  );
};

export default KYCBadge;
