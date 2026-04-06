import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const timeAgo = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { locale: fr, addSuffix: true });
  } catch {
    return '';
  }
};
