CREATE TABLE IF NOT EXISTS daily_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NULL,
  guest_key TEXT NULL,
  usage_date TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date
  ON daily_usage(user_id, usage_date);

CREATE INDEX IF NOT EXISTS idx_daily_usage_guest_date
  ON daily_usage(guest_key, usage_date);
