/** Copia statica di riferimento (lo shop pubblico usa i prodotti da MySQL). */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'consulto' | 'meditazione' | 'lettura' | 'vendita';
  icon: string;
  details: string[];
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Consulto Privato',
    description:
      'Un consulto privato e riservato per fare chiarezza su amore, lavoro e percorso di vita. Non effettuo consulti su gravidanza o sulla salute fisica/medica (per questo rivolgiti a professionisti sanitari).',
    price: 35,
    type: 'consulto',
    icon: '🔮',
    details: ['Sessione privata', 'Chiarezza su 1–3 temi', 'Riscontro entro 48h', 'No consulti su gravidanza o salute'],
    featured: true,
  },
  {
    id: 2,
    name: 'Meditazione con Guarigione Energetica (ThetaHealing)',
    description:
      'Meditazione guidata con guarigione energetica in ThetaHealing: tecnica sulla sostituzione delle convinzioni errate, per sciogliere blocchi e ritrovare centratura.',
    price: 25,
    type: 'meditazione',
    icon: '🪷',
    details: ['Percorso guidato', 'ThetaHealing: sostituzione delle convinzioni errate', 'Riequilibrio energetico', 'Responso entro 48h'],
    featured: true,
  },
  {
    id: 3,
    name: 'Lettura delle Rune',
    description:
      'Le rune come linguaggio antico: un responso chiaro per comprendere ciò che si muove nel presente e la direzione più armonica per te.',
    price: 25,
    type: 'lettura',
    icon: 'ᚱ',
    details: ['Lettura completa', 'Messaggio e consiglio', 'Indicazioni pratiche'],
    featured: true,
  },
  {
    id: 4,
    name: 'Lettura delle Carte degli Angeli',
    description:
      'Un messaggio dolce e diretto dalle energie angeliche per portare luce, fiducia e guarigione emotiva nelle tue scelte.',
    price: 25,
    type: 'lettura',
    icon: '👼',
    details: ['Messaggio angelico', 'Chiarezza emotiva', 'Focus su amore e relazioni'],
    featured: true,
  },
  {
    id: 5,
    name: 'Lettura — Le Bambole Lunatiche',
    description:
      'Lettura con un unico mazzo di carte libere e interpretazione libera. Il mazzo si chiama «Le Bambole Lunatiche».',
    price: 25,
    type: 'lettura',
    icon: '🌙',
    details: ['Unico mazzo: Le Bambole Lunatiche', 'Carte libere, interpretazione libera', 'Responso entro 48h'],
    featured: true,
  },
  {
    id: 6,
    name: 'Vendita mazzo «Le Bambole Lunatiche» (con consegna)',
    description:
      'Acquista il mazzo illustrato «Le Bambole Lunatiche» con consegna a casa.',
    price: 20,
    type: 'vendita',
    icon: '🎴',
    details: ['Mazzo cartaceo delle Bambole Lunatiche', 'Catalogo disponibile', 'Consegna inclusa'],
    featured: true,
  },
];

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}
