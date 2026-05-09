-- Add payment_method to existing orders table
-- Safe to run multiple times only if you manually guard it in your migration runner.

ALTER TABLE orders
  ADD COLUMN payment_method ENUM('paypal','bonifico','postepay','non_specificato')
    NOT NULL DEFAULT 'non_specificato'
    AFTER amount;

