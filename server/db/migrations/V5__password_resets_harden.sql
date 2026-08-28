-- V5__password_resets_harden.sql — harden password_resets table

ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Cleanup expired tokens older than 24h (safe, idempotent)
DELETE FROM password_resets WHERE expires < NOW() - INTERVAL '24 hours';

-- Ensure indexes exist (V3 already added, but safe)
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
