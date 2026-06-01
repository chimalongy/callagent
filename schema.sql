-- Run this in the Neon SQL editor (console.neon.tech > your project > SQL Editor)
-- or via: psql $DATABASE_URL -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL UNIQUE,
  password_hash   TEXT        NOT NULL,
  default_voice   TEXT        NOT NULL DEFAULT 'female' CHECK (default_voice IN ('male', 'female')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Calls ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calls (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Identity
  caller_name       TEXT        NOT NULL,
  recipient_name    TEXT,
  recipient_phone   TEXT        NOT NULL,
  voice_gender      TEXT        NOT NULL CHECK (voice_gender IN ('male', 'female')),
  instructions      TEXT        NOT NULL,

  -- Vapi tracking
  vapi_call_id      TEXT        UNIQUE,

  -- Status
  status            TEXT        NOT NULL DEFAULT 'queued'
                                CHECK (status IN ('queued', 'in-progress', 'completed', 'failed')),

  -- Outcome (populated by webhook)
  duration_seconds  INTEGER,
  transcript        TEXT,
  summary           TEXT,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ  -- soft delete
);

CREATE INDEX IF NOT EXISTS calls_user_id_idx       ON calls (user_id);
CREATE INDEX IF NOT EXISTS calls_vapi_call_id_idx  ON calls (vapi_call_id);
CREATE INDEX IF NOT EXISTS calls_status_idx        ON calls (status);
CREATE INDEX IF NOT EXISTS calls_created_at_idx    ON calls (created_at DESC);