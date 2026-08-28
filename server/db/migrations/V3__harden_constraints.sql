-- V3__harden_constraints.sql — harden constraints and defaults

-- Ensure featured_articles.article_id is unique (V1 already does, but safe for legacy DBs)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'featured_articles_article_id_key') THEN
    -- Only add if not already unique
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE indexname = 'featured_articles_article_id_key'
    ) THEN
      ALTER TABLE featured_articles ADD CONSTRAINT featured_articles_article_id_key UNIQUE (article_id);
    END IF;
  END IF;
END $$;

-- Default for newsletter
ALTER TABLE subscription ALTER COLUMN newsletter SET DEFAULT false;

-- Ensure password_resets has index on email for fast lookup
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
