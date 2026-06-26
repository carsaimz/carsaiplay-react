-- CarsaiPlay — PostgreSQL (Neon) Schema
-- Timezone: Africa/Maputo (UTC+02)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20)  NOT NULL DEFAULT 'user',    -- user | admin
  avatar       TEXT         NOT NULL DEFAULT '',
  status       VARCHAR(20)  NOT NULL DEFAULT 'active',  -- active | banned | pending
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- User auth tokens
CREATE TABLE IF NOT EXISTS user_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON user_tokens(token);
CREATE INDEX ON user_tokens(user_id);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id       SERIAL PRIMARY KEY,
  slug     VARCHAR(80)  NOT NULL UNIQUE,
  name_pt  VARCHAR(80)  NOT NULL,
  name_en  VARCHAR(80)  NOT NULL
);

-- Contents
CREATE TABLE IF NOT EXISTS contents (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  title_pt         VARCHAR(255) NOT NULL,
  title_en         VARCHAR(255),
  original_title   VARCHAR(255),
  type             VARCHAR(20)  NOT NULL,               -- movie | series | animation | documentary
  description_pt   TEXT,
  description_en   TEXT,
  release_year     SMALLINT,
  duration         VARCHAR(20),
  age_rating       VARCHAR(5)   NOT NULL DEFAULT 'L',
  poster_url       TEXT,
  banner_url       TEXT,
  trailer_url      TEXT,
  featured         BOOLEAN      NOT NULL DEFAULT FALSE,
  views            INT          NOT NULL DEFAULT 0,
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX ON contents(status, type);
CREATE INDEX ON contents(slug);
CREATE INDEX ON contents(views DESC);

-- Content <-> Category
CREATE TABLE IF NOT EXISTS content_categories (
  content_id  INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, category_id)
);

-- Movies (embed + download)
CREATE TABLE IF NOT EXISTS movies (
  id                SERIAL PRIMARY KEY,
  content_id        INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE UNIQUE,
  embed_url         TEXT,
  embed_url_dub     TEXT,
  download_url      TEXT,
  download_url_dub  TEXT,
  quality           VARCHAR(10) DEFAULT 'HD',
  audio_language    VARCHAR(20),
  subtitle_language VARCHAR(20)
);

-- Embed servers (para filmes e episódios)
CREATE TABLE IF NOT EXISTS embed_servers (
  id          SERIAL PRIMARY KEY,
  content_id  INT REFERENCES contents(id)  ON DELETE CASCADE,
  episode_id  INT,
  name        VARCHAR(80) NOT NULL,
  url         TEXT        NOT NULL,
  lang        VARCHAR(5)  NOT NULL DEFAULT 'pt',
  sort_order  SMALLINT    NOT NULL DEFAULT 0
);

-- Seasons
CREATE TABLE IF NOT EXISTS seasons (
  id             SERIAL PRIMARY KEY,
  content_id     INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  season_number  SMALLINT NOT NULL,
  title_pt       VARCHAR(255),
  title_en       VARCHAR(255),
  ep_count       SMALLINT NOT NULL DEFAULT 0,
  UNIQUE(content_id, season_number)
);

-- Episodes
CREATE TABLE IF NOT EXISTS episodes (
  id              SERIAL PRIMARY KEY,
  season_id       INT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number  SMALLINT NOT NULL,
  title_pt        VARCHAR(255),
  title_en        VARCHAR(255),
  description_pt  TEXT,
  duration        VARCHAR(20),
  embed_url       TEXT,
  embed_url_dub   TEXT,
  download_url    TEXT,
  thumbnail_url   TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON episodes(season_id, episode_number);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id  INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id  INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Watch history
CREATE TABLE IF NOT EXISTS watch_history (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id    INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  episode_id    INT,
  progress_sec  INT NOT NULL DEFAULT 0,
  watched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id, episode_id)
);

-- Watch later
CREATE TABLE IF NOT EXISTS watch_later (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id  INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,  -- NULL = global
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  type        VARCHAR(50),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id              SERIAL PRIMARY KEY,
  name_pt         VARCHAR(120) NOT NULL,
  name_en         VARCHAR(120),
  description_pt  TEXT,
  description_en  TEXT,
  badge_icon      VARCHAR(80) NOT NULL DEFAULT 'trophy',
  points          INT NOT NULL DEFAULT 10,
  condition_type  VARCHAR(50),
  condition_value INT
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             SERIAL PRIMARY KEY,
  user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id       SERIAL PRIMARY KEY,
  slug     VARCHAR(80) NOT NULL UNIQUE,
  name_pt  VARCHAR(80) NOT NULL,
  name_en  VARCHAR(80)
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id              SERIAL PRIMARY KEY,
  author_id       INT NOT NULL REFERENCES users(id),
  category_id     INT REFERENCES blog_categories(id),
  slug            VARCHAR(255) NOT NULL UNIQUE,
  title_pt        VARCHAR(255) NOT NULL,
  title_en        VARCHAR(255),
  excerpt_pt      TEXT,
  excerpt_en      TEXT,
  content_pt      TEXT,
  content_en      TEXT,
  featured_image  TEXT,
  views           INT NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedule (lançamentos)
CREATE TABLE IF NOT EXISTS schedule (
  id              SERIAL PRIMARY KEY,
  content_id      INT REFERENCES contents(id) ON DELETE CASCADE,
  episode_id      INT REFERENCES episodes(id) ON DELETE CASCADE,
  release_date    DATE NOT NULL,
  episode_number  SMALLINT,
  title_pt        VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content requests
CREATE TABLE IF NOT EXISTS content_requests (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  type        VARCHAR(20),
  year        SMALLINT,
  link        TEXT,
  message     TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Static pages (about, terms, privacy, contact)
CREATE TABLE IF NOT EXISTS pages (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(80) NOT NULL UNIQUE,
  title_pt    VARCHAR(255) NOT NULL,
  title_en    VARCHAR(255),
  content_pt  TEXT,
  content_en  TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ads / Publicidade
CREATE TABLE IF NOT EXISTS ads (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  placement   VARCHAR(80)  NOT NULL,
  type        VARCHAR(20)  NOT NULL DEFAULT 'banner', -- banner | video | interstitial
  code        TEXT,
  image_url   TEXT,
  link_url    TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Follows (notif de novo episódio)
CREATE TABLE IF NOT EXISTS follows (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id  INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password, role, status)
VALUES ('Admin', 'admin@carsaiplay.mz', encode(digest('admin123' || 'CHANGE_APP_SECRET', 'sha256'), 'hex'), 'admin', 'active')
ON CONFLICT DO NOTHING;

-- Seed pages
INSERT INTO pages (slug, title_pt, title_en, content_pt, content_en) VALUES
  ('about',   'Sobre Nós',                 'About Us',         '<p>O CarsaiPlay é uma plataforma de streaming de entretenimento de Moçambique.</p>', '<p>CarsaiPlay is a streaming entertainment platform from Mozambique.</p>'),
  ('terms',   'Termos de Uso',             'Terms of Use',     '<p>Ao usar o CarsaiPlay concordas com estes termos.</p>', '<p>By using CarsaiPlay you agree to these terms.</p>'),
  ('privacy', 'Política de Privacidade',   'Privacy Policy',   '<p>Respeitamos a tua privacidade.</p>', '<p>We respect your privacy.</p>'),
  ('contact', 'Contacto',                  'Contact',          '<p>Contacta-nos via email: contacto@carsaiplay.mz</p>', '<p>Contact us at: contacto@carsaiplay.mz</p>')
ON CONFLICT DO NOTHING;

-- Seed categories
INSERT INTO categories (slug, name_pt, name_en) VALUES
  ('acao',       'Acção',       'Action'),
  ('aventura',   'Aventura',    'Adventure'),
  ('comedia',    'Comédia',     'Comedy'),
  ('drama',      'Drama',       'Drama'),
  ('terror',     'Terror',      'Horror'),
  ('romance',    'Romance',     'Romance'),
  ('sci-fi',     'Ficção Científica', 'Sci-Fi'),
  ('anime',      'Anime',       'Anime'),
  ('familia',    'Família',     'Family'),
  ('crime',      'Crime',       'Crime'),
  ('fantasia',   'Fantasia',    'Fantasy'),
  ('misterio',   'Mistério',    'Mystery')
ON CONFLICT DO NOTHING;

-- Seed achievements
INSERT INTO achievements (name_pt, name_en, description_pt, description_en, badge_icon, points, condition_type, condition_value) VALUES
  ('Primeiro Passo',     'First Step',       'Assististe ao teu primeiro conteúdo', 'Watched your first content', 'play',     10, 'watched_count', 1),
  ('Maratonista',        'Binge Watcher',    'Assististe 10 conteúdos',            'Watched 10 contents',        'fire',     50, 'watched_count', 10),
  ('Cinéfilo',           'Film Buff',        'Assististe 50 conteúdos',            'Watched 50 contents',        'film',    100, 'watched_count', 50),
  ('Crítico',            'Critic',           'Avaliaste 5 conteúdos',              'Rated 5 contents',           'star',     20, 'rating_count',  5),
  ('Coleccionador',      'Collector',        'Tens 20 favoritos',                   'Have 20 favorites',          'heart',    30, 'favorite_count',20),
  ('Fiel Seguidor',      'Loyal Follower',   'Segues 5 séries',                    'Following 5 series',         'rss',      25, 'follow_count',  5)
ON CONFLICT DO NOTHING;
