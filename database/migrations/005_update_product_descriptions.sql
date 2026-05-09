-- Aggiorna testi prodotti + link (consulto disclaimer, Theta convinzioni, Bambole Lunatiche).
-- Sicuro dopo 004. info_url puntato al canale YouTube Barbara (sostituibile da admin).

UPDATE products SET
  name = 'Consulto Privato',
  description = 'Un consulto privato e riservato per fare chiarezza su amore, lavoro e percorso di vita. Non effettuo consulti su gravidanza o sulla salute fisica/medica (per questo rivolgiti a professionisti sanitari). Momento dedicato a te con ascolto profondo e guida intuitiva.',
  details_json = JSON_ARRAY(
    'Sessione privata',
    'Chiarezza su 1–3 temi',
    'Riscontro entro 48h',
    'No consulti su gravidanza o salute'
  ),
  info_url = NULL,
  info_label = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE products SET
  description = 'Meditazione guidata con guarigione energetica in ThetaHealing: tecnica sulla sostituzione delle convinzioni errate, per sciogliere blocchi, ritrovare centratura e alleggerire mente e cuore.',
  details_json = JSON_ARRAY(
    'Percorso guidato',
    'ThetaHealing: sostituzione delle convinzioni errate',
    'Riequilibrio energetico e rilascio',
    'Responso entro 48h'
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 2;

UPDATE products SET
  details_json = JSON_ARRAY(
    'Lettura completa',
    'Messaggio e consiglio',
    'Indicazioni pratiche'
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 3;

UPDATE products SET
  details_json = JSON_ARRAY(
    'Messaggio angelico',
    'Chiarezza emotiva',
    'Focus su amore e relazioni'
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 4;

UPDATE products SET
  name = 'Lettura — Le Bambole Lunatiche',
  description = 'Lettura con un unico mazzo di carte libere e interpretazione libera. Il mazzo si chiama «Le Bambole Lunatiche»: linguaggio intuitivo per un messaggio chiaro sul momento che stai vivendo.',
  details_json = JSON_ARRAY(
    'Unico mazzo: Le Bambole Lunatiche',
    'Carte libere, interpretazione libera',
    'Responso entro 48h'
  ),
  info_url = 'https://www.youtube.com/@Barbara_toffano',
  info_label = 'Scopri di più (video sul mazzo)',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 5;

UPDATE products SET
  name = 'Vendita mazzo «Le Bambole Lunatiche» (con consegna)',
  description = 'Acquista il mazzo illustrato «Le Bambole Lunatiche» — unico deck usato anche nelle letture — con consegna a casa. Supporto nella scelta e assistenza dopo l’ordine.',
  details_json = JSON_ARRAY(
    'Mazzo cartaceo delle Bambole Lunatiche',
    'Carte selezionate dal catalogo disponibile',
    'Consegna inclusa'
  ),
  info_url = 'https://www.youtube.com/@Barbara_toffano',
  info_label = 'Scopri di più sul mazzo (video)',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 6;
