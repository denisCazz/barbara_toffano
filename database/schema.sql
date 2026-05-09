-- ============================================================
-- Barbara Toffano - Schema MySQL
-- Charset: utf8mb4 per supporto emoji e caratteri speciali
-- ============================================================

CREATE DATABASE IF NOT EXISTS barbara_toffano
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE barbara_toffano;

-- ============================================================
-- Tabella Prodotti (gestione catalogo da admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  category      ENUM('consulto','meditazione','lettura','vendita') NOT NULL,
  delivery_type ENUM('audio','carta','pacchetto') NOT NULL DEFAULT 'carta',
  icon          VARCHAR(50)   NOT NULL DEFAULT '✦',
  details_json  JSON          NULL,
  info_url      VARCHAR(600)  NULL      COMMENT 'Link opzionale (es. video)',
  info_label    VARCHAR(120)  NULL      COMMENT 'Etichetta link',
  featured      TINYINT(1)    NOT NULL DEFAULT 0,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_active (is_active),
  INDEX idx_category (category),
  INDEX idx_featured (featured),
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabella Ordini
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  order_number        VARCHAR(20)   NOT NULL UNIQUE            COMMENT 'Es: BT-ABC123',
  customer_name       VARCHAR(255)  NOT NULL,
  customer_email      VARCHAR(255)  NOT NULL,
  customer_phone      VARCHAR(50)   NULL,
  product_id          INT           NOT NULL,
  product_name        VARCHAR(255)  NOT NULL,
  product_type        ENUM('audio','carta','pacchetto') NOT NULL,
  amount              DECIMAL(10,2) NOT NULL,
  payment_method      ENUM('paypal','bonifico','postepay','non_specificato')
                                    NOT NULL DEFAULT 'non_specificato',
  status              ENUM('in_attesa','lavorazione','completato','annullato')
                                    NOT NULL DEFAULT 'in_attesa',
  customer_notes      TEXT          NULL      COMMENT 'Note dal cliente',
  admin_notes         TEXT          NULL      COMMENT 'Note interne admin',
  audio_file_path     VARCHAR(500)  NULL      COMMENT 'Path assoluto file audio sul server',
  audio_original_name VARCHAR(255)  NULL      COMMENT 'Nome originale del file',
  download_token      VARCHAR(100)  NULL UNIQUE COMMENT 'Token sicuro per download',
  download_expires_at TIMESTAMP     NULL      COMMENT 'Scadenza link download',
  download_count      INT           NOT NULL DEFAULT 0,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status         (status),
  INDEX idx_email          (customer_email),
  INDEX idx_download_token (download_token),
  INDEX idx_created_at     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Sessioni Admin (autenticazione stateful via cookie)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  token      VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP    NOT NULL,

  INDEX idx_token   (token),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Pulizia automatica sessioni scadute (esegui come evento MySQL
-- oppure tramite un cron job esterno)
-- ============================================================
-- CREATE EVENT IF NOT EXISTS cleanup_sessions
--   ON SCHEDULE EVERY 1 DAY
--   DO DELETE FROM admin_sessions WHERE expires_at < NOW();
