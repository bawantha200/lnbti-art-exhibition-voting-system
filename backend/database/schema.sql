-- LNBTI Japanese Club Art Competition database
-- Run this schema against Neon PostgreSQL before starting the backend.

CREATE TABLE IF NOT EXISTS voters (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email) AND email LIKE '%@edu.lnbti.lk'),
  has_voted BOOLEAN NOT NULL DEFAULT FALSE,
  voted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  email TEXT PRIMARY KEY REFERENCES voters(email) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artworks (
  id BIGSERIAL PRIMARY KEY,
  art_code TEXT NOT NULL UNIQUE,
  title TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id BIGSERIAL PRIMARY KEY,
  voter_email TEXT NOT NULL REFERENCES voters(email),
  artwork_id BIGINT NOT NULL REFERENCES artworks(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (voter_email, artwork_id)
);

CREATE TABLE IF NOT EXISTS voting_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO voting_settings (id, is_open) VALUES (1, FALSE) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS votes_artwork_id_idx ON votes (artwork_id);
CREATE INDEX IF NOT EXISTS votes_voter_email_idx ON votes (voter_email);
CREATE INDEX IF NOT EXISTS artworks_active_idx ON artworks (is_active);
