-- Seed initial products (id fixed to match existing URLs /checkout?product=ID)
-- Safe to re-run: uses INSERT ... ON DUPLICATE KEY UPDATE

INSERT INTO products
  (id, name, description, price, category, delivery_type, icon, details_json, featured, is_active, sort_order)
VALUES
  (
    1,
    'Consulto Privato',
    'Un consulto privato e riservato per fare chiarezza su amore, lavoro e percorso di vita. Un momento dedicato a te, con ascolto profondo e guida intuitiva.',
    35.00,
    'consulto',
    'audio',
    '🔮',
    JSON_ARRAY('Sessione privata', 'Chiarezza su 1–3 temi', 'Riscontro entro 24h'),
    1,
    1,
    10
  ),
  (
    2,
    'Meditazione con Guarigione Energetica (ThetaHealing)',
    'Meditazione guidata con guarigione energetica in ThetaHealing per sciogliere blocchi, ritrovare centratura e alleggerire mente e cuore.',
    25.00,
    'meditazione',
    'audio',
    '🪷',
    JSON_ARRAY('Percorso guidato', 'Riequilibrio energetico', 'Rilascio e centratura'),
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
    'Lettura degli Oracoli',
    'Una lettura con oracoli per ricevere risposte e conferme: utile quando senti bisogno di direzione, protezione e significato.',
    25.00,
    'lettura',
    'audio',
    '🌙',
    JSON_ARRAY('Responso immediato', 'Consiglio per il momento', 'Energia della settimana'),
    1,
    1,
    50
  ),
  (
    6,
    'Vendita delle Carte (con consegna)',
    'Acquista le carte e ricevi la consegna direttamente a casa. Perfette per iniziare (o approfondire) il tuo percorso di lettura.',
    20.00,
    'vendita',
    'carta',
    '🎴',
    JSON_ARRAY('Carte selezionate', 'Consegna inclusa', 'Assistenza per scegliere'),
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

