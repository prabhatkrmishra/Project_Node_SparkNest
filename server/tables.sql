CREATE DATABASE sparknest;
CREATE USER pkm774 WITH ENCRYPTED PASSWORD 'pass';
ALTER USER pkm774 CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE sparknest TO pkm774;
/*sudo find /etc/postgresql -name pg_hba.conf*/
/*sudo nano /etc/postgresql/16/main/pg_hba.conf*/
/*local   all             all                                     md5*/
/*sudo service postgresql restart*/
/*psql -U pkm774 -d sparknest;*/
/*exit*/
/*sudo -u postgres psql*/
/*\c sparknest*/
GRANT ALL PRIVILEGES ON SCHEMA public TO pkm774;
/*psql -U pkm774 -d sparknest;*/
/*\copy categories (id, name) FROM '/home/ubuntu/SparkNest/server/categories.csv' WITH (FORMAT csv, HEADER true);*/

/*****************************************************************/
/*                  TABLE FOR STORING USERS                   */
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    fname VARCHAR(50),
    lname VARCHAR(50),
    username VARCHAR(50) UNIQUE,
    region VARCHAR(50),
    avatar TEXT,
    password VARCHAR(100) NOT NULL,
    bio VARCHAR(201),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*****************************************************************/
/*                 TABLE FOR USER SUBSCRIPTIONS                  */
CREATE TABLE subscription (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    newsletter boolean
);

/*****************************************************************/
/*                  TABLE FOR STORING ARTICLES                   */

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    body TEXT NOT NULL
);

/*
 * Trigger function that will update the updated_at
 * column before each UPDATE operation.
 */
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/*
 * Trigger that will call the above function
 * whenever a row in the articles table is updated.
 */
CREATE TRIGGER update_article_timestamp
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

/*
 * Adding indexes for performance
*/
CREATE INDEX idx_articles_user_id ON articles(user_id);

/*****************************************************************/
/*              TABLE FOR STORING ARTICLES CATEGORy              */

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

ALTER TABLE IF EXISTS public.categories
    ADD CONSTRAINT unique_category_name UNIQUE (name);


CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_id ON categories(id);

/*
 * Many-to-many relationship with the articles table
 * using a junction table
*/
CREATE TABLE articles_categories (
  article_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (article_id, category_id),
  FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX idx_articles_categories_article_id ON articles_categories(article_id);
CREATE INDEX idx_articles_categories_category_id ON articles_categories(category_id);

/*****************************************************************/
/*                TABLE FOR STORING ARTICLES PREVIEW             */

CREATE TABLE articles_preview (
  id SERIAL PRIMARY KEY,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  preview_by VARCHAR(50)  NOT NULL,
  preview_title VARCHAR(210) NOT NULL,
  preview_subtitle TEXT
);

/*
 * Adding indexes for performance
*/
CREATE INDEX idx_articles_preview_id ON articles_preview(article_id);
/*
 * For frequently querying both article_id and category_id in the
 * articles_categories table using a composite index
*/
CREATE INDEX idx_articles_categories_article_category ON articles_categories(article_id, category_id);

/*****************************************************************/
/*                TABLE FOR STORING ARTICLES IMAGES              */

CREATE TABLE article_images (
  id SERIAL PRIMARY KEY,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  masonry TEXT[],
  featured TEXT[],
  thumbs TEXT[]
);

/*****************************************************************/
/*              TABLE FOR STORING COMMENTS FOR ARTICLES          */

CREATE TABLE comments (
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

/*
 * Trigger function to update the updated_at
 * column before each UPDATE operation for comments.
 */
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/*
 * Trigger that calls the above function
 * whenever a row in the comments table is updated.
 */
CREATE TRIGGER update_comment_timestamp
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_timestamp();

/*
 * Indexes for performance
 */
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);

/*****************************************************************/
/*                  TABLE FOR SAVED ARTICLES                     */

CREATE TABLE saved_articles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
);

/* Indexes for performance */
CREATE INDEX idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX idx_saved_articles_article_id ON saved_articles(article_id);

/*****************************************************************/
/*                  TABLE FOR LIKED ARTICLES                     */

CREATE TABLE liked_articles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
);

/* Indexes for performance */
CREATE INDEX idx_liked_articles_user_id ON liked_articles(user_id);
CREATE INDEX idx_liked_articles_article_id ON liked_articles(article_id);

/*****************************************************************/
/*                 TABLE FOR FEATURED ARTICLES                   */

CREATE TABLE featured_articles (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Adding an index for performance */
CREATE INDEX idx_featured_article_id ON featured_articles(article_id);

/*****************************************************************/
/*                 TABLE FOR PASSWORD RESET TOKENS               */

CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL
);