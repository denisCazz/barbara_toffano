-- Seed iniziale (id stabili come /checkout?product=N).
-- Le colonne info_url / info_label possono essere assenti fino alla 004 — non le usiamo qui.
INSERT INTO products
  (id, name, description, price, category, delivery_type, icon, details_json, featured, is_active, sort_order)
VALUES
  (
    1,
    'Consulto Privato',
    'Un consulto privato e riservato per fare chiarezza su amore, lavoro e percorso di vita. Non effettuo consulti su gravidanza o sulla salute fisica/medica (per questo rivolgiti a professionisti sanitari). Momento dedicato a te con ascolto profondo e guida intuitiva.',
    35.00,
    'consulto',
    'audio',
    '🔮',
    JSON_ARRAY('Sessione privata', 'Chiarezza su 1–3 temi', 'Riscontro entro 48h', 'No consulti su gravidanza o salute'),
    1,
    1,
    10
  ),
  (
    2,
    'Meditazione con Guarigione Energetica (ThetaHealing)',
    'Meditazione guidata con guarigione energetica in ThetaHealing: tecnica sulla sostituzione delle convinzioni errate, per sciogliere blocchi, ritrovare centratura e alleggerire mente e cuore.',
    25.00,
    'meditazione',
    'audio',
    '🪷',
    JSON_ARRAY('Percorso guidato', 'ThetaHealing: sostituzione delle convinzioni errate', 'Riequilibrio energetico e rilascio', 'Responso entro 48h'),
    1,
    1,
    20
  ),
  (
    3,
    'Lettura delle Rune',
    'Le rune come linguaggio antico: un responso chiaro per comprendere ciò che si muove nel presente e la direzione più armonica per te.',
    25.00,
    'lettura',
    'audio',
    'ᚱ',
    JSON_ARRAY('Lettura completa', 'Messaggio e consiglio', 'Indicazioni pratiche'),
    1,
    1,
    30
  ),
  (
    4,
    'Lettura delle Carte degli Angeli',
    'Un messaggio dolce e diretto dalle energie angeliche per portare luce, fiducia e guarigione emotiva nelle tue scelte.',
    25.00,
    'lettura',
    'audio',
    '👼',
    JSON_ARRAY('Messaggio angelico', 'Chiarezza emotiva', 'Focus su amore e relazioni'),
    1,
    1,
    40
  ),
  (
    5,
    'Lettura — Le Bambole Lunatiche',
    'Lettura con un unico mazzo di carte libere e interpretazione libera. Il mazzo si chiama «Le Bambole Lunatiche»: linguaggio intuitivo per un messaggio chiaro sul momento che stai vivendo.',
    25.00,
    'lettura',
    'audio',
    '🌙',
    JSON_ARRAY('Unico mazzo: Le Bambole Lunatiche', 'Carte libere, interpretazione libera', 'Responso entro 48h'),
    1,
    1,
    50
  ),
  (
    6,
    'Vendita mazzo «Le Bambole Lunatiche» (con consegna)',
    'Acquista il mazzo illustrato «Le Bambole Lunatiche» — unico deck usato anche nelle letture — con consegna a casa. Supporto nella scelta e assistenza dopo l''ordine.',
    20.00,
    'vendita',
    'carta',
    '🎴',
    JSON_ARRAY('Mazzo cartaceo delle Bambole Lunatiche', 'Carte selezionate dal catalogo disponibile', 'Consegna inclusa'),
    1,
    1,
    60
  )
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  description=VALUES(description),
  price=VALUES(price),
  category=VALUES(category),
  delivery_type=VALUES(delivery_type),
  icon=VALUES(icon),
  details_json=VALUES(details_json),
  featured=VALUES(featured),
  is_active=VALUES(is_active),
  sort_order=VALUES(sort_order),
  updated_at=CURRENT_TIMESTAMP;
