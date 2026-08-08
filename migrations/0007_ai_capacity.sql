-- Aggregate global AI request counters. No user, session, IP, prompt, or
-- response data is stored here.
CREATE TABLE IF NOT EXISTS ai_capacity (
  bucket TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
