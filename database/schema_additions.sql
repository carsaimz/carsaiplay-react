-- Adições ao schema principal para funcionalidades avançadas
-- Executar APÓS schema.sql

-- Comentários
CREATE TABLE IF NOT EXISTS comments (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE SET NULL,
  content_id   INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  parent_id    INT REFERENCES comments(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  approved     SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON comments(content_id, parent_id, approved);

-- Comment likes/dislikes
CREATE TABLE IF NOT EXISTS comment_likes (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id  INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  type        VARCHAR(10) NOT NULL DEFAULT 'like',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Reports (problemas/links partidos)
CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE SET NULL,
  content_id  INT REFERENCES contents(id) ON DELETE CASCADE,
  episode_id  INT REFERENCES episodes(id) ON DELETE CASCADE,
  reason      VARCHAR(80),
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reminders (lembretes de episódios)
CREATE TABLE IF NOT EXISTS reminders (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id   INT REFERENCES contents(id) ON DELETE CASCADE,
  episode_id   INT REFERENCES episodes(id) ON DELETE CASCADE,
  remind_at    TIMESTAMPTZ NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles (múltiplos perfis)
CREATE TABLE IF NOT EXISTS user_profiles (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_name  VARCHAR(80) NOT NULL,
  avatar_icon   VARCHAR(50) NOT NULL DEFAULT 'user',
  pin_hash      VARCHAR(255),
  age_limit     SMALLINT NOT NULL DEFAULT 18,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON user_profiles(user_id);

-- Active profile on token
ALTER TABLE user_tokens ADD COLUMN IF NOT EXISTS active_profile_id INT REFERENCES user_profiles(id) ON DELETE SET NULL;

-- FCM tokens (push notifications)
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    VARCHAR(20) NOT NULL DEFAULT 'web',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Shared lists
CREATE TABLE IF NOT EXISTS shared_lists (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(64) NOT NULL UNIQUE,
  type        VARCHAR(20) NOT NULL DEFAULT 'favorites',
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS shared_list_items (
  list_id    INT NOT NULL REFERENCES shared_lists(id) ON DELETE CASCADE,
  content_id INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  PRIMARY KEY (list_id, content_id)
);

-- Ad zones config
CREATE TABLE IF NOT EXISTS ad_zones (
  id          SERIAL PRIMARY KEY,
  zone_key    VARCHAR(80) NOT NULL UNIQUE,
  config      JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ad stats (impressions/clicks)
CREATE TABLE IF NOT EXISTS ad_stats (
  id          SERIAL PRIMARY KEY,
  zone        VARCHAR(80) NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks      BIGINT NOT NULL DEFAULT 0,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(zone, date)
);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
  id          SERIAL PRIMARY KEY,
  level       VARCHAR(10) NOT NULL DEFAULT 'INFO',
  message     TEXT NOT NULL,
  context     JSONB,
  date        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON system_logs(level, created_at DESC);

-- FAQ
CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  question_pt VARCHAR(500) NOT NULL,
  question_en VARCHAR(500),
  answer_pt   TEXT NOT NULL,
  answer_en   TEXT,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email queue
CREATE TABLE IF NOT EXISTS email_queue (
  id          SERIAL PRIMARY KEY,
  to_email    VARCHAR(255) NOT NULL,
  to_name     VARCHAR(120),
  subject     VARCHAR(500) NOT NULL,
  body_html   TEXT,
  sent_at     TIMESTAMPTZ,
  last_error  TEXT,
  attempts    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON email_queue(sent_at, attempts);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id           SERIAL PRIMARY KEY,
  template_key VARCHAR(80) NOT NULL UNIQUE,
  subject_pt   VARCHAR(500),
  subject_en   VARCHAR(500),
  body_pt      TEXT,
  body_en      TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes on requests (community voting)
ALTER TABLE content_requests ADD COLUMN IF NOT EXISTS votes INT NOT NULL DEFAULT 0;
ALTER TABLE content_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE content_requests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Pages: add DMCA
INSERT INTO pages (slug, title_pt, title_en, content_pt, content_en) VALUES
  ('dmca', 'DMCA', 'DMCA', '<p>Para remover conteúdo, contacte dmca@carsaiplay.mz</p>', '<p>To remove content, contact dmca@carsaiplay.mz</p>')
ON CONFLICT DO NOTHING;

-- Default primary profile for existing users
INSERT INTO user_profiles (user_id, profile_name, avatar_icon, is_primary, created_at)
SELECT id, name, 'user', TRUE, NOW() FROM users WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE is_primary=TRUE)
ON CONFLICT DO NOTHING;

-- Seed FAQs
INSERT INTO faqs (question_pt, question_en, answer_pt, answer_en, sort_order) VALUES
  ('O CarsaiPlay é gratuito?', 'Is CarsaiPlay free?', 'Sim, completamente gratuito e sem anúncios intrusivos.', 'Yes, completely free and without intrusive ads.', 1),
  ('Preciso de conta para assistir?', 'Do I need an account to watch?', 'Não, mas com conta podes guardar favoritos, fazer pedidos e muito mais.', 'No, but with an account you can save favorites, make requests and much more.', 2),
  ('Como pedir um conteúdo?', 'How do I request content?', 'Na secção "Pedidos" da tua área de utilizador.', 'In the "Requests" section of your user area.', 3),
  ('Como reportar um problema?', 'How do I report a problem?', 'Na página de cada conteúdo existe um botão "Reportar problema".', 'On each content page there is a "Report problem" button.', 4),
  ('Posso instalar como app?', 'Can I install as an app?', 'Sim! Disponível na Play Store e como PWA.', 'Yes! Available on Play Store and as a PWA.', 5)
ON CONFLICT DO NOTHING;

-- Seed email templates
INSERT INTO email_templates (template_key, subject_pt, subject_en, body_pt, body_en) VALUES
  ('welcome',       'Bem-vindo ao CarsaiPlay!',   'Welcome to CarsaiPlay!',     '<h1>Bem-vindo!</h1><p>A tua conta foi criada com sucesso.</p>', '<h1>Welcome!</h1><p>Your account was created successfully.</p>'),
  ('reset_password','Redefinir palavra-passe',     'Reset your password',        '<p>Clica no link para redefinir: {{link}}</p>',               '<p>Click the link to reset: {{link}}</p>'),
  ('new_episode',   'Novo episódio disponível',    'New episode available',      '<p>{{content}} · Episódio {{episode}} disponível!</p>',       '<p>{{content}} · Episode {{episode}} available!</p>')
ON CONFLICT DO NOTHING;
