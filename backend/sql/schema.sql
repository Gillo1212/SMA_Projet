-- ============================================================
-- SMALIM DATABASE SCHEMA
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS smalim_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smalim_db;

-- ────────────────────────────────────────────────────────────
-- ADMINS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  role        ENUM('super_admin', 'admin', 'commercial') NOT NULL DEFAULT 'admin',
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  last_login  DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- CLIENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  company_name  VARCHAR(255) NULL,
  phone         VARCHAR(30) NULL,
  address       TEXT NULL,
  city          VARCHAR(100) NULL,
  country       VARCHAR(100) NULL DEFAULT 'Sénégal',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  last_login    DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- CATÉGORIES MACHINES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS machine_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- MACHINES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS machines (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED NOT NULL,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT NULL,
  price           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  stock           INT NOT NULL DEFAULT 0,
  unit            VARCHAR(50) NOT NULL DEFAULT 'unité',
  brand           VARCHAR(100) NULL,
  model_ref       VARCHAR(100) NULL,
  delivery_delay  VARCHAR(100) NULL,
  image_url       TEXT NULL,
  gallery         JSON NULL,
  specifications  JSON NULL,
  payment_modes   JSON NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  is_featured     TINYINT(1) NOT NULL DEFAULT 0,
  views_count     INT UNSIGNED NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES machine_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PRODUITS CONSOMMABLES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED NOT NULL,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT NULL,
  price           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  stock           INT NOT NULL DEFAULT 0,
  unit            VARCHAR(50) NOT NULL DEFAULT 'unité',
  brand           VARCHAR(100) NULL,
  reference       VARCHAR(100) NULL,
  image_url       TEXT NULL,
  gallery         JSON NULL,
  specifications  JSON NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  is_featured     TINYINT(1) NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- COMMANDES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number        VARCHAR(50) NOT NULL UNIQUE,
  client_id           INT UNSIGNED NOT NULL,
  status              ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  subtotal            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  tax_amount          DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  shipping_amount     DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  discount_amount     DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total_amount        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  currency            VARCHAR(10) NOT NULL DEFAULT 'XOF',
  payment_method      ENUM('wave','orange_money','bank_transfer','cash','card') NULL,
  payment_status      ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_reference   VARCHAR(255) NULL,
  promo_code          VARCHAR(50) NULL,
  shipping_address    JSON NOT NULL,
  notes               TEXT NULL,
  admin_notes         TEXT NULL,
  delivered_at        DATETIME NULL,
  cancelled_at        DATETIME NULL,
  cancellation_reason TEXT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED NOT NULL,
  item_type       ENUM('machine', 'product') NOT NULL,
  item_id         INT UNSIGNED NOT NULL,
  item_name       VARCHAR(255) NOT NULL,
  item_reference  VARCHAR(100) NULL,
  quantity        INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price      DECIMAL(15,2) NOT NULL,
  total_price     DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_tracking (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED NOT NULL,
  status      VARCHAR(100) NOT NULL,
  note        TEXT NULL,
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- DEVIS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_number    VARCHAR(50) NOT NULL UNIQUE,
  client_id       INT UNSIGNED NULL,
  company_name    VARCHAR(255) NULL,
  contact_name    VARCHAR(255) NOT NULL,
  contact_email   VARCHAR(255) NOT NULL,
  contact_phone   VARCHAR(30) NULL,
  machine_type    VARCHAR(255) NULL,
  description     TEXT NOT NULL,
  budget          DECIMAL(15,2) NULL,
  quantity        INT UNSIGNED NOT NULL DEFAULT 1,
  status          ENUM('pending','processing','quoted','accepted','refused','expired') NOT NULL DEFAULT 'pending',
  proposed_amount DECIMAL(15,2) NULL,
  admin_response  TEXT NULL,
  notes           TEXT NULL,
  expires_at      DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- MACHINES INSTALLÉES (parc client)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_machines (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id       INT UNSIGNED NOT NULL,
  machine_id      INT UNSIGNED NOT NULL,
  serial_number   VARCHAR(100) NULL,
  installation_date DATE NULL,
  location        VARCHAR(255) NULL,
  status          ENUM('active','maintenance','inactive') NOT NULL DEFAULT 'active',
  last_service_date DATE NULL,
  next_service_date DATE NULL,
  sales_count     INT UNSIGNED NOT NULL DEFAULT 0,
  notes           TEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FACTURES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_number  VARCHAR(50) NOT NULL UNIQUE,
  order_id        INT UNSIGNED NULL,
  client_id       INT UNSIGNED NOT NULL,
  type            ENUM('invoice','credit_note','proforma') NOT NULL DEFAULT 'invoice',
  amount_ht       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  tax_amount      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  amount_ttc      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status          ENUM('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'sent',
  due_date        DATE NULL,
  paid_at         DATETIME NULL,
  notes           TEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- SUPPORT / SAV
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_number   VARCHAR(50) NOT NULL UNIQUE,
  client_id       INT UNSIGNED NOT NULL,
  machine_id      INT UNSIGNED NULL,
  subject         VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  category        ENUM('panne','maintenance','question','livraison','facturation','autre') NOT NULL DEFAULT 'question',
  priority        ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  status          ENUM('open','in_progress','waiting_client','resolved','closed') NOT NULL DEFAULT 'open',
  admin_response  TEXT NULL,
  resolved_at     DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id   INT UNSIGNED NOT NULL,
  sender_type ENUM('client', 'admin') NOT NULL,
  sender_id   INT UNSIGNED NOT NULL,
  message     TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- BLOG
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blog_articles (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED NOT NULL,
  author_id       INT UNSIGNED NOT NULL,
  title           VARCHAR(500) NOT NULL,
  slug            VARCHAR(500) NOT NULL UNIQUE,
  excerpt         TEXT NULL,
  content         LONGTEXT NOT NULL,
  image_url       TEXT NULL,
  read_time       INT UNSIGNED NOT NULL DEFAULT 5,
  status          ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  views_count     INT UNSIGNED NOT NULL DEFAULT 0,
  published_at    DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PROMO CODES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(50) NOT NULL UNIQUE,
  type            ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  value           DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(15,2) NULL,
  max_uses        INT UNSIGNED NULL,
  uses_count      INT UNSIGNED NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  expires_at      DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- AUTH TOKENS (reset mot de passe / vérification email)
-- On stocke un hash SHA-256 du token, jamais le token en clair.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  user_type   ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  type        ENUM('password_reset', 'email_verification') NOT NULL,
  token_hash  CHAR(64) NOT NULL,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_auth_tokens_hash (token_hash)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- TRANSACTIONS DE PAIEMENT
-- Une ligne par tentative de paiement. Le montant est recopié pour
-- pouvoir vérifier que le prestataire confirme bien la somme attendue.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_transactions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED NOT NULL,
  provider        ENUM('wave','orange_money','bank_transfer','cash','card') NOT NULL,
  status          ENUM('pending','processing','succeeded','failed','cancelled','expired') NOT NULL DEFAULT 'pending',
  amount          DECIMAL(15,2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'XOF',
  /** Référence interne transmise au prestataire (idempotence) */
  reference       VARCHAR(100) NOT NULL,
  /** Identifiant de session/transaction renvoyé par le prestataire */
  provider_ref    VARCHAR(255) NULL,
  checkout_url    TEXT NULL,
  /** Charge utile brute du dernier événement reçu, pour audit */
  raw_payload     JSON NULL,
  failure_reason  TEXT NULL,
  paid_at         DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_reference (reference),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PARAMÈTRES (clé → valeur, édités depuis le back-office)
-- Les valeurs par défaut vivent dans services/settings.service.js :
-- une clé absente de la table prend sa valeur par défaut.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  setting_key     VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value   TEXT NOT NULL,
  updated_by      INT UNSIGNED NULL,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Mode de livraison et taux de TVA figés au moment de la commande :
-- un changement de paramètre ne doit pas réécrire les commandes passées.
ALTER TABLE orders ADD COLUMN delivery_mode ENUM('pickup','standard','express') NULL AFTER shipping_amount;
ALTER TABLE orders ADD COLUMN tax_rate DECIMAL(5,2) NULL AFTER tax_amount;

-- ────────────────────────────────────────────────────────────
-- INDEX POUR PERFORMANCES
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_machines_category ON machines(category_id);
CREATE INDEX idx_machines_active ON machines(is_active);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_blog_status ON blog_articles(status);
CREATE INDEX idx_blog_published ON blog_articles(published_at);
CREATE INDEX idx_tickets_client ON support_tickets(client_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_client_machines_client ON client_machines(client_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
