import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDistance(km) {
  if (km >= 100) return `${km} km`;
  return `${km} km`;
}

export function getDistanceCategory(km) {
  if (km < 30) return { label: 'Court', class: 'distance-short' };
  if (km < 60) return { label: 'Moyen', class: 'distance-medium' };
  if (km < 100) return { label: 'Long', class: 'distance-long' };
  return { label: 'Ultra', class: 'distance-ultra' };
}

export function getRegistrationStatusLabel(status) {
  switch (status) {
    case 'open':
      return { label: 'Inscriptions ouvertes', class: 'status-open' };
    case 'not_open':
      return { label: 'Inscriptions à venir', class: 'status-not-open' };
    case 'closed':
      return { label: 'Inscriptions fermées', class: 'status-closed' };
    default:
      return { label: status, class: '' };
  }
}

export const FRANCE_REGIONS = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur'
];
