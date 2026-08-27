-- V1__baseline.sql — SparkNest baseline (from tables.sql 2024)
-- Normalized for Flyway: no CREATE DATABASE/USER, idempotent where possible
-- Order respects FK dependencies

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    fname VARCHAR(50),
    lname VARCHAR(50),
    username VARCHAR(30) UNIQUE,
    region VARCHAR(50),
    avatar TEXT,
    password VARCHAR(100) NOT NULL,
    bio VARCHAR(201),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SUBSCRIPTION
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    newsletter BOOLEAN
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_category_name') THEN
    ALTER TABLE categories ADD CONSTRAINT unique_category_name UNIQUE (name);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_id ON categories(id);

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    body TEXT NOT NULL
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_article_timestamp ON articles;
CREATE TRIGGER update_article_timestamp
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);

-- ============================================================
-- ARTICLES_CATEGORIES (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS articles_categories (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  PRIMARY KEY (article_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_articles_categories_article_id ON articles_categories(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_categories_category_id ON articles_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_categories_article_category ON articles_categories(article_id, category_id);

-- ============================================================
-- ARTICLES_PREVIEW
-- ============================================================
CREATE TABLE IF NOT EXISTS articles_preview (
  id SERIAL PRIMARY KEY,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  preview_by VARCHAR(50) NOT NULL,
  preview_title VARCHAR(210) NOT NULL,
  preview_subtitle TEXT
);

CREATE INDEX IF NOT EXISTS idx_articles_preview_id ON articles_preview(article_id);

-- ============================================================
-- ARTICLE_IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS article_images (
  id SERIAL PRIMARY KEY,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  masonry TEXT[],
  featured TEXT[],
  thumbs TEXT[]
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comment_timestamp ON comments;
CREATE TRIGGER update_comment_timestamp
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_timestamp();

CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);

-- ============================================================
-- SAVED_ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_articles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);

-- ============================================================
-- LIKED_ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS liked_articles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_liked_articles_user_id ON liked_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_articles_article_id ON liked_articles(article_id);

-- ============================================================
-- FEATURED_ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS featured_articles (
    id SERIAL PRIMARY KEY,
    article_id INT UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_featured_article_id ON featured_articles(article_id);

-- ============================================================
-- PASSWORD_RESETS
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL
);
