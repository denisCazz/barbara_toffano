-- Create products table (catalog managed by admin)

CREATE TABLE IF NOT EXISTS products (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  category      ENUM('consulto','meditazione','lettura','vendita') NOT NULL,
  delivery_type ENUM('audio','carta','pacchetto') NOT NULL DEFAULT 'carta',
  icon          VARCHAR(50)   NOT NULL DEFAULT '✦',
  details_json  JSON          NULL,
  info_url      VARCHAR(600)  NULL,
  info_label    VARCHAR(120)  NULL,
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

