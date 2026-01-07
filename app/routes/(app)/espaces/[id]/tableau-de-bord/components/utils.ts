import type { colorFamily } from '@/components/highcharts/colors';

export type ColorName = (typeof colorFamily)[number];

// Mapping from region names to Highcharts map keys
export const regionToHcKey: Record<string, string> = {
  Corse: 'fr-cor',
  Bretagne: 'fr-bre',
  'Pays de la Loire': 'fr-pdl',
  "Provence-Alpes-Côte d'Azur": 'fr-pac',
  Occitanie: 'fr-occ',
  'Nouvelle-Aquitaine': 'fr-naq',
  'Bourgogne-Franche-Comté': 'fr-bfc',
  'Centre-Val de Loire': 'fr-cvl',
  'Île-de-France': 'fr-idf',
  'Hauts-de-France': 'fr-hdf',
  Normandie: 'fr-nor',
  'Grand Est': 'fr-ges',
  'Auvergne-Rhône-Alpes': 'fr-ara',
  Guadeloupe: 'fr-gua',
  Martinique: 'fr-mq',
  Guyane: 'fr-gf',
  'La Réunion': 'fr-lre',
  Mayotte: 'fr-may',
};

// Colors for cycle charts
export const cycleColors: ColorName[] = [
  'green-archipel',
  'blue-cumulus',
  'purple-glycine',
  'yellow-tournesol',
  'pink-macaron',
];

// Colors for cohort comparison charts
export const COHORT_COLORS = [
  'green-archipel',
  'blue-cumulus',
  'purple-glycine',
  'pink-macaron',
  'yellow-tournesol',
  'orange-terre-battue',
  'brown-caramel',
  'beige-gris-galet',
] as const;

// Month labels for Insersup charts
export const MONTHS = ['6 mois', '12 mois', '18 mois', '24 mois', '30 mois'];

// Employment rates type
export interface RatesObject {
  m6: number | null;
  m12: number | null;
  m18: number | null;
  m24: number | null;
  m30: number | null;
}

/**
 * Convert employment rates object to array for chart data
 */
export const ratesToArray = (rates: RatesObject | null): (number | null)[] => {
  if (!rates) return [null, null, null, null, null];
  return [rates.m6, rates.m12, rates.m18, rates.m24, rates.m30];
};

/**
 * Convert employment rates to array, setting trailing zeros/nulls to null
 * This prevents lines from going to zero when data is not yet observable
 */
export const ratesToArrayWithTrailingNulls = (rates: RatesObject | null): (number | null)[] => {
  if (!rates) return [null, null, null, null, null];
  const values = [rates.m6, rates.m12, rates.m18, rates.m24, rates.m30];
  let lastValidIndex = -1;
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== null && values[i] !== 0) {
      lastValidIndex = i;
      break;
    }
  }
  if (lastValidIndex === -1) return [null, null, null, null, null];
  return values.map((v, i) => (i <= lastValidIndex ? v : null));
};
