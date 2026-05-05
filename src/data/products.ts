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
      'Un consulto privato e riservato per fare chiarezza su amore, lavoro e percorso di vita. Un momento dedicato a te, con ascolto profondo e guida intuitiva.',
    price: 35,
    type: 'consulto',
    icon: '🔮',
    details: ['Sessione privata', 'Chiarezza su 1–3 temi', 'Riscontro entro 24h'],
    featured: true,
  },
  {
    id: 2,
    name: 'Meditazione con Guarigione Energetica (ThetaHealing)',
    description:
      'Meditazione guidata con guarigione energetica in ThetaHealing per sciogliere blocchi, ritrovare centratura e alleggerire mente e cuore.',
    price: 25,
    type: 'meditazione',
    icon: '🪷',
    details: ['Percorso guidato', 'Riequilibrio energetico', 'Rilascio e centratura'],
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
    name: 'Lettura degli Oracoli',
    description:
      'Una lettura con oracoli per ricevere risposte e conferme: utile quando senti bisogno di direzione, protezione e significato.',
    price: 25,
    type: 'lettura',
    icon: '🌙',
    details: ['Responso immediato', 'Consiglio per il momento', 'Energia della settimana'],
    featured: true,
  },
  {
    id: 6,
    name: 'Vendita delle Carte (con consegna)',
    description:
      'Acquista le carte e ricevi la consegna direttamente a casa. Perfette per iniziare (o approfondire) il tuo percorso di lettura.',
    price: 20,
    type: 'vendita',
    icon: '🎴',
    details: ['Carte selezionate', 'Consegna inclusa', 'Assistenza per scegliere'],
    featured: true,
  },
];

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}
