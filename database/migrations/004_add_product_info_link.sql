-- Link opzionale per prodotto.
-- Su DB nuovo creato da schema.sql aggiornato queste colonne esistono già: ignorare errore Duplicate column name.
ALTER TABLE products
  ADD COLUMN info_url VARCHAR(600) NULL DEFAULT NULL COMMENT 'Link opzionale (es. video)' AFTER details_json,
  ADD COLUMN info_label VARCHAR(120) NULL DEFAULT NULL COMMENT 'Etichetta link' AFTER info_url;
