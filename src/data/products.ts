export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'audio' | 'carta' | 'pacchetto';
  icon: string;
  details: string[];
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Lettura dei Tarocchi Personale',
    description:
      'Una lettura approfondita e personalizzata delle carte dei Tarocchi, con risposta alle tue domande più intime sul lavoro, amore e percorso di vita.',
    price: 35,
    type: 'carta',
    icon: '🎴',
    details: ['Report scritto completo', 'Risposta a 3 domande', 'Consegna entro 48h'],
    featured: true,
  },
  {
    id: 2,
    name: 'Meditazione Guidata Personalizzata',
    description:
      'Una meditazione guidata registrata appositamente per te, basata sul tuo tema natale e le tue necessità spirituali del momento.',
    price: 25,
    type: 'audio',
    icon: '🎵',
    details: ['Audio MP3 personale', 'Durata 20–30 minuti', 'Tema cucito su di te'],
    featured: true,
  },
  {
    id: 3,
    name: "Affermazioni Sacre dell'Anima",
    description:
      'Affermazioni potenti registrate con la tua vibrazione specifica, per attrarre abbondanza, amore e guarigione nella tua vita.',
    price: 20,
    type: 'audio',
    icon: '✨',
    details: ['Audio MP3 personale', '15–20 affermazioni uniche', 'Frequenze sacre'],
    featured: true,
  },
  {
    id: 4,
    name: 'Pacchetto Luce Totale',
    description:
      'Il percorso completo: lettura dei tarocchi + meditazione guidata + affermazioni personalizzate. Un viaggio integrale di trasformazione.',
    price: 65,
    type: 'pacchetto',
    icon: '🌟',
    details: [
      'Lettura Tarocchi completa',
      'Meditazione personalizzata',
      'Affermazioni sacre',
      'Priorità di consegna',
    ],
    featured: true,
  },
  {
    id: 5,
    name: "Messaggi dell'Anima",
    description:
      "Un audio canale dove Barbara trasmette i messaggi che l'universo ha per te in questo preciso momento della tua vita.",
    price: 30,
    type: 'audio',
    icon: '🔮',
    details: ['Channeling audio personale', 'Durata 10–15 minuti', 'Messaggi intuitivi'],
  },
  {
    id: 6,
    name: 'Oroscopo Natale Completo',
    description:
      'Analisi approfondita del tuo tema natale: pianeti, case astrologiche e nodi karmici. Include report PDF e audio di commento.',
    price: 45,
    type: 'carta',
    icon: '⭐',
    details: ['Report PDF completo', 'Audio di commento', 'Pianeti, case e nodi karmici'],
  },
];

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}
