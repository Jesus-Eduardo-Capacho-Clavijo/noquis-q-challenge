export interface Country {
  code: string;
  name: string;
  region: 'LATAM' | 'OTROS';
}

export const COUNTRIES: Country[] = [
  // --- Latinoamérica ---
  { code: 'ar', name: 'Argentina', region: 'LATAM' },
  { code: 'bo', name: 'Bolivia', region: 'LATAM' },
  { code: 'br', name: 'Brasil', region: 'LATAM' },
  { code: 'cl', name: 'Chile', region: 'LATAM' },
  { code: 'co', name: 'Colombia', region: 'LATAM' },
  { code: 'cr', name: 'Costa Rica', region: 'LATAM' },
  { code: 'cu', name: 'Cuba', region: 'LATAM' },
  { code: 'ec', name: 'Ecuador', region: 'LATAM' },
  { code: 'sv', name: 'El Salvador', region: 'LATAM' },
  { code: 'gt', name: 'Guatemala', region: 'LATAM' },
  { code: 'hn', name: 'Honduras', region: 'LATAM' },
  { code: 'mx', name: 'México', region: 'LATAM' },
  { code: 'ni', name: 'Nicaragua', region: 'LATAM' },
  { code: 'pa', name: 'Panamá', region: 'LATAM' },
  { code: 'py', name: 'Paraguay', region: 'LATAM' },
  { code: 'pe', name: 'Perú', region: 'LATAM' },
  { code: 'pr', name: 'Puerto Rico', region: 'LATAM' },
  { code: 'do', name: 'República Dominicana', region: 'LATAM' },
  { code: 'uy', name: 'Uruguay', region: 'LATAM' },
  { code: 've', name: 'Venezuela', region: 'LATAM' },

  // --- Otros ---
  { code: 'es', name: 'España', region: 'OTROS' },
  { code: 'us', name: 'Estados Unidos', region: 'OTROS' },
  { code: 'ca', name: 'Canadá', region: 'OTROS' },
  { code: 'kr', name: 'Corea del Sur', region: 'OTROS' },
  { code: 'jp', name: 'Japón', region: 'OTROS' },
];
